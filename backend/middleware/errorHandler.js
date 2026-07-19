function errorHandler(error, _req, res, _next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "An unexpected server error occurred"
        : error.message,
    ...(process.env.NODE_ENV !== "production" && {
      details: error.message,
    }),
  });
}

module.exports = errorHandler;