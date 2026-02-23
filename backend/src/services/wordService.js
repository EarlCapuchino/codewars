const axios = require('axios');
const config = require('../config');
const wordLists = require('../config/words');
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

function getSizeKey(length) {
  if (length <= 5) return 'short';
  if (length <= 7) return 'medium';
  return 'long';
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Tries to fetch a word from the Datamuse API filtered by topic and spelling pattern.
 */
async function fetchWordFromApi(category, targetLength) {
  const pattern = '?'.repeat(targetLength);
  const url = `${config.wordApiUrl}?topics=${encodeURIComponent(category)}&sp=${pattern}&max=50`;

  logger.debug(CTX, 'Fetching word from external API', { url, category, targetLength });

  const { data } = await axios.get(url, { timeout: 5000 });

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No words returned from API');
  }

  const valid = data
    .map((w) => w.word.toLowerCase())
    .filter((w) => w.length === targetLength && /^[a-z]+$/.test(w));

  if (valid.length === 0) {
    throw new Error('No valid words after filtering');
  }

  const word = pickRandom(valid);
  logger.info(CTX, `API word selected: "${word}" (category: ${category}, length: ${targetLength})`);
  return word;
}

/**
 * Picks a word from the local fallback lists closest to the target length.
 */
function getLocalWord(category, targetLength) {
  const sizeKey = getSizeKey(targetLength);
  const categoryWords = wordLists[category] || wordLists.animals;
  const pool = categoryWords[sizeKey] || categoryWords.medium;

  const candidates = pool.filter((w) => Math.abs(w.length - targetLength) <= 2);
  const wordPool = candidates.length > 0 ? candidates : pool;

  const word = pickRandom(wordPool).toLowerCase();
  logger.info(CTX, `Local fallback word selected: "${word}" (category: ${category}, target: ${targetLength})`);
  return word;
}

/**
 * Primary entry point: attempts external API first, falls back to local words.
 */
async function getWord(category, difficulty, playerCount) {
  const targetLength = computeWordLength(difficulty, playerCount);
  logger.debug(CTX, 'Generating word', { category, difficulty, playerCount, targetLength });

  try {
    return await fetchWordFromApi(category, targetLength);
  } catch (err) {
    logger.warn(CTX, `External API failed, using local fallback: ${err.message}`);
    return getLocalWord(category, targetLength);
  }
}

module.exports = { getWord, computeWordLength };
