# CSRF Protection Implementation

## Current CSRF Protection Status

### ✅ Already Protected Against CSRF

Your application **already has strong CSRF protection** through the following mechanisms:

#### 1. SameSite Cookies (Primary Defense)

**Location:** `src/Controller/authController.js`

```javascript
res.cookie('token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',  // ✅ CSRF Protection
  maxAge: 15 * 60 * 1000
});
```

**How it protects:**
- `sameSite: 'strict'` prevents cookies from being sent with cross-site requests
- Browsers automatically block CSRF attacks
- No additional tokens needed
- Works for 95%+ of modern browsers

**Attack Scenario Blocked:**
```
1. Attacker creates malicious site: evil.com
2. User visits evil.com while logged into your app
3. evil.com tries to make request to your API
4. Browser blocks cookie (sameSite: strict)
5. Request fails (no authentication)
6. ✅ CSRF attack prevented
```

#### 2. CORS Configuration (Secondary Defense)

**Location:** `index.js`

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

**How it protects:**
- Only allows requests from trusted origins
- Blocks cross-origin requests from unauthorized domains
- Prevents malicious sites from making API calls

**Attack Scenario Blocked:**
```
1. Attacker creates malicious site: evil.com
2. evil.com tries to call your API
3. Browser sends preflight OPTIONS request
4. Server checks origin: evil.com not in allowedOrigins
5. Server blocks request
6. ✅ CSRF attack prevented
```

#### 3. HTTP-Only Cookies (Tertiary Defense)

**How it protects:**
- JavaScript cannot read authentication tokens
- Prevents XSS attacks from stealing tokens
- Attacker cannot extract tokens to forge requests

## Why Traditional CSRF Tokens Are Not Needed

### Modern Approach (Your Current Setup)

**Advantages:**
- ✅ No token management needed
- ✅ No token synchronization issues
- ✅ Simpler implementation
- ✅ Better performance (no token generation/validation)
- ✅ Works automatically with browser security
- ✅ Supported by all modern browsers

### Traditional CSRF Tokens (csurf)

**Disadvantages:**
- ❌ Requires token generation on every request
- ❌ Requires token storage (session or cookie)
- ❌ Requires frontend to include token in every request
- ❌ More complex implementation
- ❌ Performance overhead
- ❌ Can break with SPA routing
- ❌ Requires careful token synchronization

**Note:** The `csurf` package is deprecated and no longer maintained. Modern applications use SameSite cookies instead.

## Optional: Additional CSRF Protection (Defense in Depth)

If you want additional CSRF protection beyond SameSite cookies, here are modern alternatives:

### Option 1: Custom CSRF Token (Recommended)

Implement a lightweight custom CSRF token for critical operations.

#### Backend Implementation

**Create CSRF middleware:**

```javascript
// src/Middlewares/csrfMiddleware.js
const crypto = require('crypto');

// Store CSRF tokens (in production, use Redis)
const csrfTokens = new Map();

// Generate CSRF token
exports.generateCsrfToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  const userId = req.user?.id || req.ip;
  
  csrfTokens.set(userId, token);
  
  // Set token in cookie (not HTTP-only, so frontend can read it)
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Frontend needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  
  next();
};

// Validate CSRF token
exports.validateCsrfToken = (req, res, next) => {
  // Skip validation for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'];
  const userId = req.user?.id || req.ip;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing'
    });
  }
  
  const storedToken = csrfTokens.get(userId);
  
  if (!storedToken || token !== storedToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};
```

**Add to routes:**

```javascript
// index.js
const { generateCsrfToken, validateCsrfToken } = require('./src/Middlewares/csrfMiddleware');

// Generate token for authenticated users
app.use('/api', authenticate, generateCsrfToken);

// Validate token on state-changing operations
app.use('/api/dishes', validateCsrfToken, dishRoutes);
app.use('/api/menus', validateCsrfToken, menuRoutes);
// etc.
```

#### Frontend Implementation

```typescript
// src/lib/api.ts

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}

// Add CSRF token to requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  
  // Add CSRF token for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  // ... rest of implementation
}
```

### Option 2: Double Submit Cookie Pattern

Use a double submit cookie pattern as an alternative.

**How it works:**
1. Server sets a random token in a cookie (not HTTP-only)
2. Frontend reads the cookie and includes it in a custom header
3. Server validates that cookie value matches header value
4. Attacker cannot read cookie due to same-origin policy

**Implementation:**

```javascript
// Backend
res.cookie('csrf-token', token, {
  httpOnly: false, // Frontend can read
  secure: true,
  sameSite: 'strict'
});

// Validate
const cookieToken = req.cookies['csrf-token'];
const headerToken = req.headers['x-csrf-token'];

if (cookieToken !== headerToken) {
  return res.status(403).json({ message: 'CSRF validation failed' });
}
```

### Option 3: Origin/Referer Header Validation

Validate the Origin or Referer header on state-changing requests.

```javascript
// src/Middlewares/csrfMiddleware.js
exports.validateOrigin = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    return res.status(403).json({
      success: false,
      message: 'Origin header missing'
    });
  }
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  const originUrl = new URL(origin);
  
  if (!allowedOrigins.includes(originUrl.origin)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid origin'
    });
  }
  
  next();
};
```

