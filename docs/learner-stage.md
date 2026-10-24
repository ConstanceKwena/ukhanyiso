# Learner stage option

Added 24 October 2026, inside the hackathon window.

The marks page asks "Where are you now?":

- **I'm in Grade 12 now:** the learner enters Grade 11 (or prelim) marks. The results page shows a "Provisional results" banner.
- **I've finished matric:** the learner enters final marks. No banner.

How it works:

- `static/js/stage.js` adds the question to `index.html` and the banner to `results.html`.
- The choice is kept in `sessionStorage` only, so it disappears when the tab closes. It is never sent to the server, and the matching engine and API are unchanged.
- The page tells learners never to enter an exam number or ID number. Ukhanyiso does not look up results by exam number: there is no public service for it, and we do not collect identifying numbers.
- Which marks an institution accepts differs, so the banner tells learners to check each institution's own rules.
