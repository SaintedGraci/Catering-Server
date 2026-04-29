# CORS Configuration for Production Deployment

## How CORS Works When Deployed Online

### Current Configuration (Development)

**In `.env` file:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081,http://127.0.0.1:3000
```

This currently allows:
- ✅ `http://localhost:8080` - Your local frontend
- ✅ `http://localhost:8081` - Your local frontend (alternate port)
- ✅ `http://localhost:3000` - Your local frontend (alternate port)
- ❌ Any other domain - **BLOCKED**

### What Happens When You Deploy

When you deploy your website online, you need to add your production domain to the allowed origins.

## Step-by-Step Deployment Guide

### Step 1: Get Your Production URLs

After deploying, you'll have URLs like:
- **Frontend**: `https://your-catering-site.com`
- **Backend API**: `https://api.your-catering-site.com`

### Step 2: Update `.env` on Your Server

**Option A: Replace localhost with production domains**
```env
# Production .env
ALLOWED_ORIGINS=https://your-catering-site.com,https://www.your-catering-site.com
```

**Option B: Keep both development and production (for testing)**
```env
# Mixed .env (not recommended for production)
ALLOWED_ORIGINS=http://localhost:8080,https://your-catering-site.com,https://www.your-catering-site.com
```

**Option C: Use environment-specific configuration (RECOMMENDED)**

Create separate `.env` files:

**`.env.development`** (for local development):
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081
```

**`.env.production`** (for production server):
```env
ALLOWED_ORIGINS=https://your-catering-site.com,https://www.your-catering-site.com,https://admin.your-catering-site.com
```

### Step 3: Deploy and Test

1. **Deploy backend** to your server (Railway, Heroku, AWS, etc.)
2. **Deploy frontend** to your hosting (Vercel, Netlify, etc.)
3. **Update `.env`** on the backend server with production origins
4. **Restart** the backend server
5. **Test** by accessing your frontend

## Example Deployment Scenarios

### Scenario 1: Both on Same Domain

**Setup:**
- Frontend: `https://catering.com`
- Backend: `https://catering.com/api`

**CORS Configuration:**
```env
ALLOWED_ORIGINS=https://catering.com
```

### Scenario 2: Separate Subdomains

**Setup:**
- Frontend: `https://www.catering.com`
- Backend: `https://api.catering.com`

**CORS Configuration:**
```env
ALLOWED_ORIGINS=https://www.catering.com,https://catering.com
```

### Scenario 3: Multiple Frontends

**Setup:**
- Public Site: `https://catering.com`
- Admin Panel: `https://admin.catering.com`
- Backend: `https://api.catering.com`

**CORS Configuration:**
```env
ALLOWED_ORIGINS=https://catering.com,https://www.catering.com,https://admin.catering.com
```

### Scenario 4: Staging + Production

**Setup:**
- Production: `https://catering.com`
- Staging: `https://staging.catering.com`
- Backend: `https://api.catering.com`

**CORS Configuration:**
```env
ALLOWED_ORIGINS=https://catering.com,https://www.catering.com,https://staging.catering.com
```

## How to Update CORS After Deployment

### Method 1: Environment Variables (Recommended)

Most hosting platforms allow you to set environment variables through their dashboard:

**Railway:**
1. Go to your project
2. Click "Variables" tab
3. Add `ALLOWED_ORIGINS` variable
4. Value: `https://your-domain.com,https://www.your-domain.com`
5. Redeploy

**Heroku:**
```bash
heroku config:set ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"
```

**Vercel/Netlify (for backend):**
1. Go to project settings
2. Environment Variables section
3. Add `ALLOWED_ORIGINS`
4. Redeploy

**AWS/DigitalOcean:**
1. SSH into your server
2. Edit `.env` file: `nano .env`
3. Update `ALLOWED_ORIGINS`
4. Restart server: `pm2 restart all` or `systemctl restart your-app`

### Method 2: Direct File Edit

If you have SSH access:

```bash
# SSH into your server
ssh user@your-server.com

# Navigate to your app directory
cd /path/to/CATERING-SERVER

# Edit .env file
nano .env

# Update ALLOWED_ORIGINS line
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Save and exit (Ctrl+X, Y, Enter)

# Restart your application
pm2 restart catering-server
# or
node index.js
```

## Testing Production CORS

### Test 1: From Browser Console

Open your production frontend and run in console:

```javascript
fetch('https://api.your-domain.com/api/dishes', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log('✅ CORS working:', data))
.catch(err => console.error('❌ CORS error:', err));
```

**Expected Result:**
- ✅ Data returned successfully
- ✅ No CORS errors in console

### Test 2: Using curl

