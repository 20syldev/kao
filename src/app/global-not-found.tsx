import { type Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";

import { NotFound } from "@/components/notfound";
import { Shell } from "@/components/shell";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
    title: "404 - Kao",
};

/**
 * Global 404 for any unmatched route. Each locale has its own root layout, so there is no layout
 * to wrap this page: it owns the whole document through the Shell (experimental.globalNotFound).
 * A static export serves one 404 document for every path, rendered in the default locale.
 */
export default async function GlobalNotFound() {
    setRequestLocale(routing.defaultLocale);
    const messages = await getMessages({ locale: routing.defaultLocale });

    return (
        <Shell locale={routing.defaultLocale} messages={messages}>
            <NotFound />
        </Shell>
    );
}
