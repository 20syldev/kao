import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// One JSON file per namespace under messages/<locale>/
const MESSAGE_FILES = ["meta", "header", "studio", "footer", "notfound"] as const;

/**
 * Builds the single messages object of a locale, keyed by namespace name.
 *
 * @param locale - Locale folder under messages/
 * @returns Messages where each file contributes the keys of its namespace
 */
async function loadMessages(locale: string) {
    const files = await Promise.all(
        MESSAGE_FILES.map(
            async (file) => (await import(`../../messages/${locale}/${file}.json`)).default,
        ),
    );

    return Object.fromEntries(MESSAGE_FILES.map((file, index) => [file, files[index]]));
}

/**
 * Per-request next-intl configuration: resolves the active locale, falling back to the default
 * one, and loads its messages.
 *
 * @param params - Request context of next-intl, whose requestLocale resolves to the locale
 *   segment of the URL, or to undefined when there is none
 * @returns The locale to render and its messages
 */
export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return { locale, messages: await loadMessages(locale) };
});
