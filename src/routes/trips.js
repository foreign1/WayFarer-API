const TripController = require('../controllers/trips');
const AuthMiddleware = require('../middlewares/auth');

module.exports = (router) => {
  router.post(
    '/trips',
    AuthMiddleware.auth,
    AuthMiddleware.admin,
    TripController.createTrip,
  );
  router.get(
    '/trips',
    AuthMiddleware.auth,
    TripController.getTrips,
  );
  return router;
};
