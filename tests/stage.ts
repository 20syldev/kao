import { readFile } from "node:fs/promises";

import { expect, type Locator, type Page } from "@playwright/test";

// Points of interest in Flash stage coordinates (900 by 520)
export const SPOT = {
    blank: [60, 440],
    right: [554, 252],
    left: [352, 252],
    save: [825, 52],
    nameField: [467, 213],
    nameSubmit: [467, 275],
} as const;

/**
 * Clicks a point of the Flash stage, slowly enough for Ruffle to register it.
 *
 * @param page - Page showing the editor
 * @param spot - Stage coordinates, see SPOT
 */
export async function clickStage(page: Page, spot: readonly [number, number]) {
    const [x, y] = spot;
    const box = await page.getByRole("application").boundingBox();

    if (!box) throw new Error("editor not visible");

    await page.mouse.move(box.x + (x / 900) * box.width, box.y + (y / 520) * box.height, {
        steps: 5,
    });
    await page.waitForTimeout(400);
    await page.mouse.down();
    await page.waitForTimeout(120);
    await page.mouse.up();
}

/**
 * Closes the performance warning Ruffle shows when the GPU is software-only, as on CI runners.
 *
 * @param page - Page showing the editor
 */
export async function dismissRuffleWarning(page: Page) {
    const close = page.locator("#hardware-acceleration-modal:not(.hidden) .close-modal");

    if (await close.isVisible()) await close.click();
}

/**
 * Waits until the editor has loaded the default parts of an avatar.
 *
 * @param page - Page showing the editor
 * @param family - Library folder of the avatar, "f" or "m"
 */
export async function waitForParts(page: Page, family: "f" | "m") {
    await page.waitForResponse((r) => r.url().endsWith(`library/${family}/01/01/01.swf`));
    await page.waitForTimeout(4000);
}

/**
 * Picks an option in a Select identified by its label.
 *
 * @param page - Page holding the Select
 * @param label - Accessible name of the trigger
 * @param option - Visible text of the option
 */
export async function choose(page: Page, label: string, option: string) {
    await page.getByRole("combobox", { name: label }).click();
    await page.getByRole("option", { name: option }).click();
}

/**
 * Clicks an element that triggers a download and reads the file.
 *
 * @param page - Page emitting the download
 * @param trigger - Link or button that starts it
 * @returns The suggested file name and the file content
 */
export async function download(page: Page, trigger: Locator) {
    const [file] = await Promise.all([page.waitForEvent("download"), trigger.click()]);

    return { name: file.suggestedFilename(), data: await readFile(await file.path()) };
}

/**
 * Reads the dimensions of a PNG file from its IHDR chunk.
 *
 * @param buffer - Whole PNG file
 * @returns Width and height in pixels
 */
export function pngSize(buffer: Buffer) {
    expect(buffer.subarray(1, 4).toString()).toBe("PNG");

    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/**
 * Reads the dimensions of a JPEG file from its first start-of-frame marker.
 *
 * @param buffer - Whole JPEG file
 * @returns Width and height in pixels
 */
export function jpegSize(buffer: Buffer) {
    expect(buffer.readUInt16BE(0)).toBe(0xffd8);
    let offset = 2;

    while (offset < buffer.length) {
        const marker = buffer.readUInt16BE(offset);

        if (marker >= 0xffc0 && marker <= 0xffc2) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7),
            };
        }

        offset += 2 + buffer.readUInt16BE(offset + 2);
    }

    throw new Error("no start-of-frame marker");
}
