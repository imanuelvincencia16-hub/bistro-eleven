import { ORDER_TYPE_ID } from "./i18n.js";
import { money, stamp } from "./format.js";

export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1GW0R8YADNkdQSzHuWwMNOoz5ZynpQlZghP08N7oEbQk/edit?gid=0#gid=0";

const HOOK_KEY = "bistro-eleven.sheet-hook";
const OFF = "bistro-eleven.off";

export const DEFAULT_HOOK =
  "https://script.google.com/macros/s/AKfycbwnnyNMjqlappA8CPALbnLXPUR3F0egzX8uULb28Tq1liXHu5OyrnvgjpS_yVRFNUB3Ig/exec";

export const getHook = () => {
  try {
    const saved = localStorage.getItem(HOOK_KEY);
    if (saved === OFF) return "";
    return saved || DEFAULT_HOOK;
  } catch { return DEFAULT_HOOK; }
};

export const setHook = url => {
  try {
    localStorage.setItem(HOOK_KEY, url || OFF);
  } catch {}
};

const HEAD = [
  ["Time", "Waktu"],
  ["Order ID", "Nomor pesanan"],
  ["Customer", "Nama customer"],
  ["Order type", "Tipe pesanan"],
  ["Address / table no.", "Alamat / No. meja"],
  ["Items", "Daftar makanan"],
  ["Notes", "Catatan"],
  ["Total price", "Total harga"]
];

const TYPE_EN = { delivery: "Delivery", pickup: "Pickup", table: "Table" };

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const where = (o, t) => o.type === "table"
  ? `#${o.table || "-"}`
  : o.type === "pickup"
    ? t("Pickup at the bar", "Ambil di bar")
    : o.address || t("No address on the ticket", "Alamat tidak tercatat");

export const ledgerHead = t => HEAD.map(([en, id]) => t(en, id));

export const ledgerRow = (o, t, menu) => [
  stamp(o.created),
  o.id,
  o.name,
  cap(t(TYPE_EN[o.type] || o.type, ORDER_TYPE_ID[o.type])),
  where(o, t),
  o.items.map(i => `${i.qty}× ${t(i.name, menu.find(m => m.id === i.id)?.name_id || i.name)}`).join("; "),
  o.notes || "-",
  money(o.totals.total)
];

export const pushOrder = async (o, t, menu) => {
  const res = await fetch(getHook(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ id: o.id, head: ledgerHead(t), row: ledgerRow(o, t, menu) })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  let out = null;
  try { out = JSON.parse(text); } catch { throw new Error("not an Apps Script /exec reply"); }
  if (!out || out.ok !== true) throw new Error(out?.error || "refused");
};
