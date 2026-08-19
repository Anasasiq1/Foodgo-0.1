# 👑 Foodgo — Super Admin Manual

The **Foodgo Super Administrator Console** provides full multi-tenant command and control over all stores, orders, products, modules, curries, customer support chats, revenue analytics, and system integrations.

---

## 🚪 Accessing the Super Admin Console

- **URL**: `https://yourdomain.com/admin.html` (or `https://yourdomain.com/admin.php` or `https://yourdomain.com/?admin=true`)
- **Default Username**: `Anasasiq` (or the username set during installation)
- **Default Password**: `admin123` (or the password configured during installation)

---

## 📊 Management Tabs & Modules

### 1. Dashboard Overview
- **Live Revenue Metrics**: Total platform earnings, day-over-day growth rate.
- **Order Stream**: Real-time counter of pending, in-kitchen, out-for-delivery, and completed orders.
- **Quick Actions**: One-click product creation, store status toggling, and emergency kitchen pause.

### 2. Multi-Service Modules Manager
Manage the 5 core delivery modules:
- 🍔 **Food**: Restaurants, burgers, biriyanis, porotta meals.
- 🛒 **Grocery**: Daily essentials, dairy, produce, pantry items.
- 💊 **Pharmacy**: First aid, certified wellness items.
- 💄 **Cosmetics**: Skincare, perfumes, luxury makeup.
- 📦 **Stationery**: Books, study supplies, office items.
- *Capabilities*: Enable/disable any service module, modify icons, change banner titles, reorder display hierarchy.

### 3. Products & Variant Catalog
- **Add / Edit Products**: Set titles, subtitles, descriptions, base prices, preparation time, calories, and spicy ratings.
- **Media Upload**: Direct image upload with automated MIME verification.
- **Option Groups & Addons**: Attach cheeses, patties, sauces, or drink sizes.
- **Curry & Salna System**: Link side gravies (Beef Chilli, Chicken Salna, Veg Kurma) to food items.

### 4. Live Customer Orders & Dispatch
- Inspect live incoming orders with item breakdowns, customer phone numbers, delivery addresses, and payment statuses.
- Change order lifecycle states: `Pending` ➔ `In Kitchen` ➔ `In Transit` ➔ `Delivered` ➔ `Cancelled`.

### 5. Real-Time Customer Support & Voice Notes
- 2-way live chat with customers.
- Listen to customer-recorded voice notes directly with the inline audio waveform player.
- Reply via instant message or status updates linked directly to customer order IDs.

### 6. Payments & Revenue Tracking
- Track UPI QR payments, Cash on Delivery collections, and payment card transactions.
- Filter payments by status (`Paid`, `Pending`, `Failed`).

### 7. Backup & System Health
- **1-Click Backup**: Generate a timestamped `.zip` archive containing all JSON storage data.
- **Audit Logs**: Review chronological administrative security actions, login events, and IP addresses.
