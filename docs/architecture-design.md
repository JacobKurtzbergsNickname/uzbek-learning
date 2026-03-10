# Uzbek Learning Architecture Design

Status: Draft for refinement sessions
Date: 2026-03-06

## 1. Executive Summary

This project is a web application for Uzbek vocabulary learning.

The system is intentionally split into:

- A client-first frontend (`uzbek-frontend`) built with Next.js App Router.
- A separate backend (`uzbek-backend`) built with NestJS.
- MongoDB as the persistence layer.
- Auth0 for authentication and JWT issuance.

Primary runtime flow:

1. User authenticates with Auth0 in the frontend.
2. Frontend calls backend APIs with Bearer access token.
3. Backend validates JWT via Auth0 JWKS and executes business logic.
4. Backend reads/writes MongoDB through Mongoose models.

## 2. Technology Stack Choices

| Layer              | Choice                       | Version (from repo)                              | Why this choice                                    |
| ------------------ | ---------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| Frontend framework | Next.js (App Router) + React | Next 15.5.3, React 19.1.0                        | Modern React app structure with file-based routing |
| Frontend language  | TypeScript                   | ^5                                               | Strong type safety across UI and API contracts     |
| Frontend styling   | Tailwind CSS + PostCSS       | Tailwind 4                                       | Fast, consistent styling workflow                  |
| Frontend auth SDK  | `@auth0/nextjs-auth0`        | ^4.15.0                                          | Managed OIDC/OAuth integration with Auth0          |
| Backend framework  | NestJS (Express adapter)     | 11.1.13                                          | Modular architecture, DI, guards, validation       |
| Backend API styles | REST + GraphQL (Apollo)      | `@nestjs/graphql` 13.2.4, `@apollo/server` 5.4.0 | Dual interface strategy for client flexibility     |
| Database           | MongoDB via Mongoose         | Mongoose 8.13.2                                  | Productive schema modeling with Nest integration   |
| Authentication     | Auth0 JWT + JWKS validation  | `jwks-rsa` 3.2.2, `passport-jwt` 4.0.1           | Centralized identity, RS256 signature validation   |
| Testing (backend)  | Jest + Supertest             | Jest 29.7.0                                      | Unit and e2e API testing baseline                  |

## 3. Architecture Constraints and Non-Goals

### 3.1 Frontend Architectural Policy

The frontend is client-first by design.

Allowed patterns:

- Next.js App Router.
- Client Components for UI and data interaction.
- Middleware only where required.

Avoided patterns:

- Server Components.
- Flight-dependent server data-fetch paths from Next.js frontend to the backend.

Rationale:

- Keep backend communication explicit and auditable from client-side fetch paths.
- Reduce protocol coupling between frontend rendering internals and backend API boundary.

### 3.2 Deliberately Out of Scope in This Document

- Data sourcing/import strategy (`scripts/fetch-words.js`) because it is expected to change significantly.
- Deployment and infrastructure topology.
- Observability and analytics implementation details.

## 4. Frontend Architecture

### 4.1 Runtime Composition

- Root app layout wraps the app with Auth0 provider.
- Domain UI is centered around vocabulary and timed quiz components.
- State management uses React Context + reducer-style hooks, not Redux/Zustand.

### 4.2 State Management Choice

- `VocabularyProvider` holds vocabulary/session context.
- `useTimedQuizMachine` models quiz phases (`question`, `showingAnswer`, `finished`) with `useReducer` and timed transitions.
- Persistence for selected local state uses local-storage helpers.

Why this choice:

- Scope is currently small enough for local/context state.
- State transitions are explicit and testable without introducing a larger state library.

### 4.3 Frontend-to-Backend Communication

- Frontend uses `authFetch()` helper to attach `Authorization: Bearer <token>`.
- Backend base URL and routes remain explicit API boundaries.

Security posture:

- Access token handling remains explicit at request boundaries.
- No hidden server-render bridge to backend APIs in frontend architecture policy.

## 5. Backend Architecture

### 5.1 Module Organization

Current top-level backend modules:

- `WordsModule` for vocabulary domain endpoints/resolvers.
- `UsersModule` for user records mapped to Auth0 identities.

Global application wiring:

- Global JWT guard (`APP_GUARD`) for default-protected endpoints.
- Global exception filter (`APP_FILTER`) for standardized error response/logging.
- Global validation pipe with whitelist and non-whitelisted rejection.
- CORS configured for frontend origin.

### 5.2 API Strategy: Dual REST + GraphQL

