const wordRepo = require('../data/WordRepository');
const logger = require('../utils/logger');

const CTX = 'WordService';

/**
 * Computes the target word length based on difficulty and number of players.
 * Formula: baseDifficultyLength + (playerCount - 1)
 */
function computeWordLength(difficulty, playerCount) {
  const baseLengths = { easy: 4, average: 6, hard: 8 };
  return (baseLengths[difficulty] || 6) + (playerCount - 1);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Primary entry point. Selects a word from the local curated repository.
 *
 * Strategy:
 *   1. Query the WordRepository for words in the target category and length
 *   2. Repository handles tolerance widening (exact → ±1 → ±2 → ±3 → full list)
 *   3. Pick a random word from the candidates
 *
 * The local repository is the single source of truth. Every word in it has
 * been curated to genuinely belong to its category — no API ambiguity.
 */
async function getWord(category, difficulty, playerCount) {
  const targetLength = computeWordLength(difficulty, playerCount);

  logger.debug(CTX, 'Selecting word', { category, difficulty, playerCount, targetLength });

  const candidates = wordRepo.getWordsByLength(category, targetLength);

  if (candidates.length === 0) {
    logger.error(CTX, `No words available for category "${category}" near length ${targetLength}`);
    throw new Error(`No words available for category "${category}"`);
  }

  const word = pickRandom(candidates);

  logger.info(CTX, `Word selected: "${word}" (length: ${word.length}, pool: ${candidates.length})`, {
    category,
    difficulty,
    targetLength,
  });

  return word;
}

module.exports = { getWord, computeWordLength };
