# Ukhanyiso

Ukhanyiso guides a learner from matric marks to campus. It shows the university and university-of-technology courses a learner qualifies for, plus the funding and documents they need to apply. TVET college courses are on the roadmap.

Built by **Ubuntu Innovators** for the FNB App of the Year Hackathon 2026.
Challenge: **Access to higher education**.

## Features

- **APS calculator:** enter matric marks and see the courses you qualify for.
- **Likelihood labels and near-miss suggestions:** rule-based, no machine learning.
- **Path to yes:** for a course you narrowly missed that is still open, shows the cheapest mark improvements that would meet the minimum (for example "Raise Mathematics from 58% to 60%"). Every suggestion is proven by re-running the real matching rules. Rules: `docs/path-to-yes.md`.
- **Keep my funding:** a money planner that uses only the numbers the learner types in.
- **Funding and document checklist:** bursaries, what each needs, and closing dates.
- **Demo login and save progress.**

Roadmap (not built, not in the app): first-year survival hub, WhatsApp bot.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (mobile-first) |
| Backend | Java, Spring Boot (Maven) |
| Database | H2 (in-memory). Demo data resets when the app restarts |

## Run it locally

1. Clone the repo:
   ```bash
   git clone https://github.com/ConstanceKwena/ukhanyiso.git
   cd ukhanyiso
   ```
2. Create your env file:
   ```bash
   cp .env.example .env
   set -a
   . ./.env
   set +a
   ```
   `.env.example` contains the local server port only; this app currently needs no credentials or external service keys. Never commit `.env`.
3. Start the app:
   ```bash
   mvn spring-boot:run
   ```
4. Open http://localhost:8080 (Spring Boot default port).

Requirements: Java 17 (set in `pom.xml` and the `Dockerfile`), Maven, Git.

## Demo account

The judge demo is not available yet. When it is added, it must use a clearly labelled fictional profile and synthetic marks only. Do not enter, upload, or store real learner names, ID numbers, contact details, marks, household-income details, or documents in the demo. Use a preloaded synthetic profile rather than asking judges to use a learner's account or personal information.

Live app: https://ukhanyiso.onrender.com (free hosting: it sleeps when idle and the first request can take about a minute; saved checklist ticks reset when it restarts).

The demo uses an in-memory H2 database, so saved checklist progress is lost on restart. This is deliberate for the demo. Checklist API details are in [docs/checklist-api.md](docs/checklist-api.md).

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