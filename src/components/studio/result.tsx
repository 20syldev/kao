import { Copy, Download, FileCode2, PencilLine } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ExportResult } from "@/types/avatar";

export interface ResultDialogProps {
    result: ExportResult | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDownloadCode: () => void;
    onCopyCode: () => void;
}

/**
 * Dialog shown after each export: a preview on a checkerboard so transparency shows, the file
 * details and the actions on the image and its avatar code. The image download takes the focus
 * when it opens: Radix skips links when it looks for the first element to focus, so it is focused
 * by hand. Closing it, by any means, resumes editing because the engine stays on its
 * waiting screen after a save.
 *
 * @param result - Last export, kept while the dialog animates out
 * @param open - Whether the dialog is shown
 * @param onOpenChange - Called when the dialog opens or closes
 * @param onDownloadCode - Saves the .kao file of the exported avatar
 * @param onCopyCode - Copies the avatar code to the clipboard
 */
export function ResultDialog({
    result,
    open,
    onOpenChange,
    onDownloadCode,
    onCopyCode,
}: ResultDialogProps) {
    const t = useTranslations("studio.result");
    const download = useRef<HTMLAnchorElement>(null);

    if (!result) return null;

    const name = result.name || t("untitled");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="border-2 shadow-comic-lg sm:max-w-lg"
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    download.current?.focus();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="font-display text-title">{name}</DialogTitle>
                    <DialogDescription>
                        {t("details", {
                            width: result.width,
                            height: result.height,
                            size: Math.round(result.bytes / 1024),
                            file: result.filename,
                        })}
                    </DialogDescription>
                </DialogHeader>
                <div className="checkerboard flex justify-center rounded-lg border-2 p-4">
                    <Image
                        src={result.url}
                        alt={t("preview", { name })}
                        width={320}
                        height={320}
                        unoptimized
                        className="size-56 sm:size-72"
                    />
                </div>
                <DialogFooter className="flex-wrap gap-2 sm:justify-start">
                    <Button asChild className="comic-lift border-2 shadow-comic-sm">
                        <a ref={download} href={result.url} download={result.filename}>
                            <Download aria-hidden="true" />
                            {t("download")}
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onDownloadCode}
                        disabled={!result.ida}
                        className="comic-lift border-2 shadow-comic-sm"
                    >
                        <FileCode2 aria-hidden="true" />
                        {t("code")}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onCopyCode}
                        disabled={!result.ida}
                        className="comic-lift border-2 shadow-comic-sm"
                    >
                        <Copy aria-hidden="true" />
                        {t("copy")}
                    </Button>
                    <DialogClose asChild>
                        <Button
                            variant="secondary"
                            className="comic-lift border-2 border-border shadow-comic-sm"
                        >
                            <PencilLine aria-hidden="true" />
                            {t("resume")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
