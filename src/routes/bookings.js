import BookingController from '../controllers/bookings';
import BookingMiddleware from '../middlewares/bookings';
import AuthMiddleware from '../middlewares/auth';

export default (router) => {
  router.post(
    '/bookings',
    AuthMiddleware.auth,
    BookingMiddleware.validateBooking,
    BookingController.createBooking,
  );
  return router;
};
