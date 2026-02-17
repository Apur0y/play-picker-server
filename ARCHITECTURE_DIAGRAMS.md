# SSLCommerz Payment System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Application                    │
│                  (React, Vue, Angular, etc.)                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─ (1) Fill payment form
             └─ (2) POST /api/payment/initiate
             
             ↓
             
┌─────────────────────────────────────────────────────────────────┐
│                    PlayPicker Backend Server                     │
│                      (Express.js + Node.js)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Payment Module (NEW)                          │  │
│  │  ─────────────────────────────────────────────────────── │  │
│  │  Controller: Handles HTTP requests                       │  │
│  │  ├─ initiatePayment()                                   │  │
│  │  ├─ validatePayment()                                   │  │
│  │  ├─ handleIPN()                                          │  │
│  │  └─ ... other endpoints                                 │  │
│  │                                                           │  │
│  │  Service: Business logic & API calls                    │  │
│  │  ├─ initiatePaymentService()                            │  │
│  │  ├─ validatePaymentService()                            │  │
│  │  ├─ confirmPaymentService()                             │  │
│  │  └─ ... other services                                  │  │
│  │                                                           │  │
│  │  Model: MongoDB schema                                   │  │
│  │  └─ Payment collection with transaction details          │  │
│  │                                                           │  │
│  │  Interface: TypeScript types                             │  │
│  │  └─ IPaymentRequest, ISSLCommerceInitiation, etc         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ├─ (4) Validate input               │
│                            ├─ (5) Create DB record             │
│                            └─ (6) Call SSLCommerz API          │
└────────────┬───────────────────────────────────────────────────┘
             │
             ├─ (7) Return payment URL & transaction ID
             
             ↓
             
┌─────────────────────────────────────────────────────────────────┐
│              SSLCommerz Payment Gateway (Sandbox)                │
│                    https://sandbox.sslcommerz.com               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Session API: /gwprocess/v4/api.php                       │  │
│  │   - Receives: Store ID, amount, customer details         │  │
│  │   - Returns: Session key, payment gateway URL            │  │
│  │                                                           │  │
│  │ Validation API: /validator/api/validationserverAPI.php   │  │
│  │   - Receives: Store ID, transaction ID, amount           │  │
│  │   - Returns: Payment status, validation details          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─ (8) User enters payment details
             └─ (9) Completes transaction
             
             ↓
             
             (10) SSLCommerz redirects to:
             - Success URL: /payment/success?tran_id=...
             - Failure URL: /payment/fail?tran_id=...
             - Cancel URL: /payment/cancel?tran_id=...
             
             ↓
             
┌─────────────────────────────────────────────────────────────────┐
│                    PlayPicker Backend Server                     │
│                  (Payment Confirmation Handler)                 │
│                                                                 │
│  (11) Receive success/fail callback from SSLCommerz            │
│  (12) POST /api/payment/ipn - Handle IPN notification          │
│  (13) Call SSLCommerz Validation API to verify payment         │
│  (14) Update payment status in MongoDB                         │
│  (15) Return confirmation JSON                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             └─ (16) Redirect to success/failure page
             
             ↓
             
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Application                    │
│                                                                 │
│  Success Page:                   Failure Page:                 │
│  ├─ Display success message      ├─ Display failure message    │
│  ├─ Show transaction details     ├─ Show transaction ID        │
│  ├─ Show transaction ID          ├─ Offer retry option        │
│  └─ Offer next actions           └─ Show contact support       │
└─────────────────────────────────────────────────────────────────┘
```

## Payment Initiation Flow

```
Frontend User                Backend Server              SSLCommerz API
     │                            │                           │
     ├─ Submit Form ──────────────┤                           │
     │  (name, email, phone)      │                           │
     │                            ├─ Validate Input           │
     │                            │                           │
     │                            ├─ Create Transaction ID    │
     │                            │                           │
     │                            ├─ Save to MongoDB          │
     │                            │                           │
     │                            ├─ Call Session API ────────┤
     │                            │                           │
     │                            │              ┌────────────┤
     │                            │ Return       │ Generate   │
     │        Return URL ◄────────┤ URL ◄────────┤ Session   │
     │ + Transaction ID           │              │           │
     │                            │              │           │
     ├─ Redirect to URL ─────────────────────────┤
     │                                      (User fills card details)
```

## IPN (Instant Payment Notification) Flow

```
SSLCommerz                Backend Server              Database
    │                          │                         │
    ├─ POST /api/payment/ipn ─┤                         │
    │ (transaction data)       │                         │
    │                          ├─ Receive IPN           │
    │                          │ notification           │
    │                          │                         │
    │                          ├─ Validate Input        │
    │                          │                         │
    │                          ├─ Find Payment Record ──┤
    │                          │                        │
    │                          │            ┌───────────┤
    │                          │ Retrieve   │ Get       │
    │                          │ Record ◄───┤ Payment   │
    │                          │            │           │
    │                          ├─ Call Validation API ──
    ├─ GET Validation Status ──┤                ┌──
    │                          │                │
    │◄─────── Return Status ───┤                │
    │                          │                │
    │                          ├─ Update DB ────┤
    │                          │ Record         │
    │                          │    (status =   │
    │                          │   "completed") │
    │                          │       │        │
    │                          │       └────────┤
    │                          │                │
    │                          ├─ Return JSON ─┤
    │◄─ 200 OK ────────────────┤ Response      │
    │                          │               │
    │                                          │
```

## Data Flow: Payment Request Path

```
HTTP Request
    ↓
