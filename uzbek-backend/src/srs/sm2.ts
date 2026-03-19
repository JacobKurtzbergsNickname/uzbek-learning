/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm
 *
 * Based on the original SM-2 algorithm by Piotr Woźniak (1987):
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-super-memo-method
 *
 * This is the algorithm underlying Anki and most modern SRS systems.
 *
 * Quality ratings (q):
 *   0 – complete blackout, no recollection
 *   1 – incorrect response, but correct answer seemed easy to recall
 *   2 – incorrect response, but correct answer felt familiar
 *   3 – correct response with serious difficulty
 *   4 – correct response after a brief hesitation
 *   5 – perfect response, immediate recall
 *
 * A response with q < 3 is considered a failure (card forgotten).
 */

export const MIN_EASINESS_FACTOR = 1.3;
export const DEFAULT_EASINESS_FACTOR = 2.5;

/** Minimum successful repetitions required to mark a card as "learned". */
export const LEARNED_THRESHOLD = 3;

export interface Sm2State {
  /** Days until next review. */
  interval: number;
  /** Number of consecutive successful recalls (q >= 3). */
  repetitions: number;
  /** Easiness factor — controls how quickly intervals grow. */
  easinessFactor: number;
}

export interface Sm2Result extends Sm2State {
  /** Absolute date of the next review. */
  nextReview: Date;
  /** Whether the item has crossed the learned threshold. */
  isLearned: boolean;
}

/**
 * Apply one SM-2 review step.
 *
 * @param state  Current SM-2 state of the card.
 * @param quality  Quality of the response (0–5).
 * @param now  Reference "now" (defaults to current date; injectable for testing).
 */
export function applyReview(
  state: Sm2State,
  quality: number,
  now: Date = new Date(),
): Sm2Result {
  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new RangeError(
      `quality must be an integer in [0, 5], got ${quality}`,
    );
  }

  let { interval, repetitions, easinessFactor } = state;

  if (quality >= 3) {
    // Successful recall — advance the schedule
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
  } else {
    // Failed recall — reset to the beginning
    interval = 1;
    repetitions = 0;
  }

  // Update easiness factor (can change on both success and failure)
  easinessFactor =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easinessFactor = Math.max(MIN_EASINESS_FACTOR, easinessFactor);

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    repetitions,
    easinessFactor,
    nextReview,
    isLearned: repetitions >= LEARNED_THRESHOLD,
  };
}

/** Create the initial SM-2 state for a brand-new card. */
export function initialState(): Sm2State {
  return {
    interval: 0,
    repetitions: 0,
    easinessFactor: DEFAULT_EASINESS_FACTOR,
  };
}
