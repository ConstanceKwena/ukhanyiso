(function (root, factory) {
    "use strict";
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.UkhanyisoCalendarExport = api;
}(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";

    function escapeIcs(value) {
        return String(value || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n")
            .replace(/,/g, "\\,").replace(/;/g, "\\;");
    }

    function utcTimestamp(date, time) {
        const value = new Date(date + "T" + time + ":00");
        if (Number.isNaN(value.getTime())) throw new Error("Calendar event has an invalid date or time.");
        return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }

    function buildIcs(events, calendarName) {
        const lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Ukhanyiso//" + escapeIcs(calendarName || "Calendar") + "//EN",
            "CALSCALE:GREGORIAN"
        ];
        events.forEach(item => {
            lines.push("BEGIN:VEVENT", "UID:" + escapeIcs(item.id) + "@ukhanyiso.local",
                "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""));
            if (item.allDay) {
                const end = new Date((item.endDate || item.date) + "T00:00:00");
                if (Number.isNaN(end.getTime())) throw new Error("Calendar event has an invalid date.");
                end.setDate(end.getDate() + 1);
                const endDate = end.getFullYear() + String(end.getMonth() + 1).padStart(2, "0")
                    + String(end.getDate()).padStart(2, "0");
                lines.push("DTSTART;VALUE=DATE:" + item.date.replace(/-/g, ""),
                    "DTEND;VALUE=DATE:" + endDate);
            } else {
                if (!item.date || !item.startTime || !item.endTime) {
                    throw new Error("Timed calendar events need a date, start time, and end time.");
                }
                lines.push("DTSTART:" + utcTimestamp(item.date, item.startTime),
                    "DTEND:" + utcTimestamp(item.endDate || item.date, item.endTime));
            }
            lines.push("SUMMARY:" + escapeIcs(item.title),
                "DESCRIPTION:" + escapeIcs(item.description || "Ukhanyiso calendar entry."));
            if (item.sourceUrl && /^https:\/\//i.test(item.sourceUrl)) {
                lines.push("URL:" + item.sourceUrl.replace(/[\r\n]/g, ""));
            }
            if (item.alarm) {
                lines.push("BEGIN:VALARM", "TRIGGER:" + item.alarm, "ACTION:DISPLAY",
                    "DESCRIPTION:" + escapeIcs(item.title), "END:VALARM");
            }
            lines.push("END:VEVENT");
        });
        lines.push("END:VCALENDAR", "");
        return lines.join("\r\n");
    }

    function download(events, fileName, calendarName) {
        if (!events.length) return false;
        const blob = new Blob([buildIcs(events, calendarName)], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return true;
    }

    return { buildIcs: buildIcs, download: download };
}));
