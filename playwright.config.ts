import { defineConfig } from "@playwright/test";

// Neither the dev (7711) nor the start (7712) port, so a running app never shares its avatar
// history with the tests
const PORT = 7713;

export default defineConfig({
    testDir: "tests",
    timeout: 180_000,
    expect: { timeout: 60_000 },
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: `http://127.0.0.1:${PORT}/`,
        channel: "chrome",
        locale: "en-US",
        viewport: { width: 1440, height: 1000 },
        acceptDownloads: true,
        trace: "retain-on-failure",
        launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
    },
    webServer: {
        command: `npx serve out --no-clipboard -l tcp://127.0.0.1:${PORT}`,
        url: `http://127.0.0.1:${PORT}/MAIN.swf`,
        reuseExistingServer: !process.env.CI,
    },
});
