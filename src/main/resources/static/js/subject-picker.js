/*
 * Accessible subject autocomplete for the marks form.
 *
 * Needs validate.js to be loaded first (it defines SUBJECTS). The native
 * select remains the source of the submitted value.
 */
(function () {
    "use strict";

    const LEVELS = [
        [" Home Language", "HL"],
        [" First Additional Language", "FAL"],
        [" Second Additional Language", "SAL"]
    ];

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
            const match = label.match(/\(([^)]+)\)$/);
            return {
                value: name,
                label,
                haystack: normalise(label + " " + extra),
                code: match ? normalise(match[1]) : ""
            };
        }).sort((a, b) => a.value.localeCompare(b.value, "en", { sensitivity: "base" }));
    }

    const SHORT_CODES = new Set(
        Object.values(SHORT).map(value => value[0].toLowerCase())
            .concat(LEVELS.map(level => level[1].toLowerCase()))
    );

    function search(index, query) {
        const q = normalise(query);
        if (!q) return index;
        const compact = q.replace(/ /g, "");
        if (compact.length < 3 && SHORT_CODES.has(q)) {
            return index.filter(item => item.code === q);
        }
        const tokens = q.split(" ");
        return index.filter(item => tokens.every(token => item.haystack.includes(token)));
    }

    const core = { labelOf, buildIndex, search, normalise };
    if (typeof module !== "undefined" && module.exports) module.exports = core;
    if (typeof document === "undefined" || typeof SUBJECTS === "undefined") return;

    const INDEX = buildIndex(SUBJECTS);

    function takenByOthers(select) {
        return new Set([...document.querySelectorAll('select[name="subject"]')]
            .filter(other => other !== select)
            .map(other => other.value)
            .filter(Boolean));
    }

    function enhance(select) {
        if (select.dataset.picker) return;
        select.dataset.picker = "1";

        const input = document.createElement("input");
        input.type = "text";
        input.id = select.id + "-search";
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", select.id + "-suggestions");
        input.setAttribute("aria-label", "Subject for " + select.id.replace("subject-", "row "));
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocapitalize", "off");
        input.spellcheck = false;
        input.placeholder = "Choose or search for a subject";
        input.value = select.value;

        const list = document.createElement("ul");
        list.id = select.id + "-suggestions";
        list.className = "sp-suggestions";
        list.setAttribute("role", "listbox");
        list.hidden = true;

        const status = document.createElement("p");
        status.className = "form-note sp-search-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");

        const wrap = document.createElement("div");
        wrap.className = "sp-wrap";
        wrap.append(input, list, status);

        const label = document.querySelector('label[for="' + select.id + '"]');
        if (label) label.htmlFor = input.id;
        if (label) label.insertAdjacentElement("afterend", wrap);
        else select.insertAdjacentElement("beforebegin", wrap);

        select.classList.add("sp-native-select");
        select.setAttribute("aria-hidden", "true");
        select.tabIndex = -1;

        let activeIndex = -1;
        let shownItems = [];

        function closeSuggestions(restoreSelection) {
            list.hidden = true;
            input.setAttribute("aria-expanded", "false");
            input.removeAttribute("aria-activedescendant");
            activeIndex = -1;
            if (restoreSelection) input.value = select.value;
        }

        function setActive(index) {
            const options = [...list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')];
            if (!options.length) {
                activeIndex = -1;
                input.removeAttribute("aria-activedescendant");
                return;
            }
            activeIndex = Math.max(0, Math.min(index, options.length - 1));
            options.forEach((option, optionIndex) => {
                option.classList.toggle("is-active", optionIndex === activeIndex);
            });
            input.setAttribute("aria-activedescendant", options[activeIndex].id);
            options[activeIndex].scrollIntoView({ block: "nearest" });
        }

        function choose(item) {
            if (takenByOthers(select).has(item.value)) return;
            select.value = item.value;
            input.value = item.value;
            closeSuggestions(false);
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }

        function render(query) {
            const taken = takenByOthers(select);
            shownItems = search(INDEX, query);
            list.replaceChildren();
            shownItems.forEach((item, index) => {
                const option = document.createElement("li");
                option.id = select.id + "-suggestion-" + index;
                option.setAttribute("role", "option");
                option.setAttribute("aria-selected", String(item.value === select.value));
                if (taken.has(item.value)) option.setAttribute("aria-disabled", "true");
                option.textContent = item.value;
                option.addEventListener("pointerdown", event => {
                    event.preventDefault();
                    if (!taken.has(item.value)) choose(item);
                });
                list.appendChild(option);
            });
            list.hidden = false;
            input.setAttribute("aria-expanded", "true");
            input.removeAttribute("aria-activedescendant");
            activeIndex = -1;
            status.textContent = shownItems.length
                ? shownItems.length + (shownItems.length === 1 ? " subject suggestion." : " subject suggestions.")
                : "No subjects found.";
        }

        input.addEventListener("focus", () => {
            const query = input.value === select.value ? "" : input.value;
            render(query);
            input.select();
        });
        input.addEventListener("click", () => {
            if (list.hidden) render(input.value === select.value ? "" : input.value);
        });
        input.addEventListener("input", () => render(input.value));
        input.addEventListener("keydown", event => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                if (list.hidden) render(input.value);
                setActive(activeIndex + 1);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive(activeIndex <= 0 ? 0 : activeIndex - 1);
            } else if (event.key === "Enter" && !list.hidden) {
                event.preventDefault();
                if (activeIndex >= 0) {
                    const options = [...list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')];
                    const active = options[activeIndex];
                    const item = active && shownItems.find(candidate => candidate.value === active.textContent);
                    if (item) choose(item);
                } else if (shownItems.length === 1) {
                    choose(shownItems[0]);
                }
            } else if (event.key === "Escape" && !list.hidden) {
                event.preventDefault();
                closeSuggestions(true);
            }
        });
        input.addEventListener("blur", () => {
            closeSuggestions(true);
        });
        select.addEventListener("change", () => {
            input.value = select.value;
            document.querySelectorAll('select[name="subject"]').forEach(other => {
                if (other !== select && other.dataset.picker) {
                    other.dispatchEvent(new Event("picker-refresh"));
                }
            });
        });
        select.addEventListener("picker-refresh", () => {
            if (!list.hidden) render(input.value === select.value ? "" : input.value);
        });
    }

    function enhanceAll() {
        document.querySelectorAll('select[name="subject"]').forEach(enhance);
    }

    enhanceAll();
    const rows = document.getElementById("rows");
    if (rows) new MutationObserver(enhanceAll).observe(rows, { childList: true });
})();
