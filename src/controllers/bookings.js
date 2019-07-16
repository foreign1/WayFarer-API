const Model = require('../models/Model');
const UserController = require('../controllers/users');
const {
  internalServerErrorResponse,
} = require('../helpers/errorHandler');


class BookingController {
  static model() {
    return new Model('booking');
  }

  // Creates new Booking
  static async createBooking(req, res) {
    try {
      const {
        user_id: userId,
        trip_id: tripId,
      } = req.body;

      const { busId, tripDate, seatNumber } = req.bookingData;

      // Getting the Current Timestamp
      const date = new Date();
      const createdOn = date.getTime();

      // Creates new booking and return booking data
      const bookingData = await BookingController.model()
        .insert(
          'trip_id, user_id, created_on, seat_number',
          `'${tripId}', '${userId}', to_timestamp('${createdOn}'), '${seatNumber}'`,
          'id, created_on',
        );
      const { id, created_on: bookingCreatedOn } = bookingData[0];

      // Gets users email, first_name and last_name
      const userData = await UserController.model()
        .select('email, first_name, last_name', `WHERE id='${userId}'`);
      const { email, first_name: firstName, last_name: lastName } = userData[0];

      return res.status(201).json({
        status: 'success',
        data: {
          booking_id: id,
          user_id: userId,
          trip_id: tripId,
          bus_id: busId,
          trip_date: tripDate,
          seat_number: seatNumber,
          first_name: firstName,
          last_name: lastName,
          email,
          created_on: bookingCreatedOn,
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }
}

module.exports = BookingController;
