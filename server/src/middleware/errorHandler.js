// Catches errors thrown/passed via next(err) from anywhere in the app
// and returns a consistent JSON error shape instead of Express's
// default HTML error page.
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const body = { error: err.message || "Internal server error" };
  if (err.code) body.code = err.code;
  if (err.current) body.current = err.current;
  if (status === 500) console.error(err);
  res.status(status).json(body);
}