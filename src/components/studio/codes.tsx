import { ClipboardPaste, FolderOpen, KeyRound, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Tile } from "@/components/studio/tile";
import { Button } from "@/components/ui/button";
import { CODE_EXTENSION } from "@/lib/codes";

export interface CodesPanelProps {
    onNew: () => void;
    onFile: (file: File) => void;
    onPaste: () => void;
}

/**
 * Entry points to the avatar codes: start over, reopen a .kao file or paste a code. The file
 * input stays hidden behind a regular button so it follows the button styles and focus ring.
 *
 * @param onNew - Starts a new avatar in the editor
 * @param onFile - Receives the file picked by the user
 * @param onPaste - Opens the paste dialog
 */
export function CodesPanel({ onNew, onFile, onPaste }: CodesPanelProps) {
    const t = useTranslations("studio.codes");
    const input = useRef<HTMLInputElement>(null);

    return (
        <Tile title={t("title")} icon={KeyRound}>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
            <div className="grid gap-2">
                <Button
                    onClick={onNew}
                    className="comic-lift justify-start border-2 shadow-comic-sm"
                >
                    <Plus aria-hidden="true" />
                    {t("new")}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => input.current?.click()}
                    className="comic-lift justify-start border-2 shadow-comic-sm"
                >
                    <FolderOpen aria-hidden="true" />
                    {t("open")}
                </Button>
                <Button
                    variant="outline"
                    onClick={onPaste}
                    className="comic-lift justify-start border-2 shadow-comic-sm"
                >
                    <ClipboardPaste aria-hidden="true" />
                    {t("paste")}
                </Button>
            </div>
            <input
                ref={input}
                type="file"
                accept={`.${CODE_EXTENSION},.json,.txt`}
                hidden
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) onFile(file);

                    event.target.value = "";
                }}
            />
        </Tile>
    );
}