## Browser Compatibility

### SameSite Cookie Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 51+ | ✅ Full |
| Firefox | 60+ | ✅ Full |
| Safari | 12+ | ✅ Full |
| Edge | 16+ | ✅ Full |
| IE | 11 | ❌ No support |

**Coverage:** 95%+ of users

**Fallback for old browsers:**
- Implement custom CSRF tokens (Option 1)
- Or accept the risk (IE 11 usage is <1%)

## Testing CSRF Protection

### Test 1: Verify SameSite Cookie

```bash
# Login and check cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt -v

# Check cookies.txt - should show:
# SameSite=Strict
```

### Test 2: Simulate CSRF Attack

Create a malicious HTML page:

```html
<!-- evil.html -->
<!DOCTYPE html>
<html>
<body>
  <h1>Malicious Site</h1>
  <script>
    // Try to make authenticated request
    fetch('http://localhost:5000/api/dishes', {
      method: 'POST',
      credentials: 'include', // Try to include cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Dish' })
    })
    .then(res => console.log('Success:', res))
    .catch(err => console.log('Blocked:', err));
  </script>
</body>
</html>
```

**Expected Result:**
- CORS blocks the request (origin not allowed)
- Even if CORS allowed, SameSite blocks cookies
- Request fails (no authentication)
- ✅ CSRF attack prevented

### Test 3: Verify CORS Protection

```bash
# Try request from unauthorized origin
curl -X POST http://localhost:5000/api/dishes \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hacked Dish"}' \
  -v

# Expected: CORS error
# "Not allowed by CORS"
```

## Security Checklist

### ✅ Current Protection

- [x] SameSite cookies (`sameSite: 'strict'`)
- [x] CORS with origin validation
- [x] HTTP-only cookies (prevents XSS)
- [x] Secure cookies (HTTPS only in production)
- [x] Credentials required for authenticated requests

### Optional Enhancements

- [ ] Custom CSRF tokens for critical operations
- [ ] Double submit cookie pattern
- [ ] Origin/Referer header validation
- [ ] CSRF token for file uploads
- [ ] CSRF protection for WebSocket connections

## Recommendations

### For Most Applications (Your Current Setup)

**Use SameSite cookies + CORS:**
- ✅ Simple and effective
- ✅ No additional code needed
- ✅ Works for 95%+ of users
- ✅ Industry standard for modern apps

### For High-Security Applications

**Add custom CSRF tokens:**
- For financial transactions
- For admin operations
- For critical data modifications
- For compliance requirements (PCI-DSS, HIPAA)

### For Legacy Browser Support

**Implement fallback:**
- Detect browser capabilities
- Use CSRF tokens for old browsers
- Use SameSite for modern browsers

## Common CSRF Attack Scenarios

### Scenario 1: Malicious Form Submission

**Attack:**
```html
<!-- evil.com -->
<form action="https://your-app.com/api/dishes" method="POST">
  <input name="name" value="Hacked Dish">
  <input type="submit" value="Click me!">
</form>
```

**Protection:**
- ✅ SameSite cookies block authentication
- ✅ CORS blocks cross-origin POST
- ✅ Request fails

### Scenario 2: JavaScript Fetch Attack

**Attack:**
```javascript
// evil.com
fetch('https://your-app.com/api/dishes', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ name: 'Hacked' })
});
```

**Protection:**
- ✅ CORS preflight blocks request
- ✅ SameSite blocks cookies
- ✅ Request fails

### Scenario 3: Image Tag Attack

**Attack:**
```html
<!-- evil.com -->
<img src="https://your-app.com/api/dishes/1/delete">
```

**Protection:**
- ✅ SameSite blocks cookies
- ✅ GET requests should not modify data (REST principle)
- ✅ Request fails

## Summary

### ✅ Current CSRF Protection

Your application is **already protected against CSRF attacks** through:

1. **SameSite Cookies** (Primary)
   - Blocks cross-site cookie transmission
   - Supported by 95%+ of browsers
   - No additional code needed

2. **CORS Configuration** (Secondary)
   - Blocks unauthorized origins
   - Validates request source
   - Prevents cross-origin attacks

3. **HTTP-Only Cookies** (Tertiary)
   - Prevents XSS token theft
   - Blocks JavaScript access
   - Protects authentication

### 🔒 Security Level

**Current:** ⭐⭐⭐⭐⭐ (Excellent)
- Modern, industry-standard protection
- Effective against all common CSRF attacks
- Simple and maintainable

**With Custom CSRF Tokens:** ⭐⭐⭐⭐⭐+ (Excellent+)
- Defense in depth
- Additional layer for critical operations
- Compliance-ready

### 📝 Recommendation

**For your catering system:**
- ✅ Current protection is sufficient
- ✅ No additional CSRF tokens needed
- ✅ Focus on other security aspects

**Consider adding CSRF tokens if:**
- Handling financial transactions
- Compliance requirements (PCI-DSS, HIPAA)
- Supporting legacy browsers (IE 11)
- Extra paranoid about security

Your application has strong CSRF protection! 🛡️
