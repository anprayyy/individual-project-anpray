const errorHandler = (err, req, res, next) => {
  const errorName = err.name;
  console.error(
    `[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}`,
  );
  console.error(err);

  const includeStack = process.env.NODE_ENV !== "production";
  const payload = (message) =>
    includeStack ? { message, stack: err.stack || String(err) } : { message };

  switch (errorName) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      res.status(400).json(payload(err.errors[0].message));
      break;
    case "JsonWebTokenError":
      res.status(401).json(payload("Invalid token"));
      break;
    case "BadRequest":
      res.status(400).json(payload(err.message));
      break;
    case "NotFound":
      res.status(404).json(payload(err.message));
      break;
    case "Unauthorized":
      res.status(401).json(payload(err.message));
      break;
    case "Forbidden":
      res.status(403).json(payload(err.message));
      break;
    case "TooManyRequests":
      res.status(429).json(payload(err.message));
      break;
    default:
      res.status(500).json(payload("Internal server error"));
      break;
  }
};

module.exports = errorHandler;
