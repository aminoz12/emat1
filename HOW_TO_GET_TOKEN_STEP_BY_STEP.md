# Step-by-Step: How to Get Your Token for Swagger Authorization

## What is the Token?

The token starting with `eyJ...` is your **Supabase Access Token** (a JWT - JSON Web Token). It proves you're logged in and allows you to make authenticated API requests.

## Easiest Way to Get It:

### Method 1: Browser Console (Recommended)

1. **Open your frontend website**: http://localhost:3000
2. **Make sure you're logged in** (you should see your account/profile)
3. **Press F12** on your keyboard (opens Developer Tools)
4. **Click on the "Console" tab** (at the top of DevTools)
5. **Copy and paste this code**, then press Enter:

```javascript
// Find and display your Supabase token
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') && key.includes('auth')) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.access_token) {
          console.log('🎉 FOUND YOUR TOKEN:');
          console.log(parsed.access_token);
          console.log('\n📋 Copy the token above and paste it in Swagger!');
        }
      } catch(e) {}
    }
  }
});
```

6. **You should see your token printed** in the console
7. **Copy the entire token** (it's a long string)

### Method 2: Application Tab (Alternative)

1. **Open DevTools (F12)**
2. **Click "Application" tab** (instead of Console)
3. **In the left sidebar**, expand "Local Storage"
4. **Click on** `http://localhost:3000` (or your frontend URL)
5. **Look for keys** containing "supabase" and "auth"
6. **Click on one** and look for `access_token` in the value
7. **Copy the token value**

### Method 3: Network Tab

1. **Open DevTools (F12)**
2. **Go to "Network" tab**
3. **Refresh the page** (F5) or make any API call
4. **Find a request** to your backend (look for `localhost:3001`)
5. **Click on the request**
6. **Click "Headers" tab**
7. **Scroll down** to "Request Headers"
8. **Find "Authorization"** header
9. **Copy the token** (the part after "Bearer ")

## How to Use It in Swagger:

1. **Go to**: http://localhost:3001/api/docs
2. **Click the lock icon** 🔒 at the top right (says "Authorize")
3. **A popup will appear** with "Available authorizations"
4. **You'll see**: `bearer (http, Bearer)`
5. **In the "Value:" field**, paste your token (the `eyJ...` string)
6. **Click "Authorize"** button
7. **Click "Close"** button
8. **Done!** Now you can test authenticated endpoints

## Example Token Format:

Your token will look something like this (but much longer):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYzNzQ1MjgxLCJpYXQiOjE3NjM2NjkyODEsImlzcyI6Imh0dHBzOi8vYXJrd21uZ3VvZ3ZqbnV2cnd5dnkuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjI0OTViZjJlLTVkMGUtNDFkOS04OTg1LWUyOTBjNzJlMjEyMyIsImVtYWlsIjoiYXN6OTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiYXN6OTBAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNS0xMi0wOVQwMjoxNzoxMi45MDgyNjQrMDA6MDAiLCJwaG9uZSI6IiIsInBob25lX2NvbmZpcm1lZF9hdCI6bnVsbCwicm9sZSI6InVzZXIiLCJmaXJzdF9uYW1lIjoiQXNocmFyZiIsImxhc3RfbmFtZSI6ImFzbWkifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MzY2OTI4MX1dLCJzZXNzaW9uX2lkIjoiYjE3YzY1YzItYjY0ZC00YjY0LWE3YjEtYjE3YzY1YzJiNjRkIn0.abc123xyz...
```

**Important**: Copy the ENTIRE token, from `eyJ` all the way to the end!

## Troubleshooting:

**"No token found"**:
- Make sure you're logged in on your frontend
- Try logging out and logging back in
- Check if you're on the correct website (localhost:3000)

**"Token expired"**:
- Get a fresh token by refreshing your frontend page
- Or log out and log back in

**"Invalid token"**:
- Make sure you copied the entire token (no spaces, no line breaks)
- Make sure you're using a Supabase token (not a JWT from the backend auth endpoint)

