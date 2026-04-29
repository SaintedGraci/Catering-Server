/**
 * Logging and Monitoring Test Script
 * 
 * Tests the Winston logging implementation including:
 * - Login attempt logging (success/failure)
 * - Failed authentication tracking
 * - User action auditing
 * - Log file creation and rotation
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const LOGS_DIR = path.join(__dirname, 'logs');

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

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━ ${testName} ━━━${colors.reset}`);
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

// Helper to check if log file exists and contains text
function checkLogFile(filename, searchText) {
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOGS_DIR, `${filename}-${today}.log`);
  
  if (!fs.existsSync(logFile)) {
    return { exists: false, contains: false };
  }
  
  const content = fs.readFileSync(logFile, 'utf8');
  return {
    exists: true,
    contains: content.includes(searchText),
    content: content
  };
}

// Helper to wait for logs to be written
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testLogFileCreation() {
  logTest('Test 1: Log File Creation');
  
  const today = new Date().toISOString().split('T')[0];
  const expectedFiles = [
    `error-${today}.log`,
    `combined-${today}.log`,
    `auth-${today}.log`,
    `audit-${today}.log`
  ];
  
  let allExist = true;
  
  for (const file of expectedFiles) {
    const filePath = path.join(LOGS_DIR, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Log file exists: ${file}`);
    } else {
      logError(`Log file missing: ${file}`);
      allExist = false;
    }
  }
  
  return allExist;
}

async function testSuccessfulLogin() {
  logTest('Test 2: Successful Login Logging');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin@123'
    }, {
      withCredentials: true
    });
    
    if (response.data.success) {
      logSuccess('Login successful');
      
      // Wait for log to be written
      await wait(500);
      
      // Check auth log
      const authLog = checkLogFile('auth', 'Successful login');
      if (authLog.exists && authLog.contains) {
        logSuccess('Login logged in auth log file');
        
        // Check for required fields
        const hasUserId = authLog.content.includes('"userId"');
        const hasEmail = authLog.content.includes('"email"');
        const hasIp = authLog.content.includes('"ip"');
        const hasUserAgent = authLog.content.includes('"userAgent"');
        
        if (hasUserId && hasEmail && hasIp && hasUserAgent) {
          logSuccess('Log contains all required fields (userId, email, ip, userAgent)');
          return true;
        } else {
          logError('Log missing required fields');
          return false;
        }
      } else {
        logError('Login not logged in auth log file');
        return false;
      }
    } else {
      logError('Login failed');
      return false;
    }
  } catch (error) {
    logError(`Login request failed: ${error.message}`);
    return false;
  }
}

async function testFailedLogin() {
  logTest('Test 3: Failed Login Logging');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'WrongPassword123'
    }, {
      withCredentials: true,
      validateStatus: () => true // Don't throw on 401
    });
    
    // Wait for log to be written
    await wait(500);
    
    // Check auth log
    const authLog = checkLogFile('auth', 'Failed login attempt');
    if (authLog.exists && authLog.contains) {
      logSuccess('Failed login logged in auth log file');
      
      // Check for required fields
      const hasReason = authLog.content.includes('"reason"');
      const hasEmail = authLog.content.includes('"email"');
      const hasIp = authLog.content.includes('"ip"');
      
      if (hasReason && hasEmail && hasIp) {
        logSuccess('Log contains all required fields (reason, email, ip)');
        return true;
      } else {
        logError('Log missing required fields');
        return false;
      }
    } else {
      logError('Failed login not logged in auth log file');
      return false;
    }
  } catch (error) {
    logError(`Failed login test error: ${error.message}`);
    return false;
  }
}

async function testAuthenticationFailure() {
  logTest('Test 4: Failed Authentication Logging');
  
  try {
    // Request without token
    await axios.get(`${BASE_URL}/api/dishes`, {
      validateStatus: () => true // Don't throw on 401
    });
    
    // Wait for log to be written
    await wait(500);
    
    // Check auth log
    const authLog = checkLogFile('auth', 'Authentication failed - no token provided');
    if (authLog.exists && authLog.contains) {
      logSuccess('Authentication failure logged in auth log file');
      
      // Check for required fields
      const hasPath = authLog.content.includes('"path"');
      const hasMethod = authLog.content.includes('"method"');
      const hasIp = authLog.content.includes('"ip"');
      
      if (hasPath && hasMethod && hasIp) {
        logSuccess('Log contains all required fields (path, method, ip)');
        return true;
      } else {
        logError('Log missing required fields');
        return false;
      }
    } else {
      logError('Authentication failure not logged');
      return false;
    }
  } catch (error) {
    logError(`Authentication failure test error: ${error.message}`);
    return false;
  }
}

async function testUserActionAudit() {
  logTest('Test 5: User Action Auditing');
  
  try {
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin@123'
    }, {
      withCredentials: true
    });
    
    if (!loginResponse.data.success) {
      logError('Login failed, cannot test audit logging');
      return false;
    }
    
    // Get cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    
    // Make authenticated request
    await axios.get(`${BASE_URL}/api/dishes`, {
      headers: {
        Cookie: cookies ? cookies.join('; ') : ''
      },
      withCredentials: true
    });
    
    // Wait for log to be written
    await wait(500);
    
    // Check audit log
    const auditLog = checkLogFile('audit', 'User action');
    if (auditLog.exists && auditLog.contains) {
      logSuccess('User action logged in audit log file');
      
      // Check for required fields
      const hasUserId = auditLog.content.includes('"userId"');
      const hasUserEmail = auditLog.content.includes('"userEmail"');
      const hasAction = auditLog.content.includes('"action"');
      const hasMethod = auditLog.content.includes('"method"');
      const hasPath = auditLog.content.includes('"path"');
      const hasIp = auditLog.content.includes('"ip"');
      const hasStatusCode = auditLog.content.includes('"statusCode"');
      
      if (hasUserId && hasUserEmail && hasAction && hasMethod && hasPath && hasIp && hasStatusCode) {
        logSuccess('Log contains all required fields (userId, userEmail, action, method, path, ip, statusCode)');
        return true;
      } else {
        logError('Log missing required fields');
        return false;
      }
    } else {
      logError('User action not logged in audit log file');
      return false;
    }
  } catch (error) {
    logError(`User action audit test error: ${error.message}`);
    return false;
  }
}

async function testPasswordChangeLogging() {
  logTest('Test 6: Password Change Logging');
  
  try {
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin@123'
    }, {
      withCredentials: true
    });
    
    if (!loginResponse.data.success) {
      logError('Login failed, cannot test password change logging');
      return false;
    }
    
    // Get cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    
    // Attempt password change with wrong current password
    await axios.post(`${BASE_URL}/api/auth/change-password`, {
      currentPassword: 'WrongPassword',
      newPassword: 'NewAdmin@123'
    }, {
      headers: {
        Cookie: cookies ? cookies.join('; ') : ''
      },
      withCredentials: true,
      validateStatus: () => true // Don't throw on 401
    });
    
    // Wait for log to be written
    await wait(500);
    
    // Check auth log for failed password change
    const authLog = checkLogFile('auth', 'Failed password change attempt');
    if (authLog.exists && authLog.contains) {
      logSuccess('Failed password change logged in auth log file');
      return true;
    } else {
      logError('Failed password change not logged');
      return false;
    }
  } catch (error) {
    logError(`Password change logging test error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('LOGGING AND MONITORING TEST SUITE', 'cyan');
  console.log('='.repeat(60));
  
  logInfo('Testing Winston logging implementation...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Check if logs directory exists
  if (!fs.existsSync(LOGS_DIR)) {
    logError(`Logs directory not found: ${LOGS_DIR}`);
    logInfo('Logs will be created when the server starts');
  }
  
  // Run tests
  const tests = [
    { name: 'Log File Creation', fn: testLogFileCreation },
    { name: 'Successful Login Logging', fn: testSuccessfulLogin },
    { name: 'Failed Login Logging', fn: testFailedLogin },
    { name: 'Failed Authentication Logging', fn: testAuthenticationFailure },
    { name: 'User Action Auditing', fn: testUserActionAudit },
    { name: 'Password Change Logging', fn: testPasswordChangeLogging },
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
      results.failed++;
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  log('TEST SUMMARY', 'cyan');
  console.log('='.repeat(60));
  
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n✅ All logging tests passed!', 'green');
    log('Logging and monitoring system is working correctly.', 'green');
  } else {
    log(`\n❌ ${results.failed} test(s) failed.`, 'red');
    log('Please check the server logs and configuration.', 'yellow');
  }
  
  console.log('='.repeat(60) + '\n');
  
  // Additional information
  logInfo('Log Files Location:');
  console.log(`  ${LOGS_DIR}`);
  
  logInfo('\nLog Files:');
  console.log('  - error-YYYY-MM-DD.log    (Error logs)');
  console.log('  - combined-YYYY-MM-DD.log (All logs)');
  console.log('  - auth-YYYY-MM-DD.log     (Authentication logs)');
  console.log('  - audit-YYYY-MM-DD.log    (User action logs)');
  
  logInfo('\nTo view logs:');
  console.log('  tail -f logs/auth-*.log');
  console.log('  tail -f logs/audit-*.log');
  console.log('  tail -f logs/error-*.log');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  logError(`Test suite error: ${error.message}`);
  process.exit(1);
});
