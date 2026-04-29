# Environment Variables Security Guide

## Overview

Environment variables are used to store sensitive configuration data like database credentials, API keys, and secrets. This guide explains how they are secured in this project.

## ✅ Security Implementation Status

### Backend (CATERING-SERVER)
- [x] `dotenv` package installed and configured
- [x] `.env` file used for all sensitive data
- [x] `.env` excluded from version control via `.gitignore`
- [x] `.env.example` template provided
- [x] All secrets stored in environment variables
- [x] No hardcoded credentials in code

### Frontend (catering-ui)
- [x] `.env` excluded from version control via `.gitignore`
- [x] `.env.example` template provided
- [x] Vite proxy configured for API requests
- [x] No sensitive data in frontend environment variables

## Environment Variables Used

### Backend (.env)

#### Database Configuration
```env
DB_HOST=localhost              # Database host
DB_USER=root                   # Database username
DB_PASSWORD=your_password      # Database password (SENSITIVE)
DB_NAME=catering_db            # Database name
DB_DIALECT=mysql               # Database type
DB_PORT=3306                   # Database port
```

#### Server Configuration
```env
PORT=5000                      # Server port
NODE_ENV=development           # Environment (development/production)
```

#### Security Configuration
```env
JWT_SECRET=your-secret-key     # JWT signing secret (SENSITIVE)
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081
```

### Frontend (.env)

The frontend uses Vite's environment variable system. Variables must be prefixed with `VITE_` to be exposed to the client.

```env
# Optional - API URL (defaults to /api with Vite proxy)
VITE_API_URL=/api
```

**Important:** Frontend environment variables are bundled into the client code and are publicly accessible. Never store sensitive data in frontend .env files.

## How It Works

### Backend (Express.js)

**1. dotenv Package**
```javascript
// index.js
require('dotenv').config();
```

This loads environment variables from `.env` file into `process.env`.

**2. Accessing Variables**
```javascript
// Example: Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT
};

// Example: JWT secret
const jwtSecret = process.env.JWT_SECRET;
```

**3. Files Using Environment Variables**
- `config/database.js` - Database credentials
- `index.js` - Server port, CORS origins
- `src/Controller/authController.js` - JWT secret
- `src/Middlewares/authMiddleware.js` - JWT secret

### Frontend (React + Vite)

**1. Vite Environment Variables**
Vite automatically loads `.env` files and exposes variables prefixed with `VITE_`.

**2. Accessing Variables**
```typescript
// Example: API URL
const apiUrl = import.meta.env.VITE_API_URL || '/api';
```

**3. Vite Proxy (Development)**
In development, Vite proxies `/api` requests to `http://localhost:5000`:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

This means the frontend can use relative URLs like `/api/dishes` without CORS issues.

## Version Control Protection

### .gitignore Configuration

**Backend (.gitignore):**
```gitignore
# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Frontend (.gitignore):**
```gitignore
# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### What's Committed vs. Ignored

✅ **Committed to Git:**
- `.env.example` - Template with placeholder values
- `.gitignore` - Ensures .env is never committed
- Code that reads from `process.env`

❌ **Never Committed:**
- `.env` - Contains actual sensitive values
- `.env.local` - Local overrides
- `.env.production` - Production secrets

## Setup Instructions

### For New Developers

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup**
   ```bash
   cd CATERING-SERVER
   
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env  # or use your preferred editor
   
   # Install dependencies
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd catering-ui
   
   # Copy the example file (optional)
   cp .env.example .env
   
   # Install dependencies
   npm install
   ```

4. **Configure your .env**
   - Set your database credentials
   - Generate a strong JWT_SECRET
   - Update ALLOWED_ORIGINS if needed

### Generating Secure Secrets

