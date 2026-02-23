class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class GameOverError extends AppError {
  constructor(message = 'Game is already finished') {
    super(message, 400, 'GAME_OVER');
  }
}

class DuplicateGuessError extends AppError {
  constructor(letter) {
    super(`Letter "${letter}" has already been guessed`, 400, 'DUPLICATE_GUESS');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  GameOverError,
  DuplicateGuessError,
};
