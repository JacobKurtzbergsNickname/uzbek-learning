import { Test, TestingModule } from "@nestjs/testing";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";

const mockWordsService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(null),
  patch: jest.fn().mockResolvedValue(null),
  put: jest.fn().mockResolvedValue(null),
  remove: jest.fn().mockResolvedValue({ deleted: false }),
};

describe("WordsController", () => {
  let controller: WordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordsController],
      providers: [{ provide: WordsService, useValue: mockWordsService }],
    }).compile();

    controller = module.get<WordsController>(WordsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
