// Browser smoke test. In the console of the running site:  (await import("./selftest.js")).run()
// It drives the real page through every arrangement, filter, dialog and story step, then puts the page back.
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const key = (k) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
const input = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event("input", { bubbles: true })); };

export async function run() {
  const out = [];
  const ok = (name, cond, info = "") => out.push({ result: cond ? "PASS" : "FAIL", check: name, info });
  const count = () => $("#count").textContent;

  if (!document.body.classList.contains("entered")) $("#enter").click();
  ok("landing dismissed", document.body.classList.contains("entered"));
  if (!$("#story").hidden) $("#sExit").click();
  if (!$("#detail").hidden) $("#close").click();
  if (!$("#reset").hidden) $("#reset").click();
  const N = count();

  for (const v of ["time", "colour", "galaxy"]) {
    $(`#layout [data-v=${v}]`).click();
    ok(`arrange: ${v}`, $$("#layout .on").length === 1 && $(`#layout [data-v=${v}]`).getAttribute("aria-pressed") === "true");
  }
  for (const v of ["r", "s", "c"]) { $(`#groupby [data-v=${v}]`).click(); ok(`outline by: ${v}`, $$("#legend li").length > 1, `${$$("#legend li").length} groups`); }

  const rows = $$("#legend li");
  rows[1].click();
  ok("legend: show only one", count().startsWith(rows[1].querySelector("em").textContent + " of"), count());
  rows[2].dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
  ok("legend: shift adds a second", parseInt(count()) === +rows[1].querySelector("em").textContent + +rows[2].querySelector("em").textContent, count());
  rows[2].dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
  rows[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  ok("legend: Enter key restores all", count() === N, count());

  const chip = $("#dyes button");
  chip.click(); ok("colour chip filters", count() !== N && $("#dyeNote").textContent.length > 10, count());
  chip.click(); ok("colour chip clears", count() === N);

  input("#yr0", 1700); input("#yr1", 1800); ok("year range", count() !== N && $("#yrLabel").textContent.includes("1700"), count());
  input("#search", "shawl"); ok("search combines with years", count() !== N, count());
  $("#reset").click(); ok("clear all filters", count() === N && $("#search").value === "" && $("#reset").hidden);
  input("#search", "zzzz"); ok("no matches shows a message", count().startsWith("0 of") && !$("#empty").hidden);
  $("#emptyClear").click(); ok("message's button clears", count() === N && $("#empty").hidden);

  $("#btnWander").click();
  ok("wander opens a piece", !$("#detail").hidden && location.hash.length > 3, $("#dTitle").textContent);
  ok("piece panel is complete", $("#dImg").src.includes("data/img") && $$("#dPal button").length === 5 && $$("#dNN button").length === 8 && $("#dLink").href.startsWith("http"));
  const first = location.hash;
  $("#dNN button").click(); ok("hop to a neighbour", location.hash !== first);
  ok("thread appears", !$("#trail").hidden, $("#trailN").textContent);
  history.back(); await wait(250); ok("Back returns to the previous piece", location.hash === first, location.hash);
  $("#trailCut").click(); ok("cut the thread", $("#trail").hidden);
  $("#close").click(); ok("close the piece", $("#detail").hidden && location.hash === "");

  key("w"); ok("W key wanders", !$("#detail").hidden);
  key("Escape"); ok("Esc closes", $("#detail").hidden);

  $("#btnAbout").click(); ok("About opens with sources", $("#about").open && $$("#sources a").length > 10, `${$$("#sources a").length} sources`);
  $("#about .x").click(); ok("About closes", !$("#about").open);

  $("#btnThreads").click();
  const stories = $$("#storyList button").length;
  ok("stories listed", $("#threads").open && stories >= 5, `${stories} stories`);
  for (let s = 0; s < stories; s++) {
    if (!$("#threads").open) $("#btnThreads").click();
    $$("#storyList button")[s].click();
    let steps = 0, empty = 0;
    while (!$("#story").hidden && steps < 10) { steps++; if (/^0 /.test($("#sCount").textContent)) empty++; $("#sNext").click(); }
    ok(`story ${s + 1} runs to the end`, $("#story").hidden && count() === N && empty === 0, `${steps} steps${empty ? `, ${empty} with nothing lit` : ""}`);
  }
  $("#btnThreads").click(); $$("#storyList button")[0].click();
  const en = $("#sText").textContent;
  $("#sLang").click(); ok("Hindi switch", /[ऀ-ॿ]/.test($("#sText").textContent) && $("#sText").textContent !== en);
  key("ArrowRight"); ok("arrow key steps, Hindi kept", $("#sStep").textContent.startsWith("2") && /[ऀ-ॿ]/.test($("#sTitle").textContent));
  $("#sLang").click(); $("#sExit").click(); ok("leave the story", $("#story").hidden && count() === N);

  if (!$("#trail").hidden) $("#trailCut").click();   // leave no thread behind
  console.table(out);
  const failed = out.filter((r) => r.result === "FAIL");
  console.log(failed.length ? `${failed.length} of ${out.length} checks FAILED` : `All ${out.length} checks passed`);
  return { passed: out.length - failed.length, failed: failed.map((r) => `${r.check} ${r.info}`), total: out.length };
}
