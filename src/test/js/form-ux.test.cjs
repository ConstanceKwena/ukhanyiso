const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const staticRoot = path.join(__dirname, "../../main/resources/static");

test("marks form starts blank and avoids browser autofill reusing saved marks", () => {
    const html = fs.readFileSync(path.join(staticRoot, "start.html"), "utf8");
    assert.match(html, /<form id="marks-form" autocomplete="off"/);
    assert.match(html, /m\.value = ""/);
    assert.match(html, /m\.name = `uk-matric-mark-\$\{number\}`/);
    assert.match(html, /m\.autocomplete = "off"/);
    assert.match(html, /for \(let i = 0; i < 7; i\+\+\) addRow\(\)/);
    assert.doesNotMatch(html, /\["English Home Language", "Mathematics", "Life Orientation"\]\.forEach\(addRow\)/);
});

test("signup explains and validates the server's 12-to-128 character password rule", () => {
    const signup = fs.readFileSync(path.join(staticRoot, "signup.html"), "utf8");
    const auth = fs.readFileSync(path.join(staticRoot, "js/auth.js"), "utf8");
    assert.match(signup, /minlength="12" maxlength="128"/);
    assert.match(signup, /Use 12–128 characters/);
    assert.match(signup, /no special symbol is required/);
    assert.match(auth, /function validateSignupPassword\(\)/);
    assert.match(auth, /Use at least 12 characters/);
    assert.match(auth, /12–128 characters/);
});
