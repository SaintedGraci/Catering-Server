# JWT Refresh Token Implementation

## Overview

The Filipino Catering System now implements a secure JWT authentication system with refresh tokens. This provides better security through short-lived access tokens while maintaining a good user experience with automatic token refresh.

## Architecture

### Two-Token System

**1. Access Token (Short-lived)**
- **Purpose:** Authenticate API requests
- **Lifetime:** 15 minutes
- **Storage:** HTTP-only cookie named `token`
- **Contains:** User ID, email, token type
- **Used for:** All protected API endpoints

**2. Refresh Token (Long-lived)**
- **Purpose:** Obtain new access tokens
- **Lifetime:** 7 days
- **Storage:** HTTP-only cookie named `refreshToken`
- **Contains:** User ID, token type
- **Used for:** `/api/auth/refresh` endpoint only
- **Path restriction:** Only sent to `/api/auth/refresh`

### Token Flow

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                            │
└─────────────────────────────────────────────────────────┘

1. User submits credentials
   ↓
2. Server validates credentials
   ↓
3. Server generates:
   - Access Token (15 min)
   - Refresh Token (7 days)
   ↓
4. Server sets HTTP-only cookies:
   - token (access token)
   - refreshToken (refresh token, path=/api/auth/refresh)
   ↓
5. Client receives user data


┌─────────────────────────────────────────────────────────┐
│                  API REQUEST FLOW                        │
└─────────────────────────────────────────────────────────┘

1. Client makes API request
   ↓
2. Browser automatically sends access token cookie
   ↓
3. Server validates access token
   ↓
4a. Token valid → Process request
4b. Token expired → Return 401 with code: TOKEN_EXPIRED


┌─────────────────────────────────────────────────────────┐
│                  TOKEN REFRESH FLOW                      │
└─────────────────────────────────────────────────────────┘

1. Client receives 401 TOKEN_EXPIRED
   ↓
2. Client automatically calls /api/auth/refresh
   ↓
3. Browser sends refresh token cookie
   ↓
4. Server validates refresh token
   ↓
5a. Refresh token valid:
    - Generate new access token
    - Set new access token cookie
    - Return success
    ↓
    Client retries original request
    
5b. Refresh token invalid/expired:
    - Return 401
    ↓
    Client redirects to login
```

## Implementation Details

### Backend (Express.js)

#### 1. Token Generation

**Location:** `src/Controller/authController.js`

```javascript
// Access token (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Refresh token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};
```

#### 2. Cookie Configuration

```javascript
// Access token cookie
res.cookie('token', accessToken, {
  httpOnly: true,                                    // ✅ Prevents XSS
  secure: process.env.NODE_ENV === 'production',    // ✅ HTTPS only in production
  sameSite: 'strict',                                // ✅ Prevents CSRF
  maxAge: 15 * 60 * 1000                            // ✅ 15 minutes
});

// Refresh token cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,                                    // ✅ Prevents XSS
  secure: process.env.NODE_ENV === 'production',    // ✅ HTTPS only in production
  sameSite: 'strict',                                // ✅ Prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,                  // ✅ 7 days
  path: '/api/auth/refresh'                          // ✅ Only sent to refresh endpoint
});
```

#### 3. Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "isActive": true
  }
}
```

**Cookies Set:**
- `token` (access token, 15 min)
- `refreshToken` (refresh token, 7 days, path=/api/auth/refresh)

#### 4. Refresh Endpoint

**Endpoint:** `POST /api/auth/refresh`

