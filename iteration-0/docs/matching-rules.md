# Iteration 0: matching rules and near-miss rule

Status: ready for team review. Course data in `data/source_sheet.csv` and `data/seed.sql` comes from official institution pages checked on 2026-10-16. Anything still marked CONFIRM must be checked on the official source before it is shown to learners.

## 1. Inputs and outputs

Input (per learner): a mark in % for each matric subject, plus subject names.
Output (per course): one **fit status** and one **deadline status**, kept separate.

Fit status: `MATCH`, `NEAR_MISS`, `NO_MATCH`, `CANNOT_CHECK`
Deadline status: `OPEN`, `CLOSING_SOON`, `CLOSED`, `UNKNOWN`

## 2. Step 1: marks to levels

Convert each % to the national NSC level:

| % | Level |
|---|---|
| 80-100 | 7 |
| 70-79 | 6 |
| 60-69 | 5 |
| 50-59 | 4 |
| 40-49 | 3 |
| 30-39 | 2 |
| 0-29 | 1 |

All comparisons use levels, not raw %, because prospectuses publish levels.

## 3. Step 2: APS per institution

APS depends on the institution (`institutions.aps_method`), so calculate it once per institution, never once per learner.

- `BEST6_EXCL_LO`: sum the levels of the best 6 subjects, leaving out Life Orientation. Used for UJ, UP and TUT in iteration 0.
- `ALL_EXCL_LO`: sum all subjects except Life Orientation.
- `CUSTOM`: weighted or faculty-specific schemes. Not supported in iteration 0; courses at such institutions return `CANNOT_CHECK`.

What the official sources confirm so far: UP excludes Life Orientation; TUT excludes Life Orientation and any subject at level 1. That the best six subjects are used is only reported by guide websites, so each institution has `aps_method_verified = 0`. Until that flag is 1, every result for that institution carries the caveat "APS method not yet confirmed".

## 4. Step 3: hard rules for a MATCH

A course is a `MATCH` only if ALL of these hold:

