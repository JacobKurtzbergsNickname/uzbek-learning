import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { HttpException } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class GlobalExceptionLogger implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionLogger.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error("Unhandled exception:", exception);
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const body = exception.getResponse() as Record<string, string>;
      response.status(status).json({
        statusCode: status,
        message: exception.message,
        error: body?.error ?? exception.name,
      });
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      response.status(500).json({
        statusCode: 500,
        message: "Internal server error",
        error: exception instanceof Error ? exception.message : "Unknown error",
      });
    }
  }
}
import { Module } from "@nestjs/common";
import { WordsModule } from "./words/words.module";
import { UsersModule } from "./users/users.module";
import { SrsModule } from "./srs/srs.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        uri: cs.get<string>("MONGO_URI")!,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      installSubscriptionHandlers: true,
      context: ({ req }: { req: unknown }) => ({ req }),
    }),
    WordsModule,
    UsersModule,
    SrsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionLogger,
    },
  ],
})
export class AppModule {}
