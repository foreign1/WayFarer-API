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
  router.get(
    '/bookings',
    AuthMiddleware.auth,
    BookingController.getBookings,
  );
  return router;
};
