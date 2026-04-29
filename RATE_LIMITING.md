# Rate Limiting Protection

## Overview

Rate limiting has been implemented to protect the API from brute force attacks, spam, and abuse. The system uses `express-rate-limit` to restrict the number of requests from a single IP address.

## Rate Limiting Tiers

### 1. General API Rate Limiter (All Routes)

**Applied to:** All API endpoints

**Limits:**
- **Window:** 15 minutes
- **Max Requests:** 100 requests per IP
- **Purpose:** Prevent general API abuse

**Response when exceeded:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

**Headers returned:**
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

### 2. Authentication Rate Limiter (Login Route)

**Applied to:** `/api/auth/login`

**Limits:**
- **Window:** 15 minutes
- **Max Requests:** 5 login attempts per IP
- **Purpose:** Prevent brute force password attacks

**Response when exceeded:**
```json
{
  "success": false,
  "message": "Too many login attempts from this IP, please try again after 15 minutes."
}
```

**Why strict?**
- Protects against credential stuffing attacks
- Prevents automated password guessing
- Forces attackers to slow down significantly

### 3. Booking Rate Limiter (Create Booking)

**Applied to:** `POST /api/bookings`

**Limits:**
- **Window:** 1 hour
- **Max Requests:** 10 booking requests per IP
- **Purpose:** Prevent spam bookings and abuse

**Response when exceeded:**
```json
{
  "success": false,
  "message": "Too many booking requests from this IP, please try again later."
}
```

**Why moderate?**
- Prevents spam inquiries
- Protects database from flooding
- Allows legitimate users to make multiple inquiries

## Implementation Details

### Code Structure

**In `index.js`:**
```javascript
const rateLimit = require('express-rate-limit');

// General limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests...' }
});

app.use(generalLimiter); // Applied globally
```

**In `authRoutes.js`:**
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts...' }
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
```

**In `bookingRoutes.js`:**
```javascript
const createBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many booking requests...' }
});

router.post('/', createBookingLimiter, validate(createBookingSchema), bookingController.createBooking);
```

## How It Works

### Request Flow

1. **Client makes request** → Server receives request
2. **Rate limiter checks IP** → Looks up request count for this IP
3. **Within limit?**
   - ✅ **Yes** → Process request, increment counter
   - ❌ **No** → Return 429 status with error message
4. **Counter resets** → After the time window expires

### Example Scenario: Login Attempts

**Timeline:**
```
10:00 AM - Login attempt 1 ✅ (1/5)
10:01 AM - Login attempt 2 ✅ (2/5)
10:02 AM - Login attempt 3 ✅ (3/5)
10:03 AM - Login attempt 4 ✅ (4/5)
10:04 AM - Login attempt 5 ✅ (5/5)
10:05 AM - Login attempt 6 ❌ BLOCKED (Too many attempts)
10:06 AM - Login attempt 7 ❌ BLOCKED
...
10:15 AM - Counter resets
10:16 AM - Login attempt 8 ✅ (1/5) - Can try again
```

## Testing Rate Limiting

### Test 1: General API Rate Limit

```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:5000/api/dishes
  echo "Request $i"
done

# Expected: First 100 succeed, 101st returns 429
```

### Test 2: Login Rate Limit

```bash
# Try to login 6 times
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "Login attempt $i"
done

# Expected: First 5 attempts processed, 6th returns 429
```

### Test 3: Booking Rate Limit

```bash
# Try to create 11 bookings
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","phone":"1234567890","eventDate":"2024-12-31","guestCount":50,"message":"Test"}'
  echo "Booking attempt $i"
done

# Expected: First 10 succeed, 11th returns 429
```

### Test 4: Check Rate Limit Headers

```bash
curl -i http://localhost:5000/api/dishes

