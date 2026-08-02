import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the personal site as a complete static document", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>JK de Guzman \| A personal field guide<\/title>/i);
  assert.match(html, /A person is a <em>collection<\/em> of connections\./i);
  assert.match(html, /Language/i);
  assert.match(html, /Systems/i);
  assert.match(html, /CliftonStrengths/i);
  assert.match(html, /November 21 · Scorpio/i);
  assert.match(html, /world-canvas/i);
  assert.match(html, /signal-visual/i);
  assert.match(html, /readable-zone/i);
  assert.match(html, /<script type="module" src="\/_astro\/[^\"]+\.js"><\/script>/i);
  assert.doesNotMatch(html, / style=/i);
  assert.match(html, /Nothing Phone \(3\)/i);
  assert.match(html, /CMF Buds Pro 2/i);
  assert.match(html, /Fedora Kinoite/i);
  assert.match(html, /look me up online\. I’m not hard to find\./i);
  assert.match(html, /stack-trace-step/i);
  assert.match(html, /Philippines/i);
  assert.doesNotMatch(html, /Marikina/i);
  const emailPattern = /\b[\w.%+-]+@[\w.-]+\.[A-Z]{2,}\b/i;
  assert.doesNotMatch(html, emailPattern);
  assert.doesNotMatch(html, /mailto:/i);
  assert.match(html, /Skip to content/i);
  assert.match(html, /<html lang="en-US">/i);
  assert.match(html, /aria-label="Primary navigation"/i);
  assert.doesNotMatch(html, /No funnel|No pitch deck|Build a life with enough substance|No single <span>lane/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);

  const source = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  assert.match(source, /requestAnimationFrame/i);
  assert.match(source, /prefers-reduced-motion/i);
  assert.match(source, /DETAIL/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--accent:\s*#c8844a/i);
  assert.match(css, /fallback-orbit/i);
  assert.match(css, /trace-flow/i);
  assert.match(css, /\.process-list li:last-child\s*\{\s*border-bottom:\s*0/i);
  assert.doesNotMatch(css, /\.card-number\s*\{[^}]*margin-bottom:\s*auto/i);
  assert.match(css, /\.card-arrow\s*\{[^}]*margin-top:\s*auto/i);
  assert.doesNotMatch(css, /backdrop-filter|shadowBlur|filter:\s*blur/i);
  assert.doesNotMatch(css, /@keyframes scene-device-float[^}]*translate:\s/i);
  assert.match(css, /\.world-readout\s*\{\s*display:\s*none/i);
  assert.doesNotMatch(css, /violet|purple|8052ff|7543ff|9b68ff/i);

  const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  assert.match(favicon, /#050505/i);
  assert.match(favicon, /#F4F2EF/i);
  assert.doesNotMatch(favicon, /68C4FF|0C79D8|2E9EFF/i);
});
