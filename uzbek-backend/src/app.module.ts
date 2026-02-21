import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

@Catch()
export class GlobalExceptionLogger implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionLogger.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error("Unhandled exception:", exception);
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
      response.status(status).json({
        statusCode: status,
        message: exception.message,
        error: exception["response"]?.error || exception.name,
      });
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      response.status(500).json({
        statusCode: 500,
        message: "Internal server error",
        error: (exception as any)?.message || "Unknown error",
      });
    }
  }
}
import { Module } from "@nestjs/common";
import { WordsModule } from "./words/words.module";
import { UsersModule } from "./users/users.module";
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
