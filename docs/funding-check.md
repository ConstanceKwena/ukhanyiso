# Funding check: "Don't register on hope"

Draft by Nana (Data), 24 Oct 2026, approved in principle by Lorraine. Companion script: `funding_check_reference.py` (run `python3 docs/funding_check_reference.py`; it must print ALL PASSED).

## 1. The problem and the idea

A student finishes a first qualification and registers for a second, hoping a bursary will pay. They can afford the registration fee but not tuition, accommodation and books. If the bursary never comes (for example their average is below its minimum), they are left owing fees.

What can follow, from the sources we checked:

- Results can be withheld and registration for the next year blocked while fees are outstanding. Certificates are routinely withheld at South African universities.
- Debt collectors, not usually the university itself, are what report unpaid debts to credit bureaus. So the app says fees "can be handed to debt collectors, which can affect your credit record". It never says "you will be blacklisted".
- Deregistering does not always cancel the charge.
- NSFAS generally funds a first undergraduate qualification only, and a 2024 Supreme Court of Appeal ruling backed this. Postgraduate study is generally excluded too.

**The idea: hoping for a bursary does not pay fees.** The check separates money the student has from money they are hoping for, and tells them before they register.

## 2. What the student enters

All fields are checked on the server. Money is in whole rands. Nothing is stored; everything is worked out in memory, the same as marks.

| Field | Values | Notes |
|---|---|---|
| `highestCompleted` | NONE, HIGHER_CERT, DIPLOMA, BACHELOR, HONOURS, MASTERS | Required |
| `plannedLevel` | DIPLOMA, BACHELOR, HONOURS, MASTERS | Required |
| `plannedYear` | whole number 1 to 7 | Year of study they are entering. Required |
| `saCitizen` | true or false | Required |
| `publicInstitution` | true or false | Required |
| `studyingAtUnisa` | true or false | Optional. Only the UNISA bursary needs it. Ask it only when the student plans postgraduate study |
| `averagePercent` | whole number 0 to 100 | Optional. Latest academic average |
| `age` | whole number 14 to 80 | Optional |
| `field` | ENGINEERING, IT, COMMERCE_FINANCE, EDUCATION, HEALTH, LAW, SCIENCE, HUMANITIES, OTHER | Optional |
| `income` | UP_TO_350K, 350K_600K, ABOVE_600K, PREFER_NOT_TO_SAY | Optional. Household income per year |
| `yearlyCost` | whole rands 0 to 1,000,000 | Optional. Tuition, accommodation, books and other costs, **entered by the student** |
| `ownContribution` | whole rands 0 to 1,000,000 | Optional. What they or their family can pay |
| `confirmedFunding` | whole rands 0 to 1,000,000 | Optional. **Only money confirmed in writing** |

We do **not** ask for population group. Some bursaries have that requirement, so those show a "check the funder's page" item instead. Asking for it would collect more sensitive data than we need.

We hold no verified fee data, so the app never fills in a cost. It links to the institution's own fee page.

## 3. Bursary criteria

Only what our own bursary file or a checked source states. Anything else is a "to confirm" item. Add a `criteria` object to each entry using the key names in the reference script.

### Current five (B001 to B005)

| Bursary (status) | Checkable criteria | To confirm (not checked by the app) |
|---|---|---|
| **B001 Astron Energy** (partial) | SA citizen; age 34 or younger; average 70% or more; field in engineering, IT, commerce and finance | Which fields and study levels are accepted (sources disagree) |
| **B002 NSFAS** (partial) | Public institution only; SA citizen; household income up to R350,000; first qualification only (see section 4) | |
| **B003 ISFAP** (unverified) | Undergraduate level; entering year 1; household income up to R600,000 | Partner university and fields; whether someone who already holds a qualification can apply |
| **B004 JDK Benefit Trust** (partial) | SA citizen; age 17 to 21; entering year 3 or earlier | Population-group requirement; eligible fields and institutions |
| **B005 Funza Lushaka** (unverified) | Field is education | Priority teaching subjects; service obligation after graduating |

### Postgraduate (B006 to B011), researched 24 Oct 2026

