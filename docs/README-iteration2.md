# Iteration 2 (Backend Lead)

## Done

- [x] **Matching and near-miss suggestions**: `Matcher`, `ResultRanker`, `CourseMatchService` in `com.ukhanyiso.matching`. Implements sections 4 to 7 and 9 of `docs/matching-rules.md`.
- [x] **Integrate modules with the database**: `CatalogRepository` (JdbcTemplate) reads courses, requirements, institutions, subjects, config and sources from H2. `schema.sql`, `data.sql` and `application.properties` fixed for H2.
- [x] **API**: `POST /api/match` with server-side validation (`MarksValidator`), safe errors, a request-size filter. Contract in `api-contract.md`.
- [x] **Review**: `pr-review.md` (5 high, 6 medium findings).

## What I checked and what I could not

Checked here (Java 21, no Maven, no Spring jars available):
- All new main code compiles (against small stand-ins for the Spring classes).
- 52 unit tests pass: `MatcherTest`, `ResultRankerTest`, `MarksValidatorTest`, `SubjectCatalogTest`. I broke the matcher on purpose four ways (APS tolerance, two gaps, `aps_required`, closing time) and each time a test failed.
- The engine run on the real seed data for two sample learners gives sensible, ranked answers.
- The schema and data load and give the expected counts (17 sources, 3 institutions, 12 courses, 51 requirements) in SQLite.

**Not checked: anything that needs Spring or H2.** `CatalogRepository`, the controller, the exception handler, the filter and the three Spring tests (`CatalogRepositoryTest` 3, `SourceAuditTest` 6, `MatchApiTest` 10) have never run. `schema.sql` has not been loaded into real H2. The first `mvn clean test` is the real check. If something fails, send me the message.

## Where everything goes

Copy the `src` and `docs` folders from the zip into the project root, next to `pom.xml`. Say yes to merge and replace.

| Folder | What goes there |
|---|---|
| `src/main/java/com/ukhanyiso/matching/` | `Matcher`, `ResultRanker`, `CourseMatchService`, `CourseResult` and the three enums |
| `src/main/java/com/ukhanyiso/matching/catalog/` | records, `SubjectCatalog`, `CatalogRepository` |
| `src/main/java/com/ukhanyiso/matching/api/` | controller, validator, error handler, size filter, config |
| `src/main/resources/` | `schema.sql`, `data.sql`, `application.properties`, `source_sheet.csv` |
| `src/test/java/com/ukhanyiso/matching/` (and `api/`, `catalog/`) | the new tests |
| `docs/` | all documents (rules, API contract, review, validation test cases, notes) |

Then remove the old folders and stale files, and run the tests:

```bash
git checkout work-branch && git pull origin work-branch
# (copy src/ and docs/ in now)
git rm -r --ignore-unmatch iteration-0 iteration-1 src/Matching
mvn clean test
git add -A && git status        # check only the expected files are listed
git commit -m "Iteration 2: matching engine, near-miss suggestions, database integration, API; docs in one folder"
git push origin work-branch
```

`iteration-0` and `iteration-1` only held documents, and their content is now in `docs/` (`matching-rules.md`, `test-cases-validation.md`, `README-iteration0.md`). `src/Matching` is the stale duplicate copy (review H3).

## Open decisions

1. **Security checklist sign-off**: verify current GitHub secret-scanning and Dependabot alert settings.
2. Still unconfirmed data (unchanged): UJ closing time, and how many subjects count towards APS at each institution. Results carry caveats for these.

The Iteration 1 S-02 rate limit is now set to 10 `POST /api/match` requests per client address in 60 seconds; excess requests receive HTTP 429. The limit and response are covered by `MatchApiTest`.

The unused `/api/matching/process` persistence endpoint and its obsolete security test class were removed on 2026-10-21. The live `/api/match` tests now assert that the old write endpoint is unavailable.
The UI and fake-data labels now use the same Likely / Possible / Unlikely wording as the matching rules and API.

Update 2026-10-21: `mvn clean test` passes (78 tests), including the Spring and H2 tests. The "Not checked" section above is out of date.