```bash
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.your-domain.com/api/dishes
```

**Expected Response:**
```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Credentials: true
```

### Test 3: Check Server Logs

If CORS is blocking requests, you'll see in server logs:
```
CORS: Blocked request from unauthorized origin: https://some-domain.com
```

## Common Deployment Issues

### Issue 1: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** Your production domain is not in `ALLOWED_ORIGINS`

**Solution:**
```env
# Add your production domain
ALLOWED_ORIGINS=https://your-production-domain.com
```

### Issue 2: "Mixed Content" Error

**Cause:** Frontend is HTTPS but trying to access HTTP backend

**Solution:** Ensure backend is also HTTPS
```env
# Use HTTPS for production
ALLOWED_ORIGINS=https://your-domain.com  # Not http://
```

### Issue 3: Cookies Not Working in Production

**Cause:** Cookie `secure` flag requires HTTPS

**Solution:** Already configured in `authController.js`:
```javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // ✅ HTTPS in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

Make sure `NODE_ENV=production` is set on your server.

### Issue 4: www vs non-www

**Cause:** `www.your-domain.com` and `your-domain.com` are different origins

**Solution:** Include both in ALLOWED_ORIGINS:
```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## Security Best Practices for Production

### ✅ DO:

1. **Use HTTPS only** in production
   ```env
   ALLOWED_ORIGINS=https://your-domain.com  # ✅
   ```

2. **List specific domains** (no wildcards)
   ```env
   ALLOWED_ORIGINS=https://domain1.com,https://domain2.com  # ✅
   ```

3. **Remove localhost** from production
   ```env
   # Production .env - no localhost
   ALLOWED_ORIGINS=https://your-domain.com  # ✅
   ```

4. **Set NODE_ENV=production**
   ```env
   NODE_ENV=production
   ```

5. **Monitor blocked requests**
   - Check server logs regularly
   - Set up alerts for unusual CORS blocks

### ❌ DON'T:

1. **Never use wildcard in production**
   ```env
   ALLOWED_ORIGINS=*  # ❌ INSECURE!
   ```

2. **Don't include HTTP in production**
   ```env
   ALLOWED_ORIGINS=http://your-domain.com  # ❌ Use HTTPS
   ```

3. **Don't hardcode origins in code**
   ```javascript
   // ❌ Don't do this
   origin: ['https://hardcoded-domain.com']
   ```

4. **Don't leave localhost in production**
   ```env
   ALLOWED_ORIGINS=http://localhost:8080,https://prod.com  # ❌
   ```

## Deployment Checklist

Before deploying to production:

- [ ] Update `ALLOWED_ORIGINS` with production domain(s)
- [ ] Remove localhost origins from production `.env`
- [ ] Use HTTPS for all production origins
- [ ] Set `NODE_ENV=production`
- [ ] Include both www and non-www if needed
- [ ] Test CORS from production frontend
- [ ] Verify cookies work with HTTPS
- [ ] Check server logs for blocked origins
- [ ] Set up monitoring/alerts
- [ ] Document allowed origins

## Example: Complete Production .env

```env
# Database (Production)
DB_HOST=your-production-db.com
DB_USER=prod_user
DB_PASSWORD=strong-password-here
DB_NAME=catering_production
DB_DIALECT=mysql
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=very-strong-random-secret-key-256-bits

# CORS - Production Domains Only
ALLOWED_ORIGINS=https://catering.com,https://www.catering.com,https://admin.catering.com
```

## How the Code Works

The CORS configuration in `index.js` automatically reads from `.env`:

```javascript
// Reads from process.env.ALLOWED_ORIGINS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Checks if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // ✅ Allow
    } else {
      console.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS')); // ❌ Block
    }
  },
  credentials: true
};
```

**How it blocks:**
1. Browser sends request with `Origin: https://malicious-site.com`
2. CORS middleware checks if origin is in `allowedOrigins` array
3. Not found → Returns error: "Not allowed by CORS"
4. Browser blocks the response
5. Server logs: "CORS: Blocked request from unauthorized origin: https://malicious-site.com"

## Summary

✅ **Yes, CORS will block unauthorized domains when deployed online**

**To make it work in production:**
1. Update `ALLOWED_ORIGINS` in your production `.env` file
2. Add your production domain(s)
3. Use HTTPS (not HTTP)
4. Restart your server
5. Test from your production frontend

**Example:**
```env
# Before deployment (development)
ALLOWED_ORIGINS=http://localhost:8080

# After deployment (production)
ALLOWED_ORIGINS=https://your-catering-site.com,https://www.your-catering-site.com
```

The CORS configuration is already secure and production-ready. You just need to update the allowed origins when you deploy! 🚀
