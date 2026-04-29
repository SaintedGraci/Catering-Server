# Security Implementation

## Authentication System

### ✅ Implemented Security Features

1. **Password Hashing with bcrypt**
   - All passwords are hashed using bcrypt with salt rounds of 10
   - Implemented in `src/Models/User.js` using Sequelize hooks
   - Passwords are hashed before creation and before updates
   - No plain text passwords are ever stored in the database

2. **JWT Authentication with Refresh Tokens**
   - **Access Token:** Short-lived (15 minutes) for API authentication
   - **Refresh Token:** Long-lived (7 days) for obtaining new access tokens
   - Token expiration: Access token 15 min, Refresh token 7 days
   - Separate secrets for access and refresh tokens stored in environment variables
   - Tokens include user ID, email, and token type
   - Automatic token refresh on expiration (frontend)

3. **HTTP-Only Cookies**
   - JWT tokens are stored in HTTP-only cookies (not accessible via JavaScript)
   - **Access Token Cookie:**
     - Name: `token`
     - Lifetime: 15 minutes
     - `httpOnly: true` - prevents XSS attacks
     - `secure: true` (in production) - HTTPS only
     - `sameSite: 'strict'` - prevents CSRF attacks
   - **Refresh Token Cookie:**
     - Name: `refreshToken`
     - Lifetime: 7 days
     - `httpOnly: true` - prevents XSS attacks
     - `secure: true` (in production) - HTTPS only
     - `sameSite: 'strict'` - prevents CSRF attacks
     - `path: '/api/auth/refresh'` - only sent to refresh endpoint
   - Implemented in `src/Controller/authController.js`

4. **Secure Login/Register Endpoints**
   - Login: `POST /api/auth/login`
   - Refresh: `POST /api/auth/refresh` (automatic token refresh)
   - Logout: `POST /api/auth/logout` (clears both HTTP-only cookies)
   - Password validation (minimum 8 characters with complexity requirements)
   - Email validation using Sequelize validators
   - Account status checking (isActive field)

5. **Authentication Middleware**
   - Located in `src/Middlewares/authMiddleware.js`
   - Reads JWT from HTTP-only cookie
   - Fallback to Authorization header for backward compatibility
   - Validates token and checks token type (must be access token)
   - Returns specific error code for expired tokens (triggers automatic refresh)
   - Checks user status
   - Attaches user object to request for protected routes

6. **Protected Routes**
   - All admin routes require authentication
   - User profile management endpoints
   - Password change endpoint with current password verification

7. **Automatic Token Refresh (Frontend)**
   - Detects expired access tokens
   - Automatically calls refresh endpoint
   - Retries failed requests after refresh
   - Redirects to login if refresh token expired
   - Seamless user experience

## Security Best Practices Implemented

### Backend (Express.js)
- ✅ bcrypt password hashing (salt rounds: 10)
- ✅ JWT with secure secret key
- ✅ HTTP-only cookies for token storage
- ✅ CORS configuration with credentials support
- ✅ Cookie-parser middleware
- ✅ Password comparison using bcrypt.compare()
- ✅ No password fields in API responses
- ✅ Token expiration handling
- ✅ User account status validation

### Frontend (React)
- ✅ No localStorage usage for tokens
- ✅ Credentials included in fetch requests
- ✅ Automatic token verification on app load
- ✅ Secure logout (server-side cookie clearing)
- ✅ No token exposure in client-side code

## Environment Variables

Required in `.env`:
```
JWT_SECRET=your-secure-secret-key-here
NODE_ENV=production
```

## Dependencies

- `bcrypt`: ^6.0.0 - Password hashing
- `jsonwebtoken`: ^9.0.2 - JWT generation and verification
- `cookie-parser`: ^1.4.7 - Cookie parsing middleware
- `joi`: ^17.13.3 - Schema validation and data sanitization
- `helmet`: ^7.0.0 - Security headers middleware
- `express-rate-limit`: ^8.4.1 - Rate limiting middleware
- `dotenv`: ^17.4.2 - Environment variable management
- `winston`: ^3.11.0 - Logging framework
- `winston-daily-rotate-file`: ^4.7.1 - Daily log rotation

## Environment Variables Security

### Overview

