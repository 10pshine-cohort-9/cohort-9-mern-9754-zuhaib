# Notes App — Backend auth

Adds JWT authentication on top of the backend foundation PR.

## Endpoints

- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — `Authorization: Bearer <token>`

Passwords are hashed with bcrypt. API responses never include `password_hash`.

## Merge order

Merge **backend foundation** into `develop` before this PR.
