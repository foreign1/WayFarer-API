const bcrypt = require('bcrypt');
const Model = require('../models/users');
const { internalServerErrorResponse, badRequestResponse, checkAdminRoute } = require('../helpers/errorHandler');

class UserController {
  static model() {
    return new Model('users');
  }

  // Creates new user
  static async addUser(req, res) {
    try {
      const role = checkAdminRoute(req.path) ? 'true' : 'false';
      const {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      } = req.body;
      // Search model to check if user is already registered
      const user = await UserController.model().select('email', `WHERE email='${email}'`);
      if (user.length) return badRequestResponse(req, res, 'User already registered');
      // Hashing password with salt
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      // Creates new user and return user data
      const data = await UserController.model()
        .insert('email, first_name, last_name, password, is_admin', `'${email}', '${firstName}', '${lastName}', '${hashPassword}', '${role}'`);
      return res.status(201).json({
        data,
        message: 'User was added successfully',
        status: 'USER_ADDED',
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }

  static async deleteUser(req, res) {
    try {
      const { email } = req.body;
      const data = await UserController.model()
        .delete('email', email);
      return res.status(202).json({
        data,
        message: 'User was deleted successfully',
        status: 'USER_DELETED',
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }
}

module.exports = UserController;
