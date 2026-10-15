import { FORMATS } from "@/data/export";
import type { ExportFormat, ExportPayload } from "@/types/avatar";

// Side in pixels of the thumbnails kept in the history
const THUMB_SIZE = 160;

/**
 * Decodes a base64 string into raw bytes.
 *
 * @param data - Base64 text as produced by the Base64 class bundled in MAIN.swf
 * @returns The decoded bytes
 */
function base64ToBytes(data: string) {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return bytes;
}

/**
 * Inflates zlib data with the browser's native DecompressionStream.
 *
 * @param bytes - Zlib stream, as written by ByteArray.compress() in ActionScript
 * @returns The decompressed bytes
 */
async function inflate(bytes: Uint8Array<ArrayBuffer>) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));

    return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Turns the pixels sent by MAIN.swf into a canvas. Ruffle only stubs BitmapData.encode(), so
 * the patched SWF ships BitmapData.getPixels() output: zlib-compressed, unpremultiplied ARGB.
 *
 * @param payload - Export payload received from the Flash bridge; only the "argb-zlib" format
 *   is understood
 * @returns A canvas holding the avatar with its transparency
 */
async function decodePixels(payload: ExportPayload) {
    if (payload.format !== "argb-zlib") throw new Error(`unexpected format ${payload.format}`);

    const argb = await inflate(base64ToBytes(payload.data));
    const canvas = document.createElement("canvas");
    canvas.width = payload.width;
    canvas.height = payload.height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("canvas unavailable");

    const image = context.createImageData(payload.width, payload.height);

    for (let i = 0; i < argb.length; i += 4) {
        image.data[i] = argb[i + 1];
        image.data[i + 1] = argb[i + 2];
        image.data[i + 2] = argb[i + 3];
        image.data[i + 3] = argb[i];
    }

    context.putImageData(image, 0, 0);

    return canvas;
}

/**
 * Draws a canvas on a white square, optionally resized.
 *
 * @param source - Canvas to flatten, square
 * @param size - Side of the result in pixels, the source side by default
 * @returns A new opaque canvas
 */
function flatten(source: HTMLCanvasElement, size = source.width) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("canvas unavailable");

    context.imageSmoothingQuality = "high";
    context.fillStyle = "white";
    context.fillRect(0, 0, size, size);
    context.drawImage(source, 0, 0, size, size);

    return canvas;
}

/**
 * Encodes a canvas into an image file.
 *
 * @param canvas - Canvas to encode
 * @param mime - Target MIME type; lossy formats use a 0.95 quality
 * @returns The encoded file
 */
function toBlob(canvas: HTMLCanvasElement, mime: string) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("encoding failed"))),
            mime,
            0.95,
        );
    });
}

/**
 * Builds the downloadable image and the history thumbnail of an export.
 *
 * @param payload - Export payload received from the Flash bridge
 * @param format - Format chosen by the user; only "png" keeps the transparency
 * @returns The image file and a small JPEG data URL for the history
 */
export async function renderAvatar(payload: ExportPayload, format: ExportFormat) {
    const canvas = await decodePixels(payload);
    const target = format === "png" ? canvas : flatten(canvas);
    const blob = await toBlob(target, FORMATS[format].mime);
    const thumb = flatten(canvas, THUMB_SIZE).toDataURL("image/jpeg", 0.85);

    return { blob, thumb };
}
