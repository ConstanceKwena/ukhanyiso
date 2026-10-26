    const list = document.getElementById("list");
    const summary = document.getElementById("summary");
    const message = document.getElementById("message");
    let csrf = "";
    let progress = {};
    let items = [];
    function el(tag, text, className) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined && text !== null) e.textContent = (window.Site && window.Site.t) ? window.Site.t(text) : text;
        return e;
    }

    function updateSummary() {
        const done = items.filter(i => progress[i.id]).length;
        summary.textContent = `${done} of ${items.length} steps done`;
    }

    function showError(text, retry) {
        message.textContent = text + " ";
        if (retry) {
            const b = el("button", "Try again", "secondary");
            b.type = "button";
            b.onclick = retry;
            message.appendChild(b);
        }
    }

    function render() {
        list.textContent = "";
        items.forEach(item => {
            const card = el("article", null, "card");
            const label = document.createElement("label");
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!progress[item.id];
            cb.onchange = () => save(item, cb);
            label.append(cb, " " + item.label);
            card.appendChild(label);
            list.appendChild(card);
        });
        updateSummary();
    }

    async function save(item, cb) {
        const wanted = cb.checked;
        message.textContent = "";
        message.className = "error";
        cb.disabled = true;
        try {
            const res = await fetch("/api/checklist", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
                body: JSON.stringify({ itemId: item.id, completed: wanted })
            });
            if (res.status === 401) { location.href = "/login.html"; return; }
            if (!res.ok) throw new Error("bad status");
            const data = await res.json();
            csrf = data.csrfToken;
            progress = data.progress;
            updateSummary();
            message.className = "form-note";
            message.textContent = "Checklist progress saved to your account.";
        } catch (err) {
            cb.checked = !wanted;
            showError("We could not save that change.");
        } finally {
            cb.disabled = false;
        }
    }

    async function load() {
        message.textContent = "";
        list.textContent = "Loading your checklist…";
        try {
            let res = await fetch("/api/checklist");
            if (res.status === 401) { location.href = "/login.html"; return; }
            if (!res.ok) throw new Error("bad status");
            const data = await res.json();
            items = data.items;
            progress = data.progress;
            csrf = data.csrfToken;
            render();
        } catch (err) {
            list.textContent = "";
            summary.textContent = "";
            showError(err && err.message ? err.message : "We could not load your checklist.", load);
        }
    }

    load();
