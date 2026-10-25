(function () {
    "use strict";

    const form = document.getElementById("auth-form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmation = document.getElementById("confirm-password");
    const submit = document.getElementById("submit");
    const message = document.getElementById("message");
    const mode = form.dataset.mode;
    let csrfToken = "";

    function showError(text) {
        message.textContent = text;
    }

    function validateSignupPassword() {
        if (mode !== "signup") return;
        if (password.value.length > 128) {
            password.setCustomValidity("Use no more than 128 characters.");
        } else if (password.value.length > 0 && password.value.length < 12) {
            password.setCustomValidity("Use at least 12 characters. A unique passphrase is okay.");
        } else {
            password.setCustomValidity("");
        }
    }

    async function loadCsrfToken() {
        try {
            const response = await fetch("/api/auth/csrf", { credentials: "same-origin" });
            if (!response.ok) throw new Error("csrf");
            const data = await response.json();
            csrfToken = data.csrfToken;
            submit.disabled = false;
        } catch (error) {
            showError("We could not prepare secure sign-in. Refresh the page and try again.");
        }
    }

    if (confirmation) {
        confirmation.addEventListener("input", () => {
            confirmation.setCustomValidity(
                confirmation.value === password.value ? "" : "The passwords do not match.");
        });
        password.addEventListener("input", () => {
            confirmation.setCustomValidity(
                confirmation.value === password.value ? "" : "The passwords do not match.");
        });
    }

    password.addEventListener("input", validateSignupPassword);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        message.textContent = "";
        if (!csrfToken) {
            showError("Secure sign-in is not ready. Refresh the page and try again.");
            return;
        }
        validateSignupPassword();
        if (!form.reportValidity()) return;
        if (confirmation && password.value !== confirmation.value) {
            showError("The passwords do not match.");
            confirmation.focus();
            return;
        }

        submit.disabled = true;
        submit.textContent = mode === "signup" ? "Creating account…" : "Logging in…";
        try {
            const response = await fetch("/api/auth/" + mode, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value
                })
            });
            if (response.ok) {
                ["ukhanyiso-marks", "ukhanyiso-results", "ukhanyiso-showing-all-courses",
                    "ukhanyiso-stage", "ukhanyiso-showcase"].forEach(key => sessionStorage.removeItem(key));
                location.assign("/");
                return;
            }
            if (response.status === 409) {
                showError("That username is already in use. Choose another one or log in.");
            } else if (response.status === 401) {
                showError("The username or password is incorrect.");
            } else if (response.status === 400) {
                showError(mode === "signup"
                    ? "Check your username (3–50 letters, numbers, underscores or hyphens) and use a password of 12–128 characters."
                    : "Check your username and password, then try again.");
            } else if (response.status === 429) {
                showError("Too many attempts. Wait a minute, then try again.");
            } else {
                showError("We could not complete sign-in. Please try again.");
            }
        } catch (error) {
            showError("We could not reach the sign-in service. Please try again.");
        } finally {
            submit.disabled = false;
            submit.textContent = mode === "signup" ? "Create account" : "Log in";
        }
    });

    submit.disabled = true;
    loadCsrfToken();
})();
