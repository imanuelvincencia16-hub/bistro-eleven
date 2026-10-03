/* Renders the PWA icons into public/icons with no dependencies: a tiny software
   rasterizer (supersampled shape masks) plus a hand-rolled PNG encoder.
   Run: node scripts/make-icons.mjs                                      */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
const BRAND = [177, 109, 42];
const CREAM = [255, 250, 243];
const SHADOW = [26, 18, 8];

/* ── shape tests, all in normalised 0..1 canvas units ── */
const inRoundRect = (x, y, r) => {
  const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
  const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
  return Math.hypot(dx, dy) <= r;
};
const inCapsule = (x, y, s, t) => {
  const vx = s[2] - s[0], vy = s[3] - s[1];
  const len2 = vx * vx + vy * vy;
  const k = len2 ? Math.max(0, Math.min(1, ((x - s[0]) * vx + (y - s[1]) * vy) / len2)) : 0;
  return Math.hypot(x - (s[0] + vx * k), y - (s[1] + vy * k)) <= t / 2;
};
const inAnnulus = (x, y, rad, w) => Math.abs(Math.hypot(x - 0.5, y - 0.5) - rad) <= w / 2;

/* the monogram: two X strokes, an I with serifs, plus a plate-rim underline */
const MARKS = [
  [[0.295, 0.365, 0.455, 0.575], 0.052],
  [[0.455, 0.365, 0.295, 0.575], 0.052],
  [[0.625, 0.365, 0.625, 0.575], 0.052],
  [[0.575, 0.365, 0.675, 0.365], 0.032],
  [[0.575, 0.575, 0.675, 0.575], 0.032],
  [[0.400, 0.705, 0.600, 0.705], 0.022]
];

const about = (v, w, s) => [0.5 + (v - 0.5) * s, 0.5 + (w - 0.5) * s];
const fit = ([pts, t], s) => {
  const [ax, ay] = about(pts[0], pts[1], s);
  const [bx, by] = about(pts[2], pts[3], s);
  return [[ax, ay, bx, by], t * s];
};
const SHAPES = MARKS.map(m => fit(m, 1));

function paint(x, y, o) {
  let c = null; // [r,g,b,a] straight alpha
  const over = (col, a) => {
    if (a <= 0) return;
    if (!c) { c = [col[0], col[1], col[2], a]; return; }
    const [br, bg, bb, ba] = c;
    const na = a + ba * (1 - a);
    c = [(col[0] * a + br * ba * (1 - a)) / na,
         (col[1] * a + bg * ba * (1 - a)) / na,
         (col[2] * a + bb * ba * (1 - a)) / na, na];
  };
  if (o.bleed || inRoundRect(x, y, 0.2)) over(BRAND, 1);
  if (!c) return [0, 0, 0, 0];
  over(CREAM, Math.max(0, 0.15 * (1 - y / 0.5)));      // light falling from the top
  over(SHADOW, Math.max(0, 0.17 * ((y - 0.5) / 0.5))); // and settling at the base
  if (o.ring && inAnnulus(x, y, 0.37, 0.014)) over(CREAM, 1);
  for (const [pts, t] of SHAPES) {
    const s = fit([[pts[0], pts[1] + 0.013, pts[2], pts[3] + 0.013], t], o.s);
    if (inCapsule(x, y, s[0], s[1])) over(SHADOW, 0.26);
  }
  for (const m of MARKS) {
    const [pts, t] = fit(m, o.s);
    if (inCapsule(x, y, pts, t)) over(CREAM, 1);
  }
  return c;
}

/* ── rasterize ── */
function render(size, o, ss) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const c = paint((x + (sx + 0.5) / ss) / size, (y + (sy + 0.5) / ss) / size, o);
          r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3];
        }
      }
      const alpha = a / (ss * ss), i = (y * size + x) * 4;
      px[i] = alpha ? Math.round(r / a) : 0;
      px[i + 1] = alpha ? Math.round(g / a) : 0;
      px[i + 2] = alpha ? Math.round(b / a) : 0;
      px[i + 3] = Math.round(alpha * 255);
    }
  }
  return png(size, px);
}

/* ── PNG encoder ── */
const CRC = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return buf => {
    let c = 0xffffffff;
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();
const chunk = (type, data) => {
  const head = Buffer.alloc(4); head.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const tail = Buffer.alloc(4); tail.writeUInt32BE(CRC(body));
  return Buffer.concat([head, body, tail]);
};
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))
  ]);
}

mkdirSync(OUT, { recursive: true });
const jobs = [
  ["icon-192.png", 192, { s: 1, ring: true }, 3],
  ["icon-512.png", 512, { s: 1, ring: true }, 3],
  ["icon-maskable-512.png", 512, { s: 0.76, ring: false, bleed: true }, 3],
  ["apple-touch-icon.png", 180, { s: 1, ring: true, bleed: true }, 3],
  ["favicon-32.png", 32, { s: 1.06, ring: false }, 5]
];
for (const [file, size, o, ss] of jobs) {
  const buf = render(size, o, ss);
  writeFileSync(join(OUT, file), buf);
  console.log(file.padEnd(24), String(size).padStart(4) + "px", (buf.length / 1024).toFixed(1) + " kB");
}
