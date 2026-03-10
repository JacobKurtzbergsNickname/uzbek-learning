# Auth0 Integration: Frontend & Backend Communication

## Overview

- The frontend (Next.js) uses Auth0 for authentication via the @auth0/nextjs-auth0 SDK.
- The backend (NestJS) validates Auth0 JWTs using JWKS and passport-jwt.
- Authenticated frontend requests include the access token in the `Authorization: Bearer <token>` header.

## Token Flow

1. User logs in via frontend (`/auth/login`).
2. Auth0 redirects back to frontend with session.
3. Frontend retrieves access token (see SDK docs for how to get it if needed).
4. Frontend sends API requests to backend with `Authorization: Bearer <token>`.
5. Backend validates token using Auth0 JWKS and audience.
6. Backend grants or denies access based on token validity.

## Example API Call (Frontend)

```js
fetch("http://localhost:3421/words", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## CORS

- Backend allows requests from `http://localhost:3000` with credentials and headers.

## Common Issues

- Missing or invalid token: Backend returns 401 Unauthorized.
- CORS errors: Check allowed origins and headers in backend CORS config.
- Expired token: User must re-authenticate.

## Testing

- Log in via frontend, then call a protected backend endpoint.
- Use browser dev tools or Postman to inspect headers and responses.

## References

- See `auth0-frontend.md` and `auth0-backend.md` for setup details.
- See `auth0-prompt.md` for full requirements and anti-patterns.
