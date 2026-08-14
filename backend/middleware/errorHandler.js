function errorHandler(
  error,
  req,
  res,
  next,
) {
  console.error(
    `[${req.method}] ${req.originalUrl}`,
    error,
  );

  const status =
    Number.isInteger(
      error.status,
    )
      ? error.status
      : 500;

  if (status >= 500) {
    return res
      .status(status)
      .json({
        error:
          "Internal server error",
      });
  }

  return res
    .status(status)
    .json({
      error:
        error.message ||
        "Request failed",
    });
}

module.exports =
  errorHandler;