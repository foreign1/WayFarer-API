const UserController = require('../controllers/users');
const UserMiddleware = require('../middlewares/users');

module.exports = (router) => {
  router.post('/auth/signup', UserMiddleware.validateSignUpUser, UserController.signUpUser);
  router.post('/admin/auth/signup', UserMiddleware.validateSignUpUser, UserController.signUpUser);
  router.post('/auth/signin', UserMiddleware.validateSignInUser, UserController.signInUser);
  return router;
};
