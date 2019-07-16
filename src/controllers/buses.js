const Model = require('../models/Model');

class BusController {
  static model() {
    return new Model('bus');
  }
}

module.exports = BusController;
