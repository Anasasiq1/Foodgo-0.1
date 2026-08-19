<?php
/**
 * Foodgo Gourmet Ordering Platform - Unified FileStore REST API Router
 * 
 * 100% Databaseless File-Storage Backend Architecture (JSON FileStore)
 * No MySQL, No MariaDB, No PostgreSQL, No SQLite, No PDO required!
 */

define('FOODGO_ACCESS', true);

// Set strict JSON and CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load FileStore and Auto-Initializer
require_once dirname(__DIR__) . '/includes/FileStore.php';
require_once dirname(__DIR__) . '/includes/DataInitializer.php';

FileStore::init();

// Auto-run DataInitializer on first run if data files are missing
if (!file_exists(FileStore::getFilePath('products')) || !file_exists(FileStore::getFilePath('users'))) {
    DataInitializer::run(false);
}

// Parse request route and body
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST;

// Strip /api prefix
$route = preg_replace('#^/api#', '', $path);
if ($route === '') $route = '/';

// ==============================================================================
// HELPER FUNCTIONS FOR AUTH & AUDIT LOGS
// ==============================================================================
function getBearerOrCookieToken(): ?string {
    if (!empty($_COOKIE['foodgo_admin_token'])) {
        return $_COOKIE['foodgo_admin_token'];
    }
    if (!empty($_COOKIE['admin_session'])) {
        return $_COOKIE['admin_session'];
    }
    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        return $_SERVER['HTTP_X_ADMIN_TOKEN'];
    }
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function requireAdminAuth(): array {
    $token = getBearerOrCookieToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized: Admin authentication required']);
        exit;
    }

    $sessions = FileStore::get('sessions', []);
    if (!isset($sessions[$token])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired admin session']);
        exit;
    }

    $session = $sessions[$token];
    if (isset($session['expiresAt']) && time() > $session['expiresAt']) {
        unset($sessions[$token]);
        FileStore::saveRaw('sessions', $sessions);
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Session expired. Please log in again.']);
        exit;
    }

    // Extend session
    $sessions[$token]['expiresAt'] = time() + (12 * 3600);
    FileStore::saveRaw('sessions', $sessions);

    return $session;
}

function addAuditLog(string $action, string $details, string $adminUsername = 'System'): void {
    FileStore::create('audit_logs', [
        'id' => 'log-' . time() . '-' . bin2hex(random_bytes(3)),
        'action' => $action,
        'details' => $details,
        'adminUsername' => $adminUsername,
        'ipAddress' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        'createdAt' => date('c')
    ]);
}

// ==============================================================================
// 1. HEALTH & SYSTEM STATUS
// ==============================================================================
if (preg_match('#^/health/?$#', $route)) {
    echo json_encode([
        'success' => true,
        'status' => 'ok',
        'engine' => 'JSON FileStore (Databaseless)',
        'timestamp' => time()
    ]);
    exit;
}

// ==============================================================================
// 2. MODULES API (Food, Grocery, Pharmacy, Cosmetics, Stationery)
// ==============================================================================
if (preg_match('#^/modules/?$#', $route) && $method === 'GET') {
    $modules = FileStore::get('modules', []);
    usort($modules, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));
    echo json_encode(['success' => true, 'modules' => $modules]);
    exit;
}