# Look for headers:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: 1234567890
```

## Frontend Handling

### Detecting Rate Limit Errors

In your React frontend (`api.ts`):

```typescript
// Check for 429 status
if (response.status === 429) {
  const data = await response.json();
  toast.error(data.message || 'Too many requests. Please try again later.');
  return;
}
```

### User Experience

**Login page:**
- Show clear error message after 5 failed attempts
- Display countdown timer: "Try again in 15 minutes"
- Suggest password reset option

**Booking form:**
- Show warning after 8 bookings: "You have 2 booking requests remaining this hour"
- Display friendly message when limit reached
- Suggest calling instead for urgent inquiries

## Security Benefits

### 1. Brute Force Protection

**Without rate limiting:**
- Attacker can try 1000s of passwords per minute
- Can crack weak passwords in hours

**With rate limiting:**
- Only 5 attempts per 15 minutes = 20 attempts per hour
- Would take years to crack even weak passwords

### 2. DDoS Mitigation

**Without rate limiting:**
- Single IP can flood server with requests
- Server resources exhausted

**With rate limiting:**
- Each IP limited to 100 requests per 15 minutes
- Server remains responsive for legitimate users

### 3. Spam Prevention

**Without rate limiting:**
- Bots can create 1000s of fake bookings
- Database fills with spam

**With rate limiting:**
- Maximum 10 bookings per hour per IP
- Significantly reduces spam impact

## Configuration Options

### Adjusting Limits

**More strict (production with high traffic):**
```javascript
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Only 3 attempts per 30 minutes
});
```

**More lenient (development/testing):**
```javascript
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 attempts per 5 minutes
});
```

### Skip Certain IPs (Trusted Sources)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    // Skip rate limiting for trusted IPs
    const trustedIPs = ['192.168.1.1', '10.0.0.1'];
    return trustedIPs.includes(req.ip);
  }
});
```

### Custom Key Generator (Use User ID Instead of IP)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  }
});
```

## Monitoring and Logging

### Log Rate Limit Violations

Add custom handler in `index.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});
```

### Track Blocked Requests

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  onLimitReached: (req, res, options) => {
    console.error(`SECURITY ALERT: Rate limit reached for IP ${req.ip}`);
    // Could send alert email, log to security system, etc.
  }
});
```

## Production Considerations

### 1. Behind a Proxy/Load Balancer

If your app is behind a proxy (Nginx, Cloudflare, etc.), enable trust proxy:

```javascript
// In index.js
app.set('trust proxy', 1); // Trust first proxy

// Or for multiple proxies
app.set('trust proxy', 'loopback, linklocal, uniquelocal');
```

This ensures rate limiting uses the real client IP, not the proxy IP.

### 2. Redis Store (For Multiple Servers)

For production with multiple server instances, use Redis:

```bash
npm install rate-limit-redis redis
```

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:' // Rate limit prefix
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### 3. Environment-Based Configuration

```javascript
// Different limits for dev vs production
const maxRequests = process.env.NODE_ENV === 'production' ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests
});
```

## Common Issues and Solutions

### Issue 1: Rate limit applies to all users behind same IP

**Problem:** Office/school with shared IP gets rate limited for all users

**Solution:** Use authenticated user ID as key:
```javascript
keyGenerator: (req) => req.user?.id || req.ip
```

### Issue 2: Rate limit too strict for legitimate users

**Problem:** Users complain they can't use the app normally

**Solution:** Increase limits or window:
```javascript
windowMs: 15 * 60 * 1000, // Keep window
max: 200, // Increase limit
```

### Issue 3: Development testing is slow

**Problem:** Rate limits trigger during testing

**Solution:** Disable in development:
```javascript
if (process.env.NODE_ENV !== 'development') {
  app.use(limiter);
}
```

## Summary

✅ **Implemented:**
- General API rate limiter (100 requests / 15 min)
- Strict login rate limiter (5 attempts / 15 min)
- Moderate booking rate limiter (10 bookings / 1 hour)
- Standard rate limit headers
- Clear error messages

✅ **Protected Against:**
- Brute force password attacks
- Credential stuffing
- DDoS attacks
- Spam bookings
- API abuse

✅ **Best Practices:**
- Different limits for different endpoints
- Stricter limits on authentication
- Clear user feedback
- Monitoring and logging ready
- Production-ready configuration

Your API is now protected from brute force attacks! 🛡️
