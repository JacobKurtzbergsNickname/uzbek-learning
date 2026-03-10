import { Injectable, ExecutionContext, Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug("canActivate called");
      this.logger.debug(`Context type: ${context.getType?.()}`);
    }
    // allow routes marked with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      if (process.env.NODE_ENV !== "production") {
        this.logger.debug("Route is public, skipping auth guard.");
      }
      return true;
    }

    const result = super.canActivate(context);
    if (typeof result === "boolean") {
      if (process.env.NODE_ENV !== "production") {
        this.logger.debug(`super.canActivate result: ${result}`);
      }
      return result;
    } else if (result instanceof Promise) {
      return result.then((res) => {
        if (process.env.NODE_ENV !== "production") {
          this.logger.debug(`super.canActivate result (async): ${res}`);
        }
        return res;
      });
    } else if (result && typeof result.subscribe === "function") {
      // Observable
      result.subscribe((res) => {
        if (process.env.NODE_ENV !== "production") {
          this.logger.debug(`super.canActivate result (observable): ${res}`);
        }
      });
      return result;
    }
    return result;
  }

  // support both HTTP and GraphQL contexts
  getRequest(context: ExecutionContext): Request {
    let req: Request;
    if (isGraphQLContext(context)) {
      const gql = GqlExecutionContext.create(context);
      req = gql.getContext<{ req: Request }>().req;
    } else {
      req = context.switchToHttp().getRequest<Request>();
    }
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug(`getRequest: method=${req.method}, url=${req.url}`);
      this.logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
      if (req.headers.authorization) {
        this.logger.debug(`Authorization header: ${req.headers.authorization}`);
      }
    }
    return req;
  }
}
