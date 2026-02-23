const { Game, Status } = require('../../../src/models/Game');

function createGame(overrides = {}) {
  return new Game({
    word: 'tiger',
    playerNames: ['Alice'],
    difficulty: 'average',
    category: 'animals',
    ...overrides,
  });
}

describe('Game', () => {
  describe('constructor', () => {
    it('assigns a UUID id', () => {
      const game = createGame();
      expect(game.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('lowercases the word', () => {
      const game = createGame({ word: 'TIGER' });
      expect(game.word).toBe('tiger');
    });

    it('starts IN_PROGRESS with no winner', () => {
      const game = createGame();
      expect(game.status).toBe(Status.IN_PROGRESS);
      expect(game.winner).toBeNull();
    });

    it('initializes empty guessedLetters and failedWordGuesses', () => {
      const game = createGame();
      expect(game.guessedLetters.size).toBe(0);
      expect(game.failedWordGuesses.size).toBe(0);
    });

    it('creates the correct number of players', () => {
      const game = createGame({ playerNames: ['A', 'B', 'C'] });
      expect(game.players).toHaveLength(3);
    });
  });

  describe('maskedWord', () => {
    it('returns all underscores when no letters guessed', () => {
      const game = createGame({ word: 'cat' });
      expect(game.maskedWord).toBe('_ _ _');
    });

    it('reveals correctly guessed letters', () => {
      const game = createGame({ word: 'cat' });
      game.guessedLetters.add('c');
      game.guessedLetters.add('t');
      expect(game.maskedWord).toBe('c _ t');
    });

    it('reveals all letters when word fully guessed', () => {
      const game = createGame({ word: 'cat' });
      'cat'.split('').forEach((ch) => game.guessedLetters.add(ch));
      expect(game.maskedWord).toBe('c a t');
    });
  });

  describe('isWordFullyRevealed', () => {
    it('returns false when letters remain hidden', () => {
      const game = createGame({ word: 'cat' });
      game.guessedLetters.add('c');
      expect(game.isWordFullyRevealed).toBe(false);
    });

    it('returns true when all unique letters guessed', () => {
      const game = createGame({ word: 'cat' });
      'cat'.split('').forEach((ch) => game.guessedLetters.add(ch));
      expect(game.isWordFullyRevealed).toBe(true);
    });

    it('handles words with duplicate letters', () => {
      const game = createGame({ word: 'hello' });
      'helo'.split('').forEach((ch) => game.guessedLetters.add(ch));
      expect(game.isWordFullyRevealed).toBe(true);
    });
  });

  describe('currentPlayer / activePlayers', () => {
    it('starts on the first player', () => {
      const game = createGame({ playerNames: ['A', 'B'] });
      expect(game.currentPlayer.name).toBe('A');
    });

    it('activePlayers excludes eliminated players', () => {
      const game = createGame({ playerNames: ['A', 'B'] });
      game.players[0].eliminated = true;
      expect(game.activePlayers).toHaveLength(1);
      expect(game.activePlayers[0].name).toBe('B');
    });
  });

  describe('advanceTurn', () => {
    it('cycles to the next player', () => {
      const game = createGame({ playerNames: ['A', 'B', 'C'] });
      game.advanceTurn();
      expect(game.currentPlayer.name).toBe('B');
      game.advanceTurn();
      expect(game.currentPlayer.name).toBe('C');
      game.advanceTurn();
      expect(game.currentPlayer.name).toBe('A');
    });

    it('skips eliminated players', () => {
      const game = createGame({ playerNames: ['A', 'B', 'C'] });
      game.players[1].eliminated = true;
      game.advanceTurn();
      expect(game.currentPlayer.name).toBe('C');
    });
  });

  describe('guessLetter', () => {
    it('returns correct: true for a letter in the word', () => {
      const game = createGame({ word: 'tiger' });
      const result = game.guessLetter('t');
      expect(result.correct).toBe(true);
      expect(result.alreadyGuessed).toBe(false);
    });

    it('adds the letter to guessedLetters', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('t');
      expect(game.guessedLetters.has('t')).toBe(true);
    });

    it('returns correct: false for a letter not in the word', () => {
      const game = createGame({ word: 'tiger' });
      const result = game.guessLetter('z');
      expect(result.correct).toBe(false);
    });

    it('deducts an attempt on incorrect guess', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('z');
      expect(game.currentPlayer.remainingAttempts).toBe(5);
    });

    it('does not deduct an attempt on correct guess', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('t');
      expect(game.players[0].remainingAttempts).toBe(6);
    });

    it('marks alreadyGuessed for duplicate letter', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('z');
      const result = game.guessLetter('z');
      expect(result.alreadyGuessed).toBe(true);
    });

    it('does not deduct attempt for already guessed incorrect letter', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('z');
      const before = game.players[0].remainingAttempts;
      game.guessLetter('z');
      expect(game.players[0].remainingAttempts).toBe(before);
    });

    it('transitions to WON when the last letter is guessed', () => {
      const game = createGame({ word: 'cat' });
      game.guessLetter('c');
      game.guessLetter('a');
      const result = game.guessLetter('t');
      expect(result.status).toBe(Status.WON);
      expect(game.status).toBe(Status.WON);
      expect(game.winner).not.toBeNull();
    });

    it('transitions to LOST when all players are eliminated', () => {
      const game = createGame({ word: 'tiger' });
      const wrongLetters = 'zxwvuq';
      for (const ch of wrongLetters) {
        game.guessLetter(ch);
      }
      expect(game.status).toBe(Status.LOST);
    });

    it('advances turn on incorrect guess in multiplayer', () => {
      const game = createGame({ word: 'tiger', playerNames: ['A', 'B'] });
      expect(game.currentPlayer.name).toBe('A');
      game.guessLetter('z');
      expect(game.currentPlayer.name).toBe('B');
    });

    it('does NOT advance turn on correct guess', () => {
      const game = createGame({ word: 'tiger', playerNames: ['A', 'B'] });
      game.guessLetter('t');
      expect(game.currentPlayer.name).toBe('A');
    });
  });

  describe('guessWord', () => {
    it('returns correct: true and WON for the right word', () => {
      const game = createGame({ word: 'tiger' });
      const result = game.guessWord('tiger');
      expect(result.correct).toBe(true);
      expect(result.status).toBe(Status.WON);
      expect(game.winner).not.toBeNull();
    });

    it('reveals all letters on correct word guess', () => {
      const game = createGame({ word: 'tiger' });
      game.guessWord('tiger');
      expect(game.isWordFullyRevealed).toBe(true);
    });

    it('is case-insensitive', () => {
      const game = createGame({ word: 'tiger' });
      const result = game.guessWord('TIGER');
      expect(result.correct).toBe(true);
    });

    it('deducts an attempt on incorrect word', () => {
      const game = createGame({ word: 'tiger' });
      game.guessWord('lions');
      expect(game.players[0].remainingAttempts).toBe(5);
    });

    it('adds wrong word to failedWordGuesses', () => {
      const game = createGame({ word: 'tiger' });
      game.guessWord('lions');
      expect(game.failedWordGuesses.has('lions')).toBe(true);
    });

    it('advances turn on wrong word guess in multiplayer', () => {
      const game = createGame({ word: 'tiger', playerNames: ['A', 'B'] });
      game.guessWord('lions');
      expect(game.currentPlayer.name).toBe('B');
    });

    it('transitions to LOST when wrong guess eliminates the last player', () => {
      const game = createGame({ word: 'tiger' });
      for (let i = 0; i < 6; i++) game.guessWord('wrong');
      expect(game.status).toBe(Status.LOST);
    });
  });

  describe('toJSON', () => {
    it('includes base fields', () => {
      const game = createGame();
      const json = game.toJSON();
      expect(json).toMatchObject({
        id: expect.any(String),
        maskedWord: expect.any(String),
        status: 'IN_PROGRESS',
        difficulty: 'average',
        category: 'animals',
        guessedLetters: [],
        failedWordGuesses: [],
        players: expect.any(Array),
        currentPlayer: expect.any(Object),
        currentPlayerIndex: 0,
      });
    });

    it('does NOT expose the word while IN_PROGRESS', () => {
      const game = createGame();
      const json = game.toJSON();
      expect(json.word).toBeUndefined();
    });

    it('exposes the word on LOST', () => {
      const game = createGame({ word: 'tiger' });
      for (let i = 0; i < 6; i++) game.guessWord('wrong');
      const json = game.toJSON();
      expect(json.word).toBe('tiger');
    });

    it('includes winner on WON', () => {
      const game = createGame({ word: 'tiger' });
      game.guessWord('tiger');
      const json = game.toJSON();
      expect(json.winner).toBeDefined();
      expect(json.winner.name).toBe('Alice');
    });

    it('sorts guessedLetters alphabetically', () => {
      const game = createGame({ word: 'tiger' });
      game.guessLetter('r');
      game.guessLetter('a');
      game.guessLetter('t');
      expect(game.toJSON().guessedLetters).toEqual(['a', 'r', 't']);
    });
  });
});
