const { Router } = require('express');
const gameController = require('../../controllers/gameController');
const { validateCreateGame, validateGuess } = require('../../middleware/validation');

const router = Router();

router.post('/game', validateCreateGame, gameController.createGame);
router.post('/game/:gameId/guess', validateGuess, gameController.makeGuess);
router.get('/game/:gameId', gameController.getGameState);
router.get('/leaderboard', gameController.getLeaderboard);
router.delete('/leaderboard', gameController.resetLeaderboard);

module.exports = router;
