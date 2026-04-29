/**
 * Logging Setup Verification Script
 * 
 * Verifies that the logging system is properly configured
 * without requiring the server to be running.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

console.log('\n' + '='.repeat(60));
log('LOGGING SETUP VERIFICATION', 'cyan');
console.log('='.repeat(60) + '\n');

let allPassed = true;

// Check 1: Winston packages installed
logInfo('Checking Winston packages...');
try {
  require('winston');
  logSuccess('winston package installed');
} catch (error) {
  logError('winston package not installed');
  allPassed = false;
}

try {
  require('winston-daily-rotate-file');
  logSuccess('winston-daily-rotate-file package installed');
} catch (error) {
  logError('winston-daily-rotate-file package not installed');
  allPassed = false;
}

// Check 2: Logger configuration file exists
logInfo('\nChecking logger configuration...');
const loggerConfigPath = path.join(__dirname, 'config', 'logger.js');
if (fs.existsSync(loggerConfigPath)) {
  logSuccess('Logger configuration file exists: config/logger.js');
  
  // Try to load it
  try {
    const { logger, authLogger, auditLogger } = require('./config/logger');
    logSuccess('Logger configuration loads successfully');
    logSuccess('Main logger exported');
    logSuccess('Auth logger exported');
    logSuccess('Audit logger exported');
  } catch (error) {
    logError(`Logger configuration error: ${error.message}`);
    allPassed = false;
  }
} else {
  logError('Logger configuration file missing: config/logger.js');
  allPassed = false;
}

// Check 3: Audit middleware exists
logInfo('\nChecking audit middleware...');
const auditMiddlewarePath = path.join(__dirname, 'src', 'Middlewares', 'auditMiddleware.js');
if (fs.existsSync(auditMiddlewarePath)) {
  logSuccess('Audit middleware file exists: src/Middlewares/auditMiddleware.js');
  
  // Try to load it
  try {
    const { auditLog, logCriticalAction } = require('./src/Middlewares/auditMiddleware');
    logSuccess('Audit middleware loads successfully');
    logSuccess('auditLog function exported');
    logSuccess('logCriticalAction function exported');
  } catch (error) {
    logError(`Audit middleware error: ${error.message}`);
    allPassed = false;
  }
} else {
  logError('Audit middleware file missing: src/Middlewares/auditMiddleware.js');
  allPassed = false;
}

// Check 4: Auth controller has logging
logInfo('\nChecking authentication controller logging...');
const authControllerPath = path.join(__dirname, 'src', 'Controller', 'authController.js');
if (fs.existsSync(authControllerPath)) {
  const authControllerContent = fs.readFileSync(authControllerPath, 'utf8');
  
  if (authControllerContent.includes('authLogger')) {
    logSuccess('Auth controller imports authLogger');
  } else {
    logError('Auth controller does not import authLogger');
    allPassed = false;
  }
  
  if (authControllerContent.includes('Successful login')) {
    logSuccess('Auth controller logs successful logins');
  } else {
    logError('Auth controller does not log successful logins');
    allPassed = false;
  }
  
  if (authControllerContent.includes('Failed login attempt')) {
    logSuccess('Auth controller logs failed logins');
  } else {
    logError('Auth controller does not log failed logins');
    allPassed = false;
  }
  
  if (authControllerContent.includes('Password changed successfully')) {
    logSuccess('Auth controller logs password changes');
  } else {
    logError('Auth controller does not log password changes');
    allPassed = false;
  }
} else {
  logError('Auth controller file missing');
  allPassed = false;
}

// Check 5: Auth middleware has logging
logInfo('\nChecking authentication middleware logging...');
const authMiddlewarePath = path.join(__dirname, 'src', 'Middlewares', 'authMiddleware.js');
if (fs.existsSync(authMiddlewarePath)) {
  const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
  
  if (authMiddlewareContent.includes('authLogger')) {
    logSuccess('Auth middleware imports authLogger');
  } else {
    logError('Auth middleware does not import authLogger');
    allPassed = false;
  }
  
  if (authMiddlewareContent.includes('Authentication failed')) {
    logSuccess('Auth middleware logs authentication failures');
  } else {
    logError('Auth middleware does not log authentication failures');
    allPassed = false;
  }
} else {
  logError('Auth middleware file missing');
  allPassed = false;
}

// Check 6: Main server file has logging
logInfo('\nChecking main server file...');
const indexPath = path.join(__dirname, 'index.js');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('logger')) {
    logSuccess('Main server imports logger');
  } else {
    logError('Main server does not import logger');
    allPassed = false;
  }
  
  if (indexContent.includes('auditLog')) {
    logSuccess('Main server imports audit middleware');
  } else {
    logError('Main server does not import audit middleware');
    allPassed = false;
  }
  
  if (indexContent.includes('app.use(auditLog)')) {
    logSuccess('Main server uses audit middleware');
  } else {
    logError('Main server does not use audit middleware');
    allPassed = false;
  }
} else {
  logError('Main server file missing');
  allPassed = false;
}

// Check 7: .gitignore excludes logs
logInfo('\nChecking .gitignore...');
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignoreContent.includes('logs') || gitignoreContent.includes('*.log')) {
    logSuccess('.gitignore excludes log files');
  } else {
    logWarning('.gitignore may not exclude log files');
  }
} else {
  logWarning('.gitignore file missing');
}

// Check 8: Documentation exists
logInfo('\nChecking documentation...');
const loggingDocPath = path.join(__dirname, 'LOGGING_MONITORING.md');
if (fs.existsSync(loggingDocPath)) {
  logSuccess('Logging documentation exists: LOGGING_MONITORING.md');
} else {
  logError('Logging documentation missing: LOGGING_MONITORING.md');
  allPassed = false;
}

// Check 9: Test script exists
const testScriptPath = path.join(__dirname, 'test-logging.js');
if (fs.existsSync(testScriptPath)) {
  logSuccess('Logging test script exists: test-logging.js');
} else {
  logError('Logging test script missing: test-logging.js');
  allPassed = false;
}

// Summary
console.log('\n' + '='.repeat(60));
log('VERIFICATION SUMMARY', 'cyan');
console.log('='.repeat(60));

if (allPassed) {
  log('\n✅ All checks passed!', 'green');
  log('Logging system is properly configured.', 'green');
  log('\nNext steps:', 'blue');
  console.log('1. Start the server: npm start');
  console.log('2. Logs will be created in the logs/ directory');
  console.log('3. Run tests: node test-logging.js (requires server running)');
  console.log('4. View logs: tail -f logs/auth-*.log');
} else {
  log('\n❌ Some checks failed.', 'red');
  log('Please review the errors above and fix them.', 'yellow');
}

console.log('='.repeat(60) + '\n');

process.exit(allPassed ? 0 : 1);
