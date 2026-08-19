import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, AdminProduct, CategoryItem } from './db';
import {
  Order,
  CartItem,
  CurryOption,
  ProductCurryConfig,
  SelectedCurrySnapshot,
  OptionGroup,
  OptionGroupTemplate,
  PaymentSettings,
  SelectedOptionItem,
  AppModule,
} from '../types';

export const apiRouter = Router();

// Session validity: 12 hours
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000;

// Helper to generate secure random session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication Middleware for /api/admin/*
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_session || req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!token || typeof token !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required',
    });
  }

  const database = db.getDb();
  const session = database.sessions[token];

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
  }

  if (Date.now() > session.expiresAt) {
    delete database.sessions[token];
    db.save();
    return res.status(401).json({
      success: false,
      error: 'Session expired. Please log in again.',
    });
  }

  // Extend session slightly on activity
  session.expiresAt = Date.now() + SESSION_LIFETIME_MS;
  (req as any).adminUser = session.username;
  (req as any).adminSessionToken = token;
  next();
}

/* ==========================================================================
   ADMIN AUTHENTICATION ENDPOINTS
   ========================================================================== */

// POST /api/admin/login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required',
    });
  }

  const database = db.getDb();
  const admin = database.admins.find(
    (a) => a.username.toLowerCase() === String(username).trim().toLowerCase()
  );

  if (!admin) {
    db.addAuditLog('FAILED_LOGIN_ATTEMPT', `Failed login for username: ${username}`, 'Anonymous', req.ip);
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password',
    });
  }

  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    db.addAuditLog('FAILED_LOGIN_ATTEMPT', `Invalid password for username: ${username}`, 'Anonymous', req.ip);
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password',
    });
  }

  // Session generation
  const sessionToken = generateSessionToken();
  database.sessions[sessionToken] = {
    username: admin.username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_LIFETIME_MS,
  };
  db.save();

  db.addAuditLog('ADMIN_LOGIN', `Admin user ${admin.username} successfully logged in`, admin.username, req.ip);

  // Set HTTP-Only secure cookie
  res.cookie('admin_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_LIFETIME_MS,
    secure: process.env.NODE_ENV === 'production',
  });

  return res.json({
    success: true,
    token: sessionToken,
    admin: {
      username: admin.username,
      name: admin.name,
      role: admin.role,
    },
  });
});

// POST /api/admin/logout
apiRouter.post('/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  const token = (req as any).adminSessionToken;
  const username = (req as any).adminUser;
  const database = db.getDb();

  if (token && database.sessions[token]) {
    delete database.sessions[token];
    db.save();
  }

  db.addAuditLog('ADMIN_LOGOUT', `Admin user ${username} logged out`, username, req.ip);
  res.clearCookie('admin_session');

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// GET /api/admin/me
apiRouter.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  const username = (req as any).adminUser;
  const database = db.getDb();
  const admin = database.admins.find((a) => a.username === username);

  return res.json({
    success: true,
    admin: {
      username: admin?.username || username,
      name: admin?.name || 'Administrator',
      role: admin?.role || 'Admin',
    },
  });
});

/* ==========================================================================
   ADMIN DASHBOARD & STATS
   ========================================================================== */

// GET /api/admin/dashboard
apiRouter.get('/admin/dashboard', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();

  const totalProducts = database.products.length;
  const totalCategories = database.categories.length;
  const totalOrders = database.orders.length;
  const totalCustomers = database.customers.length;

  const pendingOrders = database.orders.filter(
    (o) => o.status === 'Pending' || o.status === 'In Transit' || o.status === 'Preparing' || o.status === 'Confirmed' || o.status === 'Out for Delivery'
  ).length;
  const completedOrders = database.orders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrders = database.orders.filter((o) => o.status === 'Cancelled').length;

  const totalRevenue = database.orders
    .filter((o) => o.status !== 'Cancelled' && o.paymentStatus !== 'Payment Failed / Rejected')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Today's orders
  const todayOrders = database.orders.filter((o) => o.date.toLowerCase().includes('today')).length || 1;
  const todayRevenue = database.orders
    .filter((o) => o.date.toLowerCase().includes('today') && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0) || 18.19;

  // Payment Breakdown
  const upiOrders = database.orders.filter((o) => o.paymentMethod === 'upi');
  const upiOrdersCount = upiOrders.length;
  const upiRevenue = upiOrders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const cardOrders = database.orders.filter((o) => o.paymentMethod === 'card' || o.paymentMethod === 'mastercard' || o.paymentMethod === 'visa');
  const cardOrdersCount = cardOrders.length;
  const cardRevenue = cardOrders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const codOrders = database.orders.filter((o) => o.paymentMethod === 'cod');
  const codOrdersCount = codOrders.length;
  const codRevenue = codOrders
    .filter((o) => o.status === 'Delivered' || o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingVerificationCount = database.orders.filter(
    (o) => o.paymentStatus === 'Pending Verification'
  ).length;

  const paymentFailuresCount = database.orders.filter(
    (o) => o.paymentStatus === 'Payment Failed / Rejected'
  ).length;

  // Best selling products
  const productCountMap: { [name: string]: { name: string; count: number; revenue: number; image: string } } = {};
  database.orders.forEach((ord) => {
    ord.items.forEach((it) => {
      if (!productCountMap[it.name]) {
        productCountMap[it.name] = { name: it.name, count: 0, revenue: 0, image: it.image };
      }
      productCountMap[it.name].count += it.portion || 1;
      productCountMap[it.name].revenue += it.totalPrice || 0;
    });
  });

  const bestSellers = Object.values(productCountMap).sort((a, b) => b.count - a.count);

  return res.json({
    success: true,
    stats: {
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayOrders,
      todayRevenue: Number(todayRevenue.toFixed(2)),
      upiOrdersCount,
      upiRevenue: Number(upiRevenue.toFixed(2)),
      cardOrdersCount,
      cardRevenue: Number(cardRevenue.toFixed(2)),
      codOrdersCount,
      codRevenue: Number(codRevenue.toFixed(2)),
      pendingVerificationCount,
      paymentFailuresCount,
    },
    recentOrders: database.orders.slice(0, 5),
    bestSellers: bestSellers.slice(0, 4),
    recentCustomers: database.customers.slice(0, 5),
    recentLogs: database.auditLogs.slice(0, 6),
  });
});

/* ==========================================================================
   PRODUCTS & DYNAMIC OPTION GROUPS (PUBLIC & PROTECTED ADMIN)
   ========================================================================== */

// GET /api/products (Public customer endpoint)
apiRouter.get('/products', (_req: Request, res: Response) => {
  const database = db.getDb();
  // Return all active products whose category is active and module is active
  const activeModuleIds = new Set(
    (database.modules || []).filter((m) => m.active !== false).map((m) => m.id)
  );
  const activeCategoryNames = new Set(
    (database.categories || []).filter((c) => c.active !== false && activeModuleIds.has(c.moduleId || 'food')).map((c) => c.name)
  );

  const availableProducts = database.products.filter((p) => {
    if (p.available === false) return false;
    const modId = p.moduleId || 'food';
    if (!activeModuleIds.has(modId)) return false;
    if (p.category && !activeCategoryNames.has(p.category)) return false;
    return true;
  });

  return res.json({
    success: true,
    products: availableProducts,
  });
});

// GET /api/admin/products (Protected admin endpoint)
apiRouter.get('/admin/products', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    products: database.products,
  });
});

