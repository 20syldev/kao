import { useCallback, useSyncExternalStore } from "react";

import { readPreference, subscribePreferences, writePreference } from "@/lib/preferences";

/**
 * A choice remembered between visits. The server render and the first client render use the
 * fallback, the stored choice replaces it right after hydration, so the markup always matches.
 *
 * @param key - Name of the preference
 * @param fallback - Value used when nothing valid is stored
 * @param parse - Turns the stored text into a value, or undefined when it is not valid
 * @returns The current value and a function that changes and stores it
 */
export function usePreference<T extends string | number>(
    key: string,
    fallback: T,
    parse: (stored: string) => T | undefined,
) {
    const stored = useSyncExternalStore(
        subscribePreferences,
        () => readPreference(key),
        () => null,
    );
    const value = (stored === null ? undefined : parse(stored)) ?? fallback;
    const setValue = useCallback((next: T) => writePreference(key, String(next)), [key]);

    return [value, setValue] as const;
}
