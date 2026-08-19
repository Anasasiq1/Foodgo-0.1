<?php
/**
 * Foodgo Gourmet Ordering Platform - Databaseless Web Installer
 * Dual Language Support: English & Malayalam (മലയാളം)
 * 
 * 100% File-Storage Architecture (JSON FileStore).
 * Zero MySQL, Zero DB Setup, Zero Configuration Hassle!
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

define('FOODGO_INSTALLER', true);
define('FOODGO_ACCESS', true);

$baseDir = __DIR__;
$lockFile = $baseDir . '/storage/installed.lock';
$configFile = $baseDir . '/config/config.php';

require_once $baseDir . '/includes/FileStore.php';
require_once $baseDir . '/includes/DataInitializer.php';

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

        $extJson = extension_loaded('json');
        $extMbstring = extension_loaded('mbstring');
        $extOpenssl = extension_loaded('openssl');
        $extFileinfo = extension_loaded('fileinfo');
        $extCurl = extension_loaded('curl');
        $extGd = extension_loaded('gd') || extension_loaded('imagick');
        $extSession = session_status() !== PHP_SESSION_DISABLED;

        // Ensure directories exist
        @mkdir($baseDir . '/data', 0755, true);
        @mkdir($baseDir . '/storage', 0755, true);
        @mkdir($baseDir . '/config', 0755, true);
        @mkdir($baseDir . '/uploads', 0755, true);
        @mkdir($baseDir . '/backups', 0755, true);

        // Directory writability
        $dataWritable = is_writable($baseDir . '/data');
        $configWritable = is_writable($baseDir . '/config');
        $storageWritable = is_writable($baseDir . '/storage');
        $uploadsWritable = is_writable($baseDir . '/uploads');
        $backupsWritable = is_writable($baseDir . '/backups');

        $allPassed = $phpOk && $extJson && $extMbstring && $extOpenssl && $dataWritable && $configWritable && $storageWritable;

        echo json_encode([
            'success' => true,
            'all_passed' => $allPassed,
            'requirements' => [
                'php_version' => ['name' => 'PHP Version (>= 7.4)', 'current' => $phpVersion, 'passed' => $phpOk, 'critical' => true],
                'json' => ['name' => 'JSON FileStore Extension', 'passed' => $extJson, 'critical' => true],
                'mbstring' => ['name' => 'Mbstring Extension', 'passed' => $extMbstring, 'critical' => true],
                'openssl' => ['name' => 'OpenSSL Security', 'passed' => $extOpenssl, 'critical' => true],
                'fileinfo' => ['name' => 'Fileinfo Extension', 'passed' => $extFileinfo, 'critical' => false],
                'curl' => ['name' => 'cURL Extension', 'passed' => $extCurl, 'critical' => false],
                'session' => ['name' => 'Session Support', 'passed' => $extSession, 'critical' => true],
                'dir_data' => ['name' => 'data/ Directory Writable (JSON Store)', 'passed' => $dataWritable, 'critical' => true],
                'dir_config' => ['name' => 'config/ Directory Writable', 'passed' => $configWritable, 'critical' => true],
                'dir_storage' => ['name' => 'storage/ Directory Writable', 'passed' => $storageWritable, 'critical' => true],
                'dir_uploads' => ['name' => 'uploads/ Directory Writable', 'passed' => $uploadsWritable, 'critical' => false],
                'dir_backups' => ['name' => 'backups/ Directory Writable', 'passed' => $backupsWritable, 'critical' => false],
            ]
        ]);
        exit;
    }

    if ($action === 'install') {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $adminUser = trim($input['admin_username'] ?? 'admin');
        $adminEmail = trim($input['admin_email'] ?? 'admin@foodgo.com');
        $adminPass = (string)($input['admin_password'] ?? 'admin123');
        $adminName = trim($input['admin_name'] ?? 'Super Administrator');
        $appName = trim($input['app_name'] ?? 'Foodgo');
        $appUrl = trim($input['app_url'] ?? ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? 'localhost')));
        $currency = trim($input['currency'] ?? 'INR (₹)');
        $upiId = trim($input['upi_id'] ?? 'foodgo@upi');
        $upiMerchant = trim($input['upi_merchant'] ?? 'Foodgo Foods Pvt Ltd');

        if (strlen($adminUser) < 3) {
            echo json_encode(['success' => false, 'error' => 'Admin username must be at least 3 characters.']);
            exit;
        }

        if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Valid admin email address is required.']);
            exit;
        }

        if (strlen($adminPass) < 6) {
            echo json_encode(['success' => false, 'error' => 'Admin password must be at least 6 characters.']);
            exit;
        }

        try {
            // 1. Initialize all JSON Collections
            FileStore::init();
            $createdCollections = DataInitializer::run(true);

            // 2. Setup Super Admin in users.json
            $adminHash = password_hash($adminPass, PASSWORD_DEFAULT);
            $admins = [
                [
                    'id' => 'admin-1',
                    'username' => $adminUser,
                    'email' => $adminEmail,
                    'name' => $adminName,
                    'role' => 'Super Administrator',
                    'passwordHash' => $adminHash,
                    'createdAt' => date('c')
                ]
            ];
            FileStore::saveRaw('users', $admins);

            // 3. Update store and payment settings
            $settings = FileStore::get('settings', []);
            $settings['storeName'] = $appName;
            $settings['currency'] = $currency;
            $settings['contactEmail'] = $adminEmail;
            FileStore::saveRaw('settings', $settings);

            $paymentSettings = FileStore::get('payment_settings', []);
            $paymentSettings['upiId'] = $upiId;
            $paymentSettings['merchantName'] = $upiMerchant;
            $paymentSettings['currency'] = $currency;
            FileStore::saveRaw('payment_settings', $paymentSettings);

            // 4. Generate config/config.php
            $secretKey = bin2hex(random_bytes(32));
            $configContent = "<?php\n"
                . "/**\n"
                . " * Foodgo Gourmet Ordering Platform - Application Configuration\n"
                . " * Databaseless File-Storage Engine (JSON FileStore)\n"
                . " */\n\n"
                . "if (!defined('FOODGO_ACCESS')) {\n"
                . "    define('FOODGO_ACCESS', true);\n"
                . "}\n\n"
                . "return [\n"
                . "    'app' => [\n"
                . "        'name'        => " . var_export($appName, true) . ",\n"
                . "        'url'         => " . var_export($appUrl, true) . ",\n"
                . "        'env'         => 'production',\n"
                . "        'debug'       => false,\n"
                . "        'secret'      => " . var_export($secretKey, true) . ",\n"
                . "        'timezone'    => 'Asia/Kolkata',\n"
                . "        'currency'    => " . var_export($currency, true) . ",\n"
                . "    ],\n"
                . "    'storage' => [\n"
                . "        'engine'      => 'FileStore',\n"
                . "        'data_dir'    => __DIR__ . '/../data',\n"
                . "        'backup_dir'  => __DIR__ . '/../backups',\n"
                . "    ],\n"
                . "    'upload' => [\n"
                . "        'max_size_mb' => 20,\n"
                . "        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],\n"
                . "        'allowed_audio_types' => ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg'],\n"
                . "    ],\n"
                . "    'installed' => true,\n"
                . "];\n";

            @file_put_contents($configFile, $configContent);

            // 5. Create installation lock
            $lockData = json_encode([
                'installed_at' => date('c'),
                'version' => '1.1.0',
                'storage_engine' => 'JSON FileStore (Databaseless)',
                'app_name' => $appName,
                'admin_user' => $adminUser,
                'admin_email' => $adminEmail,
            ], JSON_PRETTY_PRINT);
            @file_put_contents($lockFile, $lockData);

            // 6. Ensure .htaccess files are active
            @file_put_contents($baseDir . '/data/.htaccess', "<Files \"*\">\n    Require all denied\n</Files>\nDeny from all\n");
            @file_put_contents($baseDir . '/config/.htaccess', "<Files \"*\">\n    Require all denied\n</Files>\nDeny from all\n");
            @file_put_contents($baseDir . '/backups/.htaccess', "<Files \"*\">\n    Require all denied\n</Files>\nDeny from all\n");

            echo json_encode([
                'success' => true,
                'message' => 'Foodgo installed successfully with databaseless FileStore architecture!',
                'collections_count' => count($createdCollections)
            ]);
            exit;

        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Installation error: ' . $e->getMessage()]);
            exit;
        }
    }

    echo json_encode(['success' => false, 'error' => 'Unknown action.']);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en" class="h-full bg-[#F4F5F7]">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foodgo Web Installation Wizard — FileStore Edition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Manjari:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            ml: ['"Manjari"', '"Plus Jakarta Sans"', 'sans-serif'],
          },
          colors: {
            brand: {
              red: '#EF2A39',
              dark: '#322A2E',
              cream: '#FAFAFA'
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .lang-ml { font-family: 'Manjari', 'Plus Jakarta Sans', sans-serif; }
    .step-active { border-color: #EF2A39; color: #EF2A39; background-color: #FEF2F2; }
    .step-done { border-color: #10B981; color: #10B981; background-color: #ECFDF5; }
    .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); }
  </style>
</head>
<body class="h-full flex flex-col justify-between text-[#322A2E] antialiased selection:bg-[#EF2A39] selection:text-white">

  <header class="w-full bg-white border-b border-gray-200/80 sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EF2A39] to-[#FF5E62] flex items-center justify-center text-white text-xl font-black shadow-md shadow-red-500/20">
          🍔
        </div>
        <div>
          <h1 class="text-base font-extrabold tracking-tight text-[#322A2E] flex items-center gap-2">
            Foodgo
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              Databaseless FileStore
            </span>
          </h1>
          <p class="text-[11px] text-gray-500 font-medium" data-i18n="header_sub">1-Click File-Manager Deployment Wizard</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button id="lang-btn-en" onclick="setLanguage('en')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-[#322A2E] text-white">
          English
        </button>
        <button id="lang-btn-ml" onclick="setLanguage('ml')" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200">
          മലയാളം
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-auto">
    
    <?php if ($isInstalled): ?>
    <!-- ALREADY INSTALLED ALERT -->
    <div class="glass-card border border-emerald-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 text-center max-w-xl mx-auto">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4 font-black">
        ✓
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-[#322A2E] mb-2" data-i18n="already_installed_title">
        Foodgo is Already Installed!
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 font-medium mb-6" data-i18n="already_installed_desc">
        Your Foodgo platform is running securely on databaseless JSON FileStore. The installer is locked for security.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="index.html" class="w-full sm:w-auto px-6 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black transition-transform active:scale-95 shadow-md shadow-red-500/25 text-center">
          Open Customer App →
        </a>
        <a href="admin.html" class="w-full sm:w-auto px-6 py-3 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-xl text-xs font-black transition-transform active:scale-95 text-center">
          Admin Dashboard →
        </a>
      </div>
    </div>
    <?php else: ?>

    <div class="glass-card border border-gray-200/80 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
      
      <!-- Stepper Navigation -->
      <div class="bg-gray-50/80 border-b border-gray-200/70 p-4 sm:p-5">
        <div class="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div id="step-nav-1" class="p-2 rounded-xl step-active transition-all">
            <span class="block text-[10px] text-gray-400 font-semibold mb-0.5">01</span>
            <span data-i18n="step1_nav">Welcome</span>
          </div>
          <div id="step-nav-2" class="p-2 rounded-xl text-gray-400 border border-transparent transition-all">
            <span class="block text-[10px] text-gray-400 font-semibold mb-0.5">02</span>
            <span data-i18n="step2_nav">System Check</span>
          </div>
          <div id="step-nav-3" class="p-2 rounded-xl text-gray-400 border border-transparent transition-all">
            <span class="block text-[10px] text-gray-400 font-semibold mb-0.5">03</span>
            <span data-i18n="step3_nav">Store & Admin</span>
          </div>
          <div id="step-nav-4" class="p-2 rounded-xl text-gray-400 border border-transparent transition-all">
            <span class="block text-[10px] text-gray-400 font-semibold mb-0.5">04</span>
            <span data-i18n="step4_nav">Complete</span>
          </div>
        </div>
      </div>

      <!-- Step Content Pages -->
      <div class="p-6 sm:p-8">

        <!-- STEP 1: WELCOME -->
        <div id="step-page-1" class="step-page space-y-6">
          <div class="max-w-2xl mx-auto text-center space-y-4">
            <div class="w-16 h-16 bg-red-50 text-[#EF2A39] rounded-3xl flex items-center justify-center text-3xl mx-auto mb-2">
              ⚡
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#322A2E] tracking-tight" data-i18n="welcome_title">
              Welcome to Foodgo Installer
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium max-w-lg mx-auto leading-relaxed" data-i18n="welcome_desc">
              Foodgo has been upgraded to a 100% databaseless JSON FileStore engine. Zero MySQL configuration or SQL imports needed. Simply extract and run!
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
              <div class="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
                <div class="text-emerald-600 font-black text-xs mb-1">✓ No MySQL Required</div>
                <div class="text-[11px] text-gray-500 font-medium">Atomic JSON storage with file-locking security.</div>
              </div>
              <div class="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
                <div class="text-[#EF2A39] font-black text-xs mb-1">✓ 1-Click Install</div>
                <div class="text-[11px] text-gray-500 font-medium">Pre-populated with modules, products, curries & settings.</div>
              </div>
              <div class="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
                <div class="text-blue-600 font-black text-xs mb-1">✓ File-Manager Ready</div>
                <div class="text-[11px] text-gray-500 font-medium">Extract directly to aaPanel / cPanel / public_html.</div>
              </div>
            </div>

            <div class="pt-6">
              <button onclick="goToStep(2)" class="px-8 py-3.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black shadow-md shadow-red-500/25 transition-transform active:scale-95" data-i18n="btn_get_started">
                Get Started →
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 2: SYSTEM REQUIREMENTS -->
        <div id="step-page-2" class="step-page hidden space-y-6">
          <div class="max-w-2xl mx-auto">
            <div class="mb-4">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="req_title">Server Compatibility Check</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="req_sub">Checking PHP environment and writable storage directories.</p>
            </div>

            <div id="requirements-list" class="space-y-2.5 mb-6">
              <div class="text-center py-8 text-xs text-gray-400 font-semibold animate-pulse">
                Analyzing server permissions...
              </div>
            </div>

            <div id="req-error-banner" class="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold hidden mb-4"></div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(1)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                ← Back
              </button>
              <button id="btn-req-next" onclick="goToStep(3)" class="px-6 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black transition-transform active:scale-95 shadow-sm">
                Next Step →
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 3: STORE & ADMIN CONFIG -->
        <div id="step-page-3" class="step-page hidden space-y-6">
          <div class="max-w-2xl mx-auto">
            <div class="mb-4">
              <h3 class="text-lg font-black text-[#322A2E]" data-i18n="config_title">Store & Super Admin Setup</h3>
              <p class="text-xs text-gray-500 font-medium mt-0.5" data-i18n="config_sub">Configure your store name, currency, and Super Administrator credentials.</p>
            </div>

            <div class="space-y-4 mb-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_app_name">Store / Brand Name</label>
                  <input type="text" id="app_name" value="Foodgo" required class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#322A2E] mb-1.5" data-i18n="lbl_currency">Currency</label>
                  <select id="currency" class="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-gray-200 rounded-xl text-xs font-semibold text-[#322A2E] outline-none focus:bg-white focus:border-[#EF2A39]">
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="AED (د.إ)">AED (د.إ)</option>
                    <option value="SAR (﷼)">SAR (﷼)</option>
                  </select>
                </div>
              </div>

              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                <div class="text-xs font-black text-[#322A2E]">👑 Super Admin Security Credentials</div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_admin_user">Admin Username</label>
                    <input type="text" id="admin_username" value="Anasasiq" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_admin_email">Admin Email</label>
                    <input type="email" id="admin_email" value="anasasiq3@gmail.com" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_admin_pass">Admin Password</label>
                    <input type="password" id="admin_password" value="admin123" placeholder="Enter secure password" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1" data-i18n="lbl_admin_name">Full Display Name</label>
                    <input type="text" id="admin_name" value="Anas Asiq" required class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                </div>
              </div>

              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                <div class="text-xs font-black text-[#322A2E]">📱 Instant UPI QR Payment Setup (Optional)</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1">UPI ID / VPA</label>
                    <input type="text" id="upi_id" value="foodgo@upi" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-600 mb-1">Merchant Name</label>
                    <input type="text" id="upi_merchant" value="Foodgo Foods Pvt Ltd" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#322A2E] outline-none focus:border-[#EF2A39]">
                  </div>
                </div>
              </div>

              <div id="install-error-box" class="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold hidden"></div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onclick="goToStep(2)" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                ← Back
              </button>
              <button id="btn-run-install" onclick="executeInstallation()" class="px-7 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black shadow-md shadow-red-500/25 transition-transform active:scale-95 flex items-center gap-2">
                <span>Install Foodgo Now 🚀</span>
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 4: COMPLETE -->
        <div id="step-page-4" class="step-page hidden text-center space-y-6 max-w-xl mx-auto">
          <div class="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto text-3xl font-black">
            ✓
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-[#322A2E] mb-2" data-i18n="complete_title">
              Installation Completed Successfully!
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed" data-i18n="complete_desc">
              All 25+ JSON collections have been initialized with full catalog items, admin security tokens, and storage locks.
            </p>
          </div>

          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold text-left space-y-1">
            <div class="font-black text-emerald-900">🛡️ Databaseless Security Lock Active</div>
            <p>1. <code>storage/installed.lock</code> has been created to prevent reinstallation.<br>2. <code>data/.htaccess</code> is actively protecting JSON storage files from direct web access.</p>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href="index.html" class="w-full sm:w-auto px-7 py-3.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black shadow-md shadow-red-500/25 transition-transform active:scale-95 text-center">
              Open Customer Website →
            </a>
            <a href="admin.html" class="w-full sm:w-auto px-7 py-3.5 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-2xl text-xs font-black shadow-sm transition-transform active:scale-95 text-center">
              Open Admin Dashboard →
            </a>
          </div>
        </div>

      </div>
    </div>
    <?php endif; ?>

  </main>

  <footer class="w-full bg-white border-t border-gray-200/80 py-4 text-center text-xs text-gray-400 font-semibold">
    Foodgo v1.1.0 • Databaseless File-Storage Architecture • Powered by HM-Q
  </footer>

  <script>
    let currentLang = 'en';

    const I18N = {
      en: {
        header_sub: "1-Click File-Manager Deployment Wizard",
        welcome_title: "Welcome to Foodgo Installer",
        welcome_desc: "Foodgo has been upgraded to a 100% databaseless JSON FileStore engine. Zero MySQL configuration or SQL imports needed. Simply extract and run!",
        btn_get_started: "Get Started →",
        req_title: "Server Compatibility Check",
        req_sub: "Checking PHP environment and writable storage directories.",
        config_title: "Store & Super Admin Setup",
        config_sub: "Configure your store name, currency, and Super Administrator credentials.",
        lbl_app_name: "Store / Brand Name",
        lbl_currency: "Currency",
        lbl_admin_user: "Admin Username",
        lbl_admin_email: "Admin Email",
        lbl_admin_pass: "Admin Password",
        lbl_admin_name: "Full Display Name",
        complete_title: "Installation Completed Successfully!",
        complete_desc: "All 25+ JSON collections have been initialized with full catalog items, admin security tokens, and storage locks.",
        step1_nav: "Welcome",
        step2_nav: "System Check",
        step3_nav: "Store & Admin",
        step4_nav: "Complete",
      },
      ml: {
        header_sub: "1-ക്ലിക്ക് ഫയൽ-മാനേജർ ഇൻസ്റ്റാളേഷൻ വിസാർഡ്",
        welcome_title: "Foodgo ഇൻസ്റ്റാളറിലേക്ക് സ്വാഗതം",
        welcome_desc: "Foodgo ഇപ്പോൾ 100% ഡാറ്റാബേസ്-ഫ്രീ JSON FileStore എഞ്ചിനിലേക്ക് അപ്ഗ്രേഡ് ചെയ്തു. MySQL സെറ്റപ്പോ SQL ഇമ്പോർട്ടോ ആവശ്യമില്ല!",
        btn_get_started: "തുടങ്ങാം →",
        req_title: "സെർവർ അനുയോജ്യത പരിശോധന",
        req_sub: "PHP പരിതസ്ഥിതിയും ഫയൽ പെർമിഷനുകളും പരിശോധിക്കുന്നു.",
        config_title: "സ്റ്റോർ & അഡ്മിൻ സജ്ജീകരണം",
        config_sub: "നിങ്ങളുടെ സ്റ്റോർ പേരും സൂപ്പർ അഡ്മിൻ ലോഗിൻ വിവരങ്ങളും നൽകുക.",
        lbl_app_name: "സ്റ്റോർ / ബ്രാൻഡ് പേര്",
        lbl_currency: "കറൻസി",
        lbl_admin_user: "അഡ്മിൻ യൂസർനെയിം",
        lbl_admin_email: "അഡ്മിൻ ഇമെയിൽ",
        lbl_admin_pass: "അഡ്മിൻ പാസ്‌വേഡ്",
        lbl_admin_name: "പൂർണ്ണ പേര്",
        complete_title: "ഇൻസ്റ്റാളേഷൻ വിജയകരമായി പൂർത്തിയായി!",
        complete_desc: "എല്ലാ JSON ഡാറ്റാബേസ് ഫയലുകളും അഡ്മിൻ ക്രെഡൻഷ്യലുകളും സുരക്ഷിതമായി സജ്ജീകരിച്ചു കഴിഞ്ഞു.",
        step1_nav: "സ്വാഗതം",
        step2_nav: "സിസ്റ്റം പരിശോധന",
        step3_nav: "സ്റ്റോർ & അഡ്മിൻ",
        step4_nav: "പൂർത്തിയായി",
      }
    };

    function setLanguage(lang) {
      currentLang = lang;
      document.body.className = (lang === 'ml') ? 'h-full flex flex-col justify-between text-[#322A2E] antialiased lang-ml' : 'h-full flex flex-col justify-between text-[#322A2E] antialiased';
      
      const btnEn = document.getElementById('lang-btn-en');
      const btnMl = document.getElementById('lang-btn-ml');
      if (btnEn && btnMl) {
        if (lang === 'en') {
          btnEn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-[#322A2E] text-white';
          btnMl.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200';
        } else {
          btnMl.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-[#322A2E] text-white';
          btnEn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200';
        }
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang] && I18N[lang][key]) {
          el.innerText = I18N[lang][key];
        }
      });
    }

    function goToStep(step) {
      document.querySelectorAll('.step-page').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('step-page-' + step);
      if (target) target.classList.remove('hidden');

      for (let i = 1; i <= 4; i++) {
        const nav = document.getElementById('step-nav-' + i);
        if (nav) {
          if (i < step) {
            nav.className = 'p-2 rounded-xl step-done border transition-all';
          } else if (i === step) {
            nav.className = 'p-2 rounded-xl step-active border transition-all';
          } else {
            nav.className = 'p-2 rounded-xl text-gray-400 border border-transparent transition-all';
          }
        }
      }

      if (step === 2) {
        runRequirementsCheck();
      }
    }

    async function runRequirementsCheck() {
      const container = document.getElementById('requirements-list');
      const errBanner = document.getElementById('req-error-banner');
      const nextBtn = document.getElementById('btn-req-next');

      try {
        const res = await fetch('install.php?action=check_requirements');
        const data = await res.json();

        if (data.success) {
          let html = '';
          Object.keys(data.requirements).forEach(k => {
            const req = data.requirements[k];
            html += `
              <div class="flex items-center justify-between p-3 rounded-xl border ${req.passed ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}">
                <div class="flex items-center gap-2">
                  <span class="${req.passed ? 'text-emerald-500' : 'text-red-500'} font-black text-sm">
                    ${req.passed ? '✓' : '✗'}
                  </span>
                  <span class="text-xs font-bold ${req.passed ? 'text-[#322A2E]' : 'text-red-700'}">${req.name}</span>
                </div>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${req.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                  ${req.passed ? 'Passed' : 'Action Required'}
                </span>
              </div>
            `;
          });
          container.innerHTML = html;

          if (data.all_passed) {
            errBanner.classList.add('hidden');
            nextBtn.disabled = false;
            nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          } else {
            errBanner.innerText = 'Please ensure the data/ and config/ directories are writable by the web server.';
            errBanner.classList.remove('hidden');
          }
        }
      } catch (e) {
        container.innerHTML = '<div class="p-4 text-xs text-red-600">Failed to check server requirements.</div>';
      }
    }

    async function executeInstallation() {
      const btn = document.getElementById('btn-run-install');
      const errBox = document.getElementById('install-error-box');

      const payload = {
        app_name: document.getElementById('app_name').value.trim(),
        currency: document.getElementById('currency').value,
        admin_username: document.getElementById('admin_username').value.trim(),
        admin_email: document.getElementById('admin_email').value.trim(),
        admin_password: document.getElementById('admin_password').value,
        admin_name: document.getElementById('admin_name').value.trim(),
        upi_id: document.getElementById('upi_id').value.trim(),
        upi_merchant: document.getElementById('upi_merchant').value.trim(),
      };

      if (!payload.admin_username || !payload.admin_password || !payload.admin_email) {
        errBox.innerText = 'Please provide all required administrator fields.';
        errBox.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span>Installing Databaseless FileStore...</span>';
      errBox.classList.add('hidden');

      try {
        const res = await fetch('install.php?action=install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          goToStep(4);
        } else {
          errBox.innerText = data.error || 'Installation failed.';
          errBox.classList.remove('hidden');
          btn.disabled = false;
          btn.innerHTML = '<span>Install Foodgo Now 🚀</span>';
        }
      } catch (e) {
        errBox.innerText = 'Network error while executing installation.';
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<span>Install Foodgo Now 🚀</span>';
      }
    }
  </script>
</body>
</html>