Payment Router (/api/payment/*)
    ↓
Payment Controller (payment.controler.ts)
    ├─ Receive request
    ├─ Extract data from req.body
    ├─ Pass to Service layer
    └─ Return response
    ↓
Payment Service (payment.service.ts)
    ├─ Validate business logic
    ├─ Call Payment Model for DB operations
    ├─ Call SSLCommerz APIs via Axios
    ├─ Handle errors
    └─ Return results
    ↓
Payment Model (payment.model.ts)
    ├─ Create/Read/Update Payment documents
    └─ Interact with MongoDB
    ↓
SSLCommerz (External API)
    ↓
Response Back
```

## Database Schema Relationship

```
┌──────────────────────────┐
│    Payment Collection    │
├──────────────────────────┤
│ _id (ObjectId)           │
│ transactionId ★          │ ← Unique identifier
│ userId                   │ ← References User
│ packageId                │ ← References Package
│ amount (Number)          │
│ currency (BDT)           │
│ customerName             │
│ customerEmail            │
│ customerPhone            │
│ status                   │ ← pending/completed/failed/cancelled
│ paymentMethod            │ ← SSLCommerz
│ createdAt (Date)         │
│ updatedAt (Date)         │
└──────────────────────────┘
```

## API Endpoint Organization

```
/api/payment
├── POST /initiate
│   └─ Create new payment session
├── POST /validate
│   └─ Handle SSLCommerz callback
├── POST /ipn
│   └─ Handle instant payment notification
├── GET /details/:transactionId
│   └─ Retrieve payment details
├── GET /user/:userId
│   └─ Get user's payment history
├── PUT /:transactionId/status
│   └─ Update payment status (admin)
├── GET /stats/overview
│   └─ Get payment statistics (admin)
└── /success, /fail, /cancel
    └─ Redirect callback pages
```

## Payment Status Lifecycle

```
┌──────────┐
│ Initiated│
│(pending) │
└─────┬────┘
      │
      ├─── User Completes Payment ──┐
      │                             │
      ↓                             ↓
 ┌─────────────┐          ┌──────────────┐
 │  Validation │          │ Cancellation │
 │   Check     │          │  Occurred    │
 └─────┬───────┘          └──────┬───────┘
       │                         │
   Success  ─► Failed             │
       │         │                │
       ↓         ↓                ↓
   ┌────────┐ ┌──────┐      ┌──────────┐
   │Complete│ │Failed│      │ Cancelled│
   └────────┘ └──────┘      └──────────┘
```

## Error Handling Flow

```
API Request
    ├─ Invalid Input
    │   └─ Return 400 Bad Request
    │
    ├─ Payment Not Found
    │   └─ Return 404 Not Found
    │
    ├─ SSLCommerz API Error
    │   └─ Return 500 Internal Server Error
    │
    ├─ Invalid Status
    │   └─ Return 400 Bad Request
    │
    └─ Unexpected Error
        └─ Return 500 Internal Server Error
           (logged for debugging)
```

## File Structure

```
play-picker-server/
├── src/
│   └── app/
│       ├── config/
│       │   └── env.ts (UPDATED - Added SSLCommerz vars)
│       │
│       ├── modules/
│       │   ├── packages/
│       │   ├── sports/
│       │   ├── user/
│       │   ├── tour/
│       │   │
│       │   └── payment/ (NEW)
│       │       ├── payment.interface.ts
│       │       ├── payment.model.ts
│       │       ├── payment.service.ts
│       │       ├── payment.controler.ts
│       │       └── payment.routes.ts
│       │
│       └── routes/
│           └── index.ts (UPDATED - Added payment router)
│
├── package.json (UPDATED - Added axios)
├── .env.example (NEW - Environment template)
│
├── PAYMENT_SYSTEM.md (NEW - Complete documentation)
├── PAYMENT_API_TESTING.md (NEW - Testing guide)
├── FRONTEND_INTEGRATION.md (NEW - Frontend guide)
├── QUICK_START.md (NEW - Setup guide)
└── IMPLEMENTATION_SUMMARY.md (NEW - This document)
```

## Technology Stack

```
Backend Framework:
├─ Express.js (HTTP server)
├─ TypeScript (Type safety)
├─ Node.js (Runtime)
└─ MongoDB (Database)

External Services:
├─ SSLCommerz (Payment gateway)
│   ├─ Session API (Initiate payment)
│   └─ Validation API (Verify payment)
└─ Axios (HTTP client)

Architecture Pattern:
├─ MVC (Model-View-Controller)
├─ Service Layer
├─ Error Handling with Custom AppError
└─ Async/Await for async operations
```

## Environment Variables Mapping

```
┌────────────────────────────────┐
│   Environment Variables        │
├────────────────────────────────┤
│ SSLCommerz Configuration       │
├─ SSL_STORE_ID                  │
│   └─ Used in: Session API      │
│                                │
├─ SSL_STORE_PASSWORD            │
│   └─ Used in: Session API      │
│       & Validation API         │
│                                │
├─ SSL_SESSION_API               │
│   └─ Endpoint: Generate session│
│                                │
├─ SSL_VALIDATION_API            │
│   └─ Endpoint: Validate payment│
│                                │
├─ SERVER_URL                       │
│   └─ Used in: Callback URLs    │
│       (success/fail/cancel)    │
└────────────────────────────────┘
```

## Request/Response Examples

### Initiate Payment Request
```
POST /api/payment/initiate
Content-Type: application/json

{
  "userId": "user123",
  "packageId": "pkg456",
  "amount": 500,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "01912345678"
}
```

### Initiate Payment Response
```
200 OK
Content-Type: application/json

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

### Get Payment Details Response
```
200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
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

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Scalability and maintainability
- ✅ Type safety with TypeScript
- ✅ Proper error handling
- ✅ Database persistence
- ✅ Secure credential management
