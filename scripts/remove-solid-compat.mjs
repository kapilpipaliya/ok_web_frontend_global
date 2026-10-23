#!/usr/bin/env node
/**
 * Remove ~/lib/removed-compat:
 * - rewrite imports to solid-js (StoreSetter as SetStoreFunction)
 * - unwrap batch(() => ...) when batch is no longer imported
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

const SKIP = new Set([
  path.join(SRC, "lib/removed-compat/store.ts"),
  path.join(SRC, "lib/removed-compat/solid.ts"),
]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist") continue;
      walk(p, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

function rewriteImports(code) {
  code = code.replace(
    /from\s+["']~\/lib\/removed-compat\/store["']/g,
    'from "solid-js"',
  );

  code = code.replace(
    /import\s*(type\s+)?\{([^}]*)\}\s*from\s*["']solid-js["']/g,
    (full, typeKw, inner) => {
      if (!/\bSetStoreFunction\b/.test(inner) && !/\bproduce\b/.test(inner)) {
        return full;
      }
      const parts = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .flatMap((p) => {
          if (/\bproduce\b/.test(p) && !/\bas\b/.test(p)) return [];
          if (/\bSetStoreFunction\b/.test(p)) {
            if (/StoreSetter\s+as\s+SetStoreFunction/.test(p)) return [p];
            const isType = /^\s*type\s+/.test(p) || Boolean(typeKw);
            const name = "StoreSetter as SetStoreFunction";
            return [isType && !/^\s*type\s+/.test(p) ? `type ${name}` : p.replace(/\bSetStoreFunction\b/, name).replace(/type\s+type\s+/, "type ")];
          }
          return [p];
        });

      const seen = new Set();
      const deduped = [];
      for (const p of parts) {
        const key = p.replace(/\s+/g, " ");
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(p);
      }
      const prefix = typeKw ? "type " : "";
      return `import ${prefix}{ ${deduped.join(", ")} } from "solid-js"`;
    },
  );

  // Drop removed-compat/solid batch imports entirely
  code = code.replace(
    /^import\s*\{[^}]*\bbatch\b[^}]*\}\s*from\s*["']~\/lib\/removed-compat\/solid["'];?\s*\n/gm,
    "",
  );

  code = code.replace(
    /\/\/ solid-js function: import \{ createStore \} from "~\/lib\/removed-compat\/store";/g,
    "// solid-js: createStore",
  );
  code = code.replace(
    /\/\/ solid-js\/store: import \{ reconcile \} from "~\/lib\/removed-compat\/store";/g,
    "// solid-js: reconcile",
  );

  return code;
}

function skipString(code, start) {
  const q = code[start];
  let j = start + 1;
  while (j < code.length) {
    if (code[j] === "\\") {
      j += 2;
      continue;
    }
    if (code[j] === q) return j + 1;
    j++;
  }
  return j;
}

function unwrapBatch(code) {
  let i = 0;
  let out = "";
  while (i < code.length) {
    const idx = code.indexOf("batch(", i);
    if (idx === -1) {
      out += code.slice(i);
      break;
    }
    if (idx > 0 && /[A-Za-z0-9_]/.test(code[idx - 1])) {
      out += code.slice(i, idx + 6);
      i = idx + 6;
      continue;
    }
    let p = idx + 6;
    while (p < code.length && /\s/.test(code[p])) p++;
    const arrowMatch = code.slice(p).match(/^\(\s*\)\s*=>\s*/);
    if (!arrowMatch) {
      out += code.slice(i, idx + 6);
      i = idx + 6;
      continue;
    }
    out += code.slice(i, idx);
    p += arrowMatch[0].length;
    while (p < code.length && /\s/.test(code[p])) p++;

    if (code[p] === "{") {
      let depth = 0;
      let j = p;
      for (; j < code.length; j++) {
        const c = code[j];
        if (c === '"' || c === "'" || c === "`") {
          j = skipString(code, j) - 1;
          continue;
        }
        if (c === "{") depth++;
        else if (c === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      const body = code.slice(p + 1, j - 1);
      while (j < code.length && /\s/.test(code[j])) j++;
      if (code[j] === ")") j++;
      out += `{\n${body}\n}`;
      i = j;
    } else {
      let j = p;
      let depth = 0;
      for (; j < code.length; j++) {
        const c = code[j];
        if (c === '"' || c === "'" || c === "`") {
          j = skipString(code, j) - 1;
          continue;
        }
        if (c === "(" || c === "[" || c === "{") depth++;
        else if (c === ")" || c === "]" || c === "}") {
          if (c === ")" && depth === 0) break;
          depth--;
        }
      }
      const expr = code.slice(p, j);
      if (code[j] === ")") j++;
      out += expr;
      i = j;
    }
  }
  return out;
}

function main() {
  const files = walk(SRC).filter((f) => !SKIP.has(f));
  // also update codemod script references? skip
  let changed = 0;
  for (const file of files) {
    const orig = fs.readFileSync(file, "utf8");
    if (!orig.includes("removed-compat") && !/\bbatch\(/.test(orig)) continue;

    let code = orig;
    if (code.includes("removed-compat")) {
      code = rewriteImports(code);
    }

    const hasBatchImport = /import\s*(type\s+)?\{[^}]*\bbatch\b/.test(code);
    if (/\bbatch\(/.test(code) && !hasBatchImport) {
      code = unwrapBatch(code);
    }

    if (code !== orig) {
      fs.writeFileSync(file, code);
      changed++;
      console.log("updated", path.relative(ROOT, file));
    }
  }
  console.log(`\nupdated ${changed} files`);
}

main();
