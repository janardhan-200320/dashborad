# 💳 Payment Gateway Integration Guide

Complete guide for connecting Razorpay, Stripe, and PayPal payment gateways.

---

## 🎯 Overview

Your booking system now supports **three major payment gateways**:

| Gateway | Best For | Supported Regions |
|---------|----------|-------------------|
| 💳 **Razorpay** | India | India |
| 💰 **Stripe** | Global | 45+ Countries |
| 🅿️ **PayPal** | Global | 200+ Countries |

---

## 📍 How to Access

```
Dashboard → Admin Center → Integrations → Payments
```

You'll see three payment gateway cards with **"Connect"** buttons.

---

## 1️⃣ Razorpay Setup (India)

### **Step 1: Get Razorpay Credentials**

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development)
4. Copy **Key ID** and **Key Secret**

### **Step 2: Connect in Admin**

1. Click **"Connect"** on Razorpay card
2. Enter credentials:
   ```
   Key ID:         rzp_test_XXXXXXXXXXXX
   Key Secret:     YYYYYYYYYYYYYYYY
   Webhook Secret: (optional)
   ```
3. Click **"Save & Connect"**

### **Test Cards:**
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

### **Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
```

---

## 2️⃣ Stripe Setup (Global)

### **Step 1: Get Stripe Credentials**

1. Sign up at [https://stripe.com](https://stripe.com)
2. Go to **Developers** → **API Keys**
3. Find or create your keys
4. Copy **Publishable Key** and **Secret Key**

### **Step 2: Connect in Admin**

1. Click **"Connect"** on Stripe card
2. Enter credentials:
   ```
   Publishable Key: pk_test_XXXXXXXXXXXX
   Secret Key:      sk_test_XXXXXXXXXXXX
   Webhook Secret:  whsec_XXXX (optional)
   ```
3. Click **"Save & Connect"**

### **Test Cards:**
```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Requires Auth:     4000 0025 0000 3155
CVV: Any 3 digits
Expiry: Any future date
```

### **Environment Variables:**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX
```

---

## 3️⃣ PayPal Setup (Global)

### **Step 1: Get PayPal Credentials**

