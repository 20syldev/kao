import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom theme scales of globals.css, so that "shadow-comic" overrides "shadow-sm" and
// "text-title" is read as a font size, not as a color
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            shadow: ["comic-sm", "comic", "comic-lg"],
            text: ["display", "title"],
        },
    },
});

/**
 * Joins class names and resolves Tailwind conflicts, the last class winning.
 *
 * @param inputs - Class values in any form accepted by clsx (strings, arrays, conditional objects)
 * @returns A single class string without conflicting utilities
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
