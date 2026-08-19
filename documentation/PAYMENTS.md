# 💳 Foodgo — Payment Integrations Manual

Foodgo is architected to operate out-of-the-box **without mandatory third-party payment gateways**, while providing plug-and-play support for instant QR payments and global card processors.

---

## ⚡ Supported Payment Methods

1. **Instant UPI QR Code (Google Pay, PhonePe, Paytm, BHIM, Amazon Pay)**:
   - Dynamic QR code generation embedding your merchant VPA and order amount.
   - Zero transaction gateway fees.
   - Works immediately on all UPI apps across India.

2. **Cash on Delivery (COD)**:
   - Riders collect cash on doorstep delivery.
   - Automatic change calculation and receipt tracking.

3. **Optional Gateway Integrations**:
   - **Stripe**: Credit/Debit Cards, Apple Pay, Google Pay.
   - **Razorpay**: NetBanking, Wallets, EMI.
