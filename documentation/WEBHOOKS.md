# 🪝 Foodgo — Webhooks & Automation Integration

Foodgo features an outbound **Webhook Event System** designed to trigger external automation workflows (such as n8n, Zapier, Make, Slack, or custom endpoints) in real time when key actions occur.

---

## ⚡ Supported Events

| Event Name | Description |
| :--- | :--- |
| `order.created` | Triggered immediately when a customer submits a new order. |
| `order.status_updated` | Triggered when order status changes (e.g. In Kitchen, Out for Delivery, Delivered). |
| `payment.received` | Triggered upon successful payment verification. |
| `customer.registered` | Triggered when a new customer profile is created. |

---

## 🛡️ Webhook Security & HMAC Verification

Foodgo computes a SHA256 HMAC signature of the JSON payload using your webhook secret:
- Header: `X-Foodgo-Signature: sha256=<signature>`
- Allows receiving servers to verify that the payload originated directly from your Foodgo store.
