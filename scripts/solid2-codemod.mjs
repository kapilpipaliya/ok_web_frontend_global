#!/usr/bin/env node
/**
 * Mechanical Solid 1 → 2 import/API renames for this repo.
 * Run: node scripts/solid2-codemod.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rewriteSolidImport(names) {
  const parts = names
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      // handle `foo as bar`
      const m = p.match(/^(\w+)(\s+as\s+\w+)?$/);
      if (!m) return p;
      const name = m[1];
      const alias = m[2] || "";
      const map = {
        onMount: "onSettled",
        mergeProps: "merge",
        splitProps: "omit",
        unwrap: "snapshot",
      };
      if (map[name]) {
        // If already `onMount as onSettled`, become `onSettled`
        if (alias.trim()) {
          const asName = alias.replace(/\s+as\s+/, "").trim();
          if (asName === map[name]) return map[name];
          return `${map[name]} as ${asName}`;
        }
        return map[name];
      }
      return p;
    });

  const needsBatchShim = parts.some((p) => /^batch(\s+as\s+\w+)?$/.test(p));
  const solidParts = parts.filter((p) => !/^batch(\s+as\s+\w+)?$/.test(p));

  return { solidParts, needsBatchShim };
}

function transform(source) {
  let s = source;
  let changed = false;

  const replace = (re, to) => {
    const next = typeof to === "function" ? s.replace(re, to) : s.replace(re, to);
    if (next !== s) {
      changed = true;
      s = next;
    }
  };

  replace(
    /from\s+["']solid-js\/store["']/g,
    'from "solid-js"',
  );
  replace(/from\s+["']solid-js\/web["']/g, 'from "@solidjs/web"');

  replace(
    /import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']solid-js["']/g,
    (full, typeKw, names) => {
      const { solidParts, needsBatchShim } = rewriteSolidImport(names);
      const typePrefix = typeKw || "";
      const lines = [];
      if (solidParts.length) {
        lines.push(
          `import ${typePrefix}{ ${solidParts.join(", ")} } from "solid-js"`,
        );
      }
      if (needsBatchShim && !typeKw) {
        lines.push(`import { batch } from "solid-js"`);
      }
      changed = true;
      return lines.join("\n") || full;
    },
  );

  // JSX type imports
  replace(
    /import\s+type\s*\{([^}]*\bJSX\b[^}]*)\}\s*from\s*["']solid-js["']/g,
    (full, names) => {
      changed = true;
      return `import type { ${names} } from "@solidjs/web"`;
    },
  );

  // Bare identifier uses that weren't in imports (rare) — skip global rename to avoid damage

  return { s, changed };
}

const files = walk(ROOT);
let count = 0;
for (const file of files) {
  // Don't rewrite the compat layer itself into a loop
  if (file.includes(`${path.sep}solid-compat${path.sep}`)) continue;
  const source = fs.readFileSync(file, "utf8");
  const { s, changed } = transform(source);
  if (changed) {
    fs.writeFileSync(file, s);
    count++;
  }
}
console.log(`Codemod updated ${count} files`);
