# Animation Factory Docs and CLI

## Objective

公開済みの animation factory を、第三者が理解して使い始めやすい状態にするため、About / schema docs / CLI の次 tranche を GoalBuddy で進める。

この準備ターンでは実装しない。`state.yaml` の Scout -> Judge -> Worker -> Final audit に従い、最初の Worker slice を安全に選んでから実装する。

## Original Request

「project-goal-kanban 作成して、docsとCLIを進めていく方針で。CLI」

## Intake Summary

- Input shape: `existing_plan`
- Audience: サイト閲覧者、React 開発者、AI コーディングエージェントに `.animation.md` を渡したいユーザー、将来の自分
- Authority: board 作成は requested。実装は `/goal` 実行後に board の Worker task として進める。
- Proof type: artifact + test + deploy-ready verification
- Completion proof: About / schema docs / CLI の選択済み slice が実装され、`npm run verify` が通り、必要なら README / Obsidian 正本が更新されている。
- Likely misfire: board 作成前に CLI 実装へ飛び、package 公開方針、URL 固定、docs の正本との整合を曖昧にしたまま進めること。
- Blind spots considered:
  - Next.js 16 の仕様差分は `node_modules/next/dist/docs/` を確認してから実装する。
  - CLI は npm package 名、bin 名、BASE_URL の扱い、公開しないローカル実行の範囲を Judge が先に決める。
  - Docs は Obsidian が正本で、Web ページは公開用の派生物。仕様変更があれば Obsidian も更新する。
  - GitHub Actions CI/CD は整備済みなので、Worker は `npm run verify` を完了条件に含める。
- Existing plan facts:
  - Roadmap 上の残タスクは CLI と About / docs が優先。
  - Production URL は `https://animation-factory-five.vercel.app`。
  - CI/CD は GitHub Actions と Vercel production workflow で動作確認済み。
  - Phase 4 のユーザー投稿では DOMPurify 必須。今回 tranche では投稿・広告は触らない。

## Goal Kind

`existing_plan`

## Current Tranche

About / schema docs / CLI のうち、最初に進める安全な実装 slice を Scout と Judge で決め、Worker が 1 slice を実装できる状態まで board を動かす。CLI は候補に含めるが、package 公開や npm publish まではこの tranche の既定範囲にしない。

## Non-Negotiable Constraints

- Obsidian の Roadmap / log / Specs を正本として扱う。
- 仕様や方針を変えた場合は Obsidian も追記更新する。
- Worker は `allowed_files` の外を編集しない。
- Worker は `verify` を実行し、失敗したら receipt に記録する。
- CLI で外部公開、npm publish、課金、ユーザー投稿、広告、個人情報、認証、DB 変更はしない。
- Next.js 16 の App Router 実装に触れる前に、必要範囲の現行 docs または既存コードパターンを確認する。
- `.claude/` の未追跡ローカルファイルは今回の board/Worker scope に含めない。

## Stop Rule

この goal は、Judge が選んだ docs/CLI の Worker slice が実装・検証され、Final audit が「現 tranche の完了」と「残タスク」を `state.yaml` に記録したら停止する。

## Canonical Board

Machine truth lives at:

`docs/goals/animation-factory-docs-cli/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/animation-factory-docs-cli/goal.md.
```
