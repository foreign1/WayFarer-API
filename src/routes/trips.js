const TripController = require('../controllers/trips');
const TripMiddleware = require('../middlewares/trips');

module.exports = (router) => {
  router.post('/trip', TripMiddleware.auth, TripMiddleware.admin, TripController.createTrip);
  return router;
};
