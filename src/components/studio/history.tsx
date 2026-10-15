import { Download, GalleryHorizontalEnd, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";

import { Tile } from "@/components/studio/tile";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHistory } from "@/hooks/useHistory";
import { BACKUP_FILENAME, parseBackup, serializeBackup } from "@/lib/backup";
import { downloadFile } from "@/lib/download";
import { mergeAvatars } from "@/lib/history";
import type { SavedAvatar } from "@/types/avatar";

export interface HistoryPanelProps {
    className?: string;
    onOpen: (avatar: SavedAvatar) => void;
    onRemove: (avatar: SavedAvatar) => void;
}

/**
 * Scrolling grid of the avatars exported from this browser. A thumbnail reopens its avatar in the
 * editor, the trash button removes it from the history. Two buttons in the heading save the whole
 * history to a file and merge such a file back, since the history only lives in one browser. The list is padded inside its scroll area
 * so that the comic shadows and the hover lift are not clipped.
 *
 * @param className - Grid placement of the tile
 * @param onOpen - Reopens an avatar in the editor
 * @param onRemove - Removes an avatar from the history
 */
export function HistoryPanel({ className, onOpen, onRemove }: HistoryPanelProps) {
    const t = useTranslations("studio.history");
    const format = useFormatter();
    const items = useHistory();
    const input = useRef<HTMLInputElement>(null);

    const exportBackup = () => {
        downloadFile(serializeBackup(items), BACKUP_FILENAME, "application/json");
    };

    const importBackup = async (file: File) => {
        const avatars = parseBackup(await file.text());

        if (!avatars || avatars.length === 0) {
            toast.error(t("importInvalid"));
            return;
        }

        toast.success(t("imported", { count: mergeAvatars(avatars) }));
    };

    return (
        <Tile
            title={t("title")}
            icon={GalleryHorizontalEnd}
            className={className}
            contentClassName="min-h-0"
            action={
                <div className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label={t("exportBackup")}
                                disabled={items.length === 0}
                                onClick={exportBackup}
                                className="comic-lift border-2 shadow-comic-sm"
                            >
                                <Download aria-hidden="true" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("exportBackup")}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label={t("importBackup")}
                                onClick={() => input.current?.click()}
                                className="comic-lift border-2 shadow-comic-sm"
                            >
                                <Upload aria-hidden="true" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("importBackup")}</TooltipContent>
                    </Tooltip>
                    <input
                        ref={input}
                        type="file"
                        accept="application/json,.json"
                        data-slot="history-import"
                        hidden
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) void importBackup(file);

                            event.target.value = "";
                        }}
                    />
                </div>
            }
        >
            {items.length === 0 ? (
                <p className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t("empty")}
                </p>
            ) : (
                <ul className="-m-1 grid min-h-0 grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] content-start gap-4 overflow-y-auto p-1">
                    {items.map((item) => {
                        const name = item.name || t("untitled");

                        return (
                            <li key={item.ida} className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    aria-label={t("open", { name })}
                                    onClick={() => onOpen(item)}
                                    className="overflow-hidden rounded-lg border-2 shadow-comic-sm comic-lift focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <Image
                                        src={item.thumb}
                                        alt=""
                                        width={160}
                                        height={160}
                                        unoptimized
                                        className="aspect-square w-full"
                                    />
                                </button>
                                <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format.dateTime(new Date(item.date), {
                                                dateStyle: "medium",
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t("delete", { name })}
                                        onClick={() => onRemove(item)}
                                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Tile>
    );
}
