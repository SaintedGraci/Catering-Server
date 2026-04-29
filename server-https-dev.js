/**
 * HTTPS Development Server
 * 
 * This server is for local HTTPS testing only.
 * For production, use a proper SSL certificate from Let's Encrypt or your provider.
 * 
 * Setup:
 * 1. Generate self-signed certificate:
 *    mkdir ssl
 *    cd ssl
 *    
 *    # Using OpenSSL:
 *    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
 *    
 *    # Or using mkcert (recommended):
 *    mkcert -install
 *    mkcert localhost 127.0.0.1 ::1
 * 
 * 2. Run: npm run start:https:dev
 * 
 * 3. Access: https://localhost:5443
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
require('dotenv').config();

// Import models
require('./src/Models');

// Import routes
const authRoutes = require('./src/Routes/authRoutes');
const dishRoutes = require('./src/Routes/dishRoutes');
const menuRoutes = require('./src/Routes/menuRoutes');
const bookingRoutes = require('./src/Routes/bookingRoutes');
const testimonialRoutes = require('./src/Routes/testimonialRoutes');
const packageRoutes = require('./src/Routes/packageRoutes');
const uploadRoutes = require('./src/Routes/uploadRoutes');
const settingsRoutes = require('./src/Routes/settingsRoutes');
const analyticsRoutes = require('./src/Routes/analyticsRoutes');

const app = express();
const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Check if SSL certificates exist
const sslKeyPath = path.join(__dirname, 'ssl', 'localhost+2-key.pem');
const sslCertPath = path.join(__dirname, 'ssl', 'localhost+2.pem');
const sslKeyPathAlt = path.join(__dirname, 'ssl', 'key.pem');
const sslCertPathAlt = path.join(__dirname, 'ssl', 'cert.pem');

let httpsOptions;

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  // mkcert certificates
  httpsOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };
  console.log('✅ Using mkcert certificates');
} else if (fs.existsSync(sslKeyPathAlt) && fs.existsSync(sslCertPathAlt)) {
  // OpenSSL certificates
  httpsOptions = {
    key: fs.readFileSync(sslKeyPathAlt),
    cert: fs.readFileSync(sslCertPathAlt)
  };
  console.log('✅ Using OpenSSL certificates');
} else {
  console.error('❌ SSL certificates not found!');
  console.log('\nPlease generate SSL certificates first:');
  console.log('\nOption 1 - Using mkcert (recommended):');
  console.log('  1. Install mkcert: https://github.com/FiloSottile/mkcert');
  console.log('  2. Run: mkcert -install');
  console.log('  3. Run: mkdir ssl && cd ssl');
  console.log('  4. Run: mkcert localhost 127.0.0.1 ::1');
  console.log('\nOption 2 - Using OpenSSL:');
  console.log('  1. Run: mkdir ssl && cd ssl');
  console.log('  2. Run: openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes');
  process.exit(1);
}

// Disable X-Powered-By header
app.disable('x-powered-by');

// Security Middleware - Helmet
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
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:3000'];

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
  maxAge: 86400,
  optionsSuccessStatus: 204
};

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Catering System Server is running over HTTPS (Development)...');
});

app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start servers
const startServers = async () => {
  try {
    await connectDB();
    
    // HTTPS Server
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
      console.log(`\n🔒 HTTPS Server running on https://localhost:${HTTPS_PORT}`);
      console.log(`   Secure cookies: ENABLED`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // HTTP Server (redirects to HTTPS)
    http.createServer((req, res) => {
      res.writeHead(301, { 
        Location: `https://localhost:${HTTPS_PORT}${req.url}` 
      });
      res.end();
    }).listen(HTTP_PORT, () => {
      console.log(`\n🔓 HTTP Server running on http://localhost:${HTTP_PORT}`);
      console.log(`   Redirecting all traffic to HTTPS`);
    });

    console.log('\n✅ Both servers started successfully!');
    console.log('\n📝 Note: You may see a certificate warning in your browser.');
    console.log('   This is normal for self-signed certificates in development.');
    console.log('   Click "Advanced" and "Proceed to localhost" to continue.\n');

  } catch (error) {
    console.error('Failed to start servers:', error);
    process.exit(1);
  }
};

startServers();
