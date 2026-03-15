# CLAUDE.md — Uzbek Learning App

AI assistant guide for navigating and contributing to this codebase.

---

## Project Overview

A web application for learning Uzbek vocabulary, built as a replacement for Memrise's removed community feature. Currently a proof of concept with timed vocabulary quiz functionality.

**Monorepo layout:**
```
uzbek-learning/
├── uzbek-backend/     # NestJS REST + GraphQL API
├── uzbek-frontend/    # Next.js 15 frontend
└── docs/              # Architecture and Auth0 documentation
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 19, TypeScript, Tailwind CSS v4 |
| Frontend Auth | @auth0/nextjs-auth0 v4 |
| Backend | NestJS 11 (Express adapter), TypeScript |
| Backend APIs | REST + GraphQL (Apollo Server) |
| Database | MongoDB via Mongoose |
| Auth | Auth0 JWT (RS256, JWKS validation) |
| Testing | Jest + Supertest |

---

## Development Setup

### Prerequisites
- Node.js (check `.nvmrc` or use current LTS)
- Docker (for local MongoDB)

### Start MongoDB
```bash
cd uzbek-backend
docker compose up -d
# MongoDB on port 27021, credentials: admin/M3nCh494741Kh4n!, database: uzbek
```

### Start Backend
```bash
cd uzbek-backend
npm install
npm run start:dev   # watches for changes, port 3421
```

### Start Frontend
```bash
cd uzbek-frontend
npm install
npm run dev         # Turbopack dev server, port 3000
```

### Environment Variables

**`uzbek-backend/.env`:**
```env
MONGO_URI=mongodb://admin:M3nCh494741Kh4n!@localhost:27021/uzbek
PORT=3421
AUTH0_DOMAIN=<your-auth0-domain>
AUTH0_AUDIENCE=<your-api-audience>
NODE_ENV=development
# For scripts/get-token.js and scripts/fetch-words.js:
CLIENT_ID=<Auth0 M2M client ID>
CLIENT_SECRET=<Auth0 M2M secret>
AUDIENCE=<Auth0 API audience>
GRANT_TYPE=client_credentials
```

**`uzbek-frontend/.env.local`:**
```env
AUTH0_SECRET=<random-secret-min-32-chars>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://<your-auth0-domain>
AUTH0_CLIENT_ID=<your-spa-client-id>
AUTH0_CLIENT_SECRET=<your-spa-client-secret>
NEXT_PUBLIC_API_URL=http://localhost:3421
```

---

## Commands Reference

### Backend (`uzbek-backend/`)
```bash
npm run build         # Compile TypeScript to dist/
npm run start         # Start compiled server
npm run start:dev     # Watch mode (development)
npm run start:prod    # Run compiled dist/main
npm run lint          # ESLint with auto-fix
npm test              # Unit tests (Jest)
npm run test:watch    # Watch mode unit tests
npm run test:cov      # Unit tests with coverage
npm run test:e2e      # End-to-end tests
npm run token         # Fetch Auth0 M2M access token (needs .env)
npm run words         # Fetch words via API using token
```

### Frontend (`uzbek-frontend/`)
```bash
npm run dev           # Dev server with Turbopack
npm run build         # Production build
npm run start         # Serve production build
npm run lint          # ESLint check
```

---

## Backend Architecture

### Module Structure
```
uzbek-backend/src/
├── app.module.ts          # Root module — wires all modules, global providers
├── main.ts                # Entry point, port config, global pipes
├── auth/
│   ├── jwt.strategy.ts    # Passport JWT via Auth0 JWKS (RS256)
│   └── jwt-auth.guard.ts  # Global guard; handles HTTP + GraphQL contexts
├── words/
│   ├── words.module.ts
│   ├── words.service.ts   # CRUD business logic
│   ├── words.controller.ts # REST endpoints with JWT guard
│   ├── words.resolver.ts  # GraphQL resolvers
│   └── dto/               # create-word, update-word, query-words DTOs
├── users/
│   └── users.service.ts   # upsertFromAuth0() syncs Auth0 users to MongoDB
└── schemas/
    ├── users/user.schema.ts
    └── words/word.schema.ts
```

### Global Providers (app.module.ts)
- **JWT Guard**: All routes protected by default; use `@Public()` decorator to opt out
- **Exception Filter**: Catches and logs all unhandled errors
- **Validation Pipe**: `whitelist: true`, `forbidNonWhitelisted: true` — unknown fields are rejected
- **CORS**: Restricted to `http://localhost:3000`

### REST API Endpoints
```
GET    /words              # List all words; optional ?language=uz filter
GET    /words/:id          # Get word by ID
POST   /words              # Create word
PATCH  /words/:id          # Partial update
PUT    /words/:id          # Full replace
DELETE /words/:id          # Delete word
GET    /                   # Health check → "Hello World!"
```

### GraphQL API
- Endpoint: `http://localhost:3421/graphql`
- Playground enabled in development
- Schema auto-generated from decorators
- Queries: `words`, `word(id)` (phrases are TODO)

### Data Models

**Word:**
```typescript
{ id: string (UUID), word: string, translation: string,
  partOfSpeech: string, language: string, deletedAt?: Date,
  createdAt: Date, updatedAt: Date }
```

**User:**
```typescript
{ id: string (UUID), auth0Sub: string, email?: string,
  roles: string[], createdAt: Date, updatedAt: Date }
```

---

## Frontend Architecture

