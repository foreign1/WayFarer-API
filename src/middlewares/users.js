import Joi from 'joi';
import { badRequestResponse } from '../helpers/errorHandler';

export default class UserMiddleware {
  static validateSignUpUser(req, res, next) {
    const schema = {
      email: Joi.string().min(5).max(255).required()
        .email(),
      first_name: Joi.string().min(3).max(50).required(),
      last_name: Joi.string().min(3).max(50).required(),
      password: Joi.string().min(5).max(255).required(),
    };
    const { error } = Joi.validate(req.body, schema);
    if (error) {
      const { message } = error.details[0];
      return badRequestResponse(req, res, message);
    }
    return next();
  }

  static validateSignInUser(req, res, next) {
    const schema = {
      email: Joi.string().min(5).max(255).required()
        .email(),
      password: Joi.string().min(5).max(255).required(),
    };
    const { error } = Joi.validate(req.body, schema);
    if (error) {
      const { message } = error.details[0];
      return badRequestResponse(req, res, message);
    }
    return next();
  }
}
