import { ImageDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { Tile } from "@/components/studio/tile";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BASE_SIZE, FORMATS, SCALES } from "@/data/export";
import type { ExportFormat } from "@/types/avatar";

export interface ExportPanelProps {
    scale: number;
    format: ExportFormat;
    onScaleChange: (scale: number) => void;
    onFormatChange: (format: ExportFormat) => void;
}

/**
 * Export settings applied the next time the user presses SAVE in the editor: the output size
 * and the file format.
 *
 * @param scale - Selected multiplier of the 180 px base avatar
 * @param format - Selected output format
 * @param onScaleChange - Called with the new multiplier
 * @param onFormatChange - Called with the new format
 */
export function ExportPanel({ scale, format, onScaleChange, onFormatChange }: ExportPanelProps) {
    const t = useTranslations("studio.export");
    const sizeId = useId();
    const formatId = useId();

    return (
        <Tile title={t("title")} icon={ImageDown}>
            <div className="grid gap-2">
                <Label htmlFor={sizeId}>{t("size")}</Label>
                <Select
                    value={String(scale)}
                    onValueChange={(value) => onScaleChange(Number(value))}
                >
                    <SelectTrigger id={sizeId} className="w-full border-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SCALES.map((value) => (
                            <SelectItem key={value} value={String(value)}>
                                {t("pixels", { size: value * BASE_SIZE })}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={formatId}>{t("format")}</Label>
                <Select
                    value={format}
                    onValueChange={(value) => onFormatChange(value as ExportFormat)}
                >
                    <SelectTrigger id={formatId} className="w-full border-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(FORMATS) as ExportFormat[]).map((value) => (
                            <SelectItem key={value} value={value}>
                                {t(`formats.${value}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <p className="text-sm text-muted-foreground">{t("note")}</p>
        </Tile>
    );
}
