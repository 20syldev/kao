#!/usr/bin/env bash
# Launch the editor in a standalone browser window, served from localhost.
# Serves the static build in out/ (run "npm run build" first from a clone; release bundles ship it).
# Usage: ./start.sh            open the editor
#        ./start.sh --install  add a launcher to the desktop applications menu
set -euo pipefail

ROOT="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
# Fixed port: the avatar history lives in localStorage, which is bound to the origin.
PORT="${KAO_PORT:-7712}"
SITE="$ROOT/out"
URL="http://127.0.0.1:${PORT}/"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/kao"

if [[ "${1:-}" == "--install" ]]; then
    APPS="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
    mkdir -p "$APPS"
    cat > "$APPS/kao.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Kao
Comment=Manga avatar editor
Exec="$ROOT/start.sh"
Icon=$SITE/icon.png
Terminal=false
Categories=Graphics;
EOF
    echo "Installed $APPS/kao.desktop"
    exit 0
fi

SERVER_PID=""
cleanup() {
    if [[ -n "$SERVER_PID" ]]; then
        kill "$SERVER_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

if [[ ! -f "$SITE/index.html" ]]; then
    echo "No build found in $SITE: run \"npm ci && npm run build\" first." >&2
    exit 1
fi

if ! curl -fs -o /dev/null "${URL}MAIN.swf"; then
    python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SITE" >/dev/null 2>&1 &
    SERVER_PID=$!
    for _ in $(seq 50); do
        curl -fs -o /dev/null "${URL}MAIN.swf" && break
        sleep 0.1
    done
fi

# The app ships its own translations: mark them as "never translate" in the dedicated profile, as
# the flag and the page hints alone do not stop the bubble in every Chrome version.
mkdir -p "$DATA_DIR/browser/Default"
python3 - "$DATA_DIR/browser/Default/Preferences" <<'PY' || true
import json, sys

path = sys.argv[1]
try:
    with open(path) as file:
        prefs = json.load(file)
except (OSError, ValueError):
    prefs = {}
prefs.setdefault("translate", {})["enabled"] = False
blocked = prefs.get("translate_blocked_languages", [])
prefs["translate_blocked_languages"] = sorted(set(blocked) | {"en", "fr"})
with open(path, "w") as file:
    json.dump(prefs, file)
PY

for browser in google-chrome google-chrome-stable chromium chromium-browser brave-browser; do
    if command -v "$browser" >/dev/null; then
        # Dedicated profile: the call blocks until the window is closed, then the server stops.
        "$browser" --app="$URL" --user-data-dir="$DATA_DIR/browser" --window-size=1280,860 \
            --no-first-run --no-default-browser-check --disable-features=Translate,TranslateUI >/dev/null 2>&1
        exit 0
    fi
done

xdg-open "$URL" >/dev/null 2>&1 || echo "Open $URL in your browser."
if [[ -n "$SERVER_PID" ]]; then
    echo "Editor running at $URL, press Ctrl+C to stop."
    wait "$SERVER_PID"
fi
