# Ukhanyiso

Ukhanyiso guides a learner from matric marks to campus. It shows the university and TVET courses a learner qualifies for, plus the funding and documents they need to apply.

Built by **Ubuntu Innovators** for the FNB App of the Year Hackathon 2026.
Challenge: **Access to higher education**.

## Features

- **APS calculator:** enter matric marks and see the courses you qualify for.
- **Likelihood labels and near-miss suggestions:** rule-based, no machine learning.
- **Funding and document checklist:** bursaries, what each needs, and closing dates.
- **Demo login and save progress.**

Roadmap (not built yet): first-year survival hub, WhatsApp bot.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (mobile-first) |
| Backend | Java, Spring Boot (Maven) |
| Database | SQLite |

## Run it locally

> TODO (Nhlanhla): confirm the Java version, then delete this note.

1. Clone the repo:
   ```bash
   git clone https://github.com/ConstanceKwena/ukhanyiso.git
   cd ukhanyiso
   ```
2. Create your env file:
   ```bash
   cp .env.example .env
   ```
   Fill in the values. Never commit `.env`.
3. Start the app:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Open http://localhost:8080 (Spring Boot default port).

Requirements: Java 17 or newer (TODO: confirm version), Git.

## Demo account

> TODO (Kwena): add the demo login for judges once it exists. Fake data only, no real learner info.

Live app: TODO (add the hosted URL).

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