class ApiError extends Error {
  constructor(status = 500, message = 'Internal server error', details) {
    super(message);
    this.status = status;
    if (details) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
