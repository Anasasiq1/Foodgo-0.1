<?php
/**
 * Foodgo Gourmet Ordering Platform - Web Installation Wizard
 * Dual Language Support: English & Malayalam (മലയാളം)
 * 
 * Supports automated MySQL database creation, schema & seed execution,
 * secure admin password hashing, config file generation, and installer lock.
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

define('FOODGO_INSTALLER', true);

$baseDir = __DIR__;
$lockFile = $baseDir . '/storage/installed.lock';
$configFile = $baseDir . '/config/config.php';

// Check if already installed
$isInstalled = file_exists($lockFile) || (file_exists($configFile) && @include($configFile)['installed'] === true);

// ==============================================================================
// AJAX API HANDLERS
// ==============================================================================
if (isset($_GET['action'])) {
    header('Content-Type: application/json; charset=utf-8');

    if ($isInstalled && $_GET['action'] !== 'status') {
        echo json_encode(['success' => false, 'error' => 'Foodgo is already installed. Installer is locked.']);
        exit;
    }

    $action = $_GET['action'];

    if ($action === 'status') {
        echo json_encode(['installed' => $isInstalled]);
        exit;
    }

    if ($action === 'check_requirements') {
        $phpVersion = phpversion();
        $phpOk = version_compare($phpVersion, '7.4.0', '>=');

        $extPdo = extension_loaded('pdo');
        $extPdoMysql = extension_loaded('pdo_mysql');
        $extJson = extension_loaded('json');
        $extMbstring = extension_loaded('mbstring');
        $extOpenssl = extension_loaded('openssl');
        $extFileinfo = extension_loaded('fileinfo');
        $extCurl = extension_loaded('curl');
        $extGd = extension_loaded('gd') || extension_loaded('imagick');
        $extSession = session_status() !== PHP_SESSION_DISABLED;

        // Directory writability
        $configWritable = is_writable($baseDir . '/config') || (!file_exists($baseDir . '/config') && is_writable($baseDir));
        $storageWritable = is_writable($baseDir . '/storage') || (!file_exists($baseDir . '/storage') && is_writable($baseDir));
        $uploadsWritable = is_writable($baseDir . '/uploads') || (!file_exists($baseDir . '/uploads') && is_writable($baseDir));

        $allPassed = $phpOk && $extPdo && $extPdoMysql && $extJson && $extMbstring && $extOpenssl && $configWritable && $storageWritable;

        echo json_encode([
            'success' => true,
            'all_passed' => $allPassed,
            'requirements' => [
                'php_version' => ['name' => 'PHP Version (>= 7.4)', 'current' => $phpVersion, 'passed' => $phpOk, 'critical' => true],
                'pdo' => ['name' => 'PDO Extension', 'passed' => $extPdo, 'critical' => true],
                'pdo_mysql' => ['name' => 'PDO MySQL Driver', 'passed' => $extPdoMysql, 'critical' => true],
                'json' => ['name' => 'JSON Extension', 'passed' => $extJson, 'critical' => true],
                'mbstring' => ['name' => 'Mbstring Extension', 'passed' => $extMbstring, 'critical' => true],
                'openssl' => ['name' => 'OpenSSL Extension', 'passed' => $extOpenssl, 'critical' => true],
                'fileinfo' => ['name' => 'Fileinfo Extension', 'passed' => $extFileinfo, 'critical' => false],
                'curl' => ['name' => 'cURL Extension', 'passed' => $extCurl, 'critical' => false],
                'gd' => ['name' => 'GD / Imagick (Image Support)', 'passed' => $extGd, 'critical' => false],
                'session' => ['name' => 'Session Support', 'passed' => $extSession, 'critical' => true],
                'dir_config' => ['name' => 'config/ Directory Writable', 'passed' => $configWritable, 'critical' => true],
                'dir_storage' => ['name' => 'storage/ Directory Writable', 'passed' => $storageWritable, 'critical' => true],
                'dir_uploads' => ['name' => 'uploads/ Directory Writable', 'passed' => $uploadsWritable, 'critical' => false],
            ]
        ]);
        exit;
    }

    if ($action === 'test_db') {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $host = trim($input['db_host'] ?? 'localhost');
        $port = intval($input['db_port'] ?? 3306);
        $dbname = trim($input['db_name'] ?? '');
        $user = trim($input['db_user'] ?? '');
        $pass = $input['db_pass'] ?? '';

        if (!$dbname || !$user) {
            echo json_encode(['success' => false, 'error' => 'Database name and username are required.']);
            exit;
        }

        try {
            // Test connection to MySQL server
            $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);

            // Check if DB exists, try creating if not
            $stmt = $pdo->query("SHOW DATABASES LIKE " . $pdo->quote($dbname));
            $exists = $stmt->fetch();

            if (!$exists) {
                try {
                    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'error' => "Database '{$dbname}' does not exist and user lacks permission to create it. Please create the database in aaPanel/cPanel first."]);
                    exit;
                }
            }

            // Connect to specific DB
            $pdo->exec("USE `{$dbname}`");

            // Check if existing Foodgo tables exist
            $tblStmt = $pdo->query("SHOW TABLES LIKE 'products'");
            $hasTables = (bool)$tblStmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'Database connection successful!',
                'has_existing_tables' => $hasTables
            ]);
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            // Sanitize message to avoid exposing raw passwords
            if (strpos($msg, 'Access denied') !== false) {
                $error = 'Access denied: Please verify your Database Username and Password.';
            } elseif (strpos($msg, 'Connection refused') !== false || strpos($msg, 'Can\'t connect') !== false) {
                $error = 'Could not connect to MySQL server. Please verify Database Host and Port.';
            } elseif (strpos($msg, 'Unknown database') !== false) {
                $error = "Database '{$dbname}' not found. Please create it in your hosting control panel.";
            } else {
                $error = 'Database connection failed. Please verify credentials.';
            }
            echo json_encode(['success' => false, 'error' => $error]);
        }
        exit;
    }

    if ($action === 'install') {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $dbHost = trim($input['db_host'] ?? 'localhost');
        $dbPort = intval($input['db_port'] ?? 3306);
        $dbName = trim($input['db_name'] ?? '');
        $dbUser = trim($input['db_user'] ?? '');
        $dbPass = $input['db_pass'] ?? '';

        $adminUser = trim($input['admin_username'] ?? '');
        $adminEmail = trim($input['admin_email'] ?? '');
        $adminPass = $input['admin_password'] ?? '';
        $adminPassConfirm = $input['admin_password_confirm'] ?? '';

        $appName = trim($input['app_name'] ?? 'Foodgo');
        $appUrl = rtrim(trim($input['app_url'] ?? ''), '/');
        $currency = trim($input['currency'] ?? 'INR (₹)');
        $timezone = trim($input['timezone'] ?? 'Asia/Kolkata');

        $upiId = trim($input['upi_id'] ?? 'foodgo@upi');
        $upiMerchant = trim($input['upi_merchant'] ?? 'Foodgo Foods Pvt Ltd');
        $upiQrUrl = trim($input['upi_qr_url'] ?? '');

        // Validations
        if (!$dbName || !$dbUser) {
            echo json_encode(['success' => false, 'error' => 'Database credentials are required.']);
            exit;
        }

        if (strlen($adminUser) < 3) {
            echo json_encode(['success' => false, 'error' => 'Admin username must be at least 3 characters.']);
            exit;
        }

        if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Please provide a valid administrator email address.']);
            exit;
        }

        if (strlen($adminPass) < 6) {
            echo json_encode(['success' => false, 'error' => 'Admin password must be at least 6 characters.']);
            exit;
        }

        if ($adminPass !== $adminPassConfirm) {
            echo json_encode(['success' => false, 'error' => 'Admin password and confirmation do not match.']);
            exit;
        }

        if (!$appUrl) {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
            $appUrl = $protocol . ($_SERVER['HTTP_HOST'] ?? 'localhost');
        }

        try {
            // 1. Establish PDO Connection
            $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

            // 2. Read and execute schema.sql
            $schemaFile = $baseDir . '/database/schema.sql';
            if (!file_exists($schemaFile)) {
                throw new Exception('Database schema file database/schema.sql not found.');
            }

            $schemaSql = file_get_contents($schemaFile);
            $statements = array_filter(array_map('trim', explode(';', $schemaSql)));

            foreach ($statements as $stmt) {
                if ($stmt) {
                    $pdo->exec($stmt);
                }
            }

            // 3. Read and execute seed.sql
            $seedFile = $baseDir . '/database/seed.sql';
            if (file_exists($seedFile)) {
                $seedSql = file_get_contents($seedFile);
                $seedStatements = array_filter(array_map('trim', explode(';', $seedSql)));
                foreach ($seedStatements as $stmt) {
                    if ($stmt) {
                        try {
                            $pdo->exec($stmt);
                        } catch (Exception $e) {
                            // Ignore duplicates on seed
                        }
                    }
                }
            }

            // 4. Create Administrator Account with Secure Bcrypt Hash
            $adminPasswordHash = password_hash($adminPass, PASSWORD_BCRYPT, ['cost' => 10]);

            $adminStmt = $pdo->prepare("
                INSERT INTO `admins` (`username`, `email`, `password_hash`, `name`, `role`, `created_at`, `updated_at`)
                VALUES (:username, :email, :pass, :name, 'Super Admin', NOW(), NOW())
                ON DUPLICATE KEY UPDATE `password_hash` = :pass2, `email` = :email2
            ");
            $adminStmt->execute([
                ':username' => $adminUser,
                ':email' => $adminEmail,
                ':pass' => $adminPasswordHash,
                ':name' => ucfirst($adminUser),
                ':pass2' => $adminPasswordHash,
                ':email2' => $adminEmail,
            ]);

            // 5. Update Site Settings with user choices
            $storeInfo = json_encode([
                'storeName' => $appName,
                'storeOpen' => true,
                'deliveryFee' => 2.00,
                'taxRate' => 0.08,
                'minOrder' => 5.00,
                'currency' => $currency,
                'contactEmail' => $adminEmail,
                'contactPhone' => '+91 98765 43210',
                'address' => 'Foodgo Gourmet Kitchens, High Street, Kerala',
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $paymentSettings = json_encode([
                'upi' => [
                    'enabled' => true,
                    'upiId' => $upiId,
                    'merchantName' => $upiMerchant,
                    'qrCodeUrl' => $upiQrUrl,
                    'allowManualVerification' => true,
                ],
                'card' => [
                    'enabled' => true,
                    'provider' => 'mock',
                    'publishableKey' => '',
                ],
                'cod' => [
                    'enabled' => true,
                    'maxAmount' => 1000,
                    'additionalFee' => 0,
                ]
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $settingsStmt = $pdo->prepare("
                INSERT INTO `site_settings` (`setting_key`, `setting_value`, `updated_at`)
                VALUES (:key1, :val1, NOW()), (:key2, :val2, NOW())
                ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`), `updated_at` = NOW()
            ");
            $settingsStmt->execute([
                ':key1' => 'store_info',
                ':val1' => $storeInfo,
                ':key2' => 'payment_settings',
                ':val2' => $paymentSettings,
            ]);

            // 6. Generate Cryptographic Application Secret
            $appSecret = bin2hex(random_bytes(32));

            // 7. Write config/config.php
            if (!is_dir($baseDir . '/config')) {
                @mkdir($baseDir . '/config', 0755, true);
            }

            $escapedDbPass = addcslashes($dbPass, "'\\");
            $escapedSecret = addcslashes($appSecret, "'\\");
            $escapedAppName = addcslashes($appName, "'\\");
            $escapedAppUrl = addcslashes($appUrl, "'\\");
            $escapedCurrency = addcslashes($currency, "'\\");
            $escapedTimezone = addcslashes($timezone, "'\\");

            $configContent = "<?php\n"
                . "/**\n"
                . " * Foodgo Gourmet Ordering Platform - Production Config\n"
                . " * Automatically generated by Foodgo Web Installer on " . date('Y-m-d H:i:s') . "\n"
                . " */\n\n"
                . "if (!defined('FOODGO_ACCESS')) {\n"
                . "    define('FOODGO_ACCESS', true);\n"
                . "}\n\n"
                . "return [\n"
                . "    'app' => [\n"
                . "        'name'        => '{$escapedAppName}',\n"
                . "        'url'         => '{$escapedAppUrl}',\n"
                . "        'env'         => 'production',\n"
                . "        'debug'       => false,\n"
                . "        'secret'      => '{$escapedSecret}',\n"
                . "        'timezone'    => '{$escapedTimezone}',\n"
                . "        'currency'    => '{$escapedCurrency}',\n"
                . "    ],\n"
                . "    'database' => [\n"
                . "        'host'        => '{$dbHost}',\n"
                . "        'port'        => {$dbPort},\n"
                . "        'database'    => '{$dbName}',\n"
                . "        'username'    => '{$dbUser}',\n"
                . "        'password'    => '{$escapedDbPass}',\n"
                . "        'charset'     => 'utf8mb4',\n"
                . "        'collation'   => 'utf8mb4_unicode_ci',\n"
                . "    ],\n"
                . "    'upload' => [\n"
                . "        'max_size_mb' => 15,\n"
                . "        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],\n"
                . "        'allowed_audio_types' => ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'],\n"
                . "    ],\n"
                . "    'installed' => true,\n"
                . "];\n";

            file_put_contents($configFile, $configContent);
            @chmod($configFile, 0640);

            // 8. Generate .env file for Node.js / Server environments
            $envContent = "# Foodgo Environment Configuration\n"
                . "APP_NAME=\"{$appName}\"\n"
                . "APP_URL=\"{$appUrl}\"\n"
                . "APP_ENV=production\n"
                . "APP_SECRET=\"{$appSecret}\"\n"
                . "PORT=3000\n\n"
                . "# Database Configuration\n"
                . "DB_HOST=\"{$dbHost}\"\n"
                . "DB_PORT={$dbPort}\n"
                . "DB_DATABASE=\"{$dbName}\"\n"
                . "DB_USERNAME=\"{$dbUser}\"\n"
                . "DB_PASSWORD=\"{$dbPass}\"\n\n"
                . "# Store & UPI Settings\n"
                . "UPI_ID=\"{$upiId}\"\n"
                . "UPI_MERCHANT_NAME=\"{$upiMerchant}\"\n";

            file_put_contents($baseDir . '/.env', $envContent);

            // 9. Write storage/installed.lock
            if (!is_dir($baseDir . '/storage')) {
                @mkdir($baseDir . '/storage', 0755, true);
            }

            $lockData = json_encode([
                'installed_at' => date('c'),
                'installed_by' => $adminUser,
                'app_name' => $appName,
                'app_url' => $appUrl,
                'php_version' => phpversion(),
            ], JSON_PRETTY_PRINT);
            file_put_contents($lockFile, $lockData);

            // 10. Audit Log
            try {
                $auditStmt = $pdo->prepare("
                    INSERT INTO `admin_activity_logs` (`id`, `action`, `details`, `admin_username`, `ip_address`, `created_at`)
                    VALUES (:id, 'INSTALLATION', 'Foodgo application installed successfully', :admin, :ip, NOW())
                ");
                $auditStmt->execute([
                    ':id' => 'log-' . time(),
                    ':admin' => $adminUser,
                    ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                ]);
            } catch (Exception $e) {}

            echo json_encode([
                'success' => true,
                'message' => 'Foodgo installed successfully!',
                'admin_username' => $adminUser,
                'app_url' => $appUrl,
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Installation error: ' . $e->getMessage()]);
        }
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foodgo Installation Wizard | Foodgo ഇൻസ്റ്റലേഷൻ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Manjari:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              DEFAULT: '#EF2A39',
              dark: '#D81C2B',
              surface: '#FFF8F8',
            },
            dark: '#322A2E',
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Manjari', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: #F8F9FA;
      color: #322A2E;
      font-family: "Plus Jakarta Sans", "Manjari", sans-serif;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #F1F1F1;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 4px;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between antialiased selection:bg-[#EF2A39] selection:text-white">

  <!-- Top Navigation Header -->
  <header class="w-full bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
    <div class="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <!-- Logo Branding -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#EF2A39] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(239,42,57,0.3)]">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5Z"/>
            <path d="M3 13h18a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2Z"/>
            <circle cx="7" cy="16" r="1"/>
            <circle cx="12" cy="16" r="1"/>
            <circle cx="17" cy="16" r="1"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-black text-[#322A2E] tracking-tight flex items-center gap-2">
            Foodgo
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-red-50 text-[#EF2A39] rounded-md border border-red-100">Installer</span>
          </h1>
          <p class="text-[11px] text-gray-500 font-semibold" data-i18n="header_sub">Gourmet Food Ordering Platform</p>
        </div>
      </div>

      <!-- Language Switcher & Help Link -->
      <div class="flex items-center gap-2.5">
        <div class="bg-[#F4F5F7] p-1 rounded-xl flex items-center border border-gray-200/70">
          <button id="lang-en" onclick="setLang('en')" class="px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-white text-[#322A2E] shadow-xs">
            English
          </button>
          <button id="lang-ml" onclick="setLang('ml')" class="px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer text-gray-500 hover:text-[#322A2E]">
            മലയാളം
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Wizard Area -->
  <main class="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">

    <?php if ($isInstalled): ?>
    <!-- 🛑 LOCKED NOTIFICATION SCREEN -->
    <div class="bg-white rounded-3xl border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.06)] p-8 sm:p-12 text-center max-w-xl mx-auto">
      <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-xs">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>

      <h2 class="text-xl sm:text-2xl font-black text-[#322A2E] mb-2" data-i18n="locked_title">
        Foodgo is Already Installed
      </h2>
      <p class="text-sm text-gray-600 font-medium mb-6 leading-relaxed" data-i18n="locked_desc">
        The application is already configured and the installation wizard has been locked for your security. To access your store, please visit the customer website or the admin panel.
      </p>

      <div class="p-4 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs text-amber-800 font-semibold mb-6 text-left flex items-start gap-3">
        <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong data-i18n="locked_rec_head">Security Recommendation:</strong>
          <p class="mt-0.5 text-amber-700" data-i18n="locked_rec_body">You may delete <code>install.php</code> from your File Manager / aaPanel for maximum production security.</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="index.php" class="w-full sm:w-auto px-6 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black shadow-[0_4px_14px_rgba(239,42,57,0.3)] transition-transform active:scale-95 text-center cursor-pointer" data-i18n="btn_open_site">
          Open Website
        </a>
        <a href="admin.php" class="w-full sm:w-auto px-6 py-3 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-2xl text-xs font-black shadow-xs transition-transform active:scale-95 text-center cursor-pointer" data-i18n="btn_open_admin">
          Open Admin Panel
        </a>
      </div>
    </div>
    <?php else: ?>

    <!-- WIZARD STEP CONTAINER -->
    <div class="bg-white rounded-3xl border border-gray-200/80 shadow-[0_6px_30px_rgba(0,0,0,0.05)] overflow-hidden">
      
      <!-- Progress Bar Steps -->
      <div class="px-6 py-4 bg-[#FAFBFD] border-b border-gray-100 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div id="step-nav-1" class="step-nav active flex items-center gap-2 text-xs font-black text-[#EF2A39]">
          <span class="w-6 h-6 rounded-full bg-[#EF2A39] text-white flex items-center justify-center text-[11px]">1</span>
          <span class="hidden sm:inline" data-i18n="step_1_name">Welcome</span>
        </div>
        <div class="w-4 h-[2px] bg-gray-200 shrink-0"></div>
        <div id="step-nav-2" class="step-nav flex items-center gap-2 text-xs font-black text-gray-400">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">2</span>
          <span class="hidden sm:inline" data-i18n="step_2_name">System</span>
        </div>
        <div class="w-4 h-[2px] bg-gray-200 shrink-0"></div>
        <div id="step-nav-3" class="step-nav flex items-center gap-2 text-xs font-black text-gray-400">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">3</span>
          <span class="hidden sm:inline" data-i18n="step_3_name">Database</span>
        </div>
        <div class="w-4 h-[2px] bg-gray-200 shrink-0"></div>
        <div id="step-nav-4" class="step-nav flex items-center gap-2 text-xs font-black text-gray-400">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">4</span>
          <span class="hidden sm:inline" data-i18n="step_4_name">Admin</span>
        </div>
        <div class="w-4 h-[2px] bg-gray-200 shrink-0"></div>
        <div id="step-nav-5" class="step-nav flex items-center gap-2 text-xs font-black text-gray-400">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">5</span>
          <span class="hidden sm:inline" data-i18n="step_5_name">Settings</span>
        </div>
        <div class="w-4 h-[2px] bg-gray-200 shrink-0"></div>
        <div id="step-nav-6" class="step-nav flex items-center gap-2 text-xs font-black text-gray-400">
          <span class="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">6</span>
          <span class="hidden sm:inline" data-i18n="step_6_name">Complete</span>
        </div>
      </div>

      <!-- Step Content Pages -->
      <div class="p-6 sm:p-10">

        <!-- ================================================================
             STEP 1: WELCOME
             ================================================================ -->
        <div id="step-page-1" class="step-page">
          <div class="max-w-xl mx-auto text-center">
            <div class="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-[#EF2A39] mx-auto mb-6 shadow-xs border border-red-100">
              <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a5 5 0 0 0-5 5v2h10V7a5 5 0 0 0-5-5Z"/>
                <path d="M3 13h18a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2Z"/>
              </svg>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-[#322A2E] mb-3 tracking-tight" data-i18n="welcome_title">
              Welcome to Foodgo Installation
            </h2>
            <p class="text-sm text-gray-600 font-medium mb-8 leading-relaxed" data-i18n="welcome_desc">
              Thank you for choosing Foodgo. This installation wizard will guide you through setting up your MySQL database, administrator account, store preferences, and instant payment settings in just a few clicks.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8 text-left">
              <div class="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                <div class="text-base font-black text-[#322A2E] mb-1">⚡ Quick Setup</div>
                <p class="text-xs text-gray-500 font-medium" data-i18n="feature_1_desc">Complete automated database and configuration setup in 2 minutes.</p>
              </div>
              <div class="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                <div class="text-base font-black text-[#322A2E] mb-1">🔒 Safe & Secure</div>
                <p class="text-xs text-gray-500 font-medium" data-i18n="feature_2_desc">Bcrypt password encryption and automated installation lock protection.</p>
              </div>
              <div class="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                <div class="text-base font-black text-[#322A2E] mb-1">🍔 Live Ordering</div>
                <p class="text-xs text-gray-500 font-medium" data-i18n="feature_3_desc">Ready with customizable burgers, combos, UPI QR, and chat support.</p>
              </div>
            </div>

            <button onclick="goToStep(2)" class="w-full sm:w-auto px-8 py-3.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black shadow-[0_4px_16px_rgba(239,42,57,0.35)] transition-transform active:scale-95 cursor-pointer" data-i18n="btn_start_install">
              Start Installation →
            </button>
          </div>
        </div>

        <!-- ================================================================
             STEP 2: SYSTEM REQUIREMENTS
             ================================================================ -->
        <div id="step-page-2" class="step-page hidden">
          <div class="max-w-2xl mx-auto">
            <div class="mb-6">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="req_title">System & Server Requirements</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="req_sub">Checking server environment, PHP extensions, and directory permissions.</p>
            </div>

            <!-- Requirements List -->
            <div id="req-loading" class="py-12 text-center text-xs font-bold text-gray-400">
              <div class="w-8 h-8 border-3 border-[#EF2A39] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Checking server capabilities...
            </div>

            <div id="req-container" class="space-y-2 mb-6 hidden">
              <!-- Dynamically populated -->
            </div>

            <div id="req-error-box" class="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold mb-6 hidden">
              <div class="flex items-start gap-2.5">
                <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div id="req-error-text" data-i18n="req_fix_notice">
                  Some critical server requirements were not met. Please enable the missing extensions or fix directory permissions in your hosting panel (aaPanel/cPanel), then click re-check.
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(1)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_back">
                ← Back
              </button>

              <div class="flex items-center gap-2">
                <button onclick="checkRequirements()" class="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_recheck">
                  🔄 Re-check
                </button>
                <button id="btn-req-next" onclick="goToStep(3)" disabled class="px-6 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black disabled:opacity-40 disabled:pointer-events-none transition-transform active:scale-95 shadow-xs cursor-pointer" data-i18n="btn_next">
                  Next Step →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================================================================
             STEP 3: DATABASE CONFIGURATION
             ================================================================ -->
        <div id="step-page-3" class="step-page hidden">
          <div class="max-w-xl mx-auto">
            <div class="mb-6">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="db_title">Database Configuration</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="db_sub">Enter your MySQL / MariaDB database credentials created in aaPanel or cPanel.</p>
            </div>

            <form id="form-db" onsubmit="event.preventDefault(); testDbConnection();" class="space-y-4 mb-6">
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_db_host">Database Host</label>
                  <input type="text" id="db_host" value="localhost" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_db_port">Port</label>
                  <input type="number" id="db_port" value="3306" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_db_name">Database Name</label>
                <input type="text" id="db_name" placeholder="e.g. foodgo_db" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_db_user">Database Username</label>
                <input type="text" id="db_user" placeholder="e.g. foodgo_user" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_db_pass">Database Password</label>
                <input type="password" id="db_pass" placeholder="Enter database user password" class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <!-- Test Result Status -->
              <div id="db-status-box" class="p-3.5 rounded-xl text-xs font-semibold hidden"></div>
            </form>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(2)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_back">
                ← Back
              </button>

              <div class="flex items-center gap-2">
                <button type="button" onclick="testDbConnection()" id="btn-test-db" class="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_test_db">
                  🔌 Test Connection
                </button>
                <button id="btn-db-next" onclick="goToStep(4)" disabled class="px-6 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black disabled:opacity-40 disabled:pointer-events-none transition-transform active:scale-95 shadow-xs cursor-pointer" data-i18n="btn_next">
                  Next Step →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================================================================
             STEP 4: ADMINISTRATOR ACCOUNT
             ================================================================ -->
        <div id="step-page-4" class="step-page hidden">
          <div class="max-w-xl mx-auto">
            <div class="mb-6">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="admin_title">Administrator Account Setup</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="admin_sub">Create your primary Super Admin account for managing Foodgo.</p>
            </div>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_admin_user">Admin Username</label>
                <input type="text" id="admin_username" placeholder="e.g. admin" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_admin_email">Admin Email</label>
                <input type="email" id="admin_email" placeholder="e.g. admin@yourdomain.com" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_admin_pass">Admin Password</label>
                <input type="password" id="admin_password" placeholder="Minimum 6 characters" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_admin_pass_confirm">Confirm Password</label>
                <input type="password" id="admin_password_confirm" placeholder="Re-type password" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div id="admin-error-box" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold hidden"></div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(3)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_back">
                ← Back
              </button>

              <button onclick="validateAdminStep()" class="px-6 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black transition-transform active:scale-95 shadow-xs cursor-pointer" data-i18n="btn_next">
                Next Step →
              </button>
            </div>
          </div>
        </div>

        <!-- ================================================================
             STEP 5: STORE & UPI SETTINGS
             ================================================================ -->
        <div id="step-page-5" class="step-page hidden">
          <div class="max-w-xl mx-auto">
            <div class="mb-6">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="settings_title">Store & Payment Settings</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="settings_sub">Configure store defaults and instant UPI / Google Pay QR payments.</p>
            </div>

            <div class="space-y-4 mb-6">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_app_name">Store Name</label>
                  <input type="text" id="app_name" value="Foodgo" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_currency">Currency</label>
                  <select id="currency" class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="AED (د.إ)">AED (د.إ)</option>
                    <option value="SAR (﷼)">SAR (﷼)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_app_url">Application Website URL</label>
                <input type="url" id="app_url" value="<?php echo (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost'); ?>" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200/80 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
              </div>

              <div class="p-4 bg-[#F8F9FA] rounded-2xl border border-gray-200/80 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-black text-[#322A2E] flex items-center gap-1.5">
                    <span>📱 UPI / Google Pay QR Setup</span>
                    <span class="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Instant</span>
                  </div>
                  <span class="text-[10px] text-gray-400 font-medium" data-i18n="upi_optional">Optional / Can edit later</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_upi_id">UPI ID / VPA</label>
                    <input type="text" id="upi_id" placeholder="foodgo@upi" value="foodgo@upi" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_merchant_name">Merchant Name</label>
                    <input type="text" id="upi_merchant" placeholder="Foodgo Foods Pvt Ltd" value="Foodgo Foods Pvt Ltd" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                </div>
              </div>

              <div id="install-error-box" class="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold hidden"></div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(4)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" data-i18n="btn_back">
                ← Back
              </button>

              <button type="button" id="btn-run-install" onclick="executeInstallation()" class="px-7 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black shadow-[0_4px_16px_rgba(239,42,57,0.35)] transition-transform active:scale-95 cursor-pointer flex items-center gap-2" data-i18n="btn_install_now">
                <span>Install Foodgo Now 🚀</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ================================================================
             STEP 6: COMPLETE / INSTALLATION FINISHED
             ================================================================ -->
        <div id="step-page-6" class="step-page hidden">
          <div class="max-w-xl mx-auto text-center">
            <div class="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-xs border border-emerald-100 animate-bounce">
              <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-[#322A2E] mb-2 tracking-tight" data-i18n="complete_title">
              Foodgo Installed Successfully!
            </h2>
            <p class="text-sm text-gray-600 font-medium mb-6 leading-relaxed" data-i18n="complete_desc">
              Your Foodgo application has been completely configured with database tables, seed products, admin security credentials, and application locks.
            </p>

            <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold mb-8 text-left space-y-2">
              <div class="flex items-center gap-2 font-black text-amber-900">
                <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                <span data-i18n="sec_lock_title">Security & Installation Lock Activated</span>
              </div>
              <p class="leading-relaxed" data-i18n="sec_lock_desc">
                1. <code>storage/installed.lock</code> has been created to prevent unauthorized re-installation.<br>
                2. <strong>Recommended:</strong> Please delete <code>install.php</code> from your hosting File Manager / aaPanel.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="index.php" class="w-full sm:w-auto px-7 py-3.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black shadow-[0_4px_16px_rgba(239,42,57,0.35)] transition-transform active:scale-95 text-center cursor-pointer" data-i18n="btn_open_site">
                Open Customer Website →
              </a>
              <a href="admin.php" class="w-full sm:w-auto px-7 py-3.5 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-2xl text-xs font-black shadow-xs transition-transform active:scale-95 text-center cursor-pointer" data-i18n="btn_open_admin">
                Open Admin Panel →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
    <?php endif; ?>

  </main>

  <!-- Footer -->
  <footer class="w-full bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400 font-medium">
    Foodgo &bull; Professional Food Ordering Platform &bull; PHP & Node.js Ready
  </footer>

  <!-- JS Logic & Internationalization -->
  <script>
    const i18nData = {
      en: {
        header_sub: "Gourmet Food Ordering Platform",
        locked_title: "Foodgo is Already Installed",
        locked_desc: "The application is already configured and the installation wizard has been locked for your security. To access your store, please visit the customer website or the admin panel.",
        locked_rec_head: "Security Recommendation:",
        locked_rec_body: "You may delete install.php from your File Manager / aaPanel for maximum production security.",
        btn_open_site: "Open Website",
        btn_open_admin: "Open Admin Panel",
        step_1_name: "Welcome",
        step_2_name: "System",
        step_3_name: "Database",
        step_4_name: "Admin",
        step_5_name: "Settings",
        step_6_name: "Complete",
        welcome_title: "Welcome to Foodgo Installation",
        welcome_desc: "Thank you for choosing Foodgo. This installation wizard will guide you through setting up your MySQL database, administrator account, store preferences, and instant payment settings in just a few clicks.",
        feature_1_desc: "Complete automated database and configuration setup in 2 minutes.",
        feature_2_desc: "Bcrypt password encryption and automated installation lock protection.",
        feature_3_desc: "Ready with customizable burgers, combos, UPI QR, and chat support.",
        btn_start_install: "Start Installation →",
        req_title: "System & Server Requirements",
        req_sub: "Checking server environment, PHP extensions, and directory permissions.",
        req_fix_notice: "Some critical server requirements were not met. Please enable the missing extensions or fix directory permissions in your hosting panel (aaPanel/cPanel), then click re-check.",
        btn_back: "← Back",
        btn_recheck: "🔄 Re-check",
        btn_next: "Next Step →",
        db_title: "Database Configuration",
        db_sub: "Enter your MySQL / MariaDB database credentials created in aaPanel or cPanel.",
        lbl_db_host: "Database Host",
        lbl_db_port: "Port",
        lbl_db_name: "Database Name",
        lbl_db_user: "Database Username",
        lbl_db_pass: "Database Password",
        btn_test_db: "🔌 Test Connection",
        admin_title: "Administrator Account Setup",
        admin_sub: "Create your primary Super Admin account for managing Foodgo.",
        lbl_admin_user: "Admin Username",
        lbl_admin_email: "Admin Email",
        lbl_admin_pass: "Admin Password",
        lbl_admin_pass_confirm: "Confirm Password",
        settings_title: "Store & Payment Settings",
        settings_sub: "Configure store defaults and instant UPI / Google Pay QR payments.",
        lbl_app_name: "Store Name",
        lbl_currency: "Currency",
        lbl_app_url: "Application Website URL",
        upi_optional: "Optional / Can edit later",
        lbl_upi_id: "UPI ID / VPA",
        lbl_merchant_name: "Merchant Name",
        btn_install_now: "Install Foodgo Now 🚀",
        complete_title: "Foodgo Installed Successfully!",
        complete_desc: "Your Foodgo application has been completely configured with database tables, seed products, admin security credentials, and application locks.",
        sec_lock_title: "Security & Installation Lock Activated",
        sec_lock_desc: "1. storage/installed.lock has been created to prevent unauthorized re-installation.<br>2. <strong>Recommended:</strong> Please delete install.php from your hosting File Manager / aaPanel."
      },
      ml: {
        header_sub: "ഭക്ഷണ ഓർഡറിംഗ് പ്ലാറ്റ്‌ഫോം",
        locked_title: "Foodgo ഇൻസ്റ്റലേഷൻ പൂർത്തിയായിക്കഴിഞ്ഞു",
        locked_desc: "ഈ വെബ്സൈറ്റിൽ Foodgo വിജയകരമായി ഇൻസ്റ്റാൾ ചെയ്തിരിക്കുന്നു. സുരക്ഷക്കായി ഇൻസ്റ്റാളർ ലോക്ക് ചെയ്തിരിക്കുന്നു. വെബ്സൈറ്റ് അല്ലെങ്കിൽ അഡ്മിൻ പാനൽ സന്ദർശിക്കുക.",
        locked_rec_head: "സുരക്ഷാ നിർദ്ദേശം:",
        locked_rec_body: "കൂടുതൽ സുരക്ഷക്കായി aaPanel അല്ലെങ്കിൽ File Manager-ൽ നിന്ന് install.php ഡിലീറ്റ് ചെയ്യുക.",
        btn_open_site: "വെബ്സൈറ്റ് തുറക്കുക",
        btn_open_admin: "അഡ്മിൻ പാനൽ തുറക്കുക",
        step_1_name: "സ്വാഗതം",
        step_2_name: "സിസ്റ്റം",
        step_3_name: "ഡാറ്റാബേസ്",
        step_4_name: "അഡ്മിൻ",
        step_5_name: "ക്രമീകരണങ്ങൾ",
        step_6_name: "പൂർത്തിയായി",
        welcome_title: "Foodgo ഇൻസ്റ്റലേഷനിലേക്ക് സ്വാഗതം",
        welcome_desc: "Foodgo തിരഞ്ഞെടുത്തതിന് നന്ദി. ലളിതമായ കുറച്ച് ക്ലിക്കുകളിലൂടെ നിങ്ങളുടെ MySQL ഡാറ്റാബേസ്, അഡ്മിൻ അക്കൗണ്ട്, സ്റ്റോർ വിവരങ്ങൾ, UPI പേയ്‌മെന്റ് എന്നിവ സജ്ജമാക്കാൻ ഈ വിസാർഡ് നിങ്ങളെ സഹായിക്കും.",
        feature_1_desc: "2 മിനിറ്റിനുള്ളിൽ സമ്പൂർണ്ണ ഡാറ്റാബേസും കോൺഫിഗറേഷനും തനിയെ സെറ്റപ്പാകും.",
        feature_2_desc: "Bcrypt പാസ്‌വേഡ് എൻക്രിപ്ഷനും സുരക്ഷിത ഇൻസ്റ്റാളർ ലോക്കും.",
        feature_3_desc: "പൊറോട്ട, ബിരിയാണി, ബർഗറുകൾ, UPI QR, കസ്റ്റമർ ചാറ്റ് എന്നിവ തയ്യാറാണ്.",
        btn_start_install: "ഇൻസ്റ്റലേഷൻ ആരംഭിക്കുക →",
        req_title: "സിസ്റ്റം ആവശ്യകതകൾ പരിശോധിക്കുന്നു",
        req_sub: "സെർവർ എൻവയോൺമെന്റ്, PHP എക്സ്റ്റൻഷനുകൾ, ഫോൾഡർ അനുമതികൾ എന്നിവ പരിശോധിക്കുന്നു.",
        req_fix_notice: "ചില നിർണായക ആവശ്യകതകൾ ലഭ്യമല്ല. ദയവായി aaPanel/cPanel-ൽ ആവശ്യമായ PHP എക്സ്റ്റൻഷനുകൾ enable ചെയ്യുക അല്ലെങ്കിൽ ഫോൾഡർ പെർമിഷൻ ശരിയാക്കുക.",
        btn_back: "← പിന്നോട്ട്",
        btn_recheck: "🔄 വീണ്ടും പരിശോധിക്കുക",
        btn_next: "അടുത്ത ഘട്ടം →",
        db_title: "ഡാറ്റാബേസ് വിവരങ്ങൾ",
        db_sub: "നിങ്ങളുടെ aaPanel അല്ലെങ്കിൽ cPanel-ൽ സൃഷ്ടിച്ച MySQL / MariaDB വിവരങ്ങൾ നൽകുക.",
        lbl_db_host: "ഡാറ്റാബേസ് ഹോസ്റ്റ് (Host)",
        lbl_db_port: "പോർട്ട് (Port)",
        lbl_db_name: "ഡാറ്റാബേസ് പേര് (DB Name)",
        lbl_db_user: "ഡാറ്റാബേസ് യൂസർനെയിം (DB User)",
        lbl_db_pass: "ഡാറ്റാബേസ് പാസ്‌വേഡ് (DB Password)",
        btn_test_db: "🔌 കണക്ഷൻ പരിശോധിക്കുക",
        admin_title: "അഡ്മിൻ അക്കൗണ്ട് സൃഷ്ടിക്കുക",
        admin_sub: "Foodgo നിയന്ത്രിക്കുന്നതിനുള്ള പ്രധാന സൂപ്പർ അഡ്മിൻ വിവരങ്ങൾ നൽകുക.",
        lbl_admin_user: "അഡ്മിൻ യൂസർനെയിം",
        lbl_admin_email: "അഡ്മിൻ ഇമെയിൽ",
        lbl_admin_pass: "അഡ്മിൻ പാസ്‌വേഡ്",
        lbl_admin_pass_confirm: "പാസ്‌വേഡ് വീണ്ടും ടൈപ്പ് ചെയ്യുക",
        settings_title: "സ്റ്റോർ & പേയ്‌മെന്റ് വിവരങ്ങൾ",
        settings_sub: "കടയുടെ പേര്, കറൻസി, UPI / Google Pay QR ക്രമീകരണങ്ങൾ നൽകുക.",
        lbl_app_name: "സ്റ്റോറിന്റെ പേര്",
        lbl_currency: "കറൻസി",
        lbl_app_url: "വെബ്സൈറ്റ് URL",
        upi_optional: "ഓപ്ഷണൽ (പിന്നീട് മാറ്റാം)",
        lbl_upi_id: "UPI ID / VPA",
        lbl_merchant_name: "വ്യാപാരിയുടെ പേര് (Merchant)",
        btn_install_now: "ഇപ്പോൾ ഇൻസ്റ്റാൾ ചെയ്യുക 🚀",
        complete_title: "Foodgo വിജയകരമായി ഇൻസ്റ്റാൾ ചെയ്തു!",
        complete_desc: "നിങ്ങളുടെ Foodgo ആപ്ലിക്കേഷൻ ഡാറ്റാബേസ് ടേബിളുകൾ, ഉൽപന്നങ്ങൾ, അഡ്മിൻ ക്രെഡൻഷ്യലുകൾ എന്നിവയോടെ പൂർണ്ണമായി പ്രവർത്തനസജ്ജമായി.",
        sec_lock_title: "സുരക്ഷാ ലോക്ക് സജീവമാക്കി",
        sec_lock_desc: "1. വീണ്ടും ഇൻസ്റ്റാൾ ചെയ്യുന്നത് തടയാൻ <code>storage/installed.lock</code> സൃഷ്ടിച്ചു.<br>2. <strong>നിർദ്ദേശം:</strong> സുരക്ഷക്കായി aaPanel അല്ലെങ്കിൽ File Manager-ൽ നിന്ന് <code>install.php</code> ഡിലീറ്റ് ചെയ്യുക."
      }
    };

    let currentLang = 'en';
    let currentStep = 1;
    let dbTested = false;

    function setLang(lang) {
      currentLang = lang;
      document.getElementById('lang-en').className = lang === 'en' ? 'px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-white text-[#322A2E] shadow-xs' : 'px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer text-gray-500 hover:text-[#322A2E]';
      document.getElementById('lang-ml').className = lang === 'ml' ? 'px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-white text-[#322A2E] shadow-xs' : 'px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer text-gray-500 hover:text-[#322A2E]';

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[lang] && i18nData[lang][key]) {
          el.innerHTML = i18nData[lang][key];
        }
      });
    }

    function goToStep(step) {
      currentStep = step;
      document.querySelectorAll('.step-page').forEach(page => page.classList.add('hidden'));
      const target = document.getElementById('step-page-' + step);
      if (target) target.classList.remove('hidden');

      // Update navbar
      for (let i = 1; i <= 6; i++) {
        const nav = document.getElementById('step-nav-' + i);
        if (!nav) continue;
        const circle = nav.querySelector('span:first-child');
        if (i < step) {
          nav.className = 'step-nav flex items-center gap-2 text-xs font-black text-emerald-600';
          circle.className = 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]';
          circle.innerHTML = '✓';
        } else if (i === step) {
          nav.className = 'step-nav active flex items-center gap-2 text-xs font-black text-[#EF2A39]';
          circle.className = 'w-6 h-6 rounded-full bg-[#EF2A39] text-white flex items-center justify-center text-[11px]';
          circle.innerHTML = i;
        } else {
          nav.className = 'step-nav flex items-center gap-2 text-xs font-black text-gray-400';
          circle.className = 'w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]';
          circle.innerHTML = i;
        }
      }

      if (step === 2) {
        checkRequirements();
      }
    }

    async function checkRequirements() {
      const loading = document.getElementById('req-loading');
      const container = document.getElementById('req-container');
      const errorBox = document.getElementById('req-error-box');
      const nextBtn = document.getElementById('btn-req-next');

      loading.classList.remove('hidden');
      container.classList.add('hidden');
      errorBox.classList.add('hidden');
      nextBtn.disabled = true;

      try {
        const res = await fetch('install.php?action=check_requirements');
        const data = await res.json();

        loading.classList.add('hidden');
        container.classList.remove('hidden');

        let html = '';
        let hasCriticalFail = false;

        for (const [key, item] of Object.entries(data.requirements)) {
          const isPassed = item.passed;
          if (item.critical && !isPassed) hasCriticalFail = true;

          html += `
            <div class="p-3 bg-[#F8F9FA] rounded-xl flex items-center justify-between border border-gray-100">
              <div class="flex items-center gap-2.5">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${isPassed ? 'bg-emerald-100 text-emerald-700' : (item.critical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}">
                  ${isPassed ? '✓' : '✕'}
                </span>
                <div>
                  <span class="text-xs font-bold text-[#322A2E]">${item.name}</span>
                  ${item.current ? `<span class="text-[10px] text-gray-400 ml-1">(${item.current})</span>` : ''}
                </div>
              </div>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isPassed ? 'bg-emerald-50 text-emerald-700' : (item.critical ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}">
                ${isPassed ? 'Passed' : (item.critical ? 'Failed' : 'Optional')}
              </span>
            </div>
          `;
        }

        container.innerHTML = html;

        if (hasCriticalFail) {
          errorBox.classList.remove('hidden');
          nextBtn.disabled = true;
        } else {
          nextBtn.disabled = false;
        }
      } catch (err) {
        loading.classList.add('hidden');
        errorBox.classList.remove('hidden');
        document.getElementById('req-error-text').innerText = 'Error checking requirements: ' + err.message;
      }
    }

    async function testDbConnection() {
      const btn = document.getElementById('btn-test-db');
      const statusBox = document.getElementById('db-status-box');
      const nextBtn = document.getElementById('btn-db-next');

      const host = document.getElementById('db_host').value.trim();
      const port = document.getElementById('db_port').value.trim();
      const name = document.getElementById('db_name').value.trim();
      const user = document.getElementById('db_user').value.trim();
      const pass = document.getElementById('db_pass').value;

      if (!name || !user) {
        statusBox.className = 'p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold';
        statusBox.innerText = 'Please enter both Database Name and Username.';
        statusBox.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerText = 'Testing...';
      statusBox.classList.add('hidden');

      try {
        const res = await fetch('install.php?action=test_db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ db_host: host, db_port: port, db_name: name, db_user: user, db_pass: pass })
        });
        const data = await res.json();

        if (data.success) {
          dbTested = true;
          nextBtn.disabled = false;
          statusBox.className = 'p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold';
          statusBox.innerHTML = `✓ ${data.message || 'Database connection successful!'}` + (data.has_existing_tables ? ' <br><span class="text-[11px] text-amber-700">(Note: Foodgo tables found in DB, existing tables will be safely migrated)</span>' : '');
          statusBox.classList.remove('hidden');
        } else {
          dbTested = false;
          nextBtn.disabled = true;
          statusBox.className = 'p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold';
          statusBox.innerText = '✕ ' + (data.error || 'Connection failed.');
          statusBox.classList.remove('hidden');
        }
      } catch (err) {
        statusBox.className = 'p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold';
        statusBox.innerText = '✕ Error testing database: ' + err.message;
        statusBox.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerText = '🔌 Test Connection';
      }
    }

    function validateAdminStep() {
      const u = document.getElementById('admin_username').value.trim();
      const e = document.getElementById('admin_email').value.trim();
      const p = document.getElementById('admin_password').value;
      const pc = document.getElementById('admin_password_confirm').value;
      const errBox = document.getElementById('admin-error-box');

      errBox.classList.add('hidden');

      if (u.length < 3) {
        errBox.innerText = 'Admin username must be at least 3 characters long.';
        errBox.classList.remove('hidden');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        errBox.innerText = 'Please enter a valid administrator email address.';
        errBox.classList.remove('hidden');
        return;
      }

      if (p.length < 6) {
        errBox.innerText = 'Password must be at least 6 characters long.';
        errBox.classList.remove('hidden');
        return;
      }

      if (p !== pc) {
        errBox.innerText = 'Passwords do not match. Please re-enter identical passwords.';
        errBox.classList.remove('hidden');
        return;
      }

      goToStep(5);
    }

    async function executeInstallation() {
      const btn = document.getElementById('btn-run-install');
      const errBox = document.getElementById('install-error-box');

      const payload = {
        db_host: document.getElementById('db_host').value.trim(),
        db_port: document.getElementById('db_port').value.trim(),
        db_name: document.getElementById('db_name').value.trim(),
        db_user: document.getElementById('db_user').value.trim(),
        db_pass: document.getElementById('db_pass').value,
        admin_username: document.getElementById('admin_username').value.trim(),
        admin_email: document.getElementById('admin_email').value.trim(),
        admin_password: document.getElementById('admin_password').value,
        admin_password_confirm: document.getElementById('admin_password_confirm').value,
        app_name: document.getElementById('app_name').value.trim(),
        app_url: document.getElementById('app_url').value.trim(),
        currency: document.getElementById('currency').value,
        upi_id: document.getElementById('upi_id').value.trim(),
        upi_merchant: document.getElementById('upi_merchant').value.trim(),
      };

      errBox.classList.add('hidden');
      btn.disabled = true;
      btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Installing...';

      try {
        const res = await fetch('install.php?action=install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          goToStep(6);
        } else {
          errBox.innerText = data.error || 'An error occurred during installation.';
          errBox.classList.remove('hidden');
          btn.disabled = false;
          btn.innerHTML = 'Install Foodgo Now 🚀';
        }
      } catch (err) {
        errBox.innerText = 'Network/Server Error: ' + err.message;
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Install Foodgo Now 🚀';
      }
    }
  </script>
</body>
</html>
