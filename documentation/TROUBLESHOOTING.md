# ❓ Foodgo — Troubleshooting & FAQs

Frequently encountered scenarios and straightforward resolutions:

---

### Q1: "Installer appears again when I open my domain"
- **Cause**: The file `/storage/installed.lock` is missing or the `/storage/` directory was not writable.
- **Solution**: Ensure `/storage/` directory has write permission (`0755`) and complete the installation wizard once. Foodgo will create `installed.lock` to permanently lock the installer.

---

### Q2: "403 Forbidden error on API endpoints"
- **Cause**: Apache `mod_rewrite` is disabled, or `.htaccess` is not being read.
- **Solution**: In your web server configuration (or hosting control panel), ensure `AllowOverride All` is active and `mod_rewrite` is enabled.

---

### Q3: "Products are not saving or image upload fails"
- **Cause**: Insufficient write permissions on `/data/` or `/uploads/`.
- **Solution**: In your File Manager, right-click `/data/` and `/uploads/` > **Permissions** > set to `755` (or `775` on some shared hosts).

---

### Q4: "I forgot my Super Admin password"
- **Solution**: Open `/data/users.json` in File Manager. Locate the admin record and replace `password` with a newly generated Bcrypt hash (or delete `storage/installed.lock` to re-run the admin credential setup step in `install.php`).
