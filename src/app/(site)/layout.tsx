import { getMessages, setRequestLocale } from "next-intl/server";

import { LocaleRedirect } from "@/components/redirect";
import { Shell } from "@/components/shell";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";

/**
 * Document metadata for the default locale.
 *
 * @returns Metadata for the locale's document head
 */
export function generateMetadata() {
    return buildMetadata(routing.defaultLocale);
}

/**
 * Root layout of the default locale, served at "/". The other locales live under the sibling
 * [locale] segment; the default one stays unprefixed, which is why it has its own root layout.
 *
 * @param children - Page tree rendered inside the shell
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    setRequestLocale(routing.defaultLocale);
    const messages = await getMessages({ locale: routing.defaultLocale });

    return (
        <Shell locale={routing.defaultLocale} messages={messages} prelude={<LocaleRedirect />}>
            {children}
        </Shell>
    );
}
