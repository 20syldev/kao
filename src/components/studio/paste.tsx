import { useTranslations } from "next-intl";
import { useId, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseCode } from "@/lib/codes";
import type { AvatarCode } from "@/types/avatar";

export interface PasteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (code: AvatarCode) => void;
}

/**
 * Dialog with a text area to paste an avatar code. An invalid code keeps the dialog open and
 * shows an inline error tied to the field; the field is cleared whenever the dialog closes.
 *
 * @param open - Whether the dialog is shown
 * @param onOpenChange - Called when the dialog opens or closes
 * @param onSubmit - Receives the parsed code, after which the dialog closes
 */
export function PasteDialog({ open, onOpenChange, onSubmit }: PasteDialogProps) {
    const t = useTranslations("studio.paste");
    const fieldId = useId();
    const errorId = useId();
    const [value, setValue] = useState("");
    const [invalid, setInvalid] = useState(false);

    const changeOpen = (next: boolean) => {
        if (!next) {
            setValue("");
            setInvalid(false);
        }

        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent className="border-2 shadow-comic-lg sm:max-w-lg">
                <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const code = parseCode(value);

                        if (!code) {
                            setInvalid(true);

                            return;
                        }

                        onSubmit(code);
                        changeOpen(false);
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="font-display text-title">{t("title")}</DialogTitle>
                        <DialogDescription>{t("description")}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor={fieldId}>{t("label")}</Label>
                        <Textarea
                            id={fieldId}
                            value={value}
                            rows={6}
                            aria-invalid={invalid}
                            aria-describedby={invalid ? errorId : undefined}
                            onChange={(event) => {
                                setValue(event.target.value);
                                setInvalid(false);
                            }}
                            className="border-2 font-mono text-xs"
                        />
                        {invalid && (
                            <p id={errorId} role="alert" className="text-sm text-destructive">
                                {t("invalid")}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="comic-lift border-2 shadow-comic-sm"
                            >
                                {t("cancel")}
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="comic-lift border-2 shadow-comic-sm">
                            {t("submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
