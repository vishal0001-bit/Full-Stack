export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  if (error.name === "MulterError") {
    return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Images must be 5 MB or smaller" : "Choose one image to upload" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(", ") });
  }
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid resource identifier" });
  if (error.code === 11000) return res.status(409).json({ message: "An account with that email already exists" });
  res.status(error.status || 500).json({ message: error.message || "Something went wrong" });
}
