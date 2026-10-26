const { test, expect } = require("@playwright/test");

test("home page opens the login screen and sign-up page", async ({ page }) => {
    const homeResponse = await page.goto("/");
    expect(homeResponse?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    await expect(page.locator("#auth-form")).toBeVisible();

    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup\.html$/);
    await expect(page.getByRole("heading", { name: "Create your Ukhanyiso account" })).toBeVisible();
    await expect(page.locator("#auth-form")).toBeVisible();
});

test("signed-out navigation shows login and sign-up", async ({ page }) => {
    await page.route("**/api/auth/me", route => route.fulfill({ status: 401 }));
    await page.goto("/login.html");

    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Sign up" })).toBeVisible();
    await expect(navigation.getByRole("button", { name: "Sign out" })).toBeHidden();
});

test("sign out stays hidden until the session check confirms a signed-in user", async ({ page }) => {
    let finishSessionCheck;
    const sessionCheck = new Promise(resolve => {
        finishSessionCheck = resolve;
    });
    await page.route("**/api/auth/me", async route => {
        await sessionCheck;
        await route.fulfill({ status: 401 });
    });
    await page.goto("/calendar.html");

    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation.getByRole("button", { name: "Sign out" })).toBeHidden();
    finishSessionCheck();
    await expect(navigation.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Sign up" })).toBeVisible();
});

test("navigation refreshes its links when the session changes", async ({ page }) => {
    let signedIn = false;
    await page.route("**/api/auth/me", route => route.fulfill(signedIn ? {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "learner@example.invalid", csrfToken: "test-csrf-token" })
    } : { status: 401 }));
    await page.goto("/calendar.html");

    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(navigation.getByRole("button", { name: "Sign out" })).toBeHidden();

    signedIn = true;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(navigation.getByRole("link", { name: "Log in" })).toBeHidden();
    await expect(navigation.getByRole("link", { name: "Sign up" })).toBeHidden();
    await expect(navigation.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("signed-in navigation shows sign out instead of login and sign-up", async ({ page }) => {
    await page.route("**/api/auth/me", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "learner@example.invalid", csrfToken: "test-csrf-token" })
    }));
    await page.goto("/login.html");

    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation.getByRole("link", { name: "Log in" })).toBeHidden();
    await expect(navigation.getByRole("link", { name: "Sign up" })).toBeHidden();
    await expect(navigation.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("Study Plan navigation is visibly selected on its page and keyboard-focusable", async ({ page }) => {
    await page.route("**/api/auth/me", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "learner@example.invalid", csrfToken: "test-csrf-token" })
    }));
    await page.route("**/api/auth/profile", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            firstName: "Learner",
            surname: "Test",
            contactEmail: "learner@example.invalid",
            whatsapp: "0000000000"
        })
    }));
    await page.goto("/study.html");

    const studyLink = page.getByRole("link", { name: "Study Plan" });
    await expect(studyLink).toHaveAttribute("aria-current", "page");
    for (let tab = 0; tab < 7; tab++) await page.keyboard.press("Tab");
    await expect(studyLink).toBeFocused();
    await expect(studyLink).toHaveCSS("outline-style", "solid");
});

test("sign out uses the logout endpoint with the session CSRF token", async ({ page }) => {
    await page.route("**/api/auth/me", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "learner@example.invalid", csrfToken: "test-csrf-token" })
    }));
    await page.route("**/api/auth/logout", route => route.fulfill({ status: 200 }));
    await page.goto("/calendar.html");

    const logoutRequest = page.waitForRequest("**/api/auth/logout");
    await page.getByRole("button", { name: "Sign out" }).click();
    const request = await logoutRequest;
    expect(request.method()).toBe("POST");
    expect(request.headers()["x-csrf-token"]).toBe("test-csrf-token");
    await expect(page).toHaveURL(/\/login\.html$/);
});

test("marks load from the account and subject search keeps selections and prevents duplicates", async ({ page }) => {
    await page.route("**/api/auth/me", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ username: "learner@example.invalid", csrfToken: "test-csrf-token" })
    }));
    await page.route("**/api/auth/profile", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            firstName: "Learner",
            surname: "Test",
            contactEmail: "learner@example.invalid",
            whatsapp: "0000000000"
        })
    }));
    await page.route("**/api/marks", route => route.request().method() === "GET"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                csrfToken: "test-csrf-token",
                marks: [{ subject: "Mathematics", mark: 70 }]
            })
        })
        : route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
    await page.goto("/start.html");

    await expect(page.locator("#subject-1")).toHaveValue("Mathematics");
    const allSubjectOptions = await page.locator("#subject-1 option").count();
    const subjectNames = await page.locator("#subject-1 option").evaluateAll(options =>
        options.slice(1).map(option => option.textContent));
    expect(subjectNames).toEqual([...subjectNames].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    const firstSearch = page.locator("#subject-1-search");
    await firstSearch.focus();
    await expect(page.locator("#subject-1-suggestions [role='option']")).toHaveCount(allSubjectOptions - 1);
    await firstSearch.fill("geog");
    await expect(page.locator("#subject-1-suggestions [role='option']")).toHaveCount(1);
    await expect(page.locator("#subject-1")).toHaveValue("Mathematics");
    await expect(page.locator("#subject-1-suggestions [role='option']").first()).toHaveText("Geography");
    await firstSearch.press("Escape");
    await expect(firstSearch).toHaveValue("Mathematics");
    await firstSearch.fill("");
    await expect(page.locator("#subject-1-suggestions [role='option']")).toHaveCount(allSubjectOptions - 1);

    const secondSearch = page.locator("#subject-2-search");
    await secondSearch.fill("account");
    await page.locator("#subject-2-suggestions [role='option']").filter({ hasText: /^Accounting$/ }).click();
    await expect(page.locator("#subject-2")).toHaveValue("Accounting");
    await secondSearch.fill("econom");
    await secondSearch.press("ArrowDown");
    await secondSearch.press("Enter");
    await expect(page.locator("#subject-2")).toHaveValue("Economics");
    await secondSearch.fill("account");
    await page.locator("#subject-2-suggestions [role='option']").filter({ hasText: /^Accounting$/ }).click();
    await expect(page.locator("#subject-2")).toHaveValue("Accounting");
    const saveRequest = page.waitForRequest(request =>
        request.url().endsWith("/api/marks") && request.method() === "PUT");
    await page.locator("#mark-2").fill("90");
    const request = await saveRequest;
    expect(request.headers()["x-csrf-token"]).toBe("test-csrf-token");
    expect(request.postDataJSON().marks).toEqual([
        { subject: "Mathematics", mark: "70" },
        { subject: "Accounting", mark: "90" }
    ]);

    const thirdSearch = page.locator("#subject-3-search");
    await thirdSearch.fill("math");
    await expect(page.locator("#subject-3-suggestions [role='option']").filter({ hasText: /^Mathematics$/ }))
        .toHaveAttribute("aria-disabled", "true");
    await expect(page.locator("#subject-3-suggestions [role='option']").filter({ hasText: /^Mathematical Literacy$/ }))
        .toHaveCount(1);
});
