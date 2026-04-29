const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../../config/upload');
const { authenticate } = require('../Middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');

// Upload single image
router.post('/image', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Return the file path that can be used to access the image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          path: imageUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file if error occurs
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading image'
      });
    }
  });
});

// Upload multiple images
router.post('/images', authenticate, (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded files if error occurs
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading images'
      });
    }
  });
});

// Delete uploaded image (admin only)
router.delete('/image/:filename', authenticate, (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
});

module.exports = router;
