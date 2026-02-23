const request = require('supertest');
const app = require('../../../src/app');

describe('GET /api/v1/categories', () => {
  it('returns 200 with a list of categories', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('each category has id and label', async () => {
    const res = await request(app).get('/api/v1/categories');

    res.body.data.forEach((cat) => {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('label');
      expect(typeof cat.id).toBe('string');
      expect(typeof cat.label).toBe('string');
    });
  });

  it('includes well-known categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    const ids = res.body.data.map((c) => c.id);

    expect(ids).toContain('animals');
    expect(ids).toContain('countries');
  });
});
