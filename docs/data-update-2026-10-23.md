# Data update, Friday 23 October 2026 (Nana)

Checked today against web sources. "Official page opened" means we read the institution or government page itself; news and listing sites are labelled as such.

## 1. What was checked today

| Item | Result | Source type | Status in `bursaries.json` |
|---|---|---|---|
| Astron Energy bursary 2027 closing date | Closes **Mon 26 Oct 2026, 12:00 midday**. Four listing sites agree. Administered by Excel@Uni through an online portal. | Listing sites only. No official Astron Energy page found. | `partial` (was `unverified`), link left empty |
| Astron Energy fields of study | Sites disagree: one lists only data analytics and chemical engineering, our entry lists a wider set. | Listing sites | Note added: check the portal |
| NSFAS 2027 closing date | **31 Oct 2026.** Reported after the Minister confirmed the window stays open until 31 Oct and NSFAS said there is no extension. An earlier launch report gave 18 Nov. | News (Engineering News 22 Sep, TimesLIVE 5 Oct). myNSFAS portal not opened. | `partial` (was `conflicting`) |
| NSFAS and TVET colleges | 2027 admission applications at public TVET colleges closed on **30 Sep 2026**. | SAnews (government news agency) | Note added to NSFAS entry |

Sources used:
- https://www.studentroom.co.za/?p=71726 (Astron closing date and administrator)
- https://www.setacareers.co.za/?p=7290 (Astron portal, age limit)
- https://engineeringnews.co.za/article/nsfas-records-over-51-000-early-applications-for-2027-stresses-strict-deadline-for-submissions-2026-09-22
- https://www.timeslive.co.za/news/south-africa/2026-10-05-nsfas-applications-for-2027-close-on-october-31/
- https://www.sanews.gov.za/node/84420

## 2. Still unverified (do these next, in this order)

1. **Astron Energy official page.** Ask the Excel@Uni support contact listed on the portal, or find the link from Astron Energy's own site. Until then, show no link. The bursary closes Monday at noon, so it is the most time-sensitive row.
2. **NSFAS official page.** Open nsfas.org.za and confirm 31 Oct, then set status to `verified`.
3. **ISFAP (B003), JDK Benefit Trust (B004), Funza Lushaka (B005).** Dates and fields are still unverified or partial in our file.
4. **UJ and UP APS method** (source rows S002 and S004). The best-six rule is only confirmed by guide sites. Keep the caveat in results until an official page is found.
5. **UJ closing date for BSc Computer Science and LLB** (rows S011 and S013, status `partial`).

## 3. Wording fix: "TVET"

The catalogue has universities (UJ, UP) and a university of technology (TUT). It has **no TVET college courses**, so the README and deck should not say "TVET courses".

Replace in README.md:

> Ukhanyiso guides a learner from matric marks to campus. It shows the university and TVET courses a learner qualifies for, plus the funding and documents they need to apply.

with:

> Ukhanyiso guides a learner from matric marks to campus. It shows the university and university-of-technology courses a learner qualifies for, plus the funding and documents they need to apply. TVET college courses are on the roadmap.

Also keep the same wording in the pitch deck, the video script and the Lean Business Canvas.

## 4. Data provenance statement (paste into README, SSDLC write-up and deck)

> **Where our data comes from.** Course requirements and closing dates are taken from official institution pages (UJ, UP, TUT). Each course records its APS, subjects, closing date, official link, the date it was checked and a verification status (verified, partial, unverified, conflicting). Bursary details come from the funders' own pages where we could find them, and from reputable news reports or listing sites where we could not; those entries are marked partial or unverified and show no official link rather than an unconfirmed one. We use no learner data: marks are processed in memory and the demo account is fictional. Closing dates change, so the app always tells learners to confirm with the institution or funder before applying.

## 5. How to apply the bursary patch

1. Copy `bursaries.json` over `src/main/resources/bursaries.json` on the new branch.
2. Run `mvn -Dtest=BursaryDataTest,BursaryApiTest test`. The patched file keeps five bursaries, only allowed status words and no non-https links, which is what those tests check.
3. Commit as `data: verify Astron and NSFAS closing dates (23 Oct)` and open a pull request for a teammate to review.
