import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import {
    choose,
    clickStage,
    dismissRuffleWarning,
    download,
    jpegSize,
    pngSize,
    SPOT,
    waitForParts,
} from "./stage";

const FIXTURE = fileURLToPath(new URL("fixtures/avatar.kao", import.meta.url));

test("creates an avatar, exports a 1440px PNG and resumes editing", async ({ page }) => {
    const engine = page.waitForRequest((r) => r.url().includes("engine.swf?vF=2&vL=en"));
    await page.goto("/");
    await engine;
    await page.waitForResponse((r) => r.url().endsWith("library/colors.xml"));
    await page.waitForTimeout(3000);

    // The first click only activates the player
    await clickStage(page, SPOT.blank);
    await clickStage(page, SPOT.right);
    await waitForParts(page, "f");

    await clickStage(page, SPOT.save);
    await page.waitForTimeout(3000);
    await clickStage(page, SPOT.nameField);
    await page.keyboard.type("E2E Avatar", { delay: 50 });
    await clickStage(page, SPOT.nameSubmit);

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "E2E Avatar" })).toBeVisible();

    await expect(dialog.getByRole("link", { name: "Download image" })).toBeFocused();

    const image = await download(page, dialog.getByRole("link", { name: "Download image" }));
    expect(image.name).toBe("e2e-avatar-1440px.png");
    expect(pngSize(image.data)).toEqual({ width: 1440, height: 1440 });

    const code = await download(page, dialog.getByRole("button", { name: "Download code" }));
    expect(code.name).toBe("e2e-avatar.kao");
    const saved = JSON.parse(code.data.toString());
    expect(saved).toMatchObject({ app: "kao", version: 1, name: "E2E Avatar" });
    expect(saved.ida).toMatch(/^f.*:/);

    const resumed = page.waitForRequest((r) => r.url().includes("engine.swf?vF=4"));
    await dialog.getByRole("button", { name: "Resume editing" }).click();
    expect((await resumed).url()).toContain(`vIDA=${saved.ida}`);

    const history = page.getByRole("region", { name: "My avatars" });
    await expect(history.getByRole("listitem")).toHaveCount(1);
    await expect(history.getByRole("button", { name: "Edit E2E Avatar" })).toBeVisible();
});

test("opens a .kao file and exports a 720px JPEG", async ({ page }) => {
    await page.goto("/");
    await page.waitForResponse((r) => r.url().endsWith("library/colors.xml"));

    await choose(page, "Size", "720 px");
    await choose(page, "Format", "JPEG");

    const resumed = page.waitForRequest((r) => r.url().includes("engine.swf?vF=4"));
    await page
        .getByRole("region", { name: "Avatar codes" })
        .locator('input[type="file"]')
        .setInputFiles(FIXTURE);
    await resumed;
    await waitForParts(page, "f");
    await dismissRuffleWarning(page);

    // In edit mode the engine saves directly, without the name form
    await clickStage(page, SPOT.blank);
    await clickStage(page, SPOT.save);

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Test Avatar" })).toBeVisible();

    const image = await download(page, dialog.getByRole("link", { name: "Download image" }));
    expect(image.name).toBe("test-avatar-720px.jpg");
    expect(jpegSize(image.data)).toEqual({ width: 720, height: 720 });
});
