# HTTPS Setup Guide

## Overview

This guide explains how to configure HTTPS for the Filipino Catering System in both development and production environments.

## Current Security Status

### ✅ Already Implemented

**1. Secure Cookie Configuration**
- Cookies use `secure` flag in production (HTTPS only)
- Configured in `src/Controller/authController.js`:
  ```javascript
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```

**2. Environment-Based Configuration**
- Development: `secure: false` (allows HTTP)
- Production: `secure: true` (requires HTTPS)

## HTTPS Implementation Options

### Option 1: Development with Self-Signed Certificates (Local Testing)

For testing HTTPS locally during development.

#### Step 1: Generate Self-Signed Certificate

**Using OpenSSL (Windows/Mac/Linux):**
```bash
# Navigate to CATERING-SERVER directory
cd CATERING-SERVER

# Create ssl directory
mkdir ssl
cd ssl

# Generate private key and certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Answer the prompts (use localhost for Common Name)
```

**Using mkcert (Recommended for Development):**
```bash
# Install mkcert
# Windows (with Chocolatey):
choco install mkcert

# Mac (with Homebrew):
brew install mkcert

# Linux:
# Download from https://github.com/FiloSottile/mkcert/releases

# Install local CA
mkcert -install

# Generate certificate for localhost
cd CATERING-SERVER
mkdir ssl
cd ssl
mkcert localhost 127.0.0.1 ::1

# This creates:
# - localhost+2.pem (certificate)
# - localhost+2-key.pem (private key)
```

#### Step 2: Update .gitignore

```bash
# Add to CATERING-SERVER/.gitignore
echo "ssl/" >> .gitignore
echo "*.pem" >> .gitignore
```

#### Step 3: Create HTTPS Server Configuration

Create `CATERING-SERVER/server-https.js`:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Express app
const app = require('./index');

// HTTPS configuration
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost+2.pem'))
};

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Create HTTPS server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
});

// Optional: HTTP to HTTPS redirect
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://localhost:${HTTPS_PORT}${req.url}` });
  res.end();
}).listen(PORT, () => {
  console.log(`HTTP Server redirecting from http://localhost:${PORT} to HTTPS`);
});
```

#### Step 4: Modify index.js for HTTPS Support

Update `CATERING-SERVER/index.js` to export the app:

```javascript
// At the end of index.js, replace:
// startServer();

// With:
if (require.main === module) {
  // Only start server if this file is run directly
  startServer();
} else {
  // Export app for HTTPS server
  module.exports = app;
}
```

#### Step 5: Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "start": "node index.js",
    "start:https": "node server-https.js",
    "create-admin": "node scripts/createAdmin.js"
  }
}
```

#### Step 6: Update Environment Variables

Add to `.env`:
```env
HTTPS_PORT=5443
```

#### Step 7: Update Frontend Proxy

Update `catering-ui/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://localhost:5443', // HTTPS backend
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in dev
      },
    },
  },
  // ... rest of config
});
```

#### Step 8: Start with HTTPS

```bash
# Backend with HTTPS
cd CATERING-SERVER
npm run start:https

# Frontend
cd catering-ui
npm run dev

# Access:
# Backend: https://localhost:5443
# Frontend: http://localhost:8080 (proxies to HTTPS backend)
```

### Option 2: Production with Let's Encrypt (Free SSL)

For production deployment with free SSL certificates.

#### Prerequisites
- Domain name pointing to your server
- Server with public IP address
- Port 80 and 443 open

#### Step 1: Install Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot
```

**CentOS/RHEL:**
```bash
sudo yum install certbot
```

**Using Snap (Universal):**
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### Step 2: Obtain SSL Certificate

**Standalone Mode (if port 80 is free):**
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Webroot Mode (if you have a web server running):**
```bash
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com -d www.yourdomain.com
```

Certificates will be saved to:
- Certificate: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

#### Step 3: Configure Production HTTPS Server

Create `CATERING-SERVER/server-production.js`:

```javascript
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Express app
const app = require('./index');

const PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const DOMAIN = process.env.DOMAIN || 'yourdomain.com';

// HTTPS configuration with Let's Encrypt certificates
const httpsOptions = {
  key: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`),
  cert: fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/fullchain.pem`)
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on https://${DOMAIN}:${HTTPS_PORT}`);
});

// HTTP to HTTPS redirect
http.createServer((req, res) => {
  res.writeHead(301, { 
    Location: `https://${req.headers.host}${req.url}` 
  });
  res.end();
}).listen(PORT, () => {
  console.log(`HTTP Server redirecting from port ${PORT} to HTTPS`);
});
```

#### Step 4: Update Environment Variables

Production `.env`:
```env
NODE_ENV=production
PORT=80
HTTPS_PORT=443
DOMAIN=yourdomain.com
JWT_SECRET=your-strong-production-secret
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Step 5: Set Up Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e