1. Sign up at [https://developer.paypal.com](https://developer.paypal.com)
2. Go to **My Apps & Credentials**
3. Create a new app or select existing
4. Copy **Client ID** and **Secret**

### **Step 2: Connect in Admin**

1. Click **"Connect"** on PayPal card
2. Select environment:
   - **Sandbox** (for testing)
   - **Live** (for production)
3. Enter credentials:
   ```
   Client ID:     AXXXXXXXXXXXXXXXXXXX
   Client Secret: EYYYYYYYYYYYYYYYYYY
   ```
4. Click **"Save & Connect"**

### **Test Accounts:**

Create test accounts at: https://developer.paypal.com/dashboard/accounts

```
Sandbox Personal: sb-xxxxx@personal.example.com
Sandbox Business:  sb-xxxxx@business.example.com
Password: Set during creation
```

### **Environment Variables:**
```env
PAYPAL_CLIENT_ID=AXXXXXXXXXXXXXXXXXXX
PAYPAL_CLIENT_SECRET=EYYYYYYYYYYYYYYYYYY
PAYPAL_MODE=sandbox  # or 'live'
```

---

## 🔄 Using Multiple Payment Gateways

You can connect **all three** gateways and let customers choose:

### **Frontend Payment Selection:**

```tsx
// In Step 3 of public-booking.tsx
<div className="payment-methods">
  {razorpayConnected && (
    <button onClick={payWithRazorpay}>
      💳 Pay with Razorpay
    </button>
  )}
  
  {stripeConnected && (
    <button onClick={payWithStripe}>
      💰 Pay with Stripe
    </button>
  )}
  
  {paypalConnected && (
    <button onClick={payWithPayPal}>
      🅿️ Pay with PayPal
    </button>
  )}
</div>
```

### **Backend Route Structure:**

```
POST /api/payment/razorpay/create-order
POST /api/payment/razorpay/verify

POST /api/payment/stripe/create-intent
POST /api/payment/stripe/verify

POST /api/payment/paypal/create-order
POST /api/payment/paypal/capture
```

---

## 📦 Implementation Steps

### **1. Install Required Packages**

```bash
# Razorpay
npm install razorpay

# Stripe
npm install stripe @stripe/stripe-js

# PayPal
npm install @paypal/checkout-server-sdk
```

### **2. Update Backend Routes**

Currently, the backend has placeholder routes. Uncomment and implement:

**Razorpay** (`server/routes.ts` lines 285-370)
**Stripe** (add new routes)
**PayPal** (add new routes)

### **3. Update Frontend Payment Flow**

Modify `client/src/pages/public-booking.tsx` Step 3:

```tsx
const initiatePayment = async (gateway: 'razorpay' | 'stripe' | 'paypal') => {
  switch(gateway) {
    case 'razorpay':
      await initiateRazorpayPayment();
      break;
    case 'stripe':
      await initiateStripePayment();
      break;
    case 'paypal':
      await initiatePayPalPayment();
      break;
  }
};
```

---

## 🎨 UI Customization

### **Payment Method Icons:**

Already configured in the UI:
- Razorpay: 💳
- Stripe: 💰
- PayPal: 🅿️

### **Brand Colors:**

```css
Razorpay: #0C2F54 (Dark Blue)
Stripe:   #635BFF (Purple)
PayPal:   #0070BA (Blue)
```

---

## 🔒 Security Best Practices

### **1. Never Expose Secret Keys in Frontend**

❌ **Bad:**
```typescript
const razorpay = new Razorpay({
  key_secret: 'your_secret'  // Never do this!
});
```

✅ **Good:**
```typescript
// Backend only
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

### **2. Verify Payments on Backend**

Always verify payment signatures/webhooks on the server:

```typescript
// Razorpay
const generated_signature = crypto
  .createHmac('sha256', secret)
  .update(`${order_id}|${payment_id}`)
  .digest('hex');

if (generated_signature !== razorpay_signature) {
  throw new Error('Invalid signature');
}
```

### **3. Use HTTPS in Production**

All payment gateways require HTTPS for live transactions.

### **4. Store Credentials Securely**

```sql
-- Example database table
CREATE TABLE payment_credentials (
  id INT PRIMARY KEY,
  gateway VARCHAR(50),
  encrypted_key TEXT,
  encrypted_secret TEXT,
  created_at TIMESTAMP
);
```

---

## 🧪 Testing Workflow

### **Development (Test Mode):**

1. Connect gateway with **test credentials**
2. Create paid booking
3. Use **test cards/accounts**
4. Verify payment success
5. Check invoice generation
6. Verify webhook callbacks

### **Production (Live Mode):**

1. Switch to **live credentials**
2. Update environment variables
3. Enable webhooks
4. Test with real payment (small amount)
5. Monitor dashboard for transactions

---

## 📊 Payment Flow Comparison

| Step | Razorpay | Stripe | PayPal |
|------|----------|--------|--------|
| 1. Create Order | `/orders.create()` | `/paymentIntents.create()` | `/orders.create()` |
| 2. Show Checkout | Razorpay Checkout | Stripe Elements | PayPal Buttons |
| 3. Customer Pays | Card/UPI/NetBanking | Card | PayPal Account |
| 4. Callback | `handler()` | `confirmPayment()` | `onApprove()` |
| 5. Verify | Signature | Payment Intent | Capture Order |
| 6. Invoice | Auto-generated | Auto-generated | Auto-generated |

---

## 🌍 Region-Specific Recommendations

### **India:**
- Primary: **Razorpay** (UPI, Cards, NetBanking)
- Backup: **PayPal** (International customers)

### **United States:**
- Primary: **Stripe** (Cards, Apple Pay, Google Pay)
- Backup: **PayPal**

### **Europe:**
- Primary: **Stripe** (SEPA, iDEAL, Bancontact)
- Backup: **PayPal**

### **Global:**
- Primary: **Stripe** (45+ countries)
- Alternative: **PayPal** (200+ countries)

---

## 💰 Pricing Comparison

| Gateway | Standard Fee | International Fee | Setup Fee |
|---------|--------------|-------------------|-----------|
| Razorpay | 2% + ₹0 | 3% + ₹2 | Free |
| Stripe | 2.9% + $0.30 | +1% | Free |
| PayPal | 2.9% + $0.30 | +1.5% | Free |

*Fees as of 2025, subject to change*

---

## 🆘 Troubleshooting

### **Issue: "Connect" button doesn't open dialog**
**Solution:** Check browser console for errors, ensure Dialog component is imported

### **Issue: Configuration not saving**
**Solution:** Check localStorage permissions, verify API endpoint is accessible

### **Issue: Payment fails with "Invalid credentials"**
**Solution:** 
- Verify you copied correct keys
- Check for extra spaces
- Ensure using correct mode (test vs live)

### **Issue: Webhook not receiving callbacks**
**Solution:**
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Enable webhook in gateway dashboard

---

## 📚 Documentation Links

### **Razorpay:**
- Docs: https://razorpay.com/docs/
- API Keys: https://dashboard.razorpay.com/app/keys
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

### **Stripe:**
- Docs: https://stripe.com/docs/
- API Keys: https://dashboard.stripe.com/apikeys
- Test Cards: https://stripe.com/docs/testing

### **PayPal:**
- Docs: https://developer.paypal.com/docs/
- Dashboard: https://developer.paypal.com/dashboard/
- Sandbox: https://developer.paypal.com/dashboard/accounts

---

## ✅ Checklist Before Going Live

- [ ] Test credentials work in development
- [ ] All test cards/accounts pass
- [ ] Webhooks configured and verified
- [ ] Invoice generation works
- [ ] Email notifications sent
- [ ] Error handling implemented
- [ ] Logging enabled
- [ ] HTTPS enabled
- [ ] Live credentials configured
- [ ] Small live transaction tested
- [ ] Refund process tested
- [ ] Customer support ready

---

## 🎉 Summary

**You can now:**
- ✅ Connect Razorpay for India
- ✅ Connect Stripe for global payments
- ✅ Connect PayPal for 200+ countries
- ✅ Manage all gateways from Admin UI
- ✅ Switch between test and live modes
- ✅ Auto-generate invoices for all gateways
- ✅ Support multiple payment methods

**Next Steps:**
1. Choose your primary gateway based on region
2. Install required npm packages
3. Implement payment flow in frontend
4. Test thoroughly with test credentials
5. Go live with real credentials

Your booking system is now **payment-ready**! 🚀