All sensitive configuration data is stored in environment variables using the `dotenv` package. This prevents hardcoding credentials in the codebase and allows for environment-specific configuration.

### Implementation

**1. dotenv Configuration**
```javascript
// index.js (first line)
require('dotenv').config();
```

**2. Environment Variables Used**
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (SENSITIVE)
- `DB_NAME` - Database name
- `DB_DIALECT` - Database type (mysql)
- `DB_PORT` - Database port
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret (SENSITIVE)
- `ALLOWED_ORIGINS` - CORS allowed origins

**3. Version Control Protection**
- `.env` file is in `.gitignore` (never committed)
- `.env.example` template provided with placeholder values
- No hardcoded credentials in code

**4. Files Using Environment Variables**
- `config/database.js` - Database credentials
- `index.js` - Server port, CORS origins
- `src/Controller/authController.js` - JWT secret
- `src/Middlewares/authMiddleware.js` - JWT secret

### Security Benefits

✅ **Separation of Code and Configuration**
- Credentials not hardcoded in source code
- Different secrets for each environment
- Easy to rotate secrets without code changes

✅ **Version Control Safety**
- `.env` never committed to Git
- No sensitive data in repository history
- Safe to share codebase publicly

✅ **Environment-Specific Configuration**
- Development uses local database
- Production uses production database
- Different JWT secrets per environment

### Testing

Run the environment variables security check:
```bash
node test-env-variables.js
```

**Expected Output:**
- ✅ All required variables set
- ✅ JWT_SECRET length adequate (32+ characters)
- ✅ .env is in .gitignore
- ✅ .env.example template exists

For detailed information, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## API Endpoints

### Public Routes
- `POST /api/auth/login` - User login (sets HTTP-only cookie)
- `POST /api/auth/logout` - User logout (clears HTTP-only cookie)

### Protected Routes (require authentication)
- `GET /api/auth/verify` - Verify current token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens used for authentication
- [x] Refresh token mechanism implemented
- [x] Short-lived access tokens (15 minutes)
- [x] Long-lived refresh tokens (7 days)
- [x] Separate secrets for access and refresh tokens
- [x] Tokens stored in HTTP-only cookies
- [x] No plain text passwords stored
- [x] Secure cookie configuration (httpOnly, secure, sameSite)
- [x] Token expiration implemented (access + refresh)
- [x] Automatic token refresh (frontend)
- [x] Token type validation (access vs refresh)
- [x] CORS properly configured with origin validation
- [x] CORS credentials enabled
- [x] CORS blocks unknown origins
- [x] CORS origins configured via environment variables
- [x] Password validation on registration
- [x] Current password verification on password change
- [x] User account status checking
- [x] No sensitive data in JWT payload
- [x] Proper error handling without information leakage
- [x] Input validation with Joi schemas
- [x] Email format validation
- [x] Strong password enforcement (min 8 chars, uppercase, lowercase, number, special char)
- [x] Clear validation error messages
- [x] Request data sanitization
- [x] Parameterized queries (via Sequelize ORM)
- [x] No SQL string concatenation
- [x] Protection against SQL injection
- [x] Helmet middleware for security headers
- [x] X-Powered-By header disabled
- [x] Content-Security-Policy configured
- [x] X-Frame-Options set (clickjacking protection)
- [x] X-Content-Type-Options set (MIME sniffing protection)
- [x] Strict-Transport-Security enabled (HTTPS)
- [x] Security headers applied globally
- [x] Rate limiting implemented (brute force protection)
- [x] Login rate limiting (5 attempts per 15 minutes)
- [x] General API rate limiting (100 requests per 15 minutes)
- [x] Booking rate limiting (10 bookings per hour)
- [x] Rate limit headers exposed
- [x] Environment variables used for sensitive data
- [x] dotenv package installed and configured
- [x] .env file excluded from version control
- [x] .env.example template provided
- [x] No hardcoded credentials in code
- [x] JWT_SECRET stored in environment variable
- [x] Database credentials stored in environment variables
- [x] CORS origins configured via environment variables
- [x] HTTPS ready with secure cookie configuration
- [x] Secure flag on cookies (enabled in production)
- [x] HTTP to HTTPS redirection (production setup available)
- [x] HSTS header configured via Helmet
- [x] SSL/TLS certificates setup documented
- [x] CSRF protection via SameSite cookies
- [x] SameSite strict on all authentication cookies
- [x] CORS configuration blocks unauthorized origins
- [x] HTTP-only cookies prevent token theft
- [x] No traditional CSRF tokens needed (modern approach)
- [x] Secure file upload implementation
- [x] File type restriction (images only)
- [x] File size limit (5MB per file, 10 files per request)
- [x] Secure random filename generation
- [x] Files stored outside public directory
- [x] Authentication required for uploads
- [x] Double extension prevention
- [x] Directory traversal prevention
- [x] Automatic file cleanup on errors

