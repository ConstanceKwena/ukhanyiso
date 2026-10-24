/*
 * Subject picker for the marks form.
 *
 * What it does:
 *  - turns each subject <select> into a type-to-search box (the real <select> stays in the page, hidden,
 *    so the form, the validation and the API keep working exactly as before)
 *  - searches once 3 or more characters are typed (or a known short code such as LO or IT)
 *  - always lists subjects alphabetically
 *  - shows abbreviations: Home Language (HL), First Additional Language (FAL), Second Additional Language (SAL),
 *    plus short names such as Maths, Maths Lit and Phys Sci
 *  - greys out subjects already chosen in another row
 *
 * Needs validate.js to be loaded first (it defines SUBJECTS).
 * The value sent to the server is still the full official subject name.
 */
(function () {
    "use strict";

    const LEVELS = [
        [" Home Language", "HL"],
        [" First Additional Language", "FAL"],
        [" Second Additional Language", "SAL"]
    ];

    // Short name shown in brackets, and extra words people may type.
    const SHORT = {
        "Mathematics": ["Maths", "math pure"],
        "Mathematical Literacy": ["Maths Lit", "math lit ml literacy"],
        "Technical Mathematics": ["Tech Maths", "technical maths"],
        "Physical Sciences": ["Phys Sci", "physics chemistry physical science"],
        "Technical Sciences": ["Tech Sci", "technical science"],
        "Life Sciences": ["Life Sci", "biology life science"],
        "Agricultural Sciences": ["Agri Sci", "agriculture"],
        "Agricultural Technology": ["Agri Tech", "agriculture"],
        "Agricultural Management Practices": ["AMP", "agriculture"],
        "Information Technology": ["IT", "programming"],
        "Computer Applications Technology": ["CAT", "computers"],
        "Engineering Graphics and Design": ["EGD", "drawing"],
        "Life Orientation": ["LO", ""]
    };

    const MIN_CHARS = 3;

    const normalise = s => String(s).toLowerCase().replace(/[()\/,.\-]/g, " ").replace(/\s+/g, " ").trim();

    function labelOf(name) {
        for (const [suffix, code] of LEVELS) {
            if (name.endsWith(suffix)) return name + " (" + code + ")";
        }
        if (SHORT[name]) return name + " (" + SHORT[name][0] + ")";
        return name;
    }

    function buildIndex(names) {
        return names.map(name => {
            const label = labelOf(name);
            const extra = SHORT[name] ? SHORT[name][1] : "";
            const m = label.match(/\(([^)]+)\)$/);
            return { value: name, label, haystack: normalise(label + " " + extra), code: m ? normalise(m[1]) : "" };
        }).sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
    }

    const SHORT_CODES = new Set(
        Object.values(SHORT).map(v => v[0].toLowerCase()).concat(LEVELS.map(l => l[1].toLowerCase()))
    );

    // Returns { searching, items }. items is always alphabetical.
    function search(index, query) {
        const q = normalise(query);
        const compact = q.replace(/ /g, "");
        const searching = compact.length >= MIN_CHARS || SHORT_CODES.has(q);
        if (!searching) return { searching: false, items: index };
        // Two-letter short codes (LO, IT, HL) must match the code itself, not any word that contains those letters.
        if (compact.length < MIN_CHARS) return { searching: true, items: index.filter(it => it.code === q) };
        const tokens = q.split(" ");
        return { searching: true, items: index.filter(it => tokens.every(t => it.haystack.includes(t))) };
    }

    const core = { labelOf, buildIndex, search, normalise, MIN_CHARS };
    if (typeof module !== "undefined" && module.exports) module.exports = core;
    if (typeof document === "undefined" || typeof SUBJECTS === "undefined") return;

    const INDEX = buildIndex(SUBJECTS);

    const style = document.createElement("style");
    style.textContent = [
        ".sp-wrap{position:relative}",
        ".sp-list{position:absolute;z-index:30;left:0;right:0;top:calc(100% + 4px);max-height:15rem;overflow:auto;",
        "margin:0;padding:4px;list-style:none;background:#fff;border:1px solid #aebeb4;border-radius:8px;",
        "box-shadow:0 8px 24px rgba(23,33,29,.18)}",
        ".sp-list[hidden]{display:none}",
        ".sp-list li{min-height:44px;display:flex;align-items:center;padding:8px 12px;border-radius:6px;cursor:pointer}",
        ".sp-list li[aria-selected=true]{background:#e6f1ec}",
        ".sp-list li.sp-taken{color:#718078;cursor:not-allowed}",
        ".sp-hint{margin:4px 0 0;color:#52635a;font-size:.85rem}",
        ".sp-hint[hidden]{display:none}"
    ].join("");
    document.head.appendChild(style);

    function takenByOthers(sel) {
        return new Set([...document.querySelectorAll('select[name="subject"]')]
            .filter(s => s !== sel).map(s => s.value).filter(Boolean));
    }

    function enhance(sel) {
        if (sel.dataset.picker) return;
        sel.dataset.picker = "1";

        const input = document.createElement("input");
        input.type = "text";
        input.id = sel.id + "-search";
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", sel.id + "-list");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocapitalize", "off");
        input.spellcheck = false;
        input.placeholder = "Type 3+ letters, e.g. eng fal";

        const list = document.createElement("ul");
        list.id = sel.id + "-list";
        list.className = "sp-list";
        list.setAttribute("role", "listbox");
        list.hidden = true;

        const hint = document.createElement("p");
        hint.className = "sp-hint";
        hint.setAttribute("aria-live", "polite");
        hint.hidden = true;

        const wrap = document.createElement("div");
        wrap.className = "sp-wrap";
        wrap.append(input, list, hint);

        const label = document.querySelector('label[for="' + sel.id + '"]');
        if (label) label.htmlFor = input.id;
        sel.hidden = true;
        sel.tabIndex = -1;
        sel.setAttribute("aria-hidden", "true");
        sel.insertAdjacentElement("afterend", wrap);

        let shown = [];
        let active = -1;

        function setActive(i) {
            active = i;
            [...list.children].forEach((li, n) => li.setAttribute("aria-selected", n === i ? "true" : "false"));
            if (i >= 0 && list.children[i]) {
                input.setAttribute("aria-activedescendant", list.children[i].id);
                list.children[i].scrollIntoView({ block: "nearest" });
            } else {
                input.removeAttribute("aria-activedescendant");
            }
        }

        function close() {
            list.hidden = true;
            hint.hidden = true;
            input.setAttribute("aria-expanded", "false");
            setActive(-1);
        }

        function render() {
            const result = search(INDEX, input.value);
            const taken = takenByOthers(sel);
            shown = result.items;
            list.replaceChildren();
            shown.forEach((it, n) => {
                const li = document.createElement("li");
                li.id = sel.id + "-opt-" + n;
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", "false");
                li.textContent = it.label;
                if (taken.has(it.value)) {
                    li.classList.add("sp-taken");
                    li.setAttribute("aria-disabled", "true");
                    li.textContent = it.label + " (already added)";
                }
                li.addEventListener("mousedown", e => {
                    e.preventDefault();
                    if (!taken.has(it.value)) choose(it);
                });
                list.appendChild(li);
            });
            list.hidden = shown.length === 0;
            if (!result.searching) {
                hint.textContent = "Showing all subjects A to Z. Type 3 or more letters to search.";
            } else if (shown.length === 0) {
                hint.textContent = "No subject matches \u201C" + input.value.trim() + "\u201D. Try fewer letters.";
            } else {
                hint.textContent = shown.length + (shown.length === 1 ? " subject found." : " subjects found.");
            }
            hint.hidden = false;
            input.setAttribute("aria-expanded", String(!list.hidden));
            setActive(-1);
        }

        function choose(it) {
            sel.value = it.value;
            input.value = it.label;
            close();
            sel.dispatchEvent(new Event("change", { bubbles: true }));
        }

        function nextEnabled(from, step) {
            const taken = takenByOthers(sel);
            for (let i = from + step; i >= 0 && i < shown.length; i += step) {
                if (!taken.has(shown[i].value)) return i;
            }
            return from;
        }

        input.addEventListener("focus", render);
        input.addEventListener("click", () => { if (list.hidden) render(); });
        input.addEventListener("input", () => {
            sel.value = "";
            render();
        });
        input.addEventListener("keydown", e => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (list.hidden) render();
                setActive(nextEnabled(active, 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(nextEnabled(active, -1));
            } else if (e.key === "Enter") {
                if (!list.hidden && active >= 0) {
                    e.preventDefault();
                    choose(shown[active]);
                } else if (!list.hidden && shown.length === 1) {
                    e.preventDefault();
                    choose(shown[0]);
                }
            } else if (e.key === "Escape") {
                close();
            }
        });
        input.addEventListener("blur", () => {
            if (sel.value === "" && input.value.trim() !== "") {
                const q = normalise(input.value);
                const exact = INDEX.find(it => normalise(it.label) === q || normalise(it.value) === q);
                const result = search(INDEX, input.value);
                const taken = takenByOthers(sel);
                const only = result.searching ? result.items.filter(it => !taken.has(it.value)) : [];
                const pick = exact && !taken.has(exact.value) ? exact : (only.length === 1 ? only[0] : null);
                if (pick) { choose(pick); return; }
            }
            close();
        });
    }

    function enhanceAll() {
        document.querySelectorAll('select[name="subject"]').forEach(enhance);
    }

    enhanceAll();
    const rows = document.getElementById("rows");
    if (rows) new MutationObserver(enhanceAll).observe(rows, { childList: true });
})();
