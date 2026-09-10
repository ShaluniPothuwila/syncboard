// Catches errors thrown/passed via next(err) from anywhere in the app
// and returns a consistent JSON error shape instead of Express's
// default HTML error page.
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
}

// Mongoose reports bad client input as thrown errors rather than by returning
// a status. Left unmapped these reach the generic branch below and surface as
// 500s, which makes ordinary bad input look like the server is broken and
// fills the logs with stack traces. Translate them into the 400s the API
// contract documents, with messages that describe the constraint instead of
// echoing back what the client sent.
function describeValidationError(err) {
  return Object.values(err.errors)
    .map((e) => {
      if (e.kind === "enum") {
        return `${e.path} must be one of: ${e.properties.enumValues.join(", ")}`;
      }
      if (e.kind === "maxlength") {
        return `${e.path} must be at most ${e.properties.maxlength} characters`;
      }
      if (e.kind === "required") {
        return `${e.path} is required`;
      }
      return e.message;
    })
    .join("; ");
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = describeValidationError(err);
  } else if (err.name === "CastError") {
    status = 400;
    const field = err.path === "_id" ? "id" : err.path;
    message = `${field} is not a valid ${err.kind === "ObjectId" ? "id" : err.kind}`;
  }

  const body = { error: message };
  if (err.code) body.code = err.code;
  if (err.current) body.current = err.current;

  // Only genuine server faults are worth a stack trace in the logs.
  if (status === 500) console.error(err);

  res.status(status).json(body);
}