## Security Headers

### Helmet Middleware

All security headers are managed by Helmet middleware, applied globally in `index.js`.

**Key Headers Set**:
- **Content-Security-Policy**: Prevents XSS and data injection attacks
- **X-Content-Type-Options**: Prevents MIME sniffing (`nosniff`)
- **X-Frame-Options**: Prevents clickjacking (`SAMEORIGIN`)
- **Strict-Transport-Security**: Forces HTTPS connections
- **Referrer-Policy**: Controls referrer information leakage
- **X-Powered-By**: Disabled to hide technology stack

**Implementation**:
```javascript
const helmet = require('helmet');

// Disable X-Powered-By
app.disable('x-powered-by');

// Apply Helmet globally
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
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

**Protection Against**:
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing attacks
- Information disclosure
- Man-in-the-middle attacks (via HSTS)

For detailed information, see [SECURITY_HEADERS.md](./SECURITY_HEADERS.md).

## CORS Configuration

### Secure Cross-Origin Resource Sharing

CORS is configured to allow only trusted frontend origins while blocking all unauthorized requests.

**Implementation**:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400
};
```

**Security Features**:
- ✅ **Origin Validation**: Dynamic callback validates each origin
- ✅ **Credentials Enabled**: Allows HTTP-only cookies and auth headers
- ✅ **Blocks Unknown Origins**: Returns error for unauthorized origins
- ✅ **Environment-Based**: Origins configured via `ALLOWED_ORIGINS` env variable
- ✅ **Logging**: Blocked attempts logged for security monitoring
- ✅ **Preflight Caching**: 24-hour cache reduces attack surface

