import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WordsController } from "src/words/words.controller";
import { Word, WordSchema } from "src/schemas/words/word.schema";
import { WordsService } from "src/words/words.service";
import { WordResolver, PhraseResolver } from "./words.resolver";
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
  ],
  providers: [WordsService, WordResolver, PhraseResolver, JwtStrategy],
  controllers: [WordsController],
  exports: [WordsService],
})
export class WordsModule {}
