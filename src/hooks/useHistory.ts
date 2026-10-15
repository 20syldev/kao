import { useSyncExternalStore } from "react";

import { getHistory, getServerHistory, subscribeHistory } from "@/lib/history";

/**
 * Subscribes to the avatar history kept in localStorage. The server render and the first client
 * render see an empty list, the stored entries appear right after hydration.
 *
 * @returns Saved avatars, newest first
 */
export function useHistory() {
    return useSyncExternalStore(subscribeHistory, getHistory, getServerHistory);
}
