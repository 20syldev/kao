"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Icon button of the header whose tooltip states the privacy promise: everything runs in the
 * browser. It is focusable, so keyboard users get the same text as mouse users.
 */
export function PrivacyHint() {
    const t = useTranslations("header.privacy");

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label={t("label")}
                    className="comic-lift border-2 shadow-comic-sm"
                >
                    <ShieldCheck aria-hidden="true" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{t("tip")}</TooltipContent>
        </Tooltip>
    );
}
