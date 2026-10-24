# Checklist API

The checklist is available only to signed-in fictional accounts. Each account has separate checklist progress. Use fictional credentials and data only; do not enter real learner identity documents or personal information.

## Endpoints

- `GET /api/auth/csrf` creates a pre-authentication session and returns a token used by account-changing requests.
- `POST /api/auth/signup` accepts a fictional `username` and `password`, plus `X-CSRF-Token`. Usernames are 5–24 ASCII letters, numbers, hyphens, or underscores. Passwords must be 12–128 characters. Duplicate usernames return `409`.
- `POST /api/auth/login` accepts the same fields and token. Failed credentials use a generic `401` response.
- `GET /api/auth/me` returns the signed-in fictional username and session CSRF token.
- `POST /api/auth/logout` requires `X-CSRF-Token` and invalidates the session.
- `GET /api/checklist` requires authentication and returns the item catalogue, account-specific saved progress, and the CSRF token.
- `PUT /api/checklist` requires authentication and `X-CSRF-Token`, with `{"itemId":"school-results","completed":true}`. Item IDs are validated server-side.

Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes, not as plaintext. Sign-up and log-in rotate the session ID. Authentication requests are rate-limited, and protected pages and APIs require an authenticated session. Do not reuse a real password: this prototype has no email, password recovery, or account recovery.

Budget calculations run in the browser and are not sent to or saved by the backend. Match requests send marks to the backend for processing but do not persist them. Use fictional values throughout. The in-memory H2 database resets accounts and checklist progress when the app restarts.

## Database decision for Nana

The current backend and test suite use H2, configured as an in-memory database. That means checklist progress disappears when the host restarts. The wiki says SQLite, but the existing catalog schema includes H2-specific identity syntax, so changing only the JDBC URL would break startup. Nana must confirm whether the hosted app should:

1. stay on H2 temporarily for the showcase, accepting restart loss; or
2. migrate the complete catalog and checklist schema to a persistent SQLite file (recommended for the hosted showcase), with backup and file-permission rules.

No production SQLite migration is claimed until that decision is confirmed. The current implementation is deliberately H2-compatible so the team can test the feature without silently discarding the existing catalogue.
