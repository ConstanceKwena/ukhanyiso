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

Status: NOT TESTED means evidence is still required.

| Security control | Pass criteria | Status |
|---|---|---|
| [ ] Secrets excluded from Git | `.gitignore` excludes `.env` and other local secret files; no real secrets are committed. | NOT TESTED |
| [ ] Sample configuration | `.env.example` contains placeholders only, if environment configuration is needed. | NOT TESTED |
| [ ] Demo account uses synthetic data | All demo learner profiles and marks are fictional; no real learner records or identity documents are used. | NOT TESTED |
| [ ] Input validation | Invalid or missing marks, APS values and course inputs are rejected or handled safely. | NOT TESTED |
| [ ] Access control | Users cannot access another learner's private information. If authentication is not implemented, record this as NOT IMPLEMENTED. | NOT TESTED |
| [ ] Dependency security | Dependencies are inventoried and GitHub dependency alerts are enabled where supported. | NOT TESTED |
| [ ] Secret scanning | GitHub secret scanning is enabled where supported, and findings are reviewed. | NOT TESTED |
| [ ] Security testing | Relevant tests run; failures are documented and fixed or recorded as unresolved. | NOT TESTED |
| [ ] Data minimisation | The demo collects and stores only data required for the iteration. | NOT TESTED |
| [ ] Documentation | Test evidence, unresolved risks and remediation actions are recorded. | NOT TESTED |

### Security Testing

**Pass:** The relevant security checks have been run, results are recorded, and no unresolved critical or high-severity issue remains.

**Fail:** A check identifies an unresolved critical or high-severity issue, secrets are exposed, or the demo uses real learner data without an approved safeguard.

**Not tested:** The check has not been run or there is no evidence to support a pass.

Record each check with its date, result, evidence and any remediation owner. Do not mark a control PASS based on configuration alone when a test is required.

### Demo-account data policy

The demo account must use fictional learner profiles and synthetic marks. Do not use real learner names, ID numbers, contact details, marks, family-income details or identity documents. Use clearly labelled synthetic records, and keep credentials out of source control. If realistic examples are needed, create them from scratch rather than copying real learner records.

### SSDLC gate

Iteration 0 security review is complete only when each applicable control has a recorded PASS or an explicitly accepted, documented exception. NOT TESTED and NOT IMPLEMENTED are not PASS. Unresolved critical or high-severity issues block the security sign-off.

### Security test evidence

- **SQLite seed integrity — PASS:** On 2026-10-19, loaded `schema.sql` and `seed.sql` into a temporary in-memory SQLite database with foreign-key enforcement enabled. Loaded 3 institutions, 12 courses, 9 subjects, 51 course requirements and 17 sources. `PRAGMA foreign_key_check` returned no errors.
- **Maven build — PASS:** On 2026-10-19, `mvn test` returned `BUILD SUCCESS`, but reported "No tests to run". This confirms the build succeeds; application security tests remain unverified.
- **Demo seed data review — PASS for `seed.sql` only:** The inspected seed data contains institutional and course information, not learner profiles or identity documents. Other files have not all been reviewed.
- **GitHub protections — VERIFIED:** Secret Protection and push protection were shown enabled in GitHub screenshots. Dependency graph, Dependabot alerts and Dependabot security updates were confirmed by the developer.
- **Remaining checks:** Scan repository contents and history for secrets; inspect all demo data; verify application input validation and access control when implemented; add and run relevant automated tests.
