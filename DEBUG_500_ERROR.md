# Debugging 500 Error on Payment Checkout

## Steps to Debug

### 1. Check Frontend Console
The frontend API route now logs detailed error information. Check your browser console for:
- "Backend error:" logs showing status, statusText, and error details
- The actual error message from the backend

### 2. Check Backend Console
Look for errors in your backend terminal:
- Supabase connection errors
- SumUp API errors
- Missing environment variables
- Database connection errors

### 3. Verify Environment Variables (Backend)

Make sure your backend `.env` has:

```env
# Required for SumUp
SUMUP_API_KEY=sup_pk_VIijT0dsPb1KcN2ZPXsU8SqLLF3qRFvMJ

# Required for Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for return URL
FRONTEND_URL=http://localhost:3000
```

### 4. Test Backend Directly

Try calling the backend endpoint directly:

```bash
curl -X POST http://localhost:3001/payments/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "orderId": "test-order-id",
    "amount": 29.90,
    "currency": "eur"
  }'
```

### 5. Common Issues

#### Issue: Supabase Guard Not Working
**Symptoms**: 401 Unauthorized errors
**Solution**: 
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in backend `.env`
- Verify the token is being sent from frontend
- Check backend logs for Supabase connection errors

#### Issue: SumUp API Error
**Symptoms**: Error creating checkout
**Solution**:
- Verify `SUMUP_API_KEY` is correct
- Check if you need a secret key instead of public key
- Verify SumUp account is active

#### Issue: Order Not Found
**Symptoms**: "Order not found" error
**Solution**:
- Verify the order exists in database
- Check order ID is correct
- Verify database connection

#### Issue: Backend Not Running
**Symptoms**: Connection refused
**Solution**:
- Make sure backend is running on port 3001
- Check `NEXT_PUBLIC_BACKEND_URL` in frontend `.env`

### 6. Enable More Logging

The code now has better error logging. Check:
- Frontend: Browser console
- Backend: Terminal where backend is running

### 7. Test Authentication

The guard will now:
- Log detailed errors if Supabase isn't configured
- Allow requests in development if Supabase isn't set up (with warning)
- Show specific error messages for token verification failures

## Next Steps

1. **Check the actual error message** in browser console
2. **Check backend logs** for specific errors
3. **Verify all environment variables** are set
4. **Restart backend** after setting environment variables
5. **Test with a simple order ID** that you know exists

## Quick Fixes

If you see "Supabase auth guard not configured":
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to backend `.env`
- Restart backend server

If you see "Order not found":
- Verify the order ID exists in your database
- Check the order belongs to the logged-in user

If you see SumUp errors:
- Verify `SUMUP_API_KEY` is correct
- Check SumUp dashboard for account status

