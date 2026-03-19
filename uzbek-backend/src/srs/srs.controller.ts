import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { SrsService } from "./srs.service";
import { ReviewWordDto } from "./dto/review-word.dto";
import { QueryDueDto } from "./dto/query-due.dto";
import type { WordType } from "../schemas/srs/user-word-progress.schema";

interface AuthenticatedRequest extends Request {
  user: { userId: string; [key: string]: unknown };
}

@Controller("srs")
export class SrsController {
  constructor(private readonly srsService: SrsService) {}

  /**
   * POST /srs/review
   *
   * Submit a quality-rated review for a word or phrase.
   * Quality must be 0–5 (SM-2 scale).
   */
  @Post("review")
  review(@Req() req: AuthenticatedRequest, @Body() dto: ReviewWordDto) {
    return this.srsService.review(req.user.userId, dto);
  }

  /**
   * GET /srs/due
   *
   * Returns cards that are due for review right now.
   * Ordered: never-reviewed first, then by nextReview ascending.
   *
   * Query params:
   *   - limit (1–200, default 20)
   *   - wordType ("word" | "phrase")
   */
  @Get("due")
  getDue(@Req() req: AuthenticatedRequest, @Query() query: QueryDueDto) {
    return this.srsService.getDue(req.user.userId, query);
  }

  /**
   * GET /srs/progress
   *
   * Returns all SRS progress records for the current user.
   *
   * Query params:
   *   - wordType ("word" | "phrase")
   */
  @Get("progress")
  getProgress(
    @Req() req: AuthenticatedRequest,
    @Query("wordType") wordType?: WordType,
  ) {
    return this.srsService.getProgress(req.user.userId, wordType);
  }

  /**
   * GET /srs/progress/:wordId
   *
   * Returns the SRS progress for a single word.
   * 404 if the word has never been reviewed by this user.
   */
  @Get("progress/:wordId")
  getProgressForWord(
    @Req() req: AuthenticatedRequest,
    @Param("wordId") wordId: string,
  ) {
    return this.srsService.getProgressForWord(req.user.userId, wordId);
  }
}
