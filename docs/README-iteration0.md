# Iteration 0 checklist (Data)

- [x] Design the tables: `data/schema.sql`
- [x] Pick 3 institutions (UJ, UP, TUT) and 12 courses (4 each)
- [x] Start the source sheet: `data/source_sheet.csv` (APS, subjects, closing date, official link, date checked, checked by, status)
- [x] Load the sheet into the tables: `data/seed.sql` (tested in SQLite: 12 courses, 51 requirement rows)
- [x] Write the matching rules and the near-miss rule: `docs/matching-rules.md`
- [x] APS rules and likelihood-label rules (draft, to agree with Kwena): sections 3 and 9 of `docs/matching-rules.md`

## Still to confirm (not blocking iteration 0)

- UJ: the 12:00 closing time (guide sites only), the BSc Computer Science and LLB closing dates (page copies seen did not show a 2026 date), and the APS method.
- UP and TUT: how many subjects count towards APS.
- TUT: only ICT diplomas are loaded. Add a non-ICT course from the TUT 2027 prospectus later for variety.
- Fee amounts: UJ free online, UP R300 (guide sites).

## Notes for the team

- On 2026-10-16 only UJ is still open for 2027. UP closed 30 Jun 2026 and TUT 30 Sep 2026. Decide whether the app shows closed courses.
- Meeting the minimum never guarantees a place; wording must say "meets the minimum".
## Security checklist (Iteration 0 - Kwena)

For every row, record exactly one result: **PASS**, **FAIL**, or **NOT TESTED**. Add dated evidence (test output, configuration, or review record). A missing feature is **FAIL** when required for this iteration; otherwise record it as **NOT TESTED** with the reason. Do not treat configuration alone as proof that a security test passed.

| Security control | PASS criteria | Result / evidence |
|---|---|---|
| Secrets excluded from Git | `.gitignore` excludes local environment files; no credentials or private keys are tracked or found in the repository/history. | NOT TESTED — a local heuristic scan on 2026-10-21 found no matches in tracked working files or 234 reachable Git blobs; this is not a full secret scanner. Verify with GitHub secret scanning. |
| Sample configuration | `.env.example` has safe local defaults/placeholders only; `.env` is ignored. | PASS — `.env.example` contains only `SERVER_PORT=8080`; `.gitignore` ignores `.env` and `.env.*` except `.env.example`. |
| Demo data | Any demo fixtures are clearly synthetic; no real learner information or documents are used. | PASS for current fixtures only — `fake-data.js` uses example course/bursary data and synthetic marks, with no real learner profile or documents. A judge login/profile is not implemented; apply the documented policy if added. |
| Input validation | Automated tests show invalid, missing, out-of-range, oversized, and unexpected input is rejected safely. | PASS — `mvn clean test -q` on 2026-10-21; `MarksValidatorTest` and `MatchApiTest` cover missing, malformed, invalid, oversized, and unexpected input. |
| Access control | Tests show one user cannot read or change another user's private data; if accounts are absent, document that limitation and do not store private learner data. | PASS for current scope — there are no accounts or private learner profiles; marks are processed in memory only. Do not add saved learner data without authentication and authorization. |
| Dependency security | Dependency graph and Dependabot alerts are enabled; dependency updates are configured; open alerts are reviewed and triaged. | NOT TESTED — Dependabot update schedule is in `.github/dependabot.yml`; verify repository alert settings and review alerts. |
| Secret scanning | GitHub secret scanning and push protection are enabled where supported; scan findings are reviewed and resolved. | NOT TESTED — prior screenshots documented enabled protections; verify current settings and findings. |
| Security testing | Relevant tests and scans complete; failures are fixed or tracked with an owner and due date. | NOT TESTED — clean Maven tests pass, but GitHub secret/dependency alerts and a full secret scan still need verification. |
| Data minimisation | The demo collects and retains only data needed for the demonstrated features; retention/deletion behavior is documented. | PASS for current scope — matching marks are processed in memory; the obsolete unauthenticated write endpoint and persistence model were removed. No learner profile data is stored. |
| Documentation | Every result has dated evidence; failures and accepted exceptions have an owner, action, and due date. | NOT TESTED — team agreement and GitHub setting verification remain; record evidence and owners when confirmed. |

### Security Testing

**PASS:** All applicable security checks have been run and their dated evidence is recorded. No unresolved critical or high-severity issue remains, no secret is exposed, and all demo data is synthetic.

**FAIL:** Any check finds an unresolved critical or high-severity issue, an exposed secret, real learner data in the demo, or an unmitigated security-test failure. Do not sign off or release while a failure remains.

**NOT TESTED:** A check has not been run or has no evidence. NOT TESTED is not a pass and blocks security sign-off.

Record each check with its date, result, evidence, and remediation owner/due date when it fails. A configuration being present does not prove the application behaves securely.

### Demo-account data policy

The judge demo is not available yet. When implemented, provide a clearly labelled, preloaded fictional profile with synthetic marks so judges do not need to enter personal information or use a learner's account. Never use real names, ID numbers, contact details, marks, household-income details, or identity documents, including altered or anonymised copies of real records. Do not save demo submissions as learner profiles. Keep any future demo credentials out of source control and rotate them if exposed.

### SSDLC gate

The SSDLC gate **passes** only when every applicable checklist item is PASS or has a documented exception approved by the team, with evidence and an owner. Any FAIL, NOT TESTED item, exposed secret, or unresolved critical/high issue blocks security sign-off. A feature not implemented must be recorded as such; it cannot be described as protected by an unimplemented control.

### Security test evidence

- **SQLite seed integrity — PASS:** On 2026-10-19, loaded `schema.sql` and `seed.sql` into a temporary in-memory SQLite database with foreign-key enforcement enabled. Loaded 3 institutions, 12 courses, 9 subjects, 51 course requirements and 17 sources. `PRAGMA foreign_key_check` returned no errors.
- **Maven build — PASS (historical):** On 2026-10-19, `mvn test` returned `BUILD SUCCESS`, but reported "No tests to run". This confirms that build only; current application security tests remain unverified.
- **Maven tests — PASS:** On 2026-10-21, `mvn clean test -q` passed 79 tests across 9 suites with 0 failures, errors, or skips. This includes input-validation/API coverage; it does not replace secret/dependency scans.
- **Local secret heuristic — no matches, limited evidence:** On 2026-10-21, checked tracked working files and 234 reachable Git blobs for six common credential patterns (private-key headers, AWS/GitHub/Google/Slack tokens, and credential assignments). No matches. This is not comprehensive; GitHub secret scanning still needs verification.
- **Legacy write route — PASS:** Removed the unused unauthenticated `POST /api/matching/process` endpoint and its persistence classes. `MatchApiTest` now asserts the old route returns 404.
- **Demo seed data review — PASS for `seed.sql` only:** The inspected seed data contains institutional and course information, not learner profiles or identity documents. Other files have not all been reviewed.
- **GitHub protections — historical evidence:** Secret Protection and push protection were shown enabled in GitHub screenshots. Dependency graph, Dependabot alerts and Dependabot security updates were confirmed by the developer. Re-check current repository settings and alerts before signing off.
- **Remaining sign-off:** Repository admin to verify GitHub secret scanning, push protection, dependency graph and Dependabot alerts at https://github.com/ConstanceKwena/ukhanyiso/settings/security_analysis and review any findings. Kwena and Nana to agree on the plain-language APS and likelihood rules in `docs/matching-rules.md`.
