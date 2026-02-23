const { getWord, computeWordLength } = require('../../../src/services/wordService');

describe('wordService', () => {
  describe('computeWordLength', () => {
    it.each([
      ['easy', 1, 4],
      ['average', 1, 6],
      ['hard', 1, 8],
      ['easy', 3, 6],
      ['average', 2, 7],
      ['hard', 5, 12],
    ])('difficulty=%s, players=%d → length=%d', (difficulty, playerCount, expected) => {
      expect(computeWordLength(difficulty, playerCount)).toBe(expected);
    });

    it('defaults to base 6 for unknown difficulty', () => {
      expect(computeWordLength('unknown', 1)).toBe(6);
    });
  });

  describe('getWord', () => {
    it('returns a lowercase alphabetic string', async () => {
      const word = await getWord('animals', 'average', 1);
      expect(word).toMatch(/^[a-z]+$/);
    });

    it('returns a word at least 3 characters long', async () => {
      const word = await getWord('animals', 'easy', 1);
      expect(word.length).toBeGreaterThanOrEqual(3);
    });

    it('returns different words (non-deterministic)', async () => {
      const words = new Set();
      for (let i = 0; i < 20; i++) {
        words.add(await getWord('animals', 'average', 1));
      }
      expect(words.size).toBeGreaterThan(1);
    });

    it('throws for a category with no words', async () => {
      await expect(getWord('nonexistent', 'average', 1)).rejects.toThrow();
    });

    it('respects difficulty by returning appropriately lengthed words', async () => {
      const easyWords = [];
      const hardWords = [];
      for (let i = 0; i < 10; i++) {
        easyWords.push(await getWord('animals', 'easy', 1));
        hardWords.push(await getWord('animals', 'hard', 1));
      }
      const avgEasy = easyWords.reduce((s, w) => s + w.length, 0) / easyWords.length;
      const avgHard = hardWords.reduce((s, w) => s + w.length, 0) / hardWords.length;
      expect(avgHard).toBeGreaterThan(avgEasy);
    });
  });
});
