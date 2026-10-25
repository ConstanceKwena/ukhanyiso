(function (root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.UkhanyisoStudyPlanner = api;
}(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";

    const DAYS = [
        { name: "Monday", index: 1 }, { name: "Tuesday", index: 2 },
        { name: "Wednesday", index: 3 }, { name: "Thursday", index: 4 },
        { name: "Friday", index: 5 }, { name: "Saturday", index: 6 },
        { name: "Sunday", index: 0 }
    ];
    const ACTIVITIES = ["Review notes", "Practise questions", "Do a self-test"];
    const RESOURCES = [
        {
            provider: "DBE Self-Study Guides",
            url: "https://www.education.gov.za/",
            coverage: "The DBE homepage directs learners to study guides. Check the official catalogue for this grade and subject."
        },
        {
            provider: "DBE Past Papers",
            url: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx",
            coverage: "The DBE links previous Grade 12 examination papers. This does not confirm papers for every grade or subject."
        },
        {
            provider: "Siyavula",
            url: "https://www.siyavula.com/",
            subjects: [
                "mathematics", "physical sciences", "computer applications technology",
                "information technology", "mathematical literacy", "natural sciences",
                "life sciences"
            ],
            grades: ["10", "11", "12"],
            coverage: "The provider lists Mathematics, Physical Sciences, Computer Applications Technology, Information Technology, Mathematical Literacy, Natural Sciences, and Life Sciences for Grades 4–12."
        },
        {
            provider: "Mindset Learn",
            url: "https://www.mindset.africa/",
            coverage: "Mindset Network describes high-school STEM lessons, assessments, and past papers for key subjects. Check its current catalogue for exact grade and subject coverage."
        }
    ];

    function minutes(value) {
        if (!/^\d{2}:\d{2}$/.test(value || "")) return NaN;
        const parts = value.split(":").map(Number);
        if (parts[0] > 23 || parts[1] > 59) return NaN;
        return parts[0] * 60 + parts[1];
    }

    function resourceLinks(grade, subject) {
        const key = String(subject || "").trim().toLowerCase();
        return RESOURCES.filter(resource => !resource.subjects
            || (resource.grades.includes(String(grade)) && resource.subjects.includes(key)));
    }

    function validate(config) {
        if (!["10", "11", "12"].includes(String(config.grade))) {
            throw new Error("Choose Grade 10, 11, or 12.");
        }
        if (!Array.isArray(config.subjects) || !config.subjects.length) {
            throw new Error("Add at least one subject before generating a timetable.");
        }
        if (!Array.isArray(config.days) || !config.days.some(day => day.enabled)) {
            throw new Error("Choose at least one study day.");
        }
        config.days.filter(day => day.enabled).forEach(day => {
            const schoolStart = minutes(day.schoolStart);
            const schoolEnd = minutes(day.schoolEnd);
            const studyStart = minutes(day.studyStart);
            const studyEnd = minutes(day.studyEnd);
            const dailyMinutes = Number(day.minutes);
            if ([schoolStart, schoolEnd, studyStart, studyEnd].some(Number.isNaN)
                    || schoolStart >= schoolEnd || studyStart >= studyEnd) {
                throw new Error("Enter valid school/class and study time windows for " + day.name + ".");
            }
            if (studyStart < schoolEnd && schoolStart < studyEnd) {
                throw new Error("Your study window overlaps your school/class hours on " + day.name + ".");
            }
            if (!Number.isInteger(dailyMinutes) || dailyMinutes < 15 || dailyMinutes > 240) {
                throw new Error("Choose 15 to 240 study minutes for " + day.name + ".");
            }
            if (studyEnd - studyStart < 15) {
                throw new Error("Choose a study window of at least 15 minutes for " + day.name + ".");
            }
            const reminderTime = minutes(day.reminderTime);
            if (Number.isNaN(reminderTime)) {
                throw new Error("Choose a valid reminder time for " + day.name + ".");
            }
            if (reminderTime >= schoolStart && reminderTime < schoolEnd) {
                throw new Error("Choose a reminder time outside your school/class hours on " + day.name + ".");
            }
        });
        config.subjects.forEach(subject => {
            if (!subject.name.trim() || !["help", "getting", "confident"].includes(subject.confidence)) {
                throw new Error("Each subject needs a name and confidence level.");
            }
        });
    }

    function subjectWheel(subjects) {
        const weights = { help: 3, getting: 2, confident: 1 };
        return subjects.flatMap(subject => Array(weights[subject.confidence]).fill(subject));
    }

    function buildWeek(config) {
        validate(config);
        const wheel = subjectWheel(config.subjects);
        let wheelIndex = 0;
        let id = 0;
        const sessions = [];
        config.days.filter(day => day.enabled).forEach(day => {
            let cursor = minutes(day.studyStart);
            const end = minutes(day.studyEnd);
            let remaining = Number(day.minutes);
            let daySessions = 0;
            while (remaining > 0 && cursor < end) {
                const duration = Math.min(25, remaining, end - cursor);
                if (duration < 10) break;
                const subject = wheel[wheelIndex % wheel.length];
                wheelIndex++;
                const subjectSessions = sessions.filter(item => item.day === day.name
                    && item.subjectId === subject.id).length;
                sessions.push({
                    id: "study-" + (++id),
                    type: "study",
                    day: day.name,
                    start: cursor,
                    end: cursor + duration,
                    subjectId: subject.id,
                    subject: subject.name,
                    topic: subject.topic.trim() || "General revision",
                    activity: ACTIVITIES[subjectSessions % ACTIVITIES.length],
                    confidence: subject.confidence,
                    completed: false
                });
                daySessions++;
                remaining -= duration;
                cursor += duration;
                if (remaining > 0 && cursor + 15 <= end) {
                    sessions.push({
                        id: "break-" + (++id),
                        type: "break",
                        day: day.name,
                        start: cursor,
                        end: cursor + 5,
                        subject: "Break",
                        topic: "—",
                        activity: "Take a 5-minute break",
                        completed: false
                    });
                    cursor += 5;
                } else {
                    break;
                }
            }
            if (!daySessions) {
                throw new Error("The study window on " + day.name + " is too short for a 15-minute session.");
            }
        });
        return sessions;
    }

    function updateConfidence(model, subjectId, confidence) {
        if (!["help", "getting", "confident"].includes(confidence)) {
            throw new Error("Choose a valid confidence level.");
        }
        const subject = model.subjects.find(item => item.id === subjectId);
        if (!subject) throw new Error("The subject for this session is no longer available.");
        subject.confidence = confidence;
        model.sessions.forEach(session => {
            if (session.type === "study" && session.subjectId === subjectId) {
                session.confidence = confidence;
            }
        });
    }

    function markComplete(model, sessionId, completed) {
        const session = model.sessions.find(item => item.id === sessionId && item.type === "study");
        if (!session) throw new Error("The study session could not be found.");
        session.completed = Boolean(completed);
    }

    return {
        days: DAYS,
        resources: RESOURCES,
        activities: ACTIVITIES,
        minutes: minutes,
        resourceLinks: resourceLinks,
        validate: validate,
        buildWeek: buildWeek,
        updateConfidence: updateConfidence,
        markComplete: markComplete
    };
}));
