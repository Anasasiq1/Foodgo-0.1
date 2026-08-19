# 🛡️ Foodgo — Security Hardening & Best Practices

Foodgo is engineered with defense-in-depth security principles across storage, API, and authentication layers.

---

## 🔒 Implemented Security Layers

1. **Storage Isolation via `.htaccess`**:
   - Web requests to `/data/`, `/config/`, `/storage/`, `/backups/`, and `/app/` are blocked with `403 Forbidden` (`Require all denied`).
   - Direct requests to `.json`, `.sql`, `.lock`, `.log`, and `.env` files are blocked globally.

2. **Atomic Writes & Concurrency Locking (`flock`)**:
   - Read operations acquire shared locks (`LOCK_SH`).
   - Write operations acquire exclusive locks (`LOCK_EX`) with temporary file creation and atomic rename (`rename()`) to prevent race conditions.

3. **Bcrypt Password Security**:
   - All administrator and merchant credentials use PHP `password_hash($pass, PASSWORD_BCRYPT)` with `password_verify()`. Plaintext passwords are never stored.

4. **Session Protection**:
   - Admin sessions utilize cryptographic tokens with `HttpOnly` and `SameSite=Strict` cookie flags.

5. **Upload Validation**:
   - File uploads strictly validate MIME types (`finfo_file`), file extension whitelists, and maximum file sizes (20MB limit). Executable file uploads (`.php`, `.phtml`, `.exe`, `.sh`) are strictly rejected.