**JWT_SECRET (recommended: 32+ characters):**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online generator
# Visit: https://randomkeygen.com/
```

## Production Deployment

### Environment Variables in Production

**DO NOT:**
- ❌ Commit .env to version control
- ❌ Use development secrets in production
- ❌ Share .env files via email/chat
- ❌ Store secrets in frontend .env

**DO:**
- ✅ Use your hosting platform's environment variable system
- ✅ Generate new, strong secrets for production
- ✅ Use HTTPS in production (set NODE_ENV=production)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment

### Platform-Specific Configuration

#### Railway
1. Go to your project
2. Click "Variables" tab
3. Add each environment variable
4. Redeploy

#### Heroku
```bash
heroku config:set DB_HOST=your-db-host
heroku config:set DB_PASSWORD=your-password
heroku config:set JWT_SECRET=your-secret
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
```

#### Vercel
1. Go to project settings
2. Environment Variables section
3. Add variables for each environment (Production, Preview, Development)

#### AWS/DigitalOcean
1. SSH into your server
2. Create `.env` file in app directory
3. Set proper file permissions: `chmod 600 .env`
4. Restart your application

#### Docker
```dockerfile
# Use environment variables in docker-compose.yml
environment:
  - DB_HOST=${DB_HOST}
  - DB_PASSWORD=${DB_PASSWORD}
  - JWT_SECRET=${JWT_SECRET}
```

Or use `.env` file with docker-compose:
```yaml
# docker-compose.yml
services:
  backend:
    env_file:
      - .env
```

## Security Best Practices

### 1. Strong Secrets
```env
# ❌ Weak
JWT_SECRET=secret123

# ✅ Strong
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c03f0b8e8c8e8c8e8c8e8c8e8c8e8c8e8
```

### 2. Different Secrets Per Environment
```env
# Development .env
JWT_SECRET=dev-secret-key-12345

# Production .env (different secret!)
JWT_SECRET=prod-a8f5f167f44f4964e6c998dee827110c
```

### 3. Principle of Least Privilege
```env
# ❌ Database root user
DB_USER=root

# ✅ Limited privilege user
DB_USER=catering_app_user
```

### 4. Regular Rotation
- Rotate JWT_SECRET every 90 days
- Rotate database passwords every 180 days
- Rotate API keys when team members leave

### 5. Access Control
```bash
# Set proper file permissions on server
chmod 600 .env
chown app_user:app_user .env
```

### 6. Backup Securely
- Store production .env in secure password manager
- Encrypt backups
- Limit access to authorized personnel only

## Troubleshooting

### Issue 1: "Cannot find module 'dotenv'"
```bash
# Solution: Install dotenv
npm install dotenv
```

### Issue 2: Environment variables not loading
```javascript
// Make sure dotenv is loaded at the top of index.js
require('dotenv').config();

// Check if variable exists
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
```

### Issue 3: Wrong environment loaded
```bash
# Specify environment file explicitly
node -r dotenv/config index.js dotenv_config_path=.env.production
```

### Issue 4: Variables not updating
```bash
# Restart the server after changing .env
# Kill the process and start again
npm start
```

## Verification Checklist

Before deploying to production:

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with placeholder values
- [ ] All sensitive data is in environment variables
- [ ] No hardcoded credentials in code
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] Production secrets are different from development
- [ ] `NODE_ENV=production` set in production
- [ ] HTTPS enabled in production
- [ ] ALLOWED_ORIGINS updated with production domain
- [ ] Database user has minimal required privileges
- [ ] `.env` file permissions set to 600 on server
- [ ] Backup of production .env stored securely

## Testing

### Test Environment Variables Loading

**Backend:**
```javascript
// Create test-env.js
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS ? '✅ Set' : '❌ Missing');

// Run: node test-env.js
```

### Test .gitignore

```bash
# Check if .env is ignored
git status

# .env should NOT appear in untracked files
# If it does, add it to .gitignore
```

## Summary

✅ **Implemented:**
- dotenv package installed and configured
- All sensitive data in environment variables
- .env excluded from version control
- .env.example templates provided
- No hardcoded credentials

✅ **Protected:**
- Database credentials
- JWT secret key
- CORS allowed origins
- Server configuration

✅ **Best Practices:**
- Strong secret generation
- Environment-specific configuration
- Secure file permissions
- Regular secret rotation
- Access control

Your sensitive data is now properly secured using environment variables! 🔒
