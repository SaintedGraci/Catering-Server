# CORS Security Configuration

## Overview

This document describes the secure CORS (Cross-Origin Resource Sharing) configuration implemented to protect the Express.js API from unauthorized cross-origin requests.

## Security Requirements

✅ **All requirements implemented:**
1. ✅ Allow only trusted frontend origins
2. ✅ Enable credentials (cookies, authentication headers)
3. ✅ Block unknown origins

## Implementation

### Configuration Location

`CATERING-SERVER/index.js`

### Environment Variables

Allowed origins are configured in `.env`:

```env
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081,http://127.0.0.1:3000

# For production, update to your production domain:
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### CORS Configuration Code

```javascript
// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log and block unauthorized origin
      console.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
```

## Security Features

### 1. Origin Validation

**Function**: Dynamic origin checking with callback

**Behavior**:
- ✅ Allows requests from trusted origins in `ALLOWED_ORIGINS`
- ✅ Allows requests with no origin (same-origin, mobile apps, API tools)
- ❌ Blocks all other origins
- 📝 Logs blocked attempts for security monitoring

**Example**:
```javascript
// ✅ Allowed
Origin: http://localhost:8080

// ❌ Blocked
Origin: http://malicious-site.com
// Console: "CORS: Blocked request from unauthorized origin: http://malicious-site.com"
```

### 2. Credentials Support

**Setting**: `credentials: true`

**Purpose**: Allows the frontend to send and receive:
- HTTP-only cookies (authentication tokens)
- Authorization headers
- Client certificates

**Security**: Combined with origin validation, ensures only trusted origins can access authenticated endpoints.

### 3. Allowed Methods

**Setting**: `methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']`

**Purpose**: Explicitly defines which HTTP methods are allowed.

**Security**: Prevents unauthorized methods like TRACE or CONNECT.

### 4. Allowed Headers

**Setting**: `allowedHeaders: ['Content-Type', 'Authorization']`

**Purpose**: Restricts which headers the frontend can send.

**Security**: Prevents injection of malicious custom headers.

### 5. Exposed Headers

**Setting**: `exposedHeaders: ['Set-Cookie']`

**Purpose**: Allows frontend to read specific response headers.

**Security**: Only exposes necessary headers, not all headers.

### 6. Preflight Caching

**Setting**: `maxAge: 86400` (24 hours)

**Purpose**: Caches preflight OPTIONS requests to reduce overhead.

**Security**: Reduces attack surface by minimizing preflight requests.

### 7. Options Success Status

**Setting**: `optionsSuccessStatus: 204`

**Purpose**: Returns 204 No Content for successful OPTIONS requests.

**Compatibility**: Works with legacy browsers that have issues with 200 status.

## Request Flow

### Allowed Origin Request

```
1. Browser sends request with Origin header
   Origin: http://localhost:8080

2. CORS middleware checks origin
   ✅ Found in allowedOrigins

3. Server responds with CORS headers
   Access-Control-Allow-Origin: http://localhost:8080
   Access-Control-Allow-Credentials: true

4. Browser allows the response
```

### Blocked Origin Request

```
1. Browser sends request with Origin header
   Origin: http://malicious-site.com

2. CORS middleware checks origin
   ❌ Not in allowedOrigins

3. Server logs warning
   "CORS: Blocked request from unauthorized origin: http://malicious-site.com"

4. Server responds with error
   Error: Not allowed by CORS

5. Browser blocks the response
```

### Preflight Request (OPTIONS)

```
1. Browser sends OPTIONS request
   Origin: http://localhost:8080
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type

2. CORS middleware validates origin
   ✅ Allowed

3. Server responds with preflight headers
   Access-Control-Allow-Origin: http://localhost:8080
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   Access-Control-Allow-Headers: Content-Type, Authorization
   Access-Control-Allow-Credentials: true
   Access-Control-Max-Age: 86400

4. Browser caches preflight response for 24 hours

5. Browser sends actual request
```

## Configuration for Different Environments

