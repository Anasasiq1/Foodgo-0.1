# 📜 Foodgo — Release Changelog

All notable changes to the **Foodgo Commercial Platform** are documented in this file.

---

## [v0.2.0] — Dual Deployment & 100% Databaseless Architecture
### Added
- **Dual Deployment Architecture**:
  - **Mode A (Foodgo PHP)**: 100% Databaseless JSON FileStore edition for cPanel, aaPanel, and shared PHP hosting with zero MySQL/Node requirements.
  - **Mode B (Foodgo Node)**: High-performance VPS edition with Express, TypeScript, and PM2 support.
- **1-Click Web Installer**: Complete visual setup wizard in `install.php` for initializing JSON storage and admin credentials without database inputs.
- **Atomic FileStore Engine**: Thread-safe file operations with `flock()` exclusive/shared locking and atomic temporary file writes.
- **Multi-Service Modules**: Switcher for Food, Grocery, Pharmacy, Cosmetics, and Stationery.
- **Salna & Curry System**: Customizable spicy gravy selections for Porotta and Biriyani items.
- **Customer Care Voice Notes**: Real-time microphone audio recording with waveform playback.
- **Commercial Documentation Suite**: 18 comprehensive guides covering cPanel, aaPanel, Node VPS, REST API, Webhooks, and Security.

---

## [v0.1.0] — Initial Release
- Gourmet food ordering interface with interactive burger customizer.
- Instant UPI QR payment and simulated checkout.
- Multi-channel customer order management and super admin dashboard.
