# Payment Authentication Fix

## Issue
The payment endpoint was returning 500 errors because:
- Frontend uses Supabase authentication
- Backend was expecting JWT tokens (from its own auth system)
- Mismatch in authentication methods

## Solution
Created a new `SupabaseAuthGuard` that verifies Supabase tokens, allowing the frontend to authenticate with the backend using Supabase session tokens.

## Changes Made

### 1. Created Supabase Auth Guard
**File**: `backend/src/auth/guards/supabase-auth.guard.ts`
- Verifies Supabase access tokens
- Extracts user information from token
- Attaches user to request object

### 2. Updated Payment Controller
**File**: `backend/src/payments/payments.controller.ts`
- Changed `create-checkout` endpoint to use `SupabaseAuthGuard` instead of `JwtAuthGuard`
- Changed `verify-payment` endpoint to use `SupabaseAuthGuard`

### 3. Updated Frontend API Route
**File**: `app/api/payments/create-checkout/route.ts`
- Now properly gets Supabase session token
- Sends token in Authorization header to backend

## Required Environment Variables (Backend)

Make sure your backend `.env` has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# OR
SUPABASE_ANON_KEY=your-anon-key
```

## Testing

1. Make sure backend is running on port 3001 (or update `NEXT_PUBLIC_BACKEND_URL`)
2. Ensure user is logged in (has Supabase session)
3. Try creating a payment checkout
4. Check backend logs for any authentication errors

## If Still Getting Errors

1. **Check backend logs** - Look for Supabase connection errors
2. **Verify environment variables** - Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in backend `.env`
3. **Check token** - Verify the frontend is getting a valid Supabase session token
4. **Backend URL** - Ensure `NEXT_PUBLIC_BACKEND_URL` is correct in frontend `.env`

## Next Steps

If you still get 500 errors:
1. Check backend console for specific error messages
2. Verify all environment variables are set
3. Test the Supabase connection from backend
4. Check if the SumUp API key is valid

