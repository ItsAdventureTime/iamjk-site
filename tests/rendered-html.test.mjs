import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the personal site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Personal archive \| JK de Guzman<\/title>/i);
  assert.match(html, /I&#x27;m <span>JK\.<\/span>/i);
  assert.match(html, /Language/i);
  assert.match(html, /Technology/i);
  assert.match(html, /What I&#x27;m into right now\./i);
  assert.match(html, /Skip to content/i);
  assert.match(html, /<html lang="en-US">/i);
  assert.match(html, /aria-label="Primary navigation"/i);
  assert.doesNotMatch(html, /No funnel|No pitch deck|Build a life with enough substance|No single <span>lane/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);

  const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  assert.match(favicon, /#17191B/i);
  assert.doesNotMatch(favicon, /68C4FF|0C79D8|2E9EFF/i);
});
