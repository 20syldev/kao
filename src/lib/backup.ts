import { CODE_EXTENSION, parseCode } from "@/lib/codes";
import type { AvatarCode, SavedAvatar } from "@/types/avatar";

export type KaoFile =
    { kind: "avatar"; code: AvatarCode } | { kind: "collection"; avatars: SavedAvatar[] };

export const BACKUP_FILENAME = `avatars.${CODE_EXTENSION}`;

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

/**
 * Reads the content of a .kao file, which holds either one avatar or a backup of the whole
 * history. The kind is told by the content, never by the file name.
 *
 * @param text - Raw text of the file
 * @returns The avatar or the collection it holds, or null when it is neither
 */
export function readKaoFile(text: string): KaoFile | null {
    const avatars = parseBackup(text);

    if (avatars) return { kind: "collection", avatars };

    const code = parseCode(text);

    return code ? { kind: "avatar", code } : null;
}