# Add this line (runs twice daily):
0 0,12 * * * certbot renew --quiet --post-hook "systemctl restart catering-server"
```

#### Step 6: Configure Systemd Service

Create `/etc/systemd/system/catering-server.service`:

```ini
[Unit]
Description=Filipino Catering System Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/catering-server
ExecStart=/usr/bin/node server-production.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable catering-server
sudo systemctl start catering-server
sudo systemctl status catering-server
```

### Option 3: Production with Reverse Proxy (Nginx)

Use Nginx as a reverse proxy to handle HTTPS and forward to Node.js.

#### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### Step 2: Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/catering`:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve frontend static files
    location / {
        root /var/www/catering-ui/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Step 4: Enable Site and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/catering /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Update Backend for Proxy

In `index.js`, add trust proxy:

```javascript
// Trust proxy (for Nginx)
app.set('trust proxy', 1);
```

### Option 4: Cloud Platform HTTPS (Railway, Heroku, Vercel)

Most cloud platforms handle HTTPS automatically.

#### Railway
- Automatically provides HTTPS
- Custom domain: Add domain in settings, update DNS
- SSL certificate automatically provisioned

#### Heroku
- Automatically provides HTTPS on *.herokuapp.com
- Custom domain: `heroku domains:add yourdomain.com`
- SSL automatically enabled

#### Vercel (Frontend)
- Automatically provides HTTPS
- Custom domain: Add in project settings
- SSL automatically provisioned

#### AWS/DigitalOcean
- Use Application Load Balancer (ALB) with ACM certificate
- Or use Nginx reverse proxy (Option 3)

## HTTP to HTTPS Redirection

### Method 1: Express Middleware

Add to `index.js` (before routes):

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Method 2: Separate HTTP Server (see Option 1 & 2 above)

### Method 3: Nginx Redirect (see Option 3 above)

## Secure Cookie Configuration

### Current Implementation

Already configured in `authController.js`:

```javascript
res.cookie('token', token, {
  httpOnly: true,                                    // ✅ Prevents XSS
  secure: process.env.NODE_ENV === 'production',    // ✅ HTTPS only in production
  sameSite: 'strict',                                // ✅ Prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000                   // ✅ 7 days expiration
});
```

### How It Works

**Development (HTTP):**
- `secure: false` - Cookies work over HTTP
- Allows local testing without HTTPS

**Production (HTTPS):**
- `secure: true` - Cookies only sent over HTTPS
- Browsers reject cookies over HTTP
- Protects against man-in-the-middle attacks

## Testing HTTPS

### Test 1: Verify HTTPS is Working

```bash
# Test HTTPS endpoint
curl -I https://yourdomain.com/api/dishes

# Should return:
# HTTP/2 200
# strict-transport-security: max-age=31536000
```

### Test 2: Verify HTTP Redirects to HTTPS

```bash
# Test HTTP redirect
curl -I http://yourdomain.com/api/dishes

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/api/dishes
```

### Test 3: Verify Secure Cookies

```bash
# Login and check cookie
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt -v

# Check cookies.txt - should have:
# Secure flag: TRUE
# HttpOnly flag: TRUE
```

### Test 4: SSL Certificate Validation

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Or use online tools:
# https://www.ssllabs.com/ssltest/
```

## Security Best Practices

### 1. Strong SSL Configuration

```javascript
// In server-production.js
const httpsOptions = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem'),
  // Strong ciphers only
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  // Prefer server ciphers
  honorCipherOrder: true,
  // Minimum TLS version
  minVersion: 'TLSv1.2'
};
```

### 2. HSTS (HTTP Strict Transport Security)

Already configured in Helmet:

```javascript
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Certificate Monitoring

- Monitor certificate expiration
- Set up alerts 30 days before expiry
- Test auto-renewal regularly

### 4. Security Headers

Already configured via Helmet (see `SECURITY_HEADERS.md`)

## Troubleshooting

### Issue 1: "Certificate not trusted" in browser

**Development:**
- Use mkcert to install local CA
- Or accept self-signed certificate warning

**Production:**
- Ensure Let's Encrypt certificate is properly installed
- Check certificate chain includes intermediate certificates

### Issue 2: Cookies not working over HTTPS

```javascript
// Check NODE_ENV is set to production
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verify secure flag
res.cookie('token', token, {
  secure: process.env.NODE_ENV === 'production', // Must be true in production
  // ...
});
```

### Issue 3: Mixed content warnings

- Ensure all resources (images, scripts, CSS) use HTTPS
- Update API URLs to use HTTPS
- Check Content-Security-Policy allows HTTPS only

### Issue 4: HTTP to HTTPS redirect loop

```javascript
// Check X-Forwarded-Proto header (for proxies)
if (req.header('x-forwarded-proto') !== 'https') {
  // Only redirect if not already HTTPS
}
```

## Deployment Checklist

Before deploying with HTTPS:

- [ ] SSL certificate obtained and installed
- [ ] `NODE_ENV=production` set
- [ ] Secure cookies enabled (`secure: true`)
- [ ] HTTP to HTTPS redirect configured
- [ ] HSTS header enabled
- [ ] Certificate auto-renewal configured
- [ ] Frontend uses HTTPS API URLs
- [ ] CORS `ALLOWED_ORIGINS` uses HTTPS
- [ ] All external resources use HTTPS
- [ ] SSL certificate tested (SSLLabs)
- [ ] Cookies tested over HTTPS
- [ ] HTTP redirect tested

## Summary

### ✅ Already Implemented
- Secure cookie configuration with environment-based `secure` flag
- Helmet security headers including HSTS
- Environment variable configuration

### 🔧 To Implement (Choose One)
- **Development**: Self-signed certificates with mkcert
- **Production**: Let's Encrypt with Certbot
- **Production**: Nginx reverse proxy
- **Cloud**: Platform-managed HTTPS (Railway, Heroku, Vercel)

### 🔒 Security Benefits
- Encrypted data transmission
- Secure cookie protection
- Man-in-the-middle attack prevention
- Browser security features enabled
- SEO and trust improvements

Your application is ready for HTTPS! Choose the deployment option that fits your infrastructure. 🚀
