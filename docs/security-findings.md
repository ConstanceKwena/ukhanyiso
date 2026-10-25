# Security findings and retest log

Updated 24 Oct 2026. Use only the synthetic demo account. Never test with real learner data.
Hosted-app retests are NOT TESTED until someone records the date and result in the last column.

| ID | Finding | Severity | Owner | Status | Retest evidence needed |
|---|---|---|---|---|---|
| F-01 | Rate limiting uses `remoteAddr`. Behind the host's reverse proxy this may identify the proxy, so one client could use up everyone's quota. | Medium | Backend | Open | Retest on the hosted app from two clients. Confirm trusted-proxy settings before using forwarded headers. |
| F-02 | Original finding kept as a placeholder: the security lead must add what it was, a reproduction and an owner, or close it as "no reproduction". | Unknown | Security lead | Needs detail | Reproduction and hosted retest. |
| F-03 | In-memory H2 loses accounts and checklist ticks on every restart. Accepted for the hackathon; the demo account is re-created at start. | Low (accepted) | Backend | Accepted risk | State it on the deck. Production path: a persistent database. |
| F-04 | Login has only the general limit (60 per minute per address), not its own stricter one. Password guessing is slowed by PBKDF2 but not capped. | Medium | Backend | Open | Add a limit of about 10 per minute on `POST /api/auth/login`; test with 11 requests (expect 429). |
| F-05 | Session cookie has no `Secure` flag. | Medium | Backend | Open | Set `server.servlet.session.cookie.secure=true`; check on the hosted app that login still works and the cookie shows Secure. |
| F-06 | No security headers: Content-Security-Policy, `X-Content-Type-Options: nosniff`, framing protection. | Medium | Backend | Open | Add a small filter; check headers on the hosted app. |
| F-07 | The backend has `GET/PUT /api/plan` and a `financial_plans` table that can store a logged-in learner's money details, but the planner page says "nothing is saved". The two disagree. | Medium (privacy) | Backend + Security | Open | Either remove the endpoint and table, or tell learners plainly what is saved. Then re-read the planner page text. |
| F-08 | Sign-up consent says "I can ask for my account to be deleted", but there is no delete feature. | Medium (POPIA) | Team Lead | Open | Name a contact method for deletion requests, or build deletion. |
| F-09 | No CI workflow: only Dependabot is set up, so pull requests show 0 checks and tests run only by hand. | Medium | Backend | Open | Add a GitHub Actions workflow that runs `mvn clean test` on pull requests (Java 17). |
| F-10 | Dependabot has a Spring Boot parent upgrade branch waiting. | Low | Backend | Open | Merge after tests pass, or close with a reason. |
| F-11 | Sessions last 7 days. Convenient for learners on shared phones, but long. | Low (accepted) | Security | Accepted risk | Explain the choice; offer a log-out button (exists). |
| F-12 | Open sign-up lets real learners create accounts, while our demo policy says synthetic data only. | Medium | Team Lead + Security | Open | Tell judges to use the demo account; show a notice on the sign-up page that real details are the learner's choice and what is stored. |

## Mentor request (Friday to Sunday, before 17:00 Sunday)

Send with the exact phrase `HELP ME`:

> HELP ME: please review the Ukhanyiso login, sign-up and checklist API for session handling, CSRF, cookie flags, security headers, rate limiting behind a proxy and account enumeration. We use only a fictional demo account. Please help us prioritise F-01 and F-04 to F-08 and suggest retest steps.
