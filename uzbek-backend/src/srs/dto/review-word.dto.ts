import { IsIn, IsInt, IsString, Max, Min, MinLength } from "class-validator";
import { WordType } from "../../schemas/srs/user-word-progress.schema";

export class ReviewWordDto {
  @IsString()
  @MinLength(1)
  wordId: string;

  @IsIn(["word", "phrase"])
  wordType: WordType;

  /**
   * SM-2 quality rating of the recall:
   *   0 – complete blackout
   *   1 – incorrect, correct seemed easy
   *   2 – incorrect, correct felt familiar
   *   3 – correct with serious difficulty
   *   4 – correct after brief hesitation
   *   5 – perfect, immediate recall
   */
  @IsInt()
  @Min(0)
  @Max(5)
  quality: number;
}
