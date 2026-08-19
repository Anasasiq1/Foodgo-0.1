# 🔐 Foodgo — API Keys & External App Integration

Foodgo provides a secure **API Key Management System** allowing external mobile apps, third-party delivery dispatch systems, POS registers, and inventory managers to interact programmatically with your store.

---

## 🔑 Key Architecture

Each API key pair consists of:
- **Public Key** (`fg_pub_...`): Identifies the application client.
- **Secret Key** (`fg_sec_...`): Used for server-to-server request signing.
- **Assigned Scopes**: Granular access control (`read:products`, `create:orders`, `manage:inventory`, `read:stores`).

---

## 📡 Using API Keys in Requests

Send the public key in the `X-API-Key` request header:

```bash
curl -X GET "https://yourdomain.com/api/products" \
  -H "X-API-Key: fg_pub_84b72ef910a34b9d" \
  -H "Content-Type: application/json"
```
