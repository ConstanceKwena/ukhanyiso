(function () {
    "use strict";

    const authForm = document.getElementById("auth-form");
    const forgotForm = document.getElementById("forgot-form");
    const resetForm = document.getElementById("reset-form");
    const forgotLink = document.getElementById("forgot-link");

    function only(form) {
        [authForm, forgotForm, resetForm].forEach(f => { f.hidden = f !== form; });
    }

    if (forgotLink) {
        forgotLink.addEventListener("click", () => only(forgotForm));
        document.getElementById("forgot-cancel").addEventListener("click", () => only(authForm));
        document.getElementById("reset-cancel").addEventListener("click", () => only(authForm));

        async function csrfToken() {
            const response = await fetch("/api/auth/csrf", { credentials: "same-origin" });
            if (!response.ok) throw new Error("csrf");
            return (await response.json()).csrfToken;
        }

        forgotForm.addEventListener("submit", async event => {
            event.preventDefault();
            const message = document.getElementById("forgot-message");
            const submit = document.getElementById("forgot-submit");
            message.textContent = "";
            try {
                const token = await csrfToken();
                submit.disabled = true;
                submit.textContent = "Sending…";
                // The server answers the same way whether or not the account exists.
                const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                    body: JSON.stringify({ email: document.getElementById("recovery-email").value })
                });
                if (response.ok) {
                    message.textContent = "If that email is linked to an account, a one-time reset code has been sent. " +
                        "In this prototype the code appears in the application log.";
                    message.className = "form-note";
                    only(resetForm);
                } else {
                    message.textContent = "We could not start the reset. Refresh the page and try again.";
                }
            } catch (error) {
                message.textContent = "We could not reach the reset service. Please try again.";
            } finally {
                submit.disabled = false;
                submit.textContent = "Send reset link";
            }
        });

        resetForm.addEventListener("submit", async event => {
            event.preventDefault();
            const message = document.getElementById("reset-message");
            const submit = document.getElementById("reset-submit");
            message.textContent = "";
            if (!resetForm.reportValidity()) return;
            try {
                const token = await csrfToken();
                submit.disabled = true;
                submit.textContent = "Saving…";
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                    body: JSON.stringify({
                        token: document.getElementById("reset-token").value.trim(),
                        newPassword: document.getElementById("new-password").value
                    })
                });
                if (response.ok) {
                    message.textContent = "Your password has been changed. You can log in with the new password now.";
                    message.className = "form-note";
                    only(authForm);
                    resetForm.reset();
                } else if (response.status === 400) {
                    message.textContent = "That reset code is invalid or has expired. Request a new one.";
                } else {
                    message.textContent = "We could not reset the password. Please try again.";
                }
            } catch (error) {
                message.textContent = "We could not reach the reset service. Please try again.";
            } finally {
                submit.disabled = false;
                submit.textContent = "Set new password";
            }
        });
    }
})();
