const Model = require('../models/trip');
const UserController = require('./users');

const {
  internalServerErrorResponse,
  badRequestResponse,
} = require('../helpers/errorHandler');

class TripController {
  static model() {
    return new Model('trip');
  }

  // Creates new trip
  static async createTrip(req, res) {
    try {
      const {
        user_id: userId,
        bus_id: busId,
        origin,
        destination,
        trip_date: tripDate,
        fare,
      } = req.body;

      Date.parse(tripDate); // "2019-12-12" => "2019-12-11T23:00:00.000Z"

      // Search model to check if user is already registered
      const user = await UserController.model().select('id', `WHERE id='${userId}'`);

      if (!user.length) return badRequestResponse(req, res, 'User not registered');
      // Creates new user and return user data
      const data = await TripController.model()
        .insert('bus_id, origin, destination, trip_date, fare', `'${busId}', '${origin}', '${destination}', '${tripDate}', '${fare}'`);

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
      return internalServerErrorResponse(req, res, e.message);
    }
  }

  static async deleteTrip(req, res) {
    try {
      const { trip_id: tripId } = req.body;
      await TripController.model()
        .delete('id', tripId);
      return res.status(202).json({
        status: 'success',
        message: 'Trip was deleted successfully',
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }
}

module.exports = TripController;
