# Notes App

Internship project (Cohort 9 MERN) — monorepo for a Notes application.  
**This PR covers project foundation and user authentication only** (no notes features yet).

## Project structure

```
/
├── backend/                 # Node.js + Express API
│   ├── sql/init.sql         # MySQL schema (users table)
│   ├── src/
│   │   ├── config/          # Environment + MySQL pool
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── middleware/      # JWT auth + error handling
│   │   ├── repositories/    # Database access
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic (auth)
│   │   ├── utils/           # Small helpers
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Process entry point
│   ├── .env.example
│   └── package.json
├── frontend/                # React (Vite) client
│   ├── src/
│   │   ├── components/      # Reusable UI pieces
│   │   ├── context/         # Auth state
│   │   ├── hooks/           # e.g. useAuth
│   │   ├── pages/           # Login, Signup, Home
│   │   ├── services/        # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- MySQL 8+

## Environment variables

### Backend (`backend/.env`)

Copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

| Variable        | Description                                      |
|-----------------|--------------------------------------------------|
| `PORT`          | API port (default `5000`)                        |
| `NODE_ENV`      | `development` or `production`                    |
| `DB_HOST`       | MySQL host                                       |
| `DB_PORT`       | MySQL port (default `3306`)                      |
| `DB_USER`       | MySQL user                                       |
| `DB_PASSWORD`   | MySQL password                                   |
| `DB_NAME`       | Database name (default `notes_app`)              |
| `JWT_SECRET`    | Long random secret used to sign tokens           |
| `JWT_EXPIRES_IN`| Token lifetime (e.g. `7d`)                       |
| `CORS_ORIGIN`   | Frontend origin (default `http://localhost:5173`)|
| `LOG_LEVEL`     | Pino level: `debug`, `info`, `warn`, `error`     |

### Frontend (`frontend/.env`)

Optional. By default the Vite dev server proxies `/api` to the backend, so you can leave `VITE_API_URL` empty.

```bash
cd frontend
cp .env.example .env
```

| Variable         | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `VITE_API_URL`   | API base URL. Leave empty in local dev (proxy). Set e.g. `http://localhost:5000` if not using the proxy. |

## Create the MySQL database

1. Start MySQL locally.
2. Run the init script (adjust user/host as needed):

```bash
mysql -u root -p < backend/sql/init.sql
```

Or from the MySQL client:

```sql
SOURCE /absolute/path/to/backend/sql/init.sql;
```

This creates the `notes_app` database plus `users` and `notes` tables. Email is unique. Notes belong to a user (`user_id`) and store HTML `content` for the rich-text editor.

If the database already exists, re-run `backend/sql/init.sql` (the notes table uses `CREATE TABLE IF NOT EXISTS`).

## Run the backend

```bash
cd backend
cp .env.example .env   # if you have not already
# edit .env with your MySQL credentials and JWT_SECRET
npm install
npm run dev            # nodemon (auto-reload)
# or
npm start              # plain node
```

API base: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

Auth endpoints:

- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — `Authorization: Bearer <token>`

Notes endpoints (JWT required):

- `GET /api/notes`
- `GET /api/notes/:id`
- `POST /api/notes` — `{ "title", "content" }`
- `PATCH /api/notes/:id` — `{ "title", "content" }`
- `DELETE /api/notes/:id`

Error responses use `{ "message", "code" }`. Production hides stack traces and unexpected error details.

## Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

- `/signup` — create an account  
- `/login` — sign in  
- `/home` — protected placeholder after auth  

## Authentication flow (summary)

1. User registers or logs in via the React pages.
2. Backend validates input, hashes passwords with bcrypt, and stores only `password_hash`.
3. Backend returns a JWT + public user profile (never the password hash).
4. Frontend stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>`.
5. Protected routes call `GET /api/auth/me`; middleware verifies the JWT and attaches `req.user`.

## Logging

The backend uses **Pino**.

- **Development:** pretty-printed logs (`pino-pretty`), default level `debug`.
- **Production (`NODE_ENV=production`):** JSON logs, default level `info`, no stack traces in HTTP responses.
- HTTP logs (via `pino-http`) include method, URL, status code, response time, and `X-Request-Id`.
- Application logs cover startup, database failures, auth success/failure, note create/update/delete, and unexpected exceptions.
- Passwords, JWTs, and `Authorization` headers are redacted. Request bodies are not logged.

Example:

```text
INFO  Server started  port=5000 env=development
INFO  User authenticated  userId=1
INFO  POST /api/notes 200  responseTime=18
ERROR Unexpected exception  err.message="connect ECONNREFUSED"
```

## Error handling

`AppError` carries `statusCode`, `message`, and `code`. Controllers/services throw it; `errorMiddleware` maps it to JSON. Unexpected errors are logged at `error` and return `500` with a generic message in production.

## Out of scope (later PRs)

Collections, Socket.IO, import/export, search, SonarQube, Mocha/Chai, Jest.
