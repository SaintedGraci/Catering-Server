# Security Headers Documentation

## Overview

This document describes the security headers implemented using Helmet middleware to protect the Express.js application from common web vulnerabilities.

## Helmet Middleware

Helmet is a collection of middleware functions that set HTTP response headers to help protect against well-known web vulnerabilities.

### Installation

```bash
npm install helmet
```

### Implementation

Located in `index.js`:

```javascript
const helmet = require('helmet');

// Disable X-Powered-By header
app.disable('x-powered-by');

// Apply Helmet middleware globally
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

## Security Headers Set by Helmet

### 1. Content-Security-Policy (CSP)

**Purpose**: Prevents XSS attacks by controlling which resources can be loaded.

**Configuration**:
- `default-src 'self'` - Only load resources from same origin by default
- `script-src 'self' 'unsafe-inline'` - Allow scripts from same origin and inline scripts
- `style-src 'self' 'unsafe-inline'` - Allow styles from same origin and inline styles
- `img-src 'self' data: https:` - Allow images from same origin, data URIs, and HTTPS
- `connect-src 'self'` - Only allow AJAX/WebSocket to same origin
- `font-src 'self' data:` - Allow fonts from same origin and data URIs
- `object-src 'none'` - Block plugins like Flash
- `media-src 'self'` - Only allow media from same origin
- `frame-src 'none'` - Prevent framing (clickjacking protection)

**Protection Against**:
- Cross-Site Scripting (XSS)
- Data injection attacks
- Clickjacking

### 2. X-Content-Type-Options

**Header**: `X-Content-Type-Options: nosniff`

**Purpose**: Prevents browsers from MIME-sniffing a response away from the declared content-type.

**Protection Against**:
- MIME type confusion attacks
- Drive-by downloads

**Set by**: Helmet (default)

### 3. X-Frame-Options

**Header**: `X-Frame-Options: SAMEORIGIN`

**Purpose**: Prevents the page from being embedded in an iframe on other domains.

**Protection Against**:
- Clickjacking attacks
- UI redressing attacks

**Set by**: Helmet (default)

### 4. X-XSS-Protection

**Header**: `X-XSS-Protection: 0`

**Purpose**: Disables the legacy XSS filter (modern browsers use CSP instead).

**Note**: Modern browsers rely on Content-Security-Policy for XSS protection.

**Set by**: Helmet (default)

### 5. Strict-Transport-Security (HSTS)

**Header**: `Strict-Transport-Security: max-age=15552000; includeSubDomains`

**Purpose**: Forces browsers to use HTTPS for all future requests.

**Configuration**:
- `max-age=15552000` - 180 days
- `includeSubDomains` - Apply to all subdomains

**Protection Against**:
- Man-in-the-middle attacks
- Protocol downgrade attacks
- Cookie hijacking

**Set by**: Helmet (default, only over HTTPS)

### 6. X-Powered-By

**Header**: Removed (not sent)

**Purpose**: Hides the technology stack from potential attackers.

**Implementation**:
```javascript
app.disable('x-powered-by');
```

**Protection Against**:
- Information disclosure
- Targeted attacks based on known vulnerabilities

### 7. Referrer-Policy

**Header**: `Referrer-Policy: no-referrer`

**Purpose**: Controls how much referrer information is sent with requests.

**Protection Against**:
- Information leakage
- Privacy violations

**Set by**: Helmet (default)

### 8. Cross-Origin-Embedder-Policy

**Header**: Disabled for development

**Purpose**: Controls whether the document can be embedded by cross-origin documents.

**Configuration**: `crossOriginEmbedderPolicy: false`

**Note**: Disabled to allow development flexibility. Enable in production if needed.

### 9. Cross-Origin-Resource-Policy

**Header**: `Cross-Origin-Resource-Policy: cross-origin`

**Purpose**: Controls whether resources can be loaded by cross-origin requests.

**Configuration**: `{ policy: "cross-origin" }`

**Reason**: Allows the frontend (different port) to access backend resources.

## Security Headers Summary

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | See CSP section | Prevent XSS and data injection |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | SAMEORIGIN | Prevent clickjacking |
| X-XSS-Protection | 0 | Disable legacy XSS filter |
| Strict-Transport-Security | max-age=15552000 | Force HTTPS |
| X-Powered-By | (removed) | Hide technology stack |
| Referrer-Policy | no-referrer | Control referrer info |
| Cross-Origin-Resource-Policy | cross-origin | Allow cross-origin resources |

## Testing Security Headers

### Using curl

```bash
curl -I http://localhost:5000/api/dishes
```

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Make a request
4. Check Response Headers

### Expected Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
Referrer-Policy: no-referrer
```

### X-Powered-By Should NOT Appear

```
# This header should NOT be present
X-Powered-By: Express
```

## Production Recommendations

### Stricter CSP

For production, consider removing `'unsafe-inline'`:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],  // Remove 'unsafe-inline'
      styleSrc: ["'self'"],   // Remove 'unsafe-inline'
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://your-api-domain.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],  // Upgrade HTTP to HTTPS
    },
  },
}));
```

### Enable HSTS Preloading

```javascript
app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
```

### Add Expect-CT Header

```javascript
app.use(helmet.expectCt({
  maxAge: 86400,  // 24 hours
  enforce: true
}));
```

## CORS Configuration

CORS is configured separately from Helmet:

```javascript
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

**Important**: Update `origin` array for production domains.

## Middleware Order

Security middleware is applied in this order:

1. **Helmet** - Set security headers
2. **CORS** - Handle cross-origin requests
3. **express.json()** - Parse JSON bodies
4. **cookieParser()** - Parse cookies
5. **Routes** - Application routes
6. **Error Handler** - Catch errors

This order ensures security headers are set before any other processing.

## Common Issues and Solutions

### Issue: CSP Blocking Inline Scripts

**Solution**: Use nonces or hashes for inline scripts, or move scripts to external files.

### Issue: CORS Errors After Adding Helmet

**Solution**: Ensure CORS middleware is applied after Helmet and configured correctly.

### Issue: Images Not Loading

**Solution**: Check CSP `img-src` directive includes necessary sources.

### Issue: Fonts Not Loading

**Solution**: Add font sources to CSP `font-src` directive.

## Security Checklist

- [x] Helmet installed and configured
- [x] X-Powered-By header disabled
- [x] Content-Security-Policy configured
- [x] X-Content-Type-Options set to nosniff
- [x] X-Frame-Options set to SAMEORIGIN
- [x] Strict-Transport-Security enabled (HTTPS)
- [x] Referrer-Policy configured
- [x] CORS properly configured
- [x] Security headers applied globally
- [x] Middleware order optimized

## Monitoring

### Log Security Header Violations

Add CSP violation reporting:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // ... other directives
      reportUri: '/api/csp-violation-report'
    },
  },
}));

// CSP violation endpoint
app.post('/api/csp-violation-report', (req, res) => {
  console.log('CSP Violation:', req.body);
  res.status(204).end();
});
```

### Regular Audits

- Review security headers monthly
- Test with security scanning tools
- Update Helmet to latest version
- Monitor for new security best practices

## Resources

- [Helmet Documentation](https://helmetjs.github.io/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Conclusion

Helmet middleware provides comprehensive HTTP header security for the Express.js application. All security headers are applied globally, and the X-Powered-By header is disabled to prevent information disclosure. The configuration balances security with development flexibility while providing a foundation for stricter production settings.
