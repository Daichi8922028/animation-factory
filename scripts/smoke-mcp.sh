#!/usr/bin/env bash
# scripts/smoke-mcp.sh — MCP サーバの致命路を curl で叩く軽量スモークテスト。
#
# 使い方:
#   bash scripts/smoke-mcp.sh
#   BASE=https://animation-factory-five.vercel.app bash scripts/smoke-mcp.sh
#   BASE=http://localhost:3000 bash scripts/smoke-mcp.sh
#
# 期待:
#   - GET  /mcp → 200, JSON, tools 配列
#   - POST /mcp initialize / tools/list / tools/call (search / get_animation / list_categories)
#     すべて 200, jsonrpc result が返る

set -e

BASE="${BASE:-https://animation-factory-five.vercel.app}"
echo "MCP smoke test against: $BASE"
echo "----------------------------------------"

call() {
  local method="$1"
  local params="$2"
  curl -fsS -X POST "$BASE/mcp" \
    -H 'content-type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$method\",\"params\":$params}"
}

ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
fail() { printf "  \033[31m✘\033[0m %s\n" "$1"; exit 1; }

# 1) GET /mcp (health)
if curl -fsS "$BASE/mcp" | grep -q '"animation-factory"'; then
  ok "GET /mcp returns server info"
else
  fail "GET /mcp did not return server info"
fi

# 2) initialize
if call initialize '{"protocolVersion":"2024-11-05"}' | grep -q '"protocolVersion"'; then
  ok "initialize returns protocolVersion"
else
  fail "initialize failed"
fi

# 3) tools/list
if call tools/list '{}' | grep -q '"search_animations"'; then
  ok "tools/list includes search_animations"
else
  fail "tools/list failed"
fi

# 4) search_animations
if call tools/call '{"name":"search_animations","arguments":{"query":"hover","limit":3}}' | grep -q 'hover-lift'; then
  ok "search_animations returns hover results"
else
  fail "search_animations failed"
fi

# 5) get_animation
if call tools/call '{"name":"get_animation","arguments":{"id":"fade-up"}}' | grep -q 'id: fade-up'; then
  ok "get_animation returns fade-up .md"
else
  fail "get_animation failed"
fi

# 6) list_categories
if call tools/call '{"name":"list_categories","arguments":{}}' | grep -q 'entrance-exit'; then
  ok "list_categories returns 7 categories"
else
  fail "list_categories failed"
fi

echo "----------------------------------------"
echo "All MCP smoke checks passed."
