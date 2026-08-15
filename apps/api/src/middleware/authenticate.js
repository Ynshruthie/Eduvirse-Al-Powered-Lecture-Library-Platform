const { authService } = require('../services/auth.service');
const { ApiError } = require('../utils/api-error');

async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication token is required.');
    }

    const user = await authService.getUserFromToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate };
