const assert = require("node:assert/strict");
const test = require("node:test");
const Picker = require("../../main/resources/static/js/subject-picker.js");

const index = Picker.buildIndex([
    "Mathematics",
    "Mathematical Literacy",
    "Accounting",
    "English First Additional Language",
    "Life Orientation"
]);

test("subject search filters names case-insensitively and keeps alphabetical order", () => {
    const result = Picker.search(index, "math");
    assert.deepEqual(result.map(item => item.value), [
        "Mathematical Literacy",
        "Mathematics"
    ]);
});

test("the full subject list is sorted alphabetically by subject name", () => {
    const names = ["Mathematics", "Life Orientation", "Accounting", "Mathematical Literacy"];
    const sorted = Picker.buildIndex(names).map(item => item.value);
    assert.deepEqual(sorted, [
        "Accounting",
        "Life Orientation",
        "Mathematical Literacy",
        "Mathematics"
    ]);
});

test("subject search supports short codes and filters from the first character", () => {
    assert.deepEqual(Picker.search(index, "fal").map(item => item.value), [
        "English First Additional Language"
    ]);
    assert.equal(Picker.search(index, "ma").length, 2);
    assert.equal(Picker.search(index, "").length, index.length);
});

test("short subject codes match only their own subject", () => {
    assert.deepEqual(Picker.search(index, "lo").map(item => item.value), [
        "Life Orientation"
    ]);
});
