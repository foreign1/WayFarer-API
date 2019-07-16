const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {
  badRequestResponse,
  unauthorizedRequestResponse,
  forbiddenRequestResponse,
} = require('../helpers/errorHandler');

dotenv.config();

class TripMiddleware {
  static auth(req, res, next) {
    const { token } = req.body;

    if (!token) return unauthorizedRequestResponse(req, res, 'Access denied. No token provided.');

    const jwtPrivateKey = process.env.NODE_ENV === 'test' ? process.env.TEST_JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY : process.env.JWT_PRIVATE_KEY;
    try {
      jwt.verify(token, jwtPrivateKey);
      return next();
    } catch (ex) {
      return badRequestResponse(req, res, 'Invalid token.');
    }
  }

  static admin(req, res, next) {
    const { is_admin: isAdmin } = req.body;
    if (!isAdmin) return forbiddenRequestResponse(req, res, 'Access denied. User must be an Admin.');
    return next();
  }
}

module.exports = TripMiddleware;
