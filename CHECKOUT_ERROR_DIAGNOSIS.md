# Checkout 500 Error Diagnosis

## Error Location
- `orderService.ts:117` - `createCheckoutAndRedirect` function
- Frontend API route: `/api/payments/create-checkout`
- Backend endpoint: `/payments/create-checkout`

## Improved Error Handling

I've added:
1. ✅ Better error logging with detailed information
2. ✅ Fallback to `/payment` page if checkout creation fails
3. ✅ More detailed error messages

## Common Causes of 500 Error

### 1. Backend Not Running
**Check**: Is backend running on port 3001?
```bash
# Check if backend is running
curl http://localhost:3001/health
# or check in browser: http://localhost:3001/api/docs
```

**Solution**: Start backend
```bash
cd backend
npm run start:dev
```

### 2. Backend Authentication Failing
**Check**: Look for these in backend logs:
- `Missing or invalid authorization header`
- `Supabase token verification error`
- `Supabase auth guard not configured`

**Solution**: 
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in backend `.env`
- Check if SupabaseAuthGuard is working correctly

### 3. SumUp API Key Issue
**Check**: Backend logs should show:
- `✅ SumUp API Key loaded` - If you see this, key is loaded
- `⚠️ SUMUP_API_KEY is not set` - Key missing

**Solution**: 
- Verify `SUMUP_API_KEY` in backend `.env`
- Check if key is valid (might need secret key instead of public key)

### 4. Missing Environment Variables
**Required in backend `.env`:**
```env
SUMUP_API_KEY=sup_pk_VIijT0dsPb1KcN2ZPXsU8SqLLF3qRFvMJ
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

### 5. Order Not Found
**Check**: Backend logs:
- `Order not found: {orderId}`

**Solution**: Verify order was created successfully before calling checkout

## How to Debug

### Step 1: Check Browser Console
Look for detailed error message:
```
Checkout creation failed: {
  status: 500,
  statusText: "Internal Server Error",
  error: { ... }
}
```

### Step 2: Check Backend Terminal
Look for:
- Authentication errors
- SumUp API errors
- Database errors
- Missing environment variable warnings

### Step 3: Test Backend Directly
```bash
# Test if backend is accessible
curl http://localhost:3001/payments/create-checkout \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderId":"test","amount":29.90,"currency":"eur"}'
```

### Step 4: Check Frontend API Route Logs
Look in Next.js terminal for:
- `Received request to /api/payments/create-checkout`
- `Calling backend service: ...`
- `Backend error: ...`

## Fallback Behavior

If checkout creation fails, the app will now:
1. Log the detailed error
2. Redirect to `/payment` page as fallback
3. User can still complete payment manually

## Next Steps

1. **Check backend terminal** for specific error messages
2. **Check browser console** for detailed error information
3. **Verify all environment variables** are set in backend
4. **Restart backend** after setting environment variables
5. **Share the exact error message** from backend logs

The improved error handling will now show you exactly what's failing!

