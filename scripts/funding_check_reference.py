#!/usr/bin/env python3
"""Reference version of the rules in docs/funding-check.md ("Don't register on hope").

Run:  python3 docs/funding_check_reference.py     (must print ALL PASSED)
Tests use a fixed clock (24 Oct 2026, 09:00 unless a case says otherwise) so results never drift.
Criteria below are only what our own bursary file or a checked source states. Anything else is a
"needsCheck" item the student must confirm, so the app never guesses.
"""
import sys, datetime

LEVEL_ORDER = {"NONE": 0, "HIGHER_CERT": 1, "DIPLOMA": 2, "BACHELOR": 3, "HONOURS": 4, "MASTERS": 5}
PLANNED = {"DIPLOMA", "BACHELOR", "HONOURS", "MASTERS"}
UNDERGRAD = {"DIPLOMA", "BACHELOR"}
INCOME = ["UP_TO_350K", "350K_600K", "ABOVE_600K"]   # plus PREFER_NOT_TO_SAY (unknown)
FIELDS = {"ENGINEERING", "IT", "COMMERCE_FINANCE", "EDUCATION", "HEALTH", "LAW", "SCIENCE", "HUMANITIES", "OTHER"}

BURSARIES = {
 "B001": dict(name="Astron Energy Bursary 2027", status="partial", close=("2026-10-26", "12:00"),
              citizenOnly=True, maxAge=34, minAverage=70, fields={"ENGINEERING", "IT", "COMMERCE_FINANCE"},
              needsCheck=["Which fields and study levels are accepted (sources disagree). Check the application portal."]),
 "B002": dict(name="NSFAS 2027", status="partial", close=("2026-10-31", None),
              publicOnly=True, citizenOnly=True, maxIncome="UP_TO_350K", nsfasFirstQualification=True,
              needsCheck=[]),
 "B003": dict(name="ISFAP Bursary 2027", status="unverified", close=("2026-10-31", None),
              levels=UNDERGRAD, enteringYearExactly=1, maxIncome="350K_600K",
              needsCheck=["Partner university and selected fields.", "Whether someone who already holds a qualification can apply."]),
 "B004": dict(name="JDK Benefit Trust Bursary 2027", status="partial", close=("2026-10-31", None),
              citizenOnly=True, minAge=17, maxAge=21, maxEnteringYear=3,
              needsCheck=["A population-group requirement applies. Read the funder's page.", "Eligible fields and institutions."]),
 "B005": dict(name="Funza Lushaka Bursary 2027", status="unverified", close=("2027-01-31", None),
              fields={"EDUCATION"},
              needsCheck=["Priority teaching subjects and the obligation to teach after graduating."]),
 # ---- postgraduate funding, researched 24 Oct 2026 ----
 "B006": dict(name="DSI-NRF Postgraduate Scholarship (2027 funding)", status="partial", close=("2026-11-23", None),
              closeByLevel={"HONOURS": ("2026-11-23", None), "MASTERS": ("2026-07-03", None)},
              levels={"HONOURS", "MASTERS"}, minAverage=65,
              needsCheck=["Apply through your university's postgraduate office. Its internal closing date is earlier than the NRF date.",
                          "Age limits (28 honours, 30 master's, 32 doctoral) are applied when awards are allocated, not when you apply.",
                          "Citizenship or permanent residence, and the financial means test that decides full or partial cost."]),
 "B007": dict(name="UNISA Postgraduate Bursary 2027", status="partial", close=("2026-11-30", None),
              levels={"HONOURS", "MASTERS"}, minAverageByLevel={"HONOURS": 60}, unisaOnly=True,
              needsCheck=["You must be registered at UNISA. New honours applicants need an NQF 7 qualification completed by 31 January 2027.",
                          "South African citizenship for honours (master's and doctoral include international students)."]),
 "B008": dict(name="IDC External Bursary Scheme 2027", status="partial", close=("2026-09-30", None),
              citizenOnly=True, maxAge=26,
              needsCheck=["Must be unemployed, with financial need.",
                          "Mainly first undergraduate qualifications. Postgraduate only for selected honours fields (law, mathematics, statistics, actuarial science, accounting CTA)."]),
 "B009": dict(name="SANSA Postgraduate Bursary 2027", status="partial", close=("2026-09-30", None),
              citizenOnly=True, levels={"HONOURS", "MASTERS"}, minAverage=65, fields={"SCIENCE", "ENGINEERING", "IT"},
              needsCheck=["Study must fit SANSA's space science, earth observation or space engineering areas."]),
 "B010": dict(name="Canon Collins RMTF Scholarship 2027", status="verified", close=("2026-08-14", "16:00"),
              levels={"MASTERS"}, fields={"LAW", "EDUCATION", "HUMANITIES"},
              needsCheck=["Citizen of an eligible Southern African country, living there.", "At least 2 years of social justice involvement and a good honours degree."]),
 "B011": dict(name="ISFAP postgraduate funding (honours via NRF)", status="unverified", close=("2026-08-24", None),
              levels={"HONOURS"},
              needsCheck=["Honours applicants needing ISFAP assessment had to apply by 24 August 2026. Check isfap.org.za for later calls."]),
}

