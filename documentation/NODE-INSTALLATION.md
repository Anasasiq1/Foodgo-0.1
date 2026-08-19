# 🚀 Foodgo Node.js / VPS Edition — Installation Manual

The **Foodgo Node.js Edition** provides high-performance, full-stack JavaScript runtime capabilities powered by Express, Vite, and TypeScript. It is designed for VPS servers, cloud containers, and dedicated infrastructure.

---

## 📋 System Requirements

- **Operating System**: Ubuntu 20.04 / 22.04 LTS, Debian 11/12, CentOS 8/9, or Alpine Linux.
- **Node.js**: Node.js 18.x LTS or 20.x LTS.
- **Package Manager**: `npm` 9.x+ or `yarn` / `bun`.
- **Process Manager**: `pm2` (recommended for production daemonizing).
- **Reverse Proxy**: Nginx with SSL (Let's Encrypt / Certbot).

---

## 🛠️ Step-by-Step Installation on VPS

### Step 1: Install Node.js & PM2 (if not already installed)
```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Extract or Clone Foodgo Project
```bash
sudo mkdir -p /var/www/foodgo
sudo chown -R $USER:$USER /var/www/foodgo
unzip Foodgo-Node.zip -d /var/www/foodgo
cd /var/www/foodgo
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Environment Variables
```bash
cp .env.example .env
nano .env
```
Ensure `PORT=3000` is defined along with your application details.

### Step 5: Build Production Assets
```bash
npm run build
```

### Step 6: Start Application with PM2
```bash
# Start server process
pm2 start ecosystem.config.cjs

# Save PM2 process list to auto-start on server reboot
pm2 save
pm2 startup
```

### Step 7: Configure Nginx Reverse Proxy
Create an Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/foodgo
```
Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/foodgo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Setup Free SSL with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔍 Useful PM2 Commands

```bash
# View live application logs
pm2 logs foodgo

# Check runtime memory and CPU status
pm2 status

# Restart the application
pm2 restart foodgo

# Stop the application
pm2 stop foodgo
```
