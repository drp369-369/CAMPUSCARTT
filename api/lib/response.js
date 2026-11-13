// api/lib/response.js - Centralized API response and error utilities
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = statusCode;
  return res.end(JSON.stringify({
    success: true,
    message,
    data
  }));
}

function sendError(res, statusCode = 400, message = 'An error occurred', details = null) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = statusCode;
  const payload = {
    success: false,
    error: message
  };
  if (details) {
    payload.details = details;
  }
  return res.end(JSON.stringify(payload));
}

function handleApiError(res, err, context = 'API Operation') {
  console.error(`[${context} Error]:`, err);

  // MongoDB Unique Constraint Violation (E11000)
  if (err && (err.code === 11000 || (err.message && err.message.includes('E11000')))) {
    const fieldMatch = err.message.match(/index:\s+(\w+)_/);
    const field = fieldMatch ? fieldMatch[1] : 'field';
    return sendError(res, 409, `An account or record with this ${field} already exists.`, {
      field,
      code: 'DUPLICATE_KEY'
    });
  }

  // MongoDB URI missing configuration
  if (err && err.message && err.message.includes('MONGODB_URI')) {
    return sendError(res, 503, 'Database configuration missing. Please configure MONGODB_URI in .env or Vercel dashboard.', {
      code: 'DATABASE_CONFIG_MISSING'
    });
  }

  // MongoDB connection timeout or network failure
  if (err && (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError')) {
    return sendError(res, 503, 'Database service is temporarily unreachable. Please verify MongoDB Atlas network whitelist.', {
      code: 'DATABASE_UNAVAILABLE'
    });
  }

  // Validation Error
  if (err && err.name === 'ValidationError') {
    return sendError(res, 422, err.message, err.errors || null);
  }

  // Generic 500
  return sendError(res, 500, 'Internal Server Error. Please try again later.', {
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
}

module.exports = {
  sendSuccess,
  sendError,
  handleApiError
};

