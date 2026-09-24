import fs from 'fs';
import path from 'path';

/* Two things a browser will not tell you about.
   ---------------------------------------------------------------------------
   1. A nested `*​/` inside a comment ends that comment early, and the remaining
      prose is parsed as a declaration — swallowing whatever comes next up to
      the following semicolon. That is how `--hf-space-900` was declared,
      committed, and silently absent: the calendar built on it rendered as one
      column seven rows tall, and nothing anywhere said why.

   2. A `var(--x)` with NO FALLBACK and no `--x` declared anywhere resolves to
      nothing. The browser does not warn; the property simply does not apply,
      which is how two transitions in this system were asking for a duration
      step that never existed and therefore did not animate at all.
      `var(--x, something)` is fine and is how an author-set API property —
      an aspect ratio, a label column width — is meant to be written. */
const files = fs.readdirSync('/home/claude/ds').filter(f => f.endsWith('.css'));
let bad = 0;

const declared = new Set();
const used = [];
for (const f of files) {
  const s = fs.readFileSync(path.join('/home/claude/ds', f), 'utf8');
  for (const m of s.matchAll(/\/\*[\s\S]*?\*\//g)) {
    if (m[0].slice(2, -2).includes('*/')) {
      console.log(`  ${f}:${s.slice(0, m.index).split('\n').length}  a comment contains */ — it ends there, and the next declaration is eaten`);
      bad++;
    }
  }
  const nc = s.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of nc.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) declared.add(m[1]);
  for (const m of nc.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
    if (m[2] === ',') continue;                       // has a fallback
    used.push([f, m[1], nc.slice(0, m.index).split('\n').length]);
  }
}
const missing = used.filter(([, name]) => !declared.has(name));
const seen = new Set();
for (const [f, name, line] of missing) {
  if (seen.has(name)) continue; seen.add(name);
  console.log(`  ${f}:${line}  var(${name}) — never declared`);
  bad++;
}
console.log(bad ? `${bad} problems` : `${files.length} stylesheets clean · ${declared.size} custom properties declared, all referenced ones exist`);
