import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CRAFTS, DYES, GLOSSARY, EVENTS, STORIES, SOURCES, HINDI, LANDING } from "./content.js";
import { logoSVG } from "./logo.js";

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const OUTLINE = ["#d9a441", "#c9506e", "#3fa39b", "#8aa85a", "#9a7fc4", "#d9763f", "#5f8fcf", "#d8c27a", "#b8a898", "#c98aa6", "#6fb59a"];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const WIDE = () => innerWidth > 760;
const ATLAS = "data/atlas.webp";

function failStart(msg, err) {
  $("#enter").textContent = msg;
  throw err instanceof Error ? err : new Error(msg);
}
let data;
try {
  const res = await fetch("data/items.json");
  if (!res.ok) throw new Error(`items.json: HTTP ${res.status}`);
  data = await res.json();
} catch (err) { failStart("The collection could not be loaded. Reload to try again.", err); }
const items = data.items;
const N = items.length;

// ---------------------------------------------------------------- derived fields
const dyeByKey = Object.fromEntries(DYES.map((d) => [d.key, d]));
function nearestDye(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  // Name by hue family rather than nearest swatch: centuries of fading leave colours far duller than fresh dye,
  // so a greyed blue should still read as neel.
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2, c = mx - mn;
  const s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (c) h = mx === r / 255 ? ((g - b) / 255 / c + 6) % 6 : mx === g / 255 ? (b - r) / 255 / c + 2 : (r - g) / 255 / c + 4;
  h *= 60;
  if (l < 0.12) return "kala";
  if (s < 0.1) return l > 0.75 ? "safed" : l > 0.3 ? "surmai" : "kala";
  if (h < 15 || h >= 345) return l > 0.62 ? "gulabi" : l < 0.22 && s < 0.45 ? "katthai" : "laal";
  if (h < 40) return s < 0.38 ? (l > 0.52 ? "badami" : "katthai") : l < 0.3 ? "katthai" : h < 24 && l < 0.45 ? "laal" : "kesari";
  if (h < 52) return s > 0.5 ? (l > 0.45 ? "haldi" : "sunehra") : l > 0.52 ? "badami" : "katthai";
  if (h < 70) return s > 0.5 ? "haldi" : l < 0.5 ? "mehendi" : "badami";
  if (h < 160) return l < 0.45 || s < 0.4 ? "mehendi" : "totai";
  if (h < 200) return "firozi";
  if (h < 250) return l > 0.6 ? "aasmani" : "neel";
  if (h < 300) return "baingani";
  return l > 0.62 ? "gulabi" : s > 0.5 ? "rani" : "baingani";
}
items.forEach((d) => {
  d.text = `${d.t} ${d.p} ${d.m} ${d.d} ${d.c} ${d.r}`.toLowerCase();
  d.palDyes = d.pal.map(nearestDye);
  d.dyes = [...new Set(d.palDyes)];
});

// ---------------------------------------------------------------- layouts
// Every arrangement is a flat map in which no two tiles overlap.
const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
const BASE = 0.115;          // world-space size of one tile
const STEP = BASE * 1.14;    // tile + gap
const crafts = [...new Set(items.map((d) => d.c))].sort(
  (a, b) => items.filter((d) => d.c === b).length - items.filter((d) => d.c === a).length);

// Push overlapping squares apart while a weak spring keeps each near where the data put it.
function relax(P, iters = 160) {
  const home = P.slice(), key = (x, y) => Math.floor(x / STEP) + "," + Math.floor(y / STEP);
  for (let it = 0; it < iters; it++) {
    const grid = new Map();
    for (let i = 0; i < N; i++) { const k = key(P[i * 2], P[i * 2 + 1]); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
    for (let i = 0; i < N; i++) {
      const cx = Math.floor(P[i * 2] / STEP), cy = Math.floor(P[i * 2 + 1] / STEP);
      for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
        for (const j of grid.get(gx + "," + gy) || []) {
          if (j <= i) continue;
          let dx = P[j * 2] - P[i * 2], dy = P[j * 2 + 1] - P[i * 2 + 1];
          const ox = STEP - Math.abs(dx), oy = STEP - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          if (dx === 0 && dy === 0) { dx = rand() - 0.5; dy = rand() - 0.5; }
          if (ox < oy) { const m = (ox / 2) * Math.sign(dx || 1); P[i * 2] -= m; P[j * 2] += m; }
          else { const m = (oy / 2) * Math.sign(dy || 1); P[i * 2 + 1] -= m; P[j * 2 + 1] += m; }
        }
      }
    }
    const pull = it < iters - 40 ? 0.015 : 0;   // last passes: separation only
    if (pull) for (let i = 0; i < N * 2; i++) P[i] += (home[i] - P[i]) * pull;
  }
  return P;
}
const to3 = (P) => { const o = new Float32Array(N * 3); for (let i = 0; i < N; i++) { o[i * 3] = P[i * 2]; o[i * 3 + 1] = P[i * 2 + 1]; } return o; };
const fill = Math.sqrt((N * STEP * STEP) / Math.PI);   // radius of a disc that would just hold every tile

// Likeness: 2D UMAP, centred on the median, far-flung islands pulled in, then de-overlapped
const src = items.map((d) => d.xy || d.xyz);
const med = [0, 1].map((k) => src.map((p) => p[k]).sort((a, b) => a - b)[N >> 1]);
const radii = src.map((p) => Math.hypot(p[0] - med[0], p[1] - med[1]));
const r90 = [...radii].sort((a, b) => a - b)[Math.floor(N * 0.9)] || 1;
const G = new Float32Array(N * 2);
src.forEach((p, i) => {
  const rr = radii[i] / r90, k = rr > 0 ? (Math.tanh(rr / 1.5) * 1.5) / rr : 0;
  G.set([((p[0] - med[0]) / r90) * k * fill * 1.2, ((p[1] - med[1]) / r90) * k * fill * 1.2], i * 2);
});

// Colour: hue is the angle, vividness the distance from the centre
const C = new Float32Array(N * 2);
items.forEach((d, i) => {
  const a = d.h * Math.PI * 2, r = (0.25 + d.sa) * fill * 1.15;
  C.set([Math.cos(a) * r + gauss() * 0.05, Math.sin(a) * r + gauss() * 0.05], i * 2);
});

