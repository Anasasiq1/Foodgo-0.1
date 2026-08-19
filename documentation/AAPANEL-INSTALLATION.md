# ⚡ Foodgo — aaPanel Step-by-Step Installation Guide

This guide details how to deploy **Foodgo (PHP Edition)** on a server managed by **aaPanel** (Linux Web Panel).

---

## 📋 Prerequisites on aaPanel

- **aaPanel Web Server**: Nginx or Apache installed from aaPanel App Store.
- **PHP Version**: PHP 7.4 / 8.0 / 8.1 / 8.2 installed.

---

## 🛠️ Step-by-Step Instructions

### Step 1: Add Website in aaPanel
1. In aaPanel, navigate to **Website** > **Add site**.
2. **Domain**: Enter your domain name (e.g. `hm-q.in`).
3. **Database**: Select **Do not create** (Foodgo PHP is 100% databaseless!).
4. **PHP Version**: Select PHP 7.4 or higher (e.g., PHP-8.1).
5. Click **Submit**.

### Step 2: Open Site Directory in aaPanel File Manager
1. Click on the document root path for your site (e.g., `/www/wwwroot/hm-q.in`).
2. Delete the default placeholder files (`index.html` and `404.html` created by aaPanel).

### Step 3: Upload and Extract `Foodgo-PHP.zip`
1. Click **Upload** > select `Foodgo-PHP.zip`.
2. Once uploaded, right-click `Foodgo-PHP.zip` > click **Uncompress**.
3. Choose the website directory as destination (`/www/wwwroot/hm-q.in`) and extract.

### Step 4: Verify Folder Permissions
1. In aaPanel File Manager, ensure the website folder owner is `www:www` (default for aaPanel).
2. Ensure permissions are set to `755` for directories and `644` for files.

### Step 5: Nginx URL Rewrite (If using Nginx)
If you are using **Nginx** rather than Apache, open **Website** > click your site name > **URL rewrite**, and paste the following rewrite block:

```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}

location /install {
    try_files $uri $uri/ /install/index.php?$query_string;
}

location ~ /\.(data|config|storage|backups) {
    deny all;
    return 404;
}

location ~ \.(json|sql|lock|log|env)$ {
    deny all;
    return 404;
}

location / {
    try_files $uri $uri/ /index.html;
}
```
*(If using Apache/LiteSpeed on aaPanel, the included root `.htaccess` handles this automatically with zero manual configuration!)*

### Step 6: Enable SSL (HTTPS)
1. Go to **Website** > click your site > **SSL**.
2. Select **Let's Encrypt** > check your domain > click **Apply**.
3. Toggle **Force HTTPS**.

### Step 7: Run Web Installer
Open `https://hm-q.in/` in your browser to launch the 1-Click Foodgo Installer, configure your Super Admin password, and launch your store!
