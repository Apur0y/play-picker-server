# SSLCommerz Payment System - Quick Start Checklist

Complete this checklist to get the payment system up and running.

## Backend Setup

### ✅ Pre-requisites
- [ ] Node.js installed (v16+)
- [ ] MongoDB instance running or connection string ready
- [ ] Git repository cloned/setup

### ✅ Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

This will install the newly added `axios` package for SSLCommerz API calls.

### ✅ Step 2: Setup Environment Variables
1. Copy `.env.example` to `.env`
2. Update the values:

```env
DB_URL=your_mongodb_connection_string
NODE_ENV=development
SSL_STORE_ID=playp6992e46d93627
SSL_STORE_PASSWORD=playp6992e46d93627@ssl
SSL_SESSION_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SERVER_URL=https://playpicker.vercel.app
PORT=3000
```

### ✅ Step 3: Start the Backend Server
```bash
npm run dev
# or
yarn dev
```

You should see:
```
Server is running on port 3000
Connected to MongoDB
```

### ✅ Step 4: Verify API Structure
Check that these folders exist:
```
src/
  └── app/
      ├── modules/
      │   └── payment/          ← NEW
      │       ├── payment.interface.ts
      │       ├── payment.model.ts
      │       ├── payment.service.ts
      │       ├── payment.controler.ts
      │       └── payment.routes.ts
      └── routes/
          └── index.ts           ← UPDATED
```

### ✅ Step 5: Test API Endpoints

**Test Backend is Running:**
```bash
curl http://localhost:3000/api/payment/stats/overview
```

Should return a response (may be empty if no payments yet).

**Test Payment Initiation:**
```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "packageId": "pkg456",
    "amount": 500,
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "01912345678"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Payment session initiated successfully",
  "data": {
    "url": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?...",
    "transactionId": "TXN-1707864123456-ABC123DEF",
    "sessionKey": "..."
  }
}
```

## Frontend Setup (Optional - for Testing)

### ✅ Step 1: Create Payment Test Page
Create a simple HTML page to test:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Payment Test</title>
</head>
<body>
  <h1>Test Payment</h1>
  <form id="paymentForm">
    <input type="text" id="name" placeholder="Full Name" required>
    <input type="email" id="email" placeholder="Email" required>
    <input type="tel" id="phone" placeholder="Phone" required>
    <button type="submit">Pay 500 BDT</button>
  </form>

  <script>
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const response = await fetch('http://localhost:3000/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          packageId: 'test-pkg',
          amount: 500,
          customerName: document.getElementById('name').value,
          customerEmail: document.getElementById('email').value,
          customerPhone: document.getElementById('phone').value
        })
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = data.data.url;
      } else {
        alert('Error: ' + data.message);
      }
    });
  </script>
</body>
</html>
```

### ✅ Step 2: Setup SSLCommerz Account
1. Already have credentials:
   - Store ID: `playp6992e46d93627`
   - Store Password: `playp6992e46d93627@ssl`
   - Dashboard: https://sandbox.sslcommerz.com/manage/

2. Note: You're using SANDBOX. For production, you'll need:
   - Live SSLCommerz account
   - Different Store ID and Password
   - Update API endpoints to production URLs

## Testing Scenarios

### ✅ Test 1: Complete Payment Flow
1. Start backend server
2. Call initiate payment API
3. Get the payment URL
4. Open URL in browser (it will redirect to SSLCommerz)
5. Use test card: `4111111111111111`
6. Complete transaction
7. System should update payment status

### ✅ Test 2: Payment Details Retrieval
After completing a payment:
```bash
curl http://localhost:3000/api/payment/details/YOUR_TRANSACTION_ID
```

Should return payment details with status `completed`.

### ✅ Test 3: User Payment History
```bash
curl http://localhost:3000/api/payment/user/user123
```

Should list all payments for user.

### ✅ Test 4: Payment Statistics
```bash
curl http://localhost:3000/api/payment/stats/overview
```

Should show payment totals and breakdown.

## Troubleshooting

### Issue: "Cannot find module 'axios'"
**Solution:**
```bash
npm install axios
```

### Issue: "SSLCommerz API error: FAILED"
**Check:**
- [ ] Store ID is correct
- [ ] Store Password is correct
- [ ] Internet connection working
- [ ] SSLCommerz servers are up
- [ ] Amount is greater than 0

### Issue: "Payment not confirming after completion"
**Check:**
- [ ] IPN endpoint is accessible (`/api/payment/ipn`)
- [ ] Database connection is working
- [ ] Check backend logs for errors
- [ ] Payment record should exist in `Payment` collection

### Issue: Transaction ID mismatch
**Solution:**
- Ensure the transaction ID passed to validate matches the one from initiation
- Format: `TXN-{timestamp}-{randomString}`

### Issue: CORS errors in frontend
**Solution:** Update CORS in backend (if needed):
```typescript
import cors from 'cors';
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

## Next Steps After Setup

1. **Frontend Integration:**
   - Follow `FRONTEND_INTEGRATION.md`
   - Create payment form component
   - Setup success/failure pages
   - Test complete flow

2. **Production Preparation:**
   - Switch to live SSLCommerz credentials
   - Update API URLs to production
   - Setup proper error logging
   - Add payment receipt emails
   - Setup refund handling

3. **Security:**
   - Add authentication middleware to payment routes
   - Validate user ownership of payments
   - Implement rate limiting
   - Add payment amount validation
   - Setup suspicious transaction alerts

4. **Monitoring:**
   - Setup payment success/failure monitoring
   - Create admin dashboard for payment analytics
   - Setup email notifications for failed payments
   - Log all payment transactions

## Additional Resources

- **Documentation:** Read `PAYMENT_SYSTEM.md`
- **API Testing:** Refer to `PAYMENT_API_TESTING.md`
- **Frontend Guide:** Check `FRONTEND_INTEGRATION.md`
- **SSLCommerz Docs:** https://developer.sslcommerz.com/

## Support

If you encounter issues:
1. Check the logs in your terminal
2. Verify all environment variables are set
3. Review the error message carefully
4. Check troubleshooting section above
5. Contact SSLCommerz support if API issues

## Credentials Summary

```
Store ID: playp6992e46d93627
Store Password: playp6992e46d93627@ssl
Sandbox Testing:
  - Visa: 4111111111111111
  - Mastercard: 5555555555554444
  - CVV: Any 3 digits
  - Expiry: Any future date
```

---

✨ **You're All Set!** The payment system is ready to use.

Start with a test payment initiation and verify the flow works. Once satisfied, integrate with your frontend and move to production setup.

Good luck! 🚀
