import TripController from '../controllers/trips';
import AuthMiddleware from '../middlewares/auth';

export default (router) => {
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
  router.get(
    '/trips/?destination=destination',
    AuthMiddleware.auth,
    TripController.getTrips,
  );
  router.patch(
    '/trips/:tripId',
    AuthMiddleware.auth,
    AuthMiddleware.admin,
    TripController.updateTrip,
  );
  return router;
};
