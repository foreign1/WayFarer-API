module.exports = {
  internalServerErrorResponse: (req, res, message) => res.status(500)
    .json({
      message: message || 'Internal server error occured',
      status: 'INTERNAL_SERVER_ERROR',
    }),

  nullResponse: (req, res, message) => res.status(404)
    .json({
      message: message || 'Not found',
      status: '404_ERROR',
    }),

  badRequestResponse: (req, res, message) => res.status(400)
    .json({
      message: message || 'Bad request',
      status: 'BAD_REQUEST',
    }),

  checkAdminRoute: (path) => {
    const pattern = /\/admin\/auth\/(signin|signup)/i;
    if (pattern.test(path)) {
      return true;
    }
    return false;
  },
};
