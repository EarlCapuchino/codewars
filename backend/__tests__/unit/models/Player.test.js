const Player = require('../../../src/models/Player');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('Alice', 0);
  });

  describe('constructor', () => {
    it('assigns a UUID id', () => {
      expect(player.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('stores the name and index', () => {
      expect(player.name).toBe('Alice');
      expect(player.index).toBe(0);
    });

    it('starts with 6 remaining attempts', () => {
      expect(player.remainingAttempts).toBe(6);
    });

    it('starts not eliminated', () => {
      expect(player.eliminated).toBe(false);
    });
  });

  describe('useAttempt', () => {
    it('decrements remaining attempts by 1', () => {
      player.useAttempt();
      expect(player.remainingAttempts).toBe(5);
    });

    it('does not eliminate until attempts reach 0', () => {
      for (let i = 0; i < 5; i++) {
        player.useAttempt();
        expect(player.eliminated).toBe(false);
      }
    });

    it('eliminates the player when attempts reach 0', () => {
      for (let i = 0; i < 6; i++) player.useAttempt();
      expect(player.remainingAttempts).toBe(0);
      expect(player.eliminated).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('returns the correct shape', () => {
      const json = player.toJSON();
      expect(json).toEqual({
        id: expect.any(String),
        name: 'Alice',
        remainingAttempts: 6,
        eliminated: false,
      });
    });

    it('reflects mutations', () => {
      player.useAttempt();
      const json = player.toJSON();
      expect(json.remainingAttempts).toBe(5);
    });
  });
});
