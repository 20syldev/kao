"use client";

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "flex w-(--width) items-center gap-3 rounded-lg border-2 bg-popover p-4 font-sans text-sm text-popover-foreground shadow-comic",
                    icon: "shrink-0 text-primary",
                    content: "flex min-w-0 flex-1 flex-col gap-0.5",
                    title: "font-semibold",
                    description: "text-muted-foreground",
                    actionButton:
                        "comic-lift ml-auto shrink-0 cursor-pointer rounded-md border-2 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-comic-sm transition-[translate,box-shadow,background-color,color,border-color]! duration-200! ease-out!",
                    cancelButton:
                        "comic-lift ml-auto shrink-0 cursor-pointer rounded-md border-2 bg-background px-3 py-1 text-xs font-semibold shadow-comic-sm transition-[translate,box-shadow,background-color,color,border-color]! duration-200! ease-out!",
                    closeButton: "border-2 bg-popover",
                    error: "border-destructive [&_[data-icon]]:text-destructive",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
