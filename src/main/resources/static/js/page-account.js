    (async () => {
        const t = s => (window.Site && window.Site.t) ? window.Site.t(s) : s;
        const accountStatus = document.getElementById("account-status");
        try {
            const response = await fetch("/api/auth/me", { credentials: "same-origin" });
            if (response.status === 401) {
                location.assign("/login.html");
                return;
            }
            if (!response.ok) throw new Error("Account information could not be loaded.");
            const account = await response.json();
            accountStatus.textContent = t("Signed in as ") + account.username + ".";
            accountStatus.dataset.email = account.username;
        } catch (error) {
            accountStatus.textContent = "Could not load your account. Refresh the page and try again.";
            accountStatus.className = "error";
        }

        // Load and save the required profile details.
        const profileForm = document.getElementById("profile-form");
        const profileStatus = document.getElementById("profile-status");
        let profileWasComplete = false;
        try {
            const response = await fetch("/api/auth/profile", { credentials: "same-origin" });
            if (response.ok) {
                const profile = await response.json();
                document.getElementById("first-name").value = profile.firstName || "";
                document.getElementById("surname").value = profile.surname || "";
                document.getElementById("contact-email").value = profile.contactEmail || accountStatus.dataset.email || "";
                document.getElementById("whatsapp").value = profile.whatsapp || "";
                document.getElementById("whatsapp-opt-in").checked = Boolean(profile.whatsappOptIn);
                profileWasComplete = Boolean(profile.firstName && profile.surname
                    && profile.contactEmail);
                const fullName = [profile.firstName, profile.surname].filter(Boolean).join(" ");
                if (fullName && accountStatus.dataset.email) {
                    accountStatus.textContent = t("Signed in as ") + fullName + " (" + accountStatus.dataset.email + ").";
                }
                if (!profileWasComplete) {
                    profileStatus.textContent = t("Please complete the required details to continue.");
                }
            }
        } catch (error) {
            // Profile stays empty; saving still works.
        }
        profileForm.addEventListener("submit", async event => {
            event.preventDefault();
            profileStatus.textContent = "";
            if (!profileForm.reportValidity()) return;
            try {
                const me = await fetch("/api/auth/me", { credentials: "same-origin" });
                if (!me.ok) throw new Error("not signed in");
                const token = (await me.json()).csrfToken;
                const response = await fetch("/api/auth/profile", {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                    body: JSON.stringify({
                        firstName: document.getElementById("first-name").value,
                        surname: document.getElementById("surname").value,
                        contactEmail: document.getElementById("contact-email").value,
                        whatsapp: document.getElementById("whatsapp").value,
                        whatsappOptIn: document.getElementById("whatsapp-opt-in").checked
                    })
                });
                if (response.ok) {
                    profileStatus.textContent = "Profile saved.";
                    profileStatus.className = "form-note";
                    if (!profileWasComplete) {
                        location.assign("/");
                        return;
                    }
                } else if (response.status === 400) {
                    profileStatus.textContent = "Fill in the required fields. Names take letters, spaces, hyphens and apostrophes; the number takes digits only.";
                    profileStatus.className = "error";
                } else {
                    profileStatus.textContent = "We could not save your profile. Please try again.";
                    profileStatus.className = "error";
                }
            } catch (error) {
                profileStatus.textContent = "We could not reach the account service. Please try again.";
                profileStatus.className = "error";
            }
        });

        const reminderSummary = document.getElementById("reminder-summary");
        try {
            const reminders = JSON.parse(localStorage.getItem("ukhanyiso-reminders-v1") || "[]");
            const count = Array.isArray(reminders) ? reminders.length : 0;
            reminderSummary.textContent = count + (count === 1
                ? " reminder saved in this browser."
                : " reminders saved in this browser.");
        } catch (error) {
            reminderSummary.textContent = "This browser could not read the local reminders.";
            reminderSummary.className = "error";
        }
    })();
