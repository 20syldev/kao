import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * Centered 404 panel with a way back to the editor.
 */
export function NotFound() {
    const t = useTranslations("notfound");

    return (
        <main className="halftone flex min-h-svh items-center justify-center p-6">
            <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border-2 bg-card p-8 text-center shadow-comic-lg">
                <p className="font-display text-display text-primary">404</p>
                <h1 className="font-display text-title">{t("title")}</h1>
                <p className="text-muted-foreground">{t("body")}</p>
                <Button asChild className="comic-lift border-2 shadow-comic-sm">
                    <Link href="/">{t("home")}</Link>
                </Button>
            </div>
        </main>
    );
}
