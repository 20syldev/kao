import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import { choose, download } from "./stage";

const BACKUP = fileURLToPath(new URL("fixtures/avatars.json", import.meta.url));

test("rejects an invalid avatar code", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Paste a code" }).click();

    const dialog = page.getByRole("dialog", { name: "Paste an avatar code" });
    await dialog.getByLabel("Avatar code").fill("not a code");
    await dialog.getByRole("button", { name: "Open" }).click();

    await expect(dialog.getByRole("alert")).toHaveText("This is not a valid avatar code.");
});

test("serves French under /fr/ and starts the editor in French", async ({ page }) => {
    const engine = page.waitForRequest((r) => r.url().includes("engine.swf?vF=2&vL=fr"));
    await page.goto("/fr/");

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { name: "Éditeur" })).toBeVisible();
    await engine;
});

test("covers the editor with a loader until the engine has started", async ({ page }) => {
    await page.goto("/");

    const loader = page.getByRole("status").filter({ hasText: "Loading the editor" });
    await expect(loader).toBeVisible();
    await expect(loader).toBeHidden();
    await expect(page.getByRole("application")).toHaveAttribute("aria-busy", "false");
});

test("shows the editor fullscreen and back", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Fullscreen", exact: true }).click();

    const exit = page.getByRole("button", { name: "Exit fullscreen" }).last();
    await expect(exit).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);

    const stage = page.getByRole("application");
    const box = await stage.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.round(box?.width ?? 0)).toBe(viewport?.width);
    expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - 900 / 520)).toBeLessThan(0.01);

    await exit.click();
    await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
});

test("remembers the export size and format between visits", async ({ page }) => {
    await page.goto("/");
    await choose(page, "Size", "720 px");
    await choose(page, "Format", "JPEG");
    await page.reload();

    await expect(page.getByRole("combobox", { name: "Size" })).toHaveText("720 px");
    await expect(page.getByRole("combobox", { name: "Format" })).toHaveText("JPEG");
});

test("backs up and restores the avatar history", async ({ page }) => {
    await page.goto("/");

    const history = page.getByRole("region", { name: "My avatars" });
    const restore = page.locator('[data-slot="history-import"]');
    await expect(
        history.getByRole("button", { name: "Save a backup of my avatars" }),
    ).toBeDisabled();

    await restore.setInputFiles(BACKUP);
    await expect(page.getByText("2 avatars restored")).toBeVisible();
    await expect(history.getByRole("listitem")).toHaveCount(2);

    const backup = await download(
        page,
        history.getByRole("button", { name: "Save a backup of my avatars" }),
    );
    expect(backup.name).toBe("kao-avatars.json");
    expect(JSON.parse(backup.data.toString()).avatars).toHaveLength(2);

    await restore.setInputFiles(BACKUP);
    await expect(page.getByText("No new avatar")).toBeVisible();
    await expect(history.getByRole("listitem")).toHaveCount(2);
});

test("toggles the dark theme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle theme" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
});

test("shows the 404 page for unknown routes", async ({ page }) => {
    const response = await page.goto("/missing/");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