// POST /api/admin/products (Add product with full option groups & curry config)
apiRouter.post('/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  const {
    name,
    subtitle,
    category,
    price,
    rating,
    prepTime,
    description,
    image,
    defaultSpice,
    defaultPortion,
    available,
    featured,
    popular,
    moduleId,
    curryConfig,
    optionGroups,
    customizationSections,
    customOrderEnabled,
    customOrderSortOrder,
  } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({
      success: false,
      error: 'Product name and price are required',
    });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({
      success: false,
      error: 'Price must be a valid non-negative number',
    });
  }

  const database = db.getDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `${slug}-${Date.now().toString(36)}`;

  const newProduct: AdminProduct = {
    id,
    name: String(name).trim(),
    subtitle: subtitle ? String(subtitle).trim() : 'Chef Special',
    category: category || 'Biriyani',
    moduleId: moduleId ? String(moduleId).trim() : 'food',
    price: Number(parsedPrice.toFixed(2)),
    rating: Number(rating) || 4.8,
    prepTime: prepTime || '20 mins',
    description: description || 'Freshly prepared with premium ingredients cooked to perfection.',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    defaultSpice: Number(defaultSpice) || 50,
    defaultPortion: Number(defaultPortion) || 1,
    available: available !== undefined ? Boolean(available) : true,
    featured: Boolean(featured),
    popular: Boolean(popular),
    customOrderEnabled: customOrderEnabled !== undefined ? Boolean(customOrderEnabled) : true,
    customOrderSortOrder: Number(customOrderSortOrder) || (database.products.length + 1),
    reviewCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    curryConfig: curryConfig !== undefined ? curryConfig : undefined,
    optionGroups: Array.isArray(optionGroups) ? optionGroups : [],
    customizationSections: Array.isArray(customizationSections) ? customizationSections : [],
  };

  database.products.unshift(newProduct);
  db.save();

  db.addAuditLog('ADD_PRODUCT', `Added new product: "${newProduct.name}" ($${newProduct.price}) with ${newProduct.customizationSections?.length || 0} customization section(s)`, (req as any).adminUser, req.ip);

  return res.status(201).json({
    success: true,
    product: newProduct,
    message: 'Product created successfully',
  });
});

// PUT /api/admin/products/:id (Edit product & option groups / customization sections / curryConfig)
apiRouter.put('/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  const index = database.products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
    });
  }

  const existing = database.products[index];
  const body = req.body;

  const updatedProduct: AdminProduct = {
    ...existing,
    name: body.name !== undefined ? String(body.name).trim() : existing.name,
    subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : existing.subtitle,
    category: body.category !== undefined ? body.category : existing.category,
    moduleId: body.moduleId !== undefined ? body.moduleId : (existing.moduleId || 'food'),
    price: body.price !== undefined ? Number(parseFloat(body.price).toFixed(2)) : existing.price,
    rating: body.rating !== undefined ? Number(body.rating) : existing.rating,
    prepTime: body.prepTime !== undefined ? body.prepTime : existing.prepTime,
    description: body.description !== undefined ? body.description : existing.description,
    image: body.image !== undefined ? body.image : existing.image,
    defaultSpice: body.defaultSpice !== undefined ? Number(body.defaultSpice) : existing.defaultSpice,
    defaultPortion: body.defaultPortion !== undefined ? Number(body.defaultPortion) : existing.defaultPortion,
    available: body.available !== undefined ? Boolean(body.available) : existing.available,
    featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
    popular: body.popular !== undefined ? Boolean(body.popular) : existing.popular,
    customOrderEnabled: body.customOrderEnabled !== undefined ? Boolean(body.customOrderEnabled) : existing.customOrderEnabled,
    customOrderSortOrder: body.customOrderSortOrder !== undefined ? Number(body.customOrderSortOrder) : existing.customOrderSortOrder,
    curryConfig: body.curryConfig !== undefined ? body.curryConfig : existing.curryConfig,
    optionGroups: body.optionGroups !== undefined ? body.optionGroups : existing.optionGroups,
    customizationSections: body.customizationSections !== undefined ? body.customizationSections : existing.customizationSections,
    updatedAt: new Date().toISOString(),
  };

  database.products[index] = updatedProduct;
  db.save();

  db.addAuditLog('EDIT_PRODUCT', `Updated product: "${updatedProduct.name}" (ID: ${id})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    product: updatedProduct,
    message: 'Product updated successfully',
  });
});

// GET /api/custom-order/products (Public endpoint returning items configured for Custom Order)
apiRouter.get('/custom-order/products', (_req: Request, res: Response) => {
  const database = db.getDb();
  const customProducts = database.products
    .filter((p) => p.available !== false && (p.customOrderEnabled !== false || (p.customizationSections && p.customizationSections.length > 0)))
    .sort((a, b) => (a.customOrderSortOrder || 99) - (b.customOrderSortOrder || 99));

  return res.json({
    success: true,
    products: customProducts,
  });
});

// PUT /api/admin/products/:id/customization-sections (Admin specifically manages sections and curryConfig for a product)
apiRouter.put('/admin/products/:id/customization-sections', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { customizationSections, customOrderEnabled, customOrderSortOrder, curryConfig } = req.body;
  const database = db.getDb();
  const product = database.products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (customizationSections !== undefined) {
    product.customizationSections = customizationSections;
  }
  if (customOrderEnabled !== undefined) {
    product.customOrderEnabled = Boolean(customOrderEnabled);
  }
  if (customOrderSortOrder !== undefined) {
    product.customOrderSortOrder = Number(customOrderSortOrder);
  }
  if (curryConfig !== undefined) {
    product.curryConfig = curryConfig;
  }

  product.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog('UPDATE_CUSTOMIZATION_SECTIONS', `Updated Custom Order & Curry config for "${product.name}"`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    product,
    message: 'Customization sections & curry config updated successfully',
  });
});

// PUT /api/admin/custom-order/bulk-reorder (Admin updates ordering of custom order products)
apiRouter.put('/admin/custom-order/bulk-reorder', requireAdminAuth, (req: Request, res: Response) => {
  const { items } = req.body; // Array of { id: string, customOrderSortOrder: number, customOrderEnabled: boolean }
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Items array is required' });
  }

  const database = db.getDb();
  items.forEach((item) => {
    const prod = database.products.find((p) => p.id === item.id);
    if (prod) {
      if (item.customOrderSortOrder !== undefined) prod.customOrderSortOrder = Number(item.customOrderSortOrder);
      if (item.customOrderEnabled !== undefined) prod.customOrderEnabled = Boolean(item.customOrderEnabled);
      prod.updatedAt = new Date().toISOString();
    }
  });

  db.save();
  db.addAuditLog('REORDER_CUSTOM_ORDER_PRODUCTS', `Updated custom order sorting for ${items.length} products`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    message: 'Custom order products reordered successfully',
  });
});

// PATCH /api/admin/products/:id/toggle
apiRouter.patch('/admin/products/:id/toggle', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { field } = req.body; // 'available' | 'featured' | 'popular'

  const database = db.getDb();
  const product = database.products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (field === 'available') {
    product.available = !product.available;
  } else if (field === 'featured') {
    product.featured = !product.featured;
  } else if (field === 'popular') {
    product.popular = !product.popular;
  } else {
    return res.status(400).json({ success: false, error: 'Invalid toggle field' });
  }

  product.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog('TOGGLE_PRODUCT_STATUS', `Toggled ${field} for product "${product.name}" to ${product[field as keyof AdminProduct]}`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    product,
  });
});

// DELETE /api/admin/products/:id
apiRouter.delete('/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  const index = database.products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const [removed] = database.products.splice(index, 1);
  db.save();

  db.addAuditLog('DELETE_PRODUCT', `Deleted product: "${removed.name}" (ID: ${id})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    message: `Product "${removed.name}" deleted successfully`,
  });
});

/* ==========================================================================
   OPTION GROUP TEMPLATES (ADMIN)
   ========================================================================== */

// GET /api/admin/option-templates
apiRouter.get('/admin/option-templates', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    templates: database.optionTemplates || [],
  });
});

