# How to Get Your Authentication Token

## For Payment Endpoints (Supabase Token)

The payment endpoints use **Supabase authentication**, so you need a Supabase token.

### Method 1: Browser Console (Easiest)

1. **Open your frontend** (http://localhost:3000)
2. **Log in** to your account
3. **Open Browser DevTools** (Press F12)
4. **Go to Console tab**
5. **Run this command:**

```javascript
// If you have Supabase client available
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
const supabase = createClient(
  'https://arkwmnguogvjnuvrwyvy.supabase.co',
  'YOUR_ANON_KEY_HERE'
);
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

**OR simpler - if you're already logged in:**

```javascript
// In browser console on your frontend
localStorage.getItem('sb-arkwmnguogvjnuvrwyvy-auth-token')
```

### Method 2: Use Swagger to Get JWT Token (For other endpoints)

If you need a JWT token for other endpoints:

1. **Go to Swagger**: http://localhost:3001/api/docs
2. **Find `/auth/register`** endpoint
3. **Click "Try it out"**
4. **Enter test user data:**
```json
{
  "email": "test@example.com",
  "password": "test123456",
  "name": "Test User"
}
```
5. **Click "Execute"**
6. **Copy the `access_token` from the response**

### Method 3: Use Existing User Login

If you already have a user account:

1. **Go to Swagger**: http://localhost:3001/api/docs
2. **Find `/auth/login`** endpoint
3. **Click "Try it out"**
4. **Enter your credentials:**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```
5. **Click "Execute"**
6. **Copy the `access_token` from the response**

## Quick Test Token

For testing the **payment endpoint** specifically, you need a **Supabase token**. 

The easiest way:
1. Log in through your frontend
2. Open browser console (F12)
3. Check the Network tab for any API call
4. Look at the `Authorization` header - it will contain the token

Or use this in your browser console on the frontend:

```javascript
// Get Supabase session token
(async () => {
  const response = await fetch('/api/auth/session');
  const data = await response.json();
  console.log('Session:', data);
})();
```

