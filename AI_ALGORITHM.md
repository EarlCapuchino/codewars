# How the AI Opponent Works — A Complete Explanation

This document explains, step by step, exactly how the AI opponent in CodeWords decides what to guess. No prior programming knowledge is assumed — just basic logic and a little math.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [What the AI Can See (and What It Cannot)](#2-what-the-ai-can-see-and-what-it-cannot)
3. [The Word Dictionary](#3-the-word-dictionary)
4. [Step 1 — Build the Candidate List](#4-step-1--build-the-candidate-list)
5. [Step 2 — Filter with Pattern Matching](#5-step-2--filter-with-pattern-matching)
6. [Step 3 — Pick the Best Letter](#6-step-3--pick-the-best-letter)
7. [Step 4 — Know When to Guess the Whole Word](#7-step-4--know-when-to-guess-the-whole-word)
8. [The Fallback — When the Word Isn't in the Dictionary](#8-the-fallback--when-the-word-isnt-in-the-dictionary)
9. [Word Construction — Guessing Words Beyond the Dictionary](#9-word-construction--guessing-words-beyond-the-dictionary)
10. [Full Walkthrough Example](#10-full-walkthrough-example)
11. [Strategy Summary Flowchart](#11-strategy-summary-flowchart)
12. [Why This Approach Works Well](#12-why-this-approach-works-well)
13. [Limitations and Edge Cases](#13-limitations-and-edge-cases)

---

## 1. The Big Picture

Imagine you are playing Hangman, but instead of a human guesser, a computer is trying to figure out your secret word. The computer has **6 attempts** and does not know the word — it only sees blanks (like `_ _ _ _ _`) and whatever letters have been revealed so far.

The AI's job: **guess letters (or the entire word) to uncover the secret word before running out of attempts.**

The core idea behind the AI's strategy is called **candidate elimination**:

> *"Start with every word that could possibly be the answer. Each time you learn something new (a correct or incorrect letter), throw out all the words that no longer fit. Then guess the letter that will eliminate the most remaining words."*

This is the same logic a human expert Hangman player would use — the AI just does it systematically, every single time, without forgetting anything.

---

## 2. What the AI Can See (and What It Cannot)

This is crucial. The AI plays **fairly** — it does not cheat by looking at the answer. On every turn, the AI receives exactly three pieces of information:

| Information | Example | What it tells the AI |
|---|---|---|
| **Masked word** | `a _ _ l e` | The word is 5 letters long. Positions 1, 4, and 5 are `a`, `l`, `e`. Positions 2 and 3 are still unknown. |
| **Guessed letters** | `['a', 'e', 'l', 'i']` | These letters have already been tried. `a`, `e`, `l` are in the word (they appear in the mask). `i` is NOT in the word (it was guessed but did not appear). |
| **Category** (optional) | `"animals"` | If the human gave a category hint, the AI only searches that category's word list. If no hint was given, it searches all categories. |

The AI **never** sees the actual hidden word. It must deduce it from the clues above — exactly like a human player would.

---

## 3. The Word Dictionary

The AI's "brain" is the application's **Word Repository** — a collection of 2,274 curated English words organized into 11 categories:

| Category | Word Count | Example Words |
|---|---|---|
| Animals | 214 | horse, eagle, dolphin |
| Food & Drink | 181 | pizza, mango, coffee |
| Household | 276 | mirror, pillow, candle |
| Clothing | 178 | jacket, boots, scarf |
| Body Parts | 156 | elbow, spine, kidney |
| Transportation | 181 | bicycle, rocket, canoe |
| Countries | 157 | france, brazil, japan |
| Nature | 252 | river, thunder, canyon |
| Famous Cities | 131 | paris, tokyo, london |
| Jobs | 242 | surgeon, barista, pilot |
| Sports | 306 | tennis, karate, soccer |

Each word is stored with its length pre-indexed, so the AI can instantly look up "give me all 5-letter animal words" without scanning every word.

When the user gives a **category hint**, the AI only searches that one category. When no hint is given, the AI searches **all 2,274 words** across every category. This is why giving a hint makes it easier for the AI — it has fewer possibilities to wade through.

---

## 4. Step 1 — Build the Candidate List

The first thing the AI does on every turn is ask: **"Which words in my dictionary could still be the answer?"**

This starts broad and gets narrower each turn.

### 4a. Gather words of the right length

If the masked word is `_ _ _ _ _` (5 blanks), the AI only considers 5-letter words. A 4-letter word or a 6-letter word can never be the answer, so they are immediately discarded.

```
Dictionary:  horse, eagle, dolphin, tiger, mouse, crane, moose, ...
5 letters:   horse, eagle, tiger, mouse, crane, moose
             (dolphin is 7 letters — thrown out)
```

### 4b. Deduplicate across categories

The same word might appear in multiple categories (e.g., "crane" could be in Animals and in Jobs). The AI tracks words it has already seen using a Set, so each word is considered at most once.

---

## 5. Step 2 — Filter with Pattern Matching

This is where the real intelligence happens. For each candidate word, the AI checks: **"Is this word consistent with everything I know so far?"**

The AI applies three rules:

### Rule 1 — Revealed letters must match their positions

If the pattern is `a _ _ l e`, then:
- Position 1 must be `a`
- Position 4 must be `l`
- Position 5 must be `e`

Any word that doesn't have those exact letters in those exact positions is eliminated.

```
Checking "apple":  a-p-p-l-e  →  Position 1=a ✓, Position 4=l ✓, Position 5=e ✓  →  KEEP
Checking "angle":  a-n-g-l-e  →  Position 1=a ✓, Position 4=l ✓, Position 5=e ✓  →  KEEP
Checking "ankle":  a-n-k-l-e  →  Position 1=a ✓, Position 4=l ✓, Position 5=e ✓  →  KEEP
Checking "mouse":  m-o-u-s-e  →  Position 1=m ≠ a  →  ELIMINATE
```

### Rule 2 — Correct letters must not appear in hidden positions

This is a subtle but important rule. In CodeWords, when you guess a letter correctly, **every** occurrence of that letter in the word is revealed. So if `a` is revealed in position 1, and position 3 is still `_`, then position 3 **cannot** be `a` — otherwise it would have been revealed too.

```
Pattern: a _ _ l e     (letter 'a' was guessed and revealed at position 1)

Checking "abale":  a-b-a-l-e  →  Position 3 is 'a', but pattern shows '_' there.
                                  Since 'a' was guessed and it IS in the word,
                                  ALL positions with 'a' should be revealed.
                                  Position 3 should show 'a', not '_'.
                                  →  ELIMINATE
```

### Rule 3 — Incorrect letters must not appear anywhere

If a letter was guessed but does **not** appear in the masked word at all, then the answer cannot contain that letter.

```
Guessed letters: ['a', 'e', 'l', 'i']
Pattern:         a _ _ l e

'i' was guessed but is not in the pattern → 'i' is not in the word.

Checking "agile":  contains 'i'  →  ELIMINATE
Checking "ankle":  no 'i'        →  KEEP
```

### All three rules together

A word only survives if it passes **all three rules**. After this filtering, the AI has its **candidate list** — the set of words that could still be the answer given everything it knows.

---

## 6. Step 3 — Pick the Best Letter

Now the AI has a list of candidate words. It needs to choose which letter to guess next. The strategy is:

> **Guess the letter that appears in the most candidate words.**

### Why? — Maximum information gain

Think of it this way. If you have 20 candidate words and 15 of them contain the letter `r`, then guessing `r` will:

- **If correct:** Reveal `r`'s positions, which will help eliminate many of the 5 words that don't have `r`.
- **If incorrect:** Eliminate all 15 words that contain `r`, leaving only 5 candidates.

Either way, you learn a lot. The candidate list shrinks dramatically.

Compare that to guessing `z`, which maybe only 1 of the 20 words contains. If `z` is wrong (very likely), you only eliminate 1 word. You barely learned anything, and you wasted an attempt.

### How it's calculated

The AI loops through every candidate word, counts how many candidates contain each unguessed letter, and picks the one with the highest count.

```
Candidates: ["apple", "ankle", "ample"]
Already guessed: {a, e, l, i}

Remaining letters in candidates (not yet guessed):
  'p' appears in: apple, ample           → count: 2
  'n' appears in: ankle                   → count: 1
  'k' appears in: ankle                   → count: 1
  'm' appears in: ample                   → count: 1

Best letter: 'p' (appears in 2 out of 3 candidates = 67% coverage)
```

The AI also computes a **confidence score**: the fraction of candidates that contain the chosen letter. A confidence of 0.67 means "67% of the remaining possible words contain this letter — there's a 67% chance this guess is correct."

### Important detail: counting each letter once per word

If a word is "apple", the letter `p` appears twice. But the AI only counts it **once** for that word. Why? Because what matters is *"does this word contain `p` at all?"* — not how many times. Whether `p` appears once or five times in a word, the result is the same: the guess is either correct or incorrect.

---

## 7. Step 4 — Know When to Guess the Whole Word

There's one special case where the AI changes strategy entirely:

> **If exactly one candidate word remains, the AI guesses the full word instead of a single letter.**

This is always the optimal move. Why waste an attempt on a letter when you already know what the word is?

```
Candidates: ["ankle"]     ← only one word left!

AI action:  Guess "ankle" (the full word)
Strategy:   "word_match"
Confidence: 1.0 (100% certain)
```

If the guess is right, the game ends in a win for the AI. If it's wrong (which shouldn't happen unless the word isn't in the dictionary), the AI loses an attempt and continues.

---

## 8. The Fallback — When the Word Isn't in the Dictionary

What if the human picks a word that is **not** in the AI's dictionary at all? For example, the word "quokka" might not be in the animals list.

In this case, after a few rounds of guessing, the AI's candidate list will shrink to **zero** — no words in the dictionary match the pattern. The AI recognizes this situation and switches to a completely different strategy: **English letter frequency analysis**.

### What is letter frequency?

In the English language, some letters appear far more often than others. Linguists have studied millions of words and determined the approximate frequency order:

```
e, t, a, o, i, n, s, h, r, l, d, c, u, m, f, p, g, w, y, b, v, k, x, j, q, z
```

`e` is the most common letter in English, appearing in about 13% of all text. `z` is the rarest, at about 0.07%.

### How the fallback works

When the candidate list is empty, the AI simply guesses letters in frequency order, skipping any it has already tried:

```
Already guessed: {e, a, s}

Frequency order: e, t, a, o, i, n, s, h, r, l, ...
                 ↑skip  ↑skip     ↑skip

Next guess: 't' (the most common English letter not yet guessed)
```

This is a "best effort" approach. Without any matching words in its dictionary, the AI is essentially blind and falls back to statistical probability. It won't be as smart as the candidate elimination strategy, but it's still better than random guessing.

The confidence score drops to **0.1 (10%)** when the fallback is active, reflecting the AI's uncertainty.

---

## 9. Word Construction — Guessing Words Beyond the Dictionary

The letter frequency fallback described above works well for revealing letters one at a time, but it has a limitation: it **never** attempts to guess the full word. Even if the pattern is `e m p a t h _` with only one blank left, the fallback would just guess another single letter.

**Word construction** solves this. When the dictionary yields zero candidates **and** the word is mostly revealed (1–2 blanks remaining), the AI attempts to **build** the most likely complete word by filling in the blanks.

### How it works

For each blank position, the AI scores every unguessed letter using three signals:

1. **Base frequency** — How common is this letter in English? (`e` = 12.7%, `z` = 0.07%)
2. **Positional bonus** — If the blank is the first position, letters that commonly start words (like `t`, `a`, `s`) get extra weight. If it's the last position, common ending letters (like `e`, `s`, `t`) get extra weight.
3. **Bigram bonus** — If a revealed letter is directly next to the blank, the AI checks whether the two letters form a common pair. For example, if the blank is right after `h`, then `e` gets a large bonus because `he` is the 2nd most common bigram in English.

The letter with the highest combined score fills the blank, and the AI guesses the constructed word.

### Example: "EMPATHY"

```
Pattern:     e m p a t h _
Guessed:     {e, m, p, a, t, h, s, i}     (s and i were wrong guesses)
Candidates:  0                              (empathy is not in the dictionary)
Blanks:      1                              (position 7)
```

The AI scores unguessed letters for the last position:

| Letter | Base freq | Last-position bonus | Bigram with `h` | Total |
|:---:|:---:|:---:|:---:|:---:|
| n | 6.75 | 6.6 × 1.5 = 9.9 | `hn` = 0 | **16.65** |
| d | 4.25 | 6.9 × 1.5 = 10.35 | `hd` = 0 | **14.60** |
| y | 1.97 | 5.6 × 1.5 = 8.4 | `hy` = 0 | **10.37** |

The AI first constructs and guesses **"empathn"**. That's wrong — it costs one attempt and gets recorded in `failedWordGuesses`. Next turn, "empathn" is skipped, and the AI tries **"empathd"**. Also wrong. Eventually it reaches **"empathy"** — correct!

### Why not always get it on the first try?

The construction uses general English statistics, not a dictionary. It doesn't "know" that "empathy" is a real word and "empathn" isn't. It picks letters that are statistically most likely at that position. Sometimes the most statistically common letter isn't the right one — but thanks to the `failedWordGuesses` mechanism, the AI never repeats a wrong word and keeps trying the next-best option until it succeeds.

### When construction kicks in

Construction is only attempted when:
- **Zero dictionary candidates** — The word isn't in the AI's word lists
- **At most 2 blanks remain** — Enough of the word is visible to make a reasonable guess
- **The constructed word hasn't been tried before** — Failed constructions are skipped

If there are 3 or more blanks, the AI sticks with letter-by-letter frequency guessing to reveal more letters first before attempting construction.

### Two-blank construction

When 2 blanks remain, the AI scores each blank independently, then tries combinations ordered by their combined score. For example:

```
Pattern:     _ u o k k _
Blank 1 (position 0):  best letters → i, d, h, c, ...
Blank 2 (position 5):  best letters → n, d, r, y, ...
```

It tries the highest-scoring combination first, then the next, and so on — skipping any that are in `failedWordGuesses`.

---

## 10. Full Walkthrough Example

Let's trace through a complete game to see all these steps in action.

**Setup:** The human chooses the word **"tiger"** and gives the category hint **"animals"**.

### Turn 1 — Starting fresh

```
Masked word:    _ _ _ _ _
Guessed:        (none)
```

**Step 1:** Gather all 5-letter animal words from the dictionary.
Result: 36 candidate words (e.g., horse, eagle, tiger, mouse, crane, moose, otter, goose, bison, ...).

**Step 2:** No letters guessed yet, so no filtering needed. All 36 pass.

**Step 3:** Count letter frequency across all 36 candidates:
- `e` appears in 19 of 36 words (53%)
- `o` appears in 16 of 36 words (44%)
- `a` appears in 14 of 36 words (39%)
- ... and so on

**Decision:** Guess **"e"** (highest coverage at 53%).

**Result:** `e` IS in "tiger" → Revealed at position 4.

---

### Turn 2 — One letter revealed

```
Masked word:    _ _ _ e _
Guessed:        {e}
```

**Step 1:** Gather 5-letter animal words again.

**Step 2:** Filter — only keep words where:
- Position 4 is `e`
- All other positions are NOT `e`
- The word contains `e`

Result: ~11 candidates (e.g., tiger, otter, viper, ...).

**Step 3:** Count frequencies among the 11 remaining:
- `r` appears in 9 of 11 (82%)
- `o` appears in 5 of 11 (45%)

**Decision:** Guess **"r"** (82% coverage).

**Result:** `r` IS in "tiger" → Revealed at position 5.

---

### Turn 3 — Two letters revealed

```
Masked word:    _ _ _ e r
Guessed:        {e, r}
```

**Step 2:** Filter again. Words must have `e` at position 4, `r` at position 5, no extra `e`s or `r`s in hidden spots.

Result: ~5 candidates (e.g., tiger, viper, otter... wait, otter has `r` at position 5? o-t-t-e-r — yes!).

**Step 3:** Count frequencies:
- `t` appears in 4 of 5 (80%)

**Decision:** Guess **"t"**.

**Result:** `t` IS in "tiger" → Revealed at position 1.

---

### Turn 4 — Closing in

```
Masked word:    t _ _ e r
Guessed:        {e, r, t}
```

**Step 2:** Filter. Only words matching `t _ _ e r` with no `e`, `r`, or `t` in the blank positions.

Result: ~2 candidates (e.g., tiger, timer).

**Step 3:** Count frequencies:
- `i` appears in 2 of 2 (100%)

**Decision:** Guess **"i"** (100% — guaranteed correct!).

**Result:** `i` IS in "tiger" → Revealed at position 2.

---

### Turn 5 — One candidate left

```
Masked word:    t i _ e r
Guessed:        {e, r, t, i}
```

**Step 2:** Filter. Words matching `t i _ e r`, no known letters in position 3.

Result: 1 candidate — **"tiger"**.

**Step 4 (word match):** Only one candidate remains!

**Decision:** Guess the full word **"tiger"**.

**Result:** Correct! The AI wins with **6 out of 6 attempts remaining** (no wrong guesses).

---

### Summary of this game

| Turn | Masked Word | Candidates | Strategy | Guess | Correct? |
|:---:|---|:---:|---|:---:|:---:|
| 1 | `_ _ _ _ _` | 36 | Best letter (53%) | `e` | Yes |
| 2 | `_ _ _ e _` | 11 | Best letter (82%) | `r` | Yes |
| 3 | `_ _ _ e r` | 5 | Best letter (80%) | `t` | Yes |
| 4 | `t _ _ e r` | 2 | Best letter (100%) | `i` | Yes |
| 5 | `t i _ e r` | 1 | Word match (100%) | `tiger` | Yes |

The AI solved it in 5 turns with zero wrong guesses. Notice how the candidate count shrank rapidly: 36 → 11 → 5 → 2 → 1. This is the power of candidate elimination.

---

## 11. Strategy Summary Flowchart

Every single turn, the AI follows this exact decision process:

```
START
  │
  ▼
Parse the masked word into a pattern (e.g., "a _ _ l e" → ['a','_','_','l','e'])
  │
  ▼
Gather all words of the correct length from the dictionary
  │
  ▼
Filter: keep only words that match the pattern + guessed letters (Rules 1, 2, 3)
  │
  ▼
How many candidates remain?
  │
  ├── ZERO candidates
  │     │
  │     ▼
  │     Word is not in our dictionary.
  │     How many blanks remain?
  │     │
  │     ├── 1–2 blanks → Attempt word construction.
  │     │     Fill blanks using bigram + positional scoring.
  │     │     Strategy: "word_construction"
  │     │     Confidence: 70% (1 blank) or 40% (2 blanks)
  │     │
  │     └── 3+ blanks → Fall back to English letter frequency.
  │           Pick the most common English letter not yet guessed.
  │           Strategy: "fallback_frequency"
  │           Confidence: 10%
  │
  ├── EXACTLY ONE candidate
  │     │
  │     ▼
  │     We know the word!
  │     Guess the full word.
  │     Strategy: "word_match"
  │     Confidence: 100%
  │
  └── TWO OR MORE candidates
        │
        ▼
        Count how many candidates contain each unguessed letter.
        Pick the letter with the highest count.
        Strategy: "candidate_elimination"
        Confidence: (count / total candidates)
```

---

## 12. Why This Approach Works Well

### It maximizes information per guess

Every guess the AI makes is designed to split the candidate list as evenly as possible. In information theory, this is related to the concept of **entropy** — the AI picks the guess that provides the most information regardless of whether the guess turns out to be correct or incorrect.

- **Correct guess:** The revealed letter positions help narrow candidates further.
- **Incorrect guess:** All candidates containing that letter are eliminated.

Both outcomes are useful. There is no wasted guess.

### It adapts to each game

The AI doesn't follow a fixed sequence like "always guess E first, then T, then A." It recalculates from scratch every single turn based on the current game state. If the pattern so far happens to make `r` more informative than `e`, it will guess `r` first.

### It uses category knowledge

When given a category hint, the AI's candidate pool is much smaller and more relevant. Guessing a 5-letter animal is much easier when you only consider animal words versus searching through 2,274 words across all categories.

### It knows when to go for the win

As soon as there's only one possible word left, the AI stops guessing individual letters and goes straight for the full word. This saves attempts and ends the game as early as possible.

---

## 13. Limitations and Edge Cases

### Words not in the dictionary

If the human picks a word the AI has never seen (e.g., a very rare word, slang, or a proper noun), the candidate list will eventually reach zero. The AI uses letter frequency to reveal letters, then once 1–2 blanks remain, it switches to **word construction** — assembling a full word guess using bigram and positional scoring. This means the AI *can* guess words it has never seen, but it may take a few attempts because it doesn't know which constructions are real English words and which aren't. Each failed construction is tracked and never repeated.

### Construction may take multiple attempts

The word construction phase fills blanks with the statistically most likely letters, but the most likely letter isn't always the correct one. For example, for `e m p a t h _` it might try "empathn" before "empathy" because `n` is statistically more common as a last letter than `y`. Each wrong construction costs an attempt, but the AI progresses through alternatives and will eventually reach the correct word if it has enough attempts left.

### No multi-letter pattern reasoning

The AI evaluates one letter at a time. It doesn't consider combinations like "if I guess `t` and it's correct, then the next best guess would be `h` because `th` is a common pair." A more sophisticated algorithm could look multiple moves ahead, similar to how a chess engine thinks several turns into the future.

### The candidate list is only as good as the dictionary

With 2,274 words, the dictionary covers common English words well but is not exhaustive. A larger dictionary (e.g., 50,000+ words) would improve the AI's ability to handle unusual words, though it would also make the candidate elimination process slightly slower.

### No learning between games

Each game starts fresh. The AI does not remember past games or learn from them. If you stump it with the same word ten times, it will make the same guesses each time (given the same conditions). Adding a learning mechanism (e.g., remembering words it failed to guess) would be a potential improvement.

---

*This algorithm is implemented in `backend/src/services/aiPlayerService.js` and orchestrated by `backend/src/services/gameService.js`. The frontend visualizes the AI's strategy in real time through the `AiGameBoard` component.*
