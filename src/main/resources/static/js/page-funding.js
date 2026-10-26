    const list = document.getElementById("list");
    const documentStatus = document.getElementById("document-status");
    const DOCUMENT_PROGRESS_KEY = "ukhanyiso-funding-documents-v1";
    let documentProgress = {};
    const STATUS = {
        verified: { text: "Verified", css: "fit-match" },
        partial: { text: "Partly verified", css: "fit-unknown" },
        conflicting: { text: "Sources disagree: check carefully", css: "fit-no-match" },
        unverified: { text: "Not verified yet", css: "fit-unknown" }
    };

    try {
        const saved = JSON.parse(localStorage.getItem(DOCUMENT_PROGRESS_KEY) || "{}");
        if (saved && typeof saved === "object" && !Array.isArray(saved)) {
            documentProgress = saved;
        }
    } catch (error) {
        documentStatus.textContent = "This browser could not load saved document checklist ticks.";
        documentStatus.className = "error";
    }

    function el(tag, text, className) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined && text !== null) e.textContent = (window.Site && window.Site.t) ? window.Site.t(text) : text;
        return e;
    }

    function render(b, i) {
        const card = el("article", null, "card");
        card.appendChild(el("h2", b.name || "Bursary"));

        if (b.deadline === "CLOSED") {
            card.appendChild(el("span", "Applications closed", "badge closed"));
        } else if (b.deadline === "CLOSING_SOON") {
            card.appendChild(el("span", "Closing soon", "badge closing-soon"));
        } else if (b.deadline === "OPEN") {
            card.appendChild(el("span", "Applications open", "badge likely"));
        }
        const status = STATUS[b.status] || STATUS.unverified;
        card.appendChild(el("span", status.text, "badge " + status.css));

        let closing = "Closing date not confirmed";
        if (b.closingDate) {
            closing = "Closing date: " + b.closingDate;
            if (b.closingTime) closing += " at " + String(b.closingTime).slice(0, 5);
        }
        card.appendChild(el("p", closing));

        if (b.whoItsFor) {
            card.appendChild(el("p", "Who can apply: " + b.whoItsFor));
        }

        if (Array.isArray(b.documents) && b.documents.length > 0) {
            card.appendChild(el("h3", "Documents required"));
            b.documents.forEach((doc, j) => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = "document-" + i + "-" + j;
                const progressKey = b.id + ":" + doc;
                checkbox.checked = documentProgress[progressKey] === true;
                checkbox.addEventListener("change", () => {
                    const previous = !checkbox.checked;
                    documentProgress[progressKey] = checkbox.checked;
                    try {
                        localStorage.setItem(DOCUMENT_PROGRESS_KEY, JSON.stringify(documentProgress));
                        documentStatus.textContent = "Document checklist updated in this browser.";
                        documentStatus.className = "form-note";
                    } catch (error) {
                        checkbox.checked = previous;
                        documentProgress[progressKey] = previous;
                        documentStatus.textContent = "This browser could not save that document checklist change.";
                        documentStatus.className = "error";
                    }
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + doc));
                card.appendChild(label);
            });
        }

        card.appendChild(el("p", "Information last reviewed: " + (b.lastChecked || "Not verified yet")));

        if (b.notes) {
            card.appendChild(el("p", "Important: " + b.notes));
        }

        if (b.officialLink && String(b.officialLink).startsWith("https://")) {
            const link = el("a", "Visit official bursary website");
            link.href = b.officialLink;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            const p = document.createElement("p");
            p.appendChild(link);
            card.appendChild(p);
        } else {
            card.appendChild(el("p", "No official link confirmed yet."));
        }

        return card;
    }

    function showError(text) {
        list.textContent = "";
        const p = el("p", text + " ", "error");
        const retry = el("button", "Try again", "secondary");
        retry.type = "button";
        retry.onclick = load;
        p.appendChild(retry);
        list.appendChild(p);
    }

    async function load() {
        list.textContent = "Loading bursaries…";
        try {
            const res = await fetch("/api/bursaries");
            if (!res.ok) throw new Error("bad status");
            const data = await res.json();
            list.textContent = "";
            if (!Array.isArray(data.bursaries) || data.bursaries.length === 0) {
                list.appendChild(el("p", "No bursaries to show right now."));
            } else {
                data.bursaries.forEach((b, i) => list.appendChild(render(b, i)));
            }
            if (data.disclaimer) {
                document.getElementById("disclaimer").textContent = data.disclaimer;
            }
        } catch (err) {
            showError("We could not load the bursaries.");
        }
    }

    load();
