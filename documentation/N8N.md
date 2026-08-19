# ⚙️ Foodgo — n8n Workflow Automation

Foodgo connects seamlessly with **n8n** (self-hosted or cloud) to automate backend business logic, customer notifications, accounting exports, and CRM syncing.

---

## 🚀 Setup Flow with n8n

1. In your **n8n** instance, create a new workflow with a **Webhook** trigger node (Method: `POST`).
2. Copy the generated Webhook URL from n8n.
3. In **Foodgo Super Admin** > **Webhooks**, create a new webhook pointing to your n8n URL with events `order.created` and `order.status_updated`.
4. Test with a sample order. You can now pipe Foodgo orders into Google Sheets, Slack, Telegram, QuickBooks, or email marketing pipelines!