class Invalid(Exception): pass

def validate(r):
    def need(k): 
        if k not in r: raise Invalid(k)
    need("highestCompleted"); need("plannedLevel"); need("plannedYear"); need("saCitizen"); need("publicInstitution")
    if r["highestCompleted"] not in LEVEL_ORDER: raise Invalid("highestCompleted")
    if r["plannedLevel"] not in PLANNED: raise Invalid("plannedLevel")
    if not isinstance(r["plannedYear"], int) or not 1 <= r["plannedYear"] <= 7: raise Invalid("plannedYear")
    for k in ("saCitizen", "publicInstitution"):
        if not isinstance(r[k], bool): raise Invalid(k)
    a = r.get("averagePercent")
    if a is not None and (not isinstance(a, int) or isinstance(a, bool) or not 0 <= a <= 100): raise Invalid("averagePercent")
    g = r.get("age")
    if g is not None and (not isinstance(g, int) or isinstance(g, bool) or not 14 <= g <= 80): raise Invalid("age")
    f = r.get("field")
    if f is not None and f not in FIELDS: raise Invalid("field")
    u = r.get("studyingAtUnisa")
    if u is not None and not isinstance(u, bool): raise Invalid("studyingAtUnisa")
    i = r.get("income", "PREFER_NOT_TO_SAY")
    if i not in INCOME + ["PREFER_NOT_TO_SAY"]: raise Invalid("income")
    for k in ("yearlyCost", "ownContribution", "confirmedFunding"):
        v = r.get(k)
        if v is not None and (not isinstance(v, int) or isinstance(v, bool) or not 0 <= v <= 1_000_000): raise Invalid(k)
    return r

def closed(b, now, level=None):
    d, t = b.get("closeByLevel", {}).get(level, b["close"])
    hh, mm = (23, 59) if t is None else map(int, t.split(":"))
    return now > datetime.datetime.fromisoformat(d + "T%02d:%02d:59" % (hh, mm))

def check_bursary(b, r):
    """Returns (state, failed reasons, to-confirm list). Criterion results: True pass, False fail, None unknown."""
    fails, unknown, confirm = [], False, list(b["needsCheck"])
    def crit(ok, reason):
        nonlocal unknown
        if ok is None: unknown = True
        elif ok is False: fails.append(reason)
    if b.get("publicOnly"): crit(r["publicInstitution"], "Only public universities and TVET colleges are covered.")
    if b.get("citizenOnly"): crit(r["saCitizen"], "South African citizens only.")
    if "minAverage" in b:
        a = r.get("averagePercent")
        crit(None if a is None else a >= b["minAverage"], "Needs an average of at least %d%%." % b["minAverage"])
    age = r.get("age")
    if "maxAge" in b: crit(None if age is None else age <= b["maxAge"], "Age limit: %d or younger." % b["maxAge"])
    if "minAge" in b: crit(None if age is None else age >= b["minAge"], "Minimum age is %d." % b["minAge"])
    if "levels" in b:
        lv = b["levels"]
        msg = "For undergraduate study only." if lv == UNDERGRAD else "Only covers " + ", ".join(sorted(x.lower() for x in lv)) + " study."
        crit(r["plannedLevel"] in lv, msg)
    if "minAverageByLevel" in b and r["plannedLevel"] in b["minAverageByLevel"]:
        need_avg = b["minAverageByLevel"][r["plannedLevel"]]
        a2 = r.get("averagePercent")
        crit(None if a2 is None else a2 >= need_avg, "Needs an average of at least %d%% for this level." % need_avg)
    if b.get("unisaOnly"): crit(r.get("studyingAtUnisa"), "Only for students registered at UNISA.")
    if "enteringYearExactly" in b: crit(r["plannedYear"] == b["enteringYearExactly"], "For first-year students only.")
    if "maxEnteringYear" in b: crit(r["plannedYear"] <= b["maxEnteringYear"], "For students in their first three years.")
    if "fields" in b:
        f = r.get("field")
        crit(None if f is None else f in b["fields"], "Only certain fields of study are covered.")
    if "maxIncome" in b:
        inc = r.get("income", "PREFER_NOT_TO_SAY")
        crit(None if inc == "PREFER_NOT_TO_SAY" else INCOME.index(inc) <= INCOME.index(b["maxIncome"]),
             "Household income is above the limit.")
    if b.get("nsfasFirstQualification"):
        done, plan = LEVEL_ORDER[r["highestCompleted"]], r["plannedLevel"]
        if done == 0: pass
        elif plan in ("HONOURS", "MASTERS"):
            fails.append("NSFAS generally does not fund postgraduate study.")
        elif done >= LEVEL_ORDER["DIPLOMA"]:
            fails.append("NSFAS generally does not fund a second undergraduate qualification.")
        else:   # completed only a higher certificate, now moving up
            confirm.append("Whether NSFAS counts your move from a higher certificate as progression. Check with NSFAS.")
    if fails:
        return ("DOES_NOT_MEET" if b["status"] in ("verified", "partial") else "CANNOT_TELL"), fails, confirm
    if unknown or confirm: return "MIGHT_MEET", [], confirm
    return "MEETS", [], []

