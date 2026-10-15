import { readFile } from "node:fs/promises";

import { expect, type Page, test } from "@playwright/test";

import { clickStage, dismissRuffleWarning, SPOT } from "./stage";

// Regenerates the README visuals in docs/: KAO_SHOTS=1 npm run shots (see CONTRIBUTING.md)
test.skip(!process.env.KAO_SHOTS, "README screenshots are only generated on demand");

const SCHEMES = ["light", "dark"] as const;

// Corner radius of the README visuals, in pixels
const RADIUS = 16;

/**
 * Takes a screenshot of the page and rounds its corners: the image is drawn again in a blank page
 * with a border radius, then saved with a transparent background.
 *
 * @param page - Page to capture, which also provides the browser context for the rounding
 * @param path - File the PNG is written to
 * @param fullPage - Whether to capture the whole scrollable page instead of the viewport
 */
async function shoot(page: Page, path: string, fullPage: boolean) {
    await page.screenshot({ path, fullPage });

    const data = (await readFile(path)).toString("base64");
    const frame = await page.context().newPage();

    await frame.setContent(
        `<body style="margin:0;background:transparent"><img id="shot" alt="" style="display:block;border-radius:${RADIUS}px" src="data:image/png;base64,${data}"></body>`,
    );
    await frame.locator("#shot").screenshot({ path, omitBackground: true });
    await frame.close();
}

/**
 * Starts the editor from a blank stage and waits for the first parts to render. The click is
 * repeated when the engine was not ready to take it.
 *
 * @param page - Page showing the editor
 * @param family - Library folder of the avatar, "f" or "m"
 */
async function pickBase(page: Page, family: "f" | "m") {
    for (let attempt = 0; attempt < 4; attempt++) {
        const parts = page
            .waitForResponse((r) => r.url().endsWith(`library/${family}/01/01/01.swf`), {
                timeout: 20_000,
            })
            .then(() => true)
            .catch(() => false);

        // The first click only activates the player
        await clickStage(page, SPOT.blank);
        await clickStage(page, family === "f" ? SPOT.right : SPOT.left);

        if (await parts) {
            await page.waitForTimeout(4000);
            await dismissRuffleWarning(page);
            return;
        }
    }

    throw new Error(`parts of the "${family}" avatar never loaded`);
}

/**
 * Presses SAVE in the editor and types the avatar name in the engine form.
 *
 * @param page - Page showing the editor
 * @param name - Name given to the avatar
 */
async function saveAs(page: Page, name: string) {
    await clickStage(page, SPOT.save);
    await page.waitForTimeout(3000);
    await clickStage(page, SPOT.nameField);
    await page.keyboard.type(name, { delay: 50 });
    await clickStage(page, SPOT.nameSubmit);
    await expect(page.getByRole("dialog").getByRole("heading", { name })).toBeVisible();
}

/**
 * Closes the result dialog and restarts the editor on a blank avatar.
 *
 * @param page - Page showing the editor
 */
async function startOver(page: Page) {
    await page.keyboard.press("Escape");

    const engine = page.waitForRequest((r) => r.url().includes("engine.swf?vF=2"));
    await page.getByRole("button", { name: "New avatar" }).click();
    await engine;
    await page.waitForTimeout(8000);
}

for (const scheme of SCHEMES) {
    test.describe(scheme, () => {
        test.use({ colorScheme: scheme });

        test(`captures the ${scheme} visuals`, async ({ page }) => {
            await page.goto("/");
            await page.waitForResponse((r) => r.url().endsWith("library/colors.xml"));
            await page.waitForTimeout(3000);

            await pickBase(page, "f");
            await saveAs(page, "Aiko");
            await page.waitForTimeout(800);
            await shoot(page, `docs/export-${scheme}.png`, false);

            await startOver(page);
            await pickBase(page, "m");
            await saveAs(page, "Ren");

            await startOver(page);
            await pickBase(page, "f");
            await expect(page.getByRole("region", { name: "My avatars" })).toContainText("Aiko");
            await page.mouse.move(0, 0);
            await shoot(page, `docs/editor-${scheme}.png`, true);
        });
    });
}
