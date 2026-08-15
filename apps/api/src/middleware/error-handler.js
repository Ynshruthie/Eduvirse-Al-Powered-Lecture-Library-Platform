const { ApiError } = require('../utils/api-error');

function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Something went wrong on the server.',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.details || null,
      requestId: req.requestId,
    },
  });
}

module.exports = { errorHandler };
