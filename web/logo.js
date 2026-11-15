// Bunai logo marks, as SVG strings so the same drawing serves the page, the favicon and the share card.
const GOLD = "#d2a24c", CREAM = "#f4ead6", GROUND = "#3a0f1e", DEEP = "#280a14";
const wrap = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

// 1. BUTA — the flowering-plant motif of the Kashmir shawl, its body filled with a woven lattice.
//    The one motif every Indian textile tradition shares, and the subject of one of the stories.
function buta() {
  const outer = "M44 114C20 114 6 96 8 73C10 50 27 35 44 25C57 17 68 6 82 9C94 12 96 28 85 32C78 34 73 29 76 23C68 27 64 36 68 46C76 62 84 76 80 92C76 106 62 114 44 114Z";
  let lattice = "";
  for (let k = -120; k <= 220; k += 13) lattice += `M${k} 0L${k + 120} 120M${k} 0L${k - 120} 120`;
  return wrap("0 0 100 120",
    `<defs><clipPath id="bt"><path d="${outer}"/></clipPath></defs>` +
    `<path d="${outer}" fill="${GROUND}"/>` +
    `<g clip-path="url(#bt)"><path d="${lattice}" stroke="${GOLD}" stroke-width="1.6" stroke-opacity=".75" fill="none"/></g>` +
    `<path d="${outer}" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linejoin="round"/>` +
    `<circle cx="44" cy="78" r="13" fill="${DEEP}" stroke="${GOLD}" stroke-width="3"/>` +
    [0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="44" cy="70" rx="2.6" ry="4.6" fill="${CREAM}" transform="rotate(${a} 44 78)"/>`).join("") +
    `<circle cx="44" cy="78" r="2.4" fill="${GOLD}"/>`);
}

// 2. SEAL — a printer's block (chhapa): scalloped edge, the first syllable of बुनाई in the middle.
function seal() {
  const n = 14, R = 50, r = 9;
  let edge = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const p = (a) => `${(60 + Math.cos(a) * R).toFixed(1)} ${(60 + Math.sin(a) * R).toFixed(1)}`;
    edge += `${i ? "" : "M" + p(a0)}A${r + 3} ${r + 3} 0 0 1 ${p(a1)}`;
  }
  return wrap("0 0 120 120",
    `<path d="${edge}Z" fill="${GROUND}" stroke="${GOLD}" stroke-width="3.5" stroke-linejoin="round"/>` +
    `<circle cx="60" cy="60" r="39" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-dasharray="1.5 5" stroke-linecap="round"/>` +
    `<text x="60" y="80" text-anchor="middle" font-family="'Rozha One','Eczar','Nirmala UI',serif" font-size="54" fill="${CREAM}">बु</text>`);
}

// 3. LOOM — warp and weft, shown as a single over-and-under knot inside a diamond.
function loom() {
  const s = (d, c, w) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="butt"/>`;
  const warp = [42, 60, 78], weft = [42, 60, 78];
  let body = weft.map((y) => s(`M22 ${y}H98`, CREAM, 9)).join("") + warp.map((x) => s(`M${x} 22V98`, GOLD, 9)).join("");
  warp.forEach((x, i) => weft.forEach((y, j) => { if ((i + j) % 2 === 0) body += s(`M${x - 9} ${y}H${x + 9}`, DEEP, 13) + s(`M${x - 10} ${y}H${x + 10}`, CREAM, 9); }));
  return wrap("0 0 120 120",
    `<defs><clipPath id="lm"><path d="M60 8L112 60L60 112L8 60Z"/></clipPath></defs>` +
    `<path d="M60 8L112 60L60 112L8 60Z" fill="${DEEP}"/>` +
    `<g clip-path="url(#lm)" transform="rotate(45 60 60)">${body}</g>` +
    `<path d="M60 8L112 60L60 112L8 60Z" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linejoin="round"/>`);
}

export const LOGOS = { buta, seal, loom };
export const LOGO = "buta";                 // the mark in use across the site
export const logoSVG = () => LOGOS[LOGO]();
