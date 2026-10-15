import type { SavedAvatar } from "@/types/avatar";

const STORAGE_KEY = "kao-history";

const MAX_ITEMS = 60;

const EMPTY: SavedAvatar[] = [];

const listeners = new Set<() => void>();

let cache: SavedAvatar[] | null = null;

/**
 * Reads the history from localStorage, once; later reads come from the in-memory cache so that
 * useSyncExternalStore always gets the same array until the history changes.
 *
 * @returns Saved avatars, newest first, or an empty list when storage is unreadable
 */
function read() {
    if (cache) return cache;

    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        cache = Array.isArray(parsed) ? (parsed as SavedAvatar[]) : EMPTY;
    } catch {
        cache = EMPTY;
    }

    return cache;
}

/**
 * Replaces the history, persists it and notifies the subscribers. Persisting is best effort:
 * a full or blocked storage keeps the change in memory for the session.
 *
 * @param items - New history, newest first
 */
function write(items: SavedAvatar[]) {
    cache = items.slice(0, MAX_ITEMS);

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {}

    listeners.forEach((listener) => listener());
}

/**
 * Registers a history listener, the useSyncExternalStore way.
 *
 * @param listener - Called after every change
 * @returns A function that removes the listener
 */
export function subscribeHistory(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

/**
 * Client snapshot of the history.
 *
 * @returns Saved avatars, newest first, stable between changes
 */
export function getHistory() {
    return read();
}

/**
 * Server snapshot of the history: always empty, the storage only exists in the browser.
 *
 * @returns A shared empty list
 */
export function getServerHistory() {
    return EMPTY;
}

/**
 * Adds an avatar on top of the history, replacing any previous entry with the same code.
 *
 * @param avatar - Avatar to save, with its thumbnail and export date
 */
export function saveAvatar(avatar: SavedAvatar) {
    write([avatar, ...read().filter((item) => item.ida !== avatar.ida)]);
}

/**
 * Merges imported avatars into the history. An avatar already present keeps the most recent
 * of the two entries; the result stays sorted by date and capped like any other history.
 *
 * @param avatars - Avatars read from a backup file
 * @returns How many avatars were not in the history before
 */
export function mergeAvatars(avatars: SavedAvatar[]) {
    const current = read();
    const known = new Set(current.map((item) => item.ida));
    const merged = new Map(current.map((item) => [item.ida, item]));

    for (const avatar of avatars) {
        const existing = merged.get(avatar.ida);

        if (!existing || avatar.date > existing.date) merged.set(avatar.ida, avatar);
    }

    write([...merged.values()].sort((a, b) => b.date.localeCompare(a.date)));

    return avatars.filter((avatar) => !known.has(avatar.ida)).length;
}

/**
 * Removes an avatar from the history.
 *
 * @param ida - Engine serialization identifying the entry
 */
export function removeAvatar(ida: string) {
    write(read().filter((item) => item.ida !== ida));
}

/**
 * Puts back an entry removed earlier, keeping the history sorted by date.
 *
 * @param avatar - Entry returned by the history before its removal
 */
export function restoreAvatar(avatar: SavedAvatar) {
    const items = [avatar, ...read().filter((item) => item.ida !== avatar.ida)];
    write(items.sort((a, b) => b.date.localeCompare(a.date)));
}
