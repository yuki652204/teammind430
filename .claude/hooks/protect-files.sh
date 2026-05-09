#!/bin/bash
INPUT=$(cat)
TARGET=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | head -1 | cut -d'"' -f4)
PATTERNS=("\.env$" "\.env\..*" ".*\.pem$" ".*\.key$")
if [ -z "$TARGET" ]; then exit 0; fi
for p in "${PATTERNS[@]}"; do
  if echo "$TARGET" | grep -qE "$p"; then
    echo "BLOCKED: $TARGET" >&2
    exit 2
  fi
done
exit 0