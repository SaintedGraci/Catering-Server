const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Login Rate Limiting (5 attempts per 15 minutes)
async function testLoginRateLimit() {
  log('\n=== TEST 1: Login Rate Limiting ===', 'cyan');
  log('Testing 6 login attempts (limit is 5 per 15 minutes)...', 'blue');
  
  let passCount = 0;
  let blockCount = 0;

  for (let i = 1; i <= 6; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'wrongpassword'
      }, {
        validateStatus: () => true // Don't throw on any status
      });

      if (response.status === 429) {
        log(`  Attempt ${i}: ❌ BLOCKED (429) - ${response.data.message}`, 'red');
        blockCount++;
      } else {
        log(`  Attempt ${i}: ✅ ALLOWED (${response.status})`, 'green');
        passCount++;
        
        // Show rate limit headers
        if (response.headers['ratelimit-remaining']) {
          log(`    Remaining: ${response.headers['ratelimit-remaining']}/${response.headers['ratelimit-limit']}`, 'yellow');
        }
      }
    } catch (error) {
      log(`  Attempt ${i}: ⚠️  ERROR - ${error.message}`, 'red');
    }
    
    await sleep(100); // Small delay between requests
  }

  log(`\nResult: ${passCount} allowed, ${blockCount} blocked`, 'cyan');
  
  if (passCount === 5 && blockCount === 1) {
    log('✅ Login rate limiting working correctly!', 'green');
    return true;
  } else {
    log('❌ Login rate limiting not working as expected', 'red');
    return false;
  }
}

// Test 2: General API Rate Limiting (100 requests per 15 minutes)
async function testGeneralRateLimit() {
  log('\n=== TEST 2: General API Rate Limiting ===', 'cyan');
  log('Testing general API rate limit (this will take a moment)...', 'blue');
  log('Making 10 requests to /api/dishes...', 'blue');
  
  let passCount = 0;
  let blockCount = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const response = await axios.get(`${BASE_URL}/api/dishes`, {
        validateStatus: () => true
      });

      if (response.status === 429) {
        log(`  Request ${i}: ❌ BLOCKED (429)`, 'red');
        blockCount++;
      } else {
        log(`  Request ${i}: ✅ ALLOWED (${response.status})`, 'green');
        passCount++;
        
        if (i === 1 && response.headers['ratelimit-limit']) {
          log(`    Rate Limit: ${response.headers['ratelimit-remaining']}/${response.headers['ratelimit-limit']} remaining`, 'yellow');
        }
      }
    } catch (error) {
      log(`  Request ${i}: ⚠️  ERROR - ${error.message}`, 'red');
    }
  }

  log(`\nResult: ${passCount} allowed, ${blockCount} blocked`, 'cyan');
  
  if (passCount === 10 && blockCount === 0) {
    log('✅ General rate limiting configured (limit not reached with 10 requests)', 'green');
    return true;
  } else {
    log('⚠️  Unexpected behavior in general rate limiting', 'yellow');
    return false;
  }
}

// Test 3: Booking Rate Limiting (10 bookings per hour)
async function testBookingRateLimit() {
  log('\n=== TEST 3: Booking Rate Limiting ===', 'cyan');
  log('Testing 3 booking attempts (limit is 10 per hour)...', 'blue');
  
  let passCount = 0;
  let blockCount = 0;

  const bookingData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    eventDate: '2024-12-31',
    guestCount: 50,
    message: 'Test booking for rate limit'
  };

  for (let i = 1; i <= 3; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/api/bookings`, bookingData, {
        validateStatus: () => true
      });

      if (response.status === 429) {
        log(`  Booking ${i}: ❌ BLOCKED (429) - ${response.data.message}`, 'red');
        blockCount++;
      } else {
        log(`  Booking ${i}: ✅ ALLOWED (${response.status})`, 'green');
        passCount++;
        
        if (response.headers['ratelimit-remaining']) {
          log(`    Remaining: ${response.headers['ratelimit-remaining']}/${response.headers['ratelimit-limit']}`, 'yellow');
        }
      }
    } catch (error) {
      log(`  Booking ${i}: ⚠️  ERROR - ${error.message}`, 'red');
    }
    
    await sleep(100);
  }

  log(`\nResult: ${passCount} allowed, ${blockCount} blocked`, 'cyan');
  
  if (passCount === 3 && blockCount === 0) {
    log('✅ Booking rate limiting configured (limit not reached with 3 requests)', 'green');
    return true;
  } else {
    log('⚠️  Unexpected behavior in booking rate limiting', 'yellow');
    return false;
  }
}

// Test 4: Rate Limit Headers
async function testRateLimitHeaders() {
  log('\n=== TEST 4: Rate Limit Headers ===', 'cyan');
  log('Checking if rate limit headers are present...', 'blue');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/dishes`);
    
    const headers = {
      'RateLimit-Limit': response.headers['ratelimit-limit'],
      'RateLimit-Remaining': response.headers['ratelimit-remaining'],
      'RateLimit-Reset': response.headers['ratelimit-reset']
    };

    log('\nHeaders found:', 'blue');
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        log(`  ✅ ${key}: ${value}`, 'green');
      } else {
        log(`  ❌ ${key}: Not found`, 'red');
      }
    });

    const allPresent = Object.values(headers).every(v => v !== undefined);
    
    if (allPresent) {
      log('\n✅ All rate limit headers present!', 'green');
      return true;
    } else {
      log('\n❌ Some rate limit headers missing', 'red');
      return false;
    }
  } catch (error) {
    log(`⚠️  ERROR: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║         RATE LIMITING SECURITY TEST SUITE             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log('\nTesting rate limiting on http://localhost:5000', 'blue');
  log('Make sure the server is running before proceeding!\n', 'yellow');

  await sleep(1000);

  const results = {
    loginRateLimit: false,
    generalRateLimit: false,
    bookingRateLimit: false,
    rateLimitHeaders: false
  };

  try {
    // Run tests
    results.rateLimitHeaders = await testRateLimitHeaders();
    await sleep(500);
    
    results.generalRateLimit = await testGeneralRateLimit();
    await sleep(500);
    
    results.bookingRateLimit = await testBookingRateLimit();
    await sleep(500);
    
    results.loginRateLimit = await testLoginRateLimit();

    // Summary
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║                    TEST SUMMARY                        ║', 'cyan');
    log('╚════════════════════════════════════════════════════════╝', 'cyan');
    
    const tests = [
      { name: 'Rate Limit Headers', result: results.rateLimitHeaders },
      { name: 'General API Rate Limit', result: results.generalRateLimit },
      { name: 'Booking Rate Limit', result: results.bookingRateLimit },
      { name: 'Login Rate Limit', result: results.loginRateLimit }
    ];

    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      const color = test.result ? 'green' : 'red';
      log(`  ${status} - ${test.name}`, color);
    });

    const passCount = Object.values(results).filter(r => r).length;
    const totalCount = Object.keys(results).length;

    log(`\n  Total: ${passCount}/${totalCount} tests passed`, passCount === totalCount ? 'green' : 'yellow');

    if (passCount === totalCount) {
      log('\n🎉 All rate limiting tests passed! Your API is protected from brute force attacks.', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please check the configuration.', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    log('Make sure the server is running on http://localhost:5000', 'yellow');
  }
}

// Run tests
runAllTests();
