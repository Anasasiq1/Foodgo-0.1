# 🍔 Foodgo — Quick Start Guide

Welcome to **Foodgo**, a commercial-grade, multi-service gourmet ordering and delivery management system.

Foodgo is available in **two independent deployment editions**. Choose **ONE** deployment method that fits your server environment:

---

## 🧭 Choose Your Deployment Edition

```text
┌─────────────────────────────────────────────────────────────┐
│                   WHICH EDITION TO CHOOSE?                  │
└─────────────────────────────────────────────────────────────┘
                               │
               Are you using Shared Hosting,                   
            cPanel, aaPanel, or standard PHP?                 
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
             [YES]                            [NO]
               │                               │
        ┌──────────────┐                ┌──────────────┐
        │   MODE A:    │                │   MODE B:    │
        │  Foodgo PHP  │                │ Foodgo Node  │
        │ File Manager │                │  VPS / Cloud │
        └──────────────┘                └──────────────┘
               │                               │
       • Upload ZIP                     • Clone / Upload
       • Extract to public_html         • npm install
       • Open domain                    • npm run build
       • 1-Click install                • PM2 start
       • NO MySQL required              • High performance
       • NO Node required               • WebSocket & SSR
```

---

## ⚡ Option A: Foodgo PHP / File Manager Edition (Recommended for Shared Hosting)

Ideal for **cPanel, aaPanel, DirectAdmin, Plesk, Hostinger**, or any standard Apache/Nginx + PHP hosting.

### 5-Step Setup:
1. **Upload ZIP**: Upload `Foodgo-PHP.zip` to your website root directory (e.g. `/public_html` or `/www/wwwroot/yourdomain.com`).
2. **Extract**: Unzip the files directly into the root directory.
3. **Open Domain**: In your web browser, navigate to your domain:
   ```text
   https://yourdomain.com/
   ```
4. **Run 1-Click Installer**: The visual installer will automatically check write permissions for `/data/`, `/config/`, and `/storage/`, then configure your Super Admin account and store details.
5. **Start Selling**:
   - **Customer Web App**: `https://yourdomain.com/`
   - **Super Admin Portal**: `https://yourdomain.com/admin.html`
   - **Merchant Portal**: `https://yourdomain.com/merchant.html`
   - **Delivery Portal**: `https://yourdomain.com/delivery.html`

> 🚀 **Zero Database Requirement**: Foodgo PHP runs on an atomic, thread-safe JSON FileStore engine. You do **NOT** need to create MySQL databases or configure database users!

---

## 🚀 Option B: Foodgo Node.js / VPS Edition (Recommended for High Traffic & Containers)

Ideal for **VPS (Ubuntu/Debian), Dedicated Servers, Docker, AWS EC2, DigitalOcean, or Node.js hosting**.

### 5-Step Setup:
1. **Clone or Extract**:
   ```bash
   unzip Foodgo-Node.zip -d /var/www/foodgo
   cd /var/www/foodgo
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Build Frontend**:
   ```bash
   npm run build
   ```
4. **Start Production Server with PM2**:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
5. **Configure Nginx Reverse Proxy**:
   Point your domain's port 80/443 to `http://127.0.0.1:3000`.

---

## 📚 Detailed Documentation Directory

- **[PHP Installation Guide](PHP-INSTALLATION.md)**
- **[cPanel Step-by-Step Guide](CPANEL-INSTALLATION.md)**
- **[aaPanel Step-by-Step Guide](AAPANEL-INSTALLATION.md)**
- **[Node.js VPS Guide](NODE-INSTALLATION.md)**
- **[Super Admin Console Manual](SUPER-ADMIN.md)**
- **[Merchant Portal Manual](MERCHANT.md)**
- **[Delivery Partner Manual](DELIVERY.md)**
- **[REST API Reference](API.md)**
- **[API Keys & Client Apps](API-KEYS.md)**
- **[Webhooks Integration](WEBHOOKS.md)**
- **[Backup & Disaster Recovery](BACKUP.md)**
- **[Security Hardening](SECURITY.md)**
- **[Troubleshooting FAQ](TROUBLESHOOTING.md)**
