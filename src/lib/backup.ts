import { parseCode } from "@/lib/codes";
import type { SavedAvatar } from "@/types/avatar";

export const BACKUP_FILENAME = "kao-avatars.json";

// A thumbnail is shown as an image source, so only image data URLs are accepted
const THUMB_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

/**
 * Serializes the history into the content of a backup file.
 *
 * @param items - Saved avatars, newest first
 * @returns Pretty-printed JSON, tagged with the app name and a format version
 */
export function serializeBackup(items: SavedAvatar[]) {
    return `${JSON.stringify({ app: "kao", version: 1, avatars: items }, null, 4)}\n`;
}

/**
 * Reads a backup file. Every entry is checked one by one: the ones that are not valid are
 * left out instead of failing the whole file, since the file comes from the user's disk.
 *
 * @param text - Raw text of the file
 * @returns The valid avatars, or null when the text is not a backup file at all
 */
export function parseBackup(text: string): SavedAvatar[] | null {
    let json: { app?: unknown; avatars?: unknown };

    try {
        json = JSON.parse(text);
    } catch {
        return null;
    }

    if (json?.app !== "kao" || !Array.isArray(json.avatars)) return null;

    const avatars: SavedAvatar[] = [];

    for (const entry of json.avatars as Partial<SavedAvatar>[]) {
        const code = parseCode(typeof entry?.ida === "string" ? entry.ida : "");
        const date = typeof entry?.date === "string" ? new Date(entry.date) : null;

        if (!code || !date || Number.isNaN(date.getTime())) continue;
        if (typeof entry.thumb !== "string" || !THUMB_PATTERN.test(entry.thumb)) continue;

        avatars.push({
            name: typeof entry.name === "string" ? entry.name.slice(0, 100) : "",
            ida: code.ida,
            thumb: entry.thumb,
            date: date.toISOString(),
        });
    }

    return avatars;
}
