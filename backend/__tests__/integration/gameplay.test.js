const request = require('supertest');
const app = require('../../src/app');

/**
 * End-to-end gameplay flow tests.
 * These simulate real user sessions through the API to verify
 * the game works correctly from start to finish.
 */
describe('Full Gameplay Flows', () => {
  beforeEach(async () => {
    await request(app).delete('/api/v1/leaderboard');
  });

  describe('Human player: single player wins by guessing letters', () => {
    it('completes a full game by guessing every letter', async () => {
      const create = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 1, difficulty: 'easy', category: 'animals', players: ['Hero'] });

      expect(create.status).toBe(201);
      const { id: gameId, players } = create.body.data;
      const playerId = players[0].id;

      const alphabet = 'etaoinsrhldcumfpgwybvkxjqz';
      let gameStatus = 'IN_PROGRESS';

      for (const letter of alphabet) {
        if (gameStatus !== 'IN_PROGRESS') break;

        const res = await request(app)
          .post(`/api/v1/game/${gameId}/guess`)
          .send({ guess: letter, playerId });

        if (res.status === 400 && res.body.error?.code === 'DUPLICATE_GUESS') continue;
        if (res.status === 400 && res.body.error?.code === 'GAME_OVER') break;

        expect(res.status).toBe(200);
        gameStatus = res.body.data.status;
      }

      expect(['WON', 'LOST']).toContain(gameStatus);

      const final = await request(app).get(`/api/v1/game/${gameId}`);
      expect(final.body.data.status).toBe(gameStatus);
    });
  });

  describe('Human player: wins by guessing the whole word', () => {
    it('creates game then correctly guesses the full word', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger', category: 'animals' });

      const gameId = create.body.data.id;
      const playerId = create.body.data.players[0].id;

      const res = await request(app)
        .post(`/api/v1/game/${gameId}/guess`)
        .send({ guess: 'tiger', playerId });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('WON');
      expect(res.body.data.guessResult.correct).toBe(true);
    });
  });

  describe('Human player: loses after exhausting attempts', () => {
    it('depletes all 6 attempts with wrong guesses', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger' });

      const gameId = create.body.data.id;
      const playerId = create.body.data.players[0].id;

      const wrongLetters = ['z', 'x', 'q', 'j', 'v', 'w'];
      let gameStatus = 'IN_PROGRESS';

      for (const letter of wrongLetters) {
        const res = await request(app)
          .post(`/api/v1/game/${gameId}/guess`)
          .send({ guess: letter, playerId });

        if (res.status === 200) {
          gameStatus = res.body.data.status;
        }
      }

      expect(gameStatus).toBe('LOST');

      const final = await request(app).get(`/api/v1/game/${gameId}`);
      expect(final.body.data.status).toBe('LOST');
      expect(final.body.data.word).toBe('tiger');
    });
  });

  describe('Human player: cannot guess after game over', () => {
    it('returns GAME_OVER error for guess on finished game', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'cat' });

      const gameId = create.body.data.id;
      const playerId = create.body.data.players[0].id;

      await request(app)
        .post(`/api/v1/game/${gameId}/guess`)
        .send({ guess: 'cat', playerId });

      const res = await request(app)
        .post(`/api/v1/game/${gameId}/guess`)
        .send({ guess: 'a', playerId });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('GAME_OVER');
    });
  });

  describe('Multiplayer: turns alternate correctly', () => {
    it('switches turns between players on wrong guesses', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger' });

      const gameId = create.body.data.id;

      await request(app).delete('/api/v1/leaderboard');

      const mp = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 2, difficulty: 'average', category: 'animals', players: ['P1', 'P2'] });

      const mpId = mp.body.data.id;
      const p1Id = mp.body.data.players[0].id;
      const p2Id = mp.body.data.players[1].id;

      expect(mp.body.data.currentPlayer.name).toBe('P1');

      const r1 = await request(app)
        .post(`/api/v1/game/${mpId}/guess`)
        .send({ guess: 'z', playerId: p1Id });

      if (r1.status === 200 && !r1.body.data.guessResult.correct) {
        expect(r1.body.data.currentPlayer.name).toBe('P2');
      }
    });
  });

  describe('AI opponent: plays a full game to completion', () => {
    it('AI eventually wins or loses within 20 turns', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger', category: 'animals' });

      expect(create.status).toBe(201);
      const gameId = create.body.data.id;

      let status = 'IN_PROGRESS';
      let turns = 0;
      const strategies = new Set();

      while (status === 'IN_PROGRESS' && turns < 20) {
        const res = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        expect(res.status).toBe(200);

        status = res.body.data.status;
        strategies.add(res.body.data.aiMove.strategy);
        turns++;
      }

      expect(['WON', 'LOST']).toContain(status);
      expect(turns).toBeGreaterThan(0);
      expect(turns).toBeLessThanOrEqual(20);
    });

    it('AI finds a common dictionary word (cat)', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'cat', category: 'animals' });

      const gameId = create.body.data.id;
      let status = 'IN_PROGRESS';
      let turns = 0;

      while (status === 'IN_PROGRESS' && turns < 15) {
        const res = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        status = res.body.data.status;
        turns++;
      }

      expect(status).toBe('WON');
    });

    it('AI handles an out-of-dictionary word', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'zephyr' });

      const gameId = create.body.data.id;
      let status = 'IN_PROGRESS';
      let turns = 0;
      let usedConstruction = false;

      while (status === 'IN_PROGRESS' && turns < 20) {
        const res = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        status = res.body.data.status;
        if (res.body.data.aiMove.strategy === 'word_construction') {
          usedConstruction = true;
        }
        turns++;
      }

      expect(['WON', 'LOST']).toContain(status);
    });

    it('AI does not re-guess a failed full word', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'empathy' });

      const gameId = create.body.data.id;
      let status = 'IN_PROGRESS';
      let turns = 0;
      const fullWordGuesses = [];

      while (status === 'IN_PROGRESS' && turns < 20) {
        const res = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        status = res.body.data.status;

        const move = res.body.data.aiMove;
        if (move.guess.length > 1) {
          expect(fullWordGuesses).not.toContain(move.guess);
          fullWordGuesses.push(move.guess);
        }
        turns++;
      }
    });
  });

  describe('Leaderboard integration with gameplay', () => {
    it('records player stats after a completed game', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'cat', category: 'animals' });

      const gameId = create.body.data.id;
      let status = 'IN_PROGRESS';
      while (status === 'IN_PROGRESS') {
        const res = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        status = res.body.data.status;
      }

      const board = await request(app).get('/api/v1/leaderboard');
      expect(board.body.data.length).toBeGreaterThan(0);

      const entry = board.body.data.find((e) => e.playerName === 'AI Opponent');
      expect(entry).toBeDefined();
      expect(entry.wins + entry.losses).toBe(entry.gamesPlayed);
    });
  });

  describe('Error resilience', () => {
    it('returns proper 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
    });

    it('handles malformed JSON body gracefully', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .set('Content-Type', 'application/json')
        .send('{invalid json');

      expect(res.status).toBe(400);
    });
  });
});
