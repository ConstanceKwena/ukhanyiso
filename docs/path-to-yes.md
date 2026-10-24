# Path to yes: rules, wording and test cases

Draft by Nana (Data), 24 Oct 2026, for the team to agree. Companion script: `path_to_yes_reference.py` (run `python3 docs/path_to_yes_reference.py` from the project root; it must print ALL PASSED).

## 1. What it is

Today a near-miss tells the learner what is missing ("You are 1 point short"). Path to yes tells them the cheapest way to close the gap in marks they understand: "Raise Mathematics from 58% to 60% and you would meet the minimum for this course."

Pitch line: **we never just say no.** It is rule-based and explainable. It is not machine learning and must not be described as such.

## 2. When it applies

| Course result | Show path to yes? |
|---|---|
| NEAR_MISS and application open or closing soon | **Yes** |
| NEAR_MISS but application closed | No (nothing the learner can act on) |
| MATCH | No (already meets the minimum) |
| NO_MATCH | No (the gap is too big to call a path) |
| CANNOT_CHECK | No |

## 3. Definitions

| Level | Lowest mark |
|---|---|
| 7 | 80% |
| 6 | 70% |
| 5 | 60% |
| 4 | 50% |
| 3 | 40% |
| 2 | 30% |

- A **lift** raises one subject to the lowest mark of a higher level (for example 58% to 60%). Targets are always these thresholds, never an arbitrary number.
- The **cost** of a lift is the percentage points added (58 to 60 costs 2).

## 4. Rules

1. **Only subjects that count towards APS.** Never Life Orientation. Respect the institution's rule about level-1 subjects.
2. **A lift must really work.** Re-run the real APS calculation and the real course rules with the changed mark. The course must become a MATCH. This automatically rejects useless lifts, such as raising a seventh subject that sits outside the best six and adds no points (case P-04).
3. **Try single-subject lifts first** (one or more levels), then **pairs of different subjects**. Drop a pair if one of its lifts alone already works.
4. **Rank by total percentage points added**, smallest first. Ties: fewer subjects first, then alphabetical by subject name.
5. **Show at most two options.** The second option must use different subjects from the first. If no such option exists, show only one.
6. **Limit: total cost of 15 points or less.** If nothing fits, show no path and use the "large improvement" wording below. (Proposed number; the team can change it.)
7. **Never suggest switching subject** (for example from Mathematical Literacy to Mathematics). Marks cannot be moved between subjects.
8. **Carry over every existing caveat** on the course (unconfirmed APS method, course details still being checked).

## 5. Wording

Use plain language. Say "meets the minimum", never "you will get in".

- One subject: `Raise {Subject} from {from}% to {to}% (+{points}) and you would meet the minimum for this course.`
- Two subjects: `Raise {Subject A} from {a}% to {b}% (+{n}) and {Subject B} from {c}% to {d}% (+{m}) and you would meet the minimum for this course.`
- Nothing within the limit: `This course needs a large improvement across several subjects. Talk to your teacher about whether that is realistic.`
- Always add underneath: `Final matric marks only change through supplementary exams or remarking. If you are still writing, this shows where to focus. Meeting the minimum does not guarantee admission.`

## 6. Proposed API addition (for Nhlanhla to confirm)

Add one optional field to each course result. It is present only for near-misses that pass the rules above, otherwise an empty list.

```json
"pathToYes": [
  {
    "changes": [ { "subject": "Mathematics", "fromPercent": 58, "toPercent": 60 } ],
    "totalPoints": 2
  }
]
```

Update `docs/api-contract.md` in the same pull request. The front end must show subject names with text only (no `innerHTML`).

## 7. Hand-calculated test cases

Checked against the real catalogue in `data.sql`, with the date fixed at 21 Oct 2026 (UJ open and closing soon, UP and TUT closed). Marks are percentages. Life Orientation (LO) never counts. "APS" is the learner's APS for that institution.

| Case | Course | Learner marks | Fit | Expected path to yes |
|---|---|---|---|---|
| P-01 | UJ BCom Accounting (needs 28) | English HL 62, Accounting 66, Economics 61, Maths 58, Geography 52, Business Studies 55, LO 79. APS 27 | NEAR_MISS | Option 1: Maths 58 to 60 (+2). Option 2: Accounting 66 to 70 (+4). LO is never suggested although 79 to 80 would be only +1. |
| P-02 | UJ BCom Accounting (needs 28) | English HL 61, Accounting 63, Maths 57, Business Studies 58, Geography 59, Economics 52, LO 70. APS 26 | NEAR_MISS | Option 1: Business Studies 58 to 60 and Geography 59 to 60 (+3 in total). Option 2: Accounting 63 to 70 and Maths 57 to 60 (+10 in total). |
| P-03 | UJ BSc Computer Science and Informatics (needs 30, Maths level 6) | English HL 75, Maths 65, Physical Sciences 72, Life Sciences 68, Geography 66, Accounting 71, LO 60. APS 33 | NEAR_MISS (subject gap) | One option only: Maths 65 to 70 (+5). |
| P-04 | UJ BCom Accounting (needs 28) | English HL 62, Accounting 64, Business Studies 61, Maths 56, Geography 58, Economics 52, History 49, LO 70. APS 27 | NEAR_MISS | Option 1: Geography 58 to 60 (+2). Option 2: Maths 56 to 60 (+4). History 49 to 50 (+1) is **not** suggested: it is a seventh subject and leaves APS at 27. |
| P-05 | UJ BCom Accounting (needs 28) | English HL 60, Accounting 61, Maths 50, Business Studies 51, Geography 52, Economics 51, LO 70. APS 26 | NEAR_MISS | No path: the cheapest working pair costs 17 points, above the limit of 15. Show the "large improvement" wording. |
| P-06 | UP BSc Computer Science (closed 30 June) | English HL 75, Maths 72, Physical Sciences 65, Life Sciences 62, Geography 55, History 45, LO 70. APS 29, needs 30 | NEAR_MISS but closed | No path (course is closed). |
| P-07a | UJ BCom Accounting | English HL 72, Maths 65, Accounting 62, Business Studies 55, Geography 52, isiZulu FAL 58, LO 85. APS 28 | MATCH | No path (already meets the minimum). |
| P-07b | UJ BSc Computer Science and Informatics | Same learner as P-07a. APS 28, needs 30 | NO_MATCH | No path (gap too big). |

### Java test format for Nhlanhla

Use the same style as `HandCalculatedCasesTest`. For every case, also re-run the matcher with the suggested marks and assert the result is MATCH.

## 8. How the rules were checked

The reference script reads the real course data, mirrors the Java matcher, and reproduces all 21 expectations already in `HandCalculatedCasesTest` with zero mismatches. Each suggestion in the table above was re-run through the matcher and became a MATCH.

## 9. Decisions the team needs to make

1. Is a total limit of 15 points right? (More generous means more suggestions; fewer means more honest.)
2. Should the second option be shown at all, or only the cheapest one?
3. Do we show path to yes only on the results page, or also on a printable summary?
4. Who builds it: backend rule (Nhlanhla), display (Thembani), review (Kwena).
