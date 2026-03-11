// jwks-rsa pulls in `jose` which is pure-ESM; mock the whole module so
// ts-jest (CommonJS) can import JwtStrategy without hitting ESM syntax.
jest.mock("jwks-rsa", () => ({
  __esModule: true,
  default: {
    passportJwtSecret: jest.fn(() => jest.fn()),
  },
  passportJwtSecret: jest.fn(() => jest.fn()),
}));

import { JwtStrategy } from "./jwt.strategy";
import { ConfigService } from "@nestjs/config";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: (key: string) => {
      if (key === "AUTH0_DOMAIN") return "example.auth0.com";
      if (key === "AUTH0_AUDIENCE") return "test-audience";
      return undefined;
    },
  } as ConfigService;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfigService);
  });

  it("returns user object from payload", () => {
    const payload = {
      sub: "abc123",
      username: "tester",
      email: "test@example.com",
    };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: "abc123",
      email: "test@example.com",
      sub: "abc123",
      username: "tester",
    });
  });
});
