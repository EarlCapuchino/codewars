const { Game, Status } = require('../models/Game');
const wordService = require('./wordService');
const aiPlayerService = require('./aiPlayerService');
const logger = require('../utils/logger');
const {
  NotFoundError,
  GameOverError,
  DuplicateGuessError,
  ValidationError,
} = require('../errors/AppError');

const CTX = 'GameService';

/** In-memory game store */
const games = new Map();

/** Tracks which games are AI-opponent games */
const aiGameIds = new Set();

/** In-memory leaderboard: Map<playerName, { wins, losses, totalScore, gamesPlayed }> */
const leaderboard = new Map();

function getGame(gameId) {
  const game = games.get(gameId);
  if (!game) {
    throw new NotFoundError('Game');
  }
  return game;
}

async function createGame({ playerCount = 1, difficulty = 'average', category = 'animals', players }) {
  const playerNames = players && players.length > 0
    ? players.slice(0, playerCount)
    : Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);

  if (playerNames.length < playerCount) {
    while (playerNames.length < playerCount) {
      playerNames.push(`Player ${playerNames.length + 1}`);
    }
  }

  const word = await wordService.getWord(category, difficulty, playerCount);

  const game = new Game({ word, playerNames, difficulty, category });
  games.set(game.id, game);

  logger.info(CTX, `Game created: ${game.id}`, {
    word: game.word,
    difficulty,
    category,
    playerCount: game.players.length,
  });

  return game.toJSON();
}

function makeGuess(gameId, guess, playerId) {
  const game = getGame(gameId);

  if (game.status !== Status.IN_PROGRESS) {
    throw new GameOverError();
  }

  if (playerId) {
    const player = game.players.find((p) => p.id === playerId);
    if (!player) throw new ValidationError('Invalid player ID');
    if (player.eliminated) throw new ValidationError('This player has been eliminated');
    if (player.id !== game.currentPlayer.id) {
      throw new ValidationError(`It is not this player's turn. Current turn: ${game.currentPlayer.name}`);
    }
  }

  const sanitized = guess.toLowerCase().trim();
  let result;

  if (sanitized.length === 1) {
    if (game.guessedLetters.has(sanitized)) {
      throw new DuplicateGuessError(sanitized);
    }
    result = game.guessLetter(sanitized);
    logger.info(CTX, `Letter guess: "${sanitized}" → ${result.correct ? 'correct' : 'incorrect'}`, { gameId });
  } else {
    result = game.guessWord(sanitized);
    logger.info(CTX, `Word guess: "${sanitized}" → ${result.correct ? 'correct' : 'incorrect'}`, { gameId });
  }

  if (game.status !== Status.IN_PROGRESS) {
    updateLeaderboard(game);
  }

  return {
    ...game.toJSON(),
    guessResult: {
      guess: sanitized,
      correct: result.correct,
      alreadyGuessed: result.alreadyGuessed || false,
    },
  };
}

function getGameState(gameId) {
  return getGame(gameId).toJSON();
}

function updateLeaderboard(game) {
  game.players.forEach((player) => {
    const entry = leaderboard.get(player.name) || {
      playerName: player.name,
      wins: 0,
      losses: 0,
      totalScore: 0,
      gamesPlayed: 0,
    };

    entry.gamesPlayed += 1;

    if (game.status === Status.WON && game.winner && game.winner.id === player.id) {
      entry.wins += 1;
      entry.totalScore += player.remainingAttempts;
    } else if (game.status === Status.LOST || (game.status === Status.WON && (!game.winner || game.winner.id !== player.id))) {
      entry.losses += 1;
    }

    leaderboard.set(player.name, entry);
  });

  logger.debug(CTX, 'Leaderboard updated', [...leaderboard.values()]);
}

function getLeaderboard() {
  return [...leaderboard.values()]
    .sort((a, b) => b.wins - a.wins || b.totalScore - a.totalScore)
    .slice(0, 50);
}

function resetLeaderboard() {
  leaderboard.clear();
  logger.info(CTX, 'Leaderboard reset');
}

function createAiGame({ word, category }) {
  const sanitizedWord = word.toLowerCase().trim();

  const game = new Game({
    word: sanitizedWord,
    playerNames: ['AI Opponent'],
    difficulty: 'average',
    category: category || 'all',
  });

  games.set(game.id, game);
  aiGameIds.add(game.id);

  logger.info(CTX, `AI game created: ${game.id}`, {
    wordLength: sanitizedWord.length,
    category: game.category,
  });

  const json = game.toJSON();
  json.word = game.word;
  json.isAiGame = true;
  return json;
}

function makeAiGuess(gameId) {
  const game = getGame(gameId);

  if (!aiGameIds.has(gameId)) {
    throw new ValidationError('Not an AI opponent game');
  }

  if (game.status !== Status.IN_PROGRESS) {
    throw new GameOverError();
  }

  const aiMove = aiPlayerService.getAiGuess({
    maskedWord: game.maskedWord,
    guessedLetters: [...game.guessedLetters],
    category: game.category,
    failedWordGuesses: [...game.failedWordGuesses],
  });

  logger.info(CTX, `AI move: "${aiMove.guess}" (${aiMove.strategy}, ${aiMove.candidatesRemaining} candidates)`, { gameId });

  const result = makeGuess(gameId, aiMove.guess, game.currentPlayer.id);
  result.aiMove = aiMove;
  result.word = game.word;
  result.isAiGame = true;

  return result;
}

module.exports = {
  createGame,
  makeGuess,
  getGameState,
  getLeaderboard,
  resetLeaderboard,
  createAiGame,
  makeAiGuess,
};
