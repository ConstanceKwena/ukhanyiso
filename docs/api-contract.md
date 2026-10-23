# API contract: POST /api/match (iteration 2)

## Bursary endpoint

After deployment, the read-only bursary list is available at `GET https://ukhanyiso.onrender.com/api/bursaries`.
The endpoint returns five synthetic/public-source records and deadline labels. A `POST` to this path is rejected with `405 Method Not Allowed`.

The hosted app is at https://ukhanyiso.onrender.com. Use that base URL for hosted smoke tests.

The front end currently calls this endpoint directly from `static/index.html` and stores the real response in session storage for `static/results.html`. There are no demo course or bursary results in use.
The percentage-to-level and institution APS calculation rules are specified in
[aps-calculator-spec.md](aps-calculator-spec.md).

## Request

`POST /api/match`  `Content-Type: application/json`  Optional query: `?includeAll=true`

```json
{ "marks": [
    { "subject": "English Home Language", "mark": 72 },
    { "subject": "Mathematics", "mark": "74" },
    { "subject": "Life Orientation", "mark": 80 } ] }
```

- `subject` must be exactly one of the names in `SUBJECTS` in `validate.js`.
- `mark` is a whole number 0 to 100, as a JSON number or a string of digits (the form's input gives text, so `row.mark` can be sent as it is).
- No other fields are allowed (extra fields give 400). Maximum 12 subjects and 4 KB.
- Life Orientation is accepted but never counts towards APS.
- `includeAll=true` also returns courses that do not fit (`NO_MATCH`) and courses we cannot check (`CANNOT_CHECK`). Default: only `MATCH` and `NEAR_MISS`.

## Response 200

```json
{ "results": [
    { "courseId": "UJ-BCOM-ACC", "course": "BCom in Accounting",
      "institutionId": "UJ", "institution": "University of Johannesburg", "qualification": "bachelor",
      "fit": "MATCH", "deadline": "CLOSING_SOON", "label": "LIKELY",
      "requiredAps": 28, "yourAps": 33, "apsMargin": 5, "gapSize": null,
      "closingDate": "2026-10-31", "closingTime": null,
      "officialLink": "https://www.uj.ac.za/university-courses/bcom-in-accounting/", "sourceChecked": "2026-10-16",
      "suggestions": [], "reasons": [],
      "caveats": ["How University of Johannesburg adds up your APS is not yet confirmed from an official page.",
                  "The closing time is not published. Apply early."] },
    { "courseId": "UP-BCOM-ACCSCI", "course": "BCom in Accounting Sciences", "institution": "University of Pretoria",
      "fit": "NEAR_MISS", "deadline": "CLOSED", "label": "UNLIKELY", "requiredAps": 34, "yourAps": 33, "apsMargin": -1, "gapSize": 1,
      "suggestions": ["Your APS is 33 and this course needs 34. You are 1 point short. Moving one subject up one level adds one point."],
      "...": "other fields as above" } ],
  "disclaimer": "Labels are a guide only. Meeting the minimum does not guarantee a place. Always confirm with the institution before applying." }
```

Results are already ranked (rules doc section 7). Show them in the order received.

| Field | Values / meaning |
|---|---|
| `fit` | `MATCH`, `NEAR_MISS`, `NO_MATCH`, `CANNOT_CHECK` |
| `deadline` | `OPEN`, `CLOSING_SOON` (within 14 days), `CLOSED`, `UNKNOWN`. Independent of `fit`: a closed course can still be a MATCH. Show "closed" clearly. |
| `label` | `LIKELY`, `POSSIBLE`, `UNLIKELY`, or `null` when `fit` is `CANNOT_CHECK` |
| `requiredAps` / `yourAps` | `yourAps` is worked out with that institution's method. `null` when the course cannot be checked |
| `suggestions` | `NEAR_MISS` only: plain-words steps that close the gap. Show them under the course |
| `reasons` | `NO_MATCH` only: why the course does not fit |
| `caveats` | Always show them. They are things the learner should double-check |
| `officialLink`, `sourceChecked` | Show "Source: official page, checked <date>" with a link |

## Errors (all JSON, never a stack trace, never the learner's own text)

| Status | Body | When |
|---|---|---|
| 400 | `{"errors":["Marks must be between 0 and 100."]}` | invalid marks. The sentences are the ones in `validate.js` plus "Please add at least one subject." and "Please add no more than 12 subjects." |
| 400 | `{"errors":["We could not read that request. Please check your marks and try again."]}` | broken JSON, extra fields, bad `includeAll` |
| 413 | `{"errors":["That request is too large."]}` | body over 4 KB |
| 429 | `{"errors":["Too many attempts. Please wait a minute and try again."]}` | more than 10 `POST /api/match` requests from the same client address in the 60 seconds starting with its first request |
| 500 | `{"errors":["Something went wrong. Please try again."]}` | anything unexpected |

## For the front end

1. `index.html` sends `rows` as `{ marks: rows }` with `fetch("/api/match", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ marks: rows }) })`, keeps the client checks, and displays API validation errors.
2. The canonical labels are `LIKELY`, `POSSIBLE`, and `UNLIKELY`, as defined in `matching-rules.md` and returned by the API. The page displays them as "Likely", "Possible", and "Unlikely". Confirm the wording with Nana before treating the rules as team-approved.
3. Use `textContent` (as `results.html` already does) for every string from the API.
4. Rate limiting applies to `POST /api/match` by the servlet's remote client address. The first 10 requests are allowed; further requests receive HTTP 429 until 60 seconds after the first request. The counter is in-memory and per application instance. Do not trust caller-supplied forwarded-IP headers as identity. Behind a reverse proxy, configure trusted proxy address handling; for multiple app instances, use a shared rate limiter.
