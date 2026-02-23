const Joi = require('joi');
const { ValidationError } = require('../errors/AppError');
const config = require('../config');

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

/**
 * Build the create-game schema lazily so the WordRepository is fully
 * loaded before we read its category list (avoids circular requires).
 */
let _createGameSchema = null;
function getCreateGameSchema() {
  if (!_createGameSchema) {
    const wordRepo = require('../data/WordRepository');
    const categoryIds = wordRepo.getCategoryIds();

    _createGameSchema = Joi.object({
      playerCount: Joi.number().integer().min(1).max(config.game.maxPlayers).default(1),
      difficulty: Joi.string().valid(...config.game.difficulties).default('average'),
      category: Joi.string().valid(...categoryIds).default('animals'),
      players: Joi.array()
        .items(Joi.string().trim().min(1).max(20))
        .min(1)
        .max(config.game.maxPlayers)
        .optional(),
    });
  }
  return _createGameSchema;
}

function validate(schemaOrGetter) {
  return (req, _res, next) => {
    const schema = typeof schemaOrGetter === 'function' ? schemaOrGetter() : schemaOrGetter;

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
  validateCreateGame: validate(getCreateGameSchema),
  validateGuess: validate(guessSchema),
};