Full detail and sources are in `postgrad-bursaries-2027.json` and `postgrad-research-2026-10-24.md`. **Four of the six are already closed for 2027**, so the app will mostly show them as CLOSED today.

| Bursary (status) | Checkable criteria | Closing | To confirm |
|---|---|---|---|
| **B006 DSI-NRF Postgraduate Scholarship** (partial) | Honours or master's; average 65% or more | Honours: 23 Nov 2026 (NRF); master's first-time: closed 3 July 2026 | Apply through your university, whose internal date is earlier. Age limits (28, 30, 32) apply at allocation, not at application. Citizenship or permanent residence and the financial means test |
| **B007 UNISA Postgraduate Bursary** (partial) | Honours or master's; registered at UNISA; honours average 60% or more | 30 Nov 2026 | NQF 7 qualification completed by 31 Jan 2027 (new honours applicants); citizenship for honours |
| **B008 IDC External Bursary** (partial) | SA citizen; age 26 or younger | **Closed 30 Sep 2026** | Unemployed with financial need; mainly first undergraduate qualifications; postgraduate only in selected honours fields |
| **B009 SANSA Postgraduate Bursary** (partial) | SA citizen; honours or master's; average 65% or more; science, engineering or IT | **Closed 30 Sep 2026** | Study must fit SANSA's space-related areas |
| **B010 Canon Collins RMTF** (verified) | Master's; law, education or humanities | **Closed 14 Aug 2026** | Eligible Southern African country; 2 years of social justice involvement; good honours degree |
| **B011 ISFAP postgraduate (honours via NRF)** (unverified) | Honours | **Closed 24 Aug 2026** (ISFAP assessment) | Check isfap.org.za for later calls |

Notes: the R350,000 NSFAS limit is from a secondary source, and citizenship for NSFAS, ISFAP and Funza Lushaka still needs confirming on the official pages (section 9).

## 4. Rules

**Each criterion** gives pass, fail or unknown. It is unknown when the student left the field blank (or chose PREFER_NOT_TO_SAY for income).

**NSFAS first-qualification rule:**

| Highest completed | Planned level | Result |
|---|---|---|
| NONE | any | pass |
| any | HONOURS or MASTERS | fail: "NSFAS generally does not fund postgraduate study." |
| DIPLOMA, BACHELOR, HONOURS or MASTERS | DIPLOMA or BACHELOR | fail: "NSFAS generally does not fund a second undergraduate qualification." |
| HIGHER_CERT | DIPLOMA or BACHELOR | not a fail; add "to confirm": whether NSFAS counts the move as progression |

**Result for each bursary:**

| State | When |
|---|---|
| **CLOSED** | The closing date and time have passed (no time published means end of the day) |
| **DOES_NOT_MEET** | At least one criterion fails **and** the bursary's data status is verified or partial. List every failed reason |
| **CANNOT_TELL** | At least one criterion fails **but** the bursary's data is unverified. Show the reason as "our unconfirmed information suggests" |
| **MIGHT_MEET** | No criterion fails, but something is unknown or there is a "to confirm" item. List those items |
| **MEETS** | Every criterion passes and nothing is left to confirm |

A failed check on unconfirmed data never produces a flat "no". That protects a student from missing a real chance because of our gaps.

**Money check** (only when `yearlyCost` is given):

`gap = yearlyCost - ownContribution - confirmedFunding` (missing money fields count as 0)

| Verdict | When |
|---|---|
| **READY** | `gap` is 0 or less |
| **WAIT** | `gap` is above 0 and at least one open bursary is MEETS or MIGHT_MEET |
| **HIGH_RISK** | `gap` is above 0 and no open bursary is MEETS or MIGHT_MEET |
| (none) | No cost entered: show "Add your estimated yearly costs to see whether you are covered." |

Hoped-for bursary money is never counted towards the gap. Only `confirmedFunding` is.

## 5. Wording

Plain language. "Meets the published minimum" never means "you will get it".

| State | Text |
|---|---|
| MEETS | Meets the published minimum. Bursaries are competitive, so this does not mean you will get it. |
| MIGHT_MEET | Might meet it. Confirm these first: {items} |
| DOES_NOT_MEET | Does not meet it: {reasons}. You would not be eligible, so applying is unlikely to help. |
| CANNOT_TELL | We can't tell yet. Our unconfirmed information suggests: {reason}. Check the funder's page before you decide. |
| CLOSED | Applications are closed. |

