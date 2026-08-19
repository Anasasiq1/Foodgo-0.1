# 💾 Foodgo — Backup & Disaster Recovery Guide

Foodgo incorporates a built-in backup utility ensuring data portability and zero-loss operations.

---

## ⚡ Creating Backups

### Method 1: Super Admin Console (1-Click)
1. Go to **Super Admin** (`/admin.html`) > **Settings** > **Backup & Storage**.
2. Click **Create Full Backup Now**.
3. Foodgo bundles the entire `/data/` and `/config/` directories into a timestamped `.zip` archive inside `/backups/`.
4. Click **Download Backup** to save the archive to your local machine.

### Method 2: Manual File Manager Copy
Because Foodgo PHP uses pure JSON file storage, you can create a complete backup at any time by simply downloading the `/data/` folder from your hosting File Manager.

---

## 🔄 Restoring from Backup

1. Unzip your backup archive.
2. Replace the files inside `/data/` with the restored JSON files.
3. Refresh your admin portal. All products, orders, categories, and logs are immediately restored!
