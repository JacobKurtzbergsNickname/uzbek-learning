import { Module } from "@nestjs/common";
import { WordsModule } from "./words/words.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        uri: cs.get<string>("MONGO_URI")!,
      }),
    }),
    WordsModule,
  ],
})
export class AppModule {}
