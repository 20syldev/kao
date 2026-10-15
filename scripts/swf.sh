#!/usr/bin/env bash
# Build public/MAIN.swf (the loader, with a local export instead of the dead PHP backend) by compiling
# flash/MainTimeline.as into the base container flash/loader.swf. The editor engine, public/engine.swf,
# is a committed binary: see scripts/engine.sh and CONTRIBUTING.md to change it.
set -euo pipefail

# shellcheck source=scripts/ffdec.sh
source "$(dirname "$0")/ffdec.sh"

ffdec -replace "$ROOT/flash/loader.swf" "$ROOT/public/MAIN.swf" MAIN_fla.MainTimeline "$ROOT/flash/MainTimeline.as"
echo "public/MAIN.swf built"
