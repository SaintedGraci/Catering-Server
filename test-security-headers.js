/**
 * Test script to verify security headers are properly set
 * Run with: node test-security-headers.js
 */

const http = require('http');

const testEndpoint = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      const headers = res.headers;
      resolve({ path, headers, statusCode: res.statusCode });
    });

    req.on('error', reject);
    req.end();
  });
};

const checkSecurityHeaders = (headers) => {
  const checks = {
    'X-Powered-By': {
      expected: 'Should NOT be present',
      actual: headers['x-powered-by'] ? `❌ Present: ${headers['x-powered-by']}` : '✅ Not present',
      pass: !headers['x-powered-by']
    },
    'X-Content-Type-Options': {
      expected: 'nosniff',
      actual: headers['x-content-type-options'] || '❌ Not set',
      pass: headers['x-content-type-options'] === 'nosniff'
    },
    'X-Frame-Options': {
      expected: 'SAMEORIGIN',
      actual: headers['x-frame-options'] || '❌ Not set',
      pass: headers['x-frame-options'] === 'SAMEORIGIN'
    },
    'Content-Security-Policy': {
      expected: 'Should be present',
      actual: headers['content-security-policy'] ? '✅ Present' : '❌ Not set',
      pass: !!headers['content-security-policy']
    },
    'Referrer-Policy': {
      expected: 'Should be present',
      actual: headers['referrer-policy'] || '❌ Not set',
      pass: !!headers['referrer-policy']
    },
    'Cross-Origin-Resource-Policy': {
      expected: 'cross-origin',
      actual: headers['cross-origin-resource-policy'] || '❌ Not set',
      pass: headers['cross-origin-resource-policy'] === 'cross-origin'
    }
  };

  return checks;
};

const runTests = async () => {
  console.log('\n🔒 Security Headers Test\n');
  console.log('Testing endpoint: http://localhost:5000/\n');

  try {
    const result = await testEndpoint('/');
    
    console.log(`Status Code: ${result.statusCode}\n`);
    
    const checks = checkSecurityHeaders(result.headers);
    
    let passCount = 0;
    let totalCount = 0;

    console.log('Security Headers Check:\n');
    
    for (const [header, check] of Object.entries(checks)) {
      totalCount++;
      if (check.pass) passCount++;
      
      const icon = check.pass ? '✅' : '❌';
      console.log(`${icon} ${header}`);
      console.log(`   Expected: ${check.expected}`);
      console.log(`   Actual: ${check.actual}\n`);
    }

    console.log('─'.repeat(50));
    console.log(`\nResults: ${passCount}/${totalCount} checks passed\n`);

    if (passCount === totalCount) {
      console.log('✅ All security headers are properly configured!\n');
    } else {
      console.log('⚠️  Some security headers need attention.\n');
    }

    // Display full CSP if present
    if (result.headers['content-security-policy']) {
      console.log('Content-Security-Policy:');
      console.log(result.headers['content-security-policy']);
      console.log();
    }

  } catch (error) {
    console.error('❌ Error testing security headers:', error.message);
    console.log('\nMake sure the server is running on port 5000');
    console.log('Start the server with: node index.js\n');
  }
};

runTests();
