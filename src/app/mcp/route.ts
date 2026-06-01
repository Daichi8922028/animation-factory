import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "@/lib/animations";
import { CATEGORIES, loadCatalogIndex } from "@/lib/catalog";
import { SITE } from "@/lib/site";

/**
 * /mcp — Remote MCP server（stateless HTTP transport）。
 *
 * 設計方針:
 * - SDK を使わず JSON-RPC 2.0 を素で実装。Edge / Node どちらでも動かしやすい、依存ゼロ。
 * - stateless: 各 POST が独立した RPC リクエスト。セッション管理なし。
 * - 対応 MCP メソッド: initialize / tools/list / tools/call / notifications/*
 * - 用途: Claude Code / Cursor / Cline 等の MCP クライアントから、
 *   検索 → 取得 → AI Apply Prompt 適用までを自律的にやれるようにする。
 *
 * クライアントからの登録例:
 *   claude mcp add animation-factory --transport http https://animation-factory-five.vercel.app/mcp
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_INFO = { name: "animation-factory", version: "1.0.0" };

const ID_RE = /^[a-z][a-z0-9-]{2,63}$/;
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** tool 定義。AI が `tools/list` で見て自分で使い方を理解する。 */
const TOOLS = [
  {
    name: "search_animations",
    description:
      "Search the animation catalog by free-text query, category, and release version. " +
      "Returns matching animations with id, name, description, category, release, tags. " +
      "Use this first to discover what's available, then call get_animation for the full .md.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Free text. Matches name, description, tags, and ai.intent_examples (case-insensitive substring).",
        },
        category: {
          type: "string",
          enum: CATEGORY_IDS,
          description: "UX role-based category (one of 7).",
        },
        release: {
          type: "string",
          description:
            "Release version the animation was added in (e.g. v1.0, v1.1).",
        },
        tag: {
          type: "string",
          description: "Single tag to filter by.",
        },
        limit: {
          type: "number",
          default: 12,
          description: "Max number of results to return.",
        },
      },
    },
  },
  {
    name: "get_animation",
    description:
      "Fetch the full .animation.md content for a given id. Includes frontmatter (taxonomy, parameters, a11y, dependencies, etc.) and body (Overview, Implementation, Usage, AI Apply Prompt, Verify, Accessibility, Performance Notes). " +
      "The AI Apply Prompt section at the end is designed to be applied directly to a target file.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
          description: "Animation id like 'fade-up' or 'hover-lift'.",
        },
      },
    },
  },
  {
    name: "list_categories",
    description:
      "List the 7 navigation categories with description and count of animations in each. " +
      "Use this to orient yourself before searching.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_by_tag",
    description:
      "List animations with a specific tag. Tags are free-text labels like 'hover', 'fade', 'svg', 'gsap', 'modal'.",
    inputSchema: {
      type: "object",
      required: ["tag"],
      properties: { tag: { type: "string" } },
    },
  },
  {
    name: "get_kit",
    description:
      "Fetch multiple animation .md files joined into a single markdown document, suitable for pasting to an AI when you need several animations at once. Max 50 ids.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          maxItems: 50,
          description: "Array of animation ids.",
        },
      },
    },
  },
] as const;

/** JSON-RPC レスポンス用のエラーを投げるためのヘルパ */
class RpcError extends Error {
  code: number;
  data?: unknown;
  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

type ToolArgs = Record<string, unknown>;

function readRawMd(id: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, `${id}.animation.md`), "utf8");
}

