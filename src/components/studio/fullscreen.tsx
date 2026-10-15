import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface FullscreenButtonProps {
    active: boolean;
    onToggle: () => void;
    floating?: boolean;
}

/**
 * Icon button that enters or leaves fullscreen. In the editor tile it carries its action as
 * tooltip and accessible name. The floating variant sits in a corner of the fullscreen frame
 * instead, where the tile is not visible. It is a solid primary button so that it stays readable
 * over the white stage as well as over the frame background, and has no tooltip because portals
 * are not shown while an element is fullscreen.
 *
 * @param active - Whether the editor is fullscreen now
 * @param onToggle - Enters fullscreen, or leaves it when already active
 * @param floating - Whether the button is drawn over the stage in a corner of the frame
 */
export function FullscreenButton({ active, onToggle, floating = false }: FullscreenButtonProps) {
    const t = useTranslations("studio.editor");
    const label = active ? t("exitFullscreen") : t("fullscreen");
    const Icon = active ? Minimize2 : Maximize2;
    const button = (
        <Button
            variant={floating ? "default" : "outline"}
            size="icon"
            aria-label={label}
            onClick={onToggle}
            className={
                floating
                    ? "comic-lift absolute right-3 bottom-3 border-2 shadow-comic-sm"
                    : "comic-lift border-2 shadow-comic-sm"
            }
        >
            <Icon aria-hidden="true" />
        </Button>
    );

    if (floating) return button;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
