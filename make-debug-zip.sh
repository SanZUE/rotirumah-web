#!/usr/bin/env bash

set -e

PROJECT_DIR="rotirumah-web"
OUTPUT="rotirumah-web-debug.zip"

echo "Membuat ZIP: $OUTPUT"
echo "Mengecualikan node_modules, .next, .git, dan file .env rahasia..."

rm -f "$OUTPUT"

zip -r "$OUTPUT" "$PROJECT_DIR" \
  -x "$PROJECT_DIR/node_modules/*" \
  -x "$PROJECT_DIR/.next/*" \
  -x "$PROJECT_DIR/.git/*" \
  -x "$PROJECT_DIR/.env" \
  -x "$PROJECT_DIR/.env.local" \
  -x "$PROJECT_DIR/.env.*" \
  -x "$PROJECT_DIR/.DS_Store"

echo
echo "ZIP selesai dibuat:"
ls -lh "$OUTPUT"
