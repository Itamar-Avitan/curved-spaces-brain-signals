#!/usr/bin/env node
/**
 * Term-discipline audit: does the page ever use a piece of jargon before it
 * introduces it? Also checks that every glossary `href` resolves.
 *
 * The rule this enforces is from the comprehension contract in
 * REVISION_PLAN.md: a reader should never meet a term cold. The first time a
 * glossary term appears in body prose it should be wrapped in `<rg-term>`, so
 * an explanation is one click away.
 *
 * The link check is narrower than it sounds: it only confirms a glossary
 * `href="#id"` resolves to an id that exists on the page. It cannot tell
 * whether that section still contains what the link's label promises — that
 * requires reading, not regex.
 *
 * This is advisory, not a gate. English is messy — "metric" inside "metric
 * card" is not a violation, and headings often name a concept before the body
 * teaches it on purpose. It exits non-zero only when asked to with --strict.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const html = readFileSync(resolve(root, "index.html"), "utf8");
const glossary = readFileSync(resolve(root, "src/glossary.ts"), "utf8");

/** Pull `key: { term: "..." }` pairs straight out of the glossary module. */
function readGlossary() {
  const entries = [];
  const blockRe = /^\s{2}"?([a-z0-9-]+)"?:\s*\{$/gm;
  let match;
  while ((match = blockRe.exec(glossary)) !== null) {
    const key = match[1];
    const rest = glossary.slice(match.index, match.index + 900);
    const term = /term:\s*"([^"]+)"/.exec(rest);
    if (term) entries.push({ key, term: term[1] });
  }
  return entries;
}

/** Regions of the document we should not treat as "body prose". */
function proseMask(source) {
  const mask = new Uint8Array(source.length); // 1 = ignore
  const hide = (re) => {
    let m;
    while ((m = re.exec(source)) !== null) {
      mask.fill(1, m.index, m.index + m[0].length);
    }
  };
  hide(/<rg-term\b[^>]*>[\s\S]*?<\/rg-term>/g); // already introduced here
  hide(/<head[\s\S]*?<\/head>/g);
  // Labels inside a diagram are not prose: the picture beside the word is the
  // introduction, and an <rg-term> cannot wrap an SVG <text> node anyway.
  hide(/<svg[\s\S]*?<\/svg>/g);
  hide(/<!--[\s\S]*?-->/g);
  hide(/<[a-z-]+\b[^>]*>/gi); // tags and their attributes
  hide(/<rg-[a-z-]+\b[^>]*><\/rg-[a-z-]+>/g);
  return mask;
}

function firstUnmaskedMatch(source, mask, pattern) {
  let m;
  const re = new RegExp(pattern, "gi");
  while ((m = re.exec(source)) !== null) {
    if (!mask[m.index]) return m.index;
  }
  return -1;
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

const strict = process.argv.includes("--strict");
const entries = readGlossary();
const mask = proseMask(html);

const problems = [];
const notMarkedUp = [];

for (const { key, term } of entries) {
  const introIndex = html.indexOf(`<rg-term key="${key}"`);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match the term as whole words, tolerating a line break inside it.
  const pattern = `\\b${escaped.replace(/\s+/g, "\\s+")}\\b`;
  const firstUse = firstUnmaskedMatch(html, mask, pattern);

  if (introIndex === -1) {
    if (firstUse !== -1) {
      notMarkedUp.push({ key, term, line: lineOf(html, firstUse) });
    }
    continue;
  }
  if (firstUse !== -1 && firstUse < introIndex) {
    problems.push({
      key,
      term,
      useLine: lineOf(html, firstUse),
      introLine: lineOf(html, introIndex),
    });
  }
}

console.log(`Checked ${entries.length} glossary terms against index.html.\n`);

if (problems.length) {
  console.log("Used before it is introduced:");
  for (const p of problems) {
    console.log(
      `  ${p.term}  —  first used at line ${p.useLine}, introduced at line ${p.introLine}`,
    );
  }
  console.log("");
}

if (notMarkedUp.length) {
  console.log("Appears in prose but is never an <rg-term> anywhere:");
  for (const p of notMarkedUp) {
    console.log(`  ${p.term}  —  line ${p.line}  (key: ${p.key})`);
  }
  console.log("");
}

/** Every href in the glossary must point at an id that exists on the page. */
const ids = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
);
const brokenLinks = [];
for (const m of glossary.matchAll(/href:\s*"#([^"]+)"/g)) {
  if (!ids.has(m[1])) brokenLinks.push(m[1]);
}

if (brokenLinks.length) {
  console.log("Glossary links pointing at ids that do not exist:");
  for (const id of new Set(brokenLinks)) console.log(`  #${id}`);
  console.log("");
}

if (!problems.length && !notMarkedUp.length && !brokenLinks.length) {
  console.log("No term is used before it is introduced, and every link resolves. ✓");
}

if (strict && (problems.length || brokenLinks.length)) process.exit(1);
