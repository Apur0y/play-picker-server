# SSLCommerz Payment API - Quick Testing Guide

This file contains curl commands and examples for testing the payment APIs.

## 1. Initiate Payment

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "packageId": "pkg456",
    "amount": 500,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "01912345678"
  }'
```

**Using JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/payment/initiate', {
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
window.location.href = data.data.url; // Redirect to payment gateway
```

**Using Python:**
```python
import requests

response = requests.post('http://localhost:3000/api/payment/initiate', json={
    'userId': 'user123',
    'packageId': 'pkg456',
    'amount': 500,
    'customerName': 'John Doe',
    'customerEmail': 'john@example.com',
    'customerPhone': '01912345678'
})

data = response.json()
print(data['data']['url'])  # Get payment gateway URL
```

## 2. Get Payment Details

**Using curl:**
```bash
curl -X GET http://localhost:3000/api/payment/details/TXN-1707864123456-ABC123DEF
```

**Transaction ID Format:**
`TXN-1707864123456-ABC123DEF` (from initiate payment response)

## 3. Get User Payments

**Using curl:**
```bash
curl -X GET http://localhost:3000/api/payment/user/user123
```

## 4. Validate Payment (SSLCommerz Callback)

**Using curl (Simulating SSLCommerz callback):**
```bash
curl -X POST http://localhost:3000/api/payment/validate \
  -H "Content-Type: application/json" \
  -d '{
    "tran_id": "TXN-1707864123456-ABC123DEF",
    "total_amount": 500,
    "status": "VALID"
  }'
```

**Failed Payment:**
```bash
curl -X POST http://localhost:3000/api/payment/validate \
  -H "Content-Type: application/json" \
  -d '{
    "tran_id": "TXN-1707864123456-ABC123DEF",
    "total_amount": 500,
    "status": "FAILED"
  }'
```

## 5. Update Payment Status (Admin)

**Using curl:**
```bash
curl -X PUT http://localhost:3000/api/payment/TXN-1707864123456-ABC123DEF/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Valid statuses:** `pending`, `completed`, `failed`, `cancelled`

## 6. Get Payment Statistics

**Using curl:**
```bash
curl -X GET http://localhost:3000/api/payment/stats/overview
```

## 7. IPN Endpoint (Instant Payment Notification)

**Using curl (Simulating SSLCommerz IPN):**
```bash
curl -X POST http://localhost:3000/api/payment/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "tran_id": "TXN-1707864123456-ABC123DEF",
    "total_amount": 500,
    "status": "VALID",
    "val_id": "val_id_from_sslcommerz",
    "bank_tran_id": "bank_tran_id"
  }'
```

## Postman Collection

You can import this into Postman:

```json
{
  "info": {
    "name": "PlayPicker Payment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Initiate Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"userId\": \"user123\",\"packageId\": \"pkg456\",\"amount\": 500,\"customerName\": \"John Doe\",\"customerEmail\": \"john@example.com\",\"customerPhone\": \"01912345678\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/payment/initiate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "initiate"]
        }
      }
    },
    {
      "name": "Get Payment Details",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/payment/details/{{transactionId}}",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "details", "{{transactionId}}"]
        }
      }
    },
    {
      "name": "Get User Payments",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/payment/user/user123",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "user", "user123"]
        }
      }
    },
    {
      "name": "Validate Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"tran_id\": \"{{transactionId}}\",\"total_amount\": 500,\"status\": \"VALID\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/payment/validate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "validate"]
        }
      }
    },
    {
      "name": "Update Payment Status",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"status\": \"completed\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/payment/{{transactionId}}/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "{{transactionId}}", "status"]
        }
      }
    },
    {
      "name": "Get Payment Statistics",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/payment/stats/overview",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "payment", "stats", "overview"]
        }
      }
    }
  ]
}
```

## Testing Checklist

- [ ] Test payment initiation endpoint
- [ ] Verify transaction ID is generated correctly
- [ ] Test getting payment details
- [ ] Test retrieving user payments
- [ ] Simulate payment validation/callback
- [ ] Test IPN endpoint
- [ ] Test manual status update
- [ ] Check payment statistics
- [ ] Verify database records are created
- [ ] Test error cases (missing fields, invalid data)

## Common Test Scenarios

### Scenario 1: Complete Payment Flow
1. Call `/api/payment/initiate` → Get transaction ID and payment URL
2. User completes payment on SSLCommerz gateway
3. Call `/api/payment/validate` with success status
4. Verify payment status changed to "completed"
5. Retrieve payment details to confirm

### Scenario 2: Failed Payment
1. Call `/api/payment/initiate`
2. User cancels or fails payment
3. Call `/api/payment/validate` with failed status
4. Verify payment status changed to "failed"

### Scenario 3: Payment History
1. Complete multiple payments for same user
2. Call `/api/payment/user/:userId`
3. Verify all payments are listed

### Scenario 4: Admin Actions
1. Get payment statistics
2. Manually update a payment status
3. Verify changes are reflected in API responses

## Important Notes

- Replace `http://localhost:3000` with your actual server URL
- Replace `user123`, `pkg456` with actual IDs from your database
- Transaction ID format: `TXN-{timestamp}-{randomString}`
- Always send requests with proper `Content-Type: application/json` headers
- Check server logs for debugging payment issues
