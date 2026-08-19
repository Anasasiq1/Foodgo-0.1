# 🎛️ Foodgo — cPanel Step-by-Step Installation Guide

This guide walks you through deploying **Foodgo (PHP Edition)** on any standard **cPanel Shared Hosting** or **Reseller Hosting** account.

---

## ⏱️ Total Setup Time: Under 3 Minutes

### Step 1: Log in to cPanel
Log in to your hosting account cPanel dashboard (typically `https://yourdomain.com:2083` or through your hosting client portal).

### Step 2: Open File Manager
1. In the **Files** section, click on **File Manager**.
2. Navigate to your primary website root folder:
   - For primary domain: `/public_html`
   - For addon domain / subdomain: `/public_html/subdomain` or `/yourdomain.com`

### Step 3: Upload `Foodgo-PHP.zip`
1. Click the **Upload** button in the top toolbar.
2. Select and upload `Foodgo-PHP.zip`.
3. Wait for the progress bar to turn green (100% complete).

### Step 4: Extract the ZIP
1. Back in File Manager, select `Foodgo-PHP.zip` and click **Extract** in the top menu.
2. Specify `/public_html` as the target directory and confirm extraction.
3. Verify that `index.html`, `admin.html`, `install.php`, `api/`, `data/`, and `.htaccess` are visible directly in `/public_html`.

### Step 5: Check PHP Version & Extensions
1. In cPanel, search for **Select PHP Version** or **MultiPHP Manager**.
2. Ensure your domain is using **PHP 7.4, 8.0, 8.1, or 8.2**.
3. Under **PHP Extensions**, verify that `json`, `mbstring`, `fileinfo`, and `openssl` are enabled (enabled by default on all modern cPanel servers).

### Step 6: Open Website & Run Installer
1. Open your browser and visit:
   ```text
   https://yourdomain.com/
   ```
2. The installation wizard will appear. Click **Next Step**, fill in your Store details and Super Admin password, then click **Install Foodgo Now 🚀**.
3. That's it! Your Foodgo store is now live and fully operational.

---

## 🔒 cPanel SSL Certificate
Ensure an SSL certificate is active (cPanel **AutoSSL** or **Let's Encrypt**) so all payment and customer order communications run over secure `https://`.
