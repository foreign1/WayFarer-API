const UserController = require('../controllers/users');
const UserMiddleware = require('../middlewares/users');

module.exports = (router) => {
  router.post('/auth/signup', UserMiddleware.validateUser, UserController.addUser);
  router.post('/admin/auth/signup', UserMiddleware.validateUser, UserController.addUser);
  router.delete('/auth/signup', UserController.deleteUser);
  return router;
};
