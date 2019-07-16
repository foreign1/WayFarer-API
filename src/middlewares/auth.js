const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const UserController = require('../controllers/users');
const {
  badRequestResponse,
  unauthorizedRequestResponse,
  forbiddenRequestResponse,
} = require('../helpers/errorHandler');

dotenv.config();

class AuthMiddleware {
  // Check is User have valid token
  static async auth(req, res, next) {
    const { token } = req.body;
    if (!token) return unauthorizedRequestResponse(req, res, 'Access denied. No token provided.');
    const jwtPrivateKey = process.env.NODE_ENV === 'test' ? process.env.TEST_JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY : process.env.JWT_PRIVATE_KEY;

    try {
      const payload = jwt.verify(token, jwtPrivateKey);
      const { email } = payload;
      const user = await UserController.model().select('id', `WHERE email='${email}'`);
      const { id } = user[0];
      const { user_id: userId } = req.body;
      if (id !== userId) return forbiddenRequestResponse(req, res, 'Access denied. User not registered.');
      return next();
    } catch (ex) {
      return badRequestResponse(req, res, 'Invalid token.');
    }
  }

  // Check if User is an admin
  static admin(req, res, next) {
    const { is_admin: isAdmin } = req.body;
    if (!isAdmin) return forbiddenRequestResponse(req, res, 'Access denied. User must be an Admin.');
    return next();
  }
}

module.exports = AuthMiddleware;
