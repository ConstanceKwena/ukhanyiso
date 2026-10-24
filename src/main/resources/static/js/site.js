
(function () {
    const LANGS = { en: "English", zu: "isiZulu", xh: "isiXhosa", st: "Sesotho", af: "Afrikaans" };
    // Add translations per language. A native speaker must check each one.
    // Any missing key falls back to English.
    const TEXT = {
        en: { skip: "Skip to main content", language: "Language", listen: "Listen", loaded: "{n} bursaries loaded" },
        zu: {}, xh: {}, st: {}, af: {}
    };
    let lang = "en";
    try { lang = localStorage.getItem("ukhanyiso-lang") || "en"; } catch (e) { }
    if (!LANGS[lang]) lang = "en";
    function t(key, vars) {
        let s = (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
        Object.keys(vars || {}).forEach(k => { s = s.replace("{" + k + "}", vars[k]); });
        return s;
    }
    function say(text) {
        const s = document.getElementById("status");
        if (s) s.textContent = text;
    }
    function listen(text) {
        if (!("speechSynthesis" in window)) return false;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        speechSynthesis.speak(u);
        return true;
    }
    window.Site = { t: t, say: say, listen: listen, lang: () => lang };
    document.documentElement.lang = lang;
    const style = document.createElement("style");
    style.textContent = ".skip{position:absolute;left:-999px}.skip:focus{left:0;top:0;padding:.5rem;background:#fff;z-index:9}";
    document.head.appendChild(style);
    const skip = document.createElement("a");
    skip.className = "skip";
    skip.href = "#main";
    skip.textContent = t("skip");
    document.body.prepend(skip);
    const main = document.querySelector("main");
    if (main) {
        main.id = "main";
        main.tabIndex = -1;
        if (!document.getElementById("status")) {
            const p = document.createElement("p");
            p.id = "status";
            p.className = "form-note";
            p.setAttribute("role", "status");
            main.prepend(p);
        }
    }
    const nav = document.querySelector("nav");
    if (nav) {
        const label = document.createElement("label");
        label.htmlFor = "lang";
        label.textContent = t("language") + " ";
        const select = document.createElement("select");
        select.id = "lang";
        Object.keys(LANGS).forEach(code => {
            const o = document.createElement("option");
            o.value = code;
            o.textContent = LANGS[code];
            o.selected = code === lang;
            select.appendChild(o);
        });
        select.onchange = () => {
            try { localStorage.setItem("ukhanyiso-lang", select.value); } catch (e) { }
            location.reload();
        };
        nav.append(label, select);
    }
})();