### App Structure
```
uzbek-frontend/src/
├── app/
│   ├── layout.tsx              # Root layout with Auth0Provider
│   ├── page.tsx                # Home page
│   └── timed-test/page.tsx     # Timed quiz page
├── components/
│   ├── LoginButton.tsx
│   ├── LogoutButton.tsx
│   ├── Profile.tsx
│   └── Vocabulary/
│       ├── Vocabulary.tsx              # Top-level; wraps VocabularyProvider
│       ├── VocabularyProvider.tsx      # Context provider + localStorage words
│       ├── VocabularyContext.tsx       # React context definition
│       ├── TimedVocabularyTest.tsx     # Timed quiz UI (uses useTimedQuizMachine)
│       ├── VocabularyTest.tsx          # Legacy non-timed quiz
│       ├── VocabularyStepper.tsx       # Question progression
│       ├── AnswerOption.tsx            # Answer button
│       ├── Translation.tsx             # Displays word to translate
│       └── useTimedQuizMachine.ts      # Quiz state machine (reducer hook)
├── types/
│   ├── PartsOfSpeech.ts        # Word, Phrase, Suffix, PartOfSpeech enum
│   ├── AnswerOption.ts
│   └── index.ts
├── utils/
│   ├── word-utilities.ts       # composeTestableWords, toAnswerOptions, shuffle, generateTestOptions
│   └── chainable-functions.ts  # Generic chainable array base class
├── data/
│   └── useLocalStorage.ts      # localStorage React hook
└── lib/
    ├── api.ts                  # authFetch() — injects Bearer token automatically
    ├── auth0.ts                # Auth0Client initialization
    └── utils.ts
```

### Design Principles
- **Client-first**: Uses `"use client"` directive; Server Components are avoided (too complex for PoC stage)
- **No global state libraries**: React Context + `useReducer` only (no Redux, Zustand, etc.)
- **Local data**: Words stored in `localStorage` via `useLocalStorage` hook; no API calls for the quiz yet

### Quiz State Machine (`useTimedQuizMachine.ts`)
States: `question → showingAnswer → finished`

Actions: `START_QUESTION`, `TICK`, `SELECT_ANSWER`, `TIMEOUT`, `SHOW_ANSWER`, `NEXT_QUESTION`, `FINISH`

- 5-second countdown timer per question
- Auto-advances to next question after 800ms delay post-answer
- Tracks results: `{ word, selectedAnswer, isCorrect }`

### API Calls (`lib/api.ts`)
Use `authFetch(url, options)` for all authenticated requests — it automatically retrieves and injects the Auth0 Bearer token.

---

## Authentication Flow

1. User logs in via Auth0 (frontend redirect)
2. Frontend receives access token via `@auth0/nextjs-auth0`
3. API requests use `authFetch()` which injects `Authorization: Bearer <token>`
4. Backend validates RS256 JWT using Auth0 JWKS endpoint
5. `UsersService.upsertFromAuth0()` syncs the Auth0 user profile to MongoDB on first login

---

## Testing

### Backend Unit Tests
Located alongside source files as `*.spec.ts`. Run with:
```bash
cd uzbek-backend && npm test
```

Key test files:
- `src/auth/jwt.strategy.spec.ts`
- `src/words/words.service.spec.ts`
- `src/words/words.controller.spec.ts`
- `src/users/users.service.spec.ts`

### E2E Tests
```bash
cd uzbek-backend && npm run test:e2e
# Config: test/jest-e2e.json
```

### Frontend Tests
No test files currently. Jest is not configured for the frontend.

---

## Code Conventions

### TypeScript
- **No `any` types** — use specific types or generics
- Strict TypeScript enabled in both workspaces
- Path alias `@/*` maps to `src/*` in the frontend

### Backend (NestJS)
- DTOs must use `class-validator` decorators; the global ValidationPipe enforces this
- All new endpoints are JWT-protected by default; add `@Public()` only when explicitly needed
- Use UUIDs (not MongoDB ObjectIds) as the public-facing `id` field
- Soft-delete via `deletedAt` field on words (not implemented everywhere yet)

### Frontend (React/Next.js)
- All components are client components (`"use client"`) — do not add server-side data fetching without discussion
- State lives in React Context; do not introduce external state managers
- Use `authFetch` from `lib/api.ts` for authenticated API calls

### General
- Terminal commands in documentation must work on Windows (repo convention from `.github/copilot-instructions.md`)
- Keep frontend and backend as separate workspaces; do not create a shared package without discussion

---

## Known TODOs / Backlog

From `docs/architecture-design.md`:

1. **Phrase model**: Define `Phrase` schema (requires word references); add service, controller, resolver with REST+GraphQL parity
2. **RBAC**: Add role constants (`admin`, `content_editor`, `user`), `@Roles()` decorator, and `RolesGuard`; apply to mutation endpoints first
3. **API integration**: Frontend currently reads words from `localStorage`; wire up to backend REST API
4. **Architecture conformance**: Add PR review checklist items for architecture consistency

---

## Key Documentation

- `docs/architecture-design.md` — Full architecture decisions and rationale
- `docs/auth0-integration.md` — Auth0 setup overview
- `docs/auth0-backend.md` — Backend Auth0 configuration
- `docs/auth0-frontend.md` — Frontend Auth0 configuration
- `docs/auth0-backend-manual-test.md` — Manual testing guide for auth
- `docs/timed-quiz-reducer.md` — Quiz state machine design
- `todo/replica-set.md` — MongoDB replica set notes
