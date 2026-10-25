# SSDLC: secure development of Ukhanyiso

Updated 24 Oct 2026 by the Security lead for the FNB AOTY Hackathon. Companion log: `docs/security-findings.md`.
Rule from `docs/README-iteration0.md`: every item is PASS, FAIL or NOT TESTED. NOT TESTED is not a pass. A control that is not built is recorded as not built.

## 1. What data we handle

| Data | Where it goes | Stored? |
|---|---|---|
| Matric marks (`POST /api/match`) | Processed in memory to match courses and work out Path to yes | **No.** Not stored, not logged. |
| Learner stage, subject choices | Browser `sessionStorage` only | No, cleared when the tab closes |
| Account (optional sign-up): email, password hash, language, consent time | In-memory H2 database (`app_users`) | **Yes, until the app restarts.** Passwords hashed (PBKDF2), never stored in plain text. |
| Checklist ticks (logged-in learners) | `checklist_progress` | Yes, until restart |
| Funding planner numbers (page `plan.html`) | Browser only. The page says nothing is saved. | No (but see F-07) |
| Demo account | Fictional profile, synthetic data only | Re-created at each start |

We collect no ID numbers, exam numbers, names, phone numbers or documents.

## 2. SSDLC phases

| Phase | Control | Status | Evidence |
|---|---|---|---|
| Requirements | Security and privacy requirements written before code: validation rules, error wording, spam limits | PASS | `docs/test-cases-validation.md` (V-01 to V-12, S-01 to S-03) |
| Requirements | Data minimisation: marks never stored; no real learner data in the demo | PASS for marks and demo. Sign-up stores email: see F-12 | Section 1; `docs/learner-stage.md` |
| Design | Honest results: "meets the listed minimum", never "you will get in"; data provenance statement | PASS | `docs/data-update-2026-10-23.md` section 4 |
| Design | Rule-based features are explainable; Path to yes is proven by re-running the real matcher; no machine-learning claims | PASS | `docs/path-to-yes.md`, `PathToYes.java` |
| Implementation | Server-side validation: whole numbers 0 to 100, known subjects, no duplicates or impossible combinations, unknown JSON fields rejected | PASS (tests) | `MarksValidatorTest`, `MatchApiTest` |
| Implementation | Request-size limit and rate limit on `/api/*` (60 per minute; 10 per minute on `/api/match`; 5 per minute on sign-up) | PASS (tests); hosted behaviour NOT TESTED | F-01 |
| Implementation | Passwords: PBKDF2 hash with a random salt; same-speed check for unknown email (dummy hash); same error for wrong email or password | PASS (code review) | `PasswordHasher`, `ChecklistRepository.passwordMatches` |
| Implementation | Sessions: replaced at login and sign-up (anti session fixation); `HttpOnly`; `SameSite=Lax`; CSRF token required on every state-changing request | PASS (code review, `ChecklistApiTest`) | `ChecklistController` |
| Implementation | Output safety: front end writes learner-visible text with `textContent`, never `innerHTML`; errors never echo input; error details switched off | PASS | `application.properties`, `results.html` |
| Implementation | Secrets: none in the repo; `.env` ignored; WhatsApp and other keys not used | PASS (limited): heuristic scan only | `docs/README-iteration0.md`. GitHub secret scanning must be re-checked by an admin. |
| Implementation | Cookie `Secure` flag | **FAIL, open** | F-05 |
| Implementation | Security headers (Content-Security-Policy, `nosniff`, framing) | **FAIL, open** | F-06 |
| Testing | Automated tests: `mvn clean test` | PASS: **117 passed** on `day1-submission`, 24 Oct 2026 | Includes 8 Path to yes cases (P-01 to P-07) |
| Testing | Security retest on the hosted app (two clients, rate limit, login, CSRF, restart) | **NOT TESTED** | F-01, F-02 |
| Testing | CI pipeline running tests on every pull request | **FAIL, open**: only Dependabot is configured, so pull requests show 0 checks | F-09 |
| Deployment | HTTPS: the host serves the app over HTTPS | PASS (host feature); confirm on the live URL | Render |
| Deployment | Demo has fictional data only; judges use the demo account | PASS | `docs/learner-stage.md`, README |
| Deployment | Persistence: H2 is in-memory, so accounts and ticks reset on restart (accepted for the hackathon) | Accepted risk | F-03 |
| Maintenance | Dependabot alerts and weekly updates enabled; a Spring Boot parent upgrade is waiting | Open | F-10 |
| Maintenance | Findings log with owners and retest steps | PASS | `docs/security-findings.md` |

## 3. Sign-off gate

**Not yet passed.** Under our own rule, any FAIL or NOT TESTED item blocks sign-off. Items to close first: F-01 and F-02 (hosted retest), F-05, F-06, F-09 and F-12. Close or accept each with an owner before submitting, and say plainly on the deck what is accepted and why.

## 4. Short version to paste into the Sonke SSDLC form (about 250 words)

> **Data:** Marks are processed in memory and never stored or logged. Optional accounts store an email, a hashed password and a language choice, kept in an in-memory database that resets when the app restarts. We collect no ID numbers, names or documents, and the demo uses a fictional profile.
>
> **Built-in security:** Server-side validation of every request (whole numbers 0 to 100, known subjects, impossible combinations rejected, unknown fields rejected); request-size and rate limits; passwords hashed with PBKDF2 and a random salt; sessions replaced at login; HttpOnly and SameSite cookies; CSRF tokens on every save; the front end writes text safely (no innerHTML); error details switched off. Results use honest wording ("meets the listed minimum").
>
> **Testing:** 117 automated tests passed on 24 Oct 2026, including validation, API and hand-calculated matching cases. Our Path to yes feature re-runs the real matcher on every suggestion, so it cannot suggest something that would not work.
>
> **Known gaps, tracked in our findings log:** hosted-app security retest not yet done; cookie Secure flag and security headers not yet added; no automated CI pipeline yet; data resets on restart (accepted for the hackathon). We record unfinished controls as unfinished.
>
> **Process:** pull requests with a reviewer, no secrets in git, Dependabot alerts on, a findings log with owners and retest steps.
