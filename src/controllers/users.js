import bcrypt from 'bcrypt';
import Model from '../models/Model';
import generateJwtToken from '../helpers/generateJwtToken';
import {
  internalServerErrorResponse,
  badRequestResponse,
  checkAdminRoute,
} from '../helpers/errorHandlers';


export default class UserController {
  static model() {
    return new Model('users');
  }

  // Creates new user
  static async signUpUser(req, res) {
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
        .insert(
          'email, first_name, last_name, password, is_admin',
          `'${email}', '${firstName}', '${lastName}', '${hashPassword}', '${role}'`,
          'id, email, first_name, last_name, is_admin',
        );
      const { id, is_admin: isAdmin } = data[0];
      const token = generateJwtToken({ user_id: id, is_admin: isAdmin });
      return res.status(201).json({
        status: 'success',
        data: {
          user_id: id,
          is_admin: isAdmin,
          token,
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res);
    }
  }

  static async signInUser(req, res) {
    try {
      const {
        email,
        password,
      } = req.body;
      const data = await UserController.model().select('id, password, is_admin', `WHERE email='${email}'`);
      if (!data.length) return badRequestResponse(req, res, 'Invalid email');
      const { id, password: hashPassword, is_admin: isAdmin } = data[0];
      const validPassword = await bcrypt.compare(password, hashPassword);
      if (!validPassword) return badRequestResponse(req, res, 'Invalid password');
      const token = generateJwtToken({ user_id: id, is_admin: isAdmin });
      return res.status(201).json({
        status: 'success',
        data: {
          user_id: id,
          is_admin: isAdmin,
          token,
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res);
    }
  }
}
