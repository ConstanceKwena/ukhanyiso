# Checklist API

The checklist is available only to signed-in accounts. Each account has separate checklist progress. Do not enter real learner identity documents, ID numbers, exam numbers, or other personal information.

## Endpoints

- `GET /api/auth/csrf` creates a pre-authentication session and returns a token used by account-changing requests.
- `POST /api/auth/signup` accepts a `username` and `password`, plus `X-CSRF-Token`. Usernames are 3–50 ASCII letters, numbers, underscores, or hyphens. Passwords must be 12–128 characters. Duplicate usernames return `409`.
- `POST /api/auth/login` accepts the same fields and token. Failed credentials use a generic `401` response.
- `GET /api/auth/me` returns the signed-in username and session CSRF token.
- `POST /api/auth/logout` requires `X-CSRF-Token` and invalidates the session.
- `GET /api/checklist` requires authentication and returns the item catalogue, account-specific saved progress, and the CSRF token.
- `PUT /api/checklist` requires authentication and `X-CSRF-Token`, with `{"itemId":"school-results","completed":true}`. Item IDs are validated server-side.

Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes, not as plaintext. Sign-up and log-in rotate the session ID. Authentication requests are rate-limited, and protected pages and APIs require an authenticated session. Do not reuse a real password: this prototype has no email, password recovery, or account recovery.

Budget calculations run in the browser and are not sent to or saved by the backend. Match requests send marks to the backend for processing but do not persist them. Use fictional values for marks and budgeting.

Local development uses a file-based H2 database at `./data/ukhanyiso`; accounts and checklist progress survive app restarts on that computer. The `data` directory is ignored by Git and must not be committed. Tests use a separate in-memory H2 database.

Hosted deployments should use a persistent PostgreSQL database configured with `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` environment variables. Store the password as a deployment secret, not in source code. Do not rely on local database files on hosts that erase files during restarts or redeployments.

This prototype is not approved for real learner records. Use sample/fictional marks and learner information while testing; never enter an ID or exam number. Before real learner use, review privacy, security, retention, and support arrangements and verify that hosted PostgreSQL persistence is configured.
