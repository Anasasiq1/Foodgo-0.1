# 🍔 Foodgo — Gourmet Food Ordering Platform (Databaseless FileStore Edition)

Foodgo is a production-ready, portable online food ordering application featuring interactive customizable menu items, multi-module delivery (Food, Grocery, Pharmacy, Cosmetics, Stationery), Salna & Curry customization, instant UPI / Google Pay QR payments, real-time customer care chat with voice notes, and a comprehensive Super Administrator management portal.

**100% Databaseless File-Storage Architecture (JSON FileStore)**:
No MySQL, No MariaDB, No PostgreSQL, No SQLite, No PDO required! Simply extract into any File Manager (`/public_html` or `/www/wwwroot/domain.com`) and open your domain.

---

## 🌟 Key Architecture Highlights

- **⚡ 100% Databaseless (JSON FileStore):** All application state and collections (Products, Categories, Modules, Curries, Orders, Payments, Users, Support Messages, Coupons, Audit Logs) are persisted in atomic, thread-safe JSON files with `flock()` locking.
- **📁 True 1-Click File-Manager Deployment:** No database configuration, No DB username/password prompts, No Node.js runtime needed on PHP hosting.
- **👑 Complete Super Admin Portal:** Super Admin dashboard accessible via `admin.html` or `/admin` to manage catalog items, modules, categories, curries, order status, live customer chats, revenue metrics, backups, and audit logs.
- **🛍️ Multi-Service Super App Modules:** Food, Grocery, Pharmacy, Cosmetics, and Stationery with dynamic category and product filtering.
- **🍲 Curry / Salna Option System:** Custom spice and gravy selection for combo items like Porotta and Biriyani.
- **📱 Instant UPI QR Payment:** Google Pay, PhonePe, Paytm QR codes and Cash on Delivery.
- **🛡️ Hardened Security:** Direct access to `/data/`, `/config/`, and `/backups/` is blocked via `.htaccess`. Passwords are encrypted with `password_hash()` (Bcrypt).

---

## 🚀 Instant Deployment (cPanel / aaPanel / Hostinger / Standard PHP Hosting)

1. Upload the project ZIP to your hosting web directory (e.g. `/public_html` or `/www/wwwroot/yourdomain.com`).
2. Extract the archive.
3. Open your domain in any browser:
   ```text
   https://yourdomain.com
   ```
4. If not initialized yet, the installer (`install.php`) will automatically run in 1 click (setting up Super Admin and generating data files).
5. Open your customer website at `https://yourdomain.com/` and the Admin Portal at `https://yourdomain.com/admin.html` (or `https://yourdomain.com/admin.php`).

---

## 🔐 Default Super Admin Credentials (or customize during install)

- **Username:** `Anasasiq`
- **Password:** `admin123`
- **Portal URL:** `https://yourdomain.com/admin.html`
