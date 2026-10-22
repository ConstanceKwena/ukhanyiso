# User testing kit: Sunday 25 October, 3 to 5 recent matriculants

## Goal
Find out if a learner who has just seen their matric results can (1) enter marks, (2) understand the labels, (3) understand a near-miss suggestion and a "closed" course, and (4) find funding. We test the app, not the learner.

## Who
3 to 5 people who finished matric in 2025 or earlier (mostly adults). If anyone is under 18, get a parent or guardian's OK first. No names are recorded: use T1 to T5.

## Before Sunday
- [ ] Decide how the app runs: hosted URL (if ready) or on a laptop. On a laptop run `mvn spring-boot:run` and open http://localhost:8080. (The README says `./mvnw`, but there is no `mvnw` in the repo.)
- [ ] Testers on their own phones can use `http://<laptop-ip>:8080` if everyone is on the same Wi-Fi.
- [ ] Run one full test yourself with the fictional marks from `docs/test-cases-matching.md` (M-01).
- [ ] The match endpoint allows 10 requests per minute per address. Test one person at a time. If testers share one Wi-Fi from a hosted app, this limit is shared (finding F-01 in `docs/security-findings.md`).
- [ ] Print or open this page, a notes sheet, and a timer.

## Say this first (30 seconds)
"We're testing an app that shows which courses you could apply for from your matric marks. It is a prototype with 12 courses at UJ, UP and TUT. There are no wrong answers: if something is confusing, that's our fault. The app does not save your marks, and I won't write down your name or your marks. You can use your own marks or made-up ones, and you can stop any time. Is that OK?"

## Tasks (read aloud, one at a time; don't help unless they are stuck for a minute)
1. "You've just got your results. Find out which courses you could apply for."
2. "Pick one course. What do the label and the numbers tell you?"
3. "One course says you're close. What would you do about it?"
4. "Is any course closed for applications? How can you tell?"
5. "Find a bursary you could apply for and what you'd need to apply."

## Notes sheet (one row per tester per task)
| Tester | Task | Done? (yes / with help / no) | Seconds | Where they hesitated | Short quote (no personal details) |
|---|---|---|---|---|---|

## Questions at the end
1. In your own words, what does this app do?
2. Would you use it? When?
3. What word or number confused you?
4. What was missing?
5. 0 to 10: how likely are you to tell a friend?
6. Did anything feel unsafe or like we asked for too much?

## Targets (proposed, change if you disagree)
- At least 4 of 5 finish task 1 without help.
- At least 4 of 5 explain the labels correctly in task 2.
- At least 4 of 5 understand a near-miss suggestion in task 3.
- Nobody is confused by "Applications closed" in task 4.

## Afterwards (within 30 minutes)
1. Fill in the tally: for each task, how many finished unaided.
2. Pick the three most common problems and write one fix for each.
3. For the deck, quote only real numbers, for example "4 of 5 found their courses without help". Do not round up or quote a number you did not record.

## Things testers will notice (tell them it is a prototype, do not hide it)
- Most UP and TUT courses show "Applications closed" because their 2027 dates have passed. UJ closes on 31 October.
- Some results say the APS method is not yet confirmed. That is on purpose.
