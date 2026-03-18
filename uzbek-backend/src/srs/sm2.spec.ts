import {
  applyReview,
  initialState,
  Sm2State,
  DEFAULT_EASINESS_FACTOR,
  MIN_EASINESS_FACTOR,
  LEARNED_THRESHOLD,
} from "./sm2";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fixed reference date for deterministic tests. */
const NOW = new Date("2024-01-01T00:00:00.000Z");

function daysFromNow(days: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() + days);
  return d;
}

function fresh(): Sm2State {
  return initialState();
}

// ── initialState ───────────────────────────────────────────────────────────

describe("initialState()", () => {
  it("returns the correct defaults", () => {
    const s = initialState();
    expect(s.interval).toBe(0);
    expect(s.repetitions).toBe(0);
    expect(s.easinessFactor).toBe(DEFAULT_EASINESS_FACTOR);
  });
});

// ── applyReview — input validation ────────────────────────────────────────

describe("applyReview() — input validation", () => {
  it("throws RangeError for quality below 0", () => {
    expect(() => applyReview(fresh(), -1, NOW)).toThrow(RangeError);
  });

  it("throws RangeError for quality above 5", () => {
    expect(() => applyReview(fresh(), 6, NOW)).toThrow(RangeError);
  });

  it("throws RangeError for non-integer quality", () => {
    expect(() => applyReview(fresh(), 2.5, NOW)).toThrow(RangeError);
  });

  it("accepts all valid integer qualities 0–5", () => {
    for (let q = 0; q <= 5; q++) {
      expect(() => applyReview(fresh(), q, NOW)).not.toThrow();
    }
  });
});

// ── applyReview — interval scheduling ────────────────────────────────────