**Environment Configuration**:
```env
# .env file
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Protection Against**:
- Cross-Site Request Forgery (CSRF)
- Unauthorized API access
- Data theft from malicious sites

For detailed information, see [CORS_SECURITY.md](./CORS_SECURITY.md).

## SQL Injection Prevention

### Sequelize ORM Protection

All database queries use **Sequelize ORM**, which automatically implements parameterized queries and prevents SQL injection attacks.

### Safe Query Patterns

✅ **All controllers use safe Sequelize methods:**

1. **Find Operations** (automatically parameterized):
   ```javascript
   // Safe - uses parameterized query
   Dish.findByPk(id)
   Dish.findAll({ where: { category } })
   Dish.findOne({ where: { email } })
   ```

2. **Create Operations** (automatically parameterized):
   ```javascript
   // Safe - uses parameterized query
   Dish.create({ name, description, category })
   ```

3. **Update Operations** (automatically parameterized):
   ```javascript
   // Safe - uses parameterized query
   dish.update({ name, description })
   ```

4. **Delete Operations** (automatically parameterized):
   ```javascript
   // Safe - uses parameterized query
   dish.destroy()
   ```

5. **Complex Queries with Operators** (automatically parameterized):
   ```javascript
   // Safe - Sequelize operators are parameterized
   Booking.findAll({
     where: {
       createdAt: { [Op.between]: [startDate, endDate] },
       status: { [Op.in]: ['confirmed', 'completed'] }
     }
   })
   ```

6. **Aggregate Functions** (automatically parameterized):
   ```javascript
   // Safe - Sequelize functions are parameterized
   Booking.findAll({
     attributes: [
       'status',
       [sequelize.fn('COUNT', sequelize.col('id')), 'count']
     ],
     group: ['status']
   })
   ```

### What We DON'T Do (Unsafe Patterns)

❌ **No raw SQL with string concatenation:**
```javascript
// NEVER USED - This would be vulnerable
sequelize.query(`SELECT * FROM users WHERE email = '${email}'`)
```

❌ **No string interpolation in queries:**
```javascript
// NEVER USED - This would be vulnerable
sequelize.query(`SELECT * FROM dishes WHERE category = '${category}'`)
```

❌ **No unparameterized literals with user input:**
```javascript
// NEVER USED - This would be vulnerable
sequelize.literal(`name = '${userInput}'`)
```

### Sequelize.literal() Usage

The only use of `sequelize.literal()` in the codebase is in `analyticsController.js` for CASE statements:

```javascript
// SAFE - No user input, only hardcoded values
sequelize.literal('CASE WHEN guestCount < 50 THEN "0-50" WHEN guestCount < 100 THEN "50-100" ... END')
```

This is safe because:
- No user input is concatenated
- Only hardcoded values are used
- Used for grouping logic, not filtering

### Additional Protection Layers

1. **Joi Validation**: All user input is validated before reaching the database layer
2. **Type Checking**: Sequelize validates data types match the model schema
3. **ORM Abstraction**: No direct SQL writing reduces attack surface
4. **Prepared Statements**: Sequelize uses prepared statements under the hood

### Audit Results

✅ **No SQL injection vulnerabilities found**
- All queries use Sequelize ORM methods
- No string concatenation in SQL
- No raw queries with user input
- All user inputs are properly parameterized

## Input Validation

### Validation Implementation

All incoming request data is validated using **Joi** schemas before processing. This prevents:
- SQL injection attacks
- XSS attacks
- Invalid data types
- Missing required fields
- Data that exceeds size limits

### Validation Middleware

Located in `src/Middlewares/validationMiddleware.js`:
- Validates request body, query params, or URL params
- Returns all validation errors (not just the first one)
- Strips unknown fields for security
- Provides clear, user-friendly error messages

### Password Requirements

Strong password policy enforced:
- **Minimum length**: 8 characters
- **Must contain**:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (@$!%*?&)

### Email Validation

- Valid email format required
- Rejects malformed email addresses
- Prevents email injection attacks

### Validation Schemas

#### Authentication (`src/Validators/authValidators.js`)
- Login: email + password
- Register: name + email + strong password
- Update profile: name + email (optional)
- Change password: current password + new strong password + confirmation

#### Dishes (`src/Validators/dishValidators.js`)
- Name: 2-200 characters
- Description: max 1000 characters
- Category: must be valid enum value
- Image: optional string

#### Menus (`src/Validators/menuValidators.js`)
- Name: 2-200 characters
- Description: max 1000 characters
- Type: must be valid enum (wedding, corporate, private, birthday, custom)
- Image: optional string

#### Packages (`src/Validators/packageValidators.js`)
- Name: 2-200 characters
- Description: max 2000 characters
- Menu type: must be valid enum
- Prices: positive numbers, max > min
- Dish selection count: 0-100
- Dishes: array of positive integers

#### Bookings (`src/Validators/bookingValidators.js`)
- Customer name: 2-200 characters
- Customer email: valid email format
- Customer phone: 7-20 characters, valid phone format
- Event date: must be in the future
- Event time: HH:MM format
- Guest count: 1-10,000
- Package ID: positive integer
- Tier: must be valid enum (essential, signature, bespoke)
- Special requests: max 2000 characters

#### Testimonials (`src/Validators/testimonialValidators.js`)
- Customer name: 2-200 characters
- Content: 10-2000 characters
- Rating: 1-5 stars
- Event type: max 100 characters

### Validation Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  ]
}
```

### Protected Routes with Validation

All routes now include validation middleware:
- `POST /api/auth/login` - validates email and password
- `PUT /api/auth/profile` - validates name and email
- `POST /api/auth/change-password` - validates passwords with strength requirements
- `POST /api/dishes` - validates dish data
- `POST /api/menus` - validates menu data
- `POST /api/packages` - validates package data
- `POST /api/bookings` - validates booking data (public endpoint)
- `POST /api/testimonials` - validates testimonial data

## Rate Limiting (Brute Force Protection)

### Overview

Rate limiting has been implemented to protect the API from brute force attacks, spam, and abuse using `express-rate-limit`.

