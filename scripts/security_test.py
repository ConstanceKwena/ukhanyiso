#!/usr/bin/env python3
"""Security tests for Ukhanyiso (Day 2). Standard library only.

Usage:
  python3 scripts/security_test.py https://YOUR-APP.onrender.com --signup --report docs/security-baseline.md
  python3 scripts/security_test.py https://YOUR-APP.onrender.com --burst-only      (run on network A)
  python3 scripts/security_test.py https://YOUR-APP.onrender.com --probe-only      (run on network B within a minute)

Use ONLY fictional accounts, never real learner data. --signup creates a fictional account (an @example.test address)
through the app's own sign-up. Or set TEST_EMAIL and TEST_PASSWORD for an account you made yourself.
Without either, the login-based tests are skipped.
The rate-limit tests run last and block this machine for about a minute. Pass --no-rate to skip them.
Results: PASS, FAIL (a real problem), INFO (needs a human look) or SKIP.
"""
import argparse, datetime, http.client, json, os, ssl, sys, time
from urllib.parse import urlparse

RESULTS = []
BASE = None


def record(tid, name, result, evidence=""):
    RESULTS.append((tid, name, result, evidence))
    print("%-5s %-4s %s%s" % (result, tid, name, ("  | " + evidence) if evidence else ""))


def req(method, path, body=None, headers=None, cookie=None, raw=None, chunked=False, timeout=20):
    """Returns (status, headers dict, set_cookies list, body text). Never raises on HTTP errors."""
    u = urlparse(BASE)
    cls = http.client.HTTPSConnection if u.scheme == "https" else http.client.HTTPConnection
    kwargs = {"timeout": timeout}
    if u.scheme == "https":
        kwargs["context"] = ssl.create_default_context()
    conn = cls(u.hostname, u.port or (443 if u.scheme == "https" else 80), **kwargs)
    h = dict(headers or {})
    if cookie:
        h["Cookie"] = cookie
    data = raw
    if body is not None:
        data = json.dumps(body).encode()
        h.setdefault("Content-Type", "application/json")
    try:
        if chunked:
            conn.putrequest(method, path)
            for k, v in h.items():
                conn.putheader(k, v)
            conn.putheader("Transfer-Encoding", "chunked")
            conn.endheaders()
            for i in range(0, len(data), 1024):
                piece = data[i:i + 1024]
                conn.send(b"%x\r\n" % len(piece) + piece + b"\r\n")
            conn.send(b"0\r\n\r\n")
        else:
            conn.request(method, path, body=data, headers=h)
        r = conn.getresponse()
        text = r.read().decode("utf-8", "replace")
        hdrs = {k.lower(): v for k, v in r.getheaders()}
        cookies = [v for k, v in r.getheaders() if k.lower() == "set-cookie"]
        return r.status, hdrs, cookies, text
    except Exception as e:  # network trouble: report as status 0
        return 0, {}, [], "ERROR " + type(e).__name__
    finally:
        conn.close()


def cookie_pair(set_cookies):
    for c in set_cookies:
        if c.upper().startswith("JSESSIONID="):
            return c.split(";")[0]
    return None


def leaks(text):
    bad = ["Exception", "at com.", "at org.", "java.lang", "SQLException", "Hibernate", "org.springframework", "stacktrace"]
    return [b for b in bad if b in text]


MATCH_TIMES = []   # when we sent each /api/match request, so the tests never trip the 10-per-minute limit by accident


def match(body=None, **kw):
    """POST /api/match, waiting first if we have already sent 9 in the last 60 seconds."""
    while True:
        now = time.time()
        recent = [x for x in MATCH_TIMES if now - x < 61]
        if len(recent) < 9:
            break
        time.sleep(max(1, 61 - (now - recent[0])))
    MATCH_TIMES.append(time.time())
    return req("POST", "/api/match", body, **kw)


