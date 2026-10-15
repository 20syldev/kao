import type { AvatarCode } from "@/types/avatar";

export const CODE_EXTENSION = "kao";

/**
 * Serializes an avatar code into the content of a .kao file.
 *
 * @param name - Name given to the avatar, possibly empty
 * @param ida - Engine serialization of the avatar, starting with its family letter
 * @returns Pretty-printed JSON, tagged with the app name and a format version
 */
export function serializeCode({ name, ida }: AvatarCode) {
    return `${JSON.stringify({ app: "kao", version: 1, name, ida }, null, 4)}\n`;
}

/**
 * Reads an avatar code pasted or loaded by the user. Both the JSON of a .kao
 * file and a bare engine string are accepted.
 *
 * @param text - Raw text from a file or the clipboard
 * @returns The avatar code, or null when the text is not a valid code
 */
export function parseCode(text: string): AvatarCode | null {
    const raw = text.trim();
    let name = "";
    let ida = raw;

    if (raw.startsWith("{")) {
        try {
            const json = JSON.parse(raw) as Partial<AvatarCode>;
            name = typeof json.name === "string" ? json.name : "";
            ida = typeof json.ida === "string" ? json.ida : "";
        } catch {
            return null;
        }
    }

    // The engine serialization starts with the family letter and separates parts with ":"
    if (!/^[fm]\S*:/.test(ida)) return null;

    return { name, ida };
}

/**
 * Turns an avatar name into a safe file name stem.
 *
 * @param name - Free text typed in the Flash save form, possibly empty
 * @returns Lowercase ASCII words joined by dashes, "avatar" when nothing is left
 */
export function slugify(name: string) {
    const slug = name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

    return slug || "avatar";
}
