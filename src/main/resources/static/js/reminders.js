(function () {
    "use strict";

    const STORAGE_KEY = "ukhanyiso-reminders-v1";
    const calendarDays = document.getElementById("calendar-days");
    const selectedDateLabel = document.getElementById("selected-date");
    const selectedReminders = document.getElementById("selected-reminders");
    const reminderList = document.getElementById("reminder-list");
    const deadlineList = document.getElementById("deadline-list");
    const status = document.getElementById("calendar-status");
    const dateInput = document.getElementById("reminder-date");
    const todayDate = new Date();
    const today = localDate(todayDate);
    let reminders = loadReminders();
    let displayedMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    let selectedDate = today;

    dateInput.min = today;
    dateInput.value = today;

    function localDate(date) {
        return date.getFullYear() + "-"
            + String(date.getMonth() + 1).padStart(2, "0") + "-"
            + String(date.getDate()).padStart(2, "0");
    }

    function parseDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1
            && date.getDate() === day ? date : null;
    }

    function formatDate(value) {
        const date = parseDate(value);
        return date ? new Intl.DateTimeFormat(undefined, {
            year: "numeric", month: "long", day: "numeric"
        }).format(date) : value;
    }

    function addDays(value, days) {
        const date = parseDate(value);
        if (!date) return value;
        date.setDate(date.getDate() + days);
        return localDate(date);
    }

    function loadReminders() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) return [];
            return saved.filter(item => item && typeof item.id === "string"
                && typeof item.title === "string" && parseDate(item.date));
        } catch (error) {
            status.textContent = "This browser could not read saved reminders. You can still export reminders while this page is open.";
            return [];
        }
    }

    function saveReminders() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
            return true;
        } catch (error) {
            status.textContent = "This browser could not save your reminder. Check local storage settings or export your calendar.";
            return false;
        }
    }

    function makeId() {
        return typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function addReminder(title, date, sourceUrl) {
        if (!parseDate(date)) return false;
        const existing = reminders.find(item => item.title === title && item.date === date);
        if (existing) return true;
        reminders.push({
            id: makeId(),
            title,
            date,
            sourceUrl: sourceUrl || ""
        });
        if (!saveReminders()) {
            reminders.pop();
            return false;
        }
        render();
        return true;
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function monthTitle(date) {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric", month: "long"
        }).format(date);
    }

    function renderCalendar() {
        calendarDays.textContent = "";
        document.getElementById("calendar-title").textContent = monthTitle(displayedMonth);
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();
        const offset = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < offset; i++) {
            const blank = document.createElement("span");
            blank.setAttribute("aria-hidden", "true");
            calendarDays.appendChild(blank);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = localDate(new Date(year, month, day));
            const dayReminders = reminders.filter(item => item.date === date);
            const button = element("button", String(day), "calendar-day");
            button.type = "button";
            button.setAttribute("aria-label", formatDate(date)
                + (dayReminders.length ? `, ${dayReminders.length} reminder${dayReminders.length === 1 ? "" : "s"}` : ""));
            if (dayReminders.length) button.classList.add("has-reminders");
            if (date === today) button.setAttribute("aria-current", "date");
            button.setAttribute("aria-pressed", String(date === selectedDate));
            button.onclick = () => {
                selectedDate = date;
                renderCalendar();
                renderSelectedReminders();
            };
            calendarDays.appendChild(button);
        }
    }

    function renderSelectedReminders() {
        selectedDateLabel.textContent = "Reminders for " + formatDate(selectedDate);
        selectedReminders.textContent = "";
        const matches = reminders.filter(item => item.date === selectedDate);
        if (!matches.length) {
            selectedReminders.appendChild(element("p", "No reminders for this date."));
            return;
        }
        matches.forEach(item => selectedReminders.appendChild(reminderCard(item)));
    }

    function reminderCard(item) {
        const card = element("article", undefined, "reminder-card");
        const content = element("div");
        content.appendChild(element("strong", item.title));
        content.appendChild(element("p", formatDate(item.date)));
        const remove = element("button", "Remove", "secondary");
        remove.type = "button";
        remove.setAttribute("aria-label", "Remove reminder: " + item.title);
        remove.onclick = () => {
            reminders = reminders.filter(reminder => reminder.id !== item.id);
            if (saveReminders()) {
                status.textContent = "Reminder removed.";
                render();
            }
        };
        card.append(content, remove);
        return card;
    }

    function renderReminderList() {
        reminderList.textContent = "";
        const sorted = [...reminders].sort((a, b) => a.date.localeCompare(b.date));
        if (!sorted.length) {
            reminderList.appendChild(element("p", "You have no reminders yet."));
            return;
        }
        sorted.forEach(item => reminderList.appendChild(reminderCard(item)));
    }

    function render() {
        renderCalendar();
        renderSelectedReminders();
        renderReminderList();
    }

    function addDeadlineReminder(item, button) {
        if (addReminder("Funding deadline: " + item.name, item.closingDate, item.officialLink)) {
            button.disabled = true;
            button.textContent = "Added";
            status.textContent = "Funding deadline added to your local calendar.";
        }
    }

    async function loadDeadlines() {
        try {
            const response = await fetch("/api/bursaries");
            if (!response.ok) throw new Error("Funding deadlines could not be loaded.");
            const data = await response.json();
            if (!Array.isArray(data.bursaries)) throw new Error("Funding deadline response was invalid.");
            const upcoming = data.bursaries
                .filter(item => parseDate(item.closingDate) && item.closingDate >= today)
                .sort((a, b) => a.closingDate.localeCompare(b.closingDate));
            deadlineList.textContent = "";
            if (!upcoming.length) {
                deadlineList.appendChild(element("p", "No upcoming confirmed funding deadlines are available. Check official funder pages for updates."));
                return;
            }
            upcoming.forEach(item => {
                const card = element("article", undefined, "deadline-card");
                const content = element("div");
                content.appendChild(element("strong", item.name || "Funding opportunity"));
                content.appendChild(element("p", "Closing date: " + formatDate(item.closingDate)));
                const add = element("button", "Add deadline reminder");
                add.type = "button";
                const alreadyAdded = reminders.some(reminder =>
                    reminder.title === "Funding deadline: " + item.name && reminder.date === item.closingDate);
                add.disabled = alreadyAdded;
                if (alreadyAdded) add.textContent = "Added";
                add.onclick = () => addDeadlineReminder(item, add);
                card.append(content, add);
                deadlineList.appendChild(card);
            });
        } catch (error) {
            deadlineList.textContent = "";
            deadlineList.appendChild(element("p", "We could not load funding deadlines. Try the Funding page or check official funder websites."));
        }
    }

    function escapeIcs(value) {
        return String(value || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n")
            .replace(/,/g, "\\,").replace(/;/g, "\\;");
    }

    function exportCalendar() {
        if (!reminders.length) {
            status.textContent = "Add at least one reminder before exporting your calendar.";
            return;
        }
        const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ukhanyiso//Application reminders//EN", "CALSCALE:GREGORIAN"];
        reminders.forEach(item => {
            const date = item.date.replace(/-/g, "");
            lines.push(
                "BEGIN:VEVENT",
                "UID:" + escapeIcs(item.id) + "@ukhanyiso.local",
                "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
                "DTSTART;VALUE=DATE:" + date,
                "DTEND;VALUE=DATE:" + addDays(item.date, 1).replace(/-/g, ""),
                "SUMMARY:" + escapeIcs(item.title),
                "DESCRIPTION:" + escapeIcs("Ukhanyiso reminder. Confirm deadlines with the official organisation."),
                "BEGIN:VALARM",
                "TRIGGER:-P1D",
                "ACTION:DISPLAY",
                "DESCRIPTION:" + escapeIcs(item.title),
                "END:VALARM",
                "END:VEVENT"
            );
            if (item.sourceUrl && item.sourceUrl.startsWith("https://")) {
                lines.splice(lines.length - 1, 0, "URL:" + item.sourceUrl.replace(/[\r\n]/g, ""));
            }
        });
        lines.push("END:VCALENDAR", "");
        const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ukhanyiso-reminders.ics";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        status.textContent = "Calendar file downloaded. Import it into your calendar app to receive notifications.";
    }

    document.getElementById("previous-month").onclick = () => {
        displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
        renderCalendar();
    };
    document.getElementById("next-month").onclick = () => {
        displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
        renderCalendar();
    };
    document.getElementById("reminder-form").onsubmit = event => {
        event.preventDefault();
        const title = document.getElementById("reminder-type").value;
        const date = dateInput.value;
        if (!parseDate(date) || date < today) {
            status.textContent = "Choose a valid date today or later.";
            return;
        }
        if (addReminder(title, date)) {
            selectedDate = date;
            displayedMonth = new Date(date.slice(0, 4), Number(date.slice(5, 7)) - 1, 1);
            status.textContent = "Reminder saved only in this browser.";
            render();
        }
    };
    document.getElementById("export-calendar").onclick = exportCalendar;

    render();
    loadDeadlines();
})();
