# Matching test cases (Iteration 1, hand-calculated)

Five learners worked out by hand from `docs/matching-rules.md` and the course data in `src/main/resources/source_sheet.csv` (checked 2026-10-16).

How to read this file:

- Levels come from section 2 of the rules (70-79 is level 6, 60-69 is level 5, and so on). Life Orientation never counts towards APS.
- APS uses the best six subjects. TUT also drops any subject at level 1 before choosing the best six.
- Deadlines assume today is **2026-10-21**: UJ courses are `CLOSING_SOON` (closes 31 Oct), all UP and TUT courses are `CLOSED`. Use a fixed clock when testing, or ignore the deadline column.
- Every result for these institutions also carries the "APS method not yet confirmed" caveat (`aps_method_verified = 0`), and UJ results carry "The closing time is not published. Apply early."
- Only the courses that test a rule are listed. Courses not listed are not part of the check.

## M-01: exactly at the cut-off, two gaps, three points short

Marks: English Home Language 72, Mathematics 65, Accounting 62, Business Studies 55, Geography 52, isiZulu First Additional Language 58, Life Orientation 85.
Levels 6, 5, 5, 4, 4, 4. **APS 28.**

| ID | Course | Expected fit | Expected label | Why |
|---|---|---|---|---|
| M-01a | UJ BCom in Accounting | MATCH | Possible | 28 vs 28, margin 0 |
| M-01b | UJ BEd Foundation Phase | MATCH | Possible | 28 vs 28, margin 0 |
| M-01c | UJ BSc Computer Science | NO_MATCH | Unlikely | APS 2 short and Maths 1 level short: two gaps |
| M-01d | UJ LLB | NO_MATCH | Unlikely | APS 3 short (needs 31) |
| M-01e | TUT Dip (Computer Science) | MATCH | Possible | 28 vs 26, margin 2, closed |

## M-02: near-miss on APS

Marks: English Home Language 75, Mathematics 72, Physical Sciences 65, Life Sciences 62, Geography 55, History 45, Life Orientation 70.
Levels 6, 6, 5, 5, 4, 3. **APS 29.**

| ID | Course | Expected fit | Expected label | Why |
|---|---|---|---|---|
| M-02a | UJ BSc Computer Science | NEAR_MISS | Unlikely | Needs 30, 1 APS point short; suggestion says "1 more APS point" |
| M-02b | UP BSc Computer Science | NEAR_MISS | Unlikely | Same gap, closed |
| M-02c | UJ BCom in Accounting | MATCH | Possible | Margin 1 |
| M-02d | TUT Dip (Computer Systems Engineering) | MATCH | Likely | 29 vs 26, margin 3, closed |

## M-03: near-miss on a subject, and a subject not taken

Marks: English Home Language 85, Mathematics 65, Physical Sciences 85, Life Sciences 82, Accounting 80, Geography 75, Life Orientation 60.
Levels 7, 5, 7, 7, 7, 6. **APS 39.**

| ID | Course | Expected fit | Expected label | Why |
|---|---|---|---|---|
| M-03a | UJ BSc Computer Science | NEAR_MISS | Unlikely | Needs Maths Level 6 (70%); has Level 5 (65%) |
| M-03b | UP BEng Mechanical Engineering | NEAR_MISS | Unlikely | Same Maths gap, closed |
| M-03c | UJ BCom in Accounting | MATCH | Likely | Margin 11 |
| M-03d | UJ LLB | NO_MATCH | Unlikely | No additional language taken, so not a near-miss |

## M-04: Mathematical Literacy

Marks: English Home Language 78, Mathematical Literacy 85, Life Sciences 72, Geography 70, Business Studies 66, isiZulu First Additional Language 74, Life Orientation 80.
Levels 6, 7, 6, 6, 5, 6. **APS 36.**

| ID | Course | Expected fit | Expected label | Why |
|---|---|---|---|---|
| M-04a | UJ BCom in Accounting | NO_MATCH | Unlikely | Maths Literacy not accepted, even with APS 36 |
| M-04b | UJ LLB | MATCH | Likely | Needs APS 32 with Maths Literacy; margin 4 |
| M-04c | UP LLB | MATCH | Possible | 36 vs 35, margin 1; no Maths requirement, closed |
| M-04d | TUT Dip (Computer Science) | MATCH | Likely | Maths Literacy level 7 allowed with APS 28; margin 8, closed |
| M-04e | TUT Dip (Computer Systems Engineering) | NO_MATCH | Unlikely | No Maths Literacy route |

## M-05: Life Orientation and APS that differs per institution

Marks: English Home Language 72, Mathematics 65, Physical Sciences 62, Life Sciences 60, Geography 55, Accounting 20, Life Orientation 90.
Levels 6, 5, 5, 5, 4, 1. **UJ and UP APS 26. TUT APS 25** (TUT drops the level 1 subject).

| ID | Course | Expected fit | Expected label | Why |
|---|---|---|---|---|
| M-05a | UJ BCom in Accounting | NEAR_MISS | Unlikely | Needs 28, 2 APS points short |
| M-05b | TUT Dip (Computer Science) | NEAR_MISS | Unlikely | Needs 26, 1 APS point short, closed |
| M-05c | UJ BSc Computer Science | NO_MATCH | Unlikely | 4 APS points short, beyond the tolerance of 2 |

Also checks that Life Orientation at 90% adds nothing in any row, and that the same marks give a different APS at UJ and TUT.