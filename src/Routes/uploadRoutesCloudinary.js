const express = require('express');
const router = express.Router();
const cloudinary = require('../../config/cloudinary');
const { authenticate } = require('../Middlewares/authMiddleware');
const multer = require('multer');

// Configure multer to use memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Upload single image to Cloudinary
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'catering-dishes', // Organize images in folders
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'auto' }, // Square crop with smart focus
            { quality: 'auto' } // Auto optimize quality
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: result.public_id,
        path: result.secure_url, // Full HTTPS URL
        size: result.bytes,
        mimetype: req.file.mimetype,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image to cloud storage'
    });
  }
});

// Upload multiple images to Cloudinary
router.post('/images', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'catering-dishes',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'fill', gravity: 'auto' }, // Square crop with smart focus
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              filename: result.public_id,
              path: result.secure_url,
              size: result.bytes,
              mimetype: file.mimetype,
              width: result.width,
              height: result.height
            });
          }
        );
        
        uploadStream.end(file.buffer);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images to cloud storage'
    });
  }
});

// Delete image from Cloudinary (admin only)
// Note: publicId should be sent in request body since it can contain slashes
router.delete('/image', authenticate, async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image from cloud storage'
    });
  }
});

module.exports = router;
