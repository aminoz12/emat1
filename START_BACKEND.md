# How to Start the Backend Server

## Quick Start

1. **Open a new terminal window**
2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Start the backend server:**
   ```bash
   npm run start:dev
   ```
   
   **Note:** The script is `start:dev`, NOT `dev`!

4. **Wait for the message:**
   ```
   🚀 Backend server running on port 3001
   📚 API Documentation: http://localhost:3001/api/docs
   ```

## Required Environment Variables

Make sure your `backend/.env` file has:

```env
# SumUp Payment
SUMUP_API_KEY=sup_sk_xas2RLNos33K2gf6l2zoj4j5n8Wbk7vWw
SUMUP_MERCHANT_CODE=your_merchant_code_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Port (optional, defaults to 3001)
PORT=3001
```

## Verify Backend is Running

1. **Check if port 3001 is in use:**
   ```bash
   netstat -ano | findstr :3001
   ```

2. **Test the API:**
   - Open browser: http://localhost:3001/api/docs
   - Should show Swagger documentation

3. **Test health endpoint (if exists):**
   ```bash
   curl http://localhost:3001/health
   ```

## Troubleshooting

### Backend won't start
- Check for errors in terminal
- Verify all environment variables are set
- Check if port 3001 is already in use
- Try: `npm install` in backend directory

### Connection refused
- Make sure backend is running
- Check firewall settings
- Verify `NEXT_PUBLIC_BACKEND_URL` in frontend `.env` is `http://localhost:3001`

### Module not found errors
- Run `npm install` in backend directory
- Check if `@supabase/supabase-js` is installed: `npm list @supabase/supabase-js`

## Current Status

The error message shows:
```
Impossible de se connecter au serveur de paiement. 
Vérifiez que le serveur backend est démarré sur le port 3001.
```

This means the backend is **not running**. Start it using the steps above!

