#!/usr/bin/env bash
# Helper to read and change the editor engine, public/engine.swf (ActionScript 2).
#
# Usage: engine.sh scripts [dir]               export every script as .as files (default tools/engine)
#        engine.sh texts [dir]                 export the text fields (default tools/engine-texts)
#        engine.sh xml [file]                  dump the whole structure as XML (default tools/engine.xml)
#        engine.sh compile <script> <file.as>  put an edited script back into public/engine.swf
#
# <script> is the path ffdec shows in the scripts folder without the ".as", with a leading slash,
# for example /frame_62/DoAction. Set ENGINE to work on another copy of the file.
set -euo pipefail

# shellcheck source=scripts/ffdec.sh
source "$(dirname "$0")/ffdec.sh"

ENGINE="${ENGINE:-$ROOT/public/engine.swf}"

case "${1:-}" in
    scripts)
        out="${2:-$ROOT/tools/engine}"
        mkdir -p "$out"
        ffdec -export script "$out" "$ENGINE" > /dev/null
        echo "scripts exported to $out/scripts"
        ;;
    texts)
        out="${2:-$ROOT/tools/engine-texts}"
        mkdir -p "$out"
        ffdec -format text:formatted -export text "$out" "$ENGINE" > /dev/null
        echo "texts exported to $out"
        ;;
    xml)
        out="${2:-$ROOT/tools/engine.xml}"
        mkdir -p "$(dirname "$out")"
        ffdec -swf2xml "$ENGINE" "$out" > /dev/null
        echo "structure written to $out"
        ;;
    compile)
        [[ $# -eq 3 ]] || { sed -n '2,11p' "$0" >&2; exit 1; }
        script="$2"
        file="$3"
        tmp="$(mktemp)"
        ffdec -replace "$ENGINE" "$tmp" "$script" "$file"
        mv "$tmp" "$ENGINE"
        echo "$script compiled into $ENGINE"
        ;;
    *)
        sed -n '2,11p' "$0" >&2
        exit 1
        ;;
esac
