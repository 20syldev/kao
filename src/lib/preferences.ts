const PREFIX = "kao-";

const listeners = new Set<() => void>();

/**
 * Reads a stored preference.
 *
 * @param key - Name of the preference, prefixed with the app name in the storage
 * @returns The raw stored text, or null when there is none or the storage is unreadable
 */
export function readPreference(key: string) {
    try {
        return window.localStorage.getItem(PREFIX + key);
    } catch {
        return null;
    }
}

/**
 * Stores a preference and notifies the subscribers. Storing is best effort: a blocked storage
 * only means the choice is not remembered for the next visit.
 *
 * @param key - Name of the preference
 * @param value - Text to store
 */
export function writePreference(key: string, value: string) {
    try {
        window.localStorage.setItem(PREFIX + key, value);
    } catch {}

    listeners.forEach((listener) => listener());
}

/**
 * Registers a preference listener, the useSyncExternalStore way.
 *
 * @param listener - Called after every stored preference
 * @returns A function that removes the listener
 */
export function subscribePreferences(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