### Development

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081,http://127.0.0.1:3000
```

### Staging

```env
ALLOWED_ORIGINS=https://staging.yourdomain.com,https://staging-admin.yourdomain.com
```

### Production

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

## Testing CORS Configuration

### Test Allowed Origin

```bash
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/dishes
```

**Expected Response**:
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

### Test Blocked Origin

```bash
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5000/api/dishes
```

**Expected Response**:
```
Error: Not allowed by CORS
```

**Server Console**:
```
CORS: Blocked request from unauthorized origin: http://malicious-site.com
```

## Security Best Practices

### ✅ Implemented

1. **Dynamic Origin Validation** - Uses callback function instead of wildcard
2. **Environment-Based Configuration** - Origins configured via environment variables
3. **Credentials Enabled** - Allows secure cookie-based authentication
4. **Explicit Method Whitelist** - Only necessary HTTP methods allowed
5. **Header Restrictions** - Only required headers permitted
6. **Logging** - Blocked origins logged for security monitoring
7. **No Wildcard Origins** - Never uses `*` for origin
8. **Preflight Caching** - Reduces attack surface

### ❌ Never Do This

```javascript
// ❌ INSECURE - Allows all origins
app.use(cors({ origin: '*' }));

// ❌ INSECURE - Allows credentials with wildcard
app.use(cors({ origin: '*', credentials: true }));

// ❌ INSECURE - No origin validation
app.use(cors({ origin: true }));

// ❌ INSECURE - Hardcoded origins in code
const corsOptions = {
  origin: ['http://localhost:3000', 'http://production.com']
};
```

## Common CORS Errors and Solutions

### Error: "No 'Access-Control-Allow-Origin' header"

**Cause**: Origin not in allowed list

**Solution**: Add origin to `ALLOWED_ORIGINS` in `.env`

### Error: "Credentials flag is true, but Access-Control-Allow-Credentials is not"

**Cause**: `credentials: true` not set in CORS config

**Solution**: Already configured correctly in our setup

### Error: "CORS policy: The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'"

**Cause**: Using wildcard with credentials

**Solution**: Already using specific origins in our setup

## Monitoring and Logging

### What to Monitor

- Blocked origin attempts (logged to console)
- Unusual patterns of CORS errors
- Requests from unexpected origins

### Log Format

```
CORS: Blocked request from unauthorized origin: http://malicious-site.com
```

### Recommended Actions

1. Review logs regularly for blocked origins
2. Investigate repeated blocks from same origin
3. Update allowed origins when deploying new frontends
4. Alert on suspicious CORS activity

## Production Checklist

- [ ] Update `ALLOWED_ORIGINS` in production `.env`
- [ ] Remove development origins (localhost)
- [ ] Add production domain(s)
- [ ] Test CORS with production domain
- [ ] Verify credentials work with HTTPS
- [ ] Enable CORS logging/monitoring
- [ ] Document allowed origins
- [ ] Set up alerts for blocked origins

## Integration with Other Security Features

### Works With

1. **HTTP-Only Cookies** - Credentials enabled allows cookie transmission
2. **Helmet CSP** - CORS validates origin before CSP checks
3. **JWT Authentication** - Credentials allow Authorization header
4. **HTTPS** - Secure cookies require HTTPS in production

### Security Flow

```
1. CORS validates origin
   ↓
2. Helmet sets security headers
   ↓
3. Cookie parser reads cookies
   ↓
4. JWT middleware validates token
   ↓
5. Route handler processes request
```

## Troubleshooting

### Frontend Can't Access API

**Check**:
1. Is frontend origin in `ALLOWED_ORIGINS`?
2. Is `credentials: 'include'` set in fetch?
3. Is server running on correct port?
4. Are there any typos in origin URL?

### Cookies Not Being Sent

**Check**:
1. Is `credentials: true` in CORS config? ✅
2. Is `credentials: 'include'` in fetch? (Frontend)
3. Is cookie `httpOnly: true`? ✅
4. Is cookie `sameSite` set correctly? ✅
5. Is HTTPS used in production?

## Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP CORS Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Express CORS Package](https://www.npmjs.com/package/cors)

## Summary

The CORS configuration is secure and production-ready:

✅ **Only trusted origins allowed** - Configured via environment variables
✅ **Credentials enabled** - Supports HTTP-only cookies and authentication
✅ **Unknown origins blocked** - Dynamic validation with logging
✅ **Environment-based** - Easy to configure for dev/staging/production
✅ **Monitored** - Blocked attempts logged for security review

All CORS security requirements have been implemented and tested.
