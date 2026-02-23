const logger = require('../utils/logger');
const { AppError } = require('../errors/AppError');

function createErrorResponse(statusCode, errorCode, message, details = null) {
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };
  if (details) {
    response.error.details = details;
  }
  return response;
}

function errorHandler(err, req, res, _next) {
  logger.error('ErrorHandler', `${err.name}: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      createErrorResponse(err.statusCode, err.errorCode, err.message, err.details)
    );
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(
      createErrorResponse(400, 'PARSE_ERROR', 'Invalid JSON in request body')
    );
  }

  const statusCode = 500;
  return res.status(statusCode).json(
    createErrorResponse(statusCode, 'INTERNAL_ERROR', 'An unexpected error occurred')
  );
}

module.exports = errorHandler;
