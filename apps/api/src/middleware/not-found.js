const { ApiError } = require('../utils/api-error');

function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
}

module.exports = { notFoundHandler };
