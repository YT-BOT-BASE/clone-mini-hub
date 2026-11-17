function notFound(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  // Never leak stack traces / secrets in production
  if (process.env.NODE_ENV !== 'production') console.error(err);
  else console.error(`[${new Date().toISOString()}] ${code} ${err.message}`);
  res.status(status).json({
    success: false,
    error: { code, message: status === 500 ? 'Something went wrong. Please try again later.' : err.message },
  });
}

module.exports = { notFound, errorHandler };
