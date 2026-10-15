import { routing } from "@/i18n/routing";

/**
 * Builds the source of the first-visit language script. A saved choice in localStorage wins, and
 * "en" never redirects; without a saved choice the browser language decides.
 *
 * @param locales - Non-default locales, each served under its own prefix
 * @returns Self-contained script source that replaces the location when a locale applies
 */
function redirectSource(locales: readonly string[]) {
    return `(function () {
    try {
        var locales = ${JSON.stringify(locales)};
        var saved = window.localStorage.getItem("locale");
        var target = saved;

        if (!saved) {
            var language = (navigator.language || "").slice(0, 2).toLowerCase();
            target = locales.indexOf(language) !== -1 ? language : null;
        }

        if (target && locales.indexOf(target) !== -1) {
            window.location.replace("/" + target + "/" + window.location.search + window.location.hash);
        }
    } catch (e) {}
})();`;
}

/**
 * Inline script placed first in the body of the default-locale layout. It runs while the HTML is
 * parsed, before the first paint, so a first-time visitor who reads another language never sees
 * a flash of English. A plain script element is used because next/script defers even its
 * beforeInteractive scripts behind the framework bootstrap.
 */
export function LocaleRedirect() {
    const locales = routing.locales.filter((locale) => locale !== routing.defaultLocale);

    return <script dangerouslySetInnerHTML={{ __html: redirectSource(locales) }} />;
}