**Request:** No body (uses refresh token from cookie)

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "isActive": true
  }
}
```

**Cookies Set:**
- `token` (new access token, 15 min)

**Rate Limiting:**
- 20 requests per 15 minutes per IP

#### 5. Authentication Middleware

**Location:** `src/Middlewares/authMiddleware.js`

```javascript
// Validates access token
// Returns 401 with code: TOKEN_EXPIRED if token expired
// Frontend uses this to trigger automatic refresh
```

#### 6. Logout Endpoint

**Endpoint:** `POST /api/auth/logout`

**Clears both cookies:**
- `token` (access token)
- `refreshToken` (refresh token)

### Frontend (React + TypeScript)

#### 1. Automatic Token Refresh

**Location:** `src/lib/api.ts`

```typescript
// Intercepts 401 TOKEN_EXPIRED responses
// Automatically calls /api/auth/refresh
// Retries original request with new token
// Redirects to login if refresh fails
```

**Features:**
- Prevents multiple simultaneous refresh requests
- Queues requests during refresh
- Retries failed requests after refresh
- Automatic redirect to login on refresh failure

#### 2. Request Flow

```typescript
// 1. Make API request
const data = await dishService.getAll();

// 2. If access token expired:
//    - Automatically calls /api/auth/refresh
//    - Gets new access token
//    - Retries dishService.getAll()
//    - Returns data seamlessly

// 3. If refresh token expired:
//    - Redirects to /admin/login
//    - User must login again
```

#### 3. Auth Service

**Location:** `src/lib/api.ts`

```typescript
export const authService = {
  login: (email, password) => { ... },
  logout: () => { ... },
  refresh: () => { ... },  // ✅ New refresh method
  verifyToken: () => { ... },
  getProfile: () => { ... },
  updateProfile: (data) => { ... },
  changePassword: (currentPassword, newPassword) => { ... }
};
```

## Security Features

### ✅ Implemented

**1. HTTP-Only Cookies**
- Tokens stored in HTTP-only cookies
- JavaScript cannot access tokens
- Prevents XSS token theft

**2. Secure Flag**
- Cookies only sent over HTTPS in production
- Prevents man-in-the-middle attacks

**3. SameSite Strict**
- Cookies not sent with cross-site requests
- Prevents CSRF attacks

**4. Short-Lived Access Tokens**
- Access tokens expire after 15 minutes
- Limits damage if token is compromised
- Reduces attack window

**5. Long-Lived Refresh Tokens**
- Refresh tokens expire after 7 days
- Good user experience (stay logged in)
- Separate secret key from access tokens

**6. Token Type Validation**
- Access tokens have `type: 'access'`
- Refresh tokens have `type: 'refresh'`
- Prevents token misuse

**7. Path Restriction**
- Refresh token only sent to `/api/auth/refresh`
- Reduces exposure of refresh token
- Minimizes attack surface

**8. Rate Limiting**
- Login: 5 attempts per 15 minutes
- Refresh: 20 attempts per 15 minutes
- Prevents brute force attacks

**9. Automatic Token Refresh**
- Seamless user experience
- No manual token management
- Transparent to user

**10. Separate Secrets**
- Different secrets for access and refresh tokens
- Compromising one doesn't compromise the other

## Security Benefits

### Before Refresh Tokens

**Issues:**
- Long-lived tokens (7 days)
- If token stolen, attacker has 7 days of access
- No way to revoke without logout
- Large attack window

### After Refresh Tokens

**Improvements:**
- ✅ Short-lived access tokens (15 minutes)
- ✅ If access token stolen, only 15 minutes of access
- ✅ Refresh token can be revoked (future enhancement)
- ✅ Minimal attack window
- ✅ Better security without sacrificing UX

## Environment Variables

### Required Variables

```env
# Access token secret (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Refresh token secret (32+ characters, DIFFERENT from JWT_SECRET)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (different!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing

### Test 1: Login and Token Generation

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt -v

# Check cookies.txt - should have:
# - token (access token)
# - refreshToken (refresh token)
```

### Test 2: Access Token Expiration

```bash
# Wait 16 minutes (access token expires after 15 min)

# Try to access protected endpoint
curl http://localhost:5000/api/auth/profile \
  -b cookies.txt -v

# Should return:
# 401 Unauthorized
# { "success": false, "message": "Token expired", "code": "TOKEN_EXPIRED" }
```

### Test 3: Token Refresh

```bash
# Call refresh endpoint
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt -c cookies.txt -v

# Should return:
# 200 OK
# { "success": true, "message": "Token refreshed successfully", "user": {...} }