VALID = {"marks": [{"subject": "English Home Language", "mark": 62}, {"subject": "Mathematics", "mark": 58}]}


def login(email, password):
    s, h, c, t = req("POST", "/api/auth/login", {"email": email, "password": password})
    return s, c, t


def main():
    global BASE
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--report")
    ap.add_argument("--no-rate", action="store_true")
    ap.add_argument("--signup", action="store_true", help="create a fictional test account through /api/auth/signup")
    ap.add_argument("--burst-only", action="store_true", help="only send 12 quick /api/match requests (network A)")
    ap.add_argument("--probe-only", action="store_true", help="only send 1 /api/match request (network B)")
    a = ap.parse_args()
    BASE = a.url.rstrip("/")
    email, password = os.environ.get("TEST_EMAIL"), os.environ.get("TEST_PASSWORD")
    print("Target:", BASE, "|", datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))

    # wake a sleeping free-tier host
    for _ in range(4):
        s, *_ = req("GET", "/login.html", timeout=90)
        if s == 200:
            break
    if s != 200:
        sys.exit("Cannot reach %s (status %s)" % (BASE, s))

    if a.burst_only or a.probe_only:
        if a.burst_only:
            codes = [req("POST", "/api/match", VALID)[0] for _ in range(12)]
            record("F-01a", "Network A: 12 quick /api/match requests (expect the 11th to be 429)", "PASS" if 429 in codes and codes.index(429) <= 10 else "FAIL",
                   "codes: " + " ".join(map(str, codes)) + "  |  now run --probe-only from network B within a minute")
        else:
            s = req("POST", "/api/match", VALID)[0]
            record("F-01b", "Network B: one request while network A is rate-limited (expect it not to be 429)", "PASS" if s in (200, 401) else "FAIL",
                   "status %s (401 is expected without login; a 429 from a DIFFERENT network means the limit is shared by everyone)" % s)
        finish(a)
        return

    # ---- S-01 security headers
    s, h, c, t = req("GET", "/login.html")
    want = {"x-content-type-options": "nosniff", "content-security-policy": None, "referrer-policy": None}
    if BASE.startswith("https"):
        want["strict-transport-security"] = None
    if "x-frame-options" not in h and "frame-ancestors" not in h.get("content-security-policy", ""):
        want["x-frame-options"] = None
    missing = [k for k, v in want.items() if k not in h or (v and v not in h[k].lower())]
    record("S-01", "Security headers (nosniff, CSP, referrer policy, clickjacking, HSTS on https)",
           "FAIL" if missing else "PASS", ("missing: " + ", ".join(missing)) if missing else "all present")

    # ---- S-02 errors do not leak
    leak_bits = []
    for path in ["/api/doesnotexist", "/error", "/api/match"]:
        s, h, c, t = req("GET", path)
        if leaks(t) or "Whitelabel" in t:
            leak_bits.append(path)
    record("S-02", "Error pages leak no stack traces or framework details", "FAIL" if leak_bits else "PASS", ", ".join(leak_bits))

    # ---- S-03 sensitive paths
    exposed = []
    for path in ["/h2-console", "/actuator", "/actuator/env", "/.env", "/.git/config", "/pom.xml",
                 "/application.properties", "/data.sql", "/schema.sql", "/docs/security-findings.md"]:
        s, h, c, t = req("GET", path)
        if s == 200 and "<html" not in t[:200].lower():
            exposed.append(path)
        elif s == 200 and path in ("/h2-console", "/actuator"):
            exposed.append(path)
    record("S-03", "Config, database console and source files are not served", "FAIL" if exposed else "PASS", ", ".join(exposed))

    # ---- S-04 HTTP methods
    s, *_ = req("DELETE", "/api/match")
    s2, *_ = req("TRACE", "/index.html")
    record("S-04", "Unexpected HTTP methods rejected (DELETE /api/match, TRACE)", "PASS" if s in (404, 405) and s2 in (400, 404, 405) else "FAIL",
           "DELETE %s, TRACE %s" % (s, s2))

    # ---- S-05 input validation on /api/match
    attacks = {
        "SQL injection in subject": {"marks": [{"subject": "Mathematics' OR '1'='1", "mark": 60}]},
        "script tag in subject": {"marks": [{"subject": "<script>alert(1)</script>", "mark": 60}]},
        "mark above 100": {"marks": [{"subject": "Mathematics", "mark": 101}]},
        "negative mark": {"marks": [{"subject": "Mathematics", "mark": -5}]},
        "mark as SQL text": {"marks": [{"subject": "Mathematics", "mark": "60; DROP TABLE courses"}]},
        "unknown field": {"marks": [{"subject": "Mathematics", "mark": 60}], "admin": True},
        "13 subjects": {"marks": [{"subject": "Mathematics", "mark": 60}] * 13},
        "no marks": {"marks": []},
    }
    bad = []
    for name, body in attacks.items():
        s, h, c, t = match(body)
        echoed = "<script>" in t or "DROP TABLE" in t or "OR '1'" in t
        if s not in (400, 429) or leaks(t) or echoed:
            bad.append("%s -> %s%s" % (name, s, " (echoed input)" if echoed else ""))
        if s == 429:
            record("S-05", "Input validation", "INFO", "hit the rate limit during this test; rerun after a minute")
            bad = None
            break
    if bad is not None:
        record("S-05", "Attack inputs to /api/match are rejected with a safe 400", "FAIL" if bad else "PASS", "; ".join(bad))

    # ---- S-06 malformed and oversized requests
    s, h, c, t = match(raw=b"{not json", headers={"Content-Type": "application/json"})
    s_a = s; leak_a = leaks(t)
    s, h, c, t = match(raw=b"x=1", headers={"Content-Type": "application/x-www-form-urlencoded"})
    s_b = s
    record("S-06", "Malformed JSON and wrong content type get a clean 4xx", "PASS" if s_a == 400 and not leak_a and 400 <= s_b < 500 else "FAIL",
           "malformed %s, form %s" % (s_a, s_b))
    big = json.dumps({"marks": [{"subject": "Mathematics", "mark": 60}], "pad": "x" * 6000}).encode()
    s, *_ = match(raw=big, headers={"Content-Type": "application/json"})
    record("S-07", "Body over 4 KB is refused (413)", "PASS" if s in (413, 400) else "FAIL", "status %s" % s)
    huge = json.dumps({"marks": [{"subject": "Mathematics", "mark": 60}], "pad": "x" * 200000}).encode()
    s, *_ = match(raw=huge, headers={"Content-Type": "application/json"}, chunked=True)
    record("S-08", "Large body sent in chunks (no Content-Length) is also refused with 413",
           "PASS" if s in (413, 0) else "FAIL",
           "status %s%s" % (s, " (the 200 KB body was read and parsed: the size filter only checks Content-Length)" if s in (400, 200) else ""))

    # ---- S-09 authentication required
    s1, *_ = req("GET", "/api/checklist")
    s2, *_ = req("GET", "/api/plan")
    s3, *_ = req("PUT", "/api/checklist", {"itemId": "id-document", "completed": True})
    record("S-09", "Checklist and plan need a login (401 without a session)", "PASS" if (s1, s2) == (401, 401) and s3 in (401, 403) else "FAIL",
           "checklist %s, plan %s, write %s" % (s1, s2, s3))

    if a.signup and not (email and password):
        import secrets as _sec
        email = "ukhanyiso-test-%d@example.test" % int(time.time())
        password = _sec.token_urlsafe(14)
        s, h, c, t = req("POST", "/api/auth/signup", {"email": email, "password": password, "language": "en", "consent": True})
        record("S-10a", "Fictional test account can be created through sign-up", "PASS" if s == 200 else "FAIL", "status %s" % s)
        if s != 200:
            email = password = None
        else:
            # sign-up validation and duplicate handling (uses 3 more of the 5 allowed sign-ups this minute)
            s1 = req("POST", "/api/auth/signup", {"email": "a%d@example.test" % int(time.time()), "password": "short", "language": "en", "consent": True})[0]
            s2 = req("POST", "/api/auth/signup", {"email": "b%d@example.test" % int(time.time()), "password": password, "language": "en", "consent": False})[0]
            s3 = req("POST", "/api/auth/signup", {"email": "not-an-email", "password": password, "language": "en", "consent": True})[0]
            sd, hd, cd, td = req("POST", "/api/auth/signup", {"email": email, "password": password, "language": "en", "consent": True})
            ok = (s1, s2, s3) == (400, 400, 400) and sd == 400 and not leaks(td) and email not in td
            record("S-10b", "Sign-up refuses short password, missing consent and bad email; a duplicate gets a generic 400 that does not reveal the account exists",
                   "PASS" if ok else "FAIL", "short %s, no consent %s, bad email %s, duplicate %s" % (s1, s2, s3, sd))
            time.sleep(61)  # let the sign-up limit (5 a minute) reset before the login tests

    # ---- S-10 account enumeration
    s1, c1, t1 = login("nobody-%d@example.test" % int(time.time()), "wrong-password-123")
    if email:
        s2, c2, t2 = login(email, "wrong-password-123")
        same = s1 == s2 and t1 == t2
        record("S-10", "Login gives the same answer for unknown email and wrong password", "PASS" if same else "FAIL", "%s vs %s" % (s1, s2))
    else:
        record("S-10", "Login enumeration", "SKIP", "use --signup, or set TEST_EMAIL and TEST_PASSWORD")

    session = None
    csrf = None
    if email and password:
        s, hh, cc, t = req("GET", "/login.html")  # any cookie issued before login?
        pre = cookie_pair(cc)
        s, hdrs, cookies, text = req("POST", "/api/auth/login", {"email": email, "password": password}, cookie=pre)
        if s != 200:
            record("S-11", "Demo login works", "FAIL", "status %s" % s)
        else:
            session = cookie_pair(cookies)
            try:
                csrf = json.loads(text).get("csrfToken")
            except Exception:
                csrf = None
            flags = " ".join(cookies).lower()
            problems = []
            if "httponly" not in flags: problems.append("no HttpOnly")
            if "samesite" not in flags: problems.append("no SameSite")
            if BASE.startswith("https") and "secure" not in flags: problems.append("no Secure flag")
            attrs = [x.strip() for x in " ".join(cookies).lower().split(";")[1:]]
            record("S-11", "Session cookie flags (HttpOnly, SameSite, Secure on https)", "FAIL" if problems else "PASS",
                   ", ".join(problems) or "attributes: " + ", ".join(attrs))
            if pre and session:
                record("S-12", "Session id changes at login (no session fixation)", "PASS" if pre != session else "FAIL")
            else:
                record("S-12", "Session id changes at login", "PASS" if session else "INFO", "no pre-login cookie was issued")

    if session and csrf:
        # ---- S-13 CSRF
        body = {"itemId": "id-document", "completed": True}
        s_none, *_ = req("PUT", "/api/checklist", body, cookie=session)
        s_bad, *_ = req("PUT", "/api/checklist", body, cookie=session, headers={"X-CSRF-Token": "not-the-token"})
        s_ok, *_ = req("PUT", "/api/checklist", body, cookie=session, headers={"X-CSRF-Token": csrf})
        record("S-13", "Saving needs the CSRF token (none and wrong refused, right one accepted)",
               "PASS" if s_none == 403 and s_bad == 403 and s_ok == 200 else "FAIL", "none %s, wrong %s, right %s" % (s_none, s_bad, s_ok))
        # ---- S-14 bad checklist items and plan values
        s1, *_ = req("PUT", "/api/checklist", {"itemId": "../../etc/passwd", "completed": True}, cookie=session, headers={"X-CSRF-Token": csrf})
        s2, *_ = req("PUT", "/api/checklist", {"itemId": "id-document", "completed": "yes"}, cookie=session, headers={"X-CSRF-Token": csrf})
        record("S-14", "Unknown checklist item and wrong value type are refused (400)", "PASS" if (s1, s2) == (400, 400) else "FAIL", "%s, %s" % (s1, s2))
        plan = {"funding": 1000, "months": 10, "required": 65, "current": 60, "worth": 0, "startup": 0, "weeks": 4,
                "home": 0, "food": 0, "travel": 0, "data": 0, "other": 0}
        bad_plans = [dict(plan, funding=-1), dict(plan, months=13), dict(plan, required=101), dict(plan, extra=1), dict(plan, food="a lot")]
        codes = [req("PUT", "/api/plan", p, cookie=session, headers={"X-CSRF-Token": csrf})[0] for p in bad_plans]
        record("S-15", "Out-of-range, unknown and wrong-type plan values are refused (400)", "PASS" if all(x == 400 for x in codes) else "FAIL", str(codes))
        # ---- S-16 logout really ends the session
        s_out, *_ = req("POST", "/api/auth/logout", cookie=session, headers={"X-CSRF-Token": csrf})
        s_after, *_ = req("GET", "/api/checklist", cookie=session)
        record("S-16", "Log out ends the session on the server (old cookie gets 401 afterwards)",
               "PASS" if s_out in (200, 204) and s_after == 401 else "FAIL", "logout %s, old cookie then %s" % (s_out, s_after))
    else:
        for tid, nm in [("S-13", "CSRF"), ("S-14", "Bad item values"), ("S-15", "Plan validation"), ("S-16", "Logout")]:
            record(tid, nm, "SKIP", "needs a working demo login")

    # ---- rate limits last
    if a.no_rate:
        record("S-17", "Rate limit on /api/match (11th request in a minute gets 429)", "SKIP", "--no-rate")
    else:
        quiet = 62 - (time.time() - max(MATCH_TIMES)) if MATCH_TIMES else 0
        if quiet > 0:
            print("      (waiting %ds for a quiet minute before the rate-limit test)" % quiet)
            time.sleep(quiet)
        codes = [req("POST", "/api/match", VALID)[0] for _ in range(12)]
        ok = 429 in codes and codes.index(429) <= 10
        record("S-17", "Rate limit on /api/match (the 11th request in a minute gets 429)  [this is finding F-01]",
               "PASS" if ok else "FAIL", "codes: " + " ".join(map(str, codes)))
        codes = [login("brute-%d@example.test" % i, "guess-%d-xxxxxx" % i)[0] for i in range(25)]
        record("S-18", "Login attempts are throttled (429 within 25 wrong tries)", "PASS" if 429 in codes else "FAIL",
               "first 429 at try %s" % (codes.index(429) + 1 if 429 in codes else "never"))

    finish(a)


def finish(a):
    counts = {k: sum(1 for r in RESULTS if r[2] == k) for k in ("PASS", "FAIL", "INFO", "SKIP")}
    print("\nSummary:", counts)
    if a.report:
        with open(a.report, "w", encoding="utf-8") as f:
            f.write("# Security test run\n\nTarget: %s\nDate: %s\nCommand: `python3 %s`\nSummary: %s\n\n" % (
                BASE, datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), " ".join(sys.argv), counts))
            f.write("| ID | Test | Result | Evidence |\n|---|---|---|---|\n")
            for tid, name, res, ev in RESULTS:
                f.write("| %s | %s | **%s** | %s |\n" % (tid, name, res, ev.replace("|", "/")))
        print("Report written to", a.report)
    sys.exit(1 if counts["FAIL"] else 0)


if __name__ == "__main__":
    main()
