import Model from '../models/Model';
import UserController from './users';
import {
  internalServerErrorResponse,
  nullResponse,
  badRequestResponse,
} from '../helpers/errorHandlers';
import changeIDKey from '../helpers/changeKeyID';


export default class BookingController {
  static model() {
    return new Model('booking');
  }

  static customModel(tables) {
    return new Model(tables);
  }

  // Creates new Booking
  static async createBooking(req, res) {
    try {
      const { trip_id: tripId } = req.body;
      const { userIdPayload } = req.user;
      const { busId, tripDate, seatNumber } = req.bookingData;

      // Getting the Current Timestamp
      const date = new Date();
      const createdOn = date.getTime();

      // Creates new booking and return booking data
      const bookingData = await BookingController.model()
        .insert(
          'trip_id, user_id, created_on, seat_number',
          `'${tripId}', '${userIdPayload}', to_timestamp('${createdOn}'), '${seatNumber}'`,
          'id, created_on',
        );
      const { id, created_on: bookingCreatedOn } = bookingData[0];

      // Gets users email, first_name and last_name
      const userData = await UserController.model()
        .select('email, first_name, last_name', `WHERE id='${userIdPayload}'`);
      const { email, first_name: firstName, last_name: lastName } = userData[0];

      return res.status(201).json({
        status: 'success',
        data: {
          booking_id: id,
          user_id: userIdPayload,
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

  static async getBookings(req, res) {
    try {
      const { userIdPayload, isAdminPayload } = req.user;

      let bookingData;

      if (!isAdminPayload) {
        bookingData = await BookingController.customModel('booking, trip, users').select(
          'booking.id, booking.user_id, booking.trip_id, trip.bus_id, trip.trip_date, booking.seat_number, users.first_name, users.last_name, users.email, booking.created_on',
          `WHERE booking.user_id = users.id and booking.trip_id = trip.id and users.id = ${userIdPayload}
          order by 1,2          
          `,
        );
        if (!bookingData.length) return nullResponse(req, res, 'No Booking found.');
      } else {
        bookingData = await BookingController.customModel('booking, trip, users').select(
          'booking.id, booking.user_id, booking.trip_id, trip.bus_id, trip.trip_date, booking.seat_number, users.first_name, users.last_name, users.email, booking.created_on',
          `WHERE booking.user_id = users.id and booking.trip_id = trip.id
          order by 1,2          
          `,
        );
        if (!bookingData.length) return nullResponse(req, res, 'No Booking found.');
      }
      // Change booking id key to booking_id
      const newBookingData = changeIDKey('booking_id', bookingData);

      return res.json({
        status: 'success',
        data: newBookingData,
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }

  static async updateBooking(req, res) {
    try {
      const { userIdPayload } = req.user;
      const { seat_number: seatNumber } = req.body;
      const { bookingId } = req.params;
      const updateData = await BookingController.model()
        .update('seat_number', seatNumber, `WHERE id=${bookingId} AND user_id=${userIdPayload}`, '*');
      if (!updateData.length) return badRequestResponse(req, res, 'Seat number Already chosen.');

      return res.status(202).json({
        status: 'success',
        data: {
          message: 'Seat number changed successfully',
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }

  static async deleteBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { userIdPayload } = req.user;
      const deleteData = await BookingController.model()
        .delete(`WHERE id=${bookingId} AND user_id=${userIdPayload}`);
      if (!deleteData.length) return badRequestResponse(req, res, 'No Booking found to delete.');

      return res.status(202).json({
        status: 'success',
        data: {
          message: 'Booking deleted successfully',
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }
}
