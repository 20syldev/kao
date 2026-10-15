#!/usr/bin/env bash
# Shared by the SWF scripts: makes sure the pinned ffdec (Flash decompiler) is downloaded, then
# defines ffdec(), a function that runs it. Source it, do not execute it.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FFDEC_VERSION="26.3.0"
# SHA-256 of ffdec_${FFDEC_VERSION}.zip: a third-party release must never change under our feet.
FFDEC_SHA256="35f4930eb7c380afe66f2117f90b006deac0631473ad7500bb39c78f68645ecd"
FFDEC_DIR="$ROOT/tools/ffdec"
FFDEC_JAR="$FFDEC_DIR/ffdec.jar"

if [[ ! -f "$FFDEC_JAR" ]]; then
    mkdir -p "$FFDEC_DIR"
    curl -sSL "https://github.com/jindrapetrik/jpexs-decompiler/releases/download/version${FFDEC_VERSION}/ffdec_${FFDEC_VERSION}.zip" -o "$ROOT/tools/ffdec.zip"
    if ! echo "$FFDEC_SHA256  $ROOT/tools/ffdec.zip" | sha256sum -c --quiet -; then
        echo "ffdec_${FFDEC_VERSION}.zip does not match its pinned SHA-256, refusing to use it." >&2
        exit 1
    fi
    unzip -qo "$ROOT/tools/ffdec.zip" -d "$FFDEC_DIR"
    rm "$ROOT/tools/ffdec.zip"
fi

ffdec() {
    java -jar "$FFDEC_JAR" "$@"
}
