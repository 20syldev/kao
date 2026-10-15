import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { type AppLocale, routing } from "@/i18n/routing";

export const SITE_URL = "https://kao.sylvain.sh";

const OPEN_GRAPH_LOCALE: Record<AppLocale, string> = {
    en: "en_US",
    fr: "fr_FR",
};

/**
 * Returns the site-relative path of the home page of a locale: "/" for the default locale,
 * "/fr/" for the others.
 *
 * @param locale - Target locale
 * @returns The path, always with a trailing slash
 */
export function pathOf(locale: AppLocale) {
    return locale === routing.defaultLocale ? "/" : `/${locale}/`;
}

/**
 * Builds localized document metadata from the "meta" message namespace: title, description,
 * icon, Open Graph, canonical URL and the language alternates of every locale.
 *
 * @param locale - Target locale
 * @returns Metadata for the document head, resolved against the production site URL
 */
export async function buildMetadata(locale: AppLocale): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "meta" });
    const languages = Object.fromEntries(routing.locales.map((l) => [l, pathOf(l)]));

    return {
        metadataBase: new URL(SITE_URL),
        title: t("title"),
        description: t("description"),
        icons: {
            icon: [
                { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
                { url: "/icon.png", type: "image/png", sizes: "512x512" },
            ],
            apple: "/icon.png",
        },
        other: { google: "notranslate" },
        alternates: {
            canonical: pathOf(locale),
            languages: { ...languages, "x-default": pathOf(routing.defaultLocale) },
        },
        openGraph: {
            type: "website",
            siteName: "Kao",
            title: t("title"),
            description: t("description"),
            url: pathOf(locale),
            locale: OPEN_GRAPH_LOCALE[locale],
        },
    };
}
