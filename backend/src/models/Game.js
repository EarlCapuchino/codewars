const { v4: uuidv4 } = require('uuid');
const Player = require('./Player');

const Status = {
  IN_PROGRESS: 'IN_PROGRESS',
  WON: 'WON',
  LOST: 'LOST',
};

class Game {
  constructor({ word, playerNames, difficulty, category }) {
    this.id = uuidv4();
    this.word = word.toLowerCase();
    this.difficulty = difficulty;
    this.category = category;
    this.status = Status.IN_PROGRESS;
    this.guessedLetters = new Set();
    this.failedWordGuesses = new Set();
    this.players = playerNames.map((name, i) => new Player(name, i));
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.createdAt = new Date();
  }

  get maskedWord() {
    return this.word
      .split('')
      .map((ch) => (this.guessedLetters.has(ch) ? ch : '_'))
      .join(' ');
  }

  get isWordFullyRevealed() {
    return this.word.split('').every((ch) => this.guessedLetters.has(ch));
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex] ?? null;
  }

  get activePlayers() {
    return this.players.filter((p) => !p.eliminated);
  }

  advanceTurn() {
    if (this.activePlayers.length === 0) return;
    let next = (this.currentPlayerIndex + 1) % this.players.length;
    let checked = 0;
    while (this.players[next].eliminated && checked < this.players.length) {
      next = (next + 1) % this.players.length;
      checked++;
    }
    this.currentPlayerIndex = next;
  }

  guessLetter(letter) {
    const lower = letter.toLowerCase();
    const alreadyGuessed = this.guessedLetters.has(lower);
    this.guessedLetters.add(lower);

    const isCorrect = this.word.includes(lower);

    if (!isCorrect && !alreadyGuessed) {
      this.currentPlayer.useAttempt();
    }

    if (this.isWordFullyRevealed) {
      this.status = Status.WON;
      this.winner = this.currentPlayer;
      return { correct: isCorrect, alreadyGuessed, status: this.status };
    }

    if (this.activePlayers.length === 0) {
      this.status = Status.LOST;
      return { correct: isCorrect, alreadyGuessed, status: this.status };
    }

    if (!isCorrect || alreadyGuessed) {
      this.advanceTurn();
    }

    return { correct: isCorrect, alreadyGuessed, status: this.status };
  }

  guessWord(word) {
    const lower = word.toLowerCase();

    if (lower === this.word) {
      this.word.split('').forEach((ch) => this.guessedLetters.add(ch));
      this.status = Status.WON;
      this.winner = this.currentPlayer;
      return { correct: true, status: this.status };
    }

    this.failedWordGuesses.add(lower);
    this.currentPlayer.useAttempt();

    if (this.activePlayers.length === 0) {
      this.status = Status.LOST;
      return { correct: false, status: this.status };
    }

    this.advanceTurn();
    return { correct: false, status: this.status };
  }

  toJSON() {
    const response = {
      id: this.id,
      maskedWord: this.maskedWord,
      status: this.status,
      difficulty: this.difficulty,
      category: this.category,
      guessedLetters: [...this.guessedLetters].sort(),
      failedWordGuesses: [...this.failedWordGuesses],
      players: this.players.map((p) => p.toJSON()),
      currentPlayer: this.currentPlayer ? this.currentPlayer.toJSON() : null,
      currentPlayerIndex: this.currentPlayerIndex,
    };

    if (this.status === Status.WON && this.winner) {
      response.winner = this.winner.toJSON();
    }

    if (this.status === Status.LOST) {
      response.word = this.word;
    }

    return response;
  }
}

module.exports = { Game, Status };