async function callTool(
  name: string,
  args: ToolArgs,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const idx = loadCatalogIndex();

  switch (name) {
    case "search_animations": {
      const q = String(args.query ?? "").toLowerCase().trim();
      const cat = args.category as string | undefined;
      const rel = args.release as string | undefined;
      const tag = args.tag as string | undefined;
      const limit = Math.min(Math.max(Number(args.limit ?? 12), 1), 50);

      let results = idx.animations;
      if (q) results = results.filter((a) => a.searchText.includes(q));
      if (cat) results = results.filter((a) => a.category === cat);
      if (rel) results = results.filter((a) => a.release === rel);
      if (tag) results = results.filter((a) => a.tags.includes(tag));

      const items = results.slice(0, limit).map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        release: a.release,
        description: a.description,
        tags: a.tags,
        trigger: a.triggerPrimary,
        lifecycle: a.lifecycle,
        perf_cost: a.perfCost,
        url: `${SITE.baseUrl}/a/${a.id}`,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { total: results.length, returned: items.length, items },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "get_animation": {
      const id = String(args.id ?? "");
      if (!ID_RE.test(id)) {
        throw new RpcError(-32602, `Invalid id format: ${id}`);
      }
      const file = path.join(CONTENT_DIR, `${id}.animation.md`);
      if (!fs.existsSync(file)) {
        throw new RpcError(-32602, `Animation not found: ${id}`);
      }
      return { content: [{ type: "text", text: readRawMd(id) }] };
    }

    case "list_categories": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              idx.categories.map((c) => {
                const meta = CATEGORIES.find((x) => x.id === c.id);
                return {
                  id: c.id,
                  label: c.label,
                  description: meta?.description ?? "",
                  count: c.count,
                  url: `${SITE.baseUrl}/c/${c.id}`,
                };
              }),
              null,
              2,
            ),
          },
        ],
      };
    }

    case "list_by_tag": {
      const tag = String(args.tag ?? "");
      const items = idx.animations
        .filter((a) => a.tags.includes(tag))
        .map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          release: a.release,
          description: a.description,
          url: `${SITE.baseUrl}/a/${a.id}`,
        }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { tag, count: items.length, items },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "get_kit": {
      const ids = Array.isArray(args.ids) ? (args.ids as string[]) : [];
      if (ids.length === 0) {
        throw new RpcError(-32602, "ids array is empty");
      }
      if (ids.length > 50) {
        throw new RpcError(-32602, "max 50 ids");
      }
      const parts: string[] = [];
      const skipped: string[] = [];
      for (const id of ids) {
        if (!ID_RE.test(id)) {
          skipped.push(`${id} (invalid id format)`);
          continue;
        }
        const file = path.join(CONTENT_DIR, `${id}.animation.md`);
        if (!fs.existsSync(file)) {
          skipped.push(`${id} (not found)`);
          continue;
        }
        parts.push(
          `<!-- ====== ${id} ====== -->\n\n${readRawMd(id).trim()}\n`,
        );
      }
      const text =
        parts.join("\n---\n\n") +
        (skipped.length > 0
          ? `\n\n<!-- skipped: ${skipped.join(", ")} -->`
          : "");
      return { content: [{ type: "text", text }] };
    }

    default:
      throw new RpcError(-32601, `Unknown tool: ${name}`);
  }
}

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

async function handleMethod(req: JsonRpcRequest): Promise<unknown> {
  switch (req.method) {
    case "initialize": {
      const clientProtocol =
        (req.params?.protocolVersion as string | undefined) ?? "2024-11-05";
      return {
        protocolVersion: clientProtocol,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      };
    }
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call": {
      const params = (req.params ?? {}) as { name?: string; arguments?: ToolArgs };
      if (!params.name) throw new RpcError(-32602, "missing tool name");
      return await callTool(params.name, params.arguments ?? {});
    }
    case "ping":
      return {};
    // 通知系（response 不要）
    case "notifications/initialized":
    case "notifications/cancelled":
    case "notifications/progress":
      return null;
    default:
      throw new RpcError(-32601, `Method not found: ${req.method}`);
  }
}

function buildResponse(
  id: string | number | null | undefined,
  result?: unknown,
  error?: { code: number; message: string; data?: unknown },
) {
  const base = { jsonrpc: "2.0" as const, id: id ?? null };
  return error ? { ...base, error } : { ...base, result };
}

async function processOne(req: JsonRpcRequest) {
  try {
    const result = await handleMethod(req);
    if (result === null) return null; // notification, no response
    return buildResponse(req.id, result);
  } catch (e) {
    const err =
      e instanceof RpcError
        ? { code: e.code, message: e.message, data: e.data }
        : { code: -32603, message: (e as Error).message ?? "Internal error" };
    return buildResponse(req.id, undefined, err);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      buildResponse(null, undefined, { code: -32700, message: "Parse error" }),
      { status: 400 },
    );
  }

  // バッチ対応: 配列なら並列に処理
  if (Array.isArray(body)) {
    const responses = (
      await Promise.all(body.map((b) => processOne(b as JsonRpcRequest)))
    ).filter((r): r is NonNullable<typeof r> => r !== null);
    if (responses.length === 0) return new Response(null, { status: 204 });
    return Response.json(responses);
  }

  const r = await processOne(body as JsonRpcRequest);
  if (r === null) return new Response(null, { status: 204 });
  return Response.json(r);
}

export async function GET() {
  // SSE は未対応。簡易な health check として info を返す。
  return Response.json({
    server: SERVER_INFO,
    transport: "http",
    methods: ["POST"],
    tools: TOOLS.map((t) => t.name),
    description:
      "animation-factory MCP server. POST JSON-RPC 2.0 requests. " +
      "Register: claude mcp add animation-factory --transport http " +
      `${SITE.baseUrl}/mcp`,
  });
}