if (preg_match('#^/admin/modules/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $modules = $input['modules'] ?? [];
    FileStore::saveRaw('modules', $modules);
    addAuditLog('UPDATE_MODULES', 'Updated multi-service modules configuration', $admin['username']);
    echo json_encode(['success' => true, 'modules' => $modules]);
    exit;
}

// ==============================================================================
// 3. CATEGORIES API
// ==============================================================================
if (preg_match('#^/categories/?$#', $route) && $method === 'GET') {
    $categories = FileStore::get('categories', []);
    $moduleId = $_GET['moduleId'] ?? null;
    if ($moduleId) {
        $categories = array_values(array_filter($categories, fn($c) => ($c['moduleId'] ?? 'food') === $moduleId));
    }
    usort($categories, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit;
}

if (preg_match('#^/admin/categories/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $categories = $input['categories'] ?? [];
    FileStore::saveRaw('categories', $categories);
    addAuditLog('UPDATE_CATEGORIES', 'Updated product categories', $admin['username']);
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit;
}

// ==============================================================================
// 4. PRODUCTS API
// ==============================================================================
if (preg_match('#^/products/?$#', $route) && $method === 'GET') {
    $products = FileStore::get('products', []);
    $search = strtolower(trim($_GET['search'] ?? ''));
    $category = $_GET['category'] ?? null;
    $moduleId = $_GET['moduleId'] ?? null;

    if ($search !== '') {
        $products = array_filter($products, function ($p) use ($search) {
            return str_contains(strtolower($p['name'] ?? ''), $search) ||
                   str_contains(strtolower($p['description'] ?? ''), $search) ||
                   str_contains(strtolower($p['subtitle'] ?? ''), $search);
        });
    }

    if ($category && $category !== 'All' && $category !== 'all') {
        $products = array_filter($products, fn($p) => ($p['categoryId'] ?? '') === $category);
    }

    $products = array_values($products);
    usort($products, fn($a, $b) => ($a['sortOrder'] ?? 0) <=> ($b['sortOrder'] ?? 0));

    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

// Create/Update Product (Admin)
if (preg_match('#^/admin/products/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $productData = $input;
    if (empty($productData['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Product name is required']);
        exit;
    }

    $id = $productData['id'] ?? ('prod-' . time() . '-' . bin2hex(random_bytes(3)));
    $productData['id'] = $id;
    $productData['price'] = (float)($productData['price'] ?? 0);
    $productData['rating'] = (float)($productData['rating'] ?? 5.0);
    $productData['available'] = (bool)($productData['available'] ?? true);
    $productData['updatedAt'] = date('c');

    $saved = FileStore::upsert('products', $id, $productData);
    addAuditLog('SAVE_PRODUCT', 'Created/Updated product: ' . $productData['name'], $admin['username']);

    echo json_encode(['success' => true, 'product' => $saved]);
    exit;
}

// Delete Product (Admin)
if (preg_match('#^/admin/products/([a-zA-Z0-9_\-]+)/?$#', $route, $matches) && $method === 'DELETE') {
    $admin = requireAdminAuth();
    $productId = $matches[1];
    $deleted = FileStore::delete('products', $productId);
    addAuditLog('DELETE_PRODUCT', 'Deleted product ID: ' . $productId, $admin['username']);
    echo json_encode(['success' => $deleted]);
    exit;
}

// ==============================================================================
// 5. CURRIES & SALNA API
// ==============================================================================
if (preg_match('#^/curries/?$#', $route) && $method === 'GET') {
    $curries = FileStore::get('curries', []);
    echo json_encode(['success' => true, 'curries' => $curries]);
    exit;
}

if (preg_match('#^/admin/curries/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $curries = $input['curries'] ?? [];
    FileStore::saveRaw('curries', $curries);
    addAuditLog('UPDATE_CURRIES', 'Updated curries / salna options', $admin['username']);
    echo json_encode(['success' => true, 'curries' => $curries]);
    exit;
}

// ==============================================================================
// 6. CUSTOM ORDER SECTIONS API
// ==============================================================================
if (preg_match('#^/custom-order-sections/?$#', $route) && $method === 'GET') {
    $sections = FileStore::get('custom_order_sections', []);
    echo json_encode(['success' => true, 'sections' => $sections]);
    exit;
}

if (preg_match('#^/admin/custom-order-sections/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $sections = $input['sections'] ?? [];
    FileStore::saveRaw('custom_order_sections', $sections);
    addAuditLog('UPDATE_CUSTOM_ORDER_SECTIONS', 'Updated custom order sections', $admin['username']);
    echo json_encode(['success' => true, 'sections' => $sections]);
    exit;
}

// ==============================================================================
// 7. SETTINGS & PAYMENT SETTINGS API
// ==============================================================================
if (preg_match('#^/settings/?$#', $route) && $method === 'GET') {
    $settings = FileStore::get('settings', []);
    $paymentSettings = FileStore::get('payment_settings', []);
    $settings['paymentSettings'] = $paymentSettings;
    echo json_encode(['success' => true, 'settings' => $settings]);
    exit;
}

if (preg_match('#^/admin/settings/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $settings = $input['settings'] ?? $input;
    if (isset($settings['paymentSettings'])) {
        FileStore::saveRaw('payment_settings', $settings['paymentSettings']);
        unset($settings['paymentSettings']);
    }
    FileStore::saveRaw('settings', $settings);
    addAuditLog('UPDATE_SETTINGS', 'Updated store configuration', $admin['username']);
    echo json_encode(['success' => true, 'settings' => $settings]);
    exit;
}

if (preg_match('#^/delivery-settings/?$#', $route) && $method === 'GET') {
    $deliverySettings = FileStore::get('delivery_settings', []);
    echo json_encode(['success' => true, 'deliverySettings' => $deliverySettings]);
    exit;
}

if (preg_match('#^/admin/delivery-settings/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $deliverySettings = $input['deliverySettings'] ?? $input;
    FileStore::saveRaw('delivery_settings', $deliverySettings);
    addAuditLog('UPDATE_DELIVERY_SETTINGS', 'Updated delivery timings and fee thresholds', $admin['username']);
    echo json_encode(['success' => true, 'deliverySettings' => $deliverySettings]);
    exit;
}

// ==============================================================================
// 8. ORDERS API (Create, List, Update Status)
// ==============================================================================
if (preg_match('#^/orders/?$#', $route) && $method === 'GET') {
    $orders = FileStore::get('orders', []);
    usort($orders, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

if (preg_match('#^/orders/?$#', $route) && $method === 'POST') {
    $items = $input['items'] ?? [];
    $subtotal = (float)($input['subtotal'] ?? 0);
    $taxes = (float)($input['taxes'] ?? 0.3);
    $deliveryFees = (float)($input['deliveryFees'] ?? 1.5);
    $total = (float)($input['total'] ?? ($subtotal + $taxes + $deliveryFees));
    $paymentMethod = $input['paymentMethod'] ?? 'Cash on Delivery';
    $customerName = $input['customerName'] ?? 'Guest Customer';

    $orderNumber = '#FG-' . rand(10000, 99999);
    $orderId = 'order-' . time() . '-' . bin2hex(random_bytes(3));

    $order = [
        'id' => $orderId,
        'orderNumber' => $orderNumber,
        'date' => 'Just now',
        'customerName' => $customerName,
        'customerEmail' => $input['customerEmail'] ?? 'customer@example.com',
        'customerPhone' => $input['customerPhone'] ?? '+91 9876543210',
        'deliveryAddress' => $input['deliveryAddress'] ?? 'Calicut, Kerala',
        'items' => $items,
        'subtotal' => $subtotal,
        'taxes' => $taxes,
        'deliveryFees' => $deliveryFees,
        'total' => $total,
        'estimatedDelivery' => $input['estimatedDelivery'] ?? '15 - 30mins',
        'paymentMethod' => $paymentMethod,
        'status' => 'In Transit',
        'createdAt' => date('c')
    ];

    FileStore::create('orders', $order);

    // Record Payment
    FileStore::create('payments', [
        'id' => 'pay-' . time() . '-' . bin2hex(random_bytes(3)),
        'orderId' => $orderId,
        'orderNumber' => $orderNumber,
        'customerName' => $customerName,
        'amount' => $total,
        'paymentMethod' => $paymentMethod,
        'status' => ($paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
        'date' => date('Y-m-d H:i'),
        'createdAt' => date('c')
    ]);

    echo json_encode(['success' => true, 'order' => $order]);
    exit;
}

if (preg_match('#^/admin/orders/([a-zA-Z0-9_\-]+)/status/?$#', $route, $matches) && $method === 'PATCH') {
    $admin = requireAdminAuth();
    $orderId = $matches[1];
    $newStatus = $input['status'] ?? 'Delivered';

    $updated = FileStore::update('orders', $orderId, ['status' => $newStatus]);
    addAuditLog('UPDATE_ORDER_STATUS', "Changed order #{$orderId} status to {$newStatus}", $admin['username']);

    echo json_encode(['success' => true, 'order' => $updated]);
    exit;
}

// ==============================================================================
// 9. ADMIN AUTHENTICATION API
// ==============================================================================
if (preg_match('#^/admin/login/?$#', $route) && $method === 'POST') {
    $username = trim($input['username'] ?? '');
    $password = (string)($input['password'] ?? '');

    $users = FileStore::get('users', []);
    $matchedUser = null;

    foreach ($users as $u) {
        if (strcasecmp($u['username'] ?? '', $username) === 0 || strcasecmp($u['email'] ?? '', $username) === 0) {
            $matchedUser = $u;
            break;
        }
    }

    if (!$matchedUser || !password_verify($password, $matchedUser['passwordHash'])) {
        addAuditLog('FAILED_LOGIN', "Failed login attempt for username: {$username}", 'Anonymous');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid username or password']);
        exit;
    }

    $token = 'sess_' . bin2hex(random_bytes(32));
    $sessions = FileStore::get('sessions', []);
    $sessions[$token] = [
        'token' => $token,
        'userId' => $matchedUser['id'],
        'username' => $matchedUser['username'],
        'name' => $matchedUser['name'],
        'role' => $matchedUser['role'] ?? 'Super Administrator',
        'createdAt' => time(),
        'expiresAt' => time() + (12 * 3600)
    ];
    FileStore::saveRaw('sessions', $sessions);

    setcookie('foodgo_admin_token', $token, [
        'expires' => time() + (12 * 3600),
        'path' => '/',
        'httponly' => false,
        'samesite' => 'Lax'
    ]);

    addAuditLog('ADMIN_LOGIN', "Admin {$matchedUser['username']} logged in successfully", $matchedUser['username']);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'username' => $matchedUser['username'],
            'name' => $matchedUser['name'],
            'role' => $matchedUser['role'] ?? 'Super Administrator'
        ]
    ]);
    exit;
}

if (preg_match('#^/admin/me/?$#', $route) && $method === 'GET') {
    $session = requireAdminAuth();
    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $session['username'],
            'name' => $session['name'],
            'role' => $session['role']
        ]
    ]);
    exit;
}

if (preg_match('#^/admin/logout/?$#', $route) && $method === 'POST') {
    $token = getBearerOrCookieToken();
    if ($token) {
        $sessions = FileStore::get('sessions', []);
        unset($sessions[$token]);
        FileStore::saveRaw('sessions', $sessions);
    }
    setcookie('foodgo_admin_token', '', ['expires' => time() - 3600, 'path' => '/']);
    echo json_encode(['success' => true]);
    exit;
}

// ==============================================================================
// 10. ADMIN DASHBOARD STATS
// ==============================================================================
if (preg_match('#^/admin/dashboard/?$#', $route) && $method === 'GET') {
    $orders = FileStore::get('orders', []);
    $customers = FileStore::get('customers', []);
    $products = FileStore::get('products', []);

    $totalRevenue = array_reduce($orders, fn($sum, $o) => $sum + ($o['total'] ?? 0), 0);
    $recentOrders = array_slice($orders, 0, 8);

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalRevenue' => (float)$totalRevenue,
            'totalOrders' => count($orders),
            'totalCustomers' => count($customers),
            'totalProducts' => count($products),
            'recentOrders' => $recentOrders
        ]
    ]);
    exit;
}

// ==============================================================================
// 11. AUDIT LOGS, PAYMENTS, CUSTOMERS, STORES, RIDERS, MERCHANTS
// ==============================================================================
if (preg_match('#^/admin/audit-logs/?$#', $route) && $method === 'GET') {
    $admin = requireAdminAuth();
    $logs = FileStore::get('audit_logs', []);
    usort($logs, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['success' => true, 'logs' => array_slice($logs, 0, 100)]);
    exit;
}

if (preg_match('#^/admin/payments/?$#', $route) && $method === 'GET') {
    $admin = requireAdminAuth();
    $payments = FileStore::get('payments', []);
    usort($payments, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    echo json_encode(['success' => true, 'payments' => $payments]);
    exit;
}

if (preg_match('#^/admin/customers/?$#', $route) && $method === 'GET') {
    $admin = requireAdminAuth();
    $customers = FileStore::get('customers', []);
    echo json_encode(['success' => true, 'customers' => $customers]);
    exit;
}

if (preg_match('#^/stores/?$#', $route) && $method === 'GET') {
    $stores = FileStore::get('stores', []);
    echo json_encode(['success' => true, 'stores' => $stores]);
    exit;
}

if (preg_match('#^/merchants/?$#', $route) && $method === 'GET') {
    $merchants = FileStore::get('merchants', []);
    echo json_encode(['success' => true, 'merchants' => $merchants]);
    exit;
}

if (preg_match('#^/delivery/?$#', $route) && $method === 'GET') {
    $deliveryPartners = FileStore::get('delivery_partners', []);
    echo json_encode(['success' => true, 'deliveryPartners' => $deliveryPartners]);
    exit;
}

// ==============================================================================
// 12. CHAT & LIVE CUSTOMER SUPPORT API
// ==============================================================================
if (preg_match('#^/support/?$#', $route) && $method === 'GET') {
    $email = $_GET['email'] ?? 'customer@example.com';
    $name = $_GET['name'] ?? 'Customer';

    $conversations = FileStore::get('support_conversations', []);
    $found = null;

    foreach ($conversations as $c) {
        if (($c['customerEmail'] ?? '') === $email) {
            $found = $c;
            break;
        }
    }

    if (!$found) {
        $found = [
            'id' => 'conv-' . time() . '-' . bin2hex(random_bytes(3)),
            'customerName' => $name,
            'customerEmail' => $email,
            'customerAvatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            'status' => 'Open',
            'lastMessage' => 'Hello! Welcome to Foodgo Gourmet Support.',
            'unreadCountCustomer' => 0,
            'unreadCountAdmin' => 0,
            'updatedAt' => date('c'),
            'messages' => [
                [
                    'id' => 'msg-welcome',
                    'sender' => 'agent',
                    'text' => 'Hello! Welcome to Foodgo Gourmet Support. How can we help you today?',
                    'time' => date('h:i A'),
                    'timestamp' => time() * 1000
                ]
            ]
        ];
        FileStore::create('support_conversations', $found);
    }

    echo json_encode([
        'success' => true,
        'conversation' => $found,
        'messages' => $found['messages'] ?? [],
        'unreadCountCustomer' => $found['unreadCountCustomer'] ?? 0
    ]);
    exit;
}

// Send support message
if (preg_match('#^/support/message/?$#', $route) && $method === 'POST') {
    $email = $input['email'] ?? 'customer@example.com';
    $sender = $input['sender'] ?? 'user';
    $text = trim($input['text'] ?? '');
    $audioUrl = $input['audioUrl'] ?? null;
    $duration = (float)($input['duration'] ?? 0);

    $conversations = FileStore::get('support_conversations', []);
    $updatedConv = null;

    foreach ($conversations as $idx => $conv) {
        if (($conv['customerEmail'] ?? '') === $email) {
            $newMsg = [
                'id' => 'msg-' . time() . '-' . bin2hex(random_bytes(3)),
                'sender' => $sender,
                'text' => $text,
                'audioUrl' => $audioUrl,
                'duration' => $duration,
                'time' => date('h:i A'),
                'timestamp' => time() * 1000
            ];
            $conv['messages'][] = $newMsg;
            $conv['lastMessage'] = !empty($text) ? $text : '🎤 Voice message (' . round($duration) . 's)';
            $conv['updatedAt'] = date('c');

            if ($sender === 'user') {
                $conv['unreadCountAdmin'] = ($conv['unreadCountAdmin'] ?? 0) + 1;
            } else {
                $conv['unreadCountCustomer'] = ($conv['unreadCountCustomer'] ?? 0) + 1;
            }

            $conversations[$idx] = $conv;
            $updatedConv = $conv;
            break;
        }
    }

    if ($updatedConv) {
        FileStore::saveRaw('support_conversations', $conversations);
    }

    echo json_encode(['success' => true, 'conversation' => $updatedConv]);
    exit;
}

// ==============================================================================
// 13. SECURE FILE UPLOAD API
// ==============================================================================
if (preg_match('#^/upload/?$#', $route) && $method === 'POST') {
    $uploadDir = dirname(__DIR__) . '/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file format. Only safe images and audio are allowed.']);
        exit;
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeName = 'upload_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . strtolower($ext);
    $targetPath = $uploadDir . '/' . $safeName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            'success' => true,
            'url' => '/uploads/' . $safeName,
            'filename' => $safeName
        ]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
    exit;
}

// ==============================================================================
// 14. BACKUP CREATION & DOWNLOAD (Admin)
// ==============================================================================
if (preg_match('#^/admin/backup/?$#', $route) && $method === 'POST') {
    $admin = requireAdminAuth();
    $backupFile = FileStore::createBackup();
    if ($backupFile) {
        addAuditLog('CREATE_BACKUP', 'Created full JSON FileStore backup archive', $admin['username']);
        echo json_encode([
            'success' => true,
            'backupFile' => basename($backupFile),
            'downloadUrl' => '/backups/' . basename($backupFile)
        ]);
        exit;
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to generate backup']);
    exit;
}

// ==============================================================================
// 404 Fallback
// ==============================================================================
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found: ' . $route]);
