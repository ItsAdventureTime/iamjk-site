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
  assert.match(html, /<title>A personal corner of the internet \| JK de Guzman<\/title>/i);
  assert.match(html, /Hi, I&#x27;m <span>JK\.<\/span>/i);
  assert.match(html, /Language &amp; connection/i);
  assert.match(html, /Faith &amp; questions/i);
  assert.match(html, /What&#x27;s on my desk\./i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
