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
