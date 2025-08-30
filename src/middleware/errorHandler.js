

 // Handles all errors that occur in the application

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    const errors = Object.values(err.errors).map(val => val.message);
    error = {
      success: false,
      message,
      errors,
      statusCode: 400
    };
  }

  // MongoDB connection error
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      success: false,
      message: 'Database connection error',
      statusCode: 503
    };
  }

  // JSON parsing error
  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    error = {
      success: false,
      message: 'Invalid JSON format',
      statusCode: 400
    };
  }

  // JWT authentication error
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      statusCode: 401
    };
  }

  // JWT token expired error
  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Rate limiting error
  if (err.status === 429) {
    error = {
      success: false,
      message: 'Too many requests, please try again later',
      statusCode: 429
    };
  }

  // Default error response
  const response = {
    success: error.success || false,
    message: error.message || 'Server Error',
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;