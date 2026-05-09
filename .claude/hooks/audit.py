#!/usr/bin/env python3
import sys, json, datetime, os

try:
    data = json.load(sys.stdin)
    log_path = os.path.expanduser("~/.claude/audit.log")
    entry = {
        "ts": datetime.datetime.utcnow().isoformat(),
        "tool": data.get("tool_name", data.get("tool", "")),
        "input": data.get("tool_input", {}),
    }
    with open(log_path, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
except Exception:
    pass

sys.exit(0)
