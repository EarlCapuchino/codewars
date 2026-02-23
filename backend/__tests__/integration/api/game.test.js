const request = require('supertest');
const app = require('../../../src/app');

describe('Game API', () => {
  let gameId;
  let playerId;

  describe('POST /api/v1/game', () => {
    it('creates a game and returns 201', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 1, difficulty: 'average', category: 'animals', players: ['Alice'] });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const game = res.body.data;
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('maskedWord');
      expect(game).toHaveProperty('status', 'IN_PROGRESS');
      expect(game).toHaveProperty('difficulty', 'average');
      expect(game).toHaveProperty('category', 'animals');
      expect(game.players).toHaveLength(1);
      expect(game.players[0].name).toBe('Alice');
      expect(game.guessedLetters).toEqual([]);

      gameId = game.id;
      playerId = game.players[0].id;
    });

    it('creates multiplayer game', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 3, difficulty: 'hard', category: 'countries', players: ['A', 'B', 'C'] });

      expect(res.status).toBe(201);
      expect(res.body.data.players).toHaveLength(3);
    });

    it('uses defaults when optional fields omitted', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.difficulty).toBe('average');
      expect(res.body.data.category).toBe('animals');
      expect(res.body.data.players).toHaveLength(1);
    });

    it('rejects invalid difficulty', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ difficulty: 'impossible' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects playerCount > 5', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 10 });

      expect(res.status).toBe(400);
    });

    it('rejects invalid category', async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ category: 'nonexistent' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/game/:gameId', () => {
    it('returns the game state', async () => {
      const res = await request(app).get(`/api/v1/game/${gameId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(gameId);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('returns 404 for non-existent game', async () => {
      const res = await request(app).get('/api/v1/game/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/game/:gameId/guess', () => {
    let freshGameId;
    let freshPlayerId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 1, category: 'animals', players: ['Tester'] });
      freshGameId = res.body.data.id;
      freshPlayerId = res.body.data.players[0].id;
    });

    it('accepts a single letter guess', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: 'e', playerId: freshPlayerId });

      expect(res.status).toBe(200);
      expect(res.body.data.guessResult).toBeDefined();
      expect(res.body.data.guessResult.guess).toBe('e');
      expect(typeof res.body.data.guessResult.correct).toBe('boolean');
    });

    it('accepts a full word guess', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: 'elephant', playerId: freshPlayerId });

      expect(res.status).toBe(200);
      expect(res.body.data.guessResult).toBeDefined();
    });

    it('returns 400 for duplicate letter guess', async () => {
      await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: 'e', playerId: freshPlayerId });

      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: 'e', playerId: freshPlayerId });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DUPLICATE_GUESS');
    });

    it('returns 404 for non-existent game', async () => {
      const res = await request(app)
        .post('/api/v1/game/00000000-0000-0000-0000-000000000000/guess')
        .send({ guess: 'a' });

      expect(res.status).toBe(404);
    });

    it('rejects empty guess', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: '' });

      expect(res.status).toBe(400);
    });

    it('rejects non-alphabetic guess', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({ guess: '123' });

      expect(res.status).toBe(400);
    });

    it('rejects missing guess field', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshGameId}/guess`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
