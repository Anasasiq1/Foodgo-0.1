# 🔌 Foodgo — Unified REST API Reference

Both the **PHP Edition** (`/api/*.php`) and **Node.js Edition** (`/api/*`) adhere to the same standardized JSON REST API contract.

---

## 🔑 Authentication
- **Admin Auth**: `X-Admin-Token` header, or `Authorization: Bearer <token>`, or session cookie.
- **Client App Auth**: `X-API-Key: <public_key>` for external integrations.

---

## 📌 Public & Store Endpoints

### 1. Multi-Service Modules
- `GET /api/modules` — Retrieve active delivery modules (Food, Grocery, Pharmacy, Cosmetics, Stationery).

### 2. Product Categories
- `GET /api/categories` — Retrieve categories. Optional query: `?moduleId=food`.

### 3. Products Catalog
- `GET /api/products` — Retrieve active products.
  - Query parameters:
    - `?search=<keyword>` — Keyword search.
    - `?category=<category_id>` — Category filter.
    - `?moduleId=<module_id>` — Service module filter.

### 4. Curries & Salna Options
- `GET /api/curries` — Retrieve available gravies and curry selections.

### 5. Delivery Settings & Slots
- `GET /api/delivery-settings` — Retrieve delivery fees, free delivery thresholds, and active time slots.

### 6. Orders
- `GET /api/orders` — List customer orders.
- `POST /api/orders` — Create new customer order.
  ```json
  {
    "items": [...],
    "subtotal": 16.48,
    "taxes": 0.30,
    "deliveryFees": 1.50,
    "total": 18.28,
    "paymentMethod": "UPI",
    "customerName": "Anas Asiq",
    "customerPhone": "+91 9876543210",
    "deliveryAddress": "Kozhikode, Kerala"
  }
  ```

---

## 👑 Super Admin Endpoints (Requires Auth)

- `POST /api/admin/login` — Admin login (returns auth token & session cookie).
- `GET /api/admin/me` — Check current admin authentication status.
- `POST /api/admin/logout` — Invalidate admin session.
- `GET /api/admin/dashboard` — Summary metrics (Revenue, total orders, customers).
- `POST /api/admin/products` — Create or update product.
- `DELETE /api/admin/products/:id` — Delete product.
- `PATCH /api/admin/orders/:id/status` — Update order status.
- `POST /api/admin/backup` — Generate data backup archive.
- `GET /api/admin/audit-logs` — Retrieve system audit trail logs.
