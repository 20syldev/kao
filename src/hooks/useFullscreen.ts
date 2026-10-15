import { type RefObject, useSyncExternalStore } from "react";

/**
 * Subscribes to the fullscreen changes of the document.
 *
 * @param notify - Called whenever the document enters or leaves fullscreen
 * @returns A function that unsubscribes
 */
function subscribe(notify: () => void) {
    document.addEventListener("fullscreenchange", notify);

    return () => document.removeEventListener("fullscreenchange", notify);
}

/**
 * Lets an element go fullscreen and come back. Dialogs are rendered outside of the fullscreen
 * element, so callers that open one must leave fullscreen first.
 *
 * @param target - Element shown fullscreen, nothing happens while it is not mounted
 * @returns Whether the browser can do fullscreen, whether the target is fullscreen now, a toggle
 *   and a function that leaves fullscreen
 */
export function useFullscreen(target: RefObject<HTMLElement | null>) {
    const supported = useSyncExternalStore(
        subscribe,
        () => document.fullscreenEnabled,
        () => false,
    );
    const active = useSyncExternalStore(
        subscribe,
        () => document.fullscreenElement !== null && document.fullscreenElement === target.current,
        () => false,
    );

    const exit = () => {
        if (document.fullscreenElement) void document.exitFullscreen();
    };

    const toggle = () => {
        if (document.fullscreenElement) exit();
        else void target.current?.requestFullscreen();
    };

    return { supported, active, toggle, exit };
}
