---
title: Ukhanyiso
emoji: 🎓
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
---

# Ukhanyiso

Ukhanyiso guides a learner from matric marks to campus. It shows the university, university-of-technology, and TVET college courses a learner qualifies for, plus the funding and documents they need to apply.

Built by **Ubuntu Innovators** for the FNB App of the Year Hackathon 2026.
Challenge: **Access to higher education**.

## Features

- **APS calculator:** enter matric marks and see the courses you qualify for.
- **Likelihood labels and near-miss suggestions:** rule-based, no machine learning.
- **Path to yes:** for a course you narrowly missed that is still open, shows the cheapest mark improvements that would meet the minimum (for example "Raise Mathematics from 58% to 60%"). Every suggestion is proven by re-running the real matching rules. Rules: `docs/path-to-yes.md`.
- **Keep my funding:** a money planner that uses only the numbers the learner types in.
- **Funding and document checklist:** bursaries, what each needs, and closing dates.
- **Username/password accounts** with saved, account-specific checklist progress.
- **Optional profile details** (first name, surname, reminder email, WhatsApp number) — every field is optional and never required.
- **Password recovery (prototype)** via an optional recovery email, stored only as a hash.

Roadmap (not built, not in the app): first-year survival hub, WhatsApp bot.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (mobile-first) |
| Backend | Java, Spring Boot (Maven) |
| Database | File-based H2 locally; PostgreSQL for hosted deployments |


## 🌐 Live Hosted Deployment & Demo Access

The live web application is hosted on Render and open for testing:

