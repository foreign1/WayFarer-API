export const internalServerErrorResponse = (req, res, error) => res.status(500)
  .json({
    status: 'error',
    error: error || 'Internal server error occured',
  });

export const nullResponse = (req, res, error) => res.status(404)
  .json({
    status: 'error',
    error: error || '404 Not found',
  });

export const badRequestResponse = (req, res, error) => res.status(400)
  .json({
    status: 'error',
    error: error || 'Bad request',
  });

export const unauthorizedRequestResponse = (req, res, error) => res.status(401)
  .json({
    status: 'error',
    error: error || 'Unauthorized',
  });

export const forbiddenRequestResponse = (req, res, error) => res.status(403)
  .json({
    status: 'error',
    error: error || 'Forbidden',
  });


export const checkAdminRoute = (path) => {
  const pattern = /\/admin\/auth\/(signin|signup)/i;
  if (pattern.test(path)) {
    return true;
  }
  return false;
};