# cookies.txt updated with new access token
```

### Test 4: Automatic Refresh (Frontend)

```typescript
// In browser console:

// 1. Login
await authService.login('admin@example.com', 'password');

// 2. Wait 16 minutes (or manually expire token)

// 3. Make API request
const dishes = await dishService.getAll();

// Should work seamlessly:
// - Detects expired token
// - Automatically refreshes
// - Retries request
// - Returns data
```

### Test 5: Refresh Token Expiration

```bash
# Wait 8 days (refresh token expires after 7 days)

# Try to refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt -v

# Should return:
# 401 Unauthorized
# { "success": false, "message": "Refresh token expired" }

# User must login again
```

## Token Lifetimes

### Current Configuration

| Token Type | Lifetime | Purpose | Storage |
|------------|----------|---------|---------|
| Access Token | 15 minutes | API authentication | HTTP-only cookie `token` |
| Refresh Token | 7 days | Get new access tokens | HTTP-only cookie `refreshToken` |

### Customization

To change token lifetimes, update `authController.js`:

```javascript
// Shorter access token (5 minutes)
const JWT_EXPIRES_IN = '5m';

// Longer refresh token (30 days)
const JWT_REFRESH_EXPIRES_IN = '30d';
```

**Recommendations:**
- **Access Token:** 5-30 minutes (balance security vs. UX)
- **Refresh Token:** 7-30 days (balance convenience vs. security)

## Future Enhancements

### 1. Refresh Token Rotation

**Current:** Refresh token stays the same  
**Enhancement:** Generate new refresh token on each refresh

**Benefits:**
- Detects token theft
- Limits refresh token lifetime
- Better security

### 2. Refresh Token Revocation

**Current:** No revocation mechanism  
**Enhancement:** Store refresh tokens in database

**Benefits:**
- Revoke tokens on logout
- Revoke all sessions
- Force re-login

### 3. Device Tracking

**Current:** No device tracking  
**Enhancement:** Track devices/sessions

**Benefits:**
- See active sessions
- Revoke specific devices
- Security monitoring

### 4. Sliding Sessions

**Current:** Fixed 7-day refresh token  
**Enhancement:** Extend refresh token on activity

**Benefits:**
- Stay logged in while active
- Auto-logout when inactive
- Better UX

## Troubleshooting

### Issue 1: "Token expired" immediately after login

**Cause:** Server and client clocks out of sync

**Solution:**
```bash
# Sync server clock
sudo ntpdate -s time.nist.gov

# Or use NTP service
sudo systemctl start ntp
```

### Issue 2: Refresh token not sent to refresh endpoint

**Cause:** Cookie path restriction

**Solution:** Ensure refresh endpoint is `/api/auth/refresh` exactly

### Issue 3: Infinite refresh loop

**Cause:** Refresh endpoint also requires authentication

**Solution:** Refresh endpoint should NOT use `authenticate` middleware

### Issue 4: CORS issues with cookies

**Cause:** `credentials: 'include'` not set

**Solution:**
```typescript
// Frontend
fetch(url, {
  credentials: 'include' // ✅ Required for cookies
});

// Backend
cors({
  credentials: true // ✅ Required
});
```

## Summary

### ✅ Implemented

**Backend:**
- Two-token system (access + refresh)
- Short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days)
- Separate secrets for each token type
- Token type validation
- Path-restricted refresh token
- Refresh endpoint with rate limiting

**Frontend:**
- Automatic token refresh on expiration
- Request queuing during refresh
- Automatic retry after refresh
- Redirect to login on refresh failure
- Seamless user experience

### 🔒 Security Benefits

- Minimal attack window (15 min vs. 7 days)
- HTTP-only cookies (XSS protection)
- Secure flag (HTTPS only in production)
- SameSite strict (CSRF protection)
- Token type validation
- Path restriction
- Rate limiting
- Separate secrets

### 🚀 User Experience

- Stay logged in for 7 days
- Automatic token refresh
- No manual token management
- Seamless API requests
- No interruptions

Your JWT authentication system is now production-ready with refresh tokens! 🔐
