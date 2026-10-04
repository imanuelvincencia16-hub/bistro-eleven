import { MENU, LOCAL_BY_ID } from "../data/menu.js";
import { SEED_ACCOUNTS, SEED_REVIEWS, REVIEW_SEED_BY_ID } from "../data/biz.js";
import { SEED_CHATS, CHAT_SEED_BY_ID, VISITOR_THREAD } from "../data/knowledge.js";

export const KEY = "bistro-eleven.v3";

export const threadKey = session =>
  (session?.kind === "user" ? `c-${String(session.email).toLowerCase()}` : VISITOR_THREAD);

export const emptyVault = () => ({ cart: {}, wish: [] });

export const defaults = () => ({
  lang: "en",
  theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  session: null,
  accounts: structuredClone(SEED_ACCOUNTS),
  vault: { [SEED_ACCOUNTS[0].email.toLowerCase()]: { cart: {}, wish: ["m1", "b2"] } },
  cart: {},
  wish: [],
  orders: [],
  reviews: structuredClone(SEED_REVIEWS),
  chats: structuredClone(SEED_CHATS),
  menu: structuredClone(MENU)
});

const board = (saved, seed) => (Array.isArray(saved) && saved.length ? saved : structuredClone(seed));

export function hydrate(saved) {
  const d = defaults();
  if (!saved) return d;
  const merged = {
    ...d, ...saved,
    accounts: board(saved.accounts, SEED_ACCOUNTS),
    menu: board(saved.menu, MENU),
    reviews: board(saved.reviews, SEED_REVIEWS),
    chats: board(saved.chats, SEED_CHATS),
    orders: Array.isArray(saved.orders) ? saved.orders : [],
    vault: { ...d.vault, ...(saved.vault || {}) }
  };
  if (merged.session && merged.session.kind === "user" &&
      !merged.accounts.some(a => a.email.toLowerCase() === merged.session.email.toLowerCase()))
    merged.session = null;
  const soup = merged.menu.find(d => d.id === "s4");
  if (soup) soup.tags = (soup.tags || []).filter(t => t !== "vegan");
  const shared = merged.chats.find(c => c.id === VISITOR_THREAD && c.email);
  if (shared) {
    const own = threadKey({ kind: "user", email: shared.email });
    if (merged.chats.some(c => c.id === own)) merged.chats = merged.chats.filter(c => c !== shared);
    else {
      shared.id = own;
      shared.name = merged.accounts.find(a => a.email.toLowerCase() === String(shared.email).toLowerCase())?.name
        || shared.name || "Guest";
    }
  }
  localise(merged);
  return merged;
}

export function loadState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)) || null; } catch { saved = null; }
  return hydrate(saved);
}

function localise(d) {
  (d.menu || []).forEach(item => {
    const s = LOCAL_BY_ID[item.id];
    if (!s) return;
    if (!item.name_id && item.name === s.name) item.name_id = s.name_id;
    if (!item.desc_id && item.desc === s.desc) { item.desc_id = s.desc_id; item.ing_id = s.ing_id; }
  });
  (d.reviews || []).forEach(r => {
    const s = REVIEW_SEED_BY_ID[r.id];
    if (s && !r.text_id) r.text_id = s.text_id;
  });
  (d.chats || []).forEach(c => (c.msgs || []).forEach(m => {
    const s = CHAT_SEED_BY_ID[m.id];
    if (s && !m.text_id && m.from === s.from) m.text_id = s.text_id;
  }));
}

export function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); return true; }
  catch { return false; }
}
