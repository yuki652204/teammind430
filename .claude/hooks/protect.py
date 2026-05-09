#!/usr/bin/env python3
import sys, json, re

# ブロック対象パターン
BLOCK_PATTERNS = [
    r'\.env$',
    r'\.env\.',
    r'.*\.pem$',
    r'.*\.key$',
]

# 例外パターン（allow-list）
# これにマッチするファイルはブロックしない
ALLOW_PATTERNS = [
    r'\.env\.example$',      # サンプルファイルは通す
    r'\.env\.local\.example$', # サンプルファイルは通す
    r'\.env\.template$',     # テンプレートは通す
    r'.*\.pubkey$',          # 公開鍵は通す（秘密鍵ではない）
]

try:
    data = json.load(sys.stdin)
    target = data.get('path') or data.get('file_path') or ''

    if not target:
        sys.exit(0)

    # allow-listに一致する場合は通す
    for allow in ALLOW_PATTERNS:
        if re.search(allow, target):
            sys.exit(0)

    # ブロックパターンに一致する場合はブロック
    for block in BLOCK_PATTERNS:
        if re.search(block, target):
            print(f"BLOCKED: {target}", file=sys.stderr)
            print(f"理由: 機密ファイルへのアクセスはブロックされています", file=sys.stderr)
            print(f"正当な作業の場合は .env.example を使うか、手動で編集してください", file=sys.stderr)
            sys.exit(2)

except Exception as e:
    # エラーが起きても通す（フックのエラーでClaude Codeを止めない）
    pass

sys.exit(0)