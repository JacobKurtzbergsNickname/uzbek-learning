# Auth0 Backend Integration (NestJS)

## Prerequisites

- Node.js, npm, NestJS
- @nestjs/jwt, passport-jwt, jwks-rsa installed

## Environment Variables

Add to `.env` in `uzbek-backend`:

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-api-identifier
```

## JWT Strategy

- `src/auth/jwt.strategy.ts` uses Auth0 JWKS for signature validation.
- Validates tokens from your Auth0 tenant and audience.

## Auth Guard

- `src/auth/jwt-auth.guard.ts` protects routes (HTTP & GraphQL).
- Globally applied in `src/app.module.ts` via `APP_GUARD`.

## CORS

- Enabled in `src/main.ts` for `http://localhost:3000` with credentials and headers.

## User Handling

- `UsersService` supports upserting users from Auth0 tokens.
- User schema includes `auth0Sub`, `email`, and roles.

## Usage

- Start backend: `npm run start:dev` (or your usual command)
- Backend expects `Authorization: Bearer <token>` header from frontend.

## Troubleshooting

- Ensure all env vars are set and correct.
- Restart backend after changing env vars.
- Check logs for missing/invalid token or CORS errors.
