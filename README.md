# Notes App

Internship project (Cohort 9 MERN) — monorepo for a Notes application.

## Backend (this PR)

Express API foundation with MySQL connection pooling and a health-check endpoint.

### Structure

```
backend/
├── sql/init.sql         # MySQL schema (users table)
├── src/
│   ├── config/          # Environment + MySQL pool
│   ├── controllers/     # HTTP handlers
│   ├── middleware/      # Error handling
│   ├── routes/          # Route definitions
│   ├── utils/           # Helpers
│   ├── app.js
│   └── server.js
├── .env.example
└── package.json
```

### Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

### Environment variables

Copy `backend/.env.example` to `backend/.env` and set:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `PORT`         | API port (default `5000`)            |
| `DB_HOST`      | MySQL host                           |
| `DB_USER`      | MySQL user                           |
| `DB_PASSWORD`  | MySQL password                       |
| `DB_NAME`      | Database name (`notes_app`)          |
| `JWT_SECRET`   | Secret for signing tokens (required) |
| `CORS_ORIGIN`  | Frontend origin                      |

### Database setup

```bash
mysql -u root -p < backend/sql/init.sql
```

### Run the backend

```bash
cd backend
npm install
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

Auth endpoints arrive in the follow-up backend PR.
