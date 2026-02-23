const wordRepo = require('../data/WordRepository');
const logger = require('../utils/logger');

const CTX = 'AiPlayerService';

const ENGLISH_FREQUENCY = 'etaoinsrhldcumfpgwybvkxjqz'.split('');

/*
 * ──────────────────────────────────────────────────────────────────────
 *  English language statistics used by the word-construction phase.
 *  These tables are consulted ONLY when the dictionary yields zero
 *  candidates and most of the word is already revealed (≤ 2 blanks).
 * ──────────────────────────────────────────────────────────────────────
 */

/** Base letter frequency (% of occurrence in English text). */
const LETTER_FREQ = {
  e: 12.70, t: 9.06, a: 8.17, o: 7.51, i: 6.97, n: 6.75, s: 6.33, h: 6.09,
  r: 5.99, d: 4.25, l: 4.03, c: 2.78, u: 2.76, m: 2.41, w: 2.36, f: 2.23,
  g: 2.02, y: 1.97, p: 1.93, b: 1.49, v: 0.98, k: 0.77, j: 0.15, x: 0.15,
  q: 0.10, z: 0.07,
};

/** How often each letter starts an English word. */
const FIRST_LETTER_FREQ = {
  t: 16.0, a: 11.7, s: 7.8, o: 7.6, c: 5.5, p: 5.2, m: 4.2, d: 3.8,
  h: 3.7, i: 3.6, b: 3.4, w: 3.4, f: 2.9, r: 2.8, e: 2.8, n: 2.4,
  g: 2.0, l: 1.8, u: 1.5, j: 0.6, k: 0.5, v: 0.4, y: 0.4, q: 0.2,
  x: 0.05, z: 0.05,
};

/** How often each letter ends an English word. */
const LAST_LETTER_FREQ = {
  e: 19.2, s: 14.4, t: 7.2, d: 6.9, n: 6.6, y: 5.6, r: 5.5, l: 3.4,
  o: 3.2, g: 2.9, a: 2.8, h: 2.7, k: 2.1, m: 2.0, p: 1.8, f: 1.3,
  w: 1.2, c: 1.0, x: 0.7, i: 0.6, b: 0.4, u: 0.3, z: 0.2, v: 0.1,
  j: 0.02, q: 0.01,
};

/** Top ~50 English bigram frequencies (% of all consecutive pairs). */
const BIGRAM_FREQ = {
  th: 3.56, he: 3.07, in: 2.43, er: 2.05, an: 1.99, re: 1.85, on: 1.76,
  at: 1.49, en: 1.45, nd: 1.35, ti: 1.34, es: 1.34, or: 1.28, te: 1.27,
  of: 1.17, ed: 1.17, is: 1.13, it: 1.12, al: 1.09, ar: 1.07, st: 1.05,
  to: 1.04, nt: 1.04, ng: 0.95, se: 0.93, ha: 0.93, as: 0.87, ou: 0.87,
  io: 0.83, le: 0.83, ve: 0.83, co: 0.79, me: 0.79, de: 0.76, hi: 0.73,
  ri: 0.73, ro: 0.73, ic: 0.70, ne: 0.69, ea: 0.69, ra: 0.69, ce: 0.65,
  li: 0.62, ch: 0.60, ll: 0.58, be: 0.58, ma: 0.57, si: 0.55, om: 0.55,
  ur: 0.54,
};

const POSITION_WEIGHT = 1.5;
const BIGRAM_WEIGHT = 3.0;
const MAX_BLANKS_FOR_CONSTRUCTION = 2;

/**
 * Checks whether a candidate word is consistent with what the AI
 * currently observes: the revealed pattern and all previously guessed letters.
 */
function matchesPattern(word, pattern, guessedSet) {
  if (word.length !== pattern.length) return false;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== '_' && word[i] !== pattern[i]) return false;
  }

  for (const letter of guessedSet) {
    const revealedInPattern = pattern.includes(letter);

    if (revealedInPattern) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] === letter && pattern[i] !== letter) return false;
      }
    } else {
      if (word.includes(letter)) return false;
    }
  }

  return true;
}

/**
 * Gathers candidate words from the repository that match the current
 * game pattern. When a category is provided the search is scoped to
 * that category; otherwise every category is searched.
 */
function getCandidateWords(category, wordLength, pattern, guessedSet) {
  const categoryIds =
    category && category !== 'all'
      ? [category]
      : wordRepo.getCategoryIds();

  const seen = new Set();
  const candidates = [];

  for (const catId of categoryIds) {
    const words = wordRepo.getWordsByLength(catId, wordLength);
    for (const word of words) {
      if (
        word.length === wordLength &&
        !seen.has(word) &&
        matchesPattern(word, pattern, guessedSet)
      ) {
        seen.add(word);
        candidates.push(word);
      }
    }
  }

  return candidates;
}

/**
 * Scores a single letter for a specific blank position by combining
 * base frequency, positional tendency, and bigram context with neighbors.
 */
function scoreLetterAtPosition(letter, position, pattern, wordLength) {
  let score = LETTER_FREQ[letter] || 0;

  if (position === 0) {
    score += (FIRST_LETTER_FREQ[letter] || 0) * POSITION_WEIGHT;
  }
  if (position === wordLength - 1) {
    score += (LAST_LETTER_FREQ[letter] || 0) * POSITION_WEIGHT;
  }
  if (position > 0 && pattern[position - 1] !== '_') {
    score += (BIGRAM_FREQ[pattern[position - 1] + letter] || 0) * BIGRAM_WEIGHT;
  }
  if (position < wordLength - 1 && pattern[position + 1] !== '_') {
    score += (BIGRAM_FREQ[letter + pattern[position + 1]] || 0) * BIGRAM_WEIGHT;
  }

  return score;
}

