const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can customize the destination based on file type or route
    let dest = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      dest = 'uploads/images/';
    } else if (file.mimetype.includes('pdf')) {
      dest = 'uploads/documents/';
    } else {
      dest = 'uploads/others/';
    }

    // Create directory if it doesn't exist
    const fullPath = path.join(__dirname, '../', dest);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${baseName}-${uniqueSuffix}${fileExtension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'text/plain': true
  };

  // Check if file type is allowed
  if (allowedMimes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${Object.keys(allowedMimes).join(', ')} are allowed.`), false);
  }
};

// Configure multer with different upload options
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      handleUploadError(err, req, res, next);
    });
  };
};

const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      handleUploadError(err, req, res, next);
    });
  };
};

const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      handleUploadError(err, req, res, next);
    });
  };
};

// Error handling for uploads
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.',
            error: 'FILE_TOO_LARGE'
          });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded.',
            error: 'TOO_MANY_FILES'
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.',
            error: 'UNEXPECTED_FILE_FIELD'
          });
        default:
          return res.status(400).json({
            success: false,
            message: 'File upload error.',
            error: 'UPLOAD_ERROR'
          });
      }
    } else {
      // Other errors (e.g., fileFilter errors)
      return res.status(400).json({
        success: false,
        message: err.message,
        error: 'FILE_VALIDATION_ERROR'
      });
    }
  }
  next();
};

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      error: 'NO_FILE_UPLOADED'
    });
  }
  next();
};

// File cleanup utility (optional)
const cleanupUploadedFiles = (files) => {
  if (!files) return;

  const fileList = Array.isArray(files) ? files : [files];
  
  fileList.forEach(file => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
    }
  });
};

// Get file URL utility
const getFileUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateFile,
  cleanupUploadedFiles,
  getFileUrl,
  handleUploadError
};