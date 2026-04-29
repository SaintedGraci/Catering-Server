const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create uploads directory OUTSIDE public directory for security
// Files are served through controlled endpoint, not directly accessible
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types with their MIME types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Generate secure random filename
const generateSecureFilename = (originalname) => {
  // Generate random bytes for filename
  const randomName = crypto.randomBytes(16).toString('hex');
  
  // Get file extension from original name
  const ext = path.extname(originalname).toLowerCase();
  
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  // Return: randomhex-timestamp.ext
  return `${randomName}-${timestamp}${ext}`;
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate secure random filename
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// File filter - strict validation
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_FILE_TYPES[file.mimetype]) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES);
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed.'), false);
  }

  // Additional security: Check for double extensions
  const filename = path.basename(file.originalname, ext);
  if (filename.includes('.')) {
    return cb(new Error('Invalid filename. Files with multiple extensions are not allowed.'), false);
  }

  // All checks passed
  cb(null, true);
};

// Configure multer with security settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 5MB max
    files: 10, // Maximum 10 files per request
    fields: 10, // Maximum 10 non-file fields
    parts: 20 // Maximum 20 parts (files + fields)
  },
  fileFilter: fileFilter
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    // Other errors (like file filter errors)
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};