// POST /api/admin/option-templates
apiRouter.post('/admin/option-templates', requireAdminAuth, (req: Request, res: Response) => {
  const { name, group } = req.body;
  if (!name || !group || !group.name) {
    return res.status(400).json({ success: false, error: 'Template name and option group are required' });
  }

  const database = db.getDb();
  if (!database.optionTemplates) database.optionTemplates = [];

  const newTemplate: OptionGroupTemplate = {
    id: 'tpl-' + Date.now(),
    name: String(name).trim(),
    group: {
      ...group,
      id: group.id || 'grp-' + Date.now(),
      options: Array.isArray(group.options) ? group.options : [],
    },
  };

  database.optionTemplates.push(newTemplate);
  db.save();

  db.addAuditLog('ADD_OPTION_TEMPLATE', `Saved reusable option template "${newTemplate.name}"`, (req as any).adminUser, req.ip);

  return res.status(201).json({
    success: true,
    template: newTemplate,
    message: 'Option group template created successfully',
  });
});

// PUT /api/admin/option-templates/:id
apiRouter.put('/admin/option-templates/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, group } = req.body;
  const database = db.getDb();

  const index = database.optionTemplates.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }

  database.optionTemplates[index] = {
    ...database.optionTemplates[index],
    name: name !== undefined ? String(name).trim() : database.optionTemplates[index].name,
    group: group !== undefined ? group : database.optionTemplates[index].group,
  };

  db.save();
  return res.json({
    success: true,
    template: database.optionTemplates[index],
  });
});

// DELETE /api/admin/option-templates/:id
apiRouter.delete('/admin/option-templates/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  const index = database.optionTemplates.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }

  const [removed] = database.optionTemplates.splice(index, 1);
  db.save();

  db.addAuditLog('DELETE_OPTION_TEMPLATE', `Deleted template: "${removed.name}"`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    message: `Template "${removed.name}" deleted successfully`,
  });
});

/* ==========================================================================
   CURRIES & SALNA LEVEL SYSTEM (PUBLIC & PROTECTED ADMIN)
   ========================================================================== */

// GET /api/curries (Public customer endpoint - active curries only)
apiRouter.get('/curries', (_req: Request, res: Response) => {
  const database = db.getDb();
  const activeCurries = (database.curries || [])
    .filter((c) => c.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return res.json({
    success: true,
    curries: activeCurries,
  });
});

// GET /api/admin/curries (Admin endpoint - all curries)
apiRouter.get('/admin/curries', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  const allCurries = (database.curries || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  return res.json({
    success: true,
    curries: allCurries,
  });
});

// POST /api/admin/curries (Admin add new curry option)
apiRouter.post('/admin/curries', requireAdminAuth, (req: Request, res: Response) => {
  const { name, pricePerUnit, unitLabel, active, isCurryLevelOption, order, image, description } = req.body;

  if (!name || pricePerUnit === undefined || pricePerUnit === null) {
    return res.status(400).json({ success: false, error: 'Curry name and price per unit are required' });
  }

  const parsedPrice = parseFloat(pricePerUnit);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ success: false, error: 'Price must be a valid non-negative number' });
  }

  const database = db.getDb();
  if (!Array.isArray(database.curries)) {
    database.curries = [];
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `curry-${slug}-${Date.now().toString(36)}`;

  const newCurry: CurryOption = {
    id,
    name: String(name).trim(),
    pricePerUnit: Number(parsedPrice.toFixed(2)),
    unitLabel: unitLabel ? String(unitLabel).trim() : 'Spoon',
    active: active !== undefined ? Boolean(active) : true,
    isCurryLevelOption: isCurryLevelOption !== undefined ? Boolean(isCurryLevelOption) : true,
    order: typeof order === 'number' ? order : database.curries.length + 1,
    image: image ? String(image).trim() : undefined,
    description: description ? String(description).trim() : undefined,
  };

  database.curries.push(newCurry);
  db.save();

  db.addAuditLog('ADD_CURRY', `Added curry: "${newCurry.name}" (₹${newCurry.pricePerUnit}/${newCurry.unitLabel})`, (req as any).adminUser, req.ip);

  return res.status(201).json({
    success: true,
    curry: newCurry,
    curries: database.curries,
    message: 'Curry option created successfully',
  });
});

// PUT /api/admin/curries/:id (Admin update curry option)
apiRouter.put('/admin/curries/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  if (!Array.isArray(database.curries)) {
    database.curries = [];
  }

  const index = database.curries.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Curry not found' });
  }

  const current = database.curries[index];
  const { name, pricePerUnit, unitLabel, active, isCurryLevelOption, order, image, description } = req.body;

  let updatedPrice = current.pricePerUnit;
  if (pricePerUnit !== undefined) {
    const parsed = parseFloat(pricePerUnit);
    if (!isNaN(parsed) && parsed >= 0) {
      updatedPrice = Number(parsed.toFixed(2));
    }
  }

  const updatedCurry: CurryOption = {
    ...current,
    name: name !== undefined ? String(name).trim() : current.name,
    pricePerUnit: updatedPrice,
    unitLabel: unitLabel !== undefined ? String(unitLabel).trim() : current.unitLabel,
    active: active !== undefined ? Boolean(active) : current.active,
    isCurryLevelOption: isCurryLevelOption !== undefined ? Boolean(isCurryLevelOption) : current.isCurryLevelOption,
    order: order !== undefined ? Number(order) : current.order,
    image: image !== undefined ? String(image).trim() : current.image,
    description: description !== undefined ? String(description).trim() : current.description,
  };

  database.curries[index] = updatedCurry;
  db.save();

  db.addAuditLog('EDIT_CURRY', `Updated curry: "${updatedCurry.name}" (₹${updatedCurry.pricePerUnit})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    curry: updatedCurry,
    curries: database.curries,
    message: 'Curry option updated successfully',
  });
});

// PATCH /api/admin/curries/:id/toggle (Admin toggle curry availability / stock)
apiRouter.patch('/admin/curries/:id/toggle', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  if (!Array.isArray(database.curries)) {
    database.curries = [];
  }

  const curry = database.curries.find((c) => c.id === id);
  if (!curry) {
    return res.status(404).json({ success: false, error: 'Curry not found' });
  }

  curry.active = !curry.active;
  db.save();

  db.addAuditLog(
    'TOGGLE_CURRY',
    `Toggled curry "${curry.name}" ${curry.active ? 'ACTIVE (In Stock)' : 'INACTIVE (Out of Stock)'}`,
    (req as any).adminUser,
    req.ip
  );

  return res.json({
    success: true,
    curry,
    curries: database.curries,
    message: `Curry "${curry.name}" marked as ${curry.active ? 'Active' : 'Out of Stock'}`,
  });
});

// DELETE /api/admin/curries/:id (Admin delete curry option)
apiRouter.delete('/admin/curries/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  if (!Array.isArray(database.curries)) {
    database.curries = [];
  }

  const index = database.curries.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Curry not found' });
  }

  const [removed] = database.curries.splice(index, 1);
  db.save();

  db.addAuditLog('DELETE_CURRY', `Deleted curry: "${removed.name}" (${id})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    curries: database.curries,
    message: `Curry "${removed.name}" deleted successfully`,
  });
});

/* ==========================================================================
   CATEGORIES (PUBLIC & PROTECTED ADMIN)
   ========================================================================== */

// GET /api/categories
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const database = db.getDb();
  const activeModuleIds = new Set(
    (database.modules || []).filter((m) => m.active !== false).map((m) => m.id)
  );
  const activeCategories = (database.categories || [])
    .filter((c) => c.active !== false && activeModuleIds.has(c.moduleId || 'food'))
    .sort((a, b) => a.order - b.order);

  return res.json({
    success: true,
    categories: activeCategories,
  });
});

// GET /api/admin/categories
apiRouter.get('/admin/categories', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    categories: database.categories.sort((a, b) => a.order - b.order),
  });
});

// POST /api/admin/categories
apiRouter.post('/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  const { name, icon } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Category name is required' });
  }

  const database = db.getDb();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (database.categories.some((c) => c.id === id)) {
    return res.status(400).json({ success: false, error: 'Category with this name already exists' });
  }

  const newCat: CategoryItem = {
    id,
    name: String(name).trim(),
    icon: icon || '',
    order: database.categories.length + 1,
    active: true,
  };

  database.categories.push(newCat);
  db.save();

  db.addAuditLog('ADD_CATEGORY', `Created category: "${newCat.name}"`, (req as any).adminUser, req.ip);

  return res.status(201).json({ success: true, category: newCat });
});