// Time: one stacked column of tiles per half-century, sorted by craft so colour bands show
const BIN = 50, FIRST = 1300, LAST = 1950, COLS = 8;
const binOf = (d) => (d.y == null ? -1 : Math.floor((Math.max(FIRST - BIN, Math.min(LAST, d.y)) - (FIRST - BIN)) / BIN));
const nBins = (LAST - (FIRST - BIN)) / BIN + 1, colW = COLS * STEP + STEP * 1.5, span = (nBins + 1) * colW;
const xOfYear = (y) => ((y - (FIRST - BIN)) / BIN + 1) * colW - span / 2 - STEP / 2;
const T = new Float32Array(N * 2), timeLabels = [];
for (let b = -1; b < nBins; b++) {
  const idx = items.map((d, i) => (binOf(d) === b ? i : -1)).filter((i) => i >= 0)
    .sort((i, j) => crafts.indexOf(items[i].c) - crafts.indexOf(items[j].c) || (items[i].y || 0) - (items[j].y || 0));
  const x0 = (b + 1) * colW - span / 2;
  idx.forEach((i, n) => T.set([x0 + (n % COLS) * STEP, Math.floor(n / COLS) * STEP], i * 2));
  if (idx.length) timeLabels.push({ text: b < 0 ? "no date" : b === 0 ? `pre-${FIRST}` : `${FIRST - BIN + b * BIN}`,
    pos: new THREE.Vector3(x0 + ((COLS - 1) * STEP) / 2, -STEP * 1.5, 0) });
}
EVENTS.forEach(([y, text], k) => timeLabels.push({ text: `${y} · ${text}`, cls: "event", stem: 10 + (k % 2) * 30,
  pos: new THREE.Vector3(xOfYear(y), -STEP * (4.6 + (k % 2) * 3.4), 0) }));

const layouts = { galaxy: to3(relax(G)), time: to3(T), colour: to3(relax(C)) };
const labelSets = { galaxy: [], time: timeLabels, colour: [] };
function boundsOf(L, idx) {
  const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  for (const i of idx) { b.x0 = Math.min(b.x0, L[i * 3]); b.x1 = Math.max(b.x1, L[i * 3]); b.y0 = Math.min(b.y0, L[i * 3 + 1]); b.y1 = Math.max(b.y1, L[i * 3 + 1]); }
  return b;
}
const ALL = items.map((_, i) => i);

// ---------------------------------------------------------------- scene
const canvas = $("#stage");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
catch (err) { failStart("This browser cannot draw the map (WebGL is switched off).", err); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 80);
camera.position.set(0, 0, 9);
// map-style navigation: drag pans, wheel zooms towards the cursor, no rotation (the layouts are flat)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.enableRotate = false;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.minDistance = 0.5;
controls.maxDistance = 40;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };

{ // faint gold dust so the space has depth
  const g = new THREE.BufferGeometry(), p = new Float32Array(900 * 3);
  for (let i = 0; i < p.length; i += 3) { p[i] = (rand() - 0.5) * 40; p[i + 1] = (rand() - 0.5) * 30; p[i + 2] = -1 - rand() * 8; }
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd2a24c, size: 0.03, transparent: true, opacity: 0.22 })));
}

let tex;
try { tex = await new THREE.TextureLoader().loadAsync(ATLAS); }
catch (err) { failStart("The pictures could not be loaded. Reload to try again.", err); }
tex.colorSpace = THREE.SRGBColorSpace;
tex.flipY = false;
tex.generateMipmaps = false;
tex.minFilter = THREE.LinearFilter;

const pos = new Float32Array(N * 3), from = new Float32Array(N * 3);
for (let i = 0; i < N * 3; i++) pos[i] = from[i] = gauss() * 9; // start scattered, fly in
let target = layouts.galaxy, tStart = performance.now(), tDur = REDUCED ? 1 : 2800;

