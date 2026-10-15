import { useEffect, useEffectEvent } from "react";

import type { ExportPayload } from "@/types/avatar";

/**
 * Exposes the functions the patched MAIN.swf calls through ExternalInterface when the user
 * saves: kaoExportScale() for the export scale and kaoExport() with the rendered pixels.
 *
 * @param scale - Export scale returned to the SWF, read at call time
 * @param onExport - Receives each export payload, outside of the Flash call
 */
export function useExportBridge(scale: number, onExport: (payload: ExportPayload) => void) {
    const currentScale = useEffectEvent(() => scale);
    const handleExport = useEffectEvent(onExport);

    useEffect(() => {
        window.kaoExportScale = () => currentScale();
        window.kaoExport = (payload) => {
            // Flash blocks until this returns: decode on the next task instead
            setTimeout(() => handleExport(payload), 0);

            return true;
        };

        // The engine calls popup() to open pages of a website this app does not have
        window.popup = () => {};

        return () => {
            delete window.kaoExport;
            delete window.kaoExportScale;
            delete window.popup;
        };
    }, []);
}
