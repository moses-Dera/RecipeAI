# Food Recipe AI — Master PRD, Architecture & Build Plan

Consolidated from the original client PRD (Emmanuel, UNN CS Dept, v1.0) plus every design decision made during planning. Items marked **[ADDITION]** are beyond the original PRD's scope — confirm with the client before or during build, not after.

---

## 1. Product Overview

**What it is:** Full-stack AI-powered web app for discovering, managing, and sharing traditional Nigerian recipes. Conversational chatbot recommendations, nutritionally annotated content, save/export/share.

**Vision:** Make traditional Nigerian cooking as accessible and guided as fast food.

**Out of scope:** grocery delivery/e-commerce, native mobile apps, video content, non-Nigerian cuisines, calorie/dietary tracking, real-time collaborative cooking.

## 2. Personas

1. **Young home cook** (Chika, 24, Lagos) — chatbot-driven discovery, recipe pages for guidance
2. **Diaspora user** (Emeka, 31, London) — DOCX export for offline access, sharing with family
3. **Content creator** (Adaeze, 28, Abuja) — social sharing, discovering dishes to feature
4. **Guest visitor** (Tunde, 19, Nsukka) — browses via shared link, no account needed to view

---

## 3. Features

### 3.1 Authentication & Authorization
- Email/password registration, bcrypt hash (cost 12), unique email
- **JWT sessions via NextAuth, stored in httpOnly/secure/sameSite cookies** — never localStorage, never client-JS-accessible
- 30-min inactivity expiry
- **[ADDITION] OAuth (Google) alongside email/password** — requires nullable `password`, NextAuth `Account` table, and a decision on account-linking behavior (see §7)
- **[ADDITION] RBAC via a `role` enum (`user` / `admin`)** on User — replaces the original hardcoded-admin idea
- Guests can browse/search/chatbot/export/share without an account
- Architecture is a **BFF (Backend-for-Frontend)** — API routes serve only this app's frontend, no external consumers, no separate gateway needed

### 3.2 Recipe Catalogue
- Browsable grid: image, title, region tag, prep time
- Filter by region, **[ADDITION] meal_type, occasion**
- Keyword search (min 2 chars)
- SSR recipe detail pages: title, image, ingredients, steps, nutrition, region, prep time, actions
- **[ADDITION] meal_type and occasion tags** — Postgres string arrays, multi-value (a dish can be both `breakfast` and `snack`), **required at recipe creation**

### 3.3 AI Chatbot ("Chef Ada")
- Free-text input (≤500 chars), full multi-turn history maintained
- Recommends dishes by ingredients/mood/diet/skill/meal-time/occasion
- Asks clarifying questions on ambiguous input
- Persisted per-session to Chat_History (guests included, `user_id` nullable)
- 503 + exact required copy on LLM failure
- Config: `gpt-4o`, temp `0.7`, max_tokens `800`, top_p `0.9`, presence_penalty `0.3`, LangChain `ConversationChain`
- **RAG grounding:** live catalogue (titles, region, ingredients, meal_type, occasion) injected into system prompt context at request time — no vector DB needed at current scale; migrate to `pgvector` if catalogue grows large
- **Post-generation validation (mandatory):** every recommended dish name is checked against the DB before a link is rendered — system prompt constrains behavior, this code enforces it
- **[ADDITION] Context and validation are scoped per-user's visible recipe set** (own private recipes + all public ones) — prevents cross-user data leakage through the chatbot
- Non-recommendation answers (general cooking knowledge, technique, substitutions) use the LLM's own knowledge, unconstrained — only dish-recommendation-with-link is gated

### 3.4 Save / Collection
- Save any visible recipe, duplicate blocked at DB level (`@@unique([user_id, recipe_id])`)
- Personal note per saved recipe, removable
- Guests see a login prompt instead of the save button

