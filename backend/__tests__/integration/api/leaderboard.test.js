const request = require('supertest');
const app = require('../../../src/app');

describe('Leaderboard API', () => {
  beforeEach(async () => {
    await request(app).delete('/api/v1/leaderboard');
  });

  describe('GET /api/v1/leaderboard', () => {
    it('returns 200 with an empty array initially', async () => {
      const res = await request(app).get('/api/v1/leaderboard');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('DELETE /api/v1/leaderboard', () => {
    it('returns 200 and clears the leaderboard', async () => {
      const res = await request(app).delete('/api/v1/leaderboard');
      expect(res.status).toBe(200);

      const check = await request(app).get('/api/v1/leaderboard');
      expect(check.body.data).toEqual([]);
    });
  });

  describe('leaderboard updates after game completion', () => {
    it('records a win on the leaderboard', async () => {
      const create = await request(app)
        .post('/api/v1/game/ai')
        .send({ word: 'cat', category: 'animals' });

      const gameId = create.body.data.id;

      let status = 'IN_PROGRESS';
      let safety = 0;
      while (status === 'IN_PROGRESS' && safety < 20) {
        const r = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
        status = r.body.data.status;
        safety++;
      }

      const board = await request(app).get('/api/v1/leaderboard');
      expect(board.body.data.length).toBeGreaterThan(0);

      const aiEntry = board.body.data.find((e) => e.playerName === 'AI Opponent');
      expect(aiEntry).toBeDefined();
      expect(aiEntry.gamesPlayed).toBeGreaterThanOrEqual(1);
    });

    it('sorts by wins then score', async () => {
      for (let i = 0; i < 2; i++) {
        const create = await request(app)
          .post('/api/v1/game/ai')
          .send({ word: 'cat', category: 'animals' });

        const gameId = create.body.data.id;
        let status = 'IN_PROGRESS';
        let safety = 0;
        while (status === 'IN_PROGRESS' && safety < 20) {
          const r = await request(app).post(`/api/v1/game/${gameId}/ai-guess`);
          status = r.body.data.status;
          safety++;
        }
      }

      const board = await request(app).get('/api/v1/leaderboard');
      const data = board.body.data;

      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        if (prev.wins === curr.wins) {
          expect(prev.totalScore).toBeGreaterThanOrEqual(curr.totalScore);
        } else {
          expect(prev.wins).toBeGreaterThan(curr.wins);
        }
      }
    });
  });
});
