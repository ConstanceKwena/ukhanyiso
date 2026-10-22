# Checklist API

The checklist is a demo-only authenticated flow. It stores a synthetic account and per-user completion state; it must not be used for real learner identity documents or personal data.

## Endpoints

- `POST /api/auth/login` with `{"email":"demo@ukhanyiso.example","password":"Ukhanyiso-Demo-2026!"}`. Creates an HTTP-only session cookie and returns a CSRF token.
- `GET /api/checklist` requires the session and returns the item catalogue, saved progress, and the CSRF token.
- `PUT /api/checklist` requires `X-CSRF-Token` and `{"itemId":"school-results","completed":true}`. Item IDs are validated server-side.
- `POST /api/auth/logout` requires `X-CSRF-Token` and invalidates the session.

Passwords are stored as PBKDF2-HMAC-SHA256 hashes. Session writes use a CSRF token and the session is replaced after login.

## Database decision for Nana

The current backend and test suite use H2, configured as an in-memory database. That means checklist progress disappears when the host restarts. The wiki says SQLite, but the existing catalog schema includes H2-specific identity syntax, so changing only the JDBC URL would break startup. Nana must confirm whether the hosted app should:

1. stay on H2 temporarily for the demo, accepting restart loss; or
2. migrate the complete catalog and checklist schema to a persistent SQLite file (recommended for the hosted demo), with backup and file-permission rules.

No production SQLite migration is claimed until that decision is confirmed. The current implementation is deliberately H2-compatible so the team can test the feature without silently discarding the existing catalogue.
