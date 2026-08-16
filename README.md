# Notes App

Internship project (Cohort 9 MERN) — monorepo for a Notes application.  
**This PR covers project foundation, user authentication, and core notes CRUD.**

## Project structure

```
/
├── backend/                 # Node.js + Express API
│   ├── sql/init.sql         # MySQL schema (users + notes)
│   ├── src/
│   │   ├── config/          # Environment + MySQL pool
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── middleware/      # JWT auth + error handling
│   │   ├── repositories/    # Database access
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic (auth, notes)
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
│   │   ├── pages/           # Login, Signup, Home, Note editor
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

This creates the `notes_app` database, the `users` table (unique email), and the `notes` table.

If the database already exists from an earlier setup, re-running the script is safe (`CREATE TABLE IF NOT EXISTS`). It will add `notes` without dropping `users`.

### Schema

**`users`**

| Column         | Type           | Notes                                      |
|----------------|----------------|--------------------------------------------|
| `id`           | INT UNSIGNED   | Primary key, auto-increment                |
| `name`         | VARCHAR(100)   | Required                                   |
| `email`        | VARCHAR(255)   | Required, unique                           |
| `password_hash`| VARCHAR(255)   | bcrypt hash only — never returned by the API |
| `created_at`   | TIMESTAMP      | Default `CURRENT_TIMESTAMP`                |
| `updated_at`   | TIMESTAMP      | Auto-updated                               |

**`notes`**

| Column       | Type           | Notes                                                |
|--------------|----------------|------------------------------------------------------|
| `id`         | INT UNSIGNED   | Primary key, auto-increment                          |
| `user_id`    | INT UNSIGNED   | Foreign key → `users.id` (`ON DELETE CASCADE`)       |
| `title`      | VARCHAR(200)   | Required                                             |
| `content`    | TEXT           | Required (empty string allowed)                      |
| `created_at` | TIMESTAMP      | Default `CURRENT_TIMESTAMP`                          |
| `updated_at` | TIMESTAMP      | Auto-updated                                         |

`user_id` is indexed. A note always belongs to exactly one user.

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

### Auth endpoints

- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — `Authorization: Bearer <token>`

### Note endpoints

All note routes require `Authorization: Bearer <token>`. The authenticated user is taken from the JWT; `user_id` in a request body is ignored.

| Method   | Path             | Body                         | Success |
|----------|------------------|------------------------------|---------|
| `POST`   | `/api/notes`     | `{ "title", "content" }`     | `201` `{ data: { note } }` |
| `GET`    | `/api/notes`     | —                            | `200` `{ data: { notes } }` |
| `GET`    | `/api/notes/:id` | —                            | `200` `{ data: { note } }` |
| `PUT`    | `/api/notes/:id` | `{ "title", "content" }`     | `200` `{ data: { note } }` |
| `DELETE` | `/api/notes/:id` | —                            | `200` `{ message }` |

Validation:

- `title` — non-empty string after trim, max 200 characters
- `content` — string, max 50,000 characters
- `:id` — positive integer
- body — JSON object

Typical error statuses: `400` invalid input, `401` missing/invalid token, `404` note not found **for this user**.

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
- `/home` — authenticated notes dashboard
- `/notes/new` — create a note (textarea editor)
- `/notes/:id/edit` — edit a note

## Authentication and note ownership

1. User registers or logs in via the React pages.
2. Backend validates input, hashes passwords with bcrypt, and stores only `password_hash`.
3. Backend returns a JWT + public user profile (never the password hash).
4. Frontend stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>`.
5. Protected routes call `GET /api/auth/me`; middleware verifies the JWT and attaches `req.user`.
6. Every note endpoint uses that `req.user.id`. New notes are inserted with `user_id` from the token, not from the client.
7. Read, update, and delete queries always include `WHERE id = ? AND user_id = ?`. If the note exists but belongs to someone else, the query returns no row and the API responds with `404 Note not found.` — the same as a missing note. Changing the ID in the URL or body cannot access another user's data.

## Out of scope (later PRs)

Rich text editor, collections, Pino logging, SonarQube, Mocha/Chai, Jest, search/filter, realtime, import/export.
