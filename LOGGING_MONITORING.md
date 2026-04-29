# Logging and Monitoring

## Overview

Comprehensive logging and monitoring system implemented using **Winston** for security auditing, debugging, and compliance.

## ✅ Implemented Features

### 1. Winston Logger Configuration

**Location:** `config/logger.js`

**Log Levels:**
- `error` (0) - Error events
- `warn` (1) - Warning events
- `info` (2) - Informational messages
- `http` (3) - HTTP requests
- `debug` (4) - Debug information

**Log Transports:**

1. **Console Transport**
   - Always enabled
   - Colorized output for development
   - Level: `debug` (development) or `info` (production)

2. **Error Log File** (`logs/error-YYYY-MM-DD.log`)
   - Only error-level logs
   - Daily rotation
   - Max size: 20MB per file
   - Retention: 30 days

3. **Combined Log File** (`logs/combined-YYYY-MM-DD.log`)
   - All log levels
   - Daily rotation
   - Max size: 20MB per file
   - Retention: 30 days

4. **Authentication Log File** (`logs/auth-YYYY-MM-DD.log`)
   - Login attempts (success/failure)
   - Token refresh events
   - Password changes
   - Logout events
   - Daily rotation
   - Max size: 20MB per file
   - Retention: 90 days (longer for security auditing)

5. **Audit Log File** (`logs/audit-YYYY-MM-DD.log`)
   - All authenticated user actions
   - API requests with user context
   - Critical operations
   - Daily rotation
   - Max size: 20MB per file
   - Retention: 90 days (longer for compliance)

### 2. Authentication Logging

**Location:** `src/Controller/authController.js`

**Logged Events:**

#### Successful Login
```json
{
  "level": "info",
  "message": "Successful login",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "duration": 245
}
```

#### Failed Login - User Not Found
```json
{
  "level": "warn",
  "message": "Failed login attempt - user not found",
  "email": "nonexistent@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "reason": "user_not_found",
  "duration": 123
}
```

#### Failed Login - Invalid Password
```json
{
  "level": "warn",
  "message": "Failed login attempt - invalid password",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "reason": "invalid_password",
  "duration": 234
}
```

#### Failed Login - Account Deactivated
```json
{
  "level": "warn",
  "message": "Failed login attempt - account deactivated",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "reason": "account_deactivated",
  "duration": 156
}
```

