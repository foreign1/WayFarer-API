import UserController from '../controllers/users';
import UserMiddleware from '../middlewares/users';

export default (router) => {
  router.post('/auth/signup', UserMiddleware.validateSignUpUser, UserController.signUpUser);
  router.post('/admin/auth/signup', UserMiddleware.validateSignUpUser, UserController.signUpUser);
  router.post('/auth/signin', UserMiddleware.validateSignInUser, UserController.signInUser);
  return router;
};
