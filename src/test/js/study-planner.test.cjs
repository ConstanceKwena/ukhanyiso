const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Core = require("../../main/resources/static/js/study-planner-core.js");
const CalendarExport = require("../../main/resources/static/js/calendar-export.js");

function samplePlan() {
    return {
        grade: "11",
        subjects: [
            { id: "math", name: "Mathematics", confidence: "help", topic: "Algebra" },
            { id: "history", name: "History", confidence: "confident", topic: "" }
        ],
        days: [
            {
                name: "Monday", enabled: true, schoolStart: "08:00", schoolEnd: "15:00",
                studyStart: "16:00", studyEnd: "19:00", minutes: "120", reminderTime: "15:30"
            },
            {
                name: "Tuesday", enabled: true, schoolStart: "09:00", schoolEnd: "12:00",
                studyStart: "13:00", studyEnd: "15:00", minutes: "60", reminderTime: "12:30"
            }
        ]
    };
}

test("weekly sessions stay inside chosen study windows and outside class hours", () => {
    const plan = samplePlan();
    const sessions = Core.buildWeek(plan);
    assert.ok(sessions.some(item => item.type === "break"));
    for (const session of sessions) {
        const day = plan.days.find(item => item.name === session.day);
        assert.ok(session.start >= Core.minutes(day.studyStart));
        assert.ok(session.end <= Core.minutes(day.studyEnd));
        assert.ok(session.end - session.start <= 25);
        assert.ok(session.end <= Core.minutes(day.schoolStart)
            || session.start >= Core.minutes(day.schoolEnd));
        if (session.type === "break") assert.equal(session.end - session.start, 5);
    }
});

test("help subjects receive more sessions than confident subjects", () => {
    const sessions = Core.buildWeek(samplePlan()).filter(item => item.type === "study");
    const helpCount = sessions.filter(item => item.subjectId === "math").length;
    const confidentCount = sessions.filter(item => item.subjectId === "history").length;
    assert.ok(helpCount > confidentCount);
    assert.ok(sessions.some(item => item.activity === "Review notes"));
    assert.ok(sessions.some(item => item.activity === "Practise questions"));
    assert.ok(sessions.some(item => item.activity === "Do a self-test"));
});

test("overlapping class hours and study windows are rejected", () => {
    const plan = samplePlan();
    plan.days[0].studyStart = "14:30";
    assert.throws(() => Core.buildWeek(plan), /overlaps your school\/class hours/);
});

test("confidence changes and completion update only the intended study session", () => {
    const model = { subjects: samplePlan().subjects, sessions: Core.buildWeek(samplePlan()) };
    const session = model.sessions.find(item => item.type === "study" && item.subjectId === "math");
    Core.markComplete(model, session.id, true);
    Core.updateConfidence(model, "math", "getting");
    assert.equal(session.completed, true);
    assert.equal(model.subjects[0].confidence, "getting");
    assert.equal(session.confidence, "getting");
    assert.throws(() => Core.markComplete(model, "missing", true), /could not be found/);
});

test("study links include Siyavula only for its stated grade and subject coverage", () => {
    assert.ok(Core.resourceLinks("11", "Mathematics").some(item => item.provider === "Siyavula"));
    assert.ok(Core.resourceLinks("12", "Physical Sciences").some(item => item.provider === "Siyavula"));
    assert.ok(Core.resourceLinks("10", "Life Sciences").some(item => item.provider === "Siyavula"));
    assert.ok(!Core.resourceLinks("11", "History").some(item => item.provider === "Siyavula"));
    assert.ok(Core.resourceLinks("10", "History").every(item => item.coverage));
});

test("calendar export creates timed sessions, reminders and escaped text", () => {
    const content = CalendarExport.buildIcs([{
        id: "session-1",
        title: "Math, algebra",
        description: "Practise; review",
        date: "2026-10-26",
        startTime: "16:00",
        endTime: "16:25"
    }, {
        id: "reminder-1",
        title: "Study reminder",
        description: "Chosen reminder",
        date: "2026-10-26",
        startTime: "15:30",
        endTime: "15:35",
        alarm: "PT0M"
    }], "Study plan");
    assert.match(content, /DTSTART:20261026T/);
    assert.match(content, /SUMMARY:Math\\, algebra/);
    assert.match(content, /BEGIN:VALARM\r\nTRIGGER:PT0M/);
    assert.equal((content.match(/BEGIN:VEVENT/g) || []).length, 2);
});

test("calendar export preserves all-day reminder dates and alarms", () => {
    const content = CalendarExport.buildIcs([{
        id: "reminder",
        title: "Application reminder",
        date: "2026-10-26",
        allDay: true,
        alarm: "-P1D"
    }], "Application reminders");
    assert.match(content, /DTSTART;VALUE=DATE:20261026/);
    assert.match(content, /DTEND;VALUE=DATE:20261027/);
    assert.match(content, /TRIGGER:-P1D/);
});

test("Study Plan is injected only by signed-in navigation; reminders and budget links remain", () => {
    const staticRoot = path.join(__dirname, "../../main/resources/static");
    for (const file of fs.readdirSync(staticRoot).filter(name => name.endsWith(".html"))) {
        const html = fs.readFileSync(path.join(staticRoot, file), "utf8");
        assert.doesNotMatch(html, /href="\/study\.html"/, file);
    }
    const site = fs.readFileSync(path.join(staticRoot, "js/site.js"), "utf8");
    assert.match(site, /studyPlan\.href = "\/study\.html"/);
    assert.match(site, /fetch\("\/api\/auth\/me"/);
    const reminders = fs.readFileSync(path.join(staticRoot, "calendar.html"), "utf8");
    assert.match(reminders, /\/js\/calendar-export\.js/);
    assert.match(reminders, /id="export-calendar"/);
    const budget = fs.readFileSync(path.join(staticRoot, "plan.html"), "utf8");
    assert.match(budget, /href="\/plan\.html" aria-current="page">Budget/);
});
