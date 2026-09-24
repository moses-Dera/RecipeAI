# RecipeAI - Comprehensive Product & Architecture Manual

## 1. Executive Summary
**RecipeAI** is an advanced, AI-powered culinary application designed to help users manage recipes, discover new meals, and get intelligent, context-aware cooking advice. It combines a modern Next.js frontend with a powerful AI ecosystem, utilizing semantic vector search (RAG) and Large Language Models to act as a personalized culinary assistant (Chef Ada).

---

## 2. Technology Stack

### Frontend & UI
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4, Framer Motion (for smooth animations)
- **Theme:** Next Themes (Dark/Light mode support, defaulted to Light)
- **Icons:** React Icons

### Backend & Core Infrastructure
- **Server:** Next.js Serverless API Routes
- **Database:** PostgreSQL (with `pgvector` extension)
- **ORM:** Prisma (with `@prisma/adapter-pg` for edge/serverless compatibility)
- **Caching:** Redis (via Upstash) for high-speed delivery of public recipes
- **Storage:** S3-Compatible Object Storage for recipe image uploads

### AI & Machine Learning Ecosystem
- **LLM Engine:** NVIDIA API (`nvidia/nemotron-3.5-lightning-30b-a3b`)
- **Orchestration:** LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`)
- **Semantic Embeddings:** FastEmbed (`BGESmallEN` model) executing locally via `onnxruntime-node`
- **Vector Search:** Cosine similarity search (`<=>`) executed natively in PostgreSQL via Prisma `$queryRaw`

### Authentication
- **Provider:** NextAuth.js (v4)
- **Strategies:** Google OAuth 2.0 & Credentials (Email/Password with `bcryptjs` hashing)

### Deployment
- **Hosting:** Vercel (Serverless Functions)
- **Optimizations:** Advanced Turbopack bundling, explicit `.so` binary tracing for ONNX C++ execution in serverless environments.

---

## 3. Core Architecture & Workflows

### 3.1 Authentication Flow
1. User accesses `/api/auth/signin`.
2. **Google OAuth:** Redirects to Google. Upon success, NextAuth captures the email and creates/links a user in the PostgreSQL `User` and `Account` tables.
3. **Credentials:** User provides email/password. Password is hashed/verified via `bcryptjs`. 
4. JWT tokens are securely stored in HTTP-only cookies, passing user session data seamlessly to Server Components.

### 3.2 Recipe Management & Storage
1. **Creation:** Users submit recipes via a rich form. Images are uploaded directly to the S3 bucket via the `/api/upload` endpoint.
2. **Database:** Saved to the `Recipe` table via Prisma.
3. **Vectorization:** Upon save, the recipe's title, ingredients, and steps are concatenated into a string. The `fastembed` engine (BGE-Small-EN) converts this string into a 384-dimensional mathematical vector.
4. **Storage:** This vector is saved to the `RecipeEmbedding` table using the `vector(384)` datatype in Postgres.

### 3.3 Chef Ada (The AI Assistant) & RAG (Retrieval-Augmented Generation)
Chef Ada is not a standard chatbot; she is aware of the user's database and current screen context.
1. **Context Injection:** If the user is on a specific recipe page (e.g., `/recipe/5`), the system extracts the recipe ID from the URL, fetches the ingredients/steps, and injects them directly into Chef Ada's system prompt. She instantly knows what the user is looking at.
2. **Tool Binding:** Chef Ada is equipped with LangChain tools.
   - `search_recipes`: Converts the user's chat query into a vector, runs a cosine similarity search against Postgres, and returns the top 3 matching recipes (including their full ingredients and steps) back to Ada.
   - `export_recipe`: Generates a downloadable Word Document link for recipes.
3. **Streaming:** The response is streamed chunk-by-chunk back to the React frontend using the Web Streams API.

### 3.4 The Explore Page (Caching Strategy)
To prevent database bottlenecks, the `/explore` page utilizes **Upstash Redis**.
1. When a user requests the Explore page, the system checks Redis for the cache key (e.g., `recipes:visible:anon:p1:l20`).
2. If found, it returns the data in milliseconds.
3. If missed, it queries PostgreSQL, serves the user, and asynchronously updates the Redis cache (background cache fill) for 24 hours.

---

## 4. Vercel Deployment & Serverless Limitations

Deploying heavy AI models on Vercel requires specific engineering bypasses to comply with the 50MB function limit:
1. **ONNX Runtime Exclusions:** `onnxruntime-node` contains massive 300MB+ GPU binaries. We explicitly filter these out in `next.config.ts` using `outputFileTracingIncludes` to only include the ~20MB CPU `.so.1` binary.
2. **Cold Starts:** Because Vercel puts idle servers to sleep, the first boot requires loading the 133MB FastEmbed model into RAM (a "Cold Start"). We engineered a dedicated `/api/keep-alive` endpoint. A cron job pings this endpoint every 5 minutes to keep the server awake and the model permanently locked in RAM, guaranteeing instant chat responses for actual users.

---

## 5. Database Schema Overview
- **User:** Stores credentials, profile info, and roles.
- **Account:** Stores OAuth linkages (Google).
- **Recipe:** Core entity storing title, region, meal type, prep time, ingredients, steps, and S3 image keys.
- **RecipeEmbedding:** One-to-one mapping to `Recipe`. Stores the `pgvector` embedding for semantic search.
- **ChatHistory:** Stores conversation logs between users and Chef Ada.
