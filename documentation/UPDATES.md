# 🔄 Foodgo — Safe Update & Upgrade Guide

Because Foodgo is a commercial script, future version upgrades can be applied safely without overwriting your live products, orders, or custom store configurations.

---

## ⚡ Zero-Downtime Safe Upgrade Procedure

1. **Take a Backup**:
   - Download a full backup from **Super Admin** > **Backup** (or copy `/data/` and `/config/`).
2. **Download Update Package**:
   - Download the latest `Foodgo-Update-vX.X.zip` release.
3. **Upload & Overwrite System Files**:
   - Extract the update package into your website root.
   - The update package contains updated `index.html`, `admin.html`, `assets/`, `api/`, and `includes/`.
   - **Crucial**: The update package intentionally omits `/data/` and `/config/`, guaranteeing your custom products, categories, and settings remain completely intact!
4. **Clear Browser Cache**:
   - Refresh your browser (`Ctrl + F5` or `Cmd + Shift + R`).
