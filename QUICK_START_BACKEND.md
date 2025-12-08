# Quick Start Backend

## Command to Start Backend

```bash
cd D:\emat1\backend
npm run start:dev
```

**Important:** Use `start:dev`, NOT `dev`!

## What You Should See

After running the command, wait for:
```
🚀 Backend server running on port 3001
📚 API Documentation: http://localhost:3001/api/docs
```

## Verify It's Running

Open in browser: http://localhost:3001/api/docs

You should see the Swagger API documentation.

## If You Get Errors

1. **Missing dependencies:**
   ```bash
   npm install
   ```

2. **Port already in use:**
   - Check if something else is using port 3001
   - Change PORT in backend/.env

3. **Environment variables missing:**
   - Check backend/.env file exists
   - Add required variables (see START_BACKEND.md)

