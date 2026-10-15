import type { ExportPayload } from "@/types/avatar";

export interface RuffleLoadOptions {
    url: string;
    base: string;
    parameters: Record<string, string>;
    allowScriptAccess: boolean;
}

export interface RuffleApi {
    load: (options: RuffleLoadOptions) => Promise<void>;
}

export interface RufflePlayerElement extends HTMLElement {
    ruffle?: () => RuffleApi;
    load?: (options: RuffleLoadOptions) => Promise<void>;
}

export interface RuffleSource {
    createPlayer: () => RufflePlayerElement;
}

export interface RuffleGlobal {
    config?: Record<string, unknown>;
    newest?: () => RuffleSource | null;
}

declare global {
    interface Window {
        RufflePlayer?: RuffleGlobal;
        kaoExport?: (payload: ExportPayload) => boolean;
        kaoExportScale?: () => number;
        popup?: (url: string) => void;
    }
}
