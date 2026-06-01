import { z } from "zod";

/**
 * animation.md スキーマ v1.0 の Zod 定義。
 * 設計の真正本は Obsidian: Specs/animation-md-schema（v1.0 確定）。
 * 破壊的変更は v2.0 扱い。v1.x は後方互換の追加のみ。
 */

export const baselineEnum = z.enum([
  "limited",
  "newly-available",
  "widely-available",
]);

export const costEnum = z.enum(["low", "medium", "high"]);

const browserSupport = z.object({
  baseline: baselineEnum,
  baseline_year: z.number().nullable().optional(),
  notes: z.string().optional(),
});

const performance = z.object({
  gpu_accelerated: z.boolean(),
  layout_thrash: z.boolean(),
  cost: costEnum,
  notes: z.string().optional(),
});

const dependency = z.object({
  name: z.string(),
  version: z.string(),
  purpose: z.string().optional(),
});

const peerDependency = z.object({
  name: z.string(),
  version: z.string(),
});

const implementation = z.object({
  tier: z.number().int(),
  name: z.string(),
  dependencies: z.array(dependency).optional(),
  browser_support: browserSupport,
  performance,
  degrades_to: z.number().int().optional(),
  degradation: z.string().optional(),
});

const taxonomy = z.object({
  layer: z.array(z.string()).min(1),
  ux_role: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional(),
  }),
  trigger: z.array(z.string()).min(1),
  media: z.array(z.string()).min(1),
  authoring: z.enum(["code", "asset", "hybrid"]),
});

const behavior = z.object({
  lifecycle: z.enum(["oneshot", "continuous", "toggle", "scroll-linked"]),
  reversible: z.boolean().optional(),
  replay: z.enum(["once", "every-entry"]).optional(),
});

const triggerObject = z.object({
  primary: z.string(),
  touch_fallback: z.enum(["disabled", "tap-toggle", "always-on"]).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const parameter = z.object({
  name: z.string(),
  type: z.string(),
  default: z.unknown().optional(),
  range: z.array(z.unknown()).optional(),
  values: z.array(z.unknown()).optional(),
  description: z.string().optional(),
});

const composeRef = z.object({
  id: z.string(),
  note: z.string().optional(),
});

/** フロントマター全体。§6 の必須キーは required、それ以外は optional。 */
export const animationFrontmatterSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]{2,63}$/, {
      message: "id は ^[a-z][a-z0-9-]{2,63}$ に一致する必要があります",
    }),
    name: z.string(),
    version: z.string(),
    release: z.string().regex(/^v\d+\.\d+$/, {
      message: "release は追加バージョン vX.Y 形式（例: v1.0 / v1.1）である必要があります",
    }),
    variant: z.string().optional(),
    description: z.string(),
    taxonomy,
    behavior,
    tags: z.array(z.string()).min(1),
    trigger: triggerObject,
    runtime: z.object({
      language: z.string(),
      framework: z.string().nullable().optional(),
      framework_version: z.string().nullable().optional(),
      bundler: z.string().nullable().optional(),
    }),
    dependencies: z.array(dependency).optional(),
    peer_dependencies: z.array(peerDependency).optional(),
    implementations: z.array(implementation).min(1),
    browser_support: browserSupport,
    performance,
    parameters: z.array(parameter).optional(),
    a11y: z
      .object({
        respects_reduced_motion: z.boolean(),
        fallback: z.string().optional(),
        focus_safe: z.boolean().optional(),
        notes: z.string().optional(),
      })
      .optional(),
    license: z.string(),
    authors: z.array(z.string()).optional(),
    sources: z.array(z.record(z.string(), z.unknown())).optional(),
    attribution_required: z.boolean().optional(),
    preview: z
      .object({
        url: z.string().optional(),
        thumbnail: z.string().optional(),
        loop: z.boolean().optional(),
        duration_ms: z.number().optional(),
      })
      .optional(),
    related: z
      .object({
        alternatives: z.array(z.string()).optional(),
        composes_with: z.array(composeRef).optional(),
        requires: z.array(z.string()).optional(),
      })
      .optional(),
    sections: z
      .object({
        skip: z.array(z.string()),
      })
      .optional(),
    ai: z
      .object({
        intent_examples: z.array(z.string()).optional(),
        apply_targets: z.array(z.string()).optional(),
        do_not_apply_to: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // trigger.primary は taxonomy.trigger[0] と一致（§2.2）
    if (data.trigger.primary !== data.taxonomy.trigger[0]) {
      ctx.addIssue({
        code: "custom",
        path: ["trigger", "primary"],
        message: `trigger.primary (${data.trigger.primary}) は taxonomy.trigger[0] (${data.taxonomy.trigger[0]}) と一致する必要があります`,
      });
    }
    // implementations[].tier は一意（§2.3）
    const tiers = data.implementations.map((i) => i.tier);
    if (new Set(tiers).size !== tiers.length) {
      ctx.addIssue({
        code: "custom",
        path: ["implementations"],
        message: "implementations[].tier は一意である必要があります",
      });
    }
    // ux_role.secondary は primary と重複しない（§2 / §6）
    const secondary = data.taxonomy.ux_role.secondary ?? [];
    if (secondary.includes(data.taxonomy.ux_role.primary)) {
      ctx.addIssue({
        code: "custom",
        path: ["taxonomy", "ux_role", "secondary"],
        message: "ux_role.secondary は primary と重複してはいけません",
      });
    }
  });

export type AnimationFrontmatter = z.infer<typeof animationFrontmatterSchema>;
