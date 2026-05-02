const errorHandler = (err, req, res, next) => {
  const errorName = err.name;
  console.log(err);

  switch (errorName) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: err.errors[0].message });
      break;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      break;
    case "BadRequest":
      res.status(400).json({ message: err.message });
      break;
    case "NotFound":
      res.status(404).json({ message: err.message });
      break;
    case "Unauthorized":
      res.status(401).json({ message: err.message });
      break;
    case "Forbidden":
      res.status(403).json({ message: err.message });
      break;
    case "TooManyRequests":
      res.status(429).json({ message: err.message });
      break;
    default:
      res.status(500).json({ message: "Internal server error" });
      break;
  }
};

module.exports = errorHandler;
