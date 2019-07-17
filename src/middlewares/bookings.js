import TripController from '../controllers/trips';
import BusController from '../controllers/buses';
import BookingController from '../controllers/bookings';
import {
  internalServerErrorResponse,
  badRequestResponse,
} from '../helpers/errorHandlers';
import generateSeatNumber from '../helpers/generateSeatNumber';

export default class BookingMiddleware {
  static async validateBooking(req, res, next) {
    try {
      const { trip_id: tripId } = req.body;
      let { seat_number: seatNumber } = req.body;

      // Get trip data with trip_id if trip has been created
      const tripData = await TripController.model()
        .select('bus_id, trip_date', `WHERE id='${tripId}'`);
      if (!tripData.length) return badRequestResponse(req, res, 'Trip not created.');
      const { bus_id: busId, trip_date: tripDate } = tripData[0];

      // Check for bus capacity
      const busData = await BusController.model()
        .select('capacity', `WHERE id='${busId}'`);
      const { capacity } = busData[0];

      // Get booking seat numbers already taken
      const bookingSeat = await BookingController.model()
        .select('seat_number', `WHERE trip_id='${tripId}'`);

      // if seat_number was passed to req body
      if (seatNumber) {
        if (!Number.isInteger(seatNumber)) return badRequestResponse(req, res, 'Invalid seat number. Must be an Integer.');
        if (seatNumber <= 0 || seatNumber > capacity) return badRequestResponse(req, res, 'Invalid seat number.');
        // Check if seat_number is already taken
        if (bookingSeat.length) {
          const findBookingSeat = bookingSeat.find(s => s.seat_number === seatNumber);
          if (findBookingSeat) return badRequestResponse(req, res, 'Seat is Already booked.');
        }
      }

      // If seat_number was not passed to req body
      if (!seatNumber) {
        // Grenerate seat_number that has not been booked
        const bookedSeatList = bookingSeat.map(i => i.seat_number);
        seatNumber = generateSeatNumber(bookedSeatList, capacity);
        req.bookingData = { busId, tripDate, seatNumber };
        if (!seatNumber) return badRequestResponse(req, res, 'All Seat have been booked for this trip.');
      }
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
      // Get booking seat numbers already taken
      const bookingSeat = await BookingController.model()
        .select('seat_number', `WHERE id=${bookingId}`);
      if (!bookingSeat.length) return badRequestResponse(req, res, 'Booking not found.');
      const findBookingSeat = bookingSeat.find(s => s.seat_number === seatNumber);
      if (findBookingSeat) return badRequestResponse(req, res, 'Seat is Already booked.');
      return next();
    } catch (ex) {
      return internalServerErrorResponse(req, res, ex.message);
    }
  }
}
