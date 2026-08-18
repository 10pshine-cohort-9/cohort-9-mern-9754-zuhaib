# Notes App — Frontend scaffold

React (Vite) client scaffold with API helpers and routing shell.

## Structure

```
frontend/
├── src/
│   ├── hooks/       # useAuth
│   ├── services/    # API client + auth API
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js   # proxies /api → backend
└── package.json
```

## Run

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

Auth pages and styling arrive in the follow-up frontend PR. Requires the backend auth PR for full sign-in flow.
