# 🍳 RecipeAI

RecipeAI is your intelligent, all-in-one culinary companion. Built on a modern Next.js 16 stack, it allows you to store your favorite recipes, explore new world cuisines, and chat with **Chef Ada**—a highly contextual AI culinary assistant that knows exactly what you have in your kitchen.

---

## 🌟 Key Features

- **Personal Recipe Catalogue:** Create, edit, and organize your favorite recipes with rich images hosted on S3.
- **Chef Ada (AI Assistant):** Powered by Nvidia LLMs and LangChain, Chef Ada acts as your personal sous-chef. She can answer culinary questions and help with meal planning.
- **Contextual RAG Search:** Chef Ada uses advanced semantic vector search (`pgvector` + `FastEmbed`) to search your private recipe catalogue before giving advice. She even knows exactly which recipe page you are currently viewing!
- **Lightning Fast Exploration:** The Explore page is backed by Upstash Redis, ensuring millisecond load times for discovering new recipes.
- **Word Document Exports:** Instantly export any recipe into a beautifully formatted `.docx` file for offline use or printing.
- **Secure Authentication:** Seamless login via Google OAuth 2.0 or Email/Password credentials.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL with `pgvector`
- **Caching:** Redis (via Upstash)
- **AI & NLP:** NVIDIA Nemotron-3.5 API, LangChain, FastEmbed (BGE-Small-EN), ONNX Runtime
- **Storage:** AWS S3 Compatible Object Storage
- **Auth:** NextAuth.js (v4)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- A PostgreSQL Database with the `vector` extension installed
- Redis instance (Upstash recommended)
- NVIDIA API Key (for LLM)
- Google Cloud Console OAuth Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/RecipeAI.git
   cd RecipeAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and configure your keys (see `.env.example` if available, or reference the Product Manual for required keys like `DATABASE_URL`, `NVIDIA_API_KEY`, etc.).

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Note: Ensure you have manually executed `CREATE EXTENSION IF NOT EXISTS vector;` on your Postgres database first).*

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 📚 Documentation

For an in-depth breakdown of the architecture, AI semantic search flows, and Vercel deployment strategies (including Serverless function workarounds for AI models), please read the **[PRODUCT_MANUAL.md](./PRODUCT_MANUAL.md)**.
