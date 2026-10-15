import { type ReactNode, type Ref } from "react";

import { cn } from "@/lib/utils";

export interface EditorStageProps {
    ref: Ref<HTMLDivElement>;
    frameRef: Ref<HTMLDivElement>;
    label: string;
    loading: boolean;
    loadingLabel: string;
    overlay?: ReactNode;
}

/**
 * Empty box at the exact 900 by 520 ratio of the Flash stage, so Ruffle never letterboxes. The
 * Ruffle player is appended into it imperatively by useRuffle, so React never renders its
 * children. The border is an overlay drawn above the player, which is clipped one pixel under it:
 * the box height is fractional, and a border around it would leave a sub-pixel seam between
 * the frame and the stage, while a white box behind the curve would fringe its outer edge. While
 * the editor loads, a loader covers the stage: the Kao logo hops, hops with a somersault, hops
 * again, and repeats. The outer frame is the element that goes fullscreen: the stage then takes
 * the largest 900 by 520 box that fits the screen, without border or rounded corners.
 *
 * @param ref - Receives the container element for the player
 * @param frameRef - Receives the outer frame, the element shown fullscreen
 * @param label - Accessible name of the embedded application
 * @param loading - Whether the loader is shown
 * @param loadingLabel - Text read by assistive technologies while the loader is shown
 * @param overlay - Control drawn in the frame itself, so that it stays visible fullscreen
 */
export function EditorStage({
    ref,
    frameRef,
    label,
    loading,
    loadingLabel,
    overlay,
}: EditorStageProps) {
    return (
        <div
            ref={frameRef}
            className="relative flex justify-center [&:fullscreen]:items-center [&:fullscreen]:bg-background"
        >
            <div className="relative w-full in-[:fullscreen]:w-[min(100vw,calc(100vh*900/520))]">
                <div
                    ref={ref}
                    role="application"
                    aria-label={label}
                    aria-busy={loading}
                    className="aspect-[900/520] w-full bg-stage [clip-path:inset(1px_round_calc(var(--radius-lg)-1px))] in-[:fullscreen]:[clip-path:none]"
                />
                <div
                    role="status"
                    aria-hidden={!loading}
                    className={cn(
                        "halftone pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-card in-[:fullscreen]:rounded-none",
                        loading
                            ? "opacity-100"
                            : "invisible opacity-0 [transition:opacity_300ms,visibility_0s_300ms]",
                    )}
                >
                    <span className="sr-only">{loadingLabel}</span>
                    <div className="flex flex-col items-center gap-4" aria-hidden="true">
                        <span className="inline-flex size-16 animate-hop items-center justify-center rounded-xl border-2 bg-primary font-display text-3xl text-primary-foreground shadow-comic select-none motion-reduce:animate-none">
                            K
                        </span>
                        <span className="h-2 w-14 animate-hop-shadow rounded-full bg-foreground/25 motion-reduce:animate-none" />
                    </div>
                </div>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-lg border-2 in-[:fullscreen]:hidden"
                />
            </div>
            {overlay}
        </div>
    );
}