#### Token Refresh
```json
{
  "level": "info",
  "message": "Token refreshed successfully",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### Password Change
```json
{
  "level": "info",
  "message": "Password changed successfully",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### Logout
```json
{
  "level": "info",
  "message": "User logged out",
  "userId": 1,
  "email": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### 3. Failed Authentication Tracking

**Location:** `src/Middlewares/authMiddleware.js`

**Logged Events:**

#### No Token Provided
```json
{
  "level": "warn",
  "message": "Authentication failed - no token provided",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### Invalid Token
```json
{
  "level": "warn",
  "message": "Authentication failed - invalid token",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "error": "jwt malformed"
}
```

#### Token Expired
```json
{
  "level": "warn",
  "message": "Authentication failed - token expired",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### User Not Found
```json
{
  "level": "warn",
  "message": "Authentication failed - user not found",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": 999
}
```

#### Account Deactivated
```json
{
  "level": "warn",
  "message": "Authentication failed - account deactivated",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": 1,
  "email": "admin@example.com"
}
```

### 4. User Action Auditing

**Location:** `src/Middlewares/auditMiddleware.js`

**Logged Events:**

All authenticated user actions are automatically logged:

```json
{
  "level": "info",
  "message": "User action",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "userId": 1,
  "userEmail": "admin@example.com",
  "action": "POST /api/dishes",
  "method": "POST",
  "path": "/api/dishes",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "statusCode": 201,
  "success": true,
  "requestData": {
    "name": "Adobo",
    "category": "main_course"
  },
  "message": "Dish created successfully"
}
```

**Sensitive Data Filtering:**

The audit middleware automatically removes sensitive fields from logs:
- `password`
- `currentPassword`
- `newPassword`
- `confirmPassword`

### 5. Critical Action Logging

**Function:** `logCriticalAction()`

Used for high-value operations that require special attention:

```javascript
logCriticalAction('password_changed', userId, userEmail, {
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...'
});
```

**Logged as:**
```json
{
  "level": "warn",
  "message": "Critical action",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "action": "password_changed",
  "userId": 1,
  "userEmail": "admin@example.com",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### 6. Server Logging

**Location:** `index.js`

**Server Start:**
```json
{
  "level": "info",
  "message": "Server started successfully on port 5000",
  "port": 5000,
  "environment": "development"
}
```

**Unhandled Errors:**
```json
{
  "level": "error",
  "message": "Unhandled error",
  "error": "Database connection failed",
  "stack": "Error: Database connection failed\n    at ...",
  "path": "/api/dishes",
  "method": "POST",
  "ip": "127.0.0.1"
}
```

## Log File Structure

```
CATERING-SERVER/
├── logs/
│   ├── error-2024-01-15.log          # Error logs
│   ├── combined-2024-01-15.log       # All logs
│   ├── auth-2024-01-15.log           # Authentication logs
│   └── audit-2024-01-15.log          # User action logs
```

## Log Rotation

**Daily Rotation:**
- New log file created each day
- Format: `{filename}-YYYY-MM-DD.log`
- Automatic compression of old files

**Size-Based Rotation:**
- Max file size: 20MB
- New file created when limit reached

**Retention Policy:**
- Error logs: 30 days
- Combined logs: 30 days
- Auth logs: 90 days (security auditing)
- Audit logs: 90 days (compliance)

## Security Benefits

### 1. Incident Response
- Track all login attempts (success/failure)
- Identify brute force attacks
- Detect unauthorized access attempts
- Trace user actions during security incidents

### 2. Compliance
- Audit trail for all user actions
- 90-day retention for compliance requirements
- Detailed request/response logging
- IP address and user agent tracking

### 3. Debugging
- Detailed error logs with stack traces
- Request context for troubleshooting
- Performance metrics (duration tracking)
- Environment-specific logging levels

### 4. Monitoring
- Failed authentication patterns
- Unusual user behavior
- System errors and exceptions
- API usage patterns

## Log Analysis

### Find Failed Login Attempts
```bash
# Search auth logs for failed logins
grep "Failed login attempt" logs/auth-*.log

# Count failed attempts by email
grep "Failed login attempt" logs/auth-*.log | grep -o '"email":"[^"]*"' | sort | uniq -c
```

### Find Specific User Actions
```bash
# Search audit logs for specific user
grep '"userId":1' logs/audit-*.log

# Search for specific action
grep '"action":"POST /api/dishes"' logs/audit-*.log
```

### Find Authentication Failures
```bash
# Search for authentication failures
grep "Authentication failed" logs/auth-*.log

# Count by reason
grep "Authentication failed" logs/auth-*.log | grep -o '"message":"[^"]*"' | sort | uniq -c
```

### Find Errors
```bash
# View all errors
cat logs/error-*.log

# Search for specific error
grep "Database connection" logs/error-*.log
```

## Environment Variables

```env
# Optional: Set log level (default: info)
LOG_LEVEL=debug

# Optional: Set environment (affects log level)
NODE_ENV=production
```

## Best Practices

### 1. Regular Monitoring
- Review auth logs daily for suspicious activity
- Monitor error logs for system issues
- Check audit logs for unusual patterns
- Set up alerts for critical errors

### 2. Log Retention
- Keep auth logs for at least 90 days
- Archive old logs for long-term storage
- Comply with data retention policies
- Securely delete expired logs

### 3. Security
- Protect log files with proper permissions
- Never log sensitive data (passwords, tokens)
- Sanitize user input in logs
- Encrypt logs in transit and at rest

### 4. Performance
- Use appropriate log levels
- Avoid excessive logging in production
- Monitor log file sizes
- Implement log rotation

## Integration with Monitoring Tools

### Elasticsearch + Kibana
```javascript
// Add Elasticsearch transport
const { ElasticsearchTransport } = require('winston-elasticsearch');

logger.add(new ElasticsearchTransport({
  level: 'info',
  clientOpts: { node: 'http://localhost:9200' },
  index: 'catering-logs'
}));
```

### Datadog
```javascript
// Add Datadog transport
const { DatadogTransport } = require('winston-datadog');

logger.add(new DatadogTransport({
  apiKey: process.env.DATADOG_API_KEY,
  service: 'catering-api'
}));
```

### Sentry (Error Tracking)
```javascript
// Add Sentry for error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Testing

### Manual Testing

1. **Test Login Logging:**
   ```bash
   # Successful login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Admin@123"}'
   
   # Failed login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"wrong"}'
   
   # Check logs
   tail -f logs/auth-*.log
   ```

2. **Test Authentication Failure Logging:**
   ```bash
   # Request without token
   curl -X GET http://localhost:5000/api/dishes
   
   # Request with invalid token
   curl -X GET http://localhost:5000/api/dishes \
     -H "Authorization: Bearer invalid_token"
   
   # Check logs
   tail -f logs/auth-*.log
   ```

3. **Test Audit Logging:**
   ```bash
   # Login first to get token
   # Then make authenticated request
   curl -X POST http://localhost:5000/api/dishes \
     -H "Content-Type: application/json" \
     -H "Cookie: token=YOUR_TOKEN" \
     -d '{"name":"Test Dish","category":"appetizer"}'
   
   # Check logs
   tail -f logs/audit-*.log
   ```

## Troubleshooting

### Logs Not Being Created

**Check:**
1. Logs directory exists: `mkdir -p logs`
2. Write permissions: `chmod 755 logs`
3. Winston installed: `npm list winston`
4. Logger imported correctly in files

### Logs Too Large

**Solutions:**
1. Reduce retention period
2. Decrease max file size
3. Increase log level (less verbose)
4. Implement log compression

### Missing Log Entries

**Check:**
1. Log level configuration
2. Logger imported in all files
3. Middleware order in index.js
4. Error handling in try-catch blocks

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
