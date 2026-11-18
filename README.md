
# KUAi — Know Us. Ask AI.

**Team Portfolio AI | AIE312 Final Project**

A bilingual team portfolio and AI chat application that introduces our team, showcases collaborative projects, and provides an interactive chat interface.

A web application that presents our team portfolio and provides an AI-powered chat interface. The project uses React and TypeScript for the frontend, with an Express API, PostgreSQL conversation history, and Google Gemini integration in the backend.

## Project Status

| Component | Status |
|---|---|
| React + TypeScript Frontend | Implemented |
| Group Portfolio Page | Implemented |
| English / Thai Language Support | Implemented |
| Interactive Chat UI | Implemented |
| Unicode-aware Character Counter | Implemented |
| Project Image Fallback | Implemented |
| Frontend API Service | Implemented |
| Chat API Contract | Documented |

| Frontend Automated Tests | 65 tests passing |
| ESLint | Passing |
| Production Build | Verified |
| GitHub Actions Frontend CI | Passing |
| Production Website | Deployed |
| Express Backend | Implemented |
| Conversation History | Stored in PostgreSQL (`conversations`, `messages`); kept 30 days |
| Google Gemini Integration | Implemented (requires a backend API key) |

## Project Branding

- Product Name: KUAi
- Tagline: Know Us. Ask AI.
- Team Name: KNOW US. ASK AI.
- Production Website: https://vercel.app


> Chat requests require the backend and a Google Gemini API key. PostgreSQL is required for chat history; each visitor can ask up to 10 questions per minute.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Vitest
- React Testing Library

### Backend and AI

- Node.js
- Express
- Google Gemini

## Repository Structure

```text
team-portfolio-ai/
├── package.json
├── package-lock.json
├── .github/
│   └── workflows/
│       └── frontend-ci.yml
├── docs/
│   └── chat-api-contract.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── database.ts
│       └── server.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 24 or compatible version
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/waru1549/team-portfolio-ai.git
cd team-portfolio-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `backend/.env` from `backend/.env.example`. Set `GOOGLE_API_KEY` to a newly rotated Gemini key and `DATABASE_URL` to a PostgreSQL database (local, or hosted on Render/Neon/Supabase with `?sslmode=require`). The backend creates its tables on start-up.

The Google Gemini API key stays in the backend environment and is never sent to browsers. Public visitors can ask questions; each visitor (by IP address) is limited to 10 questions per minute.

For local development, the frontend uses the Vite proxy to connect to `http://localhost:3000` by default. No frontend environment file is required unless you need to override that configuration.

Do not put API keys, passwords, or other secrets in frontend variables prefixed with `VITE_`.

### 4. Start Frontend and Backend

```bash
npm run dev
```

Run this command from the repository root. It starts the Express backend on port `3000` and the Vite frontend on port `5173`; both stop when the command is stopped.

The backend requires PostgreSQL and the environment variables above. The frontend Vite proxy forwards `/api` requests to the backend.

Chat messages are stored in PostgreSQL. The browser keeps a list of its own conversations in localStorage so they can be reopened after a refresh. `GET /api/health` reports whether the database is reachable; point an uptime pinger at it to keep free hosting awake.

### Share the Host with Other Networks (Temporary)

1. Start the frontend and backend from the repository root with `npm run dev`.
2. In a separate terminal, run `cloudflared tunnel --url http://localhost:5173` using the Cloudflare Tunnel CLI.
3. Share the temporary `trycloudflare.com` URL.

Keep both the app and tunnel running on the host. The temporary URL changes when the tunnel restarts. This is for temporary sharing, not production hosting; rotate the Gemini key before exposing the app because a key that has appeared in a repository or chat should be treated as compromised.

## Portfolio Project Slots

Edit `frontend/src/data/portfolioData.ts`. Each member has three blank entries in `projects`; fill each entry's `title.en`, `title.th`, `description.en`, `description.th`, and optional `coverImage` path. Add image files manually under `frontend/public/images/projects/` and use a path such as `/images/projects/member-1/project-1.webp`.

The three members use stable IDs `member-1`, `member-2`, and `member-3`. Update their names and profile fields in the same file. Set a member's `isPlaceholder` to `false` after its information is verified; placeholder member profiles are hidden from the portfolio page and AI context. Empty project slots are not displayed or sent to the AI. Portfolio data is edited in code only; there are no chat or website controls for adding, editing, uploading, or deleting portfolio data.

## Available Frontend Commands

These commands are for frontend-only development and quality checks. For the full application, use `npm run dev` from the repository root.

| Command | Description |
|---|---|
| `npm run dev` | Start the frontend only (without the backend) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run automated tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |

## Chat API

The frontend communicates with the backend through:

```http
POST /api/chat
Content-Type: application/json
```

The request and response structures are documented in:

`docs/chat-api-contract.md`

The frontend API service is located at:

`frontend/src/services/chatApi.ts`

## Automated Quality Checks

GitHub Actions runs the Frontend CI workflow when relevant frontend files or the workflow configuration change.

Workflow file:

`.github/workflows/frontend-ci.yml`

The pipeline performs:

1. Checkout Repository
2. Setup Node.js
3. Install Dependencies using `npm ci`
4. Run ESLint
5. Run Automated Tests
6. Build Production App

The CI workflow runs from `frontend/` and still uses `frontend/package-lock.json`. Local development uses the root workspace and root `package-lock.json`; the backend lockfile is not needed.

## Team Portfolio Data

The sample team and member information is maintained in:

`frontend/src/data/portfolioData.ts`

Replace the placeholder names, skills, descriptions, profile links, and contact information with the actual information approved by the team.

## Security Notes

- Never commit `.env.local` or other environment files containing secrets.
- Use `.env.example` to document required environment variables.
- Do not expose private API keys in frontend code.
- Keep credentials and database secrets on the backend.

## Project Repository

GitHub:

https://github.com/waru1549/team-portfolio-ai

## License

This project is developed for academic purposes as part of the AIE312 course.
