# How to Get Your Supabase Token for Authorization

## Quick Method: Browser Console

1. **Open your frontend** (http://localhost:3000)
2. **Make sure you're logged in** (you created user: asz90@gmail.com)
3. **Press F12** to open DevTools
4. **Go to Console tab**
5. **Paste and run this:**

```javascript
// Method 1: Check localStorage
const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
if (authKey) {
  const authData = JSON.parse(localStorage.getItem(authKey));
  console.log('✅ Your Supabase Token:', authData.access_token);
  console.log('Copy this token and paste it in Swagger Authorization!');
} else {
  console.log('❌ No token found. Try Method 2.');
}
```

**OR try this:**

```javascript
// Method 2: Direct Supabase client
import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({ createClient }) => {
  const supabase = createClient(
    'https://arkwmnguogvjnuvrwyvy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFya3dtbmd1b2d2am51dnJ3eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjkyODEsImV4cCI6MjA3OTI0NTI4MX0.nGQBgqoIQ8A51D7U8oPd1JionVpaVPdnmOjcF_kuI00'
  );
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.access_token) {
      console.log('✅ Your Token:', session.access_token);
    } else {
      console.log('❌ Not logged in. Please log in first.');
    }
  });
});
```

## Method 2: Network Tab

1. **Open DevTools (F12)**
2. **Go to Network tab**
3. **Make a request** (refresh page or click something)
4. **Find any request** to your backend API
5. **Click on it**
6. **Go to "Headers" tab**
7. **Look for "Authorization" header**
8. **Copy the token** (the part after "Bearer ")

## Method 3: Create Test Token via API

If you can't get it from browser, you can create a test session:

1. **Go to Swagger**: http://localhost:3001/api/docs
2. **The payment endpoints use Supabase tokens**, not JWT tokens
3. **You need to be logged in through your frontend first**

## What to Paste in Swagger

Once you have the token:

1. **Go to**: http://localhost:3001/api/docs
2. **Click "Authorize"** (top right, lock icon)
3. **In the "Value:" field**, paste your token
4. **Click "Authorize"**
5. **Click "Close"**

The token should look something like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYzNzQ...
```

## Important Notes

- **Payment endpoints** use **Supabase tokens** (from SupabaseAuthGuard)
- **Other endpoints** might use **JWT tokens** (from JwtAuthGuard)
- Tokens expire, so you may need to refresh if it stops working
- Make sure you're logged in on your frontend first!

