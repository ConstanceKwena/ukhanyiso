# Security findings and retest log

Hosted-app testing is blocked until a hosted URL and a synthetic demo account are provided. Do not test with real learner data.

| ID | Finding | Owner | Status | Retest evidence |
|---|---|---|---|---|
| F-01 | Rate limiting currently keys on `remoteAddr`; behind a reverse proxy this may identify the proxy rather than the learner. Confirm the trusted proxy configuration before using forwarded headers. | Backend / Nana | Open | Retest on the hosted app from two clients behind the proxy; verify one client cannot exhaust the other client's quota. |
| F-02 | Original finding retained for the security review owner to fill in from the team's security notes. | Security lead | Needs detail | Add reproduction, owner and hosted retest evidence before closing. |
| F-03 | Checklist state needs a persistent database decision: the current default H2 database loses progress on restart, while the wiki requires SQLite. | Nana / Backend | Open decision | After Nana confirms the database, restart the hosted app and verify the same demo account retains its saved item. |

## Mentor request (Friday–Sunday)

Send this with the exact phrase `HELP ME` during the mentor window:

> HELP ME — please review the Ukhanyiso demo login and checklist API for session fixation, CSRF, password storage, account enumeration, authorization, and restart persistence. Use only the synthetic demo account. Please assign owners to F-01/F-02/F-03 and include retest steps.

The hosted URL is still TODO, so no hosted-app retest is claimed in this repository.
