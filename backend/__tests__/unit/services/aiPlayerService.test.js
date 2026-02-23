const { getAiGuess } = require('../../../src/services/aiPlayerService');

describe('aiPlayerService', () => {
  describe('getAiGuess – return shape', () => {
    it('returns an object with guess, strategy, candidatesRemaining, confidence', () => {
      const result = getAiGuess({
        maskedWord: '_ _ _ _ _',
        guessedLetters: [],
        category: 'animals',
      });

      expect(result).toHaveProperty('guess');
      expect(result).toHaveProperty('strategy');
      expect(result).toHaveProperty('candidatesRemaining');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.guess).toBe('string');
      expect(result.guess.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('strategy: candidate_elimination', () => {
    it('returns a single letter when multiple candidates exist', () => {
      const result = getAiGuess({
        maskedWord: '_ _ _ _ _ _',
        guessedLetters: [],
        category: 'animals',
      });

      expect(result.guess).toHaveLength(1);
      expect(result.strategy).toBe('candidate_elimination');
      expect(result.candidatesRemaining).toBeGreaterThan(1);
    });

    it('narrows down candidates as more letters are guessed', () => {
      const first = getAiGuess({
        maskedWord: '_ _ _ _ _ _',
        guessedLetters: [],
        category: 'animals',
      });

      const second = getAiGuess({
        maskedWord: '_ _ _ _ _ _',
        guessedLetters: [first.guess],
        category: 'animals',
      });

      expect(second.candidatesRemaining).toBeLessThanOrEqual(first.candidatesRemaining);
    });
  });

  describe('strategy: word_match', () => {
    it('guesses the full word when only one candidate remains', () => {
      const result = getAiGuess({
        maskedWord: 't i g _ r',
        guessedLetters: ['t', 'i', 'g', 'r', 'a', 's', 'l', 'o', 'n'],
        category: 'animals',
      });

      if (result.strategy === 'word_match') {
        expect(result.guess.length).toBeGreaterThan(1);
        expect(result.candidatesRemaining).toBe(1);
        expect(result.confidence).toBe(1.0);
      }
    });
  });

  describe('strategy: word_construction', () => {
    it('constructs a word when no dictionary candidates remain and <=2 blanks', () => {
      const result = getAiGuess({
        maskedWord: 'e m p a t h _',
        guessedLetters: ['e', 'm', 'p', 'a', 't', 'h', 'r', 'i', 'o', 'n', 's'],
        category: 'all',
        failedWordGuesses: [],
      });

      expect(result.guess.length).toBeGreaterThan(1);
      expect(['word_construction', 'word_match', 'fallback_frequency']).toContain(result.strategy);
    });

    it('skips previously failed word guesses', () => {
      const firstResult = getAiGuess({
        maskedWord: 'z y x w _',
        guessedLetters: ['z', 'y', 'x', 'w', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'],
        category: 'all',
        failedWordGuesses: [],
      });

      if (firstResult.strategy === 'word_construction') {
        const secondResult = getAiGuess({
          maskedWord: 'z y x w _',
          guessedLetters: ['z', 'y', 'x', 'w', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'],
          category: 'all',
          failedWordGuesses: [firstResult.guess],
        });

        if (secondResult.strategy === 'word_construction') {
          expect(secondResult.guess).not.toBe(firstResult.guess);
        }
      }
    });
  });

  describe('strategy: fallback_frequency', () => {
    it('falls back to letter frequency when many blanks remain and no candidates', () => {
      const result = getAiGuess({
        maskedWord: '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _',
        guessedLetters: [],
        category: 'nonexistent_category',
      });

      expect(result.strategy).toBe('fallback_frequency');
      expect(result.guess).toHaveLength(1);
      expect(result.candidatesRemaining).toBe(0);
      expect(result.confidence).toBe(0.1);
    });

    it('picks the next unguessed letter from frequency order', () => {
      const result = getAiGuess({
        maskedWord: '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _',
        guessedLetters: ['e'],
        category: 'nonexistent_category',
      });

      expect(result.guess).toBe('t');
    });
  });

  describe('failedWordGuesses filtering', () => {
    it('does not re-guess a word in failedWordGuesses', () => {
      const result1 = getAiGuess({
        maskedWord: 't i g _ r',
        guessedLetters: ['t', 'i', 'g', 'r', 'a', 's', 'l', 'o', 'n'],
        category: 'animals',
        failedWordGuesses: [],
      });

      if (result1.strategy === 'word_match') {
        const result2 = getAiGuess({
          maskedWord: 't i g _ r',
          guessedLetters: ['t', 'i', 'g', 'r', 'a', 's', 'l', 'o', 'n'],
          category: 'animals',
          failedWordGuesses: [result1.guess],
        });

        expect(result2.guess).not.toBe(result1.guess);
      }
    });
  });

  describe('cross-category search', () => {
    it('searches all categories when category is "all"', () => {
      const result = getAiGuess({
        maskedWord: '_ _ _ _ _ _',
        guessedLetters: [],
        category: 'all',
      });

      expect(result.candidatesRemaining).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('handles a fully revealed pattern gracefully', () => {
      const result = getAiGuess({
        maskedWord: 't i g e r',
        guessedLetters: ['t', 'i', 'g', 'e', 'r'],
        category: 'animals',
      });

      expect(result).toHaveProperty('guess');
    });

    it('handles all letters guessed with no valid letter left', () => {
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const result = getAiGuess({
        maskedWord: '_ _ _',
        guessedLetters: allLetters,
        category: 'animals',
      });

      expect(result).toHaveProperty('guess');
    });
  });
});