* **Live App URL:** **[https://ukhanyiso.onrender.com](https://ukhanyiso.onrender.com)**  
  *(Note: Free-tier cloud instances sleep when idle; the first request may take up to 60 seconds to spin up).*

### Judge Demo Account (Quick Evaluation)
To test saved checklist progress and account features immediately without creating an account:
* **Username:** `demo_learner`
* **Password:** `DemoPassword2026!`


Requirements: Java 21 LTS, Maven, Git.

## Sign-up and log-in

Create your Ukhanyiso account using a username (3–50 letters, numbers, underscores, or hyphens) and a unique password (12–128 characters). Do not reuse a password from another account or enter an ID or exam number. No email, phone number, or recovery information is collected. Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes; the app does not store the password itself. Password recovery is not available yet.

After signing in, enter fictional matric marks yourself. Marks are sent to the server for course matching but are not persisted. Checklist progress is attached to your account and, with the local H2 database, survives app restarts on the same computer. Never enter real learner identity, school-record, contact, or financial details.

### Profile details (all optional)

The Profile page lets an account add a first name, surname, an email address for reminders, and a WhatsApp number. Every field is optional and the app works fully without them. Names accept letters, spaces, hyphens and apostrophes; the WhatsApp number accepts digits with an optional leading +; the reminder email is validated as an email address. These values are stored in the account database in plain text (they are contact details, not secrets) and are never used for marketing or shared with anyone. WhatsApp delivery is not built yet — the field saves the preference for when it is.

### Password recovery (prototype)

Accounts can optionally store a recovery email for password resets. The email is stored **only as a salted SHA-256 hash** — the app never keeps the address itself, so a database leak does not expose learner contact details. The reset flow uses a one-time token that expires after one hour, only its hash is stored, and the "forgot password" endpoint always answers the same way whether or not the account exists. Until a mail provider is connected, the reset token is written to the application log (prototype delivery only).

**Prototype privacy:** this app has not been approved for real learner records. Use sample/fictional marks and learner information while testing, and never enter an ID or exam number. Account usernames, salted password hashes, and checklist ticks are stored in the configured database. Marks are processed for matching and kept in the current browser tab only to show results. Study plans, reminders, funding-document ticks, language preference, and financial planning entries stay in browser storage or in the current page, not in the account database. Browser data can be cleared or lost with the device. Before inviting real learners, complete a privacy, security, retention, and support review and configure persistent hosted storage.

### Backing up accounts

Accounts and checklist progress live in the local H2 file database (`data/ukhanyiso.mv.db`). Deleting or losing that file deletes every account. Run `scripts/backup_db.sh` (from the project root or any directory) to write a timestamped SQL backup to `data/backups/ukhanyiso-<date>.sql.zip`; it is safe to run while the app is running and keeps the 10 most recent backups. To restore, unzip a backup and run its `script.sql` into an empty H2 database, e.g.:

```bash
java -cp ~/.m2/repository/com/h2database/h2/<version>/h2-<version>.jar org.h2.tools.RunScript \
    -url "jdbc:h2:file:./data/ukhanyiso" -user sa -script script.sql
```

## TVET college courses

The catalogue now includes South West Gauteng TVET College (SWGC) alongside UJ, UP and TUT: NC(V) Information Technology and Computer Science, NC(V) Electrical Infrastructure Construction, NC(V) Finance, Economics and Accounting, N4 Financial Management, and N4 Mechanical Engineering. TVET admission does not use a university APS — every requirement is a per-subject percentage pass from the [official SWGC Student Admission Policy](https://www.swgc.co.za/wp-content/uploads/2026/01/Student-Admission-Policy_2025-08-28.pdf) (sections 13 and 15, checked 2026-10-25), so results for SWGC courses report subject requirements only, with no APS number. NC(V) closing dates follow policy section 12 (end of October of the preceding year) and are marked "partial" until the college calendar confirms the exact date. Matric/Grade 12 holders apply for Report 191 programmes only; Grade 9–11 learners apply for NC(V) programmes only.

## Databases: H2 by default, PostgreSQL supported

The default database is the H2 file database (`data/ukhanyiso.mv.db`). The Postgres JDBC driver is already on the classpath, so switching is configuration only — set these environment variables and restart:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/ukhanyiso
export SPRING_DATASOURCE_USERNAME=ukhanyiso
export SPRING_DATASOURCE_PASSWORD=...
export SPRING_SQL_INIT_MODE=always   # first boot creates the schema; set to never afterwards
```

`schema.sql` and `data.sql` are written to run on both engines, and the username-length migration already has a Postgres branch. A live-Postgres integration test (`PostgresSchemaIT`) runs automatically when those environment variables point at a reachable Postgres and skips silently otherwise.

## Deploy to Hugging Face Spaces

The app can run as a public Docker Space. Create a new Space on Hugging Face, select **Docker** as the SDK, and set its visibility to **Public** if judges need to open it without an invitation. The Dockerfile listens on port 7860, as required by the Space configuration above.

To deploy this branch, add the Space repository as a Git remote and push this branch to the Space's `main` branch:

```bash
git remote add huggingface https://huggingface.co/spaces/<your-account>/<your-space>
git fetch huggingface main
git push --force-with-lease=refs/heads/main:$(git rev-parse refs/remotes/huggingface/main) huggingface HEAD:main
```

Replace `<your-account>` and `<your-space>` with the values from the Space URL. If the `huggingface` remote already exists, use `git remote set-url huggingface https://huggingface.co/spaces/<your-account>/<your-space>` instead of `git remote add`. Fetch first, then push with the lease so the generated Static Space starter files are replaced only if the Space has not changed since the fetch. Hugging Face may ask you to sign in or authenticate Git when pushing; enter your access token only at the private Git credential prompt. Do not put an access token in the remote URL or commit it to this repository.

The public app URL will be `https://<your-account>-<your-space>.hf.space`. Wait for the Space build to finish, then open that URL and test sign-up and the learner journey using fictional details only. On the free tier the Space may sleep while idle; its in-memory H2 database is cleared whenever the app restarts, so accounts and checklist progress do not persist through restarts.
## Hosted deployments

Use a persistent PostgreSQL database for hosted deployments; some hosts erase local files when they restart or redeploy. Configure the host with `SPRING_DATASOURCE_URL` (for example, `jdbc:postgresql://<host>:<port>/<database>`), `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. Set these as deployment environment variables or secrets, never in source code. For HTTPS deployments, also set `SESSION_COOKIE_SECURE=true`.

Live app: https://ukhanyiso.onrender.com (free hosting: it sleeps when idle and the first request can take about a minute). Persistence there depends on configuring a persistent PostgreSQL database as described above. Checklist API details are in [docs/checklist-api.md](docs/checklist-api.md).

## Testing

Pushes and pull requests targeting `day1-submission` run the Maven tests, JavaScript unit tests, and a Playwright browser smoke test against a locally started app. The Docker build also runs the Maven tests before producing the image, so a failed Java test prevents the Render image from building.

To run the same browser smoke test against the deployed Render app, open the **Ukhanyiso tests** workflow in GitHub Actions, choose **Run workflow** on `day1-submission`, and leave the URL as `https://ukhanyiso.onrender.com` (or enter another deployment URL). The smoke test only opens the dashboard and marks page; it does not create an account or submit learner data.

## Contributing

1. Never push to `main`. Work on a branch: `it<number>-<name>-<task>`.
2. Open a pull request for every change and link the issue (`Closes #<number>`).
3. One reviewer must approve before merging. You can't approve your own PR.
4. No secrets in git. Use `.env` and `.env.example`.
5. No real learner data anywhere. Fake data only.

## Project docs

Plans, rules, roles and the submission checklist are in the [wiki](https://github.com/ConstanceKwena/ukhanyiso/wiki).

## Team

| Name | Role |
|---|---|
| Lorraine Mkwebo | Team Lead |
| Nhlanhla Mbokane | Backend Lead |
| Kwena Mpherwane | Security |
| Nana Lategang | Data |
| Thembani Mahlulo | Frontend |

## Data sources

Course requirements and closing dates come from official institution pages. Each entry in the source sheet records the APS, subjects, closing date, official link and the date it was checked. Always confirm with the institution before applying.


## Security checklist

**Checked:** 23 October 2026  
**Owner:** Kwena

### GitHub security settings

- Secret scanning: ON
- Push protection: ON
- Dependency graph: ON
- Dependabot alerts: ON
- Dependabot security updates: ON
- Evidence: GitHub security settings screenshots

### Alert review

- Secret-scanning alerts: 0 open, 0 closed
- Checked: 23 October 2026
- Evidence: GitHub Secret scanning alerts page screenshot
- Dependabot vulnerability alerts: NOT CHECKED YET

### Security findings

- F-01 rate limiting: RETEST NOT DONE YET
- F-02: WAITING FOR THE ORIGINAL FINDING DETAILS
- Do not mark a finding as fixed until it has been retested.

### SSDLC notes

We check security during development by reviewing changes,
validating user input, protecting secrets
and testing important security controls. 
We record what we checked, when we checked it, and the evidence. 
Any issue that has not been tested or fixed stays marked as open or not tested.

- Dependabot alerts: 0 open, 0 closed
- Checked: 24 October 2026
- Evidence: GitHub Dependabot alerts page screenshot
- F-01 hosted retest: NOT PASS — first device returned 200 for all 11 requests;
- request 11 was expected to return 429. Second device returned 200. 
- Further investigation needed.
- Local rate-limit test: PASS — requests 1–10 returned 200; request 11 returned 429.
- Hosted rate-limit test: NOT PASS — all 11 requests returned 200. F-01 remains open for investigation.