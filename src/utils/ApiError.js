class ApiError extends Error {
  constructor(status, errorCode, message, errors = undefined) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
module.exports = ApiError;
