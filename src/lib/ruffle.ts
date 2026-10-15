import type { RuffleGlobal, RuffleLoadOptions, RufflePlayerElement } from "@/types/ruffle";

// Engine "vF" modes: 2 asks for a name on save, 4 reopens a code and saves without a form
const MODE_NEW = "2";

const MODE_EDIT = "4";

// Player options; the SWF keeps its own white background and "noScale" is overridden
const CONFIG = {
    publicPath: "/ruffle/",
    polyfills: false,
    autoplay: "on",
    unmuteOverlay: "hidden",
    splashScreen: false,
    letterbox: "on",
    scale: "showAll",
    forceScale: true,
    quality: "best",
    allowScriptAccess: true,
    openUrlMode: "deny",
    showSwfDownload: false,
    logLevel: "warn",
};

// The engine requests this file last while it starts, then needs a moment to paint its first frame
const READY_RESOURCE = "/library/colors.xml";

const SETTLE_MS = 700;

const GIVE_UP_MS = 30_000;

let loading: Promise<RuffleGlobal> | null = null;

/**
 * Loads the self-hosted Ruffle build once and returns its global. The configuration has to be
 * on window.RufflePlayer before the script runs, which is why it is injected by hand instead of
 * through next/script.
 *
 * @returns The Ruffle global, ready to create players
 */
export function loadRuffle() {
    loading ??= new Promise<RuffleGlobal>((resolve, reject) => {
        window.RufflePlayer = { ...window.RufflePlayer, config: CONFIG };
        const script = document.createElement("script");
        script.src = "/ruffle/ruffle.js";
        script.onload = () =>
            window.RufflePlayer?.newest
                ? resolve(window.RufflePlayer)
                : reject(new Error("ruffle"));
        script.onerror = () => reject(new Error("ruffle"));
        document.head.append(script);
    });

    return loading;
}

/**
 * Builds the load options of the editor, with the flash vars the engine expects.
 *
 * @param ida - Engine serialization of the avatar to reopen, or null for a new avatar
 * @param locale - Interface language; menu.xml also has German, Spanish and Italian labels
 * @returns Options for the player's load(); "base" makes the engine's relative URLs resolve
 *   from the site root whatever the page path (/fr/)
 */
export function editorOptions(ida: string | null, locale: string): RuffleLoadOptions {
    return {
        url: "/MAIN.swf",
        base: "/",
        allowScriptAccess: true,
        parameters: {
            vF: ida ? MODE_EDIT : MODE_NEW,
            vL: locale,
            vE: "null",
            vA: "NaN",
            vN: "null",
            vIDA: ida ?? "null",
            vCOD: "null",
            vIDO: "NaN",
            vIDG: "NaN",
        },
    };
}

/**
 * Loads a movie in a player, through the current API or the legacy one.
 *
 * @param player - Player element created by Ruffle
 * @param options - Movie and flash vars to load
 */
export async function loadMovie(player: RufflePlayerElement, options: RuffleLoadOptions) {
    const api = player.ruffle?.() ?? player;
    await api.load?.(options);
}

/**
 * Resolves once the editor engine has started: it watches the network for the last file the
 * engine requests while booting, then waits a short moment for its first frame. It also gives up
 * after a while so that a slow or failed start never leaves the loader on screen forever. Call it
 * before the movie is loaded, otherwise the request may already be gone.
 *
 * @returns A promise that always resolves, whether the engine started or the wait timed out
 */
export function waitForEditor() {
    return new Promise<void>((resolve) => {
        if (typeof PerformanceObserver === "undefined") {
            resolve();
            return;
        }

        const started = performance.now();
        let done = false;
        const finish = (delay: number) => {
            if (done) return;

            done = true;
            observer.disconnect();
            window.clearTimeout(giveUp);
            window.setTimeout(resolve, delay);
        };
        const observer = new PerformanceObserver((list) => {
            const ready = list
                .getEntries()
                .some(
                    (entry) =>
                        entry.name.endsWith(READY_RESOURCE) &&
                        (entry as PerformanceResourceTiming).responseEnd >= started,
                );

            if (ready) finish(SETTLE_MS);
        });
        const giveUp = window.setTimeout(() => finish(0), GIVE_UP_MS);

        observer.observe({ type: "resource" });
    });
}
