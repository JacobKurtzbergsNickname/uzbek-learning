import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  UserWordProgress,
  UserWordProgressSchema,
} from "../schemas/srs/user-word-progress.schema";
import { SrsService } from "./srs.service";
import { SrsController } from "./srs.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserWordProgress.name, schema: UserWordProgressSchema },
    ]),
  ],
  providers: [SrsService],
  controllers: [SrsController],
  exports: [SrsService],
})
export class SrsModule {}
