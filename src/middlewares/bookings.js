import TripController from '../controllers/trips';
import BusController from '../controllers/buses';
import BookingController from '../controllers/bookings';
import {
  internalServerErrorResponse,
  badRequestResponse,
} from '../helpers/errorHandlers';
import generateSeatNumber from '../helpers/generateSeatNumber';
import getQuery from '../helpers/getByQuery';

export default class BookingMiddleware {
  static async validateBooking(req, res, next) {
    try {
      const { trip_id: tripId } = req.body;
      let { seat_number: seatNumber } = req.body;

      if (!Number.isInteger(tripId)) return badRequestResponse(req, res, 'Invalid trip id. Must be an Integer.');

      // Get trip data with trip_id if trip has been created
      const tripData = await getQuery('id', tripId, TripController, 'bus_id, trip_date');
      if (!tripData.length) return badRequestResponse(req, res, 'Trip not created.');
      const { bus_id: busId, trip_date: tripDate } = tripData[0];

      // Get for bus capacity
      const busData = await getQuery('id', busId, BusController, 'capacity');
      const { capacity } = busData[0];

      // Get booking seat numbers already taken
      const bookingSeat = await getQuery('trip_id', tripId, BookingController, 'seat_number');

      // if seat_number was passed to req body, check if seat_number is already taken
      if (seatNumber && !Number.isInteger(seatNumber)) return badRequestResponse(req, res, 'Invalid seat number. Must be an Integer.');
      if (seatNumber && (seatNumber <= 0 || seatNumber > capacity)) return badRequestResponse(req, res, 'Invalid seat number.');
      if (bookingSeat
        .find(s => s.seat_number === seatNumber)) return badRequestResponse(req, res, 'Seat is Already booked.');
      if (!seatNumber) {
        seatNumber = generateSeatNumber(bookingSeat, capacity);
      }
      if (!seatNumber) return badRequestResponse(req, res, 'All Seat have been booked for this trip.');
      req.bookingData = { busId, tripDate, seatNumber };

      return next();
    } catch (ex) {
      return internalServerErrorResponse(req, res, ex.message);
    }
  }

  static async validateSeatNumber(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { seat_number: seatNumber } = req.body;
      if (!seatNumber || !Number.isInteger(seatNumber)) return badRequestResponse(req, res, 'Invalid seat number. Must be an Integer.');
      if (!Number.isInteger(parseInt(bookingId, 10))) return badRequestResponse(req, res, 'Invalid booking Id. Must be an Integer.');
      // Get booking seat numbers
      const bookingSeat = await getQuery('id', bookingId, BookingController, 'seat_number');
      if (!bookingSeat.length) return badRequestResponse(req, res, 'Booking not found.');
      if (bookingSeat.find(s => s.seat_number === seatNumber)) return badRequestResponse(req, res, 'Seat is Already booked.');
      return next();
    } catch (ex) {
      return internalServerErrorResponse(req, res, ex.message);
    }
  }
}
