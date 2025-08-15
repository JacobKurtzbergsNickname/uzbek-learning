import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { WordsService } from "./words.service";
import { CreateWordDto } from "./dto/create-word.dto";
import { QueryWordsDto } from "./dto/query-words.dto";

@Controller("words")
export class WordsController {
  constructor(private readonly words: WordsService) {}

  @Get()
  list(@Query() q: QueryWordsDto) {
    return this.words.findAll(q.language);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.words.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWordDto) {
    return this.words.create({
      word: dto.word,
      translation: dto.translation,
      partOfSpeech: dto.partOfSpeech,
      language: dto.language ?? "uz",
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.words.remove(id);
  }
}
