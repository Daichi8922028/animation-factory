/**
 * content/animations/ の全 .animation.md を v1.0 スキーマで検証する。
 * 使い方: npm run check:content
 * 1 件でも失敗すれば exit code 1。
 */
import { loadAllAnimations, listAnimationFiles } from "../src/lib/animations";

function main() {
  const files = listAnimationFiles();
  if (files.length === 0) {
    console.log("content/animations/ に .animation.md がありません。");
    process.exit(0);
  }

  const { animations, failures } = loadAllAnimations();

  for (const a of animations) {
    console.log(
      `  OK  ${a.file}  [${a.frontmatter.release}] ${a.frontmatter.taxonomy.ux_role.primary} / ${a.frontmatter.behavior.lifecycle}`,
    );
  }
  for (const f of failures) {
    console.log(`  NG  ${f.file}`);
    for (const e of f.errors) console.log(`        - ${e}`);
  }

  console.log("");
  console.log(
    `${files.length} 件中 ${animations.length} 件 OK / ${failures.length} 件 NG`,
  );
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
