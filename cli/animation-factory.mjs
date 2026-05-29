#!/usr/bin/env node
/**
 * animation-factory CLI — get .animation.md from the deployed catalog.
 *
 * 使い方:
 *   animation-factory get <id> [<id> ...] [--out <dir>]
 *   animation-factory kit <id> <id> ...
 *   animation-factory search <query> [--category <c>] [--release alpha|beta] [--limit N]
 *   animation-factory list-categories
 *   animation-factory list-by-tag <tag>
 *
 * 設定:
 *   --base / ANIMATION_FACTORY_URL で接続先を上書き
 *   デフォルト: https://animation-factory-five.vercel.app
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { argv, env, exit } from "node:process";

const DEFAULT_BASE = "https://animation-factory-five.vercel.app";

function parseArgs(args) {
  // very small parser: positional + --flag value
  const positional = [];
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function baseUrl(flags) {
  const v = flags.base || env.ANIMATION_FACTORY_URL || DEFAULT_BASE;
  return String(v).replace(/\/$/, "");
}

async function rpc(base, method, params) {
  const res = await fetch(`${base}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`MCP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(`${json.error.message} (${json.error.code})`);
  return json.result;
}

async function callTool(base, name, args) {
  const result = await rpc(base, "tools/call", { name, arguments: args });
  const text = result.content?.[0]?.text;
  if (!text) throw new Error("empty tool result");
  return text;
}

async function cmdGet(base, ids, flags) {
  const outDir = resolve(String(flags.out || "."));
  mkdirSync(outDir, { recursive: true });
  for (const id of ids) {
    process.stdout.write(`  ${id.padEnd(28)} `);
    try {
      const md = await callTool(base, "get_animation", { id });
      const out = join(outDir, `${id}.animation.md`);
      writeFileSync(out, md, "utf8");
      console.log(`→ ${out}`);
    } catch (e) {
      console.log(`fail: ${e.message}`);
    }
  }
}

async function cmdKit(base, ids, flags) {
  const outDir = resolve(String(flags.out || "."));
  mkdirSync(outDir, { recursive: true });
  process.stdout.write(`  kit (${ids.length} ids) `);
  // HTTP API の zip を直接落とす方が早い
  const url = `${base}/api/kit?ids=${encodeURIComponent(ids.join(","))}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`fail: ${res.status} ${await res.text()}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = join(outDir, `animation-kit-${ids.length}.zip`);
  writeFileSync(out, buf);
  console.log(`→ ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function cmdSearch(base, positional, flags) {
  const query = positional.join(" ").trim();
  const args = { limit: Number(flags.limit ?? 12) };
  if (query) args.query = query;
  if (flags.category) args.category = String(flags.category);
  if (flags.release) args.release = String(flags.release);
  if (flags.tag) args.tag = String(flags.tag);
  const text = await callTool(base, "search_animations", args);
  const data = JSON.parse(text);
  console.log(`${data.returned}/${data.total} match`);
  for (const it of data.items) {
    console.log(
      `  ${it.id.padEnd(28)} [${it.release}] ${it.category.padEnd(18)} ${it.name}`,
    );
  }
}

async function cmdListCategories(base) {
  const text = await callTool(base, "list_categories", {});
  for (const c of JSON.parse(text)) {
    console.log(`  ${c.id.padEnd(18)} ${String(c.count).padStart(3)}  ${c.label}`);
  }
}

async function cmdListByTag(base, tag) {
  const text = await callTool(base, "list_by_tag", { tag });
  const data = JSON.parse(text);
  console.log(`#${data.tag} (${data.count})`);
  for (const it of data.items) {
    console.log(`  ${it.id.padEnd(28)} [${it.release}] ${it.name}`);
  }
}

function usage() {
  console.log(`animation-factory — fetch .animation.md from the catalog.

USAGE
  animation-factory <command> [args] [--flags]

COMMANDS
  get <id> [<id> ...]            個別 .md を取得（--out で出力先指定、デフォルトは ./）
  kit <id> <id> ...              複数 .md を 1 つの zip で取得
  search [query] [--category C] [--release alpha|beta] [--tag T] [--limit N]
                                 自然言語検索 + ファセット絞り込み
  list-categories                全 7 カテゴリ一覧
  list-by-tag <tag>              タグごとの一覧
  help                           このメッセージ

FLAGS
  --base <url>                   接続先（デフォルト ${DEFAULT_BASE}、env: ANIMATION_FACTORY_URL でも可）
  --out <dir>                    保存先ディレクトリ

EXAMPLES
  animation-factory get fade-up hover-lift
  animation-factory kit fade-up hover-lift scroll-reveal --out ./animations
  animation-factory search "ホバー" --category hover-press --release alpha
  animation-factory search --tag gsap`);
}

async function main() {
  const rawArgs = argv.slice(2);
  if (rawArgs.length === 0 || rawArgs[0] === "help" || rawArgs[0] === "--help") {
    usage();
    return;
  }
  // 引数全体から flags / positional を抜き、最初の positional を command として扱う
  const all = parseArgs(rawArgs);
  if (all.positional.length === 0) {
    console.error("error: missing command");
    usage();
    exit(1);
  }
  const cmd = all.positional[0];
  const positional = all.positional.slice(1);
  const flags = all.flags;
  const base = baseUrl(flags);

  try {
    switch (cmd) {
      case "get":
        if (positional.length === 0) {
          console.error("error: get requires at least one id");
          exit(1);
        }
        await cmdGet(base, positional, flags);
        break;
      case "kit":
        if (positional.length === 0) {
          console.error("error: kit requires at least one id");
          exit(1);
        }
        await cmdKit(base, positional, flags);
        break;
      case "search":
        await cmdSearch(base, positional, flags);
        break;
      case "list-categories":
        await cmdListCategories(base);
        break;
      case "list-by-tag":
        if (positional.length === 0) {
          console.error("error: list-by-tag requires a tag");
          exit(1);
        }
        await cmdListByTag(base, positional[0]);
        break;
      default:
        console.error(`unknown command: ${cmd}`);
        usage();
        exit(1);
    }
  } catch (e) {
    console.error(`error: ${e.message}`);
    exit(1);
  }
}

main();
