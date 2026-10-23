#!/usr/bin/env node
/**
 * Convert simple Solid 1 path setters to Solid 2 draft recipes.
 * Handles:
 *   setX("key", value)           → setX((d) => { d.key = value; })
 *   setX("key", (p) => ...)      → setX((d) => { d.key = ((p)=>...)(d.key); })
 *   setX({ ... })                → setX((d) => { Object.assign(d, { ... }); })
 *   options.setX("key", value)   → same
 *
 * Skips already-draft calls setX((d) => ...) and setX(reconcile(...)).
 * Does NOT convert multi-segment paths (left for manual / already done).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

const SETTER_RE =
  /\b((?:options\.)?set(?:Graph|FormStore|GridState|FileManagerStore|State|Store|Values|UserState|ActiveResizeKey|Error|Status|SelectedState|SelectedId|LayoutStore|ConfirmAction|ColorMode|Ref|Refs|ShowPassword|Password|FormRefs|Local|Data|Meta|Preview|Modal|Tab|Chat|Palette|Options|Drag|Hover|Tree|Config|Theme))\(/g;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist" || ent.name === "removed-compat")
        continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(ent.name)) out.push(p);
  }
  return out;
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

function findCallEnd(code, openParenIdx) {
  let depth = 0;
  let j = openParenIdx;
  for (; j < code.length; j++) {
    const c = code[j];
    if (c === '"' || c === "'" || c === "`") {
      j = skipString(code, j) - 1;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      depth--;
      if (depth === 0 && c === ")") return j;
    }
  }
  return -1;
}

function splitTopLevelArgs(argsSrc) {
  const args = [];
  let start = 0;
  let depth = 0;
  for (let j = 0; j < argsSrc.length; j++) {
    const c = argsSrc[j];
    if (c === '"' || c === "'" || c === "`") {
      j = skipString(argsSrc, j) - 1;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) {
      args.push(argsSrc.slice(start, j).trim());
      start = j + 1;
    }
  }
  args.push(argsSrc.slice(start).trim());
  return args.filter(Boolean);
}

function isIdentKey(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function convertCall(callee, argsSrc) {
  const args = splitTopLevelArgs(argsSrc);
  if (args.length === 0) return null;

  // Already draft or reconcile
  if (args.length === 1) {
    const a0 = args[0];
    if (/^\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(a0) || /^\s*function\b/.test(a0)) {
      return null;
    }
    if (/^\s*reconcile\s*\(/.test(a0)) return null;
    // Root object merge: setX({ ... })
    if (/^\s*\{/.test(a0)) {
      return `${callee}((d) => { Object.assign(d, ${a0}); })`;
    }
    return null;
  }

  // Only convert 2-arg path: setX("key", value)
  if (args.length !== 2) return null;

  const keyMatch = args[0].match(/^["']([^"']+)["']$/);
  if (!keyMatch) return null;
  const key = keyMatch[1];
  const access = isIdentKey(key) ? `d.${key}` : `d[${JSON.stringify(key)}]`;
  const value = args[1];

  // Updater fn
  if (/^\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(value) || /^\s*function\b/.test(value)) {
    return `${callee}((d) => { ${access} = (${value})(${access}); })`;
  }

  // undefined → delete
  if (/^\s*undefined(\s+as\s+never)?\s*$/.test(value)) {
    return `${callee}((d) => { delete ${access}; })`;
  }

  // Object value at key: Solid 1 merges into existing object. Use Object.assign when value is object literal.
  if (/^\s*\{/.test(value)) {
    return `${callee}((d) => {
  if (${access} != null && typeof ${access} === "object" && !Array.isArray(${access})) {
    Object.assign(${access}, ${value});
  } else {
    ${access} = ${value};
  }
})`;
  }

  return `${callee}((d) => { ${access} = ${value}; })`;
}

function transform(code) {
  let out = "";
  let i = 0;
  let changed = 0;
  SETTER_RE.lastIndex = 0;
  let m;
  const re = new RegExp(SETTER_RE.source, "g");
  while ((m = re.exec(code)) !== null) {
    const callee = m[1];
    const openIdx = m.index + m[0].length - 1; // position of '('
    // skip if already looking at draft: next nonspace is '(' for (d)=>
    let peek = openIdx + 1;
    while (peek < code.length && /\s/.test(code[peek])) peek++;
    if (code[peek] === "(" || code.slice(peek).startsWith("reconcile")) {
      continue;
    }
    // Also skip if first arg starts with arrow via bare param without paren rarely

    const end = findCallEnd(code, openIdx);
    if (end === -1) continue;
    const argsSrc = code.slice(openIdx + 1, end);
    const replacement = convertCall(callee, argsSrc);
    if (!replacement) continue;

    out += code.slice(i, m.index) + replacement;
    i = end + 1;
    changed++;
    re.lastIndex = end + 1;
  }
  out += code.slice(i);
  return { code: out, changed };
}

function main() {
  let filesChanged = 0;
  let total = 0;
  for (const file of walk(SRC)) {
    const orig = fs.readFileSync(file, "utf8");
    const { code, changed } = transform(orig);
    if (changed > 0) {
      fs.writeFileSync(file, code);
      filesChanged++;
      total += changed;
      console.log(`${changed}\t${path.relative(ROOT, file)}`);
    }
  }
  console.log(`\n${total} conversions in ${filesChanged} files`);
}

main();
