import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwksRsa from "jwks-rsa";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>("AUTH0_DOMAIN");
    const audience = configService.get<string>("AUTH0_AUDIENCE");

    if (!domain || !audience) {
      throw new Error(
        "Missing AUTH0_DOMAIN or AUTH0_AUDIENCE environment variables",
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      audience,
      issuer: `https://${domain}/`,
      algorithms: ["RS256"],
    });
  }

  validate(payload: Auth0JwtPayload) {
    // Optionally, you can fetch or create a user in your DB here
    if (!payload || !payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      email: payload.email,
      ...payload,
    };
  }
}
export interface Auth0JwtPayload {
  sub: string;
  email?: string;
  [key: string]: unknown;
}
