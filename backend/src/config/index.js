require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  wordApiUrl: process.env.WORD_API_URL || 'https://api.datamuse.com/words',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  game: {
    maxPlayers: 5,
    attemptsPerPlayer: 6,
    categories: ['animals', 'fruits', 'food'],
    difficulties: ['easy', 'average', 'hard'],
  },
};

module.exports = config;
