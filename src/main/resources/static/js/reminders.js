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
    const timeInput = document.getElementById("reminder-time");
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

    // One-hour calendar event starting at the reminder time.
    function endHour(time) {
        const [hour, minute] = time.split(":").map(Number);
        return String((hour + 1) % 24).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
    }
    function formatTime(value) {
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value || "")) return "";
        const [hour, minute] = value.split(":").map(Number);
        return new Intl.DateTimeFormat(undefined, {
            hour: "numeric", minute: "2-digit"
        }).format(new Date(2000, 0, 1, hour, minute));
    }
    // How long until the reminder fires; null when it has passed or has no time.
    function countdown(value, time) {
        if (!time) return null;
        const due = parseDate(value);
        if (!due) return null;
        const [hour, minute] = time.split(":").map(Number);
        due.setHours(hour, minute, 0, 0);
        const ms = due.getTime() - Date.now();
        if (ms <= 0) return null;
        const days = Math.floor(ms / 86400000);
        const hours = Math.floor((ms % 86400000) / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (days > 0) return days + " day" + (days === 1 ? "" : "s") + " " + hours + "h";
        if (hours > 0) return hours + "h " + minutes + "m";
        return minutes <= 1 ? "less than a minute" : minutes + " minutes";
    }
    function loadReminders() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            if (!Array.isArray(saved)) return [];
            return saved.filter(item => item && typeof item.id === "string"
                && typeof item.title === "string" && parseDate(item.date)
                && (item.time === undefined || item.time === null
                    || /^\d{2}:\d{2}(:\d{2})?$/.test(item.time)));
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

    function addReminder(title, date, sourceUrl, time) {
        if (!parseDate(date)) return "failed";
        const existing = reminders.find(item => item.title === title && item.date === date);
        if (existing) return "duplicate";
        const reminder = {
            id: makeId(),
            title,
            date,
            time: time || "",
            sourceUrl: sourceUrl || ""
        };
        reminders.push(reminder);
        if (!saveReminders()) {
            reminders.pop();
            return "failed";
        }
        syncToServer("POST", reminder);
        render();
        return "saved";
    }

    // Keeps the server in step so WhatsApp/email reminders go out even when
    // this browser is closed. Fails silently: reminders still work locally.
    async function syncToServer(method, reminder) {
        try {
            const me = await fetch("/api/auth/me", { credentials: "same-origin" });
            if (!me.ok) return;  // signed out: local-only reminders
            const token = (await me.json()).csrfToken;
            await fetch("/api/reminders", {
                method: method,
                credentials: "same-origin",
                headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                body: JSON.stringify({ title: reminder.title, date: reminder.date, time: reminder.time || "" })
            });
        } catch (error) {
            // The local reminder still works; server sync is best effort.
        }
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = (window.Site && window.Site.t) ? window.Site.t(text) : text;
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
        content.appendChild(element("p", formatDate(item.date) + (item.time ? " at " + formatTime(item.time) : "")));
        const soon = countdown(item.date, item.time);
        if (soon) {
            const live = element("p", "Due in " + soon, "reminder-countdown");
            live.setAttribute("data-due-date", item.date);
            live.setAttribute("data-due-time", item.time);
            content.appendChild(live);
        }
        const remove = element("button", "Remove", "secondary");
        remove.type = "button";
        remove.setAttribute("aria-label", "Remove reminder: " + item.title);
        remove.onclick = () => {
            const previousReminders = reminders;
            reminders = reminders.filter(reminder => reminder.id !== item.id);
            if (saveReminders()) {
                syncToServer("DELETE", item);
                status.textContent = "Reminder removed.";
                render();
            } else {
                reminders = previousReminders;
                render();
            }
        };
        card.append(content, remove);
        return card;
    }

    function renderReminderList() {
        reminderList.textContent = "";
        const sorted = [...reminders].sort((a, b) =>
            (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
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
    // Keeps countdowns live: refreshes the "Due in …" line every minute.
    function refreshCountdowns() {
        document.querySelectorAll(".reminder-countdown").forEach(node => {
            const soon = countdown(node.getAttribute("data-due-date"), node.getAttribute("data-due-time"));
            node.textContent = soon ? "Due in " + soon : "";
            if (!soon) node.remove();
        });
    }
    setInterval(refreshCountdowns, 30000);

    function addDeadlineReminder(item, button) {
        const result = addReminder("Funding deadline: " + item.name, item.closingDate, item.officialLink);
        if (result === "saved") {
            button.disabled = true;
            button.textContent = "Added";
            status.textContent = "Funding deadline added to your local calendar.";
        } else if (result === "duplicate") {
            button.disabled = true;
            button.textContent = "Added";
            status.textContent = "That funding deadline is already in your local calendar.";
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

    function exportCalendar() {
        if (!reminders.length) {
            status.textContent = "Add at least one reminder before exporting your calendar.";
            return;
        }
        try {
            const events = reminders.map(item => ({
                id: item.id,
                title: item.title,
                date: item.date,
                startTime: item.time || undefined,
                endTime: item.time ? endHour(item.time) : undefined,
                allDay: !item.time,
                description: "Ukhanyiso reminder. Confirm deadlines with the official organisation.",
                sourceUrl: item.sourceUrl,
                alarm: item.time ? "-PT15M" : "-P1D"
            }));
            if (!window.UkhanyisoCalendarExport.download(events, "ukhanyiso-reminders.ics", "Application reminders")) {
                status.textContent = "No reminders were available to export.";
                return;
            }
            status.textContent = "Calendar file downloaded. Import it into your calendar app to receive notifications.";
        } catch (error) {
            status.textContent = "Calendar export failed. Please try again.";
        }
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
        const time = timeInput.value;
        if (!parseDate(date) || date < today) {
            status.textContent = "Choose a valid date today or later.";
            return;
        }
        const result = addReminder(title, date, "", time);
        if (result === "saved") {
            selectedDate = date;
            displayedMonth = new Date(date.slice(0, 4), Number(date.slice(5, 7)) - 1, 1);
            status.textContent = "Reminder saved only in this browser.";
            render();
        } else if (result === "duplicate") {
            status.textContent = "That reminder is already saved for this date.";
        }
    };
    document.getElementById("export-calendar").onclick = exportCalendar;

    render();
    loadDeadlines();
})();
