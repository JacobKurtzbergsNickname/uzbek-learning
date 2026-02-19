# Auth0 Frontend Integration (Next.js)

## Prerequisites

- Node.js, npm, Next.js 15+
- @auth0/nextjs-auth0 v4+ installed

## Environment Variables

Create or update `.env.local` in `uzbek-frontend`:

```env
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_SECRET=your-long-random-secret-here
APP_BASE_URL=http://localhost:3000
```

## SDK Setup

- `src/lib/auth0.ts` exports the Auth0 client.
- `src/middleware.ts` protects routes using Auth0 middleware.

## Components

- `LoginButton.tsx` and `LogoutButton.tsx` use `<a href="/auth/login">` and `<a href="/auth/logout">`.
- `Profile.tsx` uses `useUser` from the SDK to show user info.

## Main Page Example

- See `src/app/page.auth0.tsx` for a full Auth0-enabled page.
- Uses `auth0.getSession()` for server-side session.

## Styling

- Auth0-branded CSS is merged into `src/app/globals.css`.

## Usage

- Start dev server: `npm run dev`
- Visit the app, log in/out, and see user info.

## Troubleshooting

- Ensure all env vars are set and correct.
- Restart dev server after changing env vars.
- See `docs/auth0-prompt.md` for full requirements and anti-patterns.
