# NexusAI — Intelligent AI Chatbot

> A full-stack AI chatbot powered by **Google Gemini 2.5 Flash** with real-time web search, streaming responses, persistent chat history, and secure authentication.

![Landing Page](screenshots/landing.jpg)

---

## Features

- **Gemini 2.5 Flash** — fast, high-quality AI responses via the `@google/genai` SDK
- **Real-time Google Search grounding** — live answers for news, Bollywood releases, sports scores, weather, and trending topics
- **Accurate date & time (IST)** — every request injects the current `Asia/Kolkata` timestamp into the system prompt so the model always knows today's date
- **Streaming responses** — token-by-token SSE streaming so replies appear instantly
- **Persistent chat history** — conversations and messages stored in PostgreSQL per user
- **Conversation management** — rename, delete, and search past conversations from the sidebar
- **Secure authentication** — Clerk-powered sign-in / sign-up with Google OAuth and email
- **Markdown & code highlighting** — full `react-markdown` rendering with Prism syntax highlighting
- **Dark / light mode** — system-aware theme with manual toggle
- **Per-user data isolation** — every conversation is scoped to the authenticated user's ID

---

## Screenshots

| Landing Page | Sign In |
|---|---|
| ![Landing](screenshots/landing.jpg) | ![Sign In](screenshots/sign-in.jpg) |

---

## Tech Stack

### Frontend (`artifacts/chatbot`)
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | Wouter |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth UI | Clerk React (`@clerk/react`) |
| Data fetching | TanStack React Query |
| Markdown | `react-markdown` + `react-syntax-highlighter` |
| Icons | Lucide React |
| Animations | Framer Motion |

### Backend (`artifacts/api-server`)
| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Framework | Express 5 |
| AI SDK | `@google/genai` (Gemini 2.5 Flash) |
| Auth middleware | Clerk Express (`@clerk/express`) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod v4 + `drizzle-zod` |
| Logging | Pino + `pino-http` |
| Bundler | esbuild |

### Shared
| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 (strict) |
| API contract | OpenAPI spec + Orval codegen |
| Schema codegen | `drizzle-zod` |

---

## Project Structure

```
nexusai/
├── artifacts/
│   ├── chatbot/          # React + Vite frontend (port 22967)
│   └── api-server/       # Express API server (port 8080)
├── lib/
│   ├── db/               # Drizzle schema + database client
│   ├── api-spec/         # OpenAPI spec + Orval codegen
│   ├── api-client-react/ # Generated React Query hooks
│   └── api-zod/          # Generated Zod validation schemas
├── scripts/              # Shared utility scripts
├── pnpm-workspace.yaml
└── README.md
```

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** database
- **Gemini API key** — get one free at [Google AI Studio](https://aistudio.google.com/apikey)
- **Clerk account** — sign up at [clerk.com](https://clerk.com) (or use Replit's managed Clerk integration)

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nexusai
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set environment variables

Create a `.env` file in the project root (or set secrets in your hosting environment):

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexusai

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SESSION_SECRET=a_long_random_secret_string
```

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 5. Run in development

Start the API server:
```bash
pnpm --filter @workspace/api-server run dev
```

Start the frontend (in a separate terminal):
```bash
pnpm --filter @workspace/chatbot run dev
```

The app will be available at `http://localhost:22967`.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |
| `pnpm --filter @workspace/api-server run dev` | Start the API server with hot reload |
| `pnpm --filter @workspace/chatbot run dev` | Start the frontend dev server |

---

## How It Works

### Streaming Chat

1. User sends a message from the frontend
2. The React frontend calls `POST /api/openai/conversations/:id/messages`
3. The Express server inserts the user message into PostgreSQL
4. A Gemini chat session is created with full conversation history
5. Gemini streams the response as Server-Sent Events (SSE)
6. The frontend reads the stream and appends tokens in real time
7. On completion, the full assistant response is saved to PostgreSQL

### Real-Time Information

Every request to Gemini includes:
- **System prompt with current IST timestamp** — so date/time questions are always accurate
- **Google Search grounding tool** — Gemini autonomously decides when to search the web for current information

### Authentication & Data Isolation

- Clerk handles all authentication (session cookies, OAuth)
- `clerkMiddleware()` on the Express server validates every request
- All database queries filter by `userId` from the Clerk session — users can only access their own conversations

---

## API Endpoints

All endpoints require authentication (Clerk session cookie).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/openai/conversations` | List all conversations for the current user |
| `POST` | `/api/openai/conversations` | Create a new conversation |
| `GET` | `/api/openai/conversations/:id` | Get a conversation with all its messages |
| `PATCH` | `/api/openai/conversations/:id` | Rename a conversation |
| `DELETE` | `/api/openai/conversations/:id` | Delete a conversation |
| `POST` | `/api/openai/conversations/:id/messages` | Send a message (returns SSE stream) |
| `GET` | `/api/healthz` | Health check |

---

## Deployment

The app is built for [Replit](https://replit.com) deployment. To deploy:

1. Ensure all environment secrets are set in the Replit Secrets tab
2. Click **Deploy** in the Replit interface
3. Replit handles building, hosting, TLS, and health checks automatically

For other platforms, build the API server and frontend:

```bash
# Build API server
pnpm --filter @workspace/api-server run build

# Build frontend
pnpm --filter @workspace/chatbot run build
```

---

## License

MIT
