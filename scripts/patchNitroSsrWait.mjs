import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

try {
  const nitroPkg = require.resolve("nitro/package.json");
  const target = join(
    dirname(nitroPkg),
    "dist/runtime/internal/vite/dev-worker.mjs",
  );

  if (!existsSync(target)) {
    console.warn("[patch] nitro SSR wait file missing; skipped");
    process.exit(0);
  }

  const src = readFileSync(target, "utf8");

  const from = `for (let i = 0; i < 5 && !(this.entry || this.entryError); i++) {
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, i)));
    }
    if (this.entryError) {
      throw this.entryError;
    }
    if (!this.entry) {
      throw httpError(503, \`Vite environment "\${this.name}" is unavailable\`);
    }`;

  const to = `// Wait up to ~30s for cold SSR graph transforms (nitrojs/nitro#4295).
    for (let i = 0; i < 600 && !(this.entry || this.entryError); i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (this.entryError) {
      throw this.entryError;
    }
    if (!this.entry) {
      throw httpError(503, \`Vite environment "\${this.name}" is unavailable\`);
    }`;

  if (src.includes(from)) {
    writeFileSync(target, src.replace(from, to));
    console.log("[patch] nitro SSR cold-start wait extended");
  } else if (
    src.includes(
      "for (let i = 0; i < 600 && !(this.entry || this.entryError); i++)",
    )
  ) {
    console.log("[patch] nitro SSR cold-start wait already applied");
  } else {
    console.warn("[patch] nitro SSR wait pattern not found; skipped");
  }
} catch (error) {
  console.warn("[patch] nitro SSR wait patch skipped:", error.message);
}
