    const LABELS = {
        LIKELY:   { text: "Likely",   css: "likely" },
        POSSIBLE: { text: "Possible", css: "possible" },
        UNLIKELY: { text: "Unlikely", css: "unlikely" }
    };
    const FITS = {
        MATCH: { text: "Meets listed minimum", css: "fit-match" },
        NEAR_MISS: { text: "Near miss", css: "fit-near-miss" },
        NO_MATCH: { text: "Does not meet listed minimum", css: "fit-no-match" },
        CANNOT_CHECK: { text: "Cannot check", css: "fit-unknown" }
    };

    const list = document.getElementById("list");
    function el(tag, text, className) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined && text !== null) e.textContent = (window.Site && window.Site.t) ? window.Site.t(text) : text;
        return e;
    }

    function showMessage(text) {
        const p = el("p", text + " ");
        const a = el("a", "Enter your marks");
        a.href = "/start.html";
        p.appendChild(a);
        list.appendChild(p);
    }

    let data = null;
    try { data = JSON.parse(sessionStorage.getItem("ukhanyiso-results")); } catch (e) { data = null; }

    if (!data || !Array.isArray(data.results)) {
        showMessage("We have no results to show yet.");
    } else if (data.results.length === 0) {
        showMessage("No matching or near-miss courses were found. Try adding more subjects from your school report and checking the official requirements.");
    } else {
        if (sessionStorage.getItem("ukhanyiso-showing-all-courses") === "true") {
            const notice = el("p", "No likely or possible matches were found for these marks. All available courses are shown below so you can compare requirements and see what to work on.", "form-note");
            list.appendChild(notice);
        }
        data.results.forEach(r => {
            const c = el("article", null, "card");

            c.appendChild(el("h2", r.course || "Course details unavailable"));

            const fit = FITS[r.fit];
            if (fit) c.appendChild(el("span", fit.text, "badge " + fit.css));

            const lab = LABELS[r.label];
            if (lab) {
                c.appendChild(el("span", lab.text, "badge " + lab.css));
            }

            if (r.deadline === "CLOSED") {
                c.appendChild(el("span", "Applications closed", "badge closed"));
            } else if (r.deadline === "CLOSING_SOON") {
                c.appendChild(el("span", "Closing soon", "badge closing-soon"));
            } else if (r.deadline === "OPEN") {
                c.appendChild(el("span", "Applications open", "badge likely"));
            }

            if (typeof r.institution === "string" && r.institution.trim()) {
                c.appendChild(el("p", r.institution));
            }
            const aps = [];
            if (Number.isFinite(r.requiredAps)) aps.push(`Required APS: ${r.requiredAps}`);
            if (Number.isFinite(r.yourAps)) aps.push(`Your APS: ${r.yourAps}`);
            c.appendChild(el("p", aps.length > 0 ? aps.join(" · ") : "APS details are not available for this course."));
            c.appendChild(el("p", r.closingDate ? `Listed closing date: ${r.closingDate}` : "Closing date not confirmed"));

            if (Array.isArray(r.suggestions) && r.suggestions.length > 0) {
                c.appendChild(el("h3", "Next steps"));
                r.suggestions.forEach(s => c.appendChild(el("p", s)));
            }
            if (r.fit === "NEAR_MISS" && r.deadline !== "CLOSED") {
                c.appendChild(el("h3", "Path to yes"));
                if (Array.isArray(r.pathToYes) && r.pathToYes.length > 0) {
                    r.pathToYes.forEach((opt, n) => {
                        const parts = (opt.changes || []).map(ch =>
                            `${ch.subject} from ${ch.fromPercent}% to ${ch.toPercent}% (+${ch.toPercent - ch.fromPercent})`);
                        c.appendChild(el("p", `Option ${n + 1}: Raise ${parts.join(" and ")} and you would meet the minimum for this course.`));
                    });
                } else {
                    c.appendChild(el("p", "This course needs a large improvement across several subjects. Talk to your teacher about whether that is realistic."));
                }
                c.appendChild(el("p", "Final matric marks only change through supplementary exams or remarking. If you are still writing, this shows where to focus. Meeting the minimum does not guarantee admission.", "disclaimer"));
            }
            if (Array.isArray(r.reasons) && r.reasons.length > 0) {
                c.appendChild(el("h3", "Why it may not fit"));
                r.reasons.forEach(s => c.appendChild(el("p", s)));
            }
            if (Array.isArray(r.caveats) && r.caveats.length > 0) {
                c.appendChild(el("h3", "Things to confirm"));
                r.caveats.forEach(s => c.appendChild(el("p", s)));
            }

            if (r.officialLink && String(r.officialLink).startsWith("https://")) {
                const p = el("p", "Official source, checked " + (r.sourceChecked || "date unknown") + ": ");
                const a = el("a", "Open official page");
                a.href = r.officialLink;
                a.rel = "noopener noreferrer";
                a.target = "_blank";
                p.appendChild(a);
                c.appendChild(p);
            }

            list.appendChild(c);
        });
    }

    if (data && data.disclaimer) {
        document.getElementById("disclaimer").textContent = data.disclaimer;
    }
