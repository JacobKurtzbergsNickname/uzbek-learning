import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Patch,
  Put,
} from "@nestjs/common";
import { WordsService } from "./words.service";
import { CreateWordDto } from "./dto/create-word.dto";
import { QueryWordsDto } from "./dto/query-words.dto";
import { UpdateWordDto } from "./dto/update-word.dto";

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

  @Patch(":id")
  patch(@Param("id") id: string, @Body() dto: UpdateWordDto) {
    return this.words.patch(id, dto);
  }

  @Put(":id")
  put(@Param("id") id: string, @Body() dto: CreateWordDto) {
    return this.words.put(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.words.remove(id);
  }
}
