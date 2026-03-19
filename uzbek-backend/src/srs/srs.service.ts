import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  UserWordProgress,
  UserWordProgressDocument,
  WordType,
} from "../schemas/srs/user-word-progress.schema";
import { ReviewWordDto } from "./dto/review-word.dto";
import { QueryDueDto } from "./dto/query-due.dto";
import { applyReview, initialState, LEARNED_THRESHOLD } from "./sm2";

@Injectable()
export class SrsService {
  constructor(
    @InjectModel(UserWordProgress.name)
    private readonly progressModel: Model<UserWordProgressDocument>,
  ) {}

  /**
   * Submit a review for a word or phrase.
   *
   * If no progress record exists yet (first encounter), one is created with
   * the initial SM-2 state and then the review is applied immediately.
   *
   * @param userId  Auth0 subject of the authenticated user.
   * @param dto     Review payload (wordId, wordType, quality 0–5).
   * @returns       Updated progress record.
   */
  async review(userId: string, dto: ReviewWordDto): Promise<UserWordProgress> {
    const { wordId, wordType, quality } = dto;

    // Load or create the progress record
    let progress = await this.progressModel.findOne({ userId, wordId }).exec();

    const now = new Date();

    if (!progress) {
      progress = new this.progressModel({
        userId,
        wordId,
        wordType,
        ...initialState(),
        learnedThreshold: LEARNED_THRESHOLD,
      });
    }

    // Apply SM-2 algorithm
    const result = applyReview(
      {
        interval: progress.interval,
        repetitions: progress.repetitions,
        easinessFactor: progress.easinessFactor,
      },
      quality,
      now,
    );

    progress.interval = result.interval;
    progress.repetitions = result.repetitions;
    progress.easinessFactor = result.easinessFactor;
    progress.nextReview = result.nextReview;
    progress.lastReviewed = now;
    progress.isLearned = result.isLearned;
    progress.encounters += 1;

    await progress.save();
    return progress.toObject() as UserWordProgress;
  }

  /**
   * Return cards due for review for this user (nextReview <= now, or never reviewed).
   *
   * Cards are ordered: never-reviewed first, then by nextReview ascending.
   */
  async getDue(
    userId: string,
    query: QueryDueDto,
  ): Promise<UserWordProgress[]> {
    const now = new Date();
    const filter: Record<string, unknown> = {
      userId,
      $or: [{ nextReview: null }, { nextReview: { $lte: now } }],
    };

    if (query.wordType) {
      filter.wordType = query.wordType;
    }

    return this.progressModel
      .find(filter)
      .sort({ nextReview: 1 })
      .limit(query.limit ?? 20)
      .lean()
      .exec() as Promise<UserWordProgress[]>;
  }

  /**
   * Return all progress records for a user, optionally filtered by wordType.
   */
  async getProgress(
    userId: string,
    wordType?: WordType,
  ): Promise<UserWordProgress[]> {
    const filter: Record<string, unknown> = { userId };
    if (wordType) filter.wordType = wordType;

    return this.progressModel
      .find(filter)
      .sort({ nextReview: 1 })
      .lean()
      .exec() as Promise<UserWordProgress[]>;
  }

  /**
   * Return the progress for a single word, or throw NotFoundException.
   */
  async getProgressForWord(
    userId: string,
    wordId: string,
  ): Promise<UserWordProgress> {
    const doc = await this.progressModel
      .findOne({ userId, wordId })
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundException(
        `No progress record found for word "${wordId}"`,
      );
    }

    return doc as UserWordProgress;
  }
}
