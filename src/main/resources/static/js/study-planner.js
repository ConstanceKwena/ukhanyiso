(function () {
    "use strict";

    const STORAGE_KEY = "ukhanyiso-study-plan-v1";
    const Core = window.UkhanyisoStudyPlanner;
    const dayRoot = document.getElementById("study-days");
    const subjectList = document.getElementById("subject-list");
    const timetable = document.getElementById("timetable");
    const resourceList = document.getElementById("study-resources");
    const status = document.getElementById("planner-status");
    const exportStatus = document.getElementById("calendar-export-status");
    const dayState = {};
    const freshDays = () => Core.days.map(day => ({
        name: day.name,
        enabled: false,
        schoolStart: "08:00",
        schoolEnd: "15:00",
        studyStart: "16:00",
        studyEnd: "18:00",
        minutes: 60,
        reminderTime: "15:30"
    }));

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (!saved || saved.version !== 1 || !Array.isArray(saved.subjects)
                    || !Array.isArray(saved.days) || !Array.isArray(saved.sessions)) {
                return { version: 1, grade: "10", subjects: [], days: freshDays(), sessions: [] };
            }
            return {
                version: 1,
                grade: ["10", "11", "12"].includes(String(saved.grade)) ? String(saved.grade) : "10",
                subjects: saved.subjects.filter(item => item && typeof item.id === "string"
                    && typeof item.name === "string"
                    && ["help", "getting", "confident"].includes(item.confidence))
                    .map(item => ({ id: item.id, name: item.name.slice(0, 48),
                        confidence: item.confidence, topic: String(item.topic || "").slice(0, 120) })),
                days: freshDays().map(day => {
                    const old = saved.days.find(item => item && item.name === day.name);
                    return old ? Object.assign(day, old, { name: day.name }) : day;
                }),
                sessions: saved.sessions.filter(item => item && typeof item.id === "string"
                    && ["study", "break"].includes(item.type))
            };
        } catch (error) {
            status.textContent = "Saved study data could not be read. You can make a new plan in this browser.";
            return { version: 1, grade: "10", subjects: [], days: freshDays(), sessions: [] };
        }
    }

    let model = loadState();

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
            status.textContent = "Study plan changes saved in this browser.";
            status.className = "form-note";
            return true;
        } catch (error) {
            status.textContent = "This browser could not save your study plan. Check its storage settings.";
            status.className = "error";
            return false;
        }
    }

    function makeId() {
        return typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function node(tag, text, className) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function field(labelText, id, type, value, min, max) {
        const wrapper = node("div", undefined, "field");
        const label = node("label", labelText);
        label.htmlFor = id;
        const input = node("input");
        input.id = id;
        input.type = type;
        input.value = value;
        if (min !== undefined) input.min = min;
        if (max !== undefined) input.max = max;
        if (type === "number") {
            input.step = "1";
            input.inputMode = "numeric";
        }
        wrapper.append(label, input);
        return { wrapper: wrapper, input: input };
    }

    function makeDayControls(day, index) {
        const state = model.days.find(item => item.name === day.name) || day;
        const fieldset = node("fieldset", undefined, "study-day");
        const legend = node("legend");
        const toggle = node("input");
        toggle.type = "checkbox";
        toggle.id = "day-" + index + "-enabled";
        toggle.checked = Boolean(state.enabled);
        const toggleLabel = node("label", day.name);
        toggleLabel.htmlFor = toggle.id;
        legend.append(toggle, toggleLabel);
        fieldset.appendChild(legend);

        const controls = node("div", undefined, "study-day-controls");
        const inputs = {};
        [
            ["School/class starts", "schoolStart", "time"],
            ["School/class ends", "schoolEnd", "time"],
            ["Study window starts", "studyStart", "time"],
            ["Study window ends", "studyEnd", "time"],
            ["Study minutes", "minutes", "number"],
            ["Reminder time", "reminderTime", "time"]
        ].forEach(([label, key, type]) => {
            const input = field(label, "day-" + index + "-" + key, type, state[key],
                type === "number" ? "15" : undefined, type === "number" ? "240" : undefined);
            controls.appendChild(input.wrapper);
            inputs[key] = input.input;
        });
        fieldset.appendChild(controls);
        dayRoot.appendChild(fieldset);
        dayState[day.name] = { toggle: toggle, inputs: inputs, controls: controls };
        toggle.addEventListener("change", () => {
            controls.hidden = !toggle.checked;
            saveDayDraft();
        });
        Object.values(inputs).forEach(input => input.addEventListener("change", saveDayDraft));
        controls.hidden = !toggle.checked;
    }

    function saveDayDraft() {
        model.days = Core.days.map(day => {
            const controls = dayState[day.name];
            return {
                name: day.name,
                enabled: controls.toggle.checked,
                schoolStart: controls.inputs.schoolStart.value,
                schoolEnd: controls.inputs.schoolEnd.value,
                studyStart: controls.inputs.studyStart.value,
                studyEnd: controls.inputs.studyEnd.value,
                minutes: controls.inputs.minutes.value,
                reminderTime: controls.inputs.reminderTime.value
            };
        });
        saveState();
    }

    function confidenceSelect(subject, id) {
        const select = node("select");
        select.id = id;
        [
            ["help", "I need help"],
            ["getting", "I’m getting there"],
            ["confident", "I’m confident"]
        ].forEach(([value, text]) => {
            const option = node("option", text);
            option.value = value;
            option.selected = subject.confidence === value;
            select.appendChild(option);
        });
        return select;
    }

    function renderSubjects() {
        subjectList.textContent = "";
        if (!model.subjects.length) {
            subjectList.appendChild(node("p", "No subjects added yet."));
            return;
        }
        model.subjects.forEach((subject, index) => {
            const card = node("article", undefined, "study-subject");
            const heading = node("h3", subject.name);
            const confidence = confidenceSelect(subject, "subject-confidence-" + index);
            const confidenceLabel = node("label", "Confidence");
            confidenceLabel.htmlFor = confidence.id;
            confidence.addEventListener("change", () => {
                subject.confidence = confidence.value;
                updateSessionSubject(subject);
                const saved = saveState();
                status.textContent = saved
                    ? "Confidence updated in this browser."
                    : "Confidence changed for this visit, but this browser could not save it.";
                status.className = saved ? "form-note" : "error";
            });
            const topic = field("Difficult topic (optional)", "subject-topic-" + index,
                "text", subject.topic || "");
            topic.input.maxLength = 120;
            topic.input.addEventListener("change", () => {
                subject.topic = topic.input.value.trim();
                updateSessionSubject(subject);
                const saved = saveState();
                status.textContent = saved
                    ? "Study topic saved in this browser."
                    : "Topic changed for this visit, but this browser could not save it.";
                status.className = saved ? "form-note" : "error";
            });
            const remove = node("button", "Remove subject", "secondary");
            remove.type = "button";
            remove.addEventListener("click", () => {
                model.subjects = model.subjects.filter(item => item.id !== subject.id);
                model.sessions = [];
                const saved = saveState();
                renderSubjects();
                renderTimetable();
                status.textContent = saved
                    ? "Subject removed. Generate the timetable again to rebalance your study time."
                    : "The subject was removed for this visit, but this browser could not save the change.";
                status.className = saved ? "form-note" : "error";
            });
            card.append(heading, confidenceLabel, confidence, topic.wrapper, remove);
            subjectList.appendChild(card);
        });
    }

    function updateSessionSubject(subject) {
        model.sessions.forEach(session => {
            if (session.type === "study" && session.subjectId === subject.id) {
                session.subject = subject.name;
                session.topic = subject.topic || "General revision";
                session.confidence = subject.confidence;
            }
        });
        renderTimetable();
    }

    function timeLabel(value) {
        return String(Math.floor(value / 60)).padStart(2, "0") + ":"
            + String(value % 60).padStart(2, "0");
    }

    function localDate(date) {
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
            + "-" + String(date.getDate()).padStart(2, "0");
    }

    function upcomingDate(dayName, time) {
        const target = Core.days.find(day => day.name === dayName);
        const date = new Date();
        let offset = (target.index - date.getDay() + 7) % 7;
        if (offset === 0 && Core.minutes(time) <= date.getHours() * 60 + date.getMinutes()) offset = 7;
        date.setDate(date.getDate() + offset);
        return localDate(date);
    }

    function addDate(value, days) {
        const date = new Date(value + "T12:00:00");
        date.setDate(date.getDate() + days);
        return localDate(date);
    }

    function sessionCard(session) {
        const card = node("article", undefined, session.type === "break" ? "study-session study-break" : "study-session");
        const heading = session.type === "study" ? session.subject : "Short break";
        card.appendChild(node("h3", heading));
        const time = timeLabel(session.start) + "–" + timeLabel(session.end);
        card.appendChild(node("p", session.day + " · " + time));
        card.appendChild(node("p", "Topic: " + session.topic));
        card.appendChild(node("p", "Activity: " + session.activity));
        if (session.type === "study") {
            const completion = node("input");
            completion.type = "checkbox";
            completion.checked = Boolean(session.completed);
            completion.id = "completed-" + session.id;
            const completionLabel = node("label", "Mark session complete");
            completionLabel.htmlFor = completion.id;
            completion.addEventListener("change", () => {
                Core.markComplete(model, session.id, completion.checked);
                card.classList.toggle("is-complete", completion.checked);
                if (saveState()) {
                    status.textContent = completion.checked
                        ? "Session marked complete and saved in this browser."
                        : "Session marked incomplete and saved in this browser.";
                    status.className = "form-note";
                } else {
                    completion.checked = !completion.checked;
                    Core.markComplete(model, session.id, completion.checked);
                    card.classList.toggle("is-complete", completion.checked);
                }
            });
            const confidence = confidenceSelect(
                model.subjects.find(subject => subject.id === session.subjectId) || {
                    confidence: session.confidence
                }, "session-confidence-" + session.id);
            const confidenceLabel = node("label", "Update confidence");
            confidenceLabel.htmlFor = confidence.id;
            confidence.addEventListener("change", () => {
                const subject = model.subjects.find(item => item.id === session.subjectId);
                if (subject) {
                    Core.updateConfidence(model, subject.id, confidence.value);
                    renderTimetable();
                    renderSubjects();
                    const saved = saveState();
                    status.textContent = saved
                        ? "Confidence saved. Generate the timetable again to rebalance sessions."
                        : "Confidence changed for this visit, but this browser could not save the change.";
                    status.className = saved ? "form-note" : "error";
                }
            });
            card.append(completionLabel, completion, confidenceLabel, confidence);
            if (session.completed) card.classList.add("is-complete");
        }
        return card;
    }

    function renderResources() {
        resourceList.textContent = "";
        model.subjects.forEach(subject => {
            const group = node("section", undefined, "study-resource-group");
            group.appendChild(node("h4", "Grade " + model.grade + " · " + subject.name));
            const links = Core.resourceLinks(model.grade, subject.name);
            links.forEach(resource => {
                const card = node("article", undefined, "study-resource");
                const link = node("a", resource.provider);
                link.href = resource.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                card.append(link, node("p", "Coverage: " + resource.coverage));
                if (!resource.subjects) {
                    card.appendChild(node("p", "The provider catalogue must be checked for an exact grade and subject match."));
                }
                group.appendChild(card);
            });
            resourceList.appendChild(group);
        });
    }

    function renderTimetable() {
        const section = document.getElementById("timetable-section");
        const hasStudy = model.sessions.some(session => session.type === "study");
        section.hidden = !hasStudy;
        timetable.textContent = "";
        if (!hasStudy) return;
        Core.days.forEach(day => {
            const sessions = model.sessions.filter(item => item.day === day.name);
            if (!sessions.length) return;
            const group = node("section", undefined, "study-day-schedule");
            group.appendChild(node("h3", day.name));
            const cards = node("div", undefined, "study-session-list");
            sessions.forEach(session => cards.appendChild(sessionCard(session)));
            group.appendChild(cards);
            timetable.appendChild(group);
        });
        renderResources();
    }

    function generate(config) {
        const newSessions = Core.buildWeek(config);
        model.grade = String(config.grade);
        model.days = config.days;
        model.sessions = newSessions;
        document.getElementById("grade").value = model.grade;
        status.textContent = saveState()
            ? "Weekly timetable generated and saved only in this browser."
            : "Weekly timetable generated for this visit, but this browser could not save it.";
        if (status.textContent.includes("could not save")) status.className = "error";
        else status.className = "form-note";
        exportStatus.textContent = "";
        renderTimetable();
    }

    function calendarEvents() {
        const events = [];
        const studySessions = model.sessions.filter(session => session.type === "study");
        const dateByDay = {};
        studySessions.forEach(session => {
            if (!dateByDay[session.day]) {
                const first = studySessions.filter(item => item.day === session.day)
                    .reduce((earliest, item) => Math.min(earliest, item.start), Infinity);
                dateByDay[session.day] = upcomingDate(session.day, timeLabel(first));
            }
        });
        studySessions.forEach(session => {
            const day = model.days.find(item => item.name === session.day);
            const date = dateByDay[session.day];
            events.push({
                id: session.id + "-" + date,
                title: session.subject + ": " + session.activity,
                description: "Topic: " + session.topic + ". Study plan created in this browser.",
                date: date,
                startTime: timeLabel(session.start),
                endTime: timeLabel(session.end)
            });
            if (!events.some(event => event.type === "reminder" && event.day === session.day)) {
                const reminderTime = day.reminderTime;
                const start = Core.minutes(reminderTime);
                const end = start + 5;
                const endDate = end >= 24 * 60 ? addDate(date, 1) : date;
                events.push({
                    id: "study-reminder-" + session.day + "-" + date,
                    title: "Study reminder",
                    description: "Your chosen study-day reminder. Alerts depend on your calendar app settings.",
                    date: date,
                    startTime: reminderTime,
                    endDate: endDate,
                    endTime: timeLabel(end % (24 * 60)),
                    alarm: "PT0M",
                    type: "reminder",
                    day: session.day
                });
            }
        });
        return events;
    }

    document.getElementById("grade").value = model.grade;
    Core.days.forEach(makeDayControls);
    model.days.forEach(day => {
        const controls = dayState[day.name];
        controls.toggle.checked = Boolean(day.enabled);
        controls.controls.hidden = !controls.toggle.checked;
        Object.keys(controls.inputs).forEach(key => {
            if (day[key] !== undefined) controls.inputs[key].value = day[key];
        });
    });
    document.getElementById("grade").addEventListener("change", event => {
        model.grade = event.target.value;
        saveState();
        renderResources();
    });
    document.getElementById("add-subject").addEventListener("click", () => {
        const nameInput = document.getElementById("subject-name");
        const name = nameInput.value.trim();
        if (!name) {
            status.textContent = "Enter a subject name.";
            nameInput.focus();
            return;
        }
        if (model.subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase())) {
            status.textContent = "That subject has already been added.";
            nameInput.focus();
            return;
        }
        model.subjects.push({
            id: makeId(),
            name: name,
            confidence: document.getElementById("subject-confidence").value,
            topic: document.getElementById("subject-topic").value.trim()
        });
        document.getElementById("subject-topic").value = "";
        nameInput.value = "";
        status.textContent = saveState()
            ? "Subject added. Generate the timetable to include it."
            : status.textContent;
        if (status.textContent.startsWith("Subject added")) status.className = "form-note";
        renderSubjects();
        renderResources();
        nameInput.focus();
    });
    document.getElementById("generate-timetable").addEventListener("click", () => {
        status.textContent = "";
        status.className = "form-note";
        const config = {
            grade: document.getElementById("grade").value,
            subjects: model.subjects,
            days: Core.days.map(day => {
                const controls = dayState[day.name];
                return {
                    name: day.name,
                    enabled: controls.toggle.checked,
                    schoolStart: controls.inputs.schoolStart.value,
                    schoolEnd: controls.inputs.schoolEnd.value,
                    studyStart: controls.inputs.studyStart.value,
                    studyEnd: controls.inputs.studyEnd.value,
                    minutes: controls.inputs.minutes.value,
                    reminderTime: controls.inputs.reminderTime.value
                };
            })
        };
        try {
            generate(config);
        } catch (error) {
            status.textContent = error.message;
            status.className = "error";
        }
    });
    document.getElementById("export-study-calendar").addEventListener("click", () => {
        try {
            const events = calendarEvents();
            if (!window.UkhanyisoCalendarExport.download(events, "ukhanyiso-study-plan.ics", "Study plan")) {
                exportStatus.textContent = "Generate a timetable before exporting your calendar.";
                return;
            }
            exportStatus.textContent = "Study sessions and chosen study-day reminders were exported. Enable alerts in your calendar app if needed; Ukhanyiso does not notify you while closed.";
        } catch (error) {
            exportStatus.textContent = "Calendar export failed: " + error.message;
        }
    });

    renderSubjects();
    renderTimetable();
}());
