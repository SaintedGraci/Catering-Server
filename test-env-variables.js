require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, isSensitive = false) {
  const value = process.env[name];
  const exists = !!value;
  
  if (exists) {
    if (isSensitive) {
      // Show only first and last 3 characters for sensitive data
      const masked = value.length > 6 
        ? `${value.substring(0, 3)}${'*'.repeat(value.length - 6)}${value.substring(value.length - 3)}`
        : '*'.repeat(value.length);
      log(`  ✅ ${name}: ${masked}`, 'green');
    } else {
      log(`  ✅ ${name}: ${value}`, 'green');
    }
    return true;
  } else {
    log(`  ❌ ${name}: NOT SET`, 'red');
    return false;
  }
}

log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
log('║       ENVIRONMENT VARIABLES SECURITY CHECK            ║', 'cyan');
log('╚════════════════════════════════════════════════════════╝', 'cyan');

log('\n=== Database Configuration ===', 'blue');
const dbVars = [
  checkEnvVar('DB_HOST'),
  checkEnvVar('DB_USER'),
  checkEnvVar('DB_PASSWORD', true),
  checkEnvVar('DB_NAME'),
  checkEnvVar('DB_DIALECT'),
  checkEnvVar('DB_PORT')
];

log('\n=== Server Configuration ===', 'blue');
const serverVars = [
  checkEnvVar('PORT'),
  checkEnvVar('NODE_ENV')
];

log('\n=== Security Configuration ===', 'blue');
const securityVars = [
  checkEnvVar('JWT_SECRET', true),
  checkEnvVar('ALLOWED_ORIGINS')
];

// Summary
const allVars = [...dbVars, ...serverVars, ...securityVars];
const setCount = allVars.filter(v => v).length;
const totalCount = allVars.length;

log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
log('║                    SUMMARY                             ║', 'cyan');
log('╚════════════════════════════════════════════════════════╝', 'cyan');

log(`\n  Environment Variables: ${setCount}/${totalCount} set`, setCount === totalCount ? 'green' : 'yellow');

if (setCount === totalCount) {
  log('\n  ✅ All required environment variables are set!', 'green');
} else {
  log('\n  ⚠️  Some environment variables are missing!', 'yellow');
  log('  Please check your .env file and ensure all required variables are set.', 'yellow');
}

// Security checks
log('\n=== Security Checks ===', 'blue');

// Check JWT_SECRET strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    log('  ⚠️  JWT_SECRET is too short (should be at least 32 characters)', 'yellow');
  } else {
    log('  ✅ JWT_SECRET length is adequate', 'green');
  }
  
  if (jwtSecret.includes('change-this') || jwtSecret.includes('secret') || jwtSecret === 'your-secret-key') {
    log('  ⚠️  JWT_SECRET appears to be a default/weak value', 'yellow');
    log('     Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"', 'yellow');
  } else {
    log('  ✅ JWT_SECRET appears to be custom', 'green');
  }
}

// Check if .env is in .gitignore
const fs = require('fs');
const path = require('path');

try {
  const gitignorePath = path.join(__dirname, '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignoreContent.includes('.env')) {
    log('  ✅ .env is in .gitignore', 'green');
  } else {
    log('  ❌ .env is NOT in .gitignore - SECURITY RISK!', 'red');
  }
} catch (error) {
  log('  ⚠️  Could not read .gitignore file', 'yellow');
}

// Check if .env.example exists
try {
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    log('  ✅ .env.example template exists', 'green');
  } else {
    log('  ⚠️  .env.example template not found', 'yellow');
  }
} catch (error) {
  log('  ⚠️  Could not check for .env.example', 'yellow');
}

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'production') {
  log('\n  🚀 Running in PRODUCTION mode', 'cyan');
  log('     Make sure you are using production-grade secrets!', 'yellow');
} else {
  log('\n  🔧 Running in DEVELOPMENT mode', 'cyan');
}

log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
log('║                  RECOMMENDATIONS                       ║', 'cyan');
log('╚════════════════════════════════════════════════════════╝', 'cyan');

log('\n  1. Never commit .env to version control', 'blue');
log('  2. Use strong, unique secrets for production', 'blue');
log('  3. Rotate secrets regularly (every 90 days)', 'blue');
log('  4. Use different secrets for each environment', 'blue');
log('  5. Store production .env securely (password manager)', 'blue');

log('\n');
