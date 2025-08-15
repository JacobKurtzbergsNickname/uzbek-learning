import { IsString, MinLength } from "class-validator";

export class CreateWordDto {
  @IsString()
  @MinLength(1)
  word: string;

  @IsString()
  @MinLength(1)
  language: string;

  @IsString()
  @MinLength(1)
  translation: string;

  @IsString()
  @MinLength(1)
  partOfSpeech: string;
}
