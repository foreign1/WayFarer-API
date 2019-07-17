module.exports = {
  internalServerErrorResponse: (req, res, error) => res.status(500)
    .json({
      status: 'error',
      error: error || 'Internal server error occured',
    }),

  nullResponse: (req, res, error) => res.status(404)
    .json({
      status: 'error',
      error: error || '404 Not found',
    }),

  badRequestResponse: (req, res, error) => res.status(400)
    .json({
      status: 'error',
      error: error || 'Bad request',
    }),

  unauthorizedRequestResponse: (req, res, error) => res.status(401)
    .json({
      status: 'error',
      error: error || 'Unauthorized',
    }),

  forbiddenRequestResponse: (req, res, error) => res.status(403)
    .json({
      status: 'error',
      error: error || 'Forbidden',
    }),


  checkAdminRoute: (path) => {
    const pattern = /\/admin\/auth\/(signin|signup)/i;
    if (pattern.test(path)) {
      return true;
    }
    return false;
  },
};