const cell = new Float32Array(N * 2), tint = new Float32Array(N * 3), show = new Float32Array(N).fill(1), pop = new Float32Array(N);
items.forEach((_, i) => cell.set([i % data.cols, Math.floor(i / data.cols)], i * 2));
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("aCell", new THREE.BufferAttribute(cell, 2));
geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 3));
geo.setAttribute("aShow", new THREE.BufferAttribute(show, 1));
geo.setAttribute("aPop", new THREE.BufferAttribute(pop, 1));
const mat = new THREE.ShaderMaterial({
  uniforms: { uTex: { value: tex }, uGrid: { value: new THREE.Vector2(data.cols, data.rows) }, uScale: { value: 1 } },
  vertexShader: `
    attribute vec2 aCell; attribute vec3 aTint; attribute float aShow; attribute float aPop;
    uniform float uScale; varying vec2 vCell; varying vec3 vTint; varying float vShow; varying float vPop;
    void main() {
      vCell = aCell; vTint = aTint; vShow = aShow; vPop = aPop;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      mv.z += aPop * 0.02 - (1.0 - aShow) * 0.02;            // hovered tile draws on top, filtered-out ones underneath
      gl_Position = projectionMatrix * mv;
      float s = ${BASE.toFixed(3)} * mix(0.2, 1.0, aShow) * (1.0 + aPop * 0.7);
      gl_PointSize = clamp(s * uScale / -mv.z, 1.5, 600.0);
    }`,
  fragmentShader: `
    uniform sampler2D uTex; uniform vec2 uGrid; varying vec2 vCell; varying vec3 vTint; varying float vShow; varying float vPop;
    void main() {
      vec2 p = gl_PointCoord - 0.5;
      float d = max(abs(p.x), abs(p.y));
      float r = length(max(abs(p) - 0.4, 0.0));              // rounded square
      if (r > 0.1) discard;
      vec3 img = texture2D(uTex, (vCell + 0.03 + gl_PointCoord * 0.94) / uGrid).rgb;
      float rim = smoothstep(0.455, 0.47, d + r * 0.6) * 0.85;   // hairline outline in the group colour
      vec3 col = mix(img, vTint, rim);
      col = mix(vec3(0.16, 0.19, 0.36), col, vShow);
      col = mix(col, vec3(0.95, 0.80, 0.50), min(1.0, vPop * 1.9) * smoothstep(0.43, 0.45, d + r * 0.6));
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const points = new THREE.Points(geo, mat);
points.frustumCulled = false;
scene.add(points);

// the visitor's own thread: a gold line through every piece they have opened
const trail = [], TRAIL_MAX = 300, trailPos = new Float32Array(TRAIL_MAX * 3), trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xe8c47a, transparent: true, opacity: 0.9 }));
trailLine.frustumCulled = false;
scene.add(trailLine);

let dirty = 3;                                   // frames still owed to the screen
const invalidate = () => { dirty = 3; };
function resize() {
  invalidate();
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  if (WIDE()) camera.setViewOffset(w, h, -158, 0, w, h);    // shift the scene right, clear of the control panel
  else camera.setViewOffset(w, h, 0, h * 0.2, w, h);        // narrow screens: controls sit at the bottom, so lift the scene
  camera.updateProjectionMatrix();
  mat.uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
}
addEventListener("resize", resize);
resize();

// ---------------------------------------------------------------- state
const state = { layout: "galaxy", group: "c", off: new Set(), y0: 1200, y1: 2000, q: "", dye: null, story: null, sel: -1, hover: -1, lang: "en", mine: null };
let storyMask = null;

function userVisible(d) {
  if (state.off.has(d[state.group])) return false;
  const lo = state.y0 > 1200, hi = state.y1 < 2000;   // a slider at its end stop means "no limit"
  if ((lo || hi) && (d.y == null || (lo && d.y < state.y0) || (hi && d.y > state.y1))) return false;
  if (state.q && !d.text.includes(state.q)) return false;
  if (state.dye && !d.dyes.includes(state.dye)) return false;
  return true;
}
function applyFilter() {
  let n = 0;
  items.forEach((d, i) => { show[i] = (storyMask ? storyMask[i] : userVisible(d)) ? 1 : 0; n += show[i]; });
  geo.attributes.aShow.needsUpdate = true;
  invalidate();
  $("#empty").hidden = n > 0 || !!storyMask;
  $("#count").textContent = n === N ? N.toLocaleString() : `${n.toLocaleString()} of ${N.toLocaleString()}`;
  $("#countNote").textContent = n === N ? "Indian textiles" : "textiles lit";
  $("#reset").hidden = !(state.off.size || state.q || state.dye || state.y0 > 1200 || state.y1 < 2000);
  return n;
}

function buildLegend() {
  const counts = new Map();
  items.forEach((d) => counts.set(d[state.group], (counts.get(d[state.group]) || 0) + 1));
  const keys = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  const colour = new Map(keys.map((k, i) => [k, OUTLINE[i % OUTLINE.length]]));
  const c = new THREE.Color();
  items.forEach((d, i) => { c.set(colour.get(d[state.group])); tint.set([c.r, c.g, c.b], i * 3); });
  geo.attributes.aTint.needsUpdate = true;
  invalidate();
  const ul = $("#legend");
  ul.replaceChildren(...keys.map((k) => {
    const dot = el("i"); dot.style.background = colour.get(k);
    const hi = state.group === "c" && CRAFTS[k]?.hi ? el("small", { lang: "hi", textContent: CRAFTS[k].hi, title: CRAFTS[k].roman }) : "";
    const li = el("li", { title: "Click to show only this · shift-click to add or remove", tabIndex: 0 }, dot, el("span", { textContent: k }), hi, el("em", { textContent: counts.get(k) }));
    li.setAttribute("role", "button");
    li.setAttribute("aria-pressed", "true");
    li.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.onclick(e); } };
    li.onclick = (e) => {
      if (e.shiftKey) state.off.has(k) ? state.off.delete(k) : state.off.add(k);                // shift = toggle one
      else if (state.off.size === keys.length - 1 && !state.off.has(k)) state.off.clear();       // click the solo'd one again -> all
      else state.off = new Set(keys.filter((x) => x !== k));
      syncLegend();
      applyFilter();
    };
    li.dataset.k = k;
    return li;
  }));
}
const syncLegend = () => [...$("#legend").children].forEach((li) => { const off = state.off.has(li.dataset.k); li.classList.toggle("off", off); li.setAttribute("aria-pressed", String(!off)); });

// colour chips: neutrals are left out because they mostly describe the photograph's background
const CHIP_SKIP = new Set(["safed", "kala", "surmai"]);
function buildDyes() {
  $("#dyes").replaceChildren(...DYES.filter((d) => !CHIP_SKIP.has(d.key) && items.some((it) => it.dyes.includes(d.key))).map((d) => {
    const b = el("button", { title: `${d.key} · ${d.en}`, ariaLabel: `${d.key}, ${d.en}` });
    b.style.background = `rgb(${d.rgb})`;
    b.dataset.k = d.key;
    b.onclick = () => setDye(state.dye === d.key ? null : d.key);
    return b;
  }));
}
function setDye(key) {
  state.dye = key && !CHIP_SKIP.has(key) ? key : null;
  const d = dyeByKey[state.dye];
  [...$("#dyes").children].forEach((b) => b.classList.toggle("on", b.dataset.k === state.dye));
  $("#dyeName").replaceChildren(...(d ? [el("span", { lang: "hi", textContent: d.hi }), ` ${d.key} · ${d.en}`] : []));
  $("#dyeNote").textContent = d ? d.dye : "";
  applyFilter();
}

function setLayout(name, refit = true) {
  state.layout = name;
  [...$("#layout").children].forEach((b) => { b.classList.toggle("on", b.dataset.v === name); b.setAttribute("aria-pressed", String(b.dataset.v === name)); });
  from.set(pos);
  target = layouts[name];
  tStart = performance.now();
  tDur = REDUCED ? 1 : 1800;
  if (refit) fit(ALL);
  $("#labels").replaceChildren(...labelSets[name].map((l) => {
    l.el = el("span", { textContent: l.text, className: l.cls || "" });
    if (l.stem) l.el.style.setProperty("--stem", l.stem + "px");
    return l.el;
  }));
}

$("#layout").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setLayout(b.dataset.v); });
$("#groupby").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  [...$("#groupby").children].forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
  state.group = b.dataset.v; state.off.clear(); buildLegend(); applyFilter();
});
function years() {
  let a = +$("#yr0").value, b = +$("#yr1").value;
  if (a > b) [a, b] = [b, a];
  state.y0 = a; state.y1 = b;
  $("#yrLabel").textContent = a <= 1200 && b >= 2000 ? "any time" : `${a} – ${b}`;
  applyFilter();
}
$("#yr0").oninput = $("#yr1").oninput = years;
$("#search").oninput = (e) => { state.q = e.target.value.trim().toLowerCase(); applyFilter(); };
$("#emptyClear").onclick = () => $("#reset").click();
$("#reset").onclick = () => {
  state.off.clear(); state.q = ""; $("#search").value = ""; $("#yr0").value = 1200; $("#yr1").value = 2000;
  syncLegend(); setDye(null); years();
};

// ---------------------------------------------------------------- camera
let flight = null;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const HALF = () => Math.tan((camera.fov * Math.PI) / 360);
function flyTo(tgt, camPos) {
  flight = { t0: performance.now(), dur: REDUCED ? 1 : 1200, fromT: controls.target.clone(), toT: tgt, fromP: camera.position.clone(), toP: camPos };
}
// frame a set of tiles inside the area the panels leave free
function fit(idx) {
  if (!idx.length) idx = ALL;
  const b = boundsOf(target, idx), w = innerWidth, h = innerHeight, pad = BASE * 3;
  const story = !!state.story, detail = !$("#detail").hidden && WIDE();
  const freeW = (WIDE() ? (w - 316 - (detail ? 446 : 0)) / w : 1) * 0.88;   // leave a margin so nothing touches the edges
  const cardH = story && WIDE() ? $("#story").offsetHeight + 50 : 0, topH = 70;   // story card at the bottom, buttons at the top
  const freeH = WIDE() ? (h - cardH - topH) / h * 0.92 : story ? 0.34 : 0.46;   // on a phone the story card covers the lower half
  let dist = Math.max((b.y1 - b.y0 + pad) / 2 / HALF() / freeH, (b.x1 - b.x0 + pad) / 2 / (HALF() * camera.aspect * freeW));
  dist = Math.max(1.6, Math.min(dist, controls.maxDistance));
  const perPx = (2 * dist * HALF()) / h;
  const c = new THREE.Vector3((b.x0 + b.x1) / 2 + (detail ? 225 * perPx : 0), (b.y0 + b.y1) / 2 - (WIDE() ? ((cardH - topH) / 2) * perPx : 0), 0);
  flyTo(c, new THREE.Vector3(c.x, c.y, dist));
}

// ---------------------------------------------------------------- picking + hover preview
const v = new THREE.Vector3();
function pick(mx, my) {
  let best = -1, bestZ = Infinity;
  const h = innerHeight, w = innerWidth, k = mat.uniforms.uScale.value / renderer.getPixelRatio();
  for (let i = 0; i < N; i++) {
    if (!show[i]) continue;
    v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).applyMatrix4(camera.matrixWorldInverse);
    if (v.z > -0.05) continue;
    const depth = -v.z, half = Math.max(4, (BASE * k) / depth / 2);
    v.applyMatrix4(camera.projectionMatrix);
    const sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
    if (Math.abs(sx - mx) <= half && Math.abs(sy - my) <= half && depth < bestZ) { best = i; bestZ = depth; }
  }
  return best;
}
function setPop() {
  pop.fill(0);
  for (const i of trail) pop[i] = 0.22;
  if (state.hover >= 0) pop[state.hover] = 0.6;
  if (state.sel >= 0) pop[state.sel] = 1;
  geo.attributes.aPop.needsUpdate = true;
  invalidate();
}
const hover = $("#hover");
let downAt = null;
canvas.addEventListener("pointermove", (e) => {
  if (e.buttons) { hover.hidden = true; return; }
  const i = pick(e.clientX, e.clientY);
  canvas.classList.toggle("point", i >= 0);
  if (i !== state.hover) {
    state.hover = i; setPop();
    if (i >= 0) {
      const d = items[i];
      hover.querySelector("img").src = `data/img/${d.id}.jpg`;
      hover.querySelector("b").textContent = d.t;
      hover.querySelector("small").textContent = [d.d, d.p].filter(Boolean).join(" · ");
      hover.querySelector("em").textContent = d.c;
    }
  }
  hover.hidden = i < 0 || i === state.sel;
  if (!hover.hidden) {
    const right = e.clientX + 250 > innerWidth - (WIDE() && !$("#detail").hidden ? 450 : 0);
    hover.style.left = (right ? e.clientX - 246 : e.clientX + 18) + "px";
    hover.style.top = Math.max(10, Math.min(e.clientY - 60, innerHeight - 290)) + "px";
  }
});
canvas.addEventListener("pointerleave", () => { hover.hidden = true; state.hover = -1; setPop(); });
canvas.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; hover.hidden = true; });
canvas.addEventListener("pointerup", (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
  const i = pick(e.clientX, e.clientY);
  if (i >= 0) select(i); else if (!state.viewingMine) closeDetail();
});

// ---------------------------------------------------------------- detail panel
function thumbStyle(node, i, size) {
  node.style.backgroundImage = `url(${ATLAS})`;
  node.style.backgroundSize = `${data.cols * size}px ${data.rows * size}px`;
  node.style.backgroundPosition = `-${(i % data.cols) * size}px -${Math.floor(i / data.cols) * size}px`;
}
function select(i, push = true) {
  state.sel = i; state.viewingMine = false;
  if (trail[trail.length - 1] !== i && trail.length < TRAIL_MAX) trail.push(i);
  setPop(); syncTrail();
  hover.hidden = true;
  const d = items[i], craft = CRAFTS[d.c] || {};
  $("#dImg").src = `data/img/${d.id}.jpg`;
  $("#dImg").alt = d.t;
  $("#dCraft").textContent = `${d.c} · ${d.r}`;
  $("#dCraftHi").textContent = craft.hi || "";
  $("#dSource").hidden = d.cs === "record" || !d.cs;
  $("#dSource").textContent = d.cs === "model" ? `Craft judged from the photograph by a model (${Math.round(d.cp * 100)}% sure); the museum's record does not name it.`
    : "Craft guessed from keywords in the museum's record; treat it as a suggestion.";
  $("#dShare").hidden = false; $("#dCreditWrap").hidden = false; $("#dMine").hidden = true; $("#dWhat").parentElement.querySelector(".cap").textContent = "About this craft";
  $("#dTitle").textContent = d.t;
  $("#dMeta").textContent = [d.d, d.p].filter(Boolean).join(" · ");
  $("#dPal").replaceChildren(...d.pal.map((hex, k) => {
    const dye = dyeByKey[d.palDyes[k]], dot = el("i");
    dot.style.background = hex;
    const b = el("button", { title: `${dye.en}${CHIP_SKIP.has(dye.key) ? "" : " — click to find more"}`, ariaLabel: `${dye.key}, ${dye.en}` },
      dot, el("span", { lang: "hi", textContent: dye.hi }), el("small", { textContent: dye.key }));
    b.onclick = () => { if (!state.story && !CHIP_SKIP.has(dye.key)) setDye(dye.key); };
    return b;
  }));
  $("#dMedium").textContent = d.m;
  $("#dCraftCard").hidden = !craft.what;
  $("#dWhat").textContent = craft.what || "";
  $("#dLook").textContent = craft.look || "";
  $("#dLook").hidden = !craft.look;
  const words = GLOSSARY.filter(([re]) => re.test(`${d.t} ${d.m}`)).slice(0, 4);
  $("#dWordsWrap").hidden = !words.length;
  $("#dWords").replaceChildren(...words.flatMap(([, term, def]) => [el("dt", { textContent: term }), el("dd", { textContent: def })]));
  $("#dLink").href = d.u; $("#dSrc").textContent = d.s;
  $("#dCredit").textContent = [d.a, d.cr].filter(Boolean).join(" · ");
  $("#dNN").replaceChildren(...d.nn.map((j) => {
    const b = el("button", { title: items[j].t, ariaLabel: items[j].t });
    b.onclick = () => select(j);
    requestAnimationFrame(() => thumbStyle(b, j, b.clientWidth || 84));
    return b;
  }));
  $("#detail").hidden = false;
  $("#detail").scrollTop = 0;
  document.body.classList.add("detail-open");
  if (location.hash !== "#" + d.id) history[push ? "pushState" : "replaceState"](null, "", "#" + d.id);
  const dist = Math.min(camera.position.z, 2.4), perPx = (2 * dist * HALF()) / innerHeight;   // zoom in if far away, never out
  const p = new THREE.Vector3(target[i * 3] + (WIDE() ? 225 * perPx : 0), target[i * 3 + 1], 0);
  flyTo(p, new THREE.Vector3(p.x, p.y, dist));
}
function closeDetail(push = true) {
  if ($("#detail").hidden) return;
  $("#detail").hidden = true; state.sel = -1; state.viewingMine = false; setPop();
  document.body.classList.remove("detail-open");
  if (location.hash) history[push ? "pushState" : "replaceState"](null, "", location.pathname + location.search);
}
$("#close").onclick = () => closeDetail();
addEventListener("popstate", () => {
  const i = items.findIndex((d) => "#" + d.id === location.hash);
  if (i >= 0) { document.body.classList.add("entered"); select(i, false); } else closeDetail(false);
});
function syncTrail() {
  $("#trail").hidden = trail.length < 2;
  $("#trailN").textContent = `your thread · ${trail.length} pieces`;
}
$("#trailCut").onclick = () => { trail.length = 0; if (state.sel >= 0) trail.push(state.sel); setPop(); syncTrail(); };
function wander() {
  const pool = ALL.filter((i) => show[i] && i !== state.sel);
  if (pool.length) select(pool[Math.floor(Math.random() * pool.length)]);
}
$("#btnWander").onclick = wander;

// ---------------------------------------------------------------- stories
function matcher(m) {
  const re = m.q ? new RegExp(m.q, "i") : null;
  return (d) => (!m.craft || m.craft.includes(d.c)) && (!m.region || m.region.includes(d.r)) && (!re || re.test(d.text)) &&
    (m.y0 == null || (d.y != null && d.y >= m.y0)) && (m.y1 == null || (d.y != null && d.y <= m.y1)) && (!m.dye || d.dyes.includes(m.dye));
}
function startStory(s) {
  for (const dlg of document.querySelectorAll("dialog[open]")) dlg.close();
  closeDetail();
  state.story = { s, i: 0 };
  document.body.classList.add("in-story", "entered");
  $("#story").hidden = false;
  showStep();
}
function showStep() {
  const { s, i } = state.story, step = s.steps[i];
  if (step.layout && step.layout !== state.layout) setLayout(step.layout, false);
  const f = matcher(step.match);
  storyMask = items.map(f);
  const n = applyFilter();
  const hi = state.lang === "hi" && HINDI[s.id]?.[i];
  $("#story").lang = hi ? "hi" : "en";
  $("#sName").replaceChildren(el("span", { lang: "hi", textContent: s.hi }), hi ? "" : ` ${s.title}`);
  $("#sStep").textContent = hi ? `${i + 1} / ${s.steps.length}` : `${i + 1} of ${s.steps.length}`;
  $("#sTitle").textContent = hi ? hi[0] : step.title;
  $("#sText").textContent = hi ? hi[1] : step.text;
  $("#sCount").textContent = hi ? (n === N ? "पूरा संग्रह दिख रहा है।" : `${n} टुकड़े रोशन हैं। किसी को भी छूकर क़रीब से देखिए।`)
    : n === N ? "Showing the whole collection." : `${n} pieces lit. Click any of them to look closer.`;
  $("#sPrev").disabled = i === 0;
  $("#sPrev").textContent = hi ? "← पीछे" : "← Back";
  $("#sNext").textContent = i === s.steps.length - 1 ? (hi ? "समाप्त" : "Finish") : hi ? "आगे →" : "Next →";
  $("#sExit").textContent = hi ? "कहानी छोड़ें" : "Leave the story";
  $("#sLang").textContent = hi ? "Read in English" : "हिंदी में पढ़ें";
  $("#sLang").lang = hi ? "en" : "hi";
  const lit = ALL.filter((k) => storyMask[k]);
  gather(lit);
  fit(lit);
}
// Lit pieces leave their places and line up as a block in the middle of the map; the rest stay behind, dimmed.
// Skipped on the timeline (position there means date) and when a step lights everything.
function gather(lit) {
  const base = layouts[state.layout], next = base.slice();
  if (state.layout !== "time" && lit.length && lit.length < N) {
    const all = boundsOf(base, ALL), cx = (all.x0 + all.x1) / 2, cy = (all.y0 + all.y1) / 2;
    const cols = Math.ceil(Math.sqrt(lit.length * 2.2)), rows = Math.ceil(lit.length / cols);
    const order = [...lit].sort((a, b) => base[a * 3] - base[b * 3]);          // keep left-to-right neighbours together
    order.forEach((k, n) => {
      next[k * 3] = cx + ((n % cols) - (cols - 1) / 2) * STEP;
      next[k * 3 + 1] = cy + ((rows - 1) / 2 - Math.floor(n / cols)) * STEP;
      next[k * 3 + 2] = 0.04;
    });
  }
  from.set(pos); target = next; tStart = performance.now(); tDur = REDUCED ? 1 : 1500;
}
function stepStory(dir) {
  if (!state.story) return;
  const i = state.story.i + dir;
  if (i < 0) return;
  if (i >= state.story.s.steps.length) return endStory();
  state.story.i = i;
  showStep();
}
function endStory() {
  if (!state.story) return;
  state.story = null; storyMask = null;
  document.body.classList.remove("in-story");
  $("#story").hidden = true;
  applyFilter();
  from.set(pos); target = layouts[state.layout]; tStart = performance.now(); tDur = REDUCED ? 1 : 1500;
  fit(ALL);
}
$("#sNext").onclick = () => stepStory(1);
$("#sPrev").onclick = () => stepStory(-1);
$("#sExit").onclick = endStory;
$("#sLang").onclick = () => { state.lang = state.lang === "hi" ? "en" : "hi"; showStep(); };
$("#storyList").replaceChildren(...STORIES.map((s) => {
  const cover = items.findIndex(matcher(s.steps[1].match)), thumb = el("i");
  if (cover >= 0) thumbStyle(thumb, cover, 76);
  const b = el("button", {}, thumb, el("span", {}, el("b", {}, el("span", { lang: "hi", textContent: s.hi }), s.title), el("small", { textContent: s.blurb })));
  b.onclick = () => startStory(s);
  return b;
}));

// ---------------------------------------------------------------- logo (drawn in logo.js)
for (const node of document.querySelectorAll(".logo")) node.innerHTML = logoSVG();
$("#favicon").href = "data:image/svg+xml," + encodeURIComponent(logoSVG());
if (data.craftModel) $("#aboutAcc").textContent = `${Math.round(data.craftModel.accuracySure * 100)} times in 100 when at least ${Math.round(data.craftModel.threshold * 100)}% sure, and ${Math.round(data.craftModel.accuracy * 100)} in 100 overall`;

// ---------------------------------------------------------------- sources, listed in the About dialog
$("#sources").replaceChildren(...SOURCES.flatMap((s) => [
  el("h4", { textContent: s.topic }),
  ...(s.note ? [el("p", { className: "caveat", textContent: s.note })] : []),
  el("ul", {}, ...s.items.map(([name, url]) => el("li", {}, el("a", { href: url, target: "_blank", rel: "noopener", textContent: name })))),
]));

// ---------------------------------------------------------------- your cloth: upload a photo, find its neighbours
let toastTimer = 0;
function toast(msg, ms = 4200) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
$("#btnMine").onclick = () => $("#mineFile").click();
$("#mineFile").onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) return toast("Please choose an image under 12 MB.");
  toast("Looking at your cloth…", 60000);
  let res;
  try {
    const r = await fetch("api/match", { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    res = await r.json();
    if (!r.ok) return toast(res.error || "That image could not be matched.");
  } catch {
    return toast("Matching needs Bunai's own server (pipeline/serve.py); this copy of the site is running without it.");
  }
  $("#toast").hidden = true;
  if (state.story) endStory();
  if (state.mine) URL.revokeObjectURL(state.mine.url);
  state.mine = { ...res, url: URL.createObjectURL(file), anchor: res.nn.slice(0, 3), palDyes: res.pal.map(nearestDye) };
  $("#mine img").src = state.mine.url;
  $("#mine").hidden = false;
  invalidate();
  document.body.classList.add("entered");
  showMine();
};
$("#mine").onclick = () => showMine();
function showMine() {
  const m = state.mine, [guess, p] = m.craft[0], craft = CRAFTS[guess] || {};
  state.sel = -1; state.viewingMine = true; setPop(); hover.hidden = true;
  $("#dImg").src = m.url; $("#dImg").alt = "Your cloth";
  $("#dCraft").textContent = "Your cloth"; $("#dCraftHi").textContent = "आपका कपड़ा";
  $("#dTitle").textContent = `Closest to ${items[m.nn[0]].t}`;
  $("#dMeta").textContent = `Its nearest neighbour in the atlas: ${[items[m.nn[0]].d, items[m.nn[0]].p].filter(Boolean).join(" · ")}`;
  $("#dSource").hidden = false;
  $("#dSource").textContent = p >= 0.5 ? `By look alone, the model reads it as ${guess.toLowerCase()} (${Math.round(p * 100)}% sure).`
    : `The model is not sure what craft this is. Its best guesses: ${m.craft.map(([c, q]) => `${c.toLowerCase()} ${Math.round(q * 100)}%`).join(", ")}.`;
  $("#dPal").replaceChildren(...m.pal.map((hex, k) => {
    const dye = dyeByKey[m.palDyes[k]], dot = el("i");
    dot.style.background = hex;
    const b = el("button", { title: dye.en, ariaLabel: `${dye.key}, ${dye.en}` }, dot, el("span", { lang: "hi", textContent: dye.hi }), el("small", { textContent: dye.key }));
    b.onclick = () => { if (!CHIP_SKIP.has(dye.key)) setDye(dye.key); };
    return b;
  }));
  $("#dMedium").textContent = "The model has only seen museum photographs of historic cloth, so a modern piece, a busy background or a phone flash can mislead it.";
  $("#dCraftCard").hidden = !(p >= 0.5 && craft.what);
  $("#dWhat").parentElement.querySelector(".cap").textContent = `If it is ${guess.toLowerCase()}`;
  $("#dWhat").textContent = craft.what || ""; $("#dLook").textContent = craft.look || ""; $("#dLook").hidden = !craft.look;
  $("#dWordsWrap").hidden = true;
  $("#dNN").replaceChildren(...m.nn.map((j) => {
    const b = el("button", { title: items[j].t, ariaLabel: items[j].t });
    b.onclick = () => select(j);
    requestAnimationFrame(() => thumbStyle(b, j, b.clientWidth || 84));
    return b;
  }));
  $("#dShare").hidden = true; $("#dCreditWrap").hidden = true; $("#dMine").hidden = false;
  $("#detail").hidden = false; $("#detail").scrollTop = 0;
  document.body.classList.add("detail-open");
  let x = 0, y = 0;
  for (const j of m.anchor) { x += target[j * 3] / m.anchor.length; y += target[j * 3 + 1] / m.anchor.length; }
  const dist = 2.8, perPx = (2 * dist * HALF()) / innerHeight;
  flyTo(new THREE.Vector3(x + (WIDE() ? 225 * perPx : 0), y, 0), new THREE.Vector3(x + (WIDE() ? 225 * perPx : 0), y, dist));
}

// ---------------------------------------------------------------- share card: a 1080 x 1350 picture of one piece
function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
  const words = text.split(/\s+/), lines = [];
  let line = "";
  for (const w of words) {
    if (ctx.measureText(line ? line + " " + w : w).width > maxW && line) { lines.push(line); line = w; } else line = line ? line + " " + w : w;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s,;:.]*\S*$/, "") + "…"; }
  lines.forEach((l, k) => ctx.fillText(l, x, y + k * lineH));
  return y + lines.length * lineH;
}
const loadImg = (src) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
async function makeCard(i) {
  const d = items[i], W = 1080, H = 1350, cv = el("canvas", { width: W, height: H }), g = cv.getContext("2d");
  await Promise.all(['400 60px "Rozha One"', '400 30px "Eczar"', '600 24px "Mukta"'].map((f) => document.fonts.load(f, "Bunai बुनाई")));
  const [photo, mark] = await Promise.all([loadImg(`data/img/${d.id}.jpg`), loadImg("data:image/svg+xml," + encodeURIComponent(logoSVG()))]);
  const bg = g.createRadialGradient(W / 2, 420, 60, W / 2, 520, 980);
  bg.addColorStop(0, "#1d2550"); bg.addColorStop(0.6, "#141a3a"); bg.addColorStop(1, "#0b0e22");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#d2a24c"; g.lineWidth = 3; g.strokeRect(28, 28, W - 56, H - 56);
  g.lineWidth = 1; g.strokeRect(40, 40, W - 80, H - 80);
  // the piece in its arch
  const ax = 210, ay = 84, aw = 660, ah = 680;
  const arch = new Path2D("M0 120V44Q0 33 9 31Q7 20 19 18Q20 8 33 9Q40 0 50 0Q60 0 67 9Q80 8 81 18Q93 20 91 31Q100 33 100 44V120Z");
  g.save(); g.translate(ax, ay); g.scale(aw / 100, ah / 120);
  g.fillStyle = "#0b0e22"; g.fill(arch); g.clip(arch);
  const sc = Math.max(100 / photo.width, 120 / photo.height);
  g.drawImage(photo, (100 - photo.width * sc) / 2, (120 - photo.height * sc) / 2, photo.width * sc, photo.height * sc);
  g.restore();
  g.save(); g.translate(ax, ay); g.scale(aw / 100, ah / 120); g.lineWidth = 0.7; g.strokeStyle = "#d2a24c"; g.stroke(arch); g.restore();
  // words
  g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.fillStyle = "#d2a24c"; g.font = '600 24px "Mukta"';
  g.fillText(`${d.c}  ·  ${(CRAFTS[d.c] || {}).roman || ""}`.toUpperCase().replace(/\s+·\s+$/, ""), W / 2, 836, 900);
  g.fillStyle = "#f4ead6"; g.font = '400 58px "Rozha One"';
  let y = wrapText(g, d.t, W / 2, 906, 900, 64, 2);
  g.fillStyle = "#c9b8a6"; g.font = '400 30px "Eczar"';
  g.fillText([d.d, d.p].filter(Boolean).join("  ·  "), W / 2, y - 14, 900);
  // dye-pots
  const py = y + 62, gap = 132, x0 = W / 2 - gap * 2;
  d.pal.forEach((hex, k) => {
    const dye = dyeByKey[d.palDyes[k]], cx = x0 + k * gap;
    g.beginPath(); g.arc(cx, py, 36, 0, Math.PI * 2); g.fillStyle = hex; g.fill(); g.lineWidth = 2; g.strokeStyle = "#f4ead6"; g.stroke();
    g.fillStyle = "#f4ead6"; g.font = '500 26px "Eczar"'; g.fillText(dye.hi, cx, py + 76);
    g.fillStyle = "#c9b8a6"; g.font = '400 20px "Mukta"'; g.fillText(dye.key, cx, py + 102);
  });
  // foot
  g.drawImage(mark, W / 2 - 172, H - 142, 50, 60);
  g.textAlign = "left"; g.fillStyle = "#f4ead6"; g.font = '400 44px "Rozha One"'; g.fillText("Bunai", W / 2 - 108, H - 94);
  g.fillStyle = "#d2a24c"; g.font = '400 30px "Rozha One"'; g.fillText("बुनाई", W / 2 + 36, H - 96);
  g.textAlign = "center"; g.fillStyle = "#c9b8a6"; g.font = '400 19px "Mukta"';
  g.fillText(`Image: ${d.s}, public domain  ·  an atlas of Indian cloth`, W / 2, H - 58, 940);
  return new Promise((ok) => cv.toBlob(ok, "image/png"));
}
$("#btnCard").onclick = async () => {
  if (state.sel < 0) return;
  const btn = $("#btnCard"), d = items[state.sel];
  btn.disabled = true; btn.textContent = "Making the card…";
  try {
    const blob = await makeCard(state.sel), url = URL.createObjectURL(blob);
    el("a", { href: url, download: `bunai-${d.id}.png` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast("Card saved to your downloads.");
  } catch { toast("The card could not be made for this piece."); }
  btn.disabled = false; btn.textContent = "Make a share card";
};
$("#btnCopy").onclick = async () => {
  try { await navigator.clipboard.writeText(location.href); toast("Link to this piece copied."); }
  catch { toast("Copy the address from your browser's address bar."); }
};

// ---------------------------------------------------------------- dialogs, intro, keys
const openThreads = () => { document.body.classList.add("entered"); $("#threads").showModal(); };
$("#btnThreads").onclick = openThreads;
$("#btnAbout").onclick = () => $("#about").showModal();
$("#aboutN").textContent = N.toLocaleString();
for (const dlg of document.querySelectorAll("dialog")) {
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
}
$("#enter").onclick = () => document.body.classList.add("entered");
$("#enterStory").onclick = openThreads;
addEventListener("keydown", (e) => {
  if (e.target.matches?.("input, textarea") || document.querySelector("dialog[open]")) return;
  if (e.key === "Escape") { if (!$("#detail").hidden) closeDetail(); else endStory(); }
  else if (!document.body.classList.contains("entered")) { if (e.key === "Enter") $("#enter").click(); }
  else if (e.key === "ArrowRight") stepStory(1);
  else if (e.key === "ArrowLeft") stepStory(-1);
  else if (e.key.toLowerCase() === "w") wander();
});

// ---------------------------------------------------------------- loop
// Sharp tiles: the atlas holds 128 px thumbnails, which blur when you zoom right in. Up close, the tiles in view
// get their full 640 px image laid over them, loaded a few at a time and dropped again when the cache fills.
const hires = new Map(), HI_MAX = 90, HI_NEAR = 2.6, hiGeo = new THREE.PlaneGeometry(BASE * 0.9, BASE * 0.9), hiLoader = new THREE.TextureLoader();
let hiLoading = 0;
function updateHires(still) {
  const near = camera.position.z < HI_NEAR;
  const halfH = camera.position.z * HALF() * 1.15, halfW = halfH * camera.aspect, cx = camera.position.x - (WIDE() ? 158 : 0) * ((2 * camera.position.z * HALF()) / innerHeight), cy = camera.position.y;
  for (const h of hires.values()) if (h.mesh) h.mesh.visible = false;   // a slot has no mesh until its image arrives
  if (!near) return;
  for (let i = 0; i < N; i++) {
    if (!show[i]) continue;
    const px = pos[i * 3], py = pos[i * 3 + 1];
    if (Math.abs(px - cx) > halfW + BASE || Math.abs(py - cy) > halfH + BASE) continue;
    const h = hires.get(i);
    if (h) {
      if (!h.mesh) continue;                                   // still loading
      const s = 1 + pop[i] * 0.7;
      h.mesh.visible = true; h.last = performance.now();
      h.mesh.position.set(px, py, pos[i * 3 + 2] + 0.002 + pop[i] * 0.021);
      h.mesh.scale.set(s, s, 1);
    } else if (still && hiLoading < 4) {
      hiLoading++;
      const slot = { mesh: null, last: performance.now() };
      hires.set(i, slot);
      hiLoader.load(`data/img/${items[i].id}.jpg`, (t) => {
        hiLoading--;
        t.colorSpace = THREE.SRGBColorSpace;
        const ar = t.image.width / t.image.height;               // centre-crop to a square, like the thumbnail
        if (ar > 1) { t.repeat.set(1 / ar, 1); t.offset.set((1 - 1 / ar) / 2, 0); } else { t.repeat.set(1, ar); t.offset.set(0, (1 - ar) / 2); }
        slot.mesh = new THREE.Mesh(hiGeo, new THREE.MeshBasicMaterial({ map: t }));
        slot.mesh.visible = false;
        scene.add(slot.mesh);
        if (hires.size > HI_MAX) {                               // evict the least recently seen
          const [old, oh] = [...hires].filter(([, o]) => o.mesh && !o.mesh.visible).sort((p, q) => p[1].last - q[1].last)[0] || [];
          if (oh) { scene.remove(oh.mesh); oh.mesh.material.map.dispose(); oh.mesh.material.dispose(); hires.delete(old); }
        }
        invalidate();
      }, undefined, () => { hiLoading--; hires.delete(i); });
    }
  }
}

// The loop runs every frame but only draws when something on screen has changed: a transition, a camera move,
// a filter, a hover. An idle atlas costs almost nothing.
let settled = false;
controls.addEventListener("change", invalidate);
function frame(now) {
  const t = Math.min(1, (now - tStart) / tDur);
  let moving = false;
  if (t < 1 || !settled) {
    settled = t >= 1; moving = true;
    const k = ease(t);
    for (let i = 0; i < N * 3; i++) pos[i] = from[i] + (target[i] - from[i]) * k;
    geo.attributes.position.needsUpdate = true;
  }
  if (flight) {
    const f = Math.min(1, (now - flight.t0) / flight.dur), k = ease(f);
    controls.target.lerpVectors(flight.fromT, flight.toT, k);
    camera.position.lerpVectors(flight.fromP, flight.toP, k);
    if (f >= 1) flight = null;
    moving = true;
  }
  controls.update();                                           // fires "change" (and so invalidate) while it is still gliding
  if (moving || dirty > 0) {
    dirty--;
    trailLine.visible = !state.story;                          // a story rearranges tiles, which would drag the thread across the map
    trail.forEach((i, n) => trailPos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2] + 0.03], n * 3));
    trailGeo.setDrawRange(0, trail.length);
    trailGeo.attributes.position.needsUpdate = true;
    updateHires(!moving);
    renderer.render(scene, camera);
    // Labels never overlap: they are placed in priority order (dates first, then events) and any label that would
    // touch one already placed, or slide under the side panel, is hidden. Zooming in makes room and brings them back.
    const placed = WIDE() ? [[0, 0, 326, innerHeight]] : [];
    for (const l of labelSets[state.layout]) {
      if (!l.el) continue;
      v.copy(l.pos).project(camera);
      const ok = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      l.el.style.display = ok ? "" : "none";
      if (!ok) continue;
      const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
      l.el.style.left = x + "px"; l.el.style.top = y + "px";
      if (!l.w) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }
      const box = [x - l.w / 2 - 9, y - l.h / 2 - 3, x + l.w / 2 + 9, y + l.h / 2 + 3];
      const hit = placed.some((q) => box[0] < q[2] && box[2] > q[0] && box[1] < q[3] && box[3] > q[1]);
      l.el.style.visibility = hit ? "hidden" : "";
      if (!hit) placed.push(box);
    }
    if (state.mine) {
      const m = state.mine;
      let mx = 0, my = 0;
      for (const j of m.anchor) { mx += pos[j * 3] / m.anchor.length; my += pos[j * 3 + 1] / m.anchor.length; }
      v.set(mx, my + STEP * 1.6, 0).project(camera);
      const pin = $("#mine");
      pin.style.left = (v.x * 0.5 + 0.5) * innerWidth + "px"; pin.style.top = (-v.y * 0.5 + 0.5) * innerHeight + "px";
    }
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- landing page: the collection introduces itself
{
  // five crafts in five niches, tallest in the middle; each niche slowly turns through its most vivid pieces
  const FEATURE = ["Block print", "Kashmir shawl weave", "Painted & dyed cotton", "Brocade & metal thread", "Embroidery"];
  const niches = FEATURE.map((craft) => {
    const chosen = (LANDING[craft] || []).map((id) => items.findIndex((d) => d.id === id)).filter((i) => i >= 0);
    const pool = ALL.filter((i) => items[i].c === craft).sort((p, q) => items[q].sa - items[p].sa);
    const picks = chosen.length ? chosen : pool.slice(0, 6);   // hand-picked; automatic only if the ids are missing
    const imgs = picks.map((i, n) => el("img", { alt: "", className: n ? "" : "on", src: n ? "" : `data/img/${items[i].id}.jpg` }));
    const niche = { craft, picks, imgs, cur: 0 };
    niche.btn = el("button", { className: "jharokha", title: `Open this piece — ${craft}` },
      el("span", { className: "frame" }, el("span", { className: "niche" }, ...imgs)),
      el("span", { className: "capt" }, el("b", { lang: "hi", textContent: CRAFTS[craft].hi }), el("small", { textContent: craft })));
    niche.btn.onclick = () => { document.body.classList.add("entered"); select(picks[niche.cur]); };
    return niche;
  });
  $("#arcade").replaceChildren(...niches.map((n) => n.btn));
  let turn = 0;
  setInterval(() => {
    if (document.body.classList.contains("entered") || document.hidden || REDUCED) return;
    const n = niches[[2, 0, 4, 1, 3][turn++ % niches.length]], next = (n.cur + 1) % n.imgs.length;   // centre first, then alternate sides
    if (!n.imgs[next].getAttribute("src")) n.imgs[next].src = `data/img/${items[n.picks[next]].id}.jpg`;
    n.imgs[n.cur].classList.remove("on"); n.imgs[next].classList.add("on"); n.cur = next;
  }, 2600);
  // the selvedge: a running border of real cloth
  const strip = Array.from({ length: 28 }, (_, n) => (n * 97 + 13) % N);
  $("#selvedge .run").replaceChildren(...[...strip, ...strip].map((i) => { const t = el("i"); thumbStyle(t, i, 34); return t; }));
}

buildLegend();
buildDyes();
years();
setLayout("galaxy");
tStart = performance.now(); tDur = REDUCED ? 1 : 2800;
for (let i = 0; i < N * 3; i++) from[i] = pos[i];
if (flight) { camera.position.copy(flight.toP); controls.target.copy(flight.toT); flight = null; }   // start framed, tiles fly in
$("#enter").textContent = "Enter the atlas";
$("#enter").disabled = $("#enterStory").disabled = false;
requestAnimationFrame(frame);

// a shared link (#piece-id) skips the intro and opens that piece
const linked = items.findIndex((d) => "#" + d.id === location.hash);
if (linked >= 0) { document.body.classList.add("entered"); select(linked, false); }