def run(r, now):
    r = validate(r)
    out = {}
    for bid, b in BURSARIES.items():
        if closed(b, now, r["plannedLevel"]): out[bid] = ("CLOSED", [], []); continue
        out[bid] = check_bursary(b, r)
    cost = r.get("yearlyCost")
    if cost is None: verdict, gap = None, None
    else:
        gap = cost - r.get("ownContribution", 0) - r.get("confirmedFunding", 0)
        if gap <= 0: verdict = "READY"
        elif any(v[0] in ("MEETS", "MIGHT_MEET") for v in out.values()): verdict = "WAIT"
        else: verdict = "HIGH_RISK"
    return out, verdict, gap

NOW = datetime.datetime(2026, 10, 24, 9, 0)
LATER = datetime.datetime(2026, 10, 26, 13, 0)
def L(**k): return k

CASES = {
 "F-01": (NOW, L(highestCompleted="BACHELOR", plannedLevel="HONOURS", plannedYear=1, averagePercent=62, age=24, saCitizen=True,
                 field="IT", income="UP_TO_350K", publicInstitution=True, studyingAtUnisa=False, yearlyCost=85000, ownContribution=20000, confirmedFunding=0)),
 "F-02": (NOW, L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, averagePercent=78, age=27, saCitizen=True,
                 field="COMMERCE_FINANCE", income="350K_600K", publicInstitution=True, yearlyCost=90000, ownContribution=30000, confirmedFunding=0)),
 "F-03": (NOW, L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, averagePercent=78, age=27, saCitizen=True,
                 field="COMMERCE_FINANCE", income="350K_600K", publicInstitution=True, yearlyCost=90000, ownContribution=30000, confirmedFunding=60000)),
 "F-04": (NOW, L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, field="COMMERCE_FINANCE",
                 publicInstitution=True)),
 "F-05": (LATER, L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, averagePercent=78, age=27, saCitizen=True,
                   field="COMMERCE_FINANCE", income="350K_600K", publicInstitution=True, yearlyCost=90000, ownContribution=30000, confirmedFunding=0)),
 "F-06": (NOW, L(highestCompleted="NONE", plannedLevel="BACHELOR", plannedYear=1, averagePercent=65, age=19, saCitizen=True,
                 field="IT", income="UP_TO_350K", publicInstitution=False, yearlyCost=120000, ownContribution=10000, confirmedFunding=0)),
 "F-07": (NOW, L(highestCompleted="HIGHER_CERT", plannedLevel="DIPLOMA", plannedYear=1, averagePercent=66, age=20, saCitizen=True,
                 field="IT", income="UP_TO_350K", publicInstitution=True, yearlyCost=70000, ownContribution=10000, confirmedFunding=0)),
 "F-08": (NOW, L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, averagePercent=55, age=30, saCitizen=True,
                 field="OTHER", income="ABOVE_600K", publicInstitution=True, yearlyCost=50000, ownContribution=50000, confirmedFunding=0)),
 "G-01": (NOW, L(highestCompleted="BACHELOR", plannedLevel="HONOURS", plannedYear=1, averagePercent=68, age=25, saCitizen=True,
                 field="COMMERCE_FINANCE", income="UP_TO_350K", publicInstitution=True, studyingAtUnisa=True, yearlyCost=40000, ownContribution=5000, confirmedFunding=0)),
 "G-02": (NOW, L(highestCompleted="HONOURS", plannedLevel="MASTERS", plannedYear=1, averagePercent=72, age=27, saCitizen=True,
                 field="HUMANITIES", income="UP_TO_350K", publicInstitution=True, studyingAtUnisa=True, yearlyCost=60000, ownContribution=10000, confirmedFunding=0)),
 "G-03": (NOW, L(highestCompleted="BACHELOR", plannedLevel="HONOURS", plannedYear=1, averagePercent=58, age=25, saCitizen=True,
                 field="COMMERCE_FINANCE", income="UP_TO_350K", publicInstitution=True, studyingAtUnisa=True, yearlyCost=40000, ownContribution=0, confirmedFunding=0)),
 "G-04": (datetime.datetime(2026, 11, 24, 9, 0),
          L(highestCompleted="BACHELOR", plannedLevel="HONOURS", plannedYear=1, averagePercent=68, age=25, saCitizen=True,
            field="COMMERCE_FINANCE", income="UP_TO_350K", publicInstitution=True, studyingAtUnisa=True, yearlyCost=40000, ownContribution=5000, confirmedFunding=0)),
}
def S(*states):   # states in the order B001 ... B011
    return dict(zip(["B001","B002","B003","B004","B005","B006","B007","B008","B009","B010","B011"], states))
