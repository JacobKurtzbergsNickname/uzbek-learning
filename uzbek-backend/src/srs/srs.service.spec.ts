/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { SrsService } from "./srs.service";
import { UserWordProgress } from "../schemas/srs/user-word-progress.schema";
import { DEFAULT_EASINESS_FACTOR, LEARNED_THRESHOLD } from "./sm2";

// ── Mock helpers ───────────────────────────────────────────────────────────

const USER_ID = "auth0|test-user";
const WORD_ID = "word-uuid-1234";

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

/** A document mock that carries mutable SM-2 state. */
function makeDocumentMock(initial: Partial<UserWordProgress> = {}) {
  const state = makeProgress(initial);
  const doc = {
    ...state,
    save: jest.fn().mockResolvedValue(undefined),
    toObject: jest.fn(() => ({ ...state })),
  };
  // Mirror property mutations onto `state` so toObject reflects them
  return new Proxy(doc, {
    set(target, prop, value) {
      (target as Record<string | symbol, unknown>)[prop] = value;
      (state as Record<string | symbol, unknown>)[prop] = value;
      return true;
    },
  });
}

function buildMockModel(
  existingDoc: ReturnType<typeof makeDocumentMock> | null = null,
) {
  const mockModel = jest.fn().mockImplementation(() => makeDocumentMock());

  mockModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(existingDoc),
  });

  mockModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  });

  return mockModel;
}

// ── Test suite ─────────────────────────────────────────────────────────────

describe("SrsService", () => {
  let service: SrsService;
  let mockModel: ReturnType<typeof buildMockModel>;

  async function createModule(
    existingDoc: ReturnType<typeof makeDocumentMock> | null = null,
  ) {
    mockModel = buildMockModel(existingDoc);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SrsService,
        {
          provide: getModelToken(UserWordProgress.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SrsService>(SrsService);
  }

  // ── review() ──────────────────────────────────────────────────────────────

  describe("review()", () => {
    it("creates a new progress record when none exists", async () => {
      await createModule(null); // no existing doc → model constructor called

      const result = await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 4,
      });

      // Constructor was called to create a new document
      expect(mockModel).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("increments encounters on each review", async () => {
      const existing = makeDocumentMock({ encounters: 2 });
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 4,
      });

      expect(existing.encounters).toBe(3);
      expect(existing.save).toHaveBeenCalled();
    });

    it("applies SM-2 state correctly on a successful review", async () => {
      const existing = makeDocumentMock();
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 5,
      });

      expect(existing.repetitions).toBe(1);
      expect(existing.interval).toBe(1);
      expect(existing.nextReview).not.toBeNull();
    });

    it("resets repetitions and interval on a failed review (q < 3)", async () => {
      // Card has been reviewed twice successfully
      const existing = makeDocumentMock({ repetitions: 2, interval: 6 });
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 1,
      });

      expect(existing.repetitions).toBe(0);
      expect(existing.interval).toBe(1);
    });

    it("sets isLearned=true once LEARNED_THRESHOLD is reached", async () => {
      // Card is one review away from learned
      const existing = makeDocumentMock({
        repetitions: LEARNED_THRESHOLD - 1,
        interval: 6,
      });
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 4,
      });

      expect(existing.isLearned).toBe(true);
    });

    it("sets isLearned=false after failure resets repetitions", async () => {
      const existing = makeDocumentMock({
        repetitions: LEARNED_THRESHOLD,
        interval: 15,
        isLearned: true,
      });
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 0,
      });

      expect(existing.isLearned).toBe(false);
    });

    it("sets lastReviewed to approximately now", async () => {
      const before = Date.now();
      const existing = makeDocumentMock();
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 4,
      });

      const after = Date.now();
      expect(existing.lastReviewed).toBeInstanceOf(Date);
      const ts = (existing.lastReviewed as Date).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it("persists changes by calling save()", async () => {
      const existing = makeDocumentMock();
      await createModule(existing);

      await service.review(USER_ID, {
        wordId: WORD_ID,
        wordType: "word",
        quality: 4,
      });

      expect(existing.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── getDue() ──────────────────────────────────────────────────────────────

  describe("getDue()", () => {
    it("queries for null nextReview or nextReview <= now", async () => {
      await createModule();

      await service.getDue(USER_ID, { limit: 10 });

      const findArg = (mockModel.find as jest.Mock).mock.calls[0][0] as {
        userId: string;
        $or: Array<Record<string, unknown>>;
      };
      expect(findArg.userId).toBe(USER_ID);
      expect(findArg.$or).toEqual(
        expect.arrayContaining([
          { nextReview: null },
          { nextReview: expect.objectContaining({ $lte: expect.any(Date) }) },
        ]) as unknown[],
      );
    });

    it("applies the wordType filter when provided", async () => {
      await createModule();

      await service.getDue(USER_ID, { limit: 5, wordType: "phrase" });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ wordType: "phrase" }),
      );
    });

    it("uses default limit of 20 when not specified", async () => {
      await createModule();

      await service.getDue(USER_ID, {});

      const chainMock = (mockModel.find as jest.Mock).mock
        .results[0] as jest.MockResult<{ limit: jest.Mock }>;
      expect(chainMock.value.limit).toHaveBeenCalledWith(20);
    });

    it("respects a custom limit", async () => {
      await createModule();

      await service.getDue(USER_ID, { limit: 7 });

      const chainMock = (mockModel.find as jest.Mock).mock
        .results[0] as jest.MockResult<{ limit: jest.Mock }>;
      expect(chainMock.value.limit).toHaveBeenCalledWith(7);
    });

    it("does NOT include wordType in query when not provided", async () => {
      await createModule();

      await service.getDue(USER_ID, { limit: 10 });

      const findArg = (mockModel.find as jest.Mock).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(findArg).not.toHaveProperty("wordType");
    });
  });

  // ── getProgress() ─────────────────────────────────────────────────────────

  describe("getProgress()", () => {
    it("returns all progress records for the user", async () => {
      await createModule();

      await service.getProgress(USER_ID);

      expect(mockModel.find).toHaveBeenCalledWith({ userId: USER_ID });
    });

    it("adds wordType filter when provided", async () => {
      await createModule();

      await service.getProgress(USER_ID, "word");

      expect(mockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        wordType: "word",
      });
    });
  });

  // ── getProgressForWord() ──────────────────────────────────────────────────

  describe("getProgressForWord()", () => {
    it("returns the progress document when found", async () => {
      const doc = makeProgress();
      mockModel = buildMockModel();
      mockModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(doc),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SrsService,
          {
            provide: getModelToken(UserWordProgress.name),
            useValue: mockModel,
          },
        ],
      }).compile();
      service = module.get<SrsService>(SrsService);

      const result = await service.getProgressForWord(USER_ID, WORD_ID);
      expect(result).toEqual(doc);
    });

    it("throws NotFoundException when no record exists", async () => {
      mockModel = buildMockModel();
      mockModel.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SrsService,
          {
            provide: getModelToken(UserWordProgress.name),
            useValue: mockModel,
          },
        ],
      }).compile();
      service = module.get<SrsService>(SrsService);

      await expect(
        service.getProgressForWord(USER_ID, "unknown-word"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
