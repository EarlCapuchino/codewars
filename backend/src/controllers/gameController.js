const gameService = require('../services/gameService');
const wordRepo = require('../data/WordRepository');
const logger = require('../utils/logger');

const CTX = 'GameController';

function createSuccessResponse(data) {
  return { success: true, data };
}

async function createGame(req, res, next) {
  try {
    logger.debug(CTX, 'Creating new game', req.body);
    const game = await gameService.createGame(req.body);
    res.status(201).json(createSuccessResponse(game));
  } catch (err) {
    next(err);
  }
}

function makeGuess(req, res, next) {
  try {
    const { gameId } = req.params;
    const { guess, playerId } = req.body;
    logger.debug(CTX, `Guess on game ${gameId}`, { guess, playerId });
    const result = gameService.makeGuess(gameId, guess, playerId);
    res.status(200).json(createSuccessResponse(result));
  } catch (err) {
    next(err);
  }
}

function getGameState(req, res, next) {
  try {
    const { gameId } = req.params;
    const game = gameService.getGameState(gameId);
    res.status(200).json(createSuccessResponse(game));
  } catch (err) {
    next(err);
  }
}

function getLeaderboard(_req, res, next) {
  try {
    const data = gameService.getLeaderboard();
    res.status(200).json(createSuccessResponse(data));
  } catch (err) {
    next(err);
  }
}

function resetLeaderboard(_req, res, next) {
  try {
    gameService.resetLeaderboard();
    res.status(200).json(createSuccessResponse({ message: 'Leaderboard reset' }));
  } catch (err) {
    next(err);
  }
}

function getCategories(_req, res, next) {
  try {
    const data = wordRepo.getCategoryList();
    res.status(200).json(createSuccessResponse(data));
  } catch (err) {
    next(err);
  }
}

function createAiGame(req, res, next) {
  try {
    logger.debug(CTX, 'Creating AI opponent game', req.body);
    const game = gameService.createAiGame(req.body);
    res.status(201).json(createSuccessResponse(game));
  } catch (err) {
    next(err);
  }
}

function aiGuess(req, res, next) {
  try {
    const { gameId } = req.params;
    logger.debug(CTX, `AI guess on game ${gameId}`);
    const result = gameService.makeAiGuess(gameId);
    res.status(200).json(createSuccessResponse(result));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGame,
  makeGuess,
  getGameState,
  getLeaderboard,
  resetLeaderboard,
  getCategories,
  createAiGame,
  aiGuess,
};
