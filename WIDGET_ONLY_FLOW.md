# SumUp Widget-Only Payment Flow

## ✅ Overview

Your SumUp integration is configured to work **without webhooks** using only the widget return flow. This is simpler and works perfectly for most use cases.

## 🔄 How It Works

### Payment Flow (Widget-Only)

1. **User initiates payment**
   - Frontend calls `/api/payments/create-checkout`
   - Backend creates SumUp checkout
   - Returns widget URL: `https://checkout.sumup.com/b/{checkout_id}`

2. **User redirected to SumUp widget**
   - User completes payment in SumUp's secure checkout
   - SumUp processes the payment

3. **SumUp redirects back**
   - After payment, SumUp redirects to: `/payment/return?orderId={orderId}&checkout_id={id}`
   - May also include `status` parameter

4. **Payment verification**
   - Return page extracts `checkout_id` from URL
   - Calls backend: `GET /payments/verify-payment/{checkoutId}`
   - Backend queries SumUp API to get payment status
   - Updates payment and order status in database

5. **User redirected to result page**
   - Success → `/payment-success?orderId={orderId}`
   - Failed → `/payment-cancelled?orderId={orderId}`

## 📋 Configuration

### Required Settings

✅ **Return URL** (configured in code):
```typescript
return_url: `${FRONTEND_URL}/payment/return?orderId=${orderId}`
```

✅ **Environment Variables**:
```env
SUMUP_API_KEY=sup_pk_VIijT0dsPb1KcN2ZPXsU8SqLLF3qRFvMJ  # ✅ Already set
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional Settings

❌ **Webhook URL** - NOT REQUIRED
- The webhook endpoint exists but is optional
- Widget return flow handles everything automatically
- Only enable if you want real-time notifications

## 🎯 Key Features

### Automatic Status Updates

When payment is verified via the return flow:
- ✅ Payment status updated to `succeeded` or `failed`
- ✅ Order status updated to `paid` (on success)
- ✅ All updates happen automatically

### Error Handling

- ✅ Handles missing parameters gracefully
- ✅ Verifies payment status via API if URL params unclear
- ✅ Proper error messages for users
- ✅ Fallback to cancelled page on errors

### Security

- ✅ Payment verification requires authentication
- ✅ Order ownership verified
- ✅ Payment status verified via SumUp API (not just URL params)

## 🧪 Testing

### Test the Flow

1. Create an order
2. Go to payment page
3. Click "Pay" button
4. Complete payment in SumUp widget (use test card)
5. Verify redirect to return page
6. Check payment status updates
7. Verify redirect to success page

### Test Cards (SumUp Sandbox)

- Success: Use any valid test card
- Failure: Use declined test card
- Check SumUp dashboard for test card numbers

## 🔍 Troubleshooting

### Payment not updating?

1. Check browser console for errors
2. Verify `checkout_id` is in return URL
3. Check backend logs for verification errors
4. Verify `SUMUP_API_KEY` is correct
5. Check SumUp dashboard for payment status

### Return page not working?

1. Verify route exists: `/payment/return`
2. Check URL parameters are being passed
3. Verify authentication is working
4. Check backend API is accessible

### Order status not updating?

1. Check payment verification is successful
2. Verify database connection
3. Check order ID matches
4. Review backend logs

## 📝 Code Flow

```
Frontend (payment/page.tsx)
  ↓
POST /api/payments/create-checkout
  ↓
Backend creates SumUp checkout
  ↓
Returns: { checkoutUrl, checkoutId }
  ↓
Redirect to: https://checkout.sumup.com/b/{checkoutId}
  ↓
User completes payment
  ↓
SumUp redirects to: /payment/return?orderId={id}&checkout_id={id}
  ↓
Return page verifies payment
  ↓
GET /payments/verify-payment/{checkoutId}
  ↓
Backend queries SumUp API
  ↓
Updates payment & order status
  ↓
Redirect to: /payment-success or /payment-cancelled
```

## ✅ Advantages of Widget-Only Flow

1. **Simpler setup** - No webhook configuration needed
2. **More reliable** - No webhook delivery issues
3. **Immediate feedback** - User sees result right away
4. **Easier debugging** - All flow is synchronous
5. **Works everywhere** - No webhook URL requirements

## 🚀 You're All Set!

Your integration is ready to use with widget-only flow. No webhooks needed! 🎉