describe("applyReview() — interval scheduling", () => {
  it("sets interval=1 on first successful review (q=4)", () => {
    const result = applyReview(fresh(), 4, NOW);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("sets interval=6 on second consecutive successful review", () => {
    const s1 = applyReview(fresh(), 4, NOW);
    const result = applyReview(s1, 4, NOW);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it("multiplies interval by EF on third+ successful review", () => {
    const s1 = applyReview(fresh(), 5, NOW); // interval=1, EF slightly up
    const s2 = applyReview(s1, 5, NOW);       // interval=6
    const s3 = applyReview(s2, 5, NOW);       // interval = round(6 * EF)
    expect(s3.interval).toBe(Math.round(6 * s2.easinessFactor));
    expect(s3.repetitions).toBe(3);
  });

  it("resets interval to 1 on failure (q=0)", () => {
    // Build up some state first
    const s1 = applyReview(fresh(), 4, NOW);
    const s2 = applyReview(s1, 4, NOW);
    const failed = applyReview(s2, 0, NOW);
    expect(failed.interval).toBe(1);
    expect(failed.repetitions).toBe(0);
  });

  it("resets interval to 1 on failure (q=2, boundary)", () => {
    const s1 = applyReview(fresh(), 5, NOW);
    const failed = applyReview(s1, 2, NOW);
    expect(failed.interval).toBe(1);
    expect(failed.repetitions).toBe(0);
  });

  it("treats q=3 as the minimum passing grade (no reset)", () => {
    const s1 = applyReview(fresh(), 3, NOW);
    expect(s1.repetitions).toBe(1);
    expect(s1.interval).toBe(1);
  });
});

// ── applyReview — nextReview date ─────────────────────────────────────────

describe("applyReview() — nextReview date", () => {
  it("schedules nextReview exactly `interval` days from now", () => {
    const result = applyReview(fresh(), 4, NOW);
    expect(result.nextReview).toEqual(daysFromNow(result.interval));
  });

  it("schedules nextReview 6 days out after second success", () => {
    const s1 = applyReview(fresh(), 4, NOW);
    const result = applyReview(s1, 4, NOW);
    expect(result.nextReview).toEqual(daysFromNow(6));
  });

  it("schedules nextReview 1 day out after a failure", () => {
    const s1 = applyReview(fresh(), 5, NOW);
    const s2 = applyReview(s1, 5, NOW);
    const failed = applyReview(s2, 1, NOW);
    expect(failed.nextReview).toEqual(daysFromNow(1));
  });

  it("does not mutate the `now` argument", () => {
    const before = NOW.toISOString();
    applyReview(fresh(), 4, NOW);
    expect(NOW.toISOString()).toBe(before);
  });
});

// ── applyReview — easiness factor ─────────────────────────────────────────

describe("applyReview() — easiness factor", () => {
  it("increases EF on perfect recall (q=5)", () => {
    const result = applyReview(fresh(), 5, NOW);
    expect(result.easinessFactor).toBeGreaterThan(DEFAULT_EASINESS_FACTOR);
  });

  it("decreases EF on difficult success (q=3)", () => {
    const result = applyReview(fresh(), 3, NOW);
    expect(result.easinessFactor).toBeLessThan(DEFAULT_EASINESS_FACTOR);
  });

  it("q=4 keeps EF unchanged (neutral point in SM-2)", () => {
    const result = applyReview(fresh(), 4, NOW);
    // EF change = 0.1 - (5-4)*(0.08 + (5-4)*0.02) = 0.1 - 0.10 = 0.00
    expect(result.easinessFactor).toBeCloseTo(DEFAULT_EASINESS_FACTOR, 5);
  });

  it("never drops EF below MIN_EASINESS_FACTOR", () => {
    // Simulate many failures
    let state = fresh();
    for (let i = 0; i < 20; i++) {
      state = applyReview(state, 0, NOW);
    }
    expect(state.easinessFactor).toBeGreaterThanOrEqual(MIN_EASINESS_FACTOR);
  });

  it("applies correct SM-2 EF formula for q=5", () => {
    // EF_new = 2.5 + 0.1 - (5-5)*(0.08 + (5-5)*0.02) = 2.5 + 0.1 = 2.6
    const result = applyReview(fresh(), 5, NOW);
    expect(result.easinessFactor).toBeCloseTo(2.6, 5);
  });

  it("applies correct SM-2 EF formula for q=0", () => {
    // EF_new = 2.5 + 0.1 - 5*(0.08 + 5*0.02) = 2.5 + 0.1 - 5*0.18 = 2.6 - 0.9 = 1.7
    const result = applyReview(fresh(), 0, NOW);
    expect(result.easinessFactor).toBeCloseTo(1.7, 5);
  });
});

// ── applyReview — isLearned ────────────────────────────────────────────────

describe("applyReview() — isLearned", () => {
  it("is false before crossing LEARNED_THRESHOLD", () => {
    let state = fresh();
    for (let i = 0; i < LEARNED_THRESHOLD - 1; i++) {
      state = applyReview(state, 5, NOW);
    }
    expect(state.isLearned).toBe(false);
    expect(state.repetitions).toBe(LEARNED_THRESHOLD - 1);
  });

  it("becomes true exactly at LEARNED_THRESHOLD consecutive successes", () => {
    let state = fresh();
    for (let i = 0; i < LEARNED_THRESHOLD; i++) {
      state = applyReview(state, 5, NOW);
    }
    expect(state.isLearned).toBe(true);
    expect(state.repetitions).toBe(LEARNED_THRESHOLD);
  });

  it("stays true beyond LEARNED_THRESHOLD with continued success", () => {
    let state = fresh();
    for (let i = 0; i < LEARNED_THRESHOLD + 5; i++) {
      state = applyReview(state, 5, NOW);
    }
    expect(state.isLearned).toBe(true);
  });

  it("becomes false again after a failure resets repetitions", () => {
    // Learn the card
    let state = fresh();
    for (let i = 0; i < LEARNED_THRESHOLD; i++) {
      state = applyReview(state, 5, NOW);
    }
    expect(state.isLearned).toBe(true);

    // Fail it
    state = applyReview(state, 0, NOW);
    expect(state.isLearned).toBe(false);
    expect(state.repetitions).toBe(0);
  });
});

// ── applyReview — longer review sequences ─────────────────────────────────

describe("applyReview() — realistic review sequences", () => {
  it("correctly schedules a 5-step successful learning sequence", () => {
    let state = fresh();
    const intervals: number[] = [];

    for (let i = 0; i < 5; i++) {
      state = applyReview(state, 5, NOW);
      intervals.push(state.interval);
    }

    // Per SM-2: 1, 6, then growing by EF each time
    expect(intervals[0]).toBe(1);
    expect(intervals[1]).toBe(6);
    expect(intervals[2]).toBeGreaterThan(6);
    expect(intervals[3]).toBeGreaterThan(intervals[2]);
    expect(intervals[4]).toBeGreaterThan(intervals[3]);
  });

  it("recovers correctly after a mid-sequence failure", () => {
    let state = fresh();
    state = applyReview(state, 5, NOW); // rep=1, interval=1
    state = applyReview(state, 5, NOW); // rep=2, interval=6
    state = applyReview(state, 5, NOW); // rep=3, interval=round(6*EF)

    const intervalBeforeFailure = state.interval;

    // Fail
    state = applyReview(state, 1, NOW);
    expect(state.repetitions).toBe(0);
    expect(state.interval).toBe(1);

    // Recover — intervals should restart from scratch
    state = applyReview(state, 5, NOW);
    expect(state.interval).toBe(1);
    state = applyReview(state, 5, NOW);
    expect(state.interval).toBe(6);
    state = applyReview(state, 5, NOW);
    // Should be less than the pre-failure interval because EF was penalised
    expect(state.interval).toBeLessThan(intervalBeforeFailure);
  });
});
