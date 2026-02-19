import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { WordsService } from "./words.service";
import { Word } from "../schemas/words/word.schema";

const mockModel = {
  find: () => ({ lean: () => ({ exec: () => Promise.resolve([]) }) }),
  findOne: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) }),
  deleteOne: () => ({ exec: () => Promise.resolve({ deletedCount: 0 }) }),
  findOneAndUpdate: () => ({
    lean: () => ({ exec: () => Promise.resolve(null) }),
  }),
};

describe("WordsService", () => {
  let service: WordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        { provide: getModelToken(Word.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