// PUT /api/admin/categories/:id
apiRouter.put('/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, active, order } = req.body;

  const database = db.getDb();
  const category = database.categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  if (name !== undefined) category.name = String(name).trim();
  if (active !== undefined) category.active = Boolean(active);
  if (order !== undefined) category.order = Number(order);

  db.save();
  db.addAuditLog('EDIT_CATEGORY', `Updated category: "${category.name}"`, (req as any).adminUser, req.ip);

  return res.json({ success: true, category });
});

// DELETE /api/admin/categories/:id
apiRouter.delete('/api/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  const index = database.categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  const [removed] = database.categories.splice(index, 1);
  db.save();

  db.addAuditLog('DELETE_CATEGORY', `Deleted category: "${removed.name}"`, (req as any).adminUser, req.ip);
  return res.json({ success: true, message: `Category "${removed.name}" deleted` });
});

/* ==========================================================================
   ORDERS & SERVER-SIDE PRICE CALCULATION
   ========================================================================== */

// GET /api/orders (Public / Customer order history)
apiRouter.get('/orders', (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    orders: database.orders,
  });
});

// POST /api/orders (Customer creates order with server-side price validation & payment engine)
apiRouter.post('/orders', (req: Request, res: Response) => {
  const { items, paymentMethod, customer, upiTransactionNote, deliveryType, deliverySlot, deliveryFees: reqDeliveryFees } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Order must contain items' });
  }

  const database = db.getDb();
  const storeSettings = database.settings;
  const paymentSettings = storeSettings.paymentSettings;
  const deliverySettings = storeSettings.deliverySettings;

  // Validate payment method
  const validMethods = ['upi', 'card', 'cod', 'mastercard', 'visa'];
  const method = (paymentMethod || 'card').toLowerCase();
  if (!validMethods.includes(method)) {
    return res.status(400).json({ success: false, error: 'Invalid payment method selected' });
  }

  // Check if chosen payment method is enabled in store settings
  if (method === 'upi' && !paymentSettings.upi.enabled) {
    return res.status(400).json({ success: false, error: 'UPI payment method is currently disabled by store' });
  }
  if ((method === 'card' || method === 'mastercard' || method === 'visa') && !paymentSettings.card.enabled) {
    return res.status(400).json({ success: false, error: 'Online Card payments are currently disabled by store' });
  }
  if (method === 'cod' && !paymentSettings.cod.enabled) {
    return res.status(400).json({ success: false, error: 'Cash on Delivery is currently disabled by store' });
  }

  // Server-side Price Calculation & Order Item Snapshotting
  let calculatedSubtotal = 0;
  const processedItems: CartItem[] = [];

  for (const rawItem of items) {
    const product = database.products.find((p) => p.id === rawItem.productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        error: `Product with ID ${rawItem.productId} not found in store catalog`,
      });
    }

    const portion = Math.max(1, parseInt(rawItem.portion, 10) || 1);
    let itemUnitPrice = product.price; // default base price

    // If a primary variant was chosen (e.g. Size/Portion: Half/Full/1KG)
    let selectedVariantSnapshot: SelectedOptionItem | undefined = undefined;
    if (rawItem.selectedVariant) {
      const v = rawItem.selectedVariant;
      // Search option in product's option groups
      let foundOption = null;
      let foundGroup = null;
      if (product.optionGroups) {
        for (const grp of product.optionGroups) {
          const opt = grp.options.find((o) => o.id === v.optionId);
          if (opt) {
            foundOption = opt;
            foundGroup = grp;
            break;
          }
        }
      }

      if (foundOption) {
        if (!foundOption.available) {
          return res.status(400).json({
            success: false,
            error: `Option "${foundOption.name}" for "${product.name}" is currently unavailable`,
          });
        }
        if (foundOption.priceType === 'fixed') {
          itemUnitPrice = foundOption.price;
        } else {
          itemUnitPrice = product.price + foundOption.price;
        }
        selectedVariantSnapshot = {
          groupId: foundGroup?.id || v.groupId,
          groupName: foundGroup?.name || v.groupName,
          optionId: foundOption.id,
          optionName: foundOption.name,
          price: foundOption.price,
          priceType: foundOption.priceType,
        };
      } else {
        // Fallback to provided variant snapshot
        selectedVariantSnapshot = v;
        itemUnitPrice = v.price || itemUnitPrice;
      }
    }

    // Process additional add-ons / options
    const selectedOptionsSnapshot: SelectedOptionItem[] = [];
    if (Array.isArray(rawItem.selectedOptions)) {
      for (const optItem of rawItem.selectedOptions) {
        let foundOpt = null;
        let foundGrp = null;
        if (product.optionGroups) {
          for (const grp of product.optionGroups) {
            const match = grp.options.find((o) => o.id === optItem.optionId);
            if (match) {
              foundOpt = match;
              foundGrp = grp;
              break;
            }
          }
        }

        if (foundOpt) {
          if (!foundOpt.available) {
            return res.status(400).json({
              success: false,
              error: `Add-on "${foundOpt.name}" for "${product.name}" is currently unavailable`,
            });
          }
          if (foundOpt.priceType === 'adjustment') {
            itemUnitPrice += foundOpt.price;
          }
          selectedOptionsSnapshot.push({
            groupId: foundGrp?.id || optItem.groupId,
            groupName: foundGrp?.name || optItem.groupName,
            optionId: foundOpt.id,
            optionName: foundOpt.name,
            price: foundOpt.price,
            priceType: foundOpt.priceType,
          });
        } else {
          // Fallback
          selectedOptionsSnapshot.push(optItem);
          if (optItem.priceType === 'adjustment') {
            itemUnitPrice += optItem.price;
          }
        }
      }
    }

    // Process traditional toppings / sides if any (from customizer)
    let toppingsTotal = 0;
    if (Array.isArray(rawItem.selectedToppings)) {
      rawItem.selectedToppings.forEach((t: any) => {
        const toppingInDb = database.toppings.find((top) => top.id === t.id);
        const topPrice = toppingInDb ? toppingInDb.price : t.price || 0;
        toppingsTotal += topPrice;
      });
    }

    let sidesTotal = 0;
    if (Array.isArray(rawItem.selectedSides)) {
      rawItem.selectedSides.forEach((s: any) => {
        const sideInDb = database.sides.find((sd) => sd.id === s.id);
        const sdPrice = sideInDb ? sideInDb.price : s.price || 0;
        sidesTotal += sdPrice;
      });
    }

    // Process Salna Level / Curry Level Snapshot & Pricing
    let selectedCurrySnapshot: SelectedCurrySnapshot | undefined = undefined;
    let curryTotalForItem = 0;
    if (rawItem.curry && rawItem.curry.enabled) {
      const curryId = rawItem.curry.curryId;
      const curryInDb = (database.curries || []).find((c) => c.id === curryId);
      if (!curryInDb) {
        return res.status(400).json({
          success: false,
          error: `Selected curry option "${rawItem.curry.curryName || curryId}" not found in store`,
        });
      }
      if (curryInDb.active === false) {
        return res.status(400).json({
          success: false,
          error: `Curry option "${curryInDb.name}" is currently out of stock`,
        });
      }
      const rawUnits = parseInt(rawItem.curry.unitsPerProduct, 10);
      const unitsPerProduct = isNaN(rawUnits) ? 1 : Math.max(0, rawUnits);
      if (unitsPerProduct > 0) {
        const totalUnits = unitsPerProduct * portion;
        curryTotalForItem = Number((curryInDb.pricePerUnit * totalUnits).toFixed(2));
        selectedCurrySnapshot = {
          enabled: true,
          curryId: curryInDb.id,
          curryName: curryInDb.name,
          pricePerUnit: curryInDb.pricePerUnit,
          unitLabel: curryInDb.unitLabel || 'Spoon',
          unitsPerProduct,
          totalUnits,
          totalPrice: curryTotalForItem,
        };
      } else {
        selectedCurrySnapshot = {
          enabled: false,
          curryId: curryInDb.id,
          curryName: curryInDb.name,
          pricePerUnit: curryInDb.pricePerUnit,
          unitLabel: curryInDb.unitLabel || 'Spoon',
          unitsPerProduct: 0,
          totalUnits: 0,
          totalPrice: 0,
        };
      }
    }

    itemUnitPrice += toppingsTotal + sidesTotal;
    const itemTotalPrice = Number(((itemUnitPrice * portion) + curryTotalForItem).toFixed(2));
    calculatedSubtotal += itemTotalPrice;

    processedItems.push({
      id: rawItem.id || 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      image: product.image,
      basePrice: product.price,
      portion,
      spiceLevel: rawItem.spiceLevel !== undefined ? Number(rawItem.spiceLevel) : product.defaultSpice,
      selectedVariant: selectedVariantSnapshot,
      selectedOptions: selectedOptionsSnapshot,
      curry: selectedCurrySnapshot,
      selectedToppings: rawItem.selectedToppings || [],
      selectedSides: rawItem.selectedSides || [],
      unitPrice: Number(itemUnitPrice.toFixed(2)),
      totalPrice: itemTotalPrice,
      notes: rawItem.notes,
    });
  }

  // Fees calculation
  calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));
  const taxes = Number(storeSettings.taxRate.toFixed(2));

  // Determine delivery fees based on deliveryType (Scheduled / Free vs Urgent)
  let calculatedDeliveryFees = Number(storeSettings.deliveryFee.toFixed(2));
  let estimatedDelivery = '15 - 30 mins';

  if (deliveryType === 'urgent') {
    calculatedDeliveryFees = deliverySettings?.urgentDelivery?.enabled
      ? Number((deliverySettings.urgentDelivery.fee || 30.0).toFixed(2))
      : 30.0;
    estimatedDelivery = deliverySettings?.urgentDelivery?.label || 'Urgent Delivery (15-25 mins)';
  } else if (deliveryType === 'scheduled' || deliverySlot) {
    const matchedSlot = deliverySettings?.slots?.find((s) => s.timeLabel === deliverySlot);
    calculatedDeliveryFees = matchedSlot ? Number(matchedSlot.fee.toFixed(2)) : 0;
    estimatedDelivery = deliverySlot ? `Scheduled Slot: ${deliverySlot}` : 'Scheduled Slot Delivery';
  } else if (typeof reqDeliveryFees === 'number') {
    calculatedDeliveryFees = Number(reqDeliveryFees.toFixed(2));
  }

  // COD specific fees & limits
  let codCharge = 0;
  if (method === 'cod') {
    if (calculatedSubtotal < paymentSettings.cod.minOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount for Cash on Delivery is ${storeSettings.currency}${paymentSettings.cod.minOrder}`,
      });
    }
    if (paymentSettings.cod.maxOrder > 0 && calculatedSubtotal > paymentSettings.cod.maxOrder) {
      return res.status(400).json({
        success: false,
        error: `Maximum order amount for Cash on Delivery is ${storeSettings.currency}${paymentSettings.cod.maxOrder}`,
      });
    }
    codCharge = Number((paymentSettings.cod.codCharge || 0).toFixed(2));
  }

  const finalTotal = Number((calculatedSubtotal + taxes + calculatedDeliveryFees + codCharge).toFixed(2));

  const orderId = 'order-' + Date.now();
  const orderNumber = '#FG-' + Math.floor(10000 + Math.random() * 90000);

  // Status mapping based on payment method
  let paymentStatus: any = 'Paid';
  let orderStatus: any = 'Confirmed';

  if (method === 'upi') {
    paymentStatus = 'Pending Verification';
    orderStatus = 'Pending';
  } else if (method === 'cod') {
    paymentStatus = 'Cash on Delivery';
    orderStatus = 'Confirmed';
  } else {
    paymentStatus = 'Paid';
    orderStatus = 'Preparing';
  }

  const customerName = customer?.name || 'Sophia Patel';
  const customerEmail = customer?.email || 'sophiapatel@gmail.com';
  const customerPhone = customer?.phone || '+1 (555) 234-5678';
  const customerAddress = customer?.address || '123 Main St Apartment 4A, New York, NY';

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: processedItems,
    subtotal: calculatedSubtotal,
    taxes,
    deliveryFees: calculatedDeliveryFees,
    deliveryType: deliveryType || (deliverySlot ? 'scheduled' : 'scheduled'),
    deliverySlot: deliverySlot || undefined,
    codCharge: codCharge > 0 ? codCharge : undefined,
    total: finalTotal,
    estimatedDelivery,
    paymentMethod: method as any,
    paymentStatus,
    status: orderStatus,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    upiTransactionNote: upiTransactionNote || undefined,
  };

  database.orders.unshift(newOrder);

  // Register / update customer stats
  const existingCust = database.customers.find((c) => c.email.toLowerCase() === customerEmail.toLowerCase());
  if (existingCust) {
    existingCust.totalOrders += 1;
    existingCust.totalSpent = Number((existingCust.totalSpent + newOrder.total).toFixed(2));
  } else {
    database.customers.unshift({
      id: 'cust-' + Date.now(),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      totalOrders: 1,
      totalSpent: newOrder.total,
      registeredAt: new Date().toISOString(),
      status: 'Active',
    });
  }

  // Create payment record in ledger
  database.payments.unshift({
    id: 'pay-' + Date.now(),
    orderId,
    orderNumber,
    customerName,
    amount: newOrder.total,
    paymentMethod: method as any,
    status: paymentStatus === 'Cash on Delivery' ? 'Pending' : paymentStatus,
    date: new Date().toLocaleString(),
    details:
      method === 'upi'
        ? `UPI payment submitted. Ref: ${upiTransactionNote || 'Awaiting Admin Verification'}`
        : method === 'cod'
        ? `Cash on delivery payment to collect: ${storeSettings.currency}${newOrder.total}`
        : 'Online card payment processed',
  });

  db.save();
  db.addAuditLog('NEW_CUSTOMER_ORDER', `New ${method.toUpperCase()} order placed: ${orderNumber} for ${storeSettings.currency}${newOrder.total} (${paymentStatus})`, 'Customer');

  return res.status(201).json({
    success: true,
    order: newOrder,
  });
});

// GET /api/admin/orders
apiRouter.get('/admin/orders', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    orders: database.orders,
  });
});

// PUT /api/admin/orders/:id/status (General status update)
apiRouter.put('/admin/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'In Transit', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid order status' });
  }

  const database = db.getDb();
  const order = database.orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const prevStatus = order.status;
  order.status = status as any;

  // If COD order is marked delivered, also mark payment as Paid
  if (status === 'Delivered' && order.paymentMethod === 'cod') {
    order.paymentStatus = 'Paid';
    const payRecord = database.payments.find((p) => p.orderId === order.id);
    if (payRecord) {
      payRecord.status = 'Paid';
      payRecord.details = 'Cash collected upon delivery';
    }
  }

  db.save();

  db.addAuditLog(
    'UPDATE_ORDER_STATUS',
    `Updated status for order ${order.orderNumber} from "${prevStatus}" to "${status}"`,
    (req as any).adminUser,
    req.ip
  );

  return res.json({
    success: true,
    order,
    message: `Order status updated to ${status}`,
  });
});

// PUT /api/admin/orders/:id/confirm-payment (Admin manually verifies & confirms UPI payment)
apiRouter.put('/admin/orders/:id/confirm-payment', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const database = db.getDb();
  const order = database.orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  order.paymentStatus = 'Paid';
  if (order.status === 'Pending') {
    order.status = 'Confirmed';
  }

  const paymentRecord = database.payments.find((p) => p.orderId === id);
  if (paymentRecord) {
    paymentRecord.status = 'Paid';
    paymentRecord.details = `Payment manually verified & confirmed by admin (${(req as any).adminUser})`;
  }

  db.save();
  db.addAuditLog(
    'CONFIRM_PAYMENT',
    `Confirmed payment for order ${order.orderNumber} ($${order.total})`,
    (req as any).adminUser,
    req.ip
  );

  return res.json({
    success: true,
    order,
    message: 'Payment verified and confirmed successfully',
  });
});

// PUT /api/admin/orders/:id/reject-payment (Admin rejects invalid/unpaid UPI payment)
apiRouter.put('/admin/orders/:id/reject-payment', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const database = db.getDb();
  const order = database.orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  order.paymentStatus = 'Payment Failed / Rejected';
  order.status = 'Cancelled';
  order.rejectionReason = reason || 'Payment could not be verified in store account';

  const paymentRecord = database.payments.find((p) => p.orderId === id);
  if (paymentRecord) {
    paymentRecord.status = 'Payment Failed / Rejected';
    paymentRecord.details = `Payment rejected by admin: ${order.rejectionReason}`;
  }

  db.save();
  db.addAuditLog(
    'REJECT_PAYMENT',
    `Rejected payment for order ${order.orderNumber}: ${order.rejectionReason}`,
    (req as any).adminUser,
    req.ip
  );

  return res.json({
    success: true,
    order,
    message: 'Payment rejected and order marked as Cancelled',
  });
});

/* ==========================================================================
   CUSTOMERS & PAYMENTS (ADMIN)
   ========================================================================== */

// GET /api/admin/customers
apiRouter.get('/admin/customers', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    customers: database.customers,
  });
});

// GET /api/admin/payments
apiRouter.get('/admin/payments', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    payments: database.payments,
  });
});

/* ==========================================================================
   CUSTOMER SUPPORT (PUBLIC & ADMIN REAL-TIME WITH VOICE & ATTACHMENTS)
   ========================================================================== */

// GET /api/support (Customer loads active conversation)
apiRouter.get('/support', (req: Request, res: Response) => {
  const database = db.getDb();
  const customerEmail = String(req.query.email || 'sophiapatel@gmail.com').toLowerCase();
  const customerName = String(req.query.name || 'Sophia Patel');

  let conversation = database.supportConversations.find(
    (c) => c.customerEmail.toLowerCase() === customerEmail
  );

  if (!conversation) {
    conversation = {
      id: 'conv-' + Date.now(),
      customerId: 'cust-sophia',
      customerName: customerName,
      customerEmail: customerEmail,
      customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Open',
      lastMessage: 'Hi! How can our kitchen and support team help you today?',
      updatedAt: new Date().toISOString(),
      unreadCountCustomer: 0,
      unreadCountAdmin: 0,
      messages: [
        {
          id: 'msg-init-1',
          sender: 'agent',
          senderType: 'staff',
          senderName: 'Foodgo Staff',
          messageType: 'text',
          text: 'Hi Sophia! Welcome to Foodgo Support. How can we help you today with your order or questions?',
          time: '12:00 PM',
          timestamp: Date.now() - 3600000,
          read: true,
        },
      ],
    };
    database.supportConversations.push(conversation);
    db.save();
  }

  return res.json({
    success: true,
    conversation,
    messages: conversation.messages,
    unreadCountCustomer: conversation.unreadCountCustomer || 0,
  });
});

// GET /api/support/unread-count (Quick check for customer header badge)
apiRouter.get('/support/unread-count', (req: Request, res: Response) => {
  const database = db.getDb();
  const customerEmail = String(req.query.email || 'sophiapatel@gmail.com').toLowerCase();
  const conversation = database.supportConversations.find(
    (c) => c.customerEmail.toLowerCase() === customerEmail
  );

  return res.json({
    success: true,
    unreadCount: conversation?.unreadCountCustomer || 0,
  });
});

// POST /api/support (Customer sends text or voice audio message)
apiRouter.post('/support', (req: Request, res: Response) => {
  const {
    conversationId,
    customerEmail,
    customerName,
    customerAvatar,
    orderId,
    orderNumber,
    messageType = 'text',
    text,
    audioUrl,
    audioDuration,
    image,
  } = req.body;

  if (messageType === 'text' && (!text || !text.trim())) {
    return res.status(400).json({ success: false, error: 'Message text required' });
  }

  if (messageType === 'audio' && !audioUrl) {
    return res.status(400).json({ success: false, error: 'Audio data required for voice message' });
  }

  const database = db.getDb();
  const email = (customerEmail || 'sophiapatel@gmail.com').toLowerCase();

  let conv = database.supportConversations.find(
    (c) => (conversationId && c.id === conversationId) || c.customerEmail.toLowerCase() === email
  );

  if (!conv) {
    conv = {
      id: 'conv-' + Date.now(),
      customerId: 'cust-' + Date.now(),
      customerName: customerName || 'Sophia Patel',
      customerEmail: email,
      customerAvatar:
        customerAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      orderId,
      orderNumber,
      status: 'Open',
      lastMessage: '',
      updatedAt: new Date().toISOString(),
      unreadCountCustomer: 0,
      unreadCountAdmin: 0,
      messages: [],
    };
    database.supportConversations.unshift(conv);
  }

  if (orderId && !conv.orderId) {
    conv.orderId = orderId;
    conv.orderNumber = orderNumber;
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let displaySnippet = text?.trim() || '';
  if (messageType === 'audio') {
    const dur = audioDuration ? `${Math.round(audioDuration)}s` : 'audio';
    displaySnippet = `🎤 Voice message (${dur})`;
  } else if (messageType === 'image') {
    displaySnippet = '📷 Image attachment';
  }

  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    sender: 'user' as const,
    senderType: 'customer' as const,
    senderName: conv.customerName,
    messageType: messageType as 'text' | 'audio' | 'image',
    text: text?.trim() || (messageType === 'audio' ? 'Voice message' : ''),
    audioUrl: messageType === 'audio' ? audioUrl : undefined,
    audioDuration: messageType === 'audio' ? audioDuration : undefined,
    image: messageType === 'image' ? image : undefined,
    time: timeFormatted,
    timestamp: Date.now(),
    read: false,
  };

  conv.messages.push(newMsg);
  conv.lastMessage = displaySnippet;
  conv.updatedAt = now.toISOString();
  conv.status = 'Open'; // Automatically reopen if previously resolved
  conv.unreadCountAdmin = (conv.unreadCountAdmin || 0) + 1;

  db.save();

  return res.json({
    success: true,
    message: newMsg,
    conversation: conv,
  });
});

// POST /api/support/upload-audio (Upload / save voice recording)
apiRouter.post('/support/upload-audio', (req: Request, res: Response) => {
  const { audioData, duration, mimeType } = req.body;

  if (!audioData || typeof audioData !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid audio data string required' });
  }

  // Ensure reasonable payload size (e.g. max ~15MB base64)
  if (audioData.length > 15 * 1024 * 1024) {
    return res.status(413).json({ success: false, error: 'Voice recording exceeds size limit (max 15MB)' });
  }

  return res.json({
    success: true,
    audioUrl: audioData,
    duration: Number(duration) || 0,
    mimeType: mimeType || 'audio/webm',
  });
});

// PATCH /api/support/read (Mark messages as read)
apiRouter.patch('/support/read', (req: Request, res: Response) => {
  const { conversationId, role = 'customer' } = req.body;
  const database = db.getDb();

  const conv = database.supportConversations.find(
    (c) => c.id === conversationId || (role === 'customer' && c.customerEmail === 'sophiapatel@gmail.com')
  );

  if (conv) {
    if (role === 'customer') {
      conv.unreadCountCustomer = 0;
      conv.messages.forEach((m) => {
        if (m.sender === 'agent') m.read = true;
      });
    } else {
      conv.unreadCountAdmin = 0;
      conv.messages.forEach((m) => {
        if (m.sender === 'user') m.read = true;
      });
    }
    db.save();
  }

  return res.json({ success: true });
});

// GET /api/admin/support (Admin lists all support conversations)
apiRouter.get('/admin/support', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    conversations: database.supportConversations,
  });
});

// POST /api/admin/support/reply (Admin / Staff sends text or voice reply)
apiRouter.post('/admin/support/reply', requireAdminAuth, (req: Request, res: Response) => {
  const { conversationId, messageType = 'text', text, audioUrl, audioDuration, image } = req.body;

  if (messageType === 'text' && (!text || !text.trim())) {
    return res.status(400).json({ success: false, error: 'Reply text is required' });
  }

  if (messageType === 'audio' && !audioUrl) {
    return res.status(400).json({ success: false, error: 'Audio data is required for voice reply' });
  }

  const database = db.getDb();
  const conv = database.supportConversations.find((c) => c.id === conversationId) || database.supportConversations[0];

  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let displaySnippet = text?.trim() || '';
  if (messageType === 'audio') {
    const dur = audioDuration ? `${Math.round(audioDuration)}s` : 'audio';
    displaySnippet = `🎤 Staff Voice message (${dur})`;
  } else if (messageType === 'image') {
    displaySnippet = '📷 Staff Image attachment';
  }

  const adminMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    sender: 'agent' as const,
    senderType: 'admin' as const,
    senderName: (req as any).adminUser || 'Anas (Admin)',
    messageType: messageType as 'text' | 'audio' | 'image',
    text: text?.trim() || (messageType === 'audio' ? 'Staff voice message' : ''),
    audioUrl: messageType === 'audio' ? audioUrl : undefined,
    audioDuration: messageType === 'audio' ? audioDuration : undefined,
    image: messageType === 'image' ? image : undefined,
    time: timeFormatted,
    timestamp: Date.now(),
    read: false,
  };

  conv.messages.push(adminMsg);
  conv.lastMessage = displaySnippet;
  conv.updatedAt = now.toISOString();
  conv.unreadCountCustomer = (conv.unreadCountCustomer || 0) + 1;
  db.save();

  db.addAuditLog(
    'SUPPORT_REPLY',
    `Admin replied (${messageType}) to support conversation with ${conv.customerName}`,
    (req as any).adminUser,
    req.ip
  );

  return res.json({
    success: true,
    message: adminMsg,
    conversation: conv,
  });
});

// PATCH /api/admin/support/:id/status (Toggle Open / Resolved)
apiRouter.patch('/admin/support/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const database = db.getDb();
  const conv = database.supportConversations.find((c) => c.id === id);

  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  conv.status = status === 'Resolved' ? 'Resolved' : 'Open';
  db.save();

  db.addAuditLog('SUPPORT_STATUS', `Changed conversation status to ${conv.status}`, (req as any).adminUser, req.ip);

  return res.json({ success: true, conversation: conv });
});

/* ==========================================================================
   SETTINGS & PAYMENT GATEWAY SETTINGS
   ========================================================================== */

// GET /api/settings (Public store config & payment settings for checkout)
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    settings: database.settings,
  });
});

// PUT /api/admin/settings (Admin updates restaurant settings)
apiRouter.put('/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const current = database.settings;
  const body = req.body;

  database.settings = {
    ...current,
    storeName: body.storeName !== undefined ? String(body.storeName) : current.storeName,
    storeOpen: body.storeOpen !== undefined ? Boolean(body.storeOpen) : current.storeOpen,
    deliveryFee: body.deliveryFee !== undefined ? Number(body.deliveryFee) : current.deliveryFee,
    taxRate: body.taxRate !== undefined ? Number(body.taxRate) : current.taxRate,
    minOrder: body.minOrder !== undefined ? Number(body.minOrder) : current.minOrder,
    currency: body.currency !== undefined ? String(body.currency) : current.currency,
    contactEmail: body.contactEmail !== undefined ? String(body.contactEmail) : current.contactEmail,
    contactPhone: body.contactPhone !== undefined ? String(body.contactPhone) : current.contactPhone,
    address: body.address !== undefined ? String(body.address) : current.address,
    paymentSettings: body.paymentSettings !== undefined ? body.paymentSettings : current.paymentSettings,
    deliverySettings: body.deliverySettings !== undefined ? body.deliverySettings : current.deliverySettings,
  };

  db.save();
  db.addAuditLog('UPDATE_SETTINGS', 'Updated restaurant & store parameters', (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    settings: database.settings,
    message: 'Settings updated successfully',
  });
});

// GET /api/delivery-settings (Public customer endpoint to fetch slots and urgent options)
apiRouter.get('/delivery-settings', (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    deliverySettings: database.settings.deliverySettings || {
      slots: [
        { id: 'slot-1', timeLabel: '1:00 PM', fee: 0, active: true, order: 1 },
        { id: 'slot-2', timeLabel: '3:00 PM', fee: 0, active: true, order: 2 },
        { id: 'slot-3', timeLabel: '5:00 PM', fee: 0, active: true, order: 3 },
      ],
      urgentDelivery: {
        enabled: true,
        fee: 30.0,
        label: 'Urgent Delivery (15-25 mins)',
      },
    },
  });
});

// PUT /api/admin/delivery-settings (Admin updates slots and urgent delivery rules)
apiRouter.put('/admin/delivery-settings', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const { slots, urgentDelivery } = req.body;

  if (!database.settings.deliverySettings) {
    database.settings.deliverySettings = {
      slots: [],
      urgentDelivery: { enabled: true, fee: 30.0, label: 'Urgent Delivery (15-25 mins)' },
    };
  }

  if (Array.isArray(slots)) {
    database.settings.deliverySettings.slots = slots.map((s: any, idx: number) => ({
      id: String(s.id || `slot-${Date.now()}-${idx}`),
      timeLabel: String(s.timeLabel || 'Slot').trim(),
      fee: typeof s.fee === 'number' ? Number(s.fee) : 0,
      active: s.active !== undefined ? Boolean(s.active) : true,
      order: typeof s.order === 'number' ? s.order : idx + 1,
    }));
  }

  if (urgentDelivery && typeof urgentDelivery === 'object') {
    database.settings.deliverySettings.urgentDelivery = {
      enabled: urgentDelivery.enabled !== undefined ? Boolean(urgentDelivery.enabled) : true,
      fee: typeof urgentDelivery.fee === 'number' ? Number(urgentDelivery.fee) : 30.0,
      label: urgentDelivery.label ? String(urgentDelivery.label).trim() : 'Urgent Delivery (15-25 mins)',
    };
  }

  db.save();
  db.addAuditLog('UPDATE_DELIVERY_SETTINGS', 'Updated Delivery Slots & Urgent Delivery configuration', (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    deliverySettings: database.settings.deliverySettings,
    message: 'Delivery settings updated successfully',
  });
});

// PUT /api/admin/payment-settings (Admin specifically updates UPI, Card, and COD configs)
apiRouter.put('/admin/payment-settings', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const { upi, card, cod } = req.body;

  if (upi) {
    database.settings.paymentSettings.upi = {
      ...database.settings.paymentSettings.upi,
      enabled: upi.enabled !== undefined ? Boolean(upi.enabled) : database.settings.paymentSettings.upi.enabled,
      upiId: upi.upiId !== undefined ? String(upi.upiId).trim() : database.settings.paymentSettings.upi.upiId,
      merchantName: upi.merchantName !== undefined ? String(upi.merchantName).trim() : database.settings.paymentSettings.upi.merchantName,
      googlePayName: upi.googlePayName !== undefined ? String(upi.googlePayName).trim() : database.settings.paymentSettings.upi.googlePayName,
      qrCodeUrl: upi.qrCodeUrl !== undefined ? String(upi.qrCodeUrl).trim() : database.settings.paymentSettings.upi.qrCodeUrl,
      instructions: upi.instructions !== undefined ? String(upi.instructions) : database.settings.paymentSettings.upi.instructions,
    };
  }

  if (card) {
    database.settings.paymentSettings.card = {
      ...database.settings.paymentSettings.card,
      enabled: card.enabled !== undefined ? Boolean(card.enabled) : database.settings.paymentSettings.card.enabled,
      gatewayName: card.gatewayName || database.settings.paymentSettings.card.gatewayName,
      publishableKey: card.publishableKey !== undefined ? String(card.publishableKey).trim() : database.settings.paymentSettings.card.publishableKey,
      testMode: card.testMode !== undefined ? Boolean(card.testMode) : database.settings.paymentSettings.card.testMode,
      instructions: card.instructions !== undefined ? String(card.instructions) : database.settings.paymentSettings.card.instructions,
    };
  }

  if (cod) {
    database.settings.paymentSettings.cod = {
      ...database.settings.paymentSettings.cod,
      enabled: cod.enabled !== undefined ? Boolean(cod.enabled) : database.settings.paymentSettings.cod.enabled,
      codCharge: cod.codCharge !== undefined ? Number(cod.codCharge) : database.settings.paymentSettings.cod.codCharge,
      minOrder: cod.minOrder !== undefined ? Number(cod.minOrder) : database.settings.paymentSettings.cod.minOrder,
      maxOrder: cod.maxOrder !== undefined ? Number(cod.maxOrder) : database.settings.paymentSettings.cod.maxOrder,
      instructions: cod.instructions !== undefined ? String(cod.instructions) : database.settings.paymentSettings.cod.instructions,
    };
  }

  db.save();
  db.addAuditLog('UPDATE_PAYMENT_SETTINGS', 'Updated Payment Gateway Settings (UPI / Card / COD)', (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    paymentSettings: database.settings.paymentSettings,
    message: 'Payment settings updated and persisted successfully',
  });
});

// GET /api/admin/audit-logs
apiRouter.get('/admin/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  return res.json({
    success: true,
    logs: database.auditLogs,
  });
});

/* ==========================================================================
   MODULES & SERVICES API (DYNAMIC ADMIN & CUSTOMER SYNC)
   ========================================================================== */

// GET /api/modules (Public Customer Endpoint - Active modules only)
apiRouter.get('/modules', (_req: Request, res: Response) => {
  const database = db.getDb();
  const activeModules = (database.modules || [])
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return res.json({
    success: true,
    modules: activeModules,
  });
});

// GET /api/admin/modules (Admin Endpoint - All modules)
apiRouter.get('/admin/modules', requireAdminAuth, (_req: Request, res: Response) => {
  const database = db.getDb();
  const allModules = (database.modules || []).sort((a, b) => (a.order || 0) - (b.order || 0));

  return res.json({
    success: true,
    modules: allModules,
  });
});

// POST /api/admin/modules (Admin Create Module)
apiRouter.post('/admin/modules', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const { name, title, subtitle, tagline, icon, active, order, bannerTitle, bannerSubtitle, bannerAction, bannerBadge } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, error: 'Module name is required' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').trim() || `module-${Date.now()}`;
  
  if (database.modules.some((m) => m.id === id)) {
    return res.status(400).json({ success: false, error: `Module with ID "${id}" already exists` });
  }

  const newModule: AppModule = {
    id,
    name: name.trim(),
    title: title ? String(title).trim() : `HM-Q ${name.trim()}`,
    subtitle: subtitle ? String(subtitle).trim() : 'Powered by HM-Q',
    tagline: tagline ? String(tagline).trim() : `Order from ${name.trim()}`,
    icon: icon ? String(icon).trim() : '🛍️',
    order: typeof order === 'number' ? order : database.modules.length + 1,
    active: active !== undefined ? Boolean(active) : true,
    bannerTitle: bannerTitle ? String(bannerTitle).trim() : undefined,
    bannerSubtitle: bannerSubtitle ? String(bannerSubtitle).trim() : undefined,
    bannerAction: bannerAction ? String(bannerAction).trim() : undefined,
    bannerBadge: bannerBadge ? String(bannerBadge).trim() : undefined,
  };

  database.modules.push(newModule);
  db.save();
  db.addAuditLog('CREATE_MODULE', `Created new module: ${newModule.name} (${newModule.id})`, (req as any).adminUser, req.ip);

  return res.status(201).json({
    success: true,
    module: newModule,
    modules: database.modules,
    message: 'Module created successfully',
  });
});

// PUT /api/admin/modules/:id (Admin Update Single Module)
apiRouter.put('/admin/modules/:id', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const moduleId = req.params.id;
  const modIndex = database.modules.findIndex((m) => m.id === moduleId);

  if (modIndex === -1) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  const current = database.modules[modIndex];
  const { name, title, subtitle, tagline, icon, active, order, bannerTitle, bannerSubtitle, bannerAction, bannerBadge } = req.body;

  database.modules[modIndex] = {
    ...current,
    name: name !== undefined ? String(name).trim() : current.name,
    title: title !== undefined ? String(title).trim() : current.title,
    subtitle: subtitle !== undefined ? String(subtitle).trim() : current.subtitle,
    tagline: tagline !== undefined ? String(tagline).trim() : current.tagline,
    icon: icon !== undefined ? String(icon).trim() : current.icon,
    active: active !== undefined ? Boolean(active) : current.active,
    order: order !== undefined ? Number(order) : current.order,
    bannerTitle: bannerTitle !== undefined ? String(bannerTitle).trim() : current.bannerTitle,
    bannerSubtitle: bannerSubtitle !== undefined ? String(bannerSubtitle).trim() : current.bannerSubtitle,
    bannerAction: bannerAction !== undefined ? String(bannerAction).trim() : current.bannerAction,
    bannerBadge: bannerBadge !== undefined ? String(bannerBadge).trim() : current.bannerBadge,
  };

  db.save();
  db.addAuditLog('UPDATE_MODULE', `Updated module: ${database.modules[modIndex].name} (${moduleId})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    module: database.modules[modIndex],
    modules: database.modules,
    message: 'Module updated successfully',
  });
});

