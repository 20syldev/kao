/**
 * Saves a file through a temporary link, then releases its object URL.
 *
 * @param content - File content; a string is saved as UTF-8 text
 * @param filename - Suggested name in the save dialog
 * @param type - MIME type used when the content is a string
 */
export function downloadFile(content: Blob | string, filename: string, type = "text/plain") {
    const blob = typeof content === "string" ? new Blob([content], { type }) : content;
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: filename });

    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
