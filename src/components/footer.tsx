import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

const LINK_CLASS =
    "ml-1 inline-flex items-center gap-0.5 rounded-sm px-1 font-semibold text-foreground underline decoration-2 underline-offset-2 transition-colors hover:bg-primary hover:text-primary-foreground hover:no-underline focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:no-underline focus-visible:outline-none";

/**
 * Page footer with the author and Ruffle credits, whose links turn into filled pills on hover and
 * focus.
 */
export function Footer() {
    const t = useTranslations("footer");

    return (
        <footer className="page-width flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 pb-8 text-center text-sm text-muted-foreground">
            <span>
                {t("builtBy")}
                <a
                    href="https://sylvain.sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                >
                    Sylvain
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
            </span>
            <span>
                {t("poweredBy")}
                <a
                    href="https://ruffle.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                >
                    Ruffle
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
            </span>
        </footer>
    );
}
