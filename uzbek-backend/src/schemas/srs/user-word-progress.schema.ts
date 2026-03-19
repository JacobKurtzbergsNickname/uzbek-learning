import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_EASINESS_FACTOR, LEARNED_THRESHOLD } from "../../srs/sm2";

export type UserWordProgressDocument = UserWordProgress & Document;

export type WordType = "word" | "phrase";

@Schema({
  timestamps: true,
  collection: "UserWordProgress",
})
export class UserWordProgress {
  @Prop({ default: uuidv4, unique: true })
  id: string;

  /** Auth0 subject (sub) of the user. */
  @Prop({ required: true, index: true })
  userId: string;

  /** UUID of the word or phrase being tracked. */
  @Prop({ required: true })
  wordId: string;

  /** Distinguishes between 'word' and 'phrase' entities. */
  @Prop({ required: true, enum: ["word", "phrase"] })
  wordType: WordType;

  // ── SM-2 state ────────────────────────────────────────────────────────────

  /**
   * Easiness factor (EF). Controls how quickly intervals grow.
   * Starts at 2.5, minimum 1.3 (per SM-2 spec).
   */
  @Prop({ required: true, default: DEFAULT_EASINESS_FACTOR })
  easinessFactor: number;

  /**
   * Current review interval in days.
   * 0 means the card has never been reviewed.
   */
  @Prop({ required: true, default: 0 })
  interval: number;

  /**
   * Number of consecutive successful recalls (quality >= 3).
   * Resets to 0 on failure.
   */
  @Prop({ required: true, default: 0 })
  repetitions: number;

  // ── Scheduling ────────────────────────────────────────────────────────────

  /**
   * When the card is next due for review.
   * Null for cards that have never been reviewed (review them immediately).
   */
  @Prop({ type: Date, default: null })
  nextReview: Date | null;

  /** When the card was last reviewed. Null if never. */
  @Prop({ type: Date, default: null })
  lastReviewed: Date | null;

  // ── Aggregate stats ───────────────────────────────────────────────────────

  /** Total number of times this card has been shown (including failures). */
  @Prop({ required: true, default: 0 })
  encounters: number;

  /**
   * True once repetitions crosses LEARNED_THRESHOLD.
   * Once learned the card re-enters periodic review at longer intervals.
   */
  @Prop({ required: true, default: false })
  isLearned: boolean;

  /** Snapshot of the threshold used when isLearned was set. */
  @Prop({ required: true, default: LEARNED_THRESHOLD })
  learnedThreshold: number;

  // ── Timestamps (filled by `timestamps: true`) ─────────────────────────────
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const UserWordProgressSchema = SchemaFactory.createForClass(UserWordProgress);

// Compound unique index: one progress record per user per tracked item
UserWordProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export { UserWordProgressSchema };
