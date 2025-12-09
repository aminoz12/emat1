# How to Get Long-Lived Tokens for Testing

## ⚠️ Important Security Note

**Lifetime tokens are NOT recommended for production** - they're a security risk. These methods are for **development and testing only**.

## Method 1: Configure Supabase Token Expiration (Recommended for Dev)

### In Supabase Dashboard:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to**: Authentication → Settings
4. **Find**: "JWT expiry" or "Access token expiry"
5. **Change it** to a longer duration (e.g., 7 days, 30 days, or maximum allowed)
6. **Save changes**

Now new tokens will last longer!

## Method 2: Use Refresh Token (Better Approach)

Refresh tokens last much longer (weeks/months). You can use them to get new access tokens:

### Get Refresh Token:

```javascript
// In browser console
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') && key.includes('auth')) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('Access Token:', parsed.access_token);
        console.log('Refresh Token:', parsed.refresh_token); // This lasts longer!
      } catch(e) {}
    }
  }
});
```

### Auto-Refresh Script:

Create a simple script that refreshes your token automatically:

```javascript
// Save this in browser console or as a bookmark
async function refreshSupabaseToken() {
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase') && k.includes('auth'));
  for (const key of keys) {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.refresh_token) {
      const response = await fetch('https://arkwmnguogvjnuvrwyvy.supabase.co/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'YOUR_ANON_KEY'
        },
        body: JSON.stringify({
          refresh_token: data.refresh_token
        })
      });
      const newData = await response.json();
      console.log('New Token:', newData.access_token);
      return newData.access_token;
    }
  }
}

// Run this whenever you need a fresh token
refreshSupabaseToken();
```

## Method 3: Create a Test Service Account Token (For Backend Testing)

For backend testing, you can create a service account with a long-lived token:

### In Supabase:

1. **Go to**: Settings → API
2. **Use Service Role Key** (⚠️ NEVER use this in frontend - backend only!)
3. **This key doesn't expire** but has full access - use carefully!

## Method 4: Custom Token Endpoint (Advanced)

Create a custom endpoint in your backend that generates long-lived tokens for testing:

```typescript
// In your backend - FOR TESTING ONLY
@Post('test-token')
async getTestToken(@Body() body: { userId: string }) {
  // Generate a long-lived token for testing
  const token = this.jwtService.sign(
    { sub: body.userId, email: 'test@example.com' },
    { expiresIn: '365d' } // 1 year
  );
  return { access_token: token };
}
```

## Method 5: Environment Variable Token (For Automated Testing)

For automated testing, you can store a token in environment variables:

```env
# In .env file (backend)
TEST_USER_TOKEN=your-long-lived-token-here
```

Then use it in your tests.

## ⚠️ Security Warnings

1. **Never use long-lived tokens in production**
2. **Never commit tokens to git**
3. **Rotate tokens regularly**
4. **Use refresh tokens instead when possible**
5. **Service role keys should NEVER be exposed to frontend**

## Recommended Approach for Development

**Best practice**: Configure Supabase to allow longer token expiration (7-30 days) for your development environment, then use refresh tokens to get new access tokens when needed.

## Quick Solution for Swagger Testing

1. **Get your current token** (using the console method)
2. **Use it in Swagger**
3. **When it expires** (after 1 hour), just get a new one using the same method
4. **Or** configure Supabase to allow longer expiration for dev

The token refresh is usually automatic in your frontend, but for Swagger you need to manually update it.

