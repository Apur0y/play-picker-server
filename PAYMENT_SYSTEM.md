# SSLCommerz Payment System Documentation

## Overview
This is a complete SSLCommerz payment integration system for the PlayPicker application. It handles payment initiation, validation, confirmation, and provides admin capabilities for payment management.

## Setup Instructions

### 1. Environment Variables
Add the following variables to your `.env` file:

```env
# Database
DB_URL=your_mongodb_url
NODE_ENV=development

# SSLCommerz Configuration
SSL_STORE_ID=playp6992e46d93627
SSL_STORE_PASSWORD=playp6992e46d93627@ssl
SSL_SESSION_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SERVER_URL=https://playpicker.vercel.app

# Server
PORT=3000
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

The `axios` package has already been added to `package.json` for HTTP requests.

## API Endpoints

### 1. Initiate Payment
**Endpoint:** `POST /api/payment/initiate`

**Description:** Initiates a new payment session with SSLCommerz.

**Request Body:**
```json
{
  "userId": "user123",
  "packageId": "pkg456",
  "amount": 500,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "01912345678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment session initiated successfully",
  "data": {
    "url": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&P=...",
    "transactionId": "TXN-1707864123456-ABC123DEF",
    "sessionKey": "....."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

### 2. Validate Payment (Callback)
**Endpoint:** `POST /api/payment/validate`

**Description:** Called from SSLCommerz after payment completion (success/fail).

**Request Body:**
```json
{
  "tran_id": "TXN-1707864123456-ABC123DEF",
  "total_amount": 500,
  "status": "VALID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment validated and confirmed",
  "data": {
    "success": true,
    "transactionId": "TXN-1707864123456-ABC123DEF",
    "status": "completed",
    "message": "Payment confirmed successfully"
  }
}
```

### 3. IPN (Instant Payment Notification)
**Endpoint:** `POST /api/payment/ipn`

**Description:** SSLCommerz IPN endpoint for real-time payment updates.

**Request Body:**
```json
{
  "tran_id": "TXN-1707864123456-ABC123DEF",
  "total_amount": 500,
  "status": "VALID",
  "val_id": "val_id_from_sslcommerz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "IPN processed successfully"
}
```

### 4. Get Payment Details
**Endpoint:** `GET /api/payment/details/:transactionId`

**Description:** Retrieve details of a specific payment.

**Response:**
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "_id": "...",
    "transactionId": "TXN-1707864123456-ABC123DEF",
    "userId": "user123",
    "packageId": "pkg456",
    "amount": 500,
    "currency": "BDT",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "01912345678",
    "status": "completed",
    "paymentMethod": "SSLCommerz",
    "createdAt": "2024-02-13T10:00:00.000Z",
    "updatedAt": "2024-02-13T10:05:00.000Z"
  }
}
```

### 5. Get User Payments
**Endpoint:** `GET /api/payment/user/:userId`

**Description:** Retrieve all payments for a specific user.

**Response:**
```json
{
  "success": true,
  "message": "User payments retrieved successfully",
  "data": [
    {
      "transactionId": "TXN-1707864123456-ABC123DEF",
      "userId": "user123",
      "packageId": "pkg456",
      "amount": 500,
      "status": "completed",
      "createdAt": "2024-02-13T10:00:00.000Z"
    },
    ...
  ]
}
```

### 6. Update Payment Status (Admin)
**Endpoint:** `PUT /api/payment/:transactionId/status`

**Description:** Manually update payment status (Admin only).

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Statuses:** `pending`, `completed`, `failed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "transactionId": "TXN-1707864123456-ABC123DEF",
    "status": "completed"
  }
}
```

### 7. Payment Statistics (Admin)
**Endpoint:** `GET /api/payment/stats/overview`

**Description:** Get payment statistics and analytics.

**Response:**
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "totalPayments": 45,
    "totalRevenue": 22500,
    "breakdown": [
      {
        "_id": "completed",
        "count": 40,
        "totalAmount": 20000
      },
      {
        "_id": "pending",
        "count": 3,
        "totalAmount": 1500
      },
      {
        "_id": "failed",
        "count": 2,
        "totalAmount": 1000
      }
    ]
  }
}
```

