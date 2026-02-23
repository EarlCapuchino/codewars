const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class Player {
  constructor(name, index) {
    this.id = uuidv4();
    this.name = name;
    this.index = index;
    this.remainingAttempts = config.game.attemptsPerPlayer;
    this.eliminated = false;
  }

  useAttempt() {
    this.remainingAttempts -= 1;
    if (this.remainingAttempts <= 0) {
      this.eliminated = true;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      remainingAttempts: this.remainingAttempts,
      eliminated: this.eliminated,
    };
  }
}

module.exports = Player;
