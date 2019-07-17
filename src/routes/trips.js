const TripController = require('../controllers/trips');
const TripMiddleware = require('../middlewares/trips');

module.exports = (router) => {
  router.post(
    '/trips',
    TripMiddleware.auth,
    TripMiddleware.admin,
    TripController.createTrip,
  );
  router.get(
    '/trips',
    TripMiddleware.auth,
    TripController.getTrips,
  );
  return router;
};
