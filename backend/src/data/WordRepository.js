const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const CTX = 'WordRepository';

/**
 * Category registry: maps a category ID (used in API requests) to its
 * display label and data file. Adding a new category requires only a
 * new JSON file and one entry here — no logic changes anywhere else.
 */
const CATEGORY_REGISTRY = {
  animals:        { label: 'Animals',            file: 'animals.json' },
  'food-and-drink': { label: 'Food & Drink',     file: 'food-and-drink.json' },
  household:      { label: 'Household Objects',  file: 'household.json' },
  clothing:       { label: 'Clothing',           file: 'clothing.json' },
  'body-parts':   { label: 'Body Parts',         file: 'body-parts.json' },
  transportation: { label: 'Transportation',     file: 'transportation.json' },
  countries:      { label: 'Countries',          file: 'countries.json' },
  nature:         { label: 'Nature',              file: 'nature.json' },
  cities:         { label: 'Famous Cities',      file: 'cities.json' },
  jobs:           { label: 'Jobs',               file: 'jobs.json' },
  sports:         { label: 'Sports',             file: 'sports.json' },
};

const DATA_DIR = path.join(__dirname, 'categories');

/**
 * In-memory store populated at startup:
 *   store[categoryId] = {
 *     words: Set<string>,
 *     byLength: Map<number, string[]>,   // pre-computed index
 *     lengths: number[],                 // sorted available lengths
 *   }
 */
const store = {};

let loaded = false;

function sanitize(word) {
  return word.toLowerCase().trim();
}

function isValid(word) {
  return word.length >= 3 && word.length <= 15 && /^[a-z]+$/.test(word);
}

/**
 * Loads all category files, validates every word, deduplicates,
 * and builds the length-based index. Called once at startup.
 */
function load() {
  if (loaded) return;

  const categoryIds = Object.keys(CATEGORY_REGISTRY);
  let totalWords = 0;

  for (const id of categoryIds) {
    const { file, label } = CATEGORY_REGISTRY[id];
    const filePath = path.join(DATA_DIR, file);

    let raw;
    try {
      const json = fs.readFileSync(filePath, 'utf-8');
      raw = JSON.parse(json);
    } catch (err) {
      logger.error(CTX, `Failed to load category "${id}" from ${file}: ${err.message}`);
      continue;
    }

    if (!Array.isArray(raw)) {
      logger.error(CTX, `Invalid format for "${id}": expected JSON array`);
      continue;
    }

    const words = new Set();
    const byLength = new Map();
    let rejected = 0;

    for (const entry of raw) {
      if (typeof entry !== 'string') { rejected++; continue; }

      const word = sanitize(entry);
      if (!isValid(word)) { rejected++; continue; }
      if (words.has(word)) continue;

      words.add(word);

      const len = word.length;
      if (!byLength.has(len)) byLength.set(len, []);
      byLength.get(len).push(word);
    }

    const lengths = [...byLength.keys()].sort((a, b) => a - b);

    store[id] = { words, byLength, lengths };
    totalWords += words.size;

    logger.info(CTX, `Loaded "${label}": ${words.size} words, lengths ${lengths[0]}-${lengths[lengths.length - 1]}${rejected > 0 ? `, ${rejected} rejected` : ''}`);
  }

  loaded = true;
  logger.info(CTX, `Repository ready: ${categoryIds.length} categories, ${totalWords} total words`);
}

function assertLoaded() {
  if (!loaded) load();
}

/**
 * Returns a list of words for a category near the target length.
 * Tries exact match first, then widens ±1, ±2, ±3.
 */
function getWordsByLength(categoryId, targetLength) {
  assertLoaded();
  const cat = store[categoryId];
  if (!cat) return [];

  for (let tolerance = 0; tolerance <= 3; tolerance++) {
    const results = [];
    for (let len = targetLength - tolerance; len <= targetLength + tolerance; len++) {
      const bucket = cat.byLength.get(len);
      if (bucket) results.push(...bucket);
    }
    if (results.length > 0) return results;
  }

  return [...cat.words];
}

/**
 * Checks whether a word belongs to a category.
 */
function hasWord(categoryId, word) {
  assertLoaded();
  const cat = store[categoryId];
  return cat ? cat.has?.(word.toLowerCase()) ?? cat.words.has(word.toLowerCase()) : false;
}

/**
 * Returns all registered category IDs.
 */
function getCategoryIds() {
  return Object.keys(CATEGORY_REGISTRY);
}

/**
 * Returns the full registry { id, label } for the frontend to display.
 */
function getCategoryList() {
  return Object.entries(CATEGORY_REGISTRY).map(([id, { label }]) => ({ id, label }));
}

/**
 * Returns the total word count for a category.
 */
function getWordCount(categoryId) {
  assertLoaded();
  return store[categoryId]?.words.size ?? 0;
}

/**
 * Returns available lengths and their counts for a category.
 */
function getLengthDistribution(categoryId) {
  assertLoaded();
  const cat = store[categoryId];
  if (!cat) return {};
  const dist = {};
  for (const [len, words] of cat.byLength) {
    dist[len] = words.length;
  }
  return dist;
}

// Eagerly load on require so validation runs at startup
load();

module.exports = {
  getWordsByLength,
  hasWord,
  getCategoryIds,
  getCategoryList,
  getWordCount,
  getLengthDistribution,
  CATEGORY_REGISTRY,
};