### Rate Limiting Tiers

#### 1. General API Rate Limiter
**Applied to:** All API endpoints  
**Limits:** 100 requests per 15 minutes per IP  
**Purpose:** Prevent general API abuse and DDoS attacks

#### 2. Login Rate Limiter (Strict)
**Applied to:** `POST /api/auth/login`  
**Limits:** 5 login attempts per 15 minutes per IP  
**Purpose:** Prevent brute force password attacks and credential stuffing

**Why strict?**
- Protects against automated password guessing
- Forces attackers to slow down significantly
- 5 attempts per 15 minutes = only 20 attempts per hour
- Would take years to crack even weak passwords

#### 3. Booking Rate Limiter (Moderate)
**Applied to:** `POST /api/bookings`  
**Limits:** 10 booking requests per hour per IP  
**Purpose:** Prevent spam bookings and database flooding

### Implementation

**Global rate limiter** in `index.js`:
```javascript
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests...' }
});

app.use(generalLimiter); // Applied to all routes
```

**Login rate limiter** in `src/Routes/authRoutes.js`:
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many login attempts...' }
});

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
```

**Booking rate limiter** in `src/Routes/bookingRoutes.js`:
```javascript
const createBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: 'Too many booking requests...' }
});

router.post('/', createBookingLimiter, validate(createBookingSchema), bookingController.createBooking);
```

### Rate Limit Headers

The API returns standard rate limit headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets (in seconds)

### Error Response

When rate limit is exceeded (HTTP 429):
```json
{
  "success": false,
  "message": "Too many login attempts from this IP, please try again after 15 minutes."
}
```

### Security Benefits

**Without rate limiting:**
- Attacker can try 1000s of passwords per minute
- Can crack weak passwords in hours
- Single IP can flood server with requests
- Bots can create 1000s of fake bookings

**With rate limiting:**
- Only 5 login attempts per 15 minutes
- Would take years to crack passwords
- Each IP limited to 100 requests per 15 minutes
- Maximum 10 bookings per hour per IP

### Testing

Run the rate limiting test suite:
```bash
node test-rate-limit.js
```

**Test Results:**
- ✅ Rate Limit Headers: Present and correct
- ✅ General API Rate Limit: 100 requests per 15 minutes
- ✅ Booking Rate Limit: 10 bookings per hour
- ✅ Login Rate Limit: 5 attempts per 15 minutes (6th blocked)

For detailed information, see [RATE_LIMITING.md](./RATE_LIMITING.md).

## HTTPS and Secure Cookies

### Overview

The application is configured to run over HTTPS in production with secure cookie settings.

### Secure Cookie Configuration

**Already Implemented** in `src/Controller/authController.js`:

```javascript
res.cookie('token', token, {
  httpOnly: true,                                    // ✅ Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production',    // ✅ HTTPS only in production
  sameSite: 'strict',                                // ✅ Prevents CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000                   // ✅ 7 days expiration
});
```

### How It Works

**Development (HTTP):**
- `secure: false` - Cookies work over HTTP for local testing
- Allows development without HTTPS setup

**Production (HTTPS):**
- `secure: true` - Cookies only sent over HTTPS
- Browsers reject cookies sent over HTTP
- Protects against man-in-the-middle attacks

### HTTPS Setup Options

#### Development
- Self-signed certificates with mkcert (recommended)
- OpenSSL self-signed certificates
- Run: `npm run start:https:dev`

#### Production
- Let's Encrypt (free SSL certificates)
- Cloud platform managed HTTPS (Railway, Heroku, Vercel)
- Nginx reverse proxy with SSL
- Application Load Balancer with ACM (AWS)

### HTTP to HTTPS Redirection

**Automatic in Production:**
- HTTP requests automatically redirect to HTTPS
- Configured in production server setup
- Ensures all traffic is encrypted

### Security Benefits

✅ **Encrypted Communication**
- All data transmitted over encrypted connection
- Prevents eavesdropping and tampering

✅ **Secure Cookies**
- JWT tokens only sent over HTTPS
- Cannot be intercepted over insecure connections

✅ **HSTS (HTTP Strict Transport Security)**
- Already configured via Helmet
- Forces browsers to use HTTPS
- Prevents downgrade attacks

✅ **Browser Security Features**
- Service workers require HTTPS
- Geolocation API requires HTTPS
- Modern browser features enabled

For detailed setup instructions, see [HTTPS_SETUP.md](./HTTPS_SETUP.md).

## CSRF Protection

### Overview

The application is protected against Cross-Site Request Forgery (CSRF) attacks through multiple layers of defense.

### ✅ Implemented Protection

**1. SameSite Cookies (Primary Defense)**

Configured in `src/Controller/authController.js`:

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
- Supported by 95%+ of modern browsers
- No additional tokens needed

**2. CORS Configuration (Secondary Defense)**

Only allows requests from trusted origins, blocking cross-origin attacks from unauthorized domains.

**3. HTTP-Only Cookies (Tertiary Defense)**

JavaScript cannot read authentication tokens, preventing XSS attacks from stealing tokens to forge requests.

### Why Traditional CSRF Tokens Are Not Needed

**Modern Approach (Current Setup):**
- ✅ No token management needed
- ✅ Simpler implementation
- ✅ Better performance
- ✅ Works automatically with browser security

**Note:** The `csurf` package is deprecated. Modern applications use SameSite cookies instead.

For detailed information, see [CSRF_PROTECTION.md](./CSRF_PROTECTION.md).

## Secure File Uploads

### Overview

File uploads are secured with multiple layers of protection against common file upload vulnerabilities.

### ✅ Implemented Security Features

**1. File Type Restriction**

Only image files are allowed:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Validation:**
- MIME type checking
- File extension checking
- Double extension prevention

**2. File Size Limit**

- Maximum: 5MB per file
- Maximum: 10 files per request
- Prevents DoS attacks

**3. Secure Filename Generation**

- Cryptographically random filenames using `crypto.randomBytes()`
- Format: `randomhex-timestamp.ext`
- Prevents filename collisions
- Prevents directory traversal
- Hides original filename

**4. Storage Outside Public Directory**

- Files stored in `uploads/` directory
- Served through controlled Express static middleware
- Not directly accessible
- Can add authentication checks

**5. Authentication Required**

- All upload endpoints require authentication
- Only logged-in users can upload
- Tracks who uploaded what

**6. Double Extension Prevention**

- Blocks files like `image.jpg.php`
- Prevents execution of disguised scripts
- Validates filename structure

**7. Error Handling and Cleanup**

- Proper error messages
- Automatic file cleanup on errors
- Prevents orphaned files

**8. Directory Traversal Prevention**

- Filename validation on delete
- Blocks `../` and `..\\` patterns
- Prevents unauthorized file access

### Vulnerabilities Prevented

✅ **Unrestricted File Upload**
- Strict file type validation
- Only images allowed

✅ **File Size DoS**
- 5MB limit per file
- 10 files maximum per request

✅ **Directory Traversal**
- Secure filename generation
- Path validation

✅ **Double Extension Attack**
- Extension validation
- Prevents `.jpg.php` files

✅ **Filename Collision**
- Random filenames
- Timestamp inclusion

✅ **Unauthorized Access**
- Authentication required
- User tracking

✅ **Path Manipulation**
- Filename sanitization
- Directory restriction

For detailed information, see [FILE_UPLOAD_SECURITY.md](./FILE_UPLOAD_SECURITY.md).

## Logging and Monitoring

### Overview

Comprehensive logging and monitoring system using **Winston** for security auditing, debugging, and compliance.

### Implementation

**Winston Logger Configuration** (`config/logger.js`):
- Multiple log levels (error, warn, info, http, debug)
- Console transport with colorized output
- File transports with daily rotation
- Separate log files for different purposes

**Log Files:**
1. **Error Log** (`logs/error-YYYY-MM-DD.log`)
   - Only error-level logs
   - 30-day retention

2. **Combined Log** (`logs/combined-YYYY-MM-DD.log`)
   - All log levels
   - 30-day retention

3. **Authentication Log** (`logs/auth-YYYY-MM-DD.log`)
   - Login attempts (success/failure)
   - Token refresh events
   - Password changes
   - Logout events
   - 90-day retention (security auditing)

4. **Audit Log** (`logs/audit-YYYY-MM-DD.log`)
   - All authenticated user actions
   - API requests with user context
   - Critical operations
   - 90-day retention (compliance)

**Log Rotation:**
- Daily rotation (new file each day)
- Size-based rotation (max 20MB per file)
- Automatic compression of old files
- Configurable retention periods

### Authentication Logging

**Logged Events:**
- ✅ Successful logins (userId, email, IP, user agent)
- ✅ Failed logins (reason, email, IP, user agent, duration)
- ✅ Token refresh (userId, email, IP, user agent)
- ✅ Password changes (userId, email, IP, user agent)
- ✅ Logout events (userId, email, IP, user agent)

**Failure Reasons Tracked:**
- User not found
- Invalid password
- Account deactivated
- Missing credentials

### Failed Authentication Tracking

**Logged Events:**
- ✅ No token provided (path, method, IP, user agent)
- ✅ Invalid token (path, method, IP, user agent, error)
- ✅ Expired token (path, method, IP, user agent)
- ✅ User not found (path, method, IP, user agent, userId)
- ✅ Account deactivated (path, method, IP, user agent, userId, email)

### User Action Auditing

**Audit Middleware** (`src/Middlewares/auditMiddleware.js`):
- Logs all authenticated user actions
- Captures request method, path, and data
- Records user context (ID, email)
- Tracks IP address and user agent
- Logs response status and message
- Automatically filters sensitive data (passwords)

**Logged Fields:**
- timestamp
- userId
- userEmail
- action (method + path)
- method
- path
- ip
- userAgent
- statusCode
- success
- requestData (sanitized)
- message

### Security Benefits

✅ **Incident Response**
- Track all login attempts
- Identify brute force attacks
- Detect unauthorized access attempts
- Trace user actions during incidents

✅ **Compliance**
- Audit trail for all user actions
- 90-day retention for compliance
- Detailed request/response logging
- IP address and user agent tracking

✅ **Debugging**
- Detailed error logs with stack traces
- Request context for troubleshooting
- Performance metrics (duration tracking)
- Environment-specific logging levels

✅ **Monitoring**
- Failed authentication patterns
- Unusual user behavior
- System errors and exceptions
- API usage patterns

### Testing

Run the logging test suite:
```bash
node test-logging.js
```

**Test Results:**
- ✅ Log File Creation: All log files created
- ✅ Successful Login Logging: Logged with all required fields
- ✅ Failed Login Logging: Logged with failure reason
- ✅ Failed Authentication Logging: Logged with context
- ✅ User Action Auditing: Logged with user context
- ✅ Password Change Logging: Logged with IP and user agent

For detailed information, see [LOGGING_MONITORING.md](./LOGGING_MONITORING.md).

## Summary

✅ **Comprehensive logging system implemented**
- Winston logger with multiple transports
- Daily log rotation with size limits
- Separate logs for auth, audit, errors, and combined
- 90-day retention for security and compliance logs

✅ **Authentication logging**
- All login attempts (success/failure)
- Token refresh events
- Password changes
- Logout events
- Detailed failure reasons

✅ **Failed authentication tracking**
- No token provided
- Invalid tokens
- Expired tokens
- User not found
- Account deactivated

✅ **User action auditing**
- All authenticated API requests
- Request method and path
- User context (ID, email)
- IP address and user agent
- Request data (sanitized)
- Response status and message

✅ **Security benefits**
- Incident response capability
- Compliance audit trail
- Debugging and troubleshooting
- Attack pattern detection
- User behavior monitoring

The logging system provides complete visibility into authentication events, user actions, and system errors for security auditing, compliance, and debugging purposes.

## Notes

- In development, `secure` flag is set to `false` to allow HTTP
- In production, ensure `NODE_ENV=production` and use HTTPS
- JWT_SECRET should be a strong, random string in production
- Cookie-based authentication is more secure than localStorage
- XSS attacks cannot access HTTP-only cookies
- CSRF protection via sameSite='strict' cookie attribute
- All authentication events and user actions are logged for auditing

## Logging and Monitoring

### Overview

Comprehensive logging and monitoring system implemented using **Winston** for security auditing, debugging, and compliance.

### ✅ Implemented Features

**1. Authentication Logging**
- Successful login attempts with user details
- Failed login attempts with failure reasons
- Token refresh events
- Password change events
- Logout events
- Account deactivation attempts

**2. Failed Authentication Tracking**
- Invalid credentials (wrong password)
- User not found attempts
- Account deactivated attempts
- Invalid tokens
- Expired tokens
- Missing tokens
- Invalid token types

**3. User Action Auditing**
- All authenticated API requests logged
- HTTP method and path
- Request data (sanitized - passwords removed)
- Response status codes
- User ID and email
- IP address tracking
- User agent information
- Timestamp for all events

**4. Error Logging**
- Server errors with stack traces
- Authentication errors
- Database errors
- Unhandled exceptions

### Log Files

**Location:** `logs/` directory

**Files:**
- `auth-YYYY-MM-DD.log` - Authentication events (90-day retention)
- `audit-YYYY-MM-DD.log` - User action auditing (90-day retention)
- `error-YYYY-MM-DD.log` - Error logs only (30-day retention)
- `combined-YYYY-MM-DD.log` - All logs combined (30-day retention)

**Log Rotation:**
- Daily rotation with date pattern
- Maximum file size: 20MB
- Automatic rotation when size exceeded
- Extended retention for security logs (90 days)

### Log Format

**JSON Format (Files):**
```json
{
  "timestamp": "2026-04-29 14:30:45",
  "level": "info",
  "message": "Successful login",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

### Logged Events

**Successful Login:**
```json
{
  "message": "Successful login",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "192.168.1.100"
}
```

**Failed Login - Invalid Password:**
```json
{
  "message": "Failed login attempt - invalid password",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "192.168.1.100",
  "reason": "Invalid password"
}
```

**Failed Login - User Not Found:**
```json
{
  "message": "Failed login attempt - user not found",
  "email": "hacker@example.com",
  "ip": "192.168.1.200",
  "reason": "User does not exist"
}
```

**Authentication Failure - No Token:**
```json
{
  "message": "Authentication failed - no token provided",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "192.168.1.100"
}
```

**User Action Audit:**
```json
{
  "message": "User action",
  "userId": 1,
  "userEmail": "admin@example.com",
  "action": "POST /api/dishes",
  "method": "POST",
  "path": "/api/dishes",
  "statusCode": 201,
  "success": true,
  "requestData": {"name": "Adobo", "category": "main"}
}
```

### Sensitive Data Sanitization

Automatically removes from logs:
- `password`
- `currentPassword`
- `newPassword`
- `confirmPassword`

### Security Benefits

**Attack Detection:**
- Identify brute force attempts (multiple failed logins)
- Detect credential stuffing attacks
- Track suspicious IP addresses
- Monitor unusual access patterns

**Incident Response:**
- Complete audit trail of user actions
- Timestamp of all security events
- IP address tracking for forensics
- User agent information

**Compliance:**
- 90-day retention for authentication logs
- 90-day retention for audit logs
- Complete user action history
- Tamper-evident log files

**Forensics:**
- Reconstruct user sessions
- Identify compromised accounts
- Track unauthorized access attempts
- Analyze attack patterns

### Implementation

**Logger Configuration:** `config/logger.js`
- Winston with multiple transports
- Daily log rotation
- Environment-based log levels
- Separate loggers for auth and audit

**Authentication Logging:** `src/Controller/authController.js`
- Logs all login attempts (success/failure)
- Logs token refresh events
- Logs password changes
- Logs logout events

**Failed Authentication Tracking:** `src/Middlewares/authMiddleware.js`
- Logs all authentication failures
- Tracks invalid tokens
- Monitors expired tokens
- Records missing tokens

**User Action Auditing:** `src/Middlewares/auditMiddleware.js`
- Logs all authenticated requests
- Sanitizes sensitive data
- Tracks response status
- Records IP and user agent

### Monitoring

**View recent authentication events:**
```bash
tail -f logs/auth-$(date +%Y-%m-%d).log
```

**Search for failed login attempts:**
```bash
grep "Failed login" logs/auth-*.log
```

**View audit trail for specific user:**
```bash
grep '"userId":1' logs/audit-*.log
```

For detailed information, see [LOGGING_MONITORING.md](./LOGGING_MONITORING.md).