### 8. Payment Success Callback
**Endpoint:** `GET /payment/success?tran_id=xxx`

**Description:** User redirect page after successful payment.

### 9. Payment Failure Callback
**Endpoint:** `GET /payment/fail?tran_id=xxx`

**Description:** User redirect page after payment failure.

### 10. Payment Cancellation Callback
**Endpoint:** `GET /payment/cancel?tran_id=xxx`

**Description:** User redirect page when payment is cancelled.

## Database Schema

### Payment Model
```typescript
{
  transactionId: String (unique, indexed),
  userId: String (indexed),
  packageId: String,
  amount: Number,
  currency: String (default: "BDT"),
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  status: String (enum: ["pending", "completed", "failed", "cancelled"]),
  paymentMethod: String (default: "SSLCommerz"),
  createdAt: Date,
  updatedAt: Date
}
```

## Payment Flow

### Step 1: Frontend Form
Customer fills in payment form with package and personal details.

### Step 2: Initiate Payment
Frontend calls `POST /api/payment/initiate` with payment details.

### Step 3: Redirect to SSLCommerz
Frontend redirects user to the payment gateway URL returned.

### Step 4: SSLCommerz Gateway
Customer enters card/payment details on SSLCommerz gateway.

### Step 5: Validation
Two validation methods:
- **IPN (Recommended):** SSLCommerz calls `POST /api/payment/ipn` with real-time updates
- **Callback:** SSLCommerz redirects to success/fail URLs

### Step 6: Status Update
Payment is confirmed and status is updated to "completed" or "failed".

### Step 7: Frontend Response
User is redirected to success or failure page based on payment status.

## Key Features

✅ **Complete Integration:** Full SSLCommerz API integration
✅ **Payment Tracking:** Track all payments with unique transaction IDs
✅ **User History:** Retrieve payment history for each user
✅ **Admin Dashboard:** Statistics and manual status management
✅ **Real-time Updates:** IPN for instant payment notifications
✅ **Error Handling:** Comprehensive error messages and validation
✅ **Database Storage:** All payments stored in MongoDB
✅ **TypeScript Support:** Full TypeScript type definitions

## SSLCommerz Credentials

- **Store ID:** playp6992e46d93627
- **Store Password:** playp6992e46d93627@ssl
- **Store Name:** testplaypte26
- **Registered URL:** https://playpicker.vercel.app/
- **Merchant Panel:** https://sandbox.sslcommerz.com/manage/

## Testing

### Test Card Numbers (Sandbox)
- **Visa:** 4111111111111111
- **Mastercard:** 5555555555554444
- **Expiry:** Any future date
- **CVV:** Any 3 digits

## Frontend Integration Example

```javascript
// Step 1: Call payment initiation API
const initiatePayment = async () => {
  const response = await fetch('/api/payment/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user123',
      packageId: 'pkg456',
      amount: 500,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '01912345678'
    })
  });
  
  const data = await response.json();
  
  // Step 2: Redirect to payment gateway
  if (data.success) {
    window.location.href = data.data.url;
  }
};
```

## Error Handling

All errors are handled through the global error handler middleware. Common error scenarios:

- **400 Bad Request:** Invalid input parameters
- **404 Not Found:** Payment record not found
- **500 Internal Server Error:** Server-side errors

## Security Notes

1. Store credentials in environment variables (✓ Implemented)
2. Validate all incoming data (✓ Implemented)
3. Use HTTPS in production (Important)
4. Keep SSLCommerz credentials secure
5. Implement proper admin authentication (Add your own auth middleware)

## Troubleshooting

### Payment not confirming
- Check if IPN endpoint is accessible from SSLCommerz
- Verify SSLCommerz credentials in `.env`
- Check database connectivity

### Transaction ID not found
- Ensure transaction ID is correct
- Verify payment was initiated correctly
- Check database for payment records

### CORS Issues
- Ensure CORS is properly configured in your Express app
- Add frontend URL to allowed origins

## Future Enhancements

- Add refund functionality
- Implement subscription recurring payments
- Add payment receipt email
- Multi-currency support
- Webhook retry mechanism
- Payment analytics dashboard

## Support
For SSLCommerz support: https://www.sslcommerz.com/
For more details on SSLCommerz API: https://developer.sslcommerz.com/
