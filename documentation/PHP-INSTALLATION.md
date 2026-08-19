# 📁 Foodgo PHP / File Manager Edition — Installation Manual

The **Foodgo PHP Edition** is a standalone, databaseless commercial web package designed for fast deployment on standard Apache, LiteSpeed, OpenLiteSpeed, or Nginx web servers with PHP 7.4 or higher.

---

## 📋 Server Requirements

| Component | Minimum Requirement | Recommended | Status |
| :--- | :--- | :--- | :--- |
| **Web Server** | Apache 2.4+ / LiteSpeed / Nginx | Apache with `mod_rewrite` | Required |
| **PHP Version** | PHP 7.4.0+ | PHP 8.1 or PHP 8.2 | Required |
| **Database** | **None** (100% Databaseless) | JSON FileStore | Built-in |
| **PHP Extensions** | `json`, `mbstring`, `openssl`, `fileinfo` | `curl`, `gd` or `imagick` | Standard on 99% hosts |
| **File Permissions** | Read/Write access on `/data/`, `/config/`, `/storage/`, `/uploads/`, `/backups/` | `0755` for folders, `0644` for files | Standard |

---

## 🛠️ Step-by-Step Installation Instructions

### Step 1: Download & Upload Package
Download the latest `Foodgo-PHP.zip` from your customer download dashboard. Upload the ZIP archive directly into your web hosting root folder (`public_html`, `htdocs`, or `/www/wwwroot/yourdomain.com`).

### Step 2: Extract Files
Using your hosting File Manager (or FTP/SSH unzip), extract the ZIP archive contents so that `index.html` sits directly inside your document root:

```text
/public_html/
├── index.html
├── admin.html
├── merchant.html
├── delivery.html
├── assets/
├── api/
├── includes/
├── config/
├── data/
├── storage/
├── uploads/
├── backups/
├── install.php
└── .htaccess
```

### Step 3: Verify File Permissions
Ensure the following directories have write permissions (`0755` or `0775`):
- `/data/` — Stores all JSON collections
- `/config/` — Stores application config
- `/storage/` — Stores installation lock & logs
- `/uploads/` — Stores product & category media
- `/backups/` — Stores automated backup ZIP archives

### Step 4: Open Domain in Browser
Navigate to your website URL:
```text
https://yourdomain.com/
```
If this is your first visit, you will automatically be greeted by the **Foodgo Web Installation Wizard** (`install.php`).

### Step 5: Complete the 1-Click Wizard
1. **Server Health Check**: The wizard checks PHP version, extensions, and directory permissions. Click **Next Step**.
2. **Store & Admin Setup**:
   - **Store Name**: e.g., `Foodgo Gourmet Kitchen`
   - **Currency**: e.g., `INR (₹)`, `USD ($)`, `EUR (€)`, `AED (د.إ)`
   - **Super Admin Username**: e.g., `Anasasiq`
   - **Super Admin Email**: e.g., `admin@yourdomain.com`
   - **Super Admin Password**: Enter a secure password (minimum 6 characters)
   - **UPI ID (Optional)**: e.g., `foodgo@upi`
3. **Execute Installation**: Click **Install Foodgo Now 🚀**.
4. The installer initializes all 25+ JSON data collections, securely hashes your admin password using Bcrypt (`password_hash()`), creates `storage/installed.lock`, and activates `.htaccess` security rules.

---

## 🛡️ Post-Installation Verification & Security

- **Installer Lock**: Once finished, `storage/installed.lock` blocks unauthorized re-runs of `install.php`.
- **Data Protection**: `/data/.htaccess` blocks all public web requests to your JSON data files.
- **Admin Access**: Log in at `https://yourdomain.com/admin.html` with your newly created administrator credentials.
