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