/**
 * Ranks all unguessed letters for a blank position, best first.
 */
function rankLettersForPosition(position, pattern, wordLength, guessedSet) {
  const scored = [];
  for (let c = 97; c <= 122; c++) {
    const letter = String.fromCharCode(c);
    if (guessedSet.has(letter)) continue;
    scored.push({ letter, score: scoreLetterAtPosition(letter, position, pattern, wordLength) });
  }
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Attempts to construct a full word from a mostly-revealed pattern by
 * filling in the remaining blanks with the highest-scoring letters.
 * Returns null if there are too many blanks to guess reliably.
 *
 * When a construction matches a previously failed word guess, it tries
 * the next-best letter combination before giving up.
 */
function constructWord(pattern, guessedSet, failedWords) {
  const blanks = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '_') blanks.push(i);
  }

  if (blanks.length === 0 || blanks.length > MAX_BLANKS_FOR_CONSTRUCTION) return null;

  const rankings = blanks.map((pos) =>
    rankLettersForPosition(pos, pattern, pattern.length, guessedSet)
  );

  if (blanks.length === 1) {
    for (const { letter } of rankings[0]) {
      const built = [...pattern];
      built[blanks[0]] = letter;
      const word = built.join('');
      if (!failedWords.has(word)) return word;
    }
    return null;
  }

  // 2 blanks: try combinations ordered by combined score
  const topN = 5;
  const first = rankings[0].slice(0, topN);
  const second = rankings[1].slice(0, topN);

  const combos = [];
  for (const a of first) {
    for (const b of second) {
      combos.push({ letters: [a.letter, b.letter], score: a.score + b.score });
    }
  }
  combos.sort((a, b) => b.score - a.score);

  for (const { letters } of combos) {
    const built = [...pattern];
    built[blanks[0]] = letters[0];
    built[blanks[1]] = letters[1];
    const word = built.join('');
    if (!failedWords.has(word)) return word;
  }

  return null;
}

/**
 * Scores each unguessed letter by how many candidate words contain it,
 * then returns the letter with the highest coverage.
 */
function computeBestLetter(candidates, guessedSet) {
  const freq = {};

  for (const word of candidates) {
    const seen = new Set();
    for (const ch of word) {
      if (!guessedSet.has(ch) && !seen.has(ch)) {
        freq[ch] = (freq[ch] || 0) + 1;
        seen.add(ch);
      }
    }
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return {
    letter: sorted[0][0],
    frequency: sorted[0][1],
    coverage: sorted[0][1] / candidates.length,
  };
}

/**
 * Primary entry point. Given the observable game state (masked word,
 * guessed letters, optional category), returns the AI's next guess
 * along with strategy metadata for the frontend to display.
 *
 * Strategy priority:
 *   1. Single candidate remaining  → guess the full word
 *   2. Multiple candidates         → guess the letter with highest coverage
 *   3. Zero candidates, ≤ 2 blanks → construct word from pattern via bigram/positional scoring
 *   4. Zero candidates, > 2 blanks → fall back to English letter frequency
 */
function getAiGuess({ maskedWord, guessedLetters, category, failedWordGuesses = [] }) {
  const pattern = maskedWord.split(' ').filter((ch) => ch !== '');
  const wordLength = pattern.length;
  const guessedSet = new Set(guessedLetters);
  const failedWords = new Set(failedWordGuesses);

  const candidates = getCandidateWords(category, wordLength, pattern, guessedSet)
    .filter((w) => !failedWords.has(w));

  logger.debug(CTX, `Candidates: ${candidates.length}`, {
    pattern: pattern.join(''),
    guessed: guessedLetters.length,
    category,
  });

  if (candidates.length === 1) {
    return {
      guess: candidates[0],
      strategy: 'word_match',
      candidatesRemaining: 1,
      confidence: 1.0,
    };
  }

  if (candidates.length === 0) {
    const blanks = pattern.filter((ch) => ch === '_').length;
    if (blanks <= MAX_BLANKS_FOR_CONSTRUCTION) {
      const constructed = constructWord(pattern, guessedSet, failedWords);
      if (constructed) {
        logger.info(CTX, `Constructed word: "${constructed}" (${blanks} blank${blanks !== 1 ? 's' : ''} filled)`, {
          pattern: pattern.join(''),
        });
        return {
          guess: constructed,
          strategy: 'word_construction',
          candidatesRemaining: 0,
          confidence: blanks === 1 ? 0.7 : 0.4,
        };
      }
    }

    const letter = ENGLISH_FREQUENCY.find((l) => !guessedSet.has(l));
    return {
      guess: letter || 'z',
      strategy: 'fallback_frequency',
      candidatesRemaining: 0,
      confidence: 0.1,
    };
  }

  const best = computeBestLetter(candidates, guessedSet);

  if (!best) {
    return {
      guess: candidates[0],
      strategy: 'word_guess_fallback',
      candidatesRemaining: candidates.length,
      confidence: parseFloat((1 / candidates.length).toFixed(2)),
    };
  }

  return {
    guess: best.letter,
    strategy: 'candidate_elimination',
    candidatesRemaining: candidates.length,
    confidence: parseFloat(best.coverage.toFixed(2)),
  };
}

module.exports = { getAiGuess };
