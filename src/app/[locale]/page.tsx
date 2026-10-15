import { setRequestLocale } from "next-intl/server";

import { Home } from "@/components/home";

/**
 * Home page of a non-default locale. Pins the request locale for the static export.
 *
 * @param params - Route params carrying the locale segment
 */
export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <Home />;
}
