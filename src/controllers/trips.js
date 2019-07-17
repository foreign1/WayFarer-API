const Model = require('../models/trip');

const {
  internalServerErrorResponse,
  nullResponse,
} = require('../helpers/errorHandler');

class TripController {
  static model() {
    return new Model('trip');
  }

  // Creates new trip
  static async createTrip(req, res) {
    try {
      const {
        // user_id: userId,
        bus_id: busId,
        origin,
        destination,
        trip_date: tripDate,
        fare,
      } = req.body;

      Date.parse(tripDate); // "2019-12-12" => "2019-12-11T23:00:00.000Z"

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

  // Get all trips
  static async getTrips(req, res) {
    try {
      const data = await TripController.model().select('*');
      if (!data.length) nullResponse(req, res);

      // Change id key to trip_id
      const changeIDKey = (d) => {
        const { id, ...rest } = d;
        return {
          trip_id: id,
          ...rest,
        };
      };
      const newData = data.map(changeIDKey);

      return res.status(200).json({
        status: 'success',
        data: newData,
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
        success: 'Trip was deleted successfully',
      });
    } catch (e) {
      return internalServerErrorResponse(req, res, e.message);
    }
  }
}

module.exports = TripController;
