import { Resolver, Query, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Word as GqlWord, Phrase } from "../schemas/words/word.graphql-object";
import { Word as WordEntity } from "../schemas/words/word.schema";
import { WordsService } from "./words.service";

@UseGuards(JwtAuthGuard)
@Resolver(() => GqlWord)
export class WordResolver {
  constructor(private readonly wordsService: WordsService) {}

  @Query(() => [GqlWord], { name: "words" })
  async getWords(): Promise<GqlWord[]> {
    const words = await this.wordsService.findAll();
    // Map WordEntity to GqlWord explicitly to avoid `any`
    return words.map((w: WordEntity) => ({
      id: w.id,
      word: w.word,
      translation: w.translation,
    }));
  }

  @Query(() => GqlWord, { name: "word", nullable: true })
  async getWord(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<GqlWord | null> {
    const word = await this.wordsService.findOne(id).catch(() => null);
    if (!word) return null;
    return {
      id: word.id,
      word: word.word,
      translation: word.translation,
    };
  }
}

@UseGuards(JwtAuthGuard)
@Resolver(() => Phrase)
export class PhraseResolver {
  @Query(() => [Phrase], { name: "phrases" })
  getPhrases(): Promise<Phrase[]> {
    // TODO: Integrate with MongoDB
    return Promise.resolve([]);
  }

  @Query(() => Phrase, { name: "phrase", nullable: true })
  getPhrase(
    @Args("id", { type: () => ID }) _id: string,
  ): Promise<Phrase | null> {
    // TODO: Integrate with MongoDB
    return Promise.resolve(null);
  }
}
