/*
 * Learner stage option ("Where are you now?").
 * Grade 11 and in-year matric marks produce provisional results.
 * Learners who have finished matric can use their final marks.
 * The choice lives in sessionStorage only (it is cleared when the tab closes) and is never sent to the server.
 * The matching engine is not changed.
 */
(function () {
    "use strict";

    var KEY = "ukhanyiso-stage";
    var GRADE11 = "GRADE_11";
    var JUNE = "MATRIC_JUNE";
    var PRELIM = "MATRIC_PRELIM";
    var FINAL = "MATRIC_FINAL";

    var TEXT = {};
    TEXT[GRADE11] = {
        intro: "Enter your latest Grade 11 marks to explore courses and funding while you plan ahead.",
        note: "These are early planning estimates. Your Grade 12 subjects and final matric marks may change your options."
    };
    TEXT[JUNE] = {
        intro: "Enter your Grade 12 June exam marks to explore possible courses and funding.",
        note: "June marks are provisional estimates. Update your marks after later exams and again when your final results are released."
    };
    TEXT[PRELIM] = {
        intro: "Enter your Grade 12 trial or preliminary exam marks to explore possible courses and funding.",
        note: "Trial/preliminary marks are provisional estimates. Update your marks when your final matric results are released."
    };
    TEXT[FINAL] = {
        intro: "Enter your final matric (NSC) marks to see courses that meet their published minimum requirements.",
        note: "Type the marks from your results statement. Never enter your exam number or ID number here."
    };

    function getStage() {
        try {
            var s = sessionStorage.getItem(KEY);
            if (s === "GRADE_12") return PRELIM;
            if (s === "MATRIC") return FINAL;
            return Object.prototype.hasOwnProperty.call(TEXT, s) ? s : null;
        } catch (e) {
            return null;
        }
    }

    function setStage(s) {
        try { sessionStorage.setItem(KEY, s); } catch (e) { /* storage unavailable: the choice just isn't remembered */ }
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function addStyles() {
        if (document.getElementById("stage-style")) return;
        var style = document.createElement("style");
        style.id = "stage-style";
        style.textContent =
            ".stage-picker{border:1px solid var(--border,#d8e2dc);border-radius:12px;padding:12px 16px;margin:0 0 16px}" +
            ".stage-picker legend{font-weight:700;padding:0 6px}" +
            ".stage-picker label{display:flex;gap:10px;align-items:flex-start;padding:8px 0;cursor:pointer}" +
            ".stage-picker input{margin-top:4px}" +
            ".stage-picker .stage-note{margin:8px 0 0;color:var(--muted,#52635a)}" +
            ".provisional-banner{border:1px solid var(--green,#126b48);border-left-width:6px;border-radius:12px;padding:12px 16px;margin:0 0 16px}" +
            ".provisional-banner strong{display:block;margin-bottom:4px}";
        document.head.appendChild(style);
    }

    function marksPage(form) {
        addStyles();
        var stage = getStage();
        if (!stage) { stage = GRADE11; setStage(stage); }

        var fieldset = el("fieldset", "stage-picker");
        fieldset.appendChild(el("legend", null, "Where are you now?"));

        var note = el("p", "stage-note", "");
        note.id = "stage-note";
        note.setAttribute("aria-live", "polite");

        var heading = document.querySelector(".page-heading");
        var intro = null;
        if (heading) {
            var paragraphs = heading.querySelectorAll("p");
            for (var i = 0; i < paragraphs.length; i++) {
                if (paragraphs[i].className.indexOf("eyebrow") === -1) { intro = paragraphs[i]; break; }
            }
        }

        function apply(s) {
            note.textContent = TEXT[s].note;
            if (intro) intro.textContent = TEXT[s].intro;
        }

        [
            { value: GRADE11, label: "I'm in Grade 11 (I'll use my latest school report marks)" },
            { value: JUNE, label: "I'm in Grade 12 and have June exam marks" },
            { value: PRELIM, label: "I'm in Grade 12 and have trial/preliminary exam marks" },
            { value: FINAL, label: "I've finished matric and have my final results" }
        ].forEach(function (o) {
            var label = document.createElement("label");
            var input = document.createElement("input");
            input.type = "radio";
            input.name = "stage";
            input.value = o.value;
            input.checked = o.value === stage;
            input.addEventListener("change", function () {
                if (input.checked) { setStage(o.value); apply(o.value); }
            });
            label.appendChild(input);
            label.appendChild(document.createTextNode(o.label));
            fieldset.appendChild(label);
        });

        fieldset.appendChild(note);
        form.insertBefore(fieldset, form.firstChild);
        apply(stage);
    }

    function resultsPage(main) {
        var stage = getStage();
        if (stage !== GRADE11 && stage !== JUNE && stage !== PRELIM) return;
        if (document.getElementById("provisional-banner")) return;
        addStyles();
        var banner = el("section", "provisional-banner");
        banner.id = "provisional-banner";
        banner.setAttribute("role", "note");
        var notice = {
            GRADE_11: {
                heading: "Grade 11 planning estimates",
                message: "These estimates use your Grade 11 marks. Your subjects and marks may change before matric, and institutions may set their own application requirements."
            },
            MATRIC_JUNE: {
                heading: "Provisional June exam estimates",
                message: "These estimates use your June exam marks. Update them after later exams and when your final results are released. Check each institution's application rules."
            },
            MATRIC_PRELIM: {
                heading: "Provisional trial/preliminary estimates",
                message: "These estimates use your trial/preliminary marks and may change when your final results are released. Check each institution's application rules."
            }
        }[stage];
        banner.appendChild(el("strong", null, notice.heading));
        banner.appendChild(el("span", null, notice.message));
        var heading = main.querySelector(".page-heading");
        if (heading && heading.nextSibling) main.insertBefore(banner, heading.nextSibling);
        else main.insertBefore(banner, main.firstChild);
    }

    function init() {
        var form = document.getElementById("marks-form");
        if (form) { marksPage(form); return; }
        if (document.getElementById("list")) {
            var main = document.querySelector("main");
            if (main) resultsPage(main);
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
