import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Request } from "express"; // <-- Use Express Request type

function isGraphQLContext(context: ExecutionContext): boolean {
  // getType() returns string at runtime, but TS type does not include 'graphql'
  return (context.getType() as unknown as string) === "graphql";
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // allow routes marked with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  // support both HTTP and GraphQL contexts
  getRequest(context: ExecutionContext): Request {
    if (isGraphQLContext(context)) {
      const gql = GqlExecutionContext.create(context);
      return gql.getContext<{ req: Request }>().req;
    }
    return context.switchToHttp().getRequest<Request>();
  }
}
