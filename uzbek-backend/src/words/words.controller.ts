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
  UseGuards,
  Req,
  Logger,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { WordsService } from "./words.service";
import { CreateWordDto } from "./dto/create-word.dto";
import { QueryWordsDto } from "./dto/query-words.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { Public } from "../auth/public.decorator";

@UseGuards(JwtAuthGuard)
@Controller("words")
export class WordsController {
  constructor(private readonly words: WordsService) {}
  private readonly logger = new Logger(WordsController.name);

  @Public()
  @Get()
  list(
    @Query() q: QueryWordsDto,
    @Req() req: { user?: { sub?: string }; headers: Record<string, any> },
  ) {
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug(`list() called by user: ${req.user?.sub || "unknown"}`);
      this.logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
    }
    return this.words.findAll(q.language);
  }

  @Public()
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
