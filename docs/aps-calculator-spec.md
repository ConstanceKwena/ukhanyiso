# APS calculator specification (Iteration 1)

## Purpose

Convert matric subject percentages into NSC levels and calculate the draft APS
used by course matching. APS is a screening aid, not an admission prediction.
The best-six method is not yet confirmed for UJ, UP, or TUT; results using it
must carry the caveat defined in [matching rules](matching-rules.md#3-step-2-aps-per-institution).

## Input contract

Each mark contains a non-blank subject ID, an integer percentage from 0 to 100
inclusive, and a `countsInAps` flag. The API validates learner-submitted marks
before calculation (including duplicate and incompatible subjects). The
calculator does not infer subject rules from IDs: callers must set
`countsInAps=false` for Life Orientation and any other subject excluded by the
institution.

The institution supplies an APS method and whether Level 1 subjects are
excluded. A `CUSTOM` method is currently unsupported and must not be treated
as a calculated APS.

## Percentage-to-level conversion

Use these inclusive ranges:

| Percentage | NSC level |
|---|---:|
| 80–100 | 7 |
| 70–79 | 6 |
| 60–69 | 5 |
| 50–59 | 4 |
| 40–49 | 3 |
| 30–39 | 2 |
| 0–29 | 1 |

## Supported calculations

1. Filter out marks where `countsInAps` is false.
2. If the institution excludes Level 1, filter out marks whose converted
   level is 1.
3. For `BEST6_EXCL_LO`, add the six highest remaining levels, or all remaining
   levels if fewer than six are available.
4. For `ALL_EXCL_LO`, add every remaining level.
5. Return the sum with `supported=true`. An empty eligible set has APS 0.

`BEST6_EXCL_LO` and `ALL_EXCL_LO` rely on the caller's `countsInAps` selection
to exclude Life Orientation; they do not separately identify it by name.
`CUSTOM` returns APS 0, `supported=false`, and an explanatory message.

## Invalid input and guarantees

- A null method or marks list is rejected with `NullPointerException`.
- A null subject ID, blank subject ID, or percentage outside 0–100 is rejected
  with `NullPointerException` or `IllegalArgumentException` when constructing
  a subject mark.
- The calculator is deterministic and does not mutate the supplied list.
- The calculator does not validate course requirements or determine admission.

## Test harness

The contract is exercised by
[`ApsCalculatorTest`](../src/test/java/com/ukhanyiso/matching/ApsCalculatorTest.java).
Run it with:

```bash
mvn -Dtest=ApsCalculatorTest test
```

The test suite covers each level boundary, percentage validation, both
calculation methods, best-six truncation, non-counting subjects, optional
Level 1 exclusion, unsupported custom methods, and null arguments.
