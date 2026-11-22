#!/bin/sh
set -eu

DATA_DIR="/emulator/data/snapshot"
mkdir -p /emulator/data

if [ -f "$DATA_DIR/firebase-export-metadata.json" ]; then
  exec firebase emulators:start \
    --only auth \
    --project demo-casepilot-local \
    --import="$DATA_DIR" \
    --export-on-exit="$DATA_DIR"
fi

exec firebase emulators:start \
  --only auth \
  --project demo-casepilot-local \
  --export-on-exit="$DATA_DIR"
