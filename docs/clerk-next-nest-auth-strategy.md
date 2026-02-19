# Clerk Authentication Strategy for Next.js + NestJS

This document captures a **practical, Clerk-first authentication strategy** for a setup with:

- **Next.js** (frontend, App Router assumed)
- **NestJS** (backend API / resource server)
- **Clerk** as the identity provider
- Optional use of **neverthrow** for controlled error handling

The goal is to stay _within Clerk_ while keeping the backend robust, predictable, and future-proof.

---

## High-level Architecture

```Flowchart
Browser / Next.js
  └── Clerk handles auth UI, sessions, MFA, OAuth, orgs
        └── Issues short-lived JWT (session token)
              └── NestJS verifies token via Clerk backend SDK
                    └── Business authorization + data access
```

Key idea:

> **Clerk authenticates. Nest authorizes.**

---

## Why stay within Clerk?

Clerk’s backend SDK (`verifyToken`, `authenticateRequest`) is effectively a **managed JWT + JWKS solution** with guardrails:

### Benefits

- ✅ Correct-by-default token verification
- ✅ Handles Clerk-specific token formats and claims
- ✅ Easier upgrades if Clerk evolves token behavior
- ✅ Less custom crypto / JWKS plumbing
- ✅ Cleaner mental model during early and mid-stage development

Clerk explicitly supports **networkless verification** when configured correctly.

---

## The Critical Rule (Read This)

> ❗ **Do not allow token verification to perform a network request on every API call.**

Clerk’s backend SDK can:

- Verify **networklessly** if you provide a JWT public key
- Or fetch JWKS if not (which must be cached)

Your setup should ensure one of:

- A provided `jwtKey`, or
- Proper internal caching (acceptable, but more opaque)

---

## Recommended Setup (Clerk-first, production-safe)

### 1. Next.js (Frontend)

- Use Clerk middleware
- Authenticate users via Clerk UI
- Obtain session token via:
  - `getToken()` (client-side), or
  - `auth()` (App Router server components / route handlers)

Send token to Nest via:

```HTTP Header
Authorization: Bearer <token>
```

Alternative:

- Use Next Route Handlers as a **BFF**
- Route Handlers read Clerk cookies and call Nest server-to-server

---

### 2. NestJS (Backend)

#### Authentication Guard

Implement a **single global or scoped Auth Guard** that:

1. Extracts the token (Authorization header or request)
2. Calls Clerk backend SDK:
   - `verifyToken()` if using Bearer tokens
   - `authenticateRequest()` if validating cookies / requests
3. On success:
   - Attach user info to request:

     ```ts
     req.user = {
       clerkUserId,
       orgId,
       roles,
       email,
     };
     ```

4. On failure:
   - Throw `UnauthorizedException`

This keeps controllers clean and declarative.

---

### 3. Authorization (Your Domain Logic)

Clerk answers:

- “Who is this user?”

Your Nest app answers:

- “What is this user allowed to do?”

Common patterns:

- Role checks (from DB or JWT custom claims)
- Tenant / org boundary checks
- Resource ownership checks

Avoid placing business authorization in Next.

---

## Using JWT Custom Claims (Optional but Powerful)

Clerk supports **JWT templates**, allowing you to embed:

- App roles
- Org / tenant IDs
- Feature flags

Benefits:

- Fewer DB lookups
- Faster guards
- Cleaner policy logic

Still validate critical permissions server-side.

---

## User Persistence Strategy

Typical approach:

- Store `clerkUserId` in your `users` collection
- On first authenticated request:
  - Upsert user record
- Optional (recommended later):
  - Subscribe to Clerk webhooks:
    - `user.created`
    - `user.updated`
    - `user.deleted`

This avoids relying on request-time syncing forever.

---

## neverthrow Integration (Optional)

Nest Guards must throw exceptions — but you can still:

- Wrap Clerk SDK calls with `Result`
- Convert controlled failures into a single `UnauthorizedException`
- Prevent third-party exceptions from leaking

Pattern:

```Flowchart
Clerk SDK → Result → Guard → Exception
```

This keeps error handling explicit without fighting Nest’s flow.

---

## When You Might Reconsider JWKS Directly

Staying in Clerk is sensible **unless**:

- You need vendor-neutral auth logic immediately
- You plan to support multiple IdPs at once
- You want total control over JWKS caching and claim validation

Even then, you can later **swap the internals of the Guard**
without changing controllers or routes.

---

## Summary Recommendation

**Default choice for this stack:**

✔ Clerk backend SDK  
✔ Networkless or cached verification  
✔ Nest Guard for authentication  
✔ Nest services for authorization  
✔ Optional JWT custom claims  
✔ neverthrow at the integration boundary

This setup is:

- Secure
- Maintainable
- Performant
- Easy to evolve

---

If you want, this document can be followed up with:

- A concrete NestJS Guard example
- A BFF-style Next Route Handler flow
- A JWT claim schema proposal
