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

    form.addEventListener("submit", async event => {
        event.preventDefault();
        message.textContent = "";
        if (!csrfToken) {
            showError("Secure sign-in is not ready. Refresh the page and try again.");
            return;
        }
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
                if (mode === "signup") {
                    const recoveryEmail = document.getElementById("recovery-email");
                    if (recoveryEmail && recoveryEmail.value) {
                        try {
                            await fetch("/api/auth/recovery-email", {
                                method: "PUT",
                                credentials: "same-origin",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-CSRF-Token": (await response.json()).csrfToken
                                },
                                body: JSON.stringify({ email: recoveryEmail.value })
                            });
                        } catch (ignored) {
                            // Recovery email is optional; the account itself was created.
                        }
                    }
                }
                location.assign("/");
                return;
            }
            if (response.status === 409) {
                showError("That username is already in use. Choose another one or log in.");
            } else if (response.status === 401) {
                showError("The username or password is incorrect.");
            } else if (response.status === 400) {
                showError("Use a valid username and a password of at least 12 characters.");
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
