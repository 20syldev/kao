import { Inter, Mochiy_Pop_One } from "next/font/google";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { type AppLocale } from "@/i18n/routing";

import "@/app/globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const mochiy = Mochiy_Pop_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-mochiy",
    display: "swap",
});

export interface ShellProps {
    locale: AppLocale;
    messages: AbstractIntlMessages;
    prelude?: ReactNode;
    children: ReactNode;
}

/**
 * Shared root document of every locale: html lang (translate off, the app ships its own
 * translations), the body and display font variables, the
 * theme provider, the intl provider and the toast region. Each locale route group renders it
 * with its own messages, which lets the default locale live at "/" and the others under a
 * prefix.
 *
 * @param locale - Active locale, written to the html lang attribute
 * @param messages - Translated messages of that locale, handed to the client intl provider
 * @param prelude - Elements rendered first in the body, such as the first-visit language script
 * @param children - Page tree rendered for this locale
 */
export function Shell({ locale, messages, prelude, children }: ShellProps) {
    return (
        <html lang={locale} translate="no" suppressHydrationWarning>
            <body className={`${inter.variable} ${mochiy.variable}`} suppressHydrationWarning>
                {prelude}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        {children}
                        <Toaster position="bottom-right" />
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
