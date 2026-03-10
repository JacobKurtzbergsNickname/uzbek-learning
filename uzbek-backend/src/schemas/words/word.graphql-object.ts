import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Word {
  @Field(() => ID)
  id: string;

  @Field()
  word: string;

  @Field()
  translation: string;
}

@ObjectType()
export class Phrase {
  @Field(() => ID)
  id: string;

  @Field(() => [Word])
  words: Word[];

  @Field()
  meaning: string;
}
