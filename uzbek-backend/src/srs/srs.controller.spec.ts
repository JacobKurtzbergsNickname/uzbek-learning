import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { SrsController } from "./srs.controller";
import { SrsService } from "./srs.service";
import { DEFAULT_EASINESS_FACTOR, LEARNED_THRESHOLD } from "./sm2";
import { UserWordProgress } from "../schemas/srs/user-word-progress.schema";

// ── Helpers ────────────────────────────────────────────────────────────────

const USER_ID = "auth0|test-user";
const WORD_ID = "word-uuid-5678";

function makeRequest(userId = USER_ID) {
  return { user: { userId } } as unknown as import("express").Request & {
    user: { userId: string };
  };
}

function makeProgress(
  overrides: Partial<UserWordProgress> = {},
): UserWordProgress {
  return {
    id: "progress-uuid",
    userId: USER_ID,
    wordId: WORD_ID,
    wordType: "word",
    easinessFactor: DEFAULT_EASINESS_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReview: null,
    lastReviewed: null,
    encounters: 0,
    isLearned: false,
    learnedThreshold: LEARNED_THRESHOLD,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  } as UserWordProgress;
}

const mockSrsService = {
  review: jest.fn(),
  getDue: jest.fn(),
  getProgress: jest.fn(),
  getProgressForWord: jest.fn(),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SrsController", () => {
  let controller: SrsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SrsController],
      providers: [{ provide: SrsService, useValue: mockSrsService }],
    }).compile();

    controller = module.get<SrsController>(SrsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  // ── POST /srs/review ───────────────────────────────────────────────────

  describe("review()", () => {
    it("calls SrsService.review with userId and dto", async () => {
      const expected = makeProgress({ repetitions: 1, interval: 1 });
      mockSrsService.review.mockResolvedValue(expected);

      const dto = { wordId: WORD_ID, wordType: "word" as const, quality: 4 };
      const result = await controller.review(makeRequest(), dto);

      expect(mockSrsService.review).toHaveBeenCalledWith(USER_ID, dto);
      expect(result).toEqual(expected);
    });

    it("propagates errors from the service", async () => {
      mockSrsService.review.mockRejectedValue(new Error("DB error"));

      await expect(
        controller.review(makeRequest(), {
          wordId: WORD_ID,
          wordType: "word",
          quality: 3,
        }),
      ).rejects.toThrow("DB error");
    });
  });

  // ── GET /srs/due ───────────────────────────────────────────────────────

  describe("getDue()", () => {
    it("calls SrsService.getDue with userId and query", async () => {
      const expected = [makeProgress()];
      mockSrsService.getDue.mockResolvedValue(expected);

      const query = { limit: 10, wordType: "word" as const };
      const result = await controller.getDue(makeRequest(), query);

      expect(mockSrsService.getDue).toHaveBeenCalledWith(USER_ID, query);
      expect(result).toEqual(expected);
    });

    it("returns an empty array when nothing is due", async () => {
      mockSrsService.getDue.mockResolvedValue([]);

      const result = await controller.getDue(makeRequest(), {});

      expect(result).toEqual([]);
    });
  });

  // ── GET /srs/progress ─────────────────────────────────────────────────

  describe("getProgress()", () => {
    it("calls SrsService.getProgress with userId only when no wordType", async () => {
      const expected = [makeProgress()];
      mockSrsService.getProgress.mockResolvedValue(expected);

      const result = await controller.getProgress(makeRequest());

      expect(mockSrsService.getProgress).toHaveBeenCalledWith(
        USER_ID,
        undefined,
      );
      expect(result).toEqual(expected);
    });

    it("passes wordType filter to the service", async () => {
      mockSrsService.getProgress.mockResolvedValue([]);

      await controller.getProgress(makeRequest(), "phrase");

      expect(mockSrsService.getProgress).toHaveBeenCalledWith(
        USER_ID,
        "phrase",
      );
    });
  });

  // ── GET /srs/progress/:wordId ─────────────────────────────────────────

  describe("getProgressForWord()", () => {
    it("calls SrsService.getProgressForWord with userId and wordId", async () => {
      const expected = makeProgress();
      mockSrsService.getProgressForWord.mockResolvedValue(expected);

      const result = await controller.getProgressForWord(
        makeRequest(),
        WORD_ID,
      );

      expect(mockSrsService.getProgressForWord).toHaveBeenCalledWith(
        USER_ID,
        WORD_ID,
      );
      expect(result).toEqual(expected);
    });

    it("propagates NotFoundException from the service", async () => {
      mockSrsService.getProgressForWord.mockRejectedValue(
        new NotFoundException("No progress record found"),
      );

      await expect(
        controller.getProgressForWord(makeRequest(), "unknown-word"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
