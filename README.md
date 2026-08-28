# Notes App

Internship project (Cohort 9 MERN) — a Notes application with JWT auth, rich-text notes, Pino logging, and automated tests.

## Technology stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express, MySQL (`mysql2`), JWT, bcryptjs, Pino |
| Frontend | React (Vite), React Router, TipTap, DOMPurify |
| Tests | Mocha + Chai + Sinon + Supertest (backend), Jest + Testing Library (frontend) |
| Quality | SonarQube (`sonar-project.properties`) |

## Architecture

```
Browser → React (Vite) → /api (proxy) → Express
                                         ├─ auth routes / JWT middleware
                                         ├─ notes routes (owner-scoped)
                                         ├─ services → repositories → MySQL
                                         └─ Pino + centralized AppError handler
```

Request flow for notes: HTTP → `pino-http` (request id) → JWT auth → route → service (validation + ownership) → repository → MySQL → JSON response. Failures throw `AppError` and are mapped by `errorMiddleware`.

## Project structure

```
/
├── backend/
│   ├── sql/init.sql
│   ├── src/                 # config, controllers, middleware, repositories, routes, services
│   ├── test/                # Mocha + Chai API tests (repositories mocked)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/                 # pages, components, context, services, hooks, utils
│   ├── package.json
│   └── jest.config.cjs      # added in frontend quality PR
├── sonar-project.properties
└── README.md
```

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9+
- MySQL 8+
- Optional: [SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/) and a SonarQube server

## Environment variables

### Backend (`backend/.env`)

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development`, `test`, or `production` |
| `LOG_LEVEL` | `silent`, `debug`, `info`, `warn`, `error` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Required long random secret (never commit real values) |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:5173`) |

### Frontend (`frontend/.env`)

```bash
cd frontend
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Leave empty in local dev (Vite proxies `/api`). Set to `http://localhost:5000` if needed. |

`.env` files are gitignored. Only `.env.example` is committed.

## Database setup

```bash
mysql -u root -p < backend/sql/init.sql
```

Creates `notes_app` with `users` and `notes` (FK to users, cascade delete). Notes store HTML `content` for TipTap.

## Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running the backend

```bash
cd backend
npm run dev    # nodemon
# or
npm start
```

API: `http://localhost:5000`  
Health: `GET /api/health`

## Running the frontend

```bash
cd frontend
npm run dev
```

App: `http://localhost:5173`

Routes: `/` landing, `/signup`, `/login`, `/home` dashboard, `/notes/new`, `/notes/:id`, `/profile`.

## API overview

**Auth**

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — `Authorization: Bearer <token>`

**Notes** (JWT required)

- `GET /api/notes`
- `GET /api/notes/:id`
- `POST /api/notes` — `{ title, content }`
- `PATCH /api/notes/:id` — `{ title, content }`
- `DELETE /api/notes/:id`

Errors: `{ message, code }`. Production responses never include stack traces. Passwords and tokens are never logged.

## Running tests

### Backend (Mocha + Chai)

Repositories are stubbed with Sinon — no live MySQL required.

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend (Jest)

```bash
cd frontend
npm test
npm run test:coverage
```

### Production build

```bash
cd frontend
npm run build
```

### Lint (frontend)

```bash
cd frontend
npm run lint
```

## SonarQube setup

1. Start SonarQube (or use SonarCloud) and create a project matching `sonar.projectKey` in `sonar-project.properties`.
2. Generate coverage (optional but recommended):

```bash
cd backend && npm run test:coverage
cd ../frontend && npm run test:coverage
```

3. Run the scanner from the repo root:

```bash
sonar-scanner
```

Configured sources: `backend/src`, `frontend/src`.  
Excluded: `node_modules`, `dist`, `build`, `coverage`, `.scannerwork`.

## Logging

- Development: pretty Pino logs (default `debug`)
- Production: JSON logs (default `info`)
- Tests: `LOG_LEVEL=silent`, no pretty transport
- HTTP logs include method, URL, status, response time, `X-Request-Id`
- Redacted: passwords, JWTs, `Authorization` headers; request bodies are not logged

## Error handling

`AppError(message, statusCode, code)` for operational failures. Unexpected errors are logged and return `500` with a generic message in production.

## Known limitations

- No collections, search, Socket.IO, or import/export
- Notes HTML is sanitized on the client before display; keep TipTap/DOMPurify allow-lists in sync with product needs
- Backend coverage focuses on auth + notes API behavior with mocked repositories
