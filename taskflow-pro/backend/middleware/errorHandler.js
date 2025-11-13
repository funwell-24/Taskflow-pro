/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Stack:', err.stack);
  console.error('Error Details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    keyValue: err.keyValue
  });

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = 'Resource not found with the specified ID';
    error = {
      message,
      statusCode: 404,
      name: 'NotFoundError'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' is already taken. Please use a different ${field}.`;
    error = {
      message,
      statusCode: 400,
      name: 'DuplicateFieldError'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => {
      // Handle different types of validation errors
      if (val.name === 'CastError') {
        return `Invalid value for ${val.path}: ${val.value}`;
      }
      if (val.kind === 'unique') {
        return `${val.path} must be unique`;
      }
      if (val.kind === 'required') {
        return `${val.path} is required`;
      }
      if (val.kind === 'minlength') {
        return `${val.path} must be at least ${val.properties.minlength} characters`;
      }
      if (val.kind === 'maxlength') {
        return `${val.path} must not exceed ${val.properties.maxlength} characters`;
      }
      return val.message;
    });

    error = {
      message: messages.join(', '),
      statusCode: 400,
      name: 'ValidationError',
      details: messages
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid authentication token',
      statusCode: 401,
      name: 'AuthenticationError'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Authentication token has expired',
      statusCode: 401,
      name: 'AuthenticationError'
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large. Please upload a file smaller than 10MB.',
      statusCode: 400,
      name: 'FileSizeError'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Too many files uploaded. Please upload only one file.',
      statusCode: 400,
      name: 'FileUploadError'
    };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    message: message,
    error: error.name || 'InternalServerError'
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = error.details;
  }

  // Add validation errors if available
  if (error.details) {
    errorResponse.details = error.details;
  }

  // Log the error (you can integrate with a logging service here)
  logError(req, err, statusCode);

  res.status(statusCode).json(errorResponse);
};

/**
 * Utility function to log errors
 */
const logError = (req, err, statusCode) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    statusCode: statusCode
  };

  // In production, you might want to send this to a logging service
  console.error('Error Log:', JSON.stringify(logEntry, null, 2));
};

/**
 * Async error handler wrapper
 * Catches async errors and passes them to the error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found middleware
 * Should be placed after all routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};