// PUT /api/admin/modules (Admin Batch Reorder or Update)
apiRouter.put('/admin/modules', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const { modules } = req.body;

  if (!Array.isArray(modules)) {
    return res.status(400).json({ success: false, error: 'modules array is required' });
  }

  database.modules = modules.map((m: any, idx: number) => ({
    id: String(m.id || `module-${idx}`),
    name: String(m.name || 'Module'),
    title: String(m.title || `HM-Q ${m.name || 'Foodgo'}`),
    subtitle: String(m.subtitle || 'Powered by HM-Q'),
    tagline: String(m.tagline || 'Order your favourite items'),
    icon: String(m.icon || '🛍️'),
    order: typeof m.order === 'number' ? m.order : idx + 1,
    active: m.active !== undefined ? Boolean(m.active) : true,
    bannerTitle: m.bannerTitle ? String(m.bannerTitle) : undefined,
    bannerSubtitle: m.bannerSubtitle ? String(m.bannerSubtitle) : undefined,
    bannerAction: m.bannerAction ? String(m.bannerAction) : undefined,
    bannerBadge: m.bannerBadge ? String(m.bannerBadge) : undefined,
  }));

  db.save();
  db.addAuditLog('BATCH_UPDATE_MODULES', `Batch updated ${database.modules.length} modules`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    modules: database.modules,
    message: 'Modules updated successfully',
  });
});

// DELETE /api/admin/modules/:id (Admin Delete Module)
apiRouter.delete('/api/admin/modules/:id', requireAdminAuth, (req: Request, res: Response) => {
  const database = db.getDb();
  const moduleId = req.params.id;

  if (moduleId === 'food') {
    return res.status(400).json({ success: false, error: 'Cannot delete primary "food" module. You can toggle active state instead.' });
  }

  const modIndex = database.modules.findIndex((m) => m.id === moduleId);
  if (modIndex === -1) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  const removed = database.modules.splice(modIndex, 1)[0];
  db.save();
  db.addAuditLog('DELETE_MODULE', `Deleted module: ${removed.name} (${moduleId})`, (req as any).adminUser, req.ip);

  return res.json({
    success: true,
    modules: database.modules,
    message: `Module "${removed.name}" deleted successfully`,
  });
});
