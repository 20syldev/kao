"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { type AppLocale, routing } from "@/i18n/routing";
import { pathOf } from "@/lib/metadata";

/**
 * Saves the locale choice and moves to that locale's root. Each locale is its own root layout,
 * so switching is a full navigation; saving is best effort because storage can be blocked.
 *
 * @param next - Locale to switch to
 */
function switchTo(next: AppLocale) {
    try {
        window.localStorage.setItem("locale", next);
    } catch {}

    window.location.href = pathOf(next) + window.location.search + window.location.hash;
}

/**
 * Segmented EN / FR control. The active segment is pressed and filled with the ink color, the
 * other one is a plain ghost button.
 */
export function LocaleSwitcher() {
    const t = useTranslations("header.language");
    const locale = useLocale();

    return (
        <div
            role="group"
            aria-label={t("label")}
            className="inline-flex items-center gap-0.5 rounded-md border-2 bg-card p-0.5 shadow-comic-sm"
        >
            {routing.locales.map((code) => (
                <Button
                    key={code}
                    variant="ghost"
                    size="sm"
                    lang={code}
                    aria-label={t(code)}
                    aria-pressed={locale === code}
                    onClick={() => locale !== code && switchTo(code)}
                    className="h-7 rounded-[calc(var(--radius-md)-4px)] px-2 font-semibold uppercase aria-pressed:bg-ink! aria-pressed:text-background! aria-pressed:hover:bg-ink! aria-pressed:hover:text-background!"
                >
                    {code}
                </Button>
            ))}
        </div>
    );
}
