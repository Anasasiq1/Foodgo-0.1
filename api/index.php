<?php
/**
 * Foodgo Gourmet Ordering Platform - REST API (PHP Backend)
 * Handles JSON endpoints for both customer ordering and admin management.
 */

define('FOODGO_ACCESS', true);
header('Content-Type: application/json; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/config.php';

// Check if configured
if (!file_exists($configFile)) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Application is not installed. Please run install.php.']);
    exit;
}

$config = include($configFile);

// Establish Database Connection
try {
    $db = $config['database'] ?? [];
    $dsn = "mysql:host={$db['host']};port={$db['port']};dbname={$db['database']};charset={$db['charset']}";
    $pdo = new PDO($dsn, $db['username'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Request path parsing
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// Strip /api prefix
$route = preg_replace('#^/api#', '', $path);
if ($route === '') $route = '/';

// ==============================================================================
// 1. PRODUCTS API
// ==============================================================================
if (preg_match('#^/products/?$#', $route) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `products` ORDER BY `sort_order` ASC, `created_at` DESC");
    $products = $stmt->fetchAll();
    
    // Attach option groups for each product
    foreach ($products as &$prod) {
        $prod['available'] = (bool)$prod['available'];
        $prod['featured'] = (bool)$prod['featured'];
        $prod['popular'] = (bool)$prod['popular'];
        $prod['isVeg'] = (bool)$prod['is_veg'];
        $prod['price'] = (float)$prod['price'];
        $prod['rating'] = (float)$prod['rating'];
        $prod['reviewCount'] = (int)$prod['review_count'];
        $prod['prepTime'] = $prod['prep_time'];
        $prod['spicyLevel'] = (int)$prod['spicy_level'];
        $prod['portionWeight'] = $prod['portion_weight'];

        // Option groups
        $ogStmt = $pdo->prepare("SELECT * FROM `product_option_groups` WHERE `product_id` = :pid ORDER BY `sort_order` ASC");
        $ogStmt->execute([':pid' => $prod['id']]);
        $groups = $ogStmt->fetchAll();

        foreach ($groups as &$grp) {
            $grp['required'] = (bool)$grp['required'];
            $grp['minSelections'] = (int)$grp['min_selections'];
            $grp['maxSelections'] = (int)$grp['max_selections'];
            $grp['selectionType'] = $grp['selection_type'];

            $optStmt = $pdo->prepare("SELECT * FROM `product_options` WHERE `group_id` = :gid ORDER BY `sort_order` ASC");
            $optStmt->execute([':gid' => $grp['id']]);
            $opts = $optStmt->fetchAll();
            foreach ($opts as &$o) {
                $o['price'] = (float)$o['price'];
                $o['available'] = (bool)$o['available'];
                $o['isDefault'] = (bool)$o['is_default'];
                $o['priceType'] = $o['price_type'];
            }
            $grp['options'] = $opts;
        }
        $prod['optionGroups'] = $groups;
    }

    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

// ==============================================================================
// 2. CATEGORIES API
// ==============================================================================
if (preg_match('#^/categories/?$#', $route) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `categories` WHERE `active` = 1 ORDER BY `sort_order` ASC");
    $categories = $stmt->fetchAll();
    echo json_encode(['success' => true, 'categories' => $categories]);
    exit;
}

// ==============================================================================
// 3. STORE SETTINGS & PAYMENT SETTINGS
// ==============================================================================
if (preg_match('#^/payment-settings/?$#', $route) && $method === 'GET') {
    $stmt = $pdo->prepare("SELECT `setting_value` FROM `site_settings` WHERE `setting_key` = 'payment_settings'");
    $stmt->execute();
    $row = $stmt->fetch();
    $paymentSettings = $row ? json_decode($row['setting_value'], true) : [];
    echo json_encode(['success' => true, 'paymentSettings' => $paymentSettings]);
    exit;
}

if (preg_match('#^/settings/?$#', $route) && $method === 'GET') {
    $stmt = $pdo->prepare("SELECT `setting_key`, `setting_value` FROM `site_settings`");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    $storeInfo = isset($rows['store_info']) ? json_decode($rows['store_info'], true) : [];
    $paymentSettings = isset($rows['payment_settings']) ? json_decode($rows['payment_settings'], true) : [];
    $storeInfo['paymentSettings'] = $paymentSettings;

    echo json_encode(['success' => true, 'settings' => $storeInfo]);
    exit;
}

// ==============================================================================
// 4. ORDERS API (Create Order & List Orders)
// ==============================================================================
if (preg_match('#^/orders/?$#', $route) && $method === 'POST') {
    $orderNumber = $input['orderNumber'] ?? ('FD-' . strtoupper(substr(uniqid(), -6)));
    $orderId = 'ord-' . time() . '-' . rand(100, 999);
    
    $customerName = trim($input['customerName'] ?? 'Customer');
    $customerEmail = trim($input['customerEmail'] ?? 'customer@example.com');
    $customerPhone = trim($input['customerPhone'] ?? '+91 9876543210');
    $deliveryAddress = trim($input['deliveryAddress'] ?? 'Kochi, Kerala');

    $subtotal = floatval($input['subtotal'] ?? 0);
    $tax = floatval($input['tax'] ?? 0);
    $deliveryFee = floatval($input['deliveryFee'] ?? 0);
    $total = floatval($input['total'] ?? 0);
    $paymentMethod = $input['paymentMethod'] ?? 'Cash on Delivery';
    $paymentStatus = $input['paymentStatus'] ?? 'Pending';
    $orderStatus = 'Confirmed';
    $notes = $input['notes'] ?? '';

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO `orders` (`id`, `order_number`, `customer_name`, `customer_email`, `customer_phone`, `delivery_address`, `subtotal`, `tax`, `delivery_fee`, `total`, `payment_method`, `payment_status`, `order_status`, `notes`, `created_at`)
            VALUES (:id, :num, :cname, :cemail, :cphone, :addr, :subtotal, :tax, :fee, :total, :pmethod, :pstatus, :ostatus, :notes, NOW())
        ");
        $stmt->execute([
            ':id' => $orderId,
            ':num' => $orderNumber,
            ':cname' => $customerName,
            ':cemail' => $customerEmail,
            ':cphone' => $customerPhone,
            ':addr' => $deliveryAddress,
            ':subtotal' => $subtotal,
            ':tax' => $tax,
            ':fee' => $deliveryFee,
            ':total' => $total,
            ':pmethod' => $paymentMethod,
            ':pstatus' => $paymentStatus,
            ':ostatus' => $orderStatus,
            ':notes' => $notes,
        ]);

        // Insert Order Items
        if (!empty($input['items']) && is_array($input['items'])) {
            $itemStmt = $pdo->prepare("
                INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_image`, `quantity`, `unit_price`, `total_price`, `customization_json`)
                VALUES (:id, :order_id, :pid, :pname, :pimg, :qty, :uprice, :tprice, :cjson)
            ");
            foreach ($input['items'] as $idx => $item) {
                $itemStmt->execute([
                    ':id' => 'item-' . time() . '-' . $idx,
                    ':order_id' => $orderId,
                    ':pid' => $item['productId'] ?? null,
                    ':pname' => $item['name'] ?? 'Product',
                    ':pimg' => $item['image'] ?? '',
                    ':qty' => intval($item['quantity'] ?? 1),
                    ':uprice' => floatval($item['price'] ?? 0),
                    ':tprice' => floatval(($item['price'] ?? 0) * ($item['quantity'] ?? 1)),
                    ':cjson' => json_encode($item['customization'] ?? null),
                ]);
            }
        }

        $pdo->commit();
        echo json_encode([
            'success' => true,
            'order' => [
                'id' => $orderId,
                'orderNumber' => $orderNumber,
                'total' => $total,
                'status' => $orderStatus,
            ]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to place order: ' . $e->getMessage()]);
    }
    exit;
}

if (preg_match('#^/orders/?$#', $route) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `orders` ORDER BY `created_at` DESC LIMIT 100");
    $orders = $stmt->fetchAll();

    foreach ($orders as &$ord) {
        $ord['subtotal'] = (float)$ord['subtotal'];
        $ord['tax'] = (float)$ord['tax'];
        $ord['deliveryFee'] = (float)$ord['delivery_fee'];
        $ord['total'] = (float)$ord['total'];
        $ord['orderNumber'] = $ord['order_number'];
        $ord['customerName'] = $ord['customer_name'];
        $ord['customerEmail'] = $ord['customer_email'];
        $ord['customerPhone'] = $ord['customer_phone'];
        $ord['deliveryAddress'] = $ord['delivery_address'];
        $ord['paymentMethod'] = $ord['payment_method'];
        $ord['paymentStatus'] = $ord['payment_status'];
        $ord['orderStatus'] = $ord['order_status'];

        $itemStmt = $pdo->prepare("SELECT * FROM `order_items` WHERE `order_id` = :oid");
        $itemStmt->execute([':oid' => $ord['id']]);
        $items = $itemStmt->fetchAll();
        foreach ($items as &$itm) {
            $itm['unitPrice'] = (float)$itm['unit_price'];
            $itm['totalPrice'] = (float)$itm['total_price'];
            $itm['quantity'] = (int)$itm['quantity'];
            $itm['customization'] = json_decode($itm['customization_json'] ?? 'null', true);
        }
        $ord['items'] = $items;
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

// ==============================================================================
// 5. CUSTOMER SUPPORT & VOICE NOTES API
// ==============================================================================
if (preg_match('#^/support/?$#', $route) && $method === 'GET') {
    $email = $_GET['email'] ?? 'customer@example.com';
    $stmt = $pdo->prepare("SELECT * FROM `support_conversations` WHERE `customer_email` = :email ORDER BY `updated_at` DESC LIMIT 1");
    $stmt->execute([':email' => $email]);
    $conv = $stmt->fetch();

    $messages = [];
    if ($conv) {
        $msgStmt = $pdo->prepare("SELECT * FROM `support_messages` WHERE `conversation_id` = :cid ORDER BY `timestamp_ms` ASC");
        $msgStmt->execute([':cid' => $conv['id']]);
        $rawMsgs = $msgStmt->fetchAll();
        foreach ($rawMsgs as $m) {
            $messages[] = [
                'id' => $m['id'],
                'sender' => $m['sender'],
                'senderName' => $m['sender_name'],
                'messageType' => $m['message_type'],
                'text' => $m['text'],
                'audioUrl' => $m['audio_url'],
                'audioDuration' => (float)$m['audio_duration'],
                'imageUrl' => $m['image_url'],
                'time' => $m['time_str'],
                'timestamp' => (int)$m['timestamp_ms'],
                'isRead' => (bool)$m['is_read'],
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'conversation' => $conv,
        'messages' => $messages,
        'unreadCount' => $conv ? (int)$conv['unread_count_customer'] : 0,
    ]);
    exit;
}

if (preg_match('#^/support/?$#', $route) && $method === 'POST') {
    $sender = $input['sender'] ?? 'user';
    $senderName = $input['senderName'] ?? 'Customer';
    $customerEmail = $input['customerEmail'] ?? 'customer@example.com';
    $text = $input['text'] ?? '';
    $messageType = $input['messageType'] ?? 'text';
    $audioUrl = $input['audioUrl'] ?? null;
    $audioDuration = isset($input['audioDuration']) ? floatval($input['audioDuration']) : null;
    $orderNumber = $input['orderNumber'] ?? null;
    $timeStr = date('g:i A');
    $timestampMs = round(microtime(true) * 1000);

    // Find or create conversation
    $stmt = $pdo->prepare("SELECT * FROM `support_conversations` WHERE `customer_email` = :email LIMIT 1");
    $stmt->execute([':email' => $customerEmail]);
    $conv = $stmt->fetch();

    $pdo->beginTransaction();
    try {
        if (!$conv) {
            $convId = 'conv-' . time() . '-' . rand(100, 999);
            $cStmt = $pdo->prepare("
                INSERT INTO `support_conversations` (`id`, `customer_name`, `customer_email`, `customer_avatar`, `order_number`, `status`, `last_message`, `unread_count_admin`, `created_at`, `updated_at`)
                VALUES (:id, :name, :email, :avatar, :order_num, 'Open', :last_msg, 1, NOW(), NOW())
            ");
            $cStmt->execute([
                ':id' => $convId,
                ':name' => $senderName,
                ':email' => $customerEmail,
                ':avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                ':order_num' => $orderNumber,
                ':last_msg' => $messageType === 'audio' ? '🎤 Voice message' : $text,
            ]);
        } else {
            $convId = $conv['id'];
            $uStmt = $pdo->prepare("
                UPDATE `support_conversations`
                SET `last_message` = :last_msg, `status` = 'Open', `unread_count_admin` = `unread_count_admin` + 1, `updated_at` = NOW()
                WHERE `id` = :id
            ");
            $uStmt->execute([
                ':last_msg' => $messageType === 'audio' ? '🎤 Voice message' : $text,
                ':id' => $convId,
            ]);
        }

        // Insert message
        $msgId = 'msg-' . time() . '-' . rand(1000, 9999);
        $mStmt = $pdo->prepare("
            INSERT INTO `support_messages` (`id`, `conversation_id`, `sender`, `sender_name`, `message_type`, `text`, `audio_url`, `audio_duration`, `time_str`, `timestamp_ms`, `created_at`)
            VALUES (:id, :cid, :sender, :sname, :mtype, :text, :aurl, :adur, :tstr, :tms, NOW())
        ");
        $mStmt->execute([
            ':id' => $msgId,
            ':cid' => $convId,
            ':sender' => $sender,
            ':sname' => $senderName,
            ':mtype' => $messageType,
            ':text' => $text,
            ':aurl' => $audioUrl,
            ':adur' => $audioDuration,
            ':tstr' => $timeStr,
            ':tms' => $timestampMs,
        ]);

        $pdo->commit();
        echo json_encode([
            'success' => true,
            'message' => [
                'id' => $msgId,
                'sender' => $sender,
                'senderName' => $senderName,
                'messageType' => $messageType,
                'text' => $text,
                'audioUrl' => $audioUrl,
                'audioDuration' => $audioDuration,
                'time' => $timeStr,
                'timestamp' => $timestampMs,
            ]
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ==============================================================================
// 6. ADMIN AUTHENTICATION
// ==============================================================================
if (preg_match('#^/admin/login/?$#', $route) && $method === 'POST') {
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM `admins` WHERE `username` = :u OR `email` = :u LIMIT 1");
    $stmt->execute([':u' => $username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 86400 * 7);

        $sStmt = $pdo->prepare("INSERT INTO `admin_sessions` (`token`, `admin_id`, `username`, `expires_at`) VALUES (:t, :aid, :u, :exp)");
        $sStmt->execute([
            ':t' => $token,
            ':aid' => $admin['id'],
            ':u' => $admin['username'],
            ':exp' => $expiresAt,
        ]);

        setcookie('foodgo_admin_token', $token, [
            'expires' => time() + 86400 * 7,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        echo json_encode([
            'success' => true,
            'admin' => [
                'username' => $admin['username'],
                'name' => $admin['name'],
                'role' => $admin['role'],
                'email' => $admin['email'],
            ],
            'token' => $token,
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid admin username or password.']);
    }
    exit;
}

// Admin logout
if (preg_match('#^/admin/logout/?$#', $route) && $method === 'POST') {
    $token = $_COOKIE['foodgo_admin_token'] ?? '';
    if ($token) {
        $stmt = $pdo->prepare("DELETE FROM `admin_sessions` WHERE `token` = :t");
        $stmt->execute([':t' => $token]);
    }
    setcookie('foodgo_admin_token', '', ['expires' => time() - 3600, 'path' => '/']);
    echo json_encode(['success' => true]);
    exit;
}

// ==============================================================================
// 7. ADMIN DASHBOARD STATS
// ==============================================================================
if (preg_match('#^/admin/dashboard/?$#', $route) && $method === 'GET') {
    $revStmt = $pdo->query("SELECT COALESCE(SUM(`total`), 0) as `total_revenue`, COUNT(*) as `total_orders` FROM `orders`");
    $revData = $revStmt->fetch();

    $custStmt = $pdo->query("SELECT COUNT(DISTINCT `customer_email`) as `total_customers` FROM `orders`");
    $custData = $custStmt->fetch();

    $recStmt = $pdo->query("SELECT * FROM `orders` ORDER BY `created_at` DESC LIMIT 6");
    $recentOrders = $recStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalRevenue' => (float)$revData['total_revenue'],
            'totalOrders' => (int)$revData['total_orders'],
            'totalCustomers' => (int)$custData['total_customers'],
            'recentOrders' => $recentOrders,
        ]
    ]);
    exit;
}

// Default Fallback
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found: ' . $route]);
