# Frontend Integration Guide - SSLCommerz Payment System

This guide will help you integrate the SSLCommerz payment system in your frontend application.

## Overview

The payment flow works as follows:
1. User fills payment form
2. Frontend sends payment details to backend
3. Backend generates payment session with SSLCommerz
4. User is redirected to SSLCommerz payment gateway
5. User enters payment details and completes transaction
6. SSLCommerz redirects back with payment status
7. Payment is confirmed in database
8. User sees success/failure message

## Step-by-Step Integration

### Step 1: Create a Payment Form Component

```jsx
// PaymentForm.jsx or PaymentForm.tsx
import { useState } from 'react';

const PaymentForm = ({ packageId, packageAmount }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('https://your-api.com/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(), // Get from auth context/localStorage
          packageId: packageId,
          amount: packageAmount,
          customerName: formData.get('fullName'),
          customerEmail: formData.get('email'),
          customerPhone: formData.get('phone')
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Payment initiation failed');
        return;
      }

      // Redirect to SSLCommerz payment gateway
      window.location.href = data.data.url;
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <div>
        <label>Full Name</label>
        <input 
          type="text" 
          name="fullName" 
          required 
        />
      </div>

      <div>
        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          required 
        />
      </div>

      <div>
        <label>Phone</label>
        <input 
          type="tel" 
          name="phone" 
          required 
        />
      </div>

      <div>
        <label>Amount: {packageAmount} BDT</label>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaymentForm;
```

### Step 2: Create Success/Failure Pages

```jsx
// PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const transactionId = searchParams.get('tran_id');
      
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://your-api.com/api/payment/details/${transactionId}`
        );
        const data = await response.json();
        setPayment(data.data);
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [searchParams]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="success-container">
      <h1>✓ Payment Successful!</h1>
      <p>Thank you for your payment.</p>
      
      {payment && (
        <div className="payment-details">
          <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
          <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      <button onClick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccess;
```

```jsx
// PaymentFail.jsx
import { useSearchParams } from 'react-router-dom';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('tran_id');

  return (
    <div className="fail-container">
      <h1>✗ Payment Failed</h1>
      <p>Unfortunately, your payment could not be processed.</p>
      
      {transactionId && (
        <p><strong>Transaction ID:</strong> {transactionId}</p>
      )}

      <p>Please try again or contact our support team.</p>

      <div>
        <button onClick={() => window.location.href = '/packages'}>
          Try Again
        </button>
        <button onClick={() => window.location.href = '/contact'}>
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default PaymentFail;
```

### Step 3: Setup Routes

```jsx
// App.jsx or main routing file
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentForm from './components/PaymentForm';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your other routes */}
        
        {/* Payment routes */}
        <Route path="/payment/checkout/:packageId" element={<PaymentForm />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 4: Create Payment Service (Optional)

```tsx
// services/paymentService.ts
const API_BASE_URL = 'https://your-api.com/api';

interface PaymentData {
  userId: string;
  packageId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const paymentService = {
  async initiatePayment(data: PaymentData) {
    const response = await fetch(`${API_BASE_URL}/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getPaymentDetails(transactionId: string) {
    const response = await fetch(
      `${API_BASE_URL}/payment/details/${transactionId}`
    );
    return response.json();
  },

  async getUserPayments(userId: string) {
    const response = await fetch(`${API_BASE_URL}/payment/user/${userId}`);
    return response.json();
  }
};
```

### Step 5: Add to Package Selection Page

```jsx
// PackageCard.jsx
const PackageCard = ({ package: pkg }) => {
  const handleSelectPackage = () => {
    // Navigate to payment with package ID
    window.location.href = `/payment/checkout/${pkg._id}`;
  };

  return (
    <div className="package-card">
      <h3>{pkg.name}</h3>
      <p className="price">{pkg.price} BDT</p>
      <p>{pkg.description}</p>
      
      <button onClick={handleSelectPackage}>
        Buy Now
      </button>
    </div>
  );
};

export default PackageCard;
```

## Important Configuration Notes

### 1. Update API Base URL
Replace `https://your-api.com` with your actual backend URL:
- Development: `http://localhost:3000`
- Production: Your deployed backend URL

### 2. Environment Variables
Create a `.env` file in your frontend project:

```env
REACT_APP_API_URL=https://your-api.com
REACT_APP_PAYMENT_ENABLE=true
```

### 3. CORS Configuration
Make sure your backend has CORS enabled for your frontend URL.

In your backend `app.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000', // Development
    'https://playpicker.vercel.app' // Production
  ],
  credentials: true
}));
```

## State Management (Redux Example)

```typescript
// slices/paymentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    loading: false,
    paymentUrl: null,
    error: null,
    transactionId: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload.url;
        state.transactionId = action.payload.transactionId;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default paymentSlice.reducer;
```

## Testing the Payment Flow

1. **Test Initiation:**
   - Fill payment form
   - Submit → Should redirect to SSLCommerz gateway

2. **Test with Test Card:**
   - Visa: 4111111111111111
   - Mastercard: 5555555555554444
   - Expiry: Any future date
   - CVV: Any 3 digits

3. **Test Success Page:**
   - Complete payment
   - Should redirect to `/payment/success?tran_id=...`
   - Should display payment details

4. **Test Failure Handling:**
   - Cancel or enter invalid card
   - Should redirect to `/payment/fail`
   - Should show error message

## Error Handling Strategies

```jsx
const handlePaymentError = (error) => {
  if (error.response?.status === 400) {
    // Invalid input
    setError('Please fill all required fields correctly');
  } else if (error.response?.status === 500) {
    // Server error
    setError('Server error. Please try again later.');
  } else {
    // Network error
    setError('Network error. Please check your connection.');
  }
};
```

## User Experience Best Practices

- ✅ Show loading state while processing payment
- ✅ Display transaction ID for reference
- ✅ Show clear success/failure messages
- ✅ Provide option to continue or retry
- ✅ Handle network timeouts gracefully
- ✅ Show payment receipt/confirmation email option

## Security Notes

- Never store sensitive payment data on frontend
- Always validate user input before sending
- Use HTTPS in production
- Implement proper authentication
- Add CSRF protection if needed
- Keep API credentials in backend only

## Support & Debugging

If users encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify API endpoint is accessible
4. Check backend logs for validation errors
5. Ensure transaction ID is being generated
6. Verify database is receiving payment records

## Next Steps

1. Update frontend routes to include payment pages
2. Set environment variables correctly
3. Test payment flow with sandbox credentials
4. Deploy to production
5. Switch to live SSLCommerz credentials when ready
