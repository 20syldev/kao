export type ExportFormat = "png" | "pngWhite" | "jpeg" | "webp";

export interface ExportPayload {
    format: string;
    data: string;
    width: number;
    height: number;
    ida: string | null;
    name: string | null;
}

export interface AvatarCode {
    name: string;
    ida: string;
}

export interface SavedAvatar extends AvatarCode {
    thumb: string;
    date: string;
}

export interface ExportResult {
    name: string;
    ida: string | null;
    url: string;
    filename: string;
    width: number;
    height: number;
    bytes: number;
}
