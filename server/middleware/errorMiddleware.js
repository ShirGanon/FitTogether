// Central Express error handler. Controllers should call next(err) on failure
// (or throw inside async wrappers) and this middleware turns the error into a
// safe JSON response. Uses err.status when set, otherwise 500.

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ error: message });
}

module.exports = errorMiddleware;
