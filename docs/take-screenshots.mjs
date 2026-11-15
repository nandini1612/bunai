// Takes README screenshots of the running site with headless Edge over the DevTools protocol (no packages needed).
// usage (site running on port 5173):  node docs/take-screenshots.mjs docs/screenshots <any-empty-temp-folder>
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [outDir, profile] = process.argv.slice(2);
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9377, BASE = "http://localhost:5173/", W = 1440, H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });

const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`,
  "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--no-first-run", "about:blank"], { stdio: "ignore" });

let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(500);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page"); } catch { /* not up yet */ }
}
if (!target) { edge.kill(); throw new Error("Edge did not start"); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0;
const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const run = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(expression.slice(0, 60) + " -> " + JSON.stringify(r.result.exceptionDetails.exception?.description));
  return r.result?.result?.value;
};
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 88 });
  writeFileSync(join(outDir, name + ".jpg"), Buffer.from(r.result.data, "base64"));
  console.log("saved", name);
};

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.enable");
await send("Page.navigate", { url: BASE });
await sleep(7000);
console.log("start button:", await run(`document.querySelector('#enter').textContent`));
await shot("landing");

await run(`document.querySelector('#enter').click()`);
await sleep(6000);
await shot("atlas");

// a palampore, opened: the piece panel with its arch, colours and craft note
await run(`(() => { location.hash = '#met_446817'; window.dispatchEvent(new PopStateEvent('popstate')); })()`);
await sleep(7000);
console.log("piece:", await run(`document.querySelector('#dTitle').textContent`));
await shot("piece");

await run(`(() => { document.querySelector('#close').click(); document.querySelector('#btnThreads').click(); document.querySelectorAll('#storyList button')[1].click(); document.querySelector('#sNext').click(); })()`);
await sleep(6000);
console.log("story:", await run(`document.querySelector('#sTitle').textContent`));
await shot("story");

await run(`(() => { document.querySelector('#sExit').click(); document.querySelector('#layout [data-v=time]').click(); })()`);
await sleep(6000);
await shot("timeline");

await run(`document.querySelector('#layout [data-v=colour]').click()`);
await sleep(6000);
await shot("colour");

ws.close();
edge.kill();
console.log("done");