| Verdict | Text |
|---|---|
| READY | Your estimated costs are covered by your own money and funding you have confirmed in writing. |
| WAIT | Your costs are not fully covered yet. Funding you might get is not funding you have. Do not pay registration or accommodation deposits until funding is confirmed in writing. |
| HIGH_RISK | Your costs are not covered and we found no bursary you are likely to qualify for. Registering could leave you owing fees. Unpaid fees can lead to results being withheld, being blocked from registering, and accounts being handed to debt collectors, which can affect your credit record. Speak to the institution's financial aid office before you register. |

Always show underneath: "This is general information, not financial advice. Confirm with the institution's financial aid office. Be careful of anyone who asks you to pay to apply for a bursary."

## 6. Proposed API (for Nhlanhla to confirm)

`POST /api/funding/check` with the fields in section 2. Same protections as `/api/match`: request-size limit, rate limit (10 per minute per client), strict validation, unknown fields rejected, generic error messages.

```json
{
  "bursaries": [
    { "id": "B001", "name": "Astron Energy Bursary 2027", "state": "MIGHT_MEET",
      "reasons": [], "toConfirm": ["Which fields and study levels are accepted (sources disagree). Check the application portal."],
      "closingDate": "2026-10-26", "closingTime": "12:00", "officialLink": null, "dataStatus": "partial" }
  ],
  "money": { "gap": 60000, "verdict": "WAIT" }
}
```

`money` is `null` when no cost was entered. Update `docs/api-contract.md` in the same pull request. The page must show all text with text-only rendering (no `innerHTML`).

## 7. Hand-calculated test cases

Clock fixed at 24 Oct 2026, 09:00 (F-05 uses 26 Oct 13:00 and G-04 uses 24 Nov 09:00). DNM = DOES_NOT_MEET, MIGHT = MIGHT_MEET, CANT = CANNOT_TELL. Every case also shows B008 (IDC), B009 (SANSA), B010 (Canon Collins) and B011 (ISFAP postgraduate) as **CLOSED**, so those are not repeated below. The reference script checks all 11 bursaries for every case.

| Case | Student | Astron / NSFAS / ISFAP / JDK / Funza | NRF / UNISA | Money |
|---|---|---|---|---|
| F-01 | Has a bachelor, plans honours, average 62, age 24, IT, income up to R350k, public, **not at UNISA**. Cost R85,000, own R20,000, confirmed 0 | DNM / DNM / CANT / DNM / CANT | DNM / DNM | gap 65,000, **HIGH_RISK** |
| F-02 | Has a diploma, plans a bachelor, average 78, age 27, commerce and finance, income R350k to R600k, public. Cost R90,000, own R30,000, confirmed 0 | MIGHT / DNM / MIGHT / DNM / CANT | DNM / DNM | gap 60,000, **WAIT** |
| F-03 | Same as F-02 but confirmed funding R60,000 | MIGHT / DNM / MIGHT / DNM / CANT | DNM / DNM | gap 0, **READY** |
| F-04 | Has a diploma, plans a bachelor, commerce and finance, citizen, public. No average, age, income or costs | MIGHT / DNM / MIGHT / MIGHT / CANT | DNM / DNM | no verdict; show "add your costs" |
| F-05 | Same as F-02, on 26 Oct at 13:00 | CLOSED / DNM / MIGHT / DNM / CANT | DNM / DNM | gap 60,000, **WAIT** (Astron no longer counts) |
| F-06 | First qualification, plans a bachelor, average 65, age 19, IT, income up to R350k, **private** institution. Cost R120,000, own R10,000 | DNM / DNM / MIGHT / MIGHT / CANT | DNM / DNM | gap 110,000, **WAIT** |
| F-07 | Has a higher certificate, plans a diploma, average 66, age 20, IT, income up to R350k, public. Cost R70,000, own R10,000 | DNM / MIGHT / MIGHT / MIGHT / CANT | DNM / DNM | gap 60,000, **WAIT** |
| F-08 | Has a diploma, plans a bachelor, average 55, age 30, field other, income above R600k, public. Cost R50,000, own R50,000 | DNM / DNM / CANT / DNM / CANT | DNM / DNM | gap 0, **READY** |
| G-01 | Has a bachelor, plans honours **at UNISA**, average 68, age 25, commerce and finance, income up to R350k. Cost R40,000, own R5,000 | DNM / DNM / CANT / DNM / CANT | MIGHT / MIGHT | gap 35,000, **WAIT** |
| G-02 | Has an honours, plans a master's at UNISA, average 72, age 27, humanities, income up to R350k. Cost R60,000, own R10,000 | DNM / DNM / CANT / DNM / CANT | CLOSED / MIGHT | gap 50,000, **WAIT** (only UNISA counts) |
| G-03 | Has a bachelor, plans honours at UNISA, average **58**, age 25, commerce and finance. Cost R40,000, own 0 | DNM / DNM / CANT / DNM / CANT | DNM / DNM | gap 40,000, **HIGH_RISK** |
| G-04 | Same as G-01, on 24 Nov 2026 | CLOSED / CLOSED / CLOSED / CLOSED / CANT | CLOSED / MIGHT | gap 35,000, **WAIT** |