Decision: REST and GraphQL are both first-class and maintained.

REST currently provides full CRUD-oriented endpoints for words.
GraphQL is configured with schema auto-generation and resolver support.

Architectural intent:

- Business logic should remain in services.
- Controllers/resolvers are transport adapters.
- Feature parity is expected over time.

### 5.3 Authentication Flow

1. Client obtains token from Auth0.
2. Client sends Bearer token to backend.
3. `JwtStrategy` validates RS256 JWT using Auth0 JWKS URI.
4. Guarded route/resolver receives authenticated user claims.
5. User service upserts user by `auth0Sub` when needed.

## 6. Data and Persistence Architecture

### 6.1 Current Core Collections

Users collection characteristics:

- UUID-style `id` field.
- Unique `auth0Sub` as identity anchor.
- Optional `email`.
- `roles: string[]` for authorization model.

Words collection characteristics:

- UUID-style `id` field.
- Lexical data (`word`, `translation`, `partOfSpeech`, `language`).
- `deletedAt` for soft-delete semantics.
- Timestamps via schema options.

Query pattern:

- Application-level IDs are preferred over raw Mongo `_id` in domain operations.

### 6.2 Planned Domain Extension: Phrases

Requirement confirmed:

- Phrases must have a relation to existing words.

Planned model direction:

- Introduce `phrases` collection with phrase text and translation metadata.
- Add explicit reference(s) to word entity IDs.
- Relation is a core domain property, not optional enrichment.

Open model point for refinement:

- Relation cardinality and constraints (for example, one phrase to many words vs many-to-many).

## 7. Authorization Architecture (Planned)

Confirmed role taxonomy:

- `admin`: complete control.
- `content_editor`: content creation and management.
- `user`: general user access.

Implementation direction:

- Add role metadata decorator (`@Roles(...)`).
- Add `RolesGuard` composed with existing JWT guard.
- Apply to both REST controllers and GraphQL resolvers.

Permission model target:

- One permission matrix covering both API styles.
- Transport-neutral authorization rules anchored at domain/service boundary where possible.

## 8. Integration Map

### 8.1 System Context

`Browser -> Next.js frontend (client components) -> NestJS API layer (REST/GraphQL) -> Mongoose models -> MongoDB`

`Auth0 -> issues JWT -> frontend includes Bearer token -> backend validates via JWKS`

### 8.2 Boundary Rules

- Frontend does not access MongoDB directly.
- Frontend does not embed backend business logic.
- Backend is the only component enforcing domain validation and authorization.

## 9. Decision Log

| Decision                                        | Status   | Notes                                                            |
| ----------------------------------------------- | -------- | ---------------------------------------------------------------- |
| Keep separate frontend and backend services     | Accepted | Avoid monolith coupling                                          |
| Use Auth0 for AuthN and JWT validation via JWKS | Accepted | Already implemented                                              |
| Maintain both REST and GraphQL APIs             | Accepted | Equal maintenance strategy                                       |
| Use client-first Next.js architecture           | Accepted | Avoid Server Components and Flight-dependent backend fetch paths |
| Add phrase-to-word relation in data model       | Accepted | Required for future features                                     |
| Adopt roles `admin/content_editor/user`         | Accepted | Authorization rollout pending                                    |

## 10. Open Questions for Refinement Sessions

1. Phrases relation cardinality and required invariants.
2. RBAC rollout order by endpoint/resolver.
3. Frontend testing stack and minimum coverage targets.
4. Expanded e2e scenarios across auth and content workflows.
5. Where service-layer validation should extend beyond schema validation.

## 11. Immediate Implementation Backlog (Architecture-Driven)

1. Define `Phrase` schema with required word references.
2. Add phrase service/controller/resolver with parity between REST and GraphQL.
3. Add role constants, `@Roles` decorator, and `RolesGuard`.
4. Apply RBAC to high-risk mutation endpoints first.
5. Add architecture conformance checks in PR review guidelines.

## 12. Source Anchors

This document is based on implementation currently in:

- `uzbek-frontend/package.json`
- `uzbek-backend/package.json`
- `uzbek-backend/src/app.module.ts`
- `uzbek-backend/src/main.ts`
- `uzbek-backend/src/auth/jwt.strategy.ts`
- `uzbek-backend/src/schemas/users/user.schema.ts`
- `uzbek-backend/src/schemas/words/word.schema.ts`
- `uzbek-frontend/src/lib/api.ts`
- `uzbek-frontend/src/components/Vocabulary/useTimedQuizMachine.ts`
