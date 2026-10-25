const { defineConfig } = require("@playwright/test");

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

module.exports = defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    timeout: 120_000,
    retries: process.env.CI ? 1 : 0,
    reporter: "list",
    use: {
        baseURL: externalBaseUrl || "http://127.0.0.1:8080",
        browserName: "chromium",
        headless: true
    },
    webServer: externalBaseUrl ? undefined : {
        command: "mvn spring-boot:run",
        url: "http://127.0.0.1:8080",
        env: {
            SPRING_DATASOURCE_URL: "jdbc:h2:mem:ukhanyiso-playwright;DB_CLOSE_DELAY=-1"
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
