const { auditLogger } = require('../../config/logger');

/**
 * Audit Middleware
 * Logs all user actions for security auditing and compliance
 */
const auditLog = (req, res, next) => {
  // Capture the original res.json to log after response
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Only log if user is authenticated
    if (req.user) {
      const logData = {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        userEmail: req.user.email,
        action: `${req.method} ${req.path}`,
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        statusCode: res.statusCode,
        success: data.success !== false,
      };

      // Add request body for certain actions (excluding sensitive data)
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const sanitizedBody = { ...req.body };
        // Remove sensitive fields
        delete sanitizedBody.password;
        delete sanitizedBody.currentPassword;
        delete sanitizedBody.newPassword;
        delete sanitizedBody.confirmPassword;
        
        if (Object.keys(sanitizedBody).length > 0) {
          logData.requestData = sanitizedBody;
        }
      }

      // Add response message if available
      if (data.message) {
        logData.message = data.message;
      }

      // Log the action
      auditLogger.info('User action', logData);
    }

    // Call original json method
    return originalJson(data);
  };

  next();
};

/**
 * Log specific high-value actions with additional context
 */
const logCriticalAction = (action, userId, userEmail, details = {}) => {
  auditLogger.warn('Critical action', {
    timestamp: new Date().toISOString(),
    action,
    userId,
    userEmail,
    ...details,
  });
};

module.exports = {
  auditLog,
  logCriticalAction,
};
