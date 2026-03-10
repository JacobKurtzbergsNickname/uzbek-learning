# Manual Testing: Auth0 Backend Authentication

This guide explains how to manually test Auth0-protected endpoints on the backend (NestJS).

## Prerequisites

- Backend server running (see docs/auth0-backend.md)
- Auth0 application and API configured
- A valid Auth0 user account
- Tools: [Postman](https://www.postman.com/), [curl](https://curl.se/), or browser dev tools

## 1. Obtain an Auth0 Access Token

### Option A: Use the Frontend

1. Log in via the frontend app (`/auth/login`).
2. Open browser dev tools > Application/Storage > Cookies or Local Storage.
3. Find the Auth0 access token (may be in a cookie or session, depending on SDK config).
4. Copy the access token (a long JWT string).

### Option B: Use Auth0 Test Tab

1. Go to your Auth0 dashboard > Applications > APIs > [Your API].
2. Use the "Test" tab to get a sample access token for your API.

### Option C: Use Auth0 CLI or Auth0 Management API

- See Auth0 docs for how to get a token via CLI or API for manual testing.

## 2. Make a Request to a Protected Endpoint

### Using curl

```curl
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:3421/words
```

### Using Postman

1. Create a new request (e.g., GET http://localhost:3421/words).
2. Go to the "Authorization" tab.
3. Set type to "Bearer Token" and paste your access token.
4. Send the request.

## 3. Expected Results

- **Valid token:** You receive a 200 OK and the endpoint's data.
- **Missing/invalid/expired token:** You receive a 401 Unauthorized error.

## 4. Troubleshooting

- 401 Unauthorized: Check token, audience, and issuer match backend config.
- CORS errors: Ensure backend CORS allows your origin.
- Token expired: Log in again or get a fresh token.

## 5. Advanced

- Test POST, PATCH, DELETE endpoints by including the token and required body data.
- Use browser dev tools to inspect network requests from the frontend for real token usage examples.

## References

- See docs/auth0-backend.md for backend setup.
- See docs/auth0-integration.md for token flow.
- Auth0 docs: https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens
