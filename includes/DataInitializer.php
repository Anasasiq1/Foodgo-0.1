<?php
/**
 * Foodgo Gourmet Ordering Platform - Data Initializer & Seed Generator
 * Populates /data/*.json files automatically from templates or database.json
 */

if (!defined('FOODGO_ACCESS')) {
    define('FOODGO_ACCESS', true);
}

require_once __DIR__ . '/FileStore.php';

class DataInitializer
{
    /**
     * Run complete initialization for all JSON collections
     */
    public static function run(bool $force = false): array
    {
        FileStore::init();
        $created = [];
        $baseDir = dirname(__DIR__);

        // Check if database.json exists to load pre-seeded rich catalog
        $legacyDbFile = $baseDir . '/database.json';
        $legacyDb = [];
        if (file_exists($legacyDbFile)) {
            $contents = @file_get_contents($legacyDbFile);
            $legacyDb = json_decode($contents, true) ?: [];
        }

        // 1. Modules
        if ($force || !file_exists(FileStore::getFilePath('modules'))) {
            $modules = !empty($legacyDb['modules']) ? $legacyDb['modules'] : self::getDefaultModules();
            FileStore::saveRaw('modules', $modules);
            $created[] = 'modules.json';
        }

        // 2. Categories
        if ($force || !file_exists(FileStore::getFilePath('categories'))) {
            $categories = !empty($legacyDb['categories']) ? $legacyDb['categories'] : self::getDefaultCategories();
            FileStore::saveRaw('categories', $categories);
            $created[] = 'categories.json';
        }

        // 3. Products
        if ($force || !file_exists(FileStore::getFilePath('products'))) {
            $products = !empty($legacyDb['products']) ? $legacyDb['products'] : self::getDefaultProducts();
            FileStore::saveRaw('products', $products);
            $created[] = 'products.json';
        }

        // 4. Curries & Salna Options
        if ($force || !file_exists(FileStore::getFilePath('curries'))) {
            $curries = !empty($legacyDb['curries']) ? $legacyDb['curries'] : self::getDefaultCurries();
            FileStore::saveRaw('curries', $curries);
            $created[] = 'curries.json';
        }

        // 5. Custom Order Sections
        if ($force || !file_exists(FileStore::getFilePath('custom_order_sections'))) {
            $sections = !empty($legacyDb['customOrderSections']) ? $legacyDb['customOrderSections'] : [];
            FileStore::saveRaw('custom_order_sections', $sections);
            $created[] = 'custom_order_sections.json';
        }

        // 6. Option Group Templates
        if ($force || !file_exists(FileStore::getFilePath('templates'))) {
            $templates = !empty($legacyDb['optionGroupTemplates']) ? $legacyDb['optionGroupTemplates'] : [];
            FileStore::saveRaw('templates', $templates);
            $created[] = 'templates.json';
        }

        // 7. Store Settings
        if ($force || !file_exists(FileStore::getFilePath('settings'))) {
            $settings = !empty($legacyDb['settings']) ? $legacyDb['settings'] : [
                'storeName' => 'Foodgo',
                'storeOpen' => true,
                'deliveryFee' => 2.00,
                'taxRate' => 0.08,
                'minOrder' => 5.00,
                'currency' => 'INR (₹)',
                'contactEmail' => 'support@foodgo.com',
                'contactPhone' => '+91 98765 43210',
                'address' => 'Central Food Street, Kozhikode, Kerala',
                'socialLinks' => [
                    'facebook' => 'https://facebook.com',
                    'instagram' => 'https://instagram.com',
                    'twitter' => 'https://twitter.com'
                ]
            ];
            FileStore::saveRaw('settings', $settings);
            $created[] = 'settings.json';
        }

        // 8. Delivery Settings
        if ($force || !file_exists(FileStore::getFilePath('delivery_settings'))) {
            $deliverySettings = !empty($legacyDb['deliverySettings']) ? $legacyDb['deliverySettings'] : [
                'deliveryFee' => 2.00,
                'freeDeliveryThreshold' => 50.00,
                'estimatedDeliveryTime' => '25-35 mins',
                'isDeliveryEnabled' => true,
                'minimumOrderAmount' => 5.00,
                'taxRate' => 0.08,
                'timeSlots' => [
                    ['id' => 'slot-1', 'name' => 'Breakfast Delivery', 'startTime' => '07:30', 'endTime' => '11:00', 'active' => true],
                    ['id' => 'slot-2', 'name' => 'Lunch Delivery', 'startTime' => '12:00', 'endTime' => '15:30', 'active' => true],
                    ['id' => 'slot-3', 'name' => 'Evening / Dinner', 'startTime' => '18:00', 'endTime' => '23:30', 'active' => true]
                ]
            ];
            FileStore::saveRaw('delivery_settings', $deliverySettings);
            $created[] = 'delivery_settings.json';
        }

        // 9. Payment Settings
        if ($force || !file_exists(FileStore::getFilePath('payment_settings'))) {
            $paymentSettings = !empty($legacyDb['paymentSettings']) ? $legacyDb['paymentSettings'] : [
                'cashOnDelivery' => true,
                'upiQr' => true,
                'stripe' => false,
                'razorpay' => false,
                'upiId' => 'foodgo@upi',
                'merchantName' => 'Foodgo Foods Pvt Ltd',
                'currency' => 'INR (₹)'
            ];
            FileStore::saveRaw('payment_settings', $paymentSettings);
            $created[] = 'payment_settings.json';
        }

        // 10. Stores
        if ($force || !file_exists(FileStore::getFilePath('stores'))) {
            $stores = [
                [
                    'id' => 'store-main',
                    'name' => 'Foodgo Flagship Kitchen',
                    'address' => 'Beach Road, Calicut, Kerala',
                    'phone' => '+91 9876543210',
                    'email' => 'kitchen@foodgo.com',
                    'status' => 'Active',
                    'rating' => 4.9,
                    'totalOrders' => 1420,
                    'commissionRate' => 10.0,
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('stores', $stores);
            $created[] = 'stores.json';
        }

        // 11. Merchants
        if ($force || !file_exists(FileStore::getFilePath('merchants'))) {
            $merchants = [
                [
                    'id' => 'merch-1',
                    'storeId' => 'store-main',
                    'name' => 'Executive Chef Asiq',
                    'email' => 'merchant@foodgo.com',
                    'phone' => '+91 9845012345',
                    'status' => 'Active',
                    'walletBalance' => 45200.00,
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('merchants', $merchants);
            $created[] = 'merchants.json';
        }

        // 12. Delivery Partners
        if ($force || !file_exists(FileStore::getFilePath('delivery_partners'))) {
            $deliveryPartners = [
                [
                    'id' => 'rider-1',
                    'name' => 'Rahul Shaji',
                    'phone' => '+91 9745123456',
                    'email' => 'rider1@foodgo.com',
                    'vehicle' => 'Motorcycle (KL-11-BH-4021)',
                    'status' => 'Online',
                    'activeOrders' => 0,
                    'totalDeliveries' => 312,
                    'rating' => 4.85,
                    'walletBalance' => 3200.00,
                    'createdAt' => date('c')
                ],
                [
                    'id' => 'rider-2',
                    'name' => 'Muhammed Fayis',
                    'phone' => '+91 9846789012',
                    'email' => 'rider2@foodgo.com',
                    'vehicle' => 'Electric Scooter (KL-11-EQ-9011)',
                    'status' => 'Online',
                    'activeOrders' => 1,
                    'totalDeliveries' => 489,
                    'rating' => 4.92,
                    'walletBalance' => 5400.00,
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('delivery_partners', $deliveryPartners);
            $created[] = 'delivery_partners.json';
        }

        // 13. Customers
        if ($force || !file_exists(FileStore::getFilePath('customers'))) {
            $customers = !empty($legacyDb['customers']) ? $legacyDb['customers'] : [
                [
                    'id' => 'cust-1',
                    'name' => 'Anas Asiq',
                    'email' => 'anasasiq3@gmail.com',
                    'phone' => '+91 9876543210',
                    'address' => 'Kozhikode, Kerala, India',
                    'totalOrders' => 12,
                    'totalSpent' => 4580.00,
                    'registeredAt' => date('c'),
                    'status' => 'Active'
                ]
            ];
            FileStore::saveRaw('customers', $customers);
            $created[] = 'customers.json';
        }

        // 14. Orders & Order Items
        if ($force || !file_exists(FileStore::getFilePath('orders'))) {
            $orders = !empty($legacyDb['orders']) ? $legacyDb['orders'] : [];
            FileStore::saveRaw('orders', $orders);
            $created[] = 'orders.json';
        }

        if ($force || !file_exists(FileStore::getFilePath('order_items'))) {
            FileStore::saveRaw('order_items', []);
            $created[] = 'order_items.json';
        }

        // 15. Payments
        if ($force || !file_exists(FileStore::getFilePath('payments'))) {
            $payments = !empty($legacyDb['payments']) ? $legacyDb['payments'] : [];
            FileStore::saveRaw('payments', $payments);
            $created[] = 'payments.json';
        }

        // 16. Support Conversations & Messages
        if ($force || !file_exists(FileStore::getFilePath('support_conversations'))) {
            $convs = !empty($legacyDb['supportConversations']) ? $legacyDb['supportConversations'] : [];
            FileStore::saveRaw('support_conversations', $convs);
            $created[] = 'support_conversations.json';
        }

        // 17. Coupons & Promotions
        if ($force || !file_exists(FileStore::getFilePath('coupons'))) {
            $coupons = [
                [
                    'id' => 'coupon-welcome',
                    'code' => 'WELCOME50',
                    'discountType' => 'percentage',
                    'discountValue' => 50,
                    'maxDiscount' => 100,
                    'minOrderAmount' => 199,
                    'active' => true,
                    'expiresAt' => date('Y-m-d', strtotime('+1 year'))
                ],
                [
                    'id' => 'coupon-foodgo20',
                    'code' => 'FOODGO20',
                    'discountType' => 'flat',
                    'discountValue' => 20,
                    'minOrderAmount' => 150,
                    'active' => true,
                    'expiresAt' => date('Y-m-d', strtotime('+1 year'))
                ]
            ];
            FileStore::saveRaw('coupons', $coupons);
            $created[] = 'coupons.json';
        }

        // 18. API Keys
        if ($force || !file_exists(FileStore::getFilePath('api_keys'))) {
            $apiKeys = [
                [
                    'id' => 'key-' . bin2hex(random_bytes(6)),
                    'name' => 'Default Store Front App',
                    'publicKey' => 'fg_pub_' . bin2hex(random_bytes(12)),
                    'secretKeyHash' => password_hash('fg_sec_' . bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
                    'scopes' => ['read:products', 'create:orders', 'read:stores'],
                    'status' => 'Active',
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('api_keys', $apiKeys);
            $created[] = 'api_keys.json';
        }

        // 19. Webhooks
        if ($force || !file_exists(FileStore::getFilePath('webhooks'))) {
            $webhooks = [
                [
                    'id' => 'wh-default',
                    'name' => 'n8n Automation Webhook (Optional)',
                    'url' => '',
                    'events' => ['order.created', 'order.status_updated', 'payment.received'],
                    'active' => false,
                    'secret' => bin2hex(random_bytes(16)),
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('webhooks', $webhooks);
            $created[] = 'webhooks.json';
        }

        // 20. Audit Logs
        if ($force || !file_exists(FileStore::getFilePath('audit_logs'))) {
            $logs = !empty($legacyDb['auditLogs']) ? $legacyDb['auditLogs'] : [
                [
                    'id' => 'log-init',
                    'action' => 'SYSTEM_INIT',
                    'details' => 'Foodgo databaseless file-storage architecture initialized successfully.',
                    'adminUsername' => 'System',
                    'ipAddress' => '127.0.0.1',
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('audit_logs', $logs);
            $created[] = 'audit_logs.json';
        }

        // 21. Users / Admins
        if ($force || !file_exists(FileStore::getFilePath('users'))) {
            $admins = !empty($legacyDb['admins']) ? $legacyDb['admins'] : [
                [
                    'id' => 'admin-1',
                    'username' => 'Anasasiq',
                    'email' => 'anasasiq3@gmail.com',
                    'name' => 'Anas Asiq',
                    'role' => 'Super Administrator',
                    'passwordHash' => password_hash('admin123', PASSWORD_DEFAULT),
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('users', $admins);
            $created[] = 'users.json';
        }

        // 22. Active Sessions
        if ($force || !file_exists(FileStore::getFilePath('sessions'))) {
            FileStore::saveRaw('sessions', []);
            $created[] = 'sessions.json';
        }

        // Additional entity JSON collections
        $collections = [
            'inventory', 'wallets', 'promotions', 'notifications',
            'reviews', 'loyalty', 'referrals', 'subscriptions',
            'advertisements', 'api_clients', 'webhook_logs',
            'integrations', 'applications', 'domains', 'delivery_assignments'
        ];

        foreach ($collections as $col) {
            if ($force || !file_exists(FileStore::getFilePath($col))) {
                FileStore::saveRaw($col, []);
                $created[] = $col . '.json';
            }
        }

        return $created;
    }

    private static function getDefaultModules(): array
    {
        return [
            [
                'id' => 'food',
                'name' => 'Food',
                'title' => 'HM-Q Foodgo',
                'subtitle' => 'Powered by HM-Q',
                'tagline' => 'Order your favourite food!',
                'icon' => '🍔',
                'order' => 1,
                'active' => true,
                'bannerTitle' => 'Customize Your Burger',
                'bannerSubtitle' => 'Choose your toppings, sides & spice',
                'bannerAction' => 'Build Now →',
                'bannerBadge' => 'Burger Builder'
            ],
            [
                'id' => 'grocery',
                'name' => 'Grocery',
                'title' => 'HM-Q Grocery',
                'subtitle' => 'Powered by HM-Q',
                'tagline' => 'Shop groceries near you',
                'icon' => '🛒',
                'order' => 2,
                'active' => true,
                'bannerTitle' => 'Fresh Daily Essentials',
                'bannerSubtitle' => 'Farm fresh produce delivered in 15 mins',
                'bannerAction' => 'Shop Now →',
                'bannerBadge' => 'Fresh Groceries'
            ],
            [
                'id' => 'pharmacy',
                'name' => 'Pharmacy',
                'title' => 'HM-Q Pharmacy',
                'subtitle' => 'Powered by HM-Q',
                'tagline' => 'Medicines & healthcare delivered',
                'icon' => '💊',
                'order' => 3,
                'active' => true,
                'bannerTitle' => 'Healthcare & Wellness',
                'bannerSubtitle' => '100% genuine medicines & first aid',
                'bannerAction' => 'Explore →',
                'bannerBadge' => 'Certified Meds'
            ],
            [
                'id' => 'cosmetics',
                'name' => 'Cosmetics',
                'title' => 'HM-Q Cosmetics',
                'subtitle' => 'Powered by HM-Q',
                'tagline' => 'Beauty, skincare & perfumes',
                'icon' => '💄',
                'order' => 4,
                'active' => true,
                'bannerTitle' => 'Luxury Glow Boutique',
                'bannerSubtitle' => 'Premium organic beauty & skincare',
                'bannerAction' => 'Discover →',
                'bannerBadge' => 'Top Brands'
            ],
            [
                'id' => 'stationery',
                'name' => 'Stationery',
                'title' => 'HM-Q Stationery',
                'subtitle' => 'Powered by HM-Q',
                'tagline' => 'Office supplies & books',
                'icon' => '📦',
                'order' => 5,
                'active' => true,
                'bannerTitle' => 'Office & Study Supplies',
                'bannerSubtitle' => 'Notebooks, pens & craft supplies',
                'bannerAction' => 'Browse →',
                'bannerBadge' => 'Back to School'
            ]
        ];
    }

    private static function getDefaultCategories(): array
    {
        return [
            ['id' => 'all', 'name' => 'All', 'order' => 1, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'porotta', 'name' => 'Porotta', 'order' => 2, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'biriyani', 'name' => 'Biriyani', 'order' => 3, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'fried-items', 'name' => 'Fried Items', 'order' => 4, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'snacks', 'name' => 'Snacks', 'order' => 5, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'burgers', 'name' => 'Burgers', 'order' => 6, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'drinks', 'name' => 'Drinks', 'order' => 7, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'combos', 'name' => 'Combos', 'order' => 8, 'active' => true, 'moduleId' => 'food'],
            ['id' => 'g-all', 'name' => 'All', 'order' => 1, 'active' => true, 'moduleId' => 'grocery'],
            ['id' => 'g-dairy', 'name' => 'Dairy & Eggs', 'order' => 2, 'active' => true, 'moduleId' => 'grocery'],
            ['id' => 'g-produce', 'name' => 'Produce', 'order' => 3, 'active' => true, 'moduleId' => 'grocery'],
            ['id' => 'g-pantry', 'name' => 'Pantry Staples', 'order' => 4, 'active' => true, 'moduleId' => 'grocery'],
            ['id' => 'ph-all', 'name' => 'All', 'order' => 1, 'active' => true, 'moduleId' => 'pharmacy'],
            ['id' => 'cos-all', 'name' => 'All', 'order' => 1, 'active' => true, 'moduleId' => 'cosmetics'],
            ['id' => 'st-all', 'name' => 'All', 'order' => 1, 'active' => true, 'moduleId' => 'stationery']
        ];
    }

    private static function getDefaultCurries(): array
    {
        return [
            [
                'id' => 'beef-chilli',
                'name' => 'Beef Chilli Gravy',
                'category' => 'Non-Veg',
                'spiceLevel' => 4,
                'price' => 40.00,
                'isDefault' => true,
                'available' => true,
                'description' => 'Spicy slow-cooked Kerala beef roast gravy with curry leaves.'
            ],
            [
                'id' => 'chicken-salna',
                'name' => 'Chicken Salna',
                'category' => 'Non-Veg',
                'spiceLevel' => 3,
                'price' => 30.00,
                'isDefault' => false,
                'available' => true,
                'description' => 'Classic roadside style aromatic chicken gravy infused with fennel and coconut.'
            ],
            [
                'id' => 'veg-kurma',
                'name' => 'Vegetable Kurma',
                'category' => 'Veg',
                'spiceLevel' => 2,
                'price' => 20.00,
                'isDefault' => false,
                'available' => true,
                'description' => 'Creamy coconut-cashew vegetable curry with garden peas and carrots.'
            ]
        ];
    }

    private static function getDefaultProducts(): array
    {
        return [
            [
                'id' => 'cheeseburger-wendy',
                'name' => 'Cheeseburger Wendy\'s Burger',
                'subtitle' => 'The Cheeseburger Wendy\'s Burger with cheddar sauce and hot seasoning.',
                'categoryId' => 'burgers',
                'price' => 8.24,
                'rating' => 4.9,
                'reviewCount' => 184,
                'prepTime' => '20 mins',
                'calories' => '450 Cal',
                'description' => 'The Cheeseburger Wendy\'s Burger is a signature burger with a juicy beef patty, cheddar sauce, crisp lettuce, red onions, fresh tomato, and hot seasoning.',
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
                'spicyLevel' => 45,
                'portionWeight' => '240g',
                'isVeg' => false,
                'popular' => true,
                'featured' => true,
                'available' => true,
                'sortOrder' => 1
            ],
            [
                'id' => 'kerala-porotta-set',
                'name' => 'Kerala Flaky Porotta (Set of 3)',
                'subtitle' => 'Golden flaky layered Malabar porotta served hot with signature salna.',
                'categoryId' => 'porotta',
                'price' => 4.50,
                'rating' => 5.0,
                'reviewCount' => 342,
                'prepTime' => '10 mins',
                'calories' => '380 Cal',
                'description' => 'Crispy and layered golden parottas beaten fresh on the tawa.',
                'image' => 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
                'spicyLevel' => 20,
                'portionWeight' => '300g',
                'isVeg' => true,
                'popular' => true,
                'featured' => true,
                'available' => true,
                'sortOrder' => 2,
                'curryConfig' => [
                    'enabled' => true,
                    'title' => 'Select Free Salna / Curry',
                    'defaultCurryId' => 'beef-chilli',
                    'allowNone' => false
                ]
            ]
        ];
    }
}
