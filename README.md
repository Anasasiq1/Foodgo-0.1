# 🍔 Foodgo — Gourmet Food Ordering Platform

Foodgo is a production-ready, portable online food ordering application featuring interactive customizable menu items, instant UPI / Google Pay QR payments, real-time live chat and voice notes support, and a comprehensive super administrator panel.

The application is engineered to be portable and deployable on any hosting environment via a simple ZIP file upload, supporting both **PHP / MySQL Web Installer** and **Node.js Production Server** deployment workflows.

---

## 🌟 Key Features

- **🍔 Interactive Customer Ordering:** Rich menu catalog with customizable burger toppings, portion sizes, beverage flavors, spicy levels, and addon choices.
- **📱 Instant UPI & Multi-Payment:** Dynamic UPI QR code generation (Google Pay, PhonePe, Paytm), manual payment verification, Card simulation, and Cash on Delivery.
- **🎤 Customer Support with Voice Notes:** Real-time customer care chat with live microphone audio recording, waveform preview, and order reference linking.
- **👑 Full-Featured Admin Dashboard:** Manage menu items, categories, customer orders, live support conversations, revenue analytics, and audit logs.
- **⚡ Portable Installation Wizard:** Web-based, bilingual (English & Malayalam) installer (`install.php`) with automated database schema provisioning, connection testing, password hashing, and installation locking.
- **🔒 Production Security:** Bcrypt password encryption, `.htaccess` protection for configs and storage, tamper-proof session cookies, and installation locks.

---

## 🚀 Quick Start & Deployment Options

Foodgo supports two deployment methods:

### Option 1: PHP + MySQL Web Installation (cPanel / aaPanel / Shared Hosting)

1. Upload `Foodgo.zip` to your hosting file manager (e.g. `/public_html` or `/www/wwwroot/yourdomain.com`) and extract it.
2. Create a MySQL / MariaDB database and user in your hosting control panel.
3. Open your domain in your browser:
   ```
   https://yourdomain.com
   ```
4. Follow the **Foodgo Web Installation Wizard** (`install.php`):
   - Check system requirements (PHP 7.4+, PDO MySQL, mbstring, OpenSSL).
   - Test and connect your database credentials.
   - Set up your Super Admin account.
   - Configure store preferences and instant UPI payment ID.
5. Once completed, delete `install.php` for security.
6. Access your store at `https://yourdomain.com` and admin panel at `https://yourdomain.com/admin.php`.

---

### Option 2: Node.js Server Deployment (aaPanel / VPS / Cloud)

1. Extract the application files:
   ```bash
   unzip Foodgo.zip -d /www/wwwroot/foodgo
   cd /www/wwwroot/foodgo
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database and application details
   ```
4. Initialize the database:
   ```bash
   npm run migrate
   ```
5. Build production frontend assets:
   ```bash
   npm run build
   ```
6. Start the server using PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
7. Configure your Nginx reverse proxy to forward traffic to port `3000`.

---

## 📖 Complete Malayalam Documentation

For comprehensive, step-by-step instructions written in Malayalam (മലയാളം), please refer to:
👉 **[DOCUMENTATION_ML.md](./DOCUMENTATION_ML.md)**

---

## 🗄️ Database Architecture

Foodgo includes a complete MySQL relational schema:
- `database/schema.sql` — Definitions for 10 relational tables (`admins`, `categories`, `products`, `product_option_groups`, `product_options`, `orders`, `order_items`, `support_conversations`, `support_messages`, `site_settings`, `admin_activity_logs`, `admin_sessions`).
- `database/seed.sql` — Default gourmet burgers, beverages, combos, and initial store configurations.

---

## 🛡️ Security Features

- **Installation Lock (`storage/installed.lock`):** Prevents unauthorized re-installation attempts after the initial setup.
- **Config Protection:** Protected by `.htaccess` denying direct HTTP access to configuration secrets.
- **Upload Sandbox:** Script execution (`.php`, `.phtml`, etc.) is strictly disabled within `uploads/`.
- **Bcrypt Hashing:** Admin passwords are encrypted using strong bcrypt hashing.

---

## 📄 License

Proprietary &copy; Foodgo. All rights reserved.
