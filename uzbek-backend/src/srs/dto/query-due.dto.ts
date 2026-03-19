import { IsInt, IsOptional, IsIn, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import type { WordType } from "../../schemas/srs/user-word-progress.schema";

export class QueryDueDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;

  @IsOptional()
  @IsIn(["word", "phrase"])
  wordType?: WordType;
}
