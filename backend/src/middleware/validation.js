const Joi = require('joi');
const { ValidationError } = require('../errors/AppError');
const config = require('../config');

const createGameSchema = Joi.object({
  playerCount: Joi.number().integer().min(1).max(config.game.maxPlayers).default(1),
  difficulty: Joi.string().valid(...config.game.difficulties).default('average'),
  category: Joi.string().valid(...config.game.categories).default('animals'),
  players: Joi.array()
    .items(Joi.string().trim().min(1).max(20))
    .min(1)
    .max(config.game.maxPlayers)
    .optional(),
});

const guessSchema = Joi.object({
  guess: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .pattern(/^[a-zA-Z]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Guess must contain only letters',
      'string.empty': 'Guess is required',
      'any.required': 'Guess is required',
    }),
  playerId: Joi.string().trim().optional(),
});

function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      throw new ValidationError('Invalid request data', details);
    }

    req.body = value;
    next();
  };
}

module.exports = {
  validateCreateGame: validate(createGameSchema),
  validateGuess: validate(guessSchema),
};
