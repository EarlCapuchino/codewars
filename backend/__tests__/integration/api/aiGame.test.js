const request = require('supertest');
const app = require('../../../src/app');

describe('AI Game API', () => {
  let aiGameId;

  describe('POST /api/v1/game/ai', () => {
    it('creates an AI game and returns 201', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'elephant' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const game = res.body.data;
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('maskedWord');
      expect(game).toHaveProperty('status', 'IN_PROGRESS');
      expect(game.word).toBe('elephant');
      expect(game.isAiGame).toBe(true);
      expect(game.players).toHaveLength(1);
      expect(game.players[0].name).toBe('AI Opponent');

      aiGameId = game.id;
    });

    it('accepts an optional category hint', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger', category: 'animals' });

      expect(res.status).toBe(201);
      expect(res.body.data.category).toBe('animals');
    });

    it('defaults to category "all" when no category given', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'python' });

      expect(res.status).toBe(201);
      expect(res.body.data.category).toBe('all');
    });

    it('rejects words shorter than 3 chars', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'ab' });

      expect(res.status).toBe(400);
    });

    it('rejects words longer than 15 chars', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'abcdefghijklmnop' });

      expect(res.status).toBe(400);
    });

    it('rejects non-alphabetic words', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'cat123' });

      expect(res.status).toBe(400);
    });

    it('rejects missing word', async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/game/:gameId/ai-guess', () => {
    let freshAiGameId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'tiger', category: 'animals' });
      freshAiGameId = res.body.data.id;
    });

    it('returns 200 with AI move data', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshAiGameId}/ai-guess`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data).toHaveProperty('guessResult');
      expect(data).toHaveProperty('aiMove');
      expect(data.aiMove).toHaveProperty('guess');
      expect(data.aiMove).toHaveProperty('strategy');
      expect(data.aiMove).toHaveProperty('candidatesRemaining');
      expect(data.aiMove).toHaveProperty('confidence');
      expect(data.isAiGame).toBe(true);
      expect(data.word).toBe('tiger');
    });

    it('returns valid strategies', async () => {
      const res = await request(app)
        .post(`/api/v1/game/${freshAiGameId}/ai-guess`);

      const validStrategies = [
        'candidate_elimination',
        'word_match',
        'word_construction',
        'fallback_frequency',
        'word_guess_fallback',
      ];
      expect(validStrategies).toContain(res.body.data.aiMove.strategy);
    });

    it('rejects ai-guess on a non-AI game', async () => {
      const normal = await request(app)
        .post('/api/v1/game')
        .send({ playerCount: 1, category: 'animals' });

      const res = await request(app)
        .post(`/api/v1/game/${normal.body.data.id}/ai-guess`);

      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent game', async () => {
      const res = await request(app)
        .post('/api/v1/game/00000000-0000-0000-0000-000000000000/ai-guess');

      expect(res.status).toBe(404);
    });
  });
});