DNM, MIGHT, CANT, CLOSED = "DOES_NOT_MEET", "MIGHT_MEET", "CANNOT_TELL", "CLOSED"
EXPECT = {
 "F-01": (S(DNM, DNM, CANT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "HIGH_RISK", 65000),
 "F-02": (S(MIGHT, DNM, MIGHT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 60000),
 "F-03": (S(MIGHT, DNM, MIGHT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "READY", 0),
 "F-04": (S(MIGHT, DNM, MIGHT, MIGHT, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), None, None),
 "F-05": (S(CLOSED, DNM, MIGHT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 60000),
 "F-06": (S(DNM, DNM, MIGHT, MIGHT, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 110000),
 "F-07": (S(DNM, MIGHT, MIGHT, MIGHT, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 60000),
 "F-08": (S(DNM, DNM, CANT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "READY", 0),
 "G-01": (S(DNM, DNM, CANT, DNM, CANT, MIGHT, MIGHT, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 35000),
 "G-02": (S(DNM, DNM, CANT, DNM, CANT, CLOSED, MIGHT, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 50000),
 "G-03": (S(DNM, DNM, CANT, DNM, CANT, DNM, DNM, CLOSED, CLOSED, CLOSED, CLOSED), "HIGH_RISK", 40000),
 "G-04": (S(CLOSED, CLOSED, CLOSED, CLOSED, CANT, CLOSED, MIGHT, CLOSED, CLOSED, CLOSED, CLOSED), "WAIT", 35000),
}
BAD = {   # each must be rejected as invalid input
 "V-F1 average 101":        L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, publicInstitution=True, averagePercent=101),
 "V-F2 negative cost":      L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, publicInstitution=True, yearlyCost=-5),
 "V-F3 unknown level":      L(highestCompleted="PHD", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, publicInstitution=True),
 "V-F4 script in field":    L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, publicInstitution=True, field="<script>alert(1)</script>"),
 "V-F5 cost as text":       L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, saCitizen=True, publicInstitution=True, yearlyCost="90000"),
 "V-F6 missing citizen":    L(highestCompleted="DIPLOMA", plannedLevel="BACHELOR", plannedYear=1, publicInstitution=True),
}

if __name__ == "__main__":
    fails = 0
    for k, (now, r) in CASES.items():
        out, verdict, gap = run(r, now)
        states = {b: v[0] for b, v in out.items()}
        want_states, want_verdict, want_gap = EXPECT[k]
        ok = states == want_states and verdict == want_verdict and gap == want_gap
        fails += 0 if ok else 1
        print(("ok   " if ok else "FAIL ") + k, "verdict:", verdict, "| gap:", gap)
        if not ok: print("     got", states, "\n     want", want_states, want_verdict, want_gap)
    for k, r in BAD.items():
        try: validate(dict(r)); ok = False
        except Invalid: ok = True
        fails += 0 if ok else 1
        print(("ok   " if ok else "FAIL ") + k + " is rejected")
    print("ALL PASSED" if fails == 0 else "%d FAILED" % fails)
    sys.exit(1 if fails else 0)
