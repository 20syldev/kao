import type { ExportFormat } from "@/types/avatar";

// Size in pixels of the avatar as drawn by the engine, before scaling
export const BASE_SIZE = 180;

// Export scales offered to the user, from 360 px to 4320 px
export const SCALES = [2, 4, 8, 12, 16, 24] as const;

export const DEFAULT_SCALE = 8;

// Encoding of each format; every format but "png" is flattened on white
export const FORMATS: Record<ExportFormat, { mime: string; extension: string }> = {
    png: { mime: "image/png", extension: "png" },
    pngWhite: { mime: "image/png", extension: "png" },
    jpeg: { mime: "image/jpeg", extension: "jpg" },
    webp: { mime: "image/webp", extension: "webp" },
};

export const DEFAULT_FORMAT: ExportFormat = "png";
