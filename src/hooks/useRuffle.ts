import { type RefObject, useEffect, useRef, useState } from "react";

import { editorOptions, loadMovie, loadRuffle, waitForEditor } from "@/lib/ruffle";
import type { RufflePlayerElement } from "@/types/ruffle";

/**
 * Creates the player inside the host on first use, then loads the editor in it. A single player
 * is reused for every load: recreating it can lose the WebGL context and fall back to a slow
 * renderer. A load that was superseded while the Ruffle script was loading does nothing: React
 * mounts effects twice in development, and two loads on the same player left a blank stage.
 *
 * @param host - Container of the player, nothing happens while it is not mounted
 * @param player - Holds the player across loads, filled on the first call
 * @param ida - Engine serialization of the avatar to reopen, or null for a new avatar
 * @param locale - Interface language passed to the editor
 * @param isCurrent - Whether this load is still the latest one
 */
async function mountEditor(
    host: HTMLDivElement | null,
    player: RefObject<RufflePlayerElement | null>,
    ida: string | null,
    locale: string,
    isCurrent: () => boolean,
) {
    if (!host) return;

    const ruffle = await loadRuffle();

    if (!isCurrent()) return;

    if (!player.current) {
        const created = ruffle.newest?.()?.createPlayer();
        if (!created) return;

        created.className = "block size-full";
        host.append(created);
        player.current = created;
    }

    const started = waitForEditor();

    await loadMovie(player.current, editorOptions(ida, locale));
    await started;
}

/**
 * Loads the editor and tells when it is ready. Only the latest load may end the loading state, so
 * that an older load finishing late never hides the loader of a newer one.
 *
 * @param host - Container of the player
 * @param player - Holds the player across loads
 * @param ida - Engine serialization of the avatar to reopen, or null for a new avatar
 * @param locale - Interface language passed to the editor
 * @param epoch - Counter shared by all loads, incremented by each one
 * @param setLoading - Receives true when a load starts and false when the latest one is ready
 */
async function loadEditor(
    host: HTMLDivElement | null,
    player: RefObject<RufflePlayerElement | null>,
    ida: string | null,
    locale: string,
    epoch: { id: number },
    setLoading: (loading: boolean) => void,
) {
    const id = ++epoch.id;

    setLoading(true);
    await mountEditor(host, player, ida, locale, () => id === epoch.id);

    if (id === epoch.id) setLoading(false);
}

/**
 * Mounts one Ruffle player inside a container, starts the editor on a new avatar and removes the
 * player on unmount.
 *
 * @param container - Element that receives the player; it sets the size and aspect ratio
 * @param locale - Interface language passed to the editor as its "vL" flash var
 * @returns Whether the editor is loading, which stays true until its engine has started, and a
 *   function that reloads the editor, on a saved avatar code or on a new avatar
 */
export function useRuffle(container: RefObject<HTMLDivElement | null>, locale: string) {
    const player = useRef<RufflePlayerElement | null>(null);
    const epoch = useRef({ id: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const current = epoch.current;

        void loadEditor(container.current, player, null, locale, current, setLoading);

        return () => {
            current.id++;
            player.current?.remove();
            player.current = null;
        };
    }, [container, locale]);

    return {
        loading,
        load: (ida: string | null) =>
            loadEditor(container.current, player, ida, locale, epoch.current, setLoading),
    };
}
