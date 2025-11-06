# 🔐 Razorpay Integration Guide

## Overview
This guide shows you how to integrate Razorpay payment gateway into your booking system.

---

## 📦 Step 1: Install Razorpay Package

```bash
npm install razorpay
```

---

## 🔑 Step 2: Get Razorpay API Keys

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development)
4. Later, generate **Live Keys** (for production)

---

## 🌐 Step 3: Set Environment Variables

Create `.env` file in `dashborad/` folder:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
```

⚠️ **Never commit `.env` file to Git!**

---

## 🎯 Step 4: Backend Integration (Already Added!)

The following routes are already added to `server/routes.ts`:

### Route 1: Create Payment Order
**Endpoint:** `POST /api/payment/create-order`

```typescript
// Request body
{
  "amount": 1500,           // Amount in INR
  "currency": "INR",
  "receipt": "booking_123",
  "notes": {
    "serviceId": "abc",
    "customerId": "xyz"
  }
}

// Response
{
  "success": true,
  "order_id": "order_XXXXXX",
  "amount": 150000,         // Amount in paise
  "currency": "INR"
}
```

### Route 2: Verify Payment
**Endpoint:** `POST /api/payment/verify`

```typescript
// Request body
{
  "razorpay_order_id": "order_XXXXX",
  "razorpay_payment_id": "pay_XXXXX",
  "razorpay_signature": "abc123...",
  "bookingData": {
    // All booking details
  }
}

// Response
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": { /* booking details */ },
  "payment_id": "pay_XXXXX"
}
```

---

## 🎨 Step 5: Frontend Integration

Update `client/src/pages/public-booking.tsx`:

### A. Add Razorpay Script

Add to `index.html` (before closing `</head>`):

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### B. Create Payment Function

Replace the mock payment button in **Step 3** with:

```typescript
const initiateRazorpayPayment = async () => {
  try {
    // 1. Create order on backend
    const orderResponse = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(callData.priceAmount),
        currency: 'INR',
        receipt: `booking_${serviceId}_${Date.now()}`,
        notes: {
          serviceId: serviceId,
          serviceName: service.name,
          customerName: formData.name,
        }
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error('Failed to create order');
    }

    // 2. Initialize Razorpay Checkout
    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Get from backend or env
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Your Company Name',
      description: service.name,
      order_id: orderData.order_id,
      handler: async function (response: any) {
        // 3. Payment successful - verify on backend
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingData: {
              serviceId,
              serviceName: service.name,
              customerName: formData.name,
              email: formData.email,
              phone: formData.phone,
              date: selectedDate?.toISOString().split('T')[0],
              time: selectedTime,
              // ... other booking details
            }
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          // 4. Payment verified - generate invoice and move to confirmation
          await handleContinue(); // This will create invoice
        } else {
          alert('Payment verification failed');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#9333ea', // Purple to match your theme
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      }
    };

    // @ts-ignore - Razorpay is loaded via script tag
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    console.error('Payment error:', error);
    alert('Failed to initiate payment. Please try again.');
  }
};
```

### C. Update Payment Button

In Step 3 payment options, replace the "Complete Payment" button:

```tsx
<Button
  onClick={initiateRazorpayPayment}
  className="bg-purple-600 hover:bg-purple-700"
  size="lg"
>
  Pay ₹{parseFloat(callData.priceAmount).toFixed(2)}
</Button>
```

---

## 🔄 Complete Flow

```
1. User fills booking form (Step 1 & 2)
2. User clicks payment method (Step 3)
3. Frontend calls: POST /api/payment/create-order
4. Backend creates Razorpay order
5. Frontend opens Razorpay checkout modal
6. User completes payment on Razorpay
7. Razorpay calls handler with payment details
8. Frontend calls: POST /api/payment/verify
9. Backend verifies payment signature
10. Backend saves booking to database
11. Frontend generates invoice (already implemented!)
12. Invoice appears in Dashboard → Invoices
13. User sees confirmation (Step 4)
```

---

## ✅ Enable Real Razorpay in Backend

In `server/routes.ts`, uncomment the Razorpay code blocks:

### Route 1: Create Order
```typescript
// Uncomment this block (lines ~285-300):
const razorpay = new (await import('razorpay')).default({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const order = await razorpay.orders.create({
  amount: amount * 100,
  currency: currency,
  receipt: receipt || `receipt_${Date.now()}`,
  notes: notes || {},
});

return res.json({
  success: true,
  order_id: order.id,
  amount: order.amount,
  currency: order.currency,
});
```

### Route 2: Verify Payment
```typescript
// Uncomment this block (lines ~320-335):
const crypto = await import('crypto');
const secret = process.env.RAZORPAY_KEY_SECRET || '';
const generated_signature = crypto
  .createHmac('sha256', secret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generated_signature !== razorpay_signature) {
  return res.status(400).json({ 
    success: false, 
    error: "Payment verification failed" 
  });
}
```

Remove the mock response blocks.

---

## 🧪 Testing

### Test Mode (Use Test Keys)
Razorpay provides test cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

### Test UPI:
- UPI ID: `success@razorpay`
- UPI ID: `failure@razorpay`

---

## 🚀 Production Checklist

- [ ] Replace Test Keys with Live Keys
- [ ] Update webhook URL in Razorpay Dashboard
- [ ] Enable payment methods (UPI, Cards, NetBanking, Wallets)
- [ ] Set up webhook signature verification
- [ ] Add proper error handling
- [ ] Add payment retry logic
- [ ] Test refund flow
- [ ] Set up payment notifications/emails
- [ ] Add proper logging
- [ ] Enable 3D Secure for cards

---

## 📚 Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://razorpay.com/docs/payments/server-integration/nodejs/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## 💡 Key Points

1. **Never expose Key Secret** in frontend code
2. **Always verify** payment on backend
3. **Use webhooks** for payment status updates
4. **Test thoroughly** before going live
5. **Invoice generation** is already integrated (lines 604-637 in `public-booking.tsx`)

---

## 🆘 Support

If you face issues:
1. Check Razorpay Dashboard → Payment Logs
2. Check browser console for errors
3. Check server logs for API errors
4. Verify signature calculation
5. Ensure environment variables are loaded correctly
