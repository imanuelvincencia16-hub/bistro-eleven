import { BIZ } from "../data/biz.js";

const IDX = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
const toMin = t => { const [h, m] = String(t).trim().split(":").map(Number); return h * 60 + m; };

const daysOf = label => {
  const found = String(label).toLowerCase().match(/mon|tue|wed|thu|fri|sat|sun/g) || [];
  if (!found.length) return [];
  const from = IDX[found[0]];
  const to = IDX[found[found.length - 1]];
  const out = [];
  for (let i = 0; ; i = (i + 1) % 7) {
    out.push((from + i) % 7);
    if ((from + i) % 7 === to) break;
  }
  return out;
};

const week = () => {
  const slots = Array.from({ length: 7 }, () => null);
  BIZ.hours.forEach(([label, span]) => {
    const [a, b] = String(span).split(/[-–—]/);
    if (!a || !b) return;
    const slot = { open: toMin(a), close: toMin(b) };
    daysOf(label).forEach(d => { slots[d] = slot; });
  });
  return slots;
};

const atClock = (base, offsetDays, minutes) => {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
};

export function kitchen(now = new Date()) {
  const slots = week();
  const day = now.getDay();
  const at = now.getHours() * 60 + now.getMinutes();
  const today = slots[day];
  if (today && at >= today.open && at < today.close) {
    return { open: true, closesAt: atClock(now, 0, today.close), opensAt: null, inDays: 0 };
  }
  for (let i = 0; i < 7; i++) {
    const slot = slots[(day + i) % 7];
    if (!slot || (i === 0 && at >= slot.open)) continue;
    return { open: false, closesAt: null, opensAt: atClock(now, i, slot.open), inDays: i };
  }
  return { open: false, closesAt: null, opensAt: null, inDays: 0 };
}