1. **Data complete**: `min_aps` is not NULL and every requirement has a source with status `verified`. If not, return `CANNOT_CHECK`, never a guess.
2. **APS**: learner's APS for that institution >= the APS needed. This is `courses.min_aps`, unless the learner satisfies a requirement that has its own `aps_required`, in which case that value is used (UJ LLB: 31 with Maths, 32 with Maths Literacy; TUT diplomas: 26 with Maths or Technical Maths, 28 with Maths Literacy). If the learner satisfies more than one alternative, use the one with the lowest `aps_required`.
3. **Subjects**: every requirement group is satisfied. Inside a group any one subject passing is enough (OR). Across groups all must pass (AND).
4. **Levels or percentages**: compare levels. Where a requirement has `min_percent` instead (for example UP's 5-year BEng needs 65%), compare the learner's raw % to it.
5. **Subject identity is strict**: Mathematical Literacy and Technical Mathematics never satisfy a Mathematics requirement unless the course lists them in the same group. Languages: Home Language and First Additional Language are different subject ids.
6. **Pathway (optional in iteration 0)**: learner meets the minimum NSC pass type for the qualification (bachelor / diploma / higher certificate). CONFIRM the exact thresholds from the DHET policy before coding; do not use remembered numbers.

Meeting the minimum is not a guarantee. Most institutions select competitively, so the wording shown to learners is "you meet the minimum requirements", never "you will get in".

## 5. Near-miss rule

A course is a `NEAR_MISS` when it is not a `MATCH` but the learner is close, with exactly one small gap:

- **APS gap**: all subject requirements pass, and APS is short by 1 to `aps_tolerance` points (default 2), OR
- **Subject gap**: APS passes, all subject requirements pass except ONE subject that is exactly 1 level below the requirement (`level_tolerance`, default 1).

Not a near-miss (return `NO_MATCH`):

- Two or more gaps of any kind (for example short on APS and short on Maths).
- A required subject the learner did not take at all.
- A subject gap of 2 or more levels.
- APS short by more than the tolerance.
- Incomplete or unverified course data (that is `CANNOT_CHECK`).

Every near-miss must tell the learner exactly what closes the gap, in plain words, for example: "You need 1 more APS point" or "You need Level 5 in Mathematics (60%); you have Level 4 (55%)". A near-miss with no concrete next step should not be shown.

Near-miss rows are always listed below matches and are labelled as not yet eligible.

## 5b. Which results to use

UP ranks applicants on final Grade 11 results while the learner is still in Grade 12, and on final NSC results afterwards. Other institutions may differ. The tool asks the learner which results they are entering and shows this note beside UP courses.

## 6. Deadline status (independent of fit)

Compare `closing_date` + `closing_time` to now:

- `CLOSED`: already passed. Still show the course, but say when applications are expected to reopen only if the source says so. On 2026-10-16 all four UP courses and all four TUT courses in the sheet are CLOSED for 2027; only the four UJ courses are open (UJ closes 31 Oct 2026).
- `CLOSING_SOON`: within `closing_soon_days` (default 14).
- `OPEN`: later than that.
- `UNKNOWN`: no closing date on file. Never display "open".

A `MATCH` that is `CLOSED` is shown as "you qualify, but the 2027 window has closed", not hidden.

## 7. Sort order

1. MATCH + CLOSING_SOON, soonest first
2. MATCH + OPEN
3. NEAR_MISS (smallest gap first)
4. MATCH + CLOSED
5. Everything else on request only

## 8. Test cases to write before any code

1. Exactly at the APS cut-off: MATCH.
2. 1 APS point under: NEAR_MISS. 3 points under: NO_MATCH.
3. APS fine, Maths one level short: NEAR_MISS. Two levels short: NO_MATCH.
4. APS 1 short AND Maths 1 level short: NO_MATCH (two gaps).
5. Learner took Maths Literacy, course needs Maths: NO_MATCH, not near-miss.
6. Course accepts Maths OR Maths Literacy (OR-group): MATCH with either.
7. Life Orientation at 90%: adds nothing to APS.
8. Course with `min_aps` NULL: CANNOT_CHECK.
   8b. UJ LLB with Maths Literacy at level 4 and APS 31: NO_MATCH or NEAR_MISS (needs 32), not MATCH. With Maths level 3 and APS 31: MATCH.
   8c. TUT Dip IT with Maths Literacy level 7 and APS 27: NEAR_MISS (needs 28). With Technical Maths level 5 and APS 26: MATCH.
9. Closing date yesterday: CLOSED. 14 days away: CLOSING_SOON. No date: UNKNOWN.
10. Closing at 12:00 on the day, current time 14:00 that day: CLOSED.

## 9. Likelihood labels

A label is a short, plain-language summary shown next to each course. It is calculated from the fit status (section 5) and how far the learner is above the cut-off. It says how the learner's results compare with the **published minimum**. It is not a prediction of admission, because most institutions select competitively and the published minimum is only the entry point.

Three labels: **Likely**, **Possible**, **Unlikely**.

Definitions:

- `aps_margin` = learner's APS minus the APS needed for the alternative the learner satisfies (the `aps_required` rule in section 4 applies).
- `likely_aps_margin` = 3 by default (stored in `match_config`, so the team can change it without touching code).

| Fit status | Condition | Label |
|---|---|---|
| MATCH | `aps_margin` >= `likely_aps_margin` | **Likely** |
| MATCH | `aps_margin` from 0 up to `likely_aps_margin` - 1 | **Possible** |
| NEAR_MISS | any | **Unlikely** (show what closes the gap) |
| NO_MATCH | any | **Unlikely** |
| CANNOT_CHECK | any | no label; show "not enough data to check this course" |

Rules around the label:

1. **Meeting the minimum is not a promise.** Wording for Likely is "You are comfortably above the minimum", never "you will get in". Wording for Possible is "You meet the minimum, but it is close".
2. **Near-misses stay useful.** A near-miss is labelled Unlikely, but the card must also say what would change it, for example "1 more APS point would move this to Possible".
3. **The label ignores the deadline.** A Likely course that has CLOSED is still labelled Likely but shows the closed status next to it. Never show a closed course as something the learner can still apply for.
4. **Caveats travel with the label.** If `aps_method_verified = 0` for the institution, show "APS method not yet confirmed" beside the label. Labels are not hidden because of it.
5. **No label upgrades.** Data quality can only lower confidence. Never move a course up a label because a source is missing.
6. **Subjects have no margin in iteration 0.** Only APS margin decides Likely versus Possible. A course where a required subject is exactly at the minimum can still be Likely if APS is comfortable. The team may want to tighten this later.

Known limits (for the team to decide):

- The margin of 3 points is a proposal, not a published figure. Check it against real cut-off history if the institutions publish it.
- Competitive courses (Law, Engineering, Accounting) often admit well above the minimum. A `competitive` flag on courses could cap their label at Possible. Not in iteration 0.

## 10. Test cases for labels

1. MATCH with APS exactly 3 above the cut-off: Likely.
2. MATCH with APS 2 above: Possible. With APS exactly at the cut-off: Possible.
3. NEAR_MISS (1 APS point short): Unlikely, with the "1 more APS point" message.
4. NO_MATCH: Unlikely.
5. Course with `min_aps` NULL: no label.
6. UJ LLB with Maths Literacy and APS 35: margin is 3 against the 32 needed, so Likely. With Maths and APS 35: margin is 4 against 31, so Likely.
7. MATCH, margin 4, course CLOSED: Likely, with the closed status shown.
8. Institution with `aps_method_verified = 0`: label shown with the caveat.