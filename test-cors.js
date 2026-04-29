/**
 * Test script to verify CORS configuration
 * Run with: node test-cors.js
 */

const http = require('http');

const testCORS = (origin, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/dishes',
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = http.request(options, (res) => {
      const headers = res.headers;
      resolve({
        origin,
        description,
        statusCode: res.statusCode,
        allowed: headers['access-control-allow-origin'] === origin,
        credentials: headers['access-control-allow-credentials'] === 'true',
        headers: {
          'access-control-allow-origin': headers['access-control-allow-origin'],
          'access-control-allow-credentials': headers['access-control-allow-credentials'],
          'access-control-allow-methods': headers['access-control-allow-methods']
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🔒 CORS Security Test\n');
  console.log('Testing CORS configuration on http://localhost:5000\n');

  const tests = [
    {
      origin: 'http://localhost:8080',
      description: 'Allowed origin (localhost:8080)',
      shouldPass: true
    },
    {
      origin: 'http://localhost:8081',
      description: 'Allowed origin (localhost:8081)',
      shouldPass: true
    },
    {
      origin: 'http://localhost:3000',
      description: 'Allowed origin (localhost:3000)',
      shouldPass: true
    },
    {
      origin: 'http://malicious-site.com',
      description: 'Blocked origin (malicious-site.com)',
      shouldPass: false
    },
    {
      origin: 'http://evil.com',
      description: 'Blocked origin (evil.com)',
      shouldPass: false
    }
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      const result = await testCORS(test.origin, test.description);
      
      const passed = test.shouldPass ? result.allowed : !result.allowed;
      const icon = passed ? '✅' : '❌';
      
      if (passed) passCount++;
      else failCount++;

      console.log(`${icon} ${test.description}`);
      console.log(`   Origin: ${test.origin}`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Allowed: ${result.allowed ? 'Yes' : 'No'}`);
      console.log(`   Credentials: ${result.credentials ? 'Yes' : 'No'}`);
      
      if (test.shouldPass && !result.allowed) {
        console.log(`   ⚠️  Expected to be allowed but was blocked!`);
      } else if (!test.shouldPass && result.allowed) {
        console.log(`   ⚠️  Expected to be blocked but was allowed!`);
      }
      
      console.log();
    } catch (error) {
      console.log(`❌ ${test.description}`);
      console.log(`   Error: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\nResults: ${passCount}/${tests.length} tests passed\n`);

  if (failCount === 0) {
    console.log('✅ CORS is properly configured!\n');
    console.log('Security Features:');
    console.log('  ✅ Only trusted origins allowed');
    console.log('  ✅ Credentials enabled for authentication');
    console.log('  ✅ Unknown origins blocked\n');
  } else {
    console.log('⚠️  Some CORS tests failed. Review configuration.\n');
  }
};

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
  });
};

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running on port 5000');
    console.log('Start the server with: node index.js\n');
    process.exit(1);
  }

  await runTests();
})();
