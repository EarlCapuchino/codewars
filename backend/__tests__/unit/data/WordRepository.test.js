const wordRepo = require('../../../src/data/WordRepository');

describe('WordRepository', () => {
  describe('getCategoryIds', () => {
    it('returns an array of category IDs', () => {
      const ids = wordRepo.getCategoryIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('includes known categories', () => {
      const ids = wordRepo.getCategoryIds();
      expect(ids).toContain('animals');
      expect(ids).toContain('countries');
      expect(ids).toContain('sports');
    });
  });

  describe('getCategoryList', () => {
    it('returns objects with id and label', () => {
      const list = wordRepo.getCategoryList();
      expect(list.length).toBeGreaterThan(0);
      list.forEach((entry) => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('label');
        expect(typeof entry.id).toBe('string');
        expect(typeof entry.label).toBe('string');
      });
    });
  });

  describe('getWordsByLength', () => {
    it('returns an array of words', () => {
      const words = wordRepo.getWordsByLength('animals', 6);
      expect(Array.isArray(words)).toBe(true);
      expect(words.length).toBeGreaterThan(0);
    });

    it('returns words near the target length', () => {
      const target = 6;
      const words = wordRepo.getWordsByLength('animals', target);
      words.forEach((word) => {
        expect(Math.abs(word.length - target)).toBeLessThanOrEqual(3);
      });
    });

    it('all words are lowercase alphabetic', () => {
      const words = wordRepo.getWordsByLength('animals', 5);
      words.forEach((word) => {
        expect(word).toMatch(/^[a-z]+$/);
      });
    });

    it('returns empty array for unknown category', () => {
      const words = wordRepo.getWordsByLength('nonexistent', 5);
      expect(words).toEqual([]);
    });

    it('falls back to full list if no length match within tolerance', () => {
      const words = wordRepo.getWordsByLength('animals', 100);
      expect(words.length).toBeGreaterThan(0);
    });
  });

  describe('getWordCount', () => {
    it('returns a positive number for a known category', () => {
      expect(wordRepo.getWordCount('animals')).toBeGreaterThan(0);
    });

    it('returns 0 for an unknown category', () => {
      expect(wordRepo.getWordCount('nonexistent')).toBe(0);
    });
  });

  describe('getLengthDistribution', () => {
    it('returns an object mapping lengths to counts', () => {
      const dist = wordRepo.getLengthDistribution('animals');
      expect(typeof dist).toBe('object');
      Object.entries(dist).forEach(([len, count]) => {
        expect(Number(len)).toBeGreaterThanOrEqual(3);
        expect(count).toBeGreaterThan(0);
      });
    });

    it('returns empty object for unknown category', () => {
      expect(wordRepo.getLengthDistribution('nonexistent')).toEqual({});
    });
  });

  describe('hasWord', () => {
    it('returns true for a word that exists in the category', () => {
      const words = wordRepo.getWordsByLength('animals', 5);
      if (words.length > 0) {
        expect(wordRepo.hasWord('animals', words[0])).toBe(true);
      }
    });

    it('returns false for a word not in the category', () => {
      expect(wordRepo.hasWord('animals', 'xyznonexistent')).toBe(false);
    });

    it('is case-insensitive', () => {
      const words = wordRepo.getWordsByLength('animals', 5);
      if (words.length > 0) {
        expect(wordRepo.hasWord('animals', words[0].toUpperCase())).toBe(true);
      }
    });
  });

  describe('data integrity', () => {
    it('every category has at least 5 words', () => {
      const ids = wordRepo.getCategoryIds();
      ids.forEach((id) => {
        expect(wordRepo.getWordCount(id)).toBeGreaterThanOrEqual(5);
      });
    });

    it('no category has words shorter than 3 or longer than 15 chars', () => {
      const ids = wordRepo.getCategoryIds();
      ids.forEach((id) => {
        const dist = wordRepo.getLengthDistribution(id);
        Object.keys(dist).forEach((len) => {
          const n = Number(len);
          expect(n).toBeGreaterThanOrEqual(3);
          expect(n).toBeLessThanOrEqual(15);
        });
      });
    });
  });
});
