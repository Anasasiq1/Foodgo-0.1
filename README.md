# FOODGO

**Commercial-Grade Multi-Service Ordering & Delivery Commerce Platform**  
*CodeCanyon-Style Dual Deployment Edition: PHP Shared Hosting & Node.js VPS*

---

## 🌟 What is Foodgo?

Foodgo is a production-ready, commercial-grade online ordering and multi-service commerce platform. Engineered for seamless portability, Foodgo features interactive product customization, dynamic multi-module switching (Food, Grocery, Pharmacy, Cosmetics, Stationery), Salna & Curry customization, instant UPI QR payments, 2-way customer support chat with microphone voice notes, and dedicated management portals for Super Admins, Merchants, and Delivery Partners.

---

## 🚀 Key Features

- **🍔 Interactive Customer Storefront (`index.html`)**: Rich catalog, portion counter, spicy level sliders, addon checkboxes, and live cart calculation.
- **🛍️ 5-in-1 Multi-Service Super App**: Food, Grocery, Pharmacy, Cosmetics, and Stationery in a single unified interface.
- **🍲 Curry & Salna Selection System**: Tailored gravy options for combo meals (Porotta, Biriyani, Fried Rice).
- **📱 Zero-Fee Instant UPI QR Payment**: Dynamic Google Pay, PhonePe, Paytm QR codes and Cash on Delivery.
- **🎤 Voice Notes Customer Support**: In-browser microphone audio recording with live waveform playback and order linking.
- **👑 Super Admin Command Console (`admin.html`)**: Product catalog, order dispatch, revenue metrics, 1-click backups, and audit logs.
- **🍳 Merchant & Kitchen Portal (`merchant.html`)**: Real-time kitchen ticket stream and stock availability toggling.
- **🛵 Delivery Partner Portal (`delivery.html`)**: Order assignments, pickup/drop-off status workflow, and daily payout tracking.
- **🔌 REST API & Webhook Engine**: Extensible JSON endpoints with API key management and n8n webhook automation.

---

## 📋 System Requirements

### Option A: PHP / Shared Hosting Edition
- **Web Server**: Apache 2.4+ (with `mod_rewrite`) or LiteSpeed / aaPanel / cPanel / Nginx
- **PHP Version**: PHP 7.4, 8.0, 8.1, or 8.2
- **Database**: **None required** (100% Databaseless JSON FileStore with `flock()` locking)
- **Node.js**: **Not required**

### Option B: Node.js / VPS Edition
- **Runtime**: Node.js 18.x LTS or 20.x LTS
- **Process Manager**: PM2
- **Web Server**: Nginx (Reverse Proxy)

---

## 📦 Dual Installation Options

### ⚡ Option A — PHP File Manager Edition (cPanel, aaPanel, Shared Hosting)
1. Upload `Foodgo-PHP.zip` into your website root directory (`public_html` or `/www/wwwroot/yourdomain.com`).
2. Extract the archive directly.
3. Open `https://yourdomain.com/` in your browser.
4. The 1-Click Installation Wizard will automatically verify permissions, configure your Super Admin account, and initialize storage.
5. Log in to the Super Admin Portal at `https://yourdomain.com/admin.html`.

### 🚀 Option B — Node.js VPS Edition (Ubuntu, Debian, Cloud Containers)
1. Extract `Foodgo-Node.zip` into `/var/www/foodgo`.
2. Run `npm install` followed by `npm run build`.
3. Start the server using PM2: `pm2 start ecosystem.config.cjs && pm2 save`.
4. Configure your Nginx reverse proxy to route traffic to `http://127.0.0.1:3000`.

---

## 📚 Complete Documentation Suite

All detailed guides are located in the [`/documentation/`](./documentation/) directory:

- **[Quick Start Guide](./documentation/QUICK-START.md)**
- **[PHP Installation Guide](./documentation/PHP-INSTALLATION.md)**
- **[cPanel Step-by-Step Guide](./documentation/CPANEL-INSTALLATION.md)**
- **[aaPanel Step-by-Step Guide](./documentation/AAPANEL-INSTALLATION.md)**
- **[Node.js VPS Setup Guide](./documentation/NODE-INSTALLATION.md)**
- **[Super Admin Console Guide](./documentation/SUPER-ADMIN.md)**
- **[Merchant Portal Guide](./documentation/MERCHANT.md)**
- **[Delivery Partner Guide](./documentation/DELIVERY.md)**
- **[Customer Experience Guide](./documentation/CUSTOMER.md)**
- **[REST API Reference](./documentation/API.md)**
- **[API Keys & Client Apps](./documentation/API-KEYS.md)**
- **[Webhooks & n8n Integration](./documentation/WEBHOOKS.md)**
- **[Payment Methods](./documentation/PAYMENTS.md)**
- **[WhatsApp Notifications](./documentation/WHATSAPP.md)**
- **[Backup & Recovery](./documentation/BACKUP.md)**
- **[Security Hardening](./documentation/SECURITY.md)**
- **[Safe Updates](./documentation/UPDATES.md)**
- **[Troubleshooting FAQ](./documentation/TROUBLESHOOTING.md)**
- **[Changelog](./documentation/CHANGELOG.md)**
- **[Malayalam Deployment Guide](./DOCUMENTATION_ML.md)**

---

## 🔐 Default Access Credentials

- **Super Admin URL**: `https://yourdomain.com/admin.html`
- **Default Username**: `Anasasiq`
- **Default Password**: `admin123` *(configurable during install)*

---

## 📄 License & Commercial Support

Licensed under the **Foodgo Commercial Software License**. See [LICENSE](./LICENSE) for details.
Version: **v0.2.0**
