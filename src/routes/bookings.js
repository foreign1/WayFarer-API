const BookingController = require('../controllers/bookings');
const BookingMiddleware = require('../middlewares/bookings');
const AuthMiddleware = require('../middlewares/auth');

module.exports = (router) => {
  router.post(
    '/bookings',
    AuthMiddleware.auth,
    BookingMiddleware.validateBooking,
    BookingController.createBooking,
  );
  return router;
};
