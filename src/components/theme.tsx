"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

/**
 * Subscribes to nothing: it only lets useSyncExternalStore tell the server render (false) from
 * the client one (true), which avoids a hydration mismatch on the theme-dependent icon.
 *
 * @returns A function that unsubscribes, which does nothing
 */
function subscribe() {
    return () => {};
}

/**
 * Icon button that flips between light and dark. It shows a moon in light mode and a sun in
 * dark mode, and renders the moon until mounted because the resolved theme is unknown on the
 * server. The accessible name describes the action, not the state.
 */
export function ThemeToggle() {
    const t = useTranslations("header.theme");
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
    const dark = mounted && resolvedTheme === "dark";
    const Icon = dark ? Sun : Moon;

    return (
        <Button
            variant="outline"
            size="icon"
            aria-label={t("toggle")}
            onClick={() => setTheme(dark ? "light" : "dark")}
            className="comic-lift border-2 shadow-comic-sm"
        >
            <Icon aria-hidden="true" />
        </Button>
    );
}
