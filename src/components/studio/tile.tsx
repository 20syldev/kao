import { type LucideIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TileProps {
    title: string;
    icon: LucideIcon;
    action?: ReactNode;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
}

/**
 * One cell of the bento grid: an outlined card with a hard comic shadow, a yellow icon badge and
 * a display-font heading that also names the region for assistive technologies.
 *
 * @param title - Heading of the tile, used as the accessible name of the region
 * @param icon - Lucide icon shown in the badge next to the heading
 * @param action - Control aligned to the end of the heading row, such as a toolbar button
 * @param className - Grid placement and size overrides of the card
 * @param contentClassName - Layout overrides of the body
 * @param children - Body of the tile
 */
export function Tile({
    title,
    icon: Icon,
    action,
    className,
    contentClassName,
    children,
}: TileProps) {
    const id = useId();

    return (
        <Card
            role="region"
            aria-labelledby={id}
            className={cn("gap-4 border-2 py-5 shadow-comic", className)}
        >
            <CardHeader className="flex items-center gap-3 px-5">
                <span className="inline-flex size-8 shrink-0 -rotate-3 items-center justify-center rounded-md border-2 bg-highlight text-highlight-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 id={id} className="font-display text-title">
                    {title}
                </h2>
                {action && <div className="ml-auto">{action}</div>}
            </CardHeader>
            <CardContent className={cn("flex flex-1 flex-col gap-4 px-5", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}