### 3.5 [ADDITION] User-Generated Recipes & Publishing
- Any authenticated user can create their own recipe (`owner_id = self`, `is_private = true` by default) — visible only to them
- **Visibility isolation enforced on every read path** (catalogue, detail, search, chatbot context, export, share) via a shared filter: `is_private = false OR owner_id = currentUser`
- Someone else's private recipe returns **404, not 403** (don't leak existence)
- Owner can **publish** (`is_private → false`) — instant, no review queue
- Published recipes **omit the nutrition section** — never self-reported, since unverified numbers would erode the platform's nutrition-accuracy credibility and could be echoed by the chatbot as fact
- Published recipes **show attribution** ("submitted by [username]")
- Owner can **unpublish** at any time (`is_private → true` again, `owner_id` unchanged — ownership isn't transferred to the platform)

### 3.6 DOCX Export
- Any recipe, any user, no login required, one click
- Server-side (`docx` npm), no client dependency
- Contents: title (H1), ingredient table, numbered steps, nutrition (if present), footer with source URL
- Filename: slugified title
- Ownership-checked for private recipes (same 404-not-403 pattern)

### 3.7 Social Sharing (frontend-only, no backend module)
- WhatsApp, Twitter/X, Facebook — pre-filled share text, Open Graph tags for Facebook
- Client-triggered only, no auto-posting, no SDK data collection on load
- Fallback: copy-to-clipboard if share intent is blocked

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Page load ≤3s (LCP), chatbot response ≤5s (P95), DOCX export ≤3s (P95) |
| Responsiveness | 320px / 768px / 1280px, no layout breakage |
| Accessibility | WCAG 2.1 AA contrast, Lighthouse accessibility ≥90 |
| Security | Parameterized queries only, HTTPS enforced, HSTS |
| Usability | Plain-language error messages, first-time nav without instruction |
| Scalability | Schema supports new fields via `ALTER TABLE` without breaking existing queries |

---

## 5. System Architecture

Monolithic Next.js 16 (App Router). Frontend and backend in one codebase, one Vercel deploy — no separate Express server.

```
┌─────────────────────────────────────────────────────────────┐
│                        FOOD RECIPE AI                        │
├──────────────────┬──────────────────────┬────────────────────┤
│   PRESENTATION    │     APPLICATION       │       DATA         │
│  React + Tailwind │  Next.js API Routes   │  PostgreSQL/Prisma │
│  SSR recipe pages │  (BFF — serves only    │                    │
│                    │   this app's frontend) │                    │
├──────────────────┴──────────────────────┴────────────────────┤
│  EXTERNAL: OpenAI GPT-4o (LangChain) · Google OAuth ·          │
│  wa.me / Twitter / Facebook share intents (client-side)        │
└─────────────────────────────────────────────────────────────┘
```

**Layered request flow (uniform across 6 backend modules):**

```
Controller (route.ts) → Middleware (auth/RBAC/rate-limit) → Service → Repository → Prisma → Postgres
                                                                ↑
                                                         DTO (Zod) validates
                                                         at the Controller boundary
```

### 5.1 Modules (6 full backend + 1 frontend-only) — module-first, feature folders

| Module | Controller | Service | Repository | DTO | Spec |
|---|---|---|---|---|---|
| Auth | `api/auth/*` | `modules/auth/auth.service.ts` | uses User's | `modules/auth/auth.schema.ts` | `modules/auth/auth.test.ts` |
| User | `api/user/*` | `modules/user/user.service.ts` | `modules/user/user.repository.ts` | `modules/user/user.schema.ts` | `modules/user/user.test.ts` |
| Recipe | `api/recipes/*` | `modules/recipe/recipe.service.ts` | `modules/recipe/recipe.repository.ts` (owns `recipeVisibilityFilter()`) | `modules/recipe/recipe.schema.ts` | `modules/recipe/recipe.test.ts` |
| Chat | `api/chat` | `modules/chat/chat.service.ts` | `modules/chat/chat.repository.ts` | `modules/chat/chat.schema.ts` | `modules/chat/chat.test.ts` |
| Saved | `api/saved/*` | `modules/saved/saved.service.ts` | `modules/saved/saved.repository.ts` | `modules/saved/saved.schema.ts` | `modules/saved/saved.test.ts` |
| Export | `api/export/[id]` | `modules/export/export.service.ts` | uses Recipe's | `modules/export/export.schema.ts` | `modules/export/export.test.ts` |
| **Share** | *(none — frontend only)* | `modules/share/shareLinks.ts` (util) | *(none)* | *(none)* | `modules/share/shareLinks.test.ts` |

Each module is a self-contained folder — service, repository, schema, and spec for that module all live together, instead of being split across `services/`, `repositories/`, `schemas/` directories. Share has no backend surface — no DB interaction, no validation need — so it's a lighter folder with just a util and a spec, no controller/repository/DTO forced onto it.

**Shared, cross-module (stays layer-first — these aren't owned by any one module):**
- `lib/auth/requireRole.ts` — RBAC middleware
- `lib/llm/provider.ts` — LLM abstraction (swap providers via config, not rewrite — the PRD's own pricing-risk mitigation)
- `lib/llm/buildContext.ts` — RAG context builder, user-scoped
- `lib/llm/validateRecommendation.ts` — post-generation DB check, user-scoped
- `lib/errors/index.ts` — `UnauthorizedError`, `ForbiddenError`, `ValidationError` → central HTTP-status mapping
- `lib/types/` — shared TS types across modules

### 5.2 Full folder structure

```
app/
├── api/
│   ├── auth/{register,login,logout,me}/route.ts
│   ├── recipes/route.ts, [id]/route.ts, [id]/publish/route.ts
│   ├── chat/route.ts
│   ├── saved/route.ts, [saveId]/route.ts
│   └── export/[id]/route.ts
lib/
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts
│   │   └── auth.test.ts
│   ├── user/
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.schema.ts
│   │   └── user.test.ts
│   ├── recipe/
│   │   ├── recipe.service.ts
│   │   ├── recipe.repository.ts
│   │   ├── recipe.schema.ts
│   │   └── recipe.test.ts
│   ├── chat/
│   │   ├── chat.service.ts
│   │   ├── chat.repository.ts
│   │   ├── chat.schema.ts
│   │   └── chat.test.ts
│   ├── saved/
│   │   ├── saved.service.ts
│   │   ├── saved.repository.ts
│   │   ├── saved.schema.ts
│   │   └── saved.test.ts
│   ├── export/
│   │   ├── export.service.ts
│   │   ├── export.schema.ts
│   │   └── export.test.ts
│   └── share/
│       ├── shareLinks.ts
│       └── shareLinks.test.ts
├── llm/            (provider, buildContext, validateRecommendation — cross-module)
├── auth/           (requireRole, authOptions — cross-module)
├── errors/
└── types/
prisma/
└── schema.prisma
```

---

## 6. Database Schema (Prisma) — Final

```prisma
enum UserRole {
  user
  admin
}

model User {
  user_id     Int      @id @default(autoincrement())
  username    String
  email       String   @unique
  password    String?  // nullable — OAuth users have none
  role        UserRole @default(user)
  created_at  DateTime @default(now())
  profile_img String?
  accounts    Account[]
  saved       SavedRecipe[]
  chats       ChatHistory[]
  recipes     Recipe[]
}

model Account {
  // NextAuth's standard Prisma adapter shape — don't invent a custom one
  id                   String  @id @default(cuid())
  user_id              Int
  provider             String  // "google"
  provider_account_id  String
  access_token         String?
  refresh_token        String?
  user                 User    @relation(fields: [user_id], references: [user_id])
  @@unique([provider, provider_account_id])
}

model Recipe {
  recipe_id     Int      @id @default(autoincrement())
  title         String
  ingredients   String   // JSON: [{name, quantity, unit}]
  steps         String   // JSON: ordered array
  nutrition     String?  // JSON — platform recipes only; omitted for user-published
  region        String?
  image_url     String?
  prep_time_min Int?
  difficulty    String   @default("medium")
  owner_id      Int?     // null = platform recipe
  is_private    Boolean  @default(false)
  meal_type     String[] @default([])  // required at creation, e.g. ["breakfast","snack"]
  occasion      String[] @default([])  // required at creation, e.g. ["everyday","party"]
  created_at    DateTime @default(now())
  owner         User?    @relation(fields: [owner_id], references: [user_id])
  saved         SavedRecipe[]

  @@index([owner_id])
  @@index([region])
  @@index([title])
  @@index([meal_type])
  @@index([occasion])
}

model SavedRecipe {
  save_id   Int      @id @default(autoincrement())
  user_id   Int
  recipe_id Int
  saved_at  DateTime @default(now())
  notes     String?
  user      User   @relation(fields: [user_id], references: [user_id])
  recipe    Recipe @relation(fields: [recipe_id], references: [recipe_id])
  @@unique([user_id, recipe_id])
}

model ChatHistory {
  chat_id    Int      @id @default(autoincrement())
  user_id    Int?
  role       String   // 'user' | 'assistant'
  message    String
  session_id String
  created_at DateTime @default(now())
  user       User?    @relation(fields: [user_id], references: [user_id])
  @@index([session_id])
}
```

---

## 7. Auth Design — Final

- **NextAuth v4** (stability — 5.x is beta, not for a client production deliverable)
- **Session strategy: JWT**, stored in **httpOnly, secure, sameSite=lax cookies** (NextAuth default when configured for JWT — never localStorage)
- **Providers:** `CredentialsProvider` (bcrypt email/password) + `GoogleProvider` (OAuth) **[ADDITION]**
- **RBAC:** `role` claim carried into the JWT via the `jwt`/`session` callbacks, checked by `requireRole()` middleware on protected routes
- **Account-linking:** NextAuth does not auto-link by default for security reasons (to prevent account hijacking via unverified OAuth providers). However, since we are using Google OAuth (which verifies emails), we will enable `allowDangerousEmailAccountLinking: true` in NextAuth. This allows users to seamlessly log in with Google even if they originally signed up via email/password.

---

## 8. ORM — Final

**Prisma.** Specified in the original PRD, already the basis of every schema decision above, and required for NextAuth's official Prisma adapter (the `Account` model). No reason to switch — Drizzle/TypeORM/raw SQL were considered and rejected for this project's scope (see decision log).

---

## 9. Security

- SQLi: Prisma only, no raw concatenation
- XSS: React default escaping, CSP header, no `dangerouslySetInnerHTML`
- CSRF: NextAuth built-in + sameSite cookies
- Brute force: 5 failed logins/IP/15min → 429
- Object-level authorization **[ADDITION]**: visibility filter enforced on every Recipe read path — this is OWASP API Top 10 #1 (Broken Object Level Authorization), the single most common real-world API vulnerability class
- Env vars server-only, never in client components
- Middleware-level JWT+role check on protected routes, not client-side guards alone

---

## 10. Third-Party Costs

- OpenAI GPT-4o: ~$0.01/conversation, rate-limited (20 msgs/hr/guest, code-enforced)
- Vercel: ~$20/mo production
- Neon/Supabase: ~$25/mo production
- Google OAuth: free
- Social share intents: free, no API keys

---

## 11. Testing & Acceptance

- Unit: bcrypt utility, input validation, DOCX generator, session ID generation, per-service logic
- Integration: registration→save flow, chatbot multi-turn, duplicate-save rejection, publish/unpublish, OAuth linking behavior
- 6+ UAT scenarios including the original 6 plus publish flow and OAuth login
- Production-ready gate: all MUST requirements pass, 3s/5s/3s performance targets, OWASP Top 10 manual review clean, live Vercel deploy with working DB

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| LLM pricing/rate-limit changes | Provider abstracted behind `lib/llm/provider.ts` |
| Chatbot recommends off-catalogue dishes | System prompt constraint + mandatory post-generation DB validation, user-scoped |
| **[ADDITION]** Private recipe data leaks to another user | Visibility filter on every read path incl. chatbot context — not just the schema flag |
| **[ADDITION]** Unverified user nutrition presented as fact | Nutrition section omitted entirely for user-published recipes |
| Poor content quality | Nutrition validated against WHO RDIs + Nigerian Food Composition Table (NFCT) for actual per-100g values |
| Social API/URL changes | Copy-to-clipboard fallback always present |

---

## 13. Decision Log (this conversation)

| Decision | Status |
|---|---|
| RBAC via role enum, not hardcoded admin | Final — implement |
| NextAuth 4.x over 5.x | Final — implement, inform client (not asking permission) |
| Nigerian Food Composition Table + WHO RDIs for nutrition | Final — implement |
| Prisma as ORM | Final — already committed |
| Private user recipes + visibility isolation | Final — approved by client |
| Publish/unpublish, instant, no review queue | Final — approved by client |
| Omit nutrition on user-published recipes | Final given the above — implement |
| meal_type/occasion arrays, required at creation | Final — approved by client |
| OAuth (Google) + BFF + JWT httpOnly cookies | Final — approved by client |
| Admin recipe creation via RBAC, not env var | Final — implement |
| Module-first (feature folder) structure over layer-first | Final — implement |

## 14. Resolved Items

1. **Who sources/writes the seed recipe content:** Handled by us (Moze). Sourced and written carefully with LLM assistance, manually verified against NFCT/WHO.
2. **Account-linking behavior:** Resolved. We will use NextAuth's `allowDangerousEmailAccountLinking: true` for the Google provider to seamlessly link accounts since Google verifies emails.
3. **Client Sign-off:** Emmanuel has approved all scope additions in §13.

---
