"use client";

import { Palette } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { CodesPanel } from "@/components/studio/codes";
import { ExportPanel } from "@/components/studio/export";
import { FullscreenButton } from "@/components/studio/fullscreen";
import { HistoryPanel } from "@/components/studio/history";
import { PasteDialog } from "@/components/studio/paste";
import { ResultDialog } from "@/components/studio/result";
import { EditorStage } from "@/components/studio/stage";
import { Tile } from "@/components/studio/tile";
import { DEFAULT_FORMAT, DEFAULT_SCALE, FORMATS, SCALES } from "@/data/export";
import { useExportBridge } from "@/hooks/useExportBridge";
import { useFullscreen } from "@/hooks/useFullscreen";
import { usePreference } from "@/hooks/usePreference";
import { useRuffle } from "@/hooks/useRuffle";
import { CODE_EXTENSION, parseCode, serializeCode, slugify } from "@/lib/codes";
import { downloadFile } from "@/lib/download";
import { removeAvatar, restoreAvatar, saveAvatar } from "@/lib/history";
import { renderAvatar } from "@/lib/pixels";
import type {
    AvatarCode,
    ExportFormat,
    ExportPayload,
    ExportResult,
    SavedAvatar,
} from "@/types/avatar";

/**
 * The editor workspace as a bento grid: the Flash editor on three columns, and beside it a column
 * with the export settings, the code entry points and, from the 2xl breakpoint, the history, which
 * takes the remaining height and scrolls. Below 2xl the editor is not tall enough to balance that
 * column, so the history goes full width at the bottom instead, plus the result and paste dialogs. It owns the avatar
 * being edited, receives the exports from the patched SWF and reloads the editor after each
 * save, since the engine then waits for a server reply that never comes.
 */
export function Studio() {
    const t = useTranslations("studio");
    const locale = useLocale();
    const stage = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const lastUrl = useRef<string | null>(null);
    const { loading, load } = useRuffle(stage, locale);
    const fullscreen = useFullscreen(frame);
    const [scale, setScale] = usePreference<number>("scale", DEFAULT_SCALE, (stored) =>
        SCALES.find((value) => String(value) === stored),
    );
    const [format, setFormat] = usePreference<ExportFormat>("format", DEFAULT_FORMAT, (stored) =>
        Object.hasOwn(FORMATS, stored) ? (stored as ExportFormat) : undefined,
    );
    const [avatar, setAvatar] = useState<{ name: string; ida: string | null }>({
        name: "",
        ida: null,
    });
    const [result, setResult] = useState<ExportResult | null>(null);
    const [resultOpen, setResultOpen] = useState(false);
    const [pasteOpen, setPasteOpen] = useState(false);

    const openAvatar = (next: { name: string; ida: string | null }) => {
        setAvatar(next);
        void load(next.ida);
        stage.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const exportAvatar = async (payload: ExportPayload) => {
        const name = payload.name && payload.name !== "null" ? payload.name : avatar.name;
        const ida = payload.ida && payload.ida !== "null" ? payload.ida : avatar.ida;

        try {
            const { blob, thumb } = await renderAvatar(payload, format);
            const url = URL.createObjectURL(blob);

            if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);

            lastUrl.current = url;
            setAvatar({ name, ida });
            fullscreen.exit();
            setResult({
                name,
                ida,
                url,
                filename: `${slugify(name)}-${payload.width}px.${FORMATS[format].extension}`,
                width: payload.width,
                height: payload.height,
                bytes: blob.size,
            });
            setResultOpen(true);

            if (ida) saveAvatar({ name, ida, thumb, date: new Date().toISOString() });
        } catch (error) {
            toast.error(t("errors.export", { message: (error as Error).message }));
        }
    };

    useExportBridge(scale, (payload) => void exportAvatar(payload));

    const changeResultOpen = (open: boolean) => {
        setResultOpen(open);

        if (!open) void load(avatar.ida);
    };

    const openFile = async (file: File) => {
        const code = parseCode(await file.text());

        if (code) openAvatar(code);
        else toast.error(t("errors.open"));
    };

    const removeFromHistory = (item: SavedAvatar) => {
        removeAvatar(item.ida);
        toast(t("history.deleted", { name: item.name || t("history.untitled") }), {
            action: { label: t("history.undo"), onClick: () => restoreAvatar(item) },
        });
    };

    const downloadCode = () => {
        if (!avatar.ida) return;

        const code: AvatarCode = { name: avatar.name, ida: avatar.ida };
        downloadFile(
            serializeCode(code),
            `${slugify(code.name)}.${CODE_EXTENSION}`,
            "application/json",
        );
    };

    const copyCode = async () => {
        if (!avatar.ida) return;

        await navigator.clipboard.writeText(avatar.ida);
        toast.success(t("result.copied"));
    };

    return (
        <>
            <main className="page-width grid flex-1 gap-5 px-4 pb-8 lg:grid-cols-4">
                <Tile
                    title={t("editor.title")}
                    icon={Palette}
                    action={
                        fullscreen.supported && (
                            <FullscreenButton
                                active={fullscreen.active}
                                onToggle={fullscreen.toggle}
                            />
                        )
                    }
                    className="lg:col-span-3 lg:row-span-2 2xl:row-span-1 2xl:self-start"
                >
                    <EditorStage
                        ref={stage}
                        frameRef={frame}
                        label={t("editor.label")}
                        loading={loading}
                        overlay={
                            fullscreen.active && (
                                <FullscreenButton active onToggle={fullscreen.toggle} floating />
                            )
                        }
                        loadingLabel={t("editor.loading")}
                    />
                    <p className="text-sm text-muted-foreground">{t("editor.hint")}</p>
                </Tile>
                <div className="max-2xl:contents 2xl:flex 2xl:flex-col 2xl:gap-5">
                    <ExportPanel
                        scale={scale}
                        format={format}
                        onScaleChange={setScale}
                        onFormatChange={setFormat}
                    />
                    <CodesPanel
                        onNew={() => openAvatar({ name: "", ida: null })}
                        onFile={(file) => void openFile(file)}
                        onPaste={() => setPasteOpen(true)}
                    />
                    <div className="max-2xl:lg:col-span-4 2xl:relative 2xl:min-h-64 2xl:flex-1">
                        <HistoryPanel
                            className="2xl:absolute 2xl:inset-0"
                            onOpen={openAvatar}
                            onRemove={removeFromHistory}
                        />
                    </div>
                </div>
            </main>
            <ResultDialog
                result={result}
                open={resultOpen}
                onOpenChange={changeResultOpen}
                onDownloadCode={downloadCode}
                onCopyCode={() => void copyCode()}
            />
            <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} onSubmit={openAvatar} />
        </>
    );
}