Why some cells look the way they do:

- **F-01 and G-03** are the problem case from section 1: a low average, no bursary the student can win, and a gap, so HIGH_RISK. F-01 includes `studyingAtUnisa = false`. If that answer were missing, UNISA would show MIGHT and the verdict would wrongly change to WAIT, which is why the form must ask it.
- **G-02:** the NRF's first-time master's call closed in July 2026, so only UNISA is left for a master's student today.
- **G-04:** by 24 Nov the NRF honours call has closed (23 Nov) and Astron, NSFAS, ISFAP and JDK have closed too, so only UNISA (to 30 Nov) is left.
- **F-06:** NSFAS fails because the institution is private.
- **F-07:** NSFAS is MIGHT because only a higher certificate was completed, so progression has to be confirmed.

**Validation cases** (each must be rejected with a generic message and a 400 response, and nothing run):

| Case | Input |
|---|---|
| V-F1 | `averagePercent` 101 |
| V-F2 | `yearlyCost` -5 |
| V-F3 | `highestCompleted` "PHD" |
| V-F4 | `field` `<script>alert(1)</script>` |
| V-F5 | `yearlyCost` sent as text "90000" |
| V-F6 | `saCitizen` missing |

## 8. Privacy and safety

- Average, income and costs are kept in memory only and never stored or logged. Update the SSDLC text to say so (Kwena).
- No population group is collected.
- Same rate limit and size limit as `/api/match`.
- The page never states or implies a bursary will be awarded, and never gives financial advice.

## 9. Data to do (Nana)

**Done 24 Oct:** the six postgraduate funds were checked (see `postgrad-research-2026-10-24.md`).

**Still to verify from official pages**, then update `bursaries.json` and the criteria:

1. NSFAS: citizenship rule and the income limit (nsfas.org.za).
2. ISFAP: citizenship, and whether people who already hold a qualification can apply.
3. Funza Lushaka: whether it covers people who already hold a degree (for example a teaching certificate after a degree).
4. JDK: eligible fields and institutions.
5. Astron: which fields and study levels (the application portal).
6. NRF: open `nrf.ac.za` and confirm the honours closing date and the means-test limit; get the official ISFAP postgraduate page.

Because four of the six postgraduate funds are closed, re-check closing dates before the final submission on Monday, and again if the funds publish 2028 dates.

## 10. Owners and fallback

| Person | Task |
|---|---|
| Nana | Criteria data, verification, research, test cases (this document) |
| Nhlanhla | The endpoint and rules in Java, with tests F-01 to F-08 and V-F1 to V-F6 |
| Thembani | "Before you register" form, the five result states and the verdict |
| Kwena | Privacy and security review, SSDLC wording |
| Lorraine | Scope decision and pitch |

**Fallback if time runs out (freeze is Sunday 18:00):** ship only the NSFAS card (the first-qualification rule from section 4, with its wording) and the money gap on the funding page, and show the full bursary check as roadmap.
