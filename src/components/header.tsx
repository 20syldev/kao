import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale";
import { PrivacyHint } from "@/components/privacy";
import { ThemeToggle } from "@/components/theme";

/**
 * Top bar of the page: the Kao wordmark with its tagline, then the language and theme controls.
 */
export function Header() {
    const t = useTranslations("header");

    return (
        <header className="page-width flex flex-wrap items-center justify-between gap-4 px-4 py-6">
            <div className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="inline-flex size-12 -rotate-6 items-center justify-center rounded-lg border-2 bg-primary font-display text-2xl text-primary-foreground shadow-comic select-none"
                >
                    K
                </span>
                <div>
                    <h1 className="font-display text-display leading-none">Kao</h1>
                    <p className="text-sm font-medium text-muted-foreground">{t("tagline")}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <PrivacyHint />
                <LocaleSwitcher />
                <ThemeToggle />
            </div>
        </header>
    );
}
