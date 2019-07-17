import Model from '../models/Model';
import {
  internalServerErrorResponse,
  nullResponse,
  badRequestResponse,
} from '../helpers/errorHandlers';
import changeIDKey from '../helpers/changeKeyID';
import getTripsByDestination from '../helpers/getByQuery';

export default class TripController {
  static model() {
    return new Model('trip');
  }

  // Creates new trip
  static async createTrip(req, res) {
    try {
      const {
        bus_id: busId,
        origin,
        destination,
        trip_date: tripDate,
        fare,
      } = req.body;

      const newBusId = busId || 1;
      const newOrigin = origin || 'Lagos';
      const newDestination = destination || 'Abuja';
      const newTripDate = tripDate || '2019-12-12';
      const newFare = fare || '100000';

      Date.parse(newTripDate); // "2019-12-12" => "2019-12-11T23:00:00.000Z"

      // Creates new user and return user data
      const data = await TripController.model()
        .insert(
          'bus_id, origin, destination, trip_date, fare',
          `'${newBusId}', '${newOrigin}', '${newDestination}', '${newTripDate}', '${newFare}'`,
          'id, bus_id, origin, destination, trip_date, fare, status',
        );

      const {
        id,
        ...resData
      } = data[0];

      return res.status(201).json({
        status: 'success',
        data: {
          trip_id: id,
          ...resData,
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res);
    }
  }

  // Get all trips
  static async getTrips(req, res) {
    try {
      let tripData;
      const { destination, origin } = req.query;
      if (origin) tripData = await getTripsByDestination('origin', origin, TripController);
      if (destination) tripData = await getTripsByDestination('destination', destination, TripController);
      if (!origin && !destination) tripData = await TripController.model().select('*');
      if (!tripData.length) return nullResponse(req, res, 'No Trip found.');

      // Change trip id key to trip_id
      const newTripData = changeIDKey('trip_id', tripData);

      return res.json({
        status: 'success',
        data: newTripData,
      });
    } catch (e) {
      return internalServerErrorResponse(req, res);
    }
  }

  static async updateTrip(req, res) {
    try {
      const { tripId } = req.params;
      if (!Number.isInteger(parseInt(tripId, 10))) return badRequestResponse(req, res, 'Invalid trip Id. Must be an Integer.');
      const tripData = await TripController.model()
        .update('status', "'cancelled'", `WHERE id=${tripId}`, '*');
      if (!tripData.length) return badRequestResponse(req, res, 'No trip found to cancelled.');

      return res.status(202).json({
        status: 'success',
        data: {
          message: 'Trip cancelled successfully',
        },
      });
    } catch (e) {
      return internalServerErrorResponse(req, res);
    }
  }
}
