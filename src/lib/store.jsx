import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, MENU, STATUS_FLOW } from "../data/menu.js";
import { DELIVERY_FEE, FREE_OVER, PICKUP_FEE, PROMOS, SEED_REVIEWS, SERVICE_RATE, STAFF, TAX_RATE } from "../data/biz.js";
import { answer, opening } from "./assistant.js";
import { defaults, emptyVault, hydrate, loadState, saveState, threadKey } from "./storage.js";
import { CAT_ID, LANGS, LOCALE, TAG_ID, makeT } from "./i18n.js";
import { syncThemeColor } from "./pwa.js";
import { getHook, pushOrder } from "./sheets.js";
import { pullCloud, pushCloud } from "./cloud.js";
import { money, r0, setLocale, uid } from "./format.js";

const Ctx = createContext(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
};

const EN_ONLY = en => en;
const ID_ONLY = (en, id) => id || en;

const HANDOFF = {
  chef: [
    `You are now chatting directly with ${STAFF.name}. The assistant has stepped back, so everything you write here is for the chef, and a reply lands when the board is read.`,
    `Kamu sekarang chat langsung sama ${STAFF.name}. Asistennya mundur, jadi semua yang kamu tulis di sini ditujukan ke chef, dan balasannya datang saat papan dibaca.`
  ],
  bot: [
    `The assistant is back on the line. ${STAFF.name} still reads everything you wrote here.`,
    `Asistennya kembali menemani. ${STAFF.name} tetap membaca semua yang kamu tulis di sini.`
  ]
};

function matchDish(d, q) {
  if (!q) return { hit: true, exact: true };
  const tags = (d.tags || []).join(" ") + " " + (d.tags || []).map(x => TAG_ID[x] || "").join(" ");
  const words = `${d.name} ${d.name_id || ""} ${tags} ${d.cat} ${CAT_ID[d.cat] || ""}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.some(w => w.startsWith(q))) return { hit: true, exact: true };
  const text = `${d.name} ${d.name_id || ""} ${d.desc || ""} ${d.desc_id || ""}`.toLowerCase();
  if (text.includes(q)) return { hit: true, exact: false };
  return { hit: false, exact: false };
}

function searchDishes(list, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return { list: [...list], exact: true };
  const strict = list.filter(d => matchDish(d, q).exact);
  if (strict.length) return { list: strict, exact: true };
  return { list: list.filter(d => matchDish(d, q).hit), exact: false };
}

const vaultOf = (d, email) => (d.vault[String(email).toLowerCase()] ||= emptyVault());
const syncVault = d => {
  const e = d.session && d.session.kind === "user" ? d.session.email : null;
  if (!e) return;
  const v = vaultOf(d, e);
  v.cart = { ...d.cart };
  v.wish = [...d.wish];
};

const ensureThread = d => {
  const user = d.session?.kind === "user" ? String(d.session.email) : "";
  const id = threadKey(d.session);
  const name = user
    ? (d.accounts.find(a => a.email.toLowerCase() === user.toLowerCase())?.name || "Guest")
    : d.session?.kind === "staff" ? `${STAFF.name} · preview` : "Guest";
  let t = d.chats.find(c => c.id === id)
    || (user && d.chats.find(c => (c.email || "").toLowerCase() === user.toLowerCase()));
  if (!t) {
    t = { id, name, email: user, mode: "bot", unread: { guest: 0, chef: 0 }, updated: new Date().toISOString(), msgs: [] };
    d.chats.unshift(t);
  } else {
    t.name = name;
    t.email = user;
  }
  return t;
};

const threadOf = (d, id) => (id === threadKey(d.session) ? ensureThread(d) : d.chats.find(c => c.id === id) || null);

const cloudJson = d => JSON.stringify({ ...d, session: null, cart: {} });

export function AppProvider({ children }) {
  const [data, setData] = useState(loadState);
  const [ui, setUi] = useState(() => ({
    view: data.session?.kind === "staff" ? "admin" : "guest",
    authTab: "in", authReason: "",
    drawer: false, drawerOut: false, search: false,
    chat: false, chatOut: false, chatTyping: false,
    query: "", cat: "All", sort: "featured", wishOnly: false, adminTab: "orders"
  }));
  const [modal, setModal] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [toasts, setToasts] = useState([]);
  const authFrom = useRef(0);
  const timers = useRef({ modal: 0, drawer: 0, chat: 0, chatOut: 0, push: 0 });
  const dataRef = useRef(data);
  dataRef.current = data;
  const cloud = useRef({ on: false, last: "", saved: "", pending: false });
  const [cloudUi, setCloudUi] = useState({ on: false, saved: "" });

  const patchUi = useCallback(p => setUi(u => ({ ...u, ...p })), []);

  const write = useCallback(fn => setData(prev => { const next = structuredClone(prev); fn(next); return next; }), []);

  /* ── toasts ── */
  const toast = useCallback((msg, icon = "✅") => {
    const id = uid("t");
    setToasts(list => [...list, { id, msg, icon }]);
    setTimeout(() => setToasts(list => list.filter(x => x.id !== id)), 2600);
  }, []);

  const t = useMemo(() => makeT(data.lang), [data.lang]);

  /* ── persistence + theme ── */
  useEffect(() => {
    if (!saveState(data)) {
      toast(t("Storage is full. Remove your profile photo to keep saving.",
        "Penyimpanan penuh. Hapus foto profil supaya bisa terus menyimpan."), "⚠️");
    }
  }, [data, toast, t]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.theme;
    syncThemeColor(data.theme);
  }, [data.theme]);
  useEffect(() => {
    const code = LANGS.some(l => l.code === data.lang) ? data.lang : "en";
    const id = code === "id";
    document.documentElement.lang = id ? "id" : "en";
    document.title = id
      ? "Bistro Eleven · Hidangan Musiman & Malam yang Lambat"
      : "Bistro Eleven · Seasonal Plates & Slow Evenings";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = id
      ? "Bistro Eleven: dapur tetangga yang hangat, menyajikan hidangan panggang kayu api, bakery segar, dan minuman batch kecil."
      : "Bistro Eleven: a warm neighbourhood kitchen serving wood-fired mains, fresh bakery and small-batch drinks.";
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) manifest.href = id ? "/manifest.id.webmanifest" : "/manifest.webmanifest";
    setLocale(LOCALE[code]);
  }, [data.lang]);

  /* ── cloud sync ── */
  const showCloud = useCallback(() => setCloudUi({ on: cloud.current.on, saved: cloud.current.saved }), []);

  const syncCloud = useCallback(async () => {
    const c = cloud.current;
    if (!c.on || c.pending) return;
    const payload = { ...dataRef.current, session: null, cart: {} };
    const here = cloudJson(payload);
    if (here !== c.last) {
      c.pending = true;
      const saved = await pushCloud(payload);
      c.pending = false;
      if (saved) { c.last = here; c.saved = saved; showCloud(); }
      return;
    }
    const r = await pullCloud();
    if (!r || !r.state || r.saved === c.saved) return;
    const next = hydrate({ ...r.state, cart: dataRef.current.cart, session: dataRef.current.session });
    const json = cloudJson(next);
    c.saved = r.saved;
    if (json !== here) { c.last = json; setData(next); }
    showCloud();
  }, [showCloud]);

  const readCloud = useCallback(async () => {
    const r = await pullCloud();
    const c = cloud.current;
    if (!r) {
      if (c.on) { c.on = false; showCloud(); }
      return;
    }
    c.on = true;
    c.saved = r.saved || "";
    if (r.state) {
      const next = hydrate({ ...r.state, cart: dataRef.current.cart, session: dataRef.current.session });
      c.last = cloudJson(next);
      setData(d => (cloudJson(d) === c.last ? d : next));
      showCloud();
      return;
    }
    c.last = "";
    showCloud();
    syncCloud();
  }, [showCloud, syncCloud]);

  useEffect(() => { readCloud(); }, [readCloud]);

  useEffect(() => {
    clearTimeout(timers.current.push);
    timers.current.push = setTimeout(syncCloud, 1400);
    return () => clearTimeout(timers.current.push);
  }, [data, syncCloud]);

  useEffect(() => {
    const wake = () => { if (document.visibilityState === "visible") syncCloud(); };
    const id = setInterval(wake, 15000);
    document.addEventListener("visibilitychange", wake);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", wake); };
  }, [syncCloud]);

  const setLang = useCallback(next => {
    const code = LANGS.some(l => l.code === next) ? next : "en";
    write(d => { d.lang = code; });
    toast(code === "id" ? "Bahasa Indonesia aktif" : "Switched back to English", code === "id" ? "🇮🇩" : "🇬🇧");
  }, [write, toast]);

  /* ── modal + drawer chrome ── */
  const openModal = useCallback((node, cls = "") => {
    clearTimeout(timers.current.modal);
    setModal({ node, cls, closing: false });
  }, []);
  const closeModal = useCallback(() => {
    setModal(m => (m && !m.closing ? { ...m, closing: true } : m));
    clearTimeout(timers.current.modal);
    timers.current.modal = setTimeout(() => setModal(null), 300);
  }, []);
  const openDrawer = useCallback(() => {
    setUi(u => ({ ...u, drawer: true, drawerOut: false }));
  }, []);
  const closeDrawer = useCallback(() => {
    setUi(u => (u.drawer ? { ...u, drawerOut: true } : u));
    clearTimeout(timers.current.drawer);
    timers.current.drawer = setTimeout(() => setUi(u => ({ ...u, drawer: false, drawerOut: false })), 380);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", !!(modal || ui.drawer || tracker));
  }, [modal, ui.drawer, tracker]);

  /* ── identity ── */
  const findAccount = useCallback(
    email => data.accounts.find(a => a.email.toLowerCase() === String(email || "").toLowerCase()) || null,
    [data.accounts]);
  const isStaff = data.session?.kind === "staff";
  const signedIn = !!data.session;
  const me = data.session && data.session.kind === "user" ? findAccount(data.session.email) : null;

  const showAuth = useCallback(reason => {
    if (data.session) return;
    authFrom.current = window.scrollY;
    closeModal(); closeDrawer();
    setUi(u => ({ ...u, view: "auth", authTab: "in", authReason: reason || "", search: false }));
    window.scrollTo(0, 0);
  }, [data.session, closeModal, closeDrawer]);

  const leaveAuth = useCallback(() => {
    setUi(u => ({ ...u, view: "guest" }));
    window.scrollTo(0, authFrom.current);
  }, []);

  const asCustomer = useCallback(reason => {
    if (me) return true;
    if (isStaff) {
      toast(ui.view === "guest"
        ? t("Preview is read-only. The kitchen can look but not order. Use a guest account to test checkout.",
            "Pratinjau hanya untuk melihat. Dapur boleh lihat tapi tidak bisa memesan. Pakai akun tamu untuk mencoba checkout.")
        : t("You're in the kitchen. Open the guest site to see the board.",
            "Kamu sedang di dapur. Buka situs tamu untuk melihat papannya."), "👨‍🍳");
      return false;
    }
    showAuth(reason || t("Sign in or create an account to put plates on your order.",
      "Masuk atau buat akun untuk mulai menambahkan pesanan."));
    return false;
  }, [me, isStaff, ui.view, toast, showAuth, t]);

  const beginSession = useCallback((kind, email) => {
    write(d => {
      d.session = { kind, email };
      if (kind === "user") { const v = vaultOf(d, email); d.cart = { ...v.cart }; d.wish = [...v.wish]; }
      else { d.cart = {}; d.wish = []; }
    });
    closeModal();
    clearTimeout(timers.current.chat); clearTimeout(timers.current.chatOut);
    setUi(u => ({
      ...u,
      view: kind === "staff" ? "admin" : "guest",
      drawer: false, drawerOut: false, search: false,
      chat: false, chatOut: false, chatTyping: false,
      wishOnly: false, cat: "All", query: ""
    }));
    window.scrollTo(0, kind === "staff" ? 0 : authFrom.current);
  }, [write, closeModal]);

  const endSession = useCallback(quiet => {
    write(d => { syncVault(d); d.session = null; d.cart = {}; d.wish = []; });
    closeDrawer(); closeModal();
    clearTimeout(timers.current.chat); clearTimeout(timers.current.chatOut);
    setUi(u => ({ ...u, view: "guest", drawer: false, drawerOut: false, chat: false, chatOut: false, chatTyping: false, wishOnly: false, cat: "All", query: "" }));
    if (!quiet) {
      toast(t("Signed out. Your basket is saved with your account.",
        "Kamu sudah keluar. Keranjangmu tersimpan di akun."), "👋");
      window.scrollTo(0, 0);
    }
  }, [write, closeDrawer, closeModal, toast, t]);

  const createAccount = useCallback(account => {
    write(d => { d.accounts.push(account); vaultOf(d, account.email); });
  }, [write]);

  const updateMe = useCallback(patch => {
    write(d => {
      const email = d.session?.kind === "user" ? d.session.email : null;
      const acc = email && d.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (!acc) return;
      const nextEmail = patch.email && patch.email.toLowerCase() !== acc.email.toLowerCase() ? patch.email : null;
      for (const [k, v] of Object.entries(patch)) if (v !== undefined && k !== "email") acc[k] = v;
      if (nextEmail) {
        const oldKey = acc.email.toLowerCase();
        acc.email = nextEmail;
        const moved = d.vault[oldKey];
        if (moved) { delete d.vault[oldKey]; d.vault[nextEmail.toLowerCase()] = moved; }
        d.session.email = nextEmail;
        const thread = d.chats.find(c => c.id === `c-${oldKey}`);
        if (thread) { thread.id = `c-${nextEmail.toLowerCase()}`; thread.email = nextEmail; }
      }
      syncVault(d);
    });
  }, [write]);

  const setTheme = useCallback(next => {
    write(d => { d.theme = next; });
    toast(next === "dark"
      ? t("Evening service. Dark mode", "Sore hari. Mode gelap")
      : t("Daylight seating. Light mode", "Duduk siang. Mode terang"),
      next === "dark" ? "🌙" : "☀️");
  }, [write, toast, t]);

  /* ── menu reads ── */
  const dishById = useCallback(id => data.menu.find(d => d.id === id), [data.menu]);
  const cartList = useMemo(
    () => Object.entries(data.cart).map(([id, q]) => ({ d: data.menu.find(x => x.id === id), q }))
      .filter(x => x.d && x.q > 0),
    [data.cart, data.menu]);
  const cartCount = useMemo(() => cartList.reduce((n, x) => n + x.q, 0), [cartList]);
  const myOrders = useMemo(() => {
    const e = me?.email.toLowerCase();
    return e ? data.orders.filter(o => (o.email || "").toLowerCase() === e) : [];
  }, [data.orders, me]);

  const onSale = useMemo(() => data.menu.filter(d => d.available !== false), [data.menu]);
  const counts = useMemo(() => {
    const c = { All: onSale.length };
    CATEGORIES.forEach(cat => { c[cat] = onSale.filter(d => d.cat === cat).length; });
    return c;
  }, [onSale]);
  const results = useMemo(() => {
    let list = onSale;
    if (ui.cat !== "All") list = list.filter(d => d.cat === ui.cat);
    if (ui.wishOnly) list = list.filter(d => data.wish.includes(d.id));
    let exact = true;
    if (ui.query.trim()) {
      const found = searchDishes(list, ui.query);
      list = found.list; exact = found.exact;
    }
    const sorters = {
      "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating, az: (a, b) => t(a.name, a.name_id).localeCompare(t(b.name, b.name_id))
    };
    const s = sorters[ui.sort];
    return { list: s ? [...list].sort(s) : [...list], exact };
  }, [onSale, ui.cat, ui.wishOnly, ui.query, ui.sort, data.wish, t]);

  /* ── basket + wishlist ── */
  const setQty = useCallback((id, delta) => {
    if (!asCustomer(t("Sign in to put this plate on your order.",
      "Masuk dulu untuk menambahkan hidangan ini ke pesanan."))) return;
    write(d => {
      d.cart[id] = Math.max(0, (d.cart[id] || 0) + delta);
      if (!d.cart[id]) delete d.cart[id];
      syncVault(d);
    });
    if (delta > 0) {
      const dish = data.menu.find(x => x.id === id);
      if (dish) toast(t(`${dish.name} added · ${money(dish.price)}`,
        `${dish.name_id || dish.name} masuk keranjang · ${money(dish.price)}`), "🛒");
    }
  }, [asCustomer, write, toast, data.menu, t]);

  const toggleWish = useCallback(id => {
    if (!asCustomer(t("Sign in to save dishes. Your hearts live in your account.",
      "Masuk dulu untuk menyimpan hidangan. Favorit tersimpan di akunmu."))) return false;
    let nowOn = false;
    write(d => {
      const i = d.wish.indexOf(id);
      nowOn = i < 0;
      if (nowOn) d.wish.push(id); else d.wish.splice(i, 1);
      syncVault(d);
    });
    const dish = data.menu.find(x => x.id === id);
    const name = dish ? t(dish.name, dish.name_id) : "";
    toast(nowOn
      ? t(`Saved ${name} to your wishlist`, `${name} masuk favoritmu`)
      : t(`Removed ${name}`, `${name} dihapus dari favorit`), nowOn ? "❤️" : "🤍");
    return nowOn;
  }, [asCustomer, write, toast, data.menu, t]);

  const clearWish = useCallback(() => {
    write(d => { d.wish = []; syncVault(d); });
    setUi(u => ({ ...u, wishOnly: false }));
    toast(t("Wishlist cleared", "Favorit dikosongkan"), "🤍");
  }, [write, toast, t]);

  const showSavedOnly = useCallback(on => {
    setUi(u => ({ ...u, wishOnly: on, cat: "All" }));
    if (on && !data.wish.length)
      toast(t("No saved dishes yet. Tap the heart on any plate", "Belum ada hidangan favorit. Ketuk hati di kartu mana saja"), "🤍");
  }, [data.wish.length, toast, t]);

  const resetFilters = useCallback(() => {
    setUi(u => ({ ...u, cat: "All", wishOnly: false, query: "" }));
  }, []);

  /* ── totals + orders ── */
  const totals = useCallback((type, promoCode) => {
    const sub = r0(cartList.reduce((t, x) => t + x.d.price * x.q, 0));
    const tax = r0(sub * TAX_RATE);
    const service = r0(sub * SERVICE_RATE);
    const delivery = type === "delivery" ? (sub > FREE_OVER ? 0 : DELIVERY_FEE) : type === "pickup" ? PICKUP_FEE : 0;
    const promo = promoCode ? PROMOS[promoCode.toUpperCase()] : null;
    const discount = promo ? r0(Math.min(promo.type === "pct" ? sub * promo.value / 100 : promo.value, sub)) : 0;
    return { sub, tax, service, delivery, discount, promo, total: Math.max(0, r0(sub + tax + service + delivery - discount)) };
  }, [cartList]);

  const sheetBusy = useRef(new Set());
  const sendToSheet = useCallback(orders => {
    const url = getHook();
    if (!url) return Promise.resolve(0);
    const queue = orders.filter(o => !o.synced && !sheetBusy.current.has(o.id));
    if (!queue.length) return Promise.resolve(0);
    queue.forEach(o => sheetBusy.current.add(o.id));
    let sent = 0;
    return queue.reduce((chain, o) => chain
      .then(() => pushOrder(o, t, data.menu))
      .then(() => {
        sent += 1;
        write(d => { const x = d.orders.find(y => y.id === o.id); if (x) x.synced = true; });
      })
      .catch(() => {})
      .then(() => { sheetBusy.current.delete(o.id); }), Promise.resolve()).then(() => sent);
  }, [t, data.menu, write]);

  const retrySheet = useCallback(() => {
    if (document.visibilityState !== "visible" || !getHook()) return;
    const stuck = dataRef.current.orders.filter(o => !o.synced);
    if (stuck.length) sendToSheet(stuck);
  }, [sendToSheet]);

  useEffect(() => {
    retrySheet();
    const id = setInterval(retrySheet, 15000);
    document.addEventListener("visibilitychange", retrySheet);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", retrySheet); };
  }, [retrySheet]);

  const placeOrder = useCallback(order => {
    write(d => {
      d.orders.unshift(order);
      const email = d.session?.kind === "user" ? d.session.email : null;
      const acc = email && d.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (acc) {
        for (const [k, v] of Object.entries({ name: order.name, phone: order.phone, address: order.address }))
          if (v && v !== "—") acc[k] = v;
      }
      d.cart = {};
      syncVault(d);
    });
    setTracker(order);
    sendToSheet([order]);
  }, [write, sendToSheet]);

  const advanceOrder = useCallback(id => {
    write(d => {
      const o = d.orders.find(x => x.id === id);
      if (!o) return;
      o.status = STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(o.status) + 1, STATUS_FLOW.length - 1)];
    });
    const o = data.orders.find(x => x.id === id);
    if (o) toast(t(`${o.id} moved on`, `${o.id} sudah maju`), "🔔");
  }, [write, data.orders, toast, t]);

  const receiveOrder = useCallback(id => {
    write(d => {
      const o = d.orders.find(x => x.id === id);
      if (!o) return;
      o.status = "done";
      o.receivedAt = Date.now();
    });
    toast(t(`${id} is with you. Enjoy it while it is hot.`, `${id} sudah kamu terima. Selamat menikmati.`), "✅");
  }, [write, toast, t]);

  /* ── reviews ── */
  const addReview = useCallback(r => write(d => { d.reviews.unshift(r); }), [write]);
  const toggleReview = useCallback(id => {
    write(d => { const r = d.reviews.find(x => x.id === id); if (r) r.hidden = !r.hidden; });
  }, [write]);
  const deleteReview = useCallback(id => write(d => { d.reviews = d.reviews.filter(x => x.id !== id); }), [write]);

  /* ── live chat ── */
  const chatId = useMemo(() => {
    const key = threadKey(data.session);
    const email = data.session?.kind === "user" ? String(data.session.email).toLowerCase() : "";
    const own = data.chats.find(c => c.id === key)
      || (email && data.chats.find(c => (c.email || "").toLowerCase() === email));
    return own?.id || key;
  }, [data.chats, data.session]);
  const chatThread = useMemo(() => data.chats.find(c => c.id === chatId) || null, [data.chats, chatId]);
  const chatMode = chatThread?.mode === "chef" ? "chef" : "bot";

  const pushChat = useCallback((id, msg, unread) => write(d => {
    const th = threadOf(d, id);
    if (!th) return;
    th.unread ||= { guest: 0, chef: 0 };
    const now = new Date().toISOString();
    th.msgs.push({ id: uid("m"), chips: [], dishes: [], ...msg, at: now });
    if (unread) th.unread[unread] = (th.unread[unread] || 0) + 1;
    th.updated = now;
  }), [write]);

  const openChat = useCallback(() => {
    setUi(u => ({ ...u, chat: true, chatOut: false }));
    write(d => {
      const th = ensureThread(d);
      if (!th.msgs.length) {
        const en = opening(d.menu, EN_ONLY);
        const id = opening(d.menu, ID_ONLY);
        th.msgs.push({
          id: uid("m"), ...en, text_id: id.text,
          chips: en.chips, at: new Date().toISOString()
        });
      }
      th.unread.guest = 0;
    });
  }, [write]);

  const closeChat = useCallback(() => {
    setUi(u => (u.chat ? { ...u, chatOut: true } : u));
    clearTimeout(timers.current.chatOut);
    timers.current.chatOut = setTimeout(() => setUi(u => ({ ...u, chat: false, chatOut: false })), 320);
  }, []);

  const askChat = useCallback((text, textId) => {
    const msg = String(text || "").trim();
    if (!msg) return;
    pushChat(chatId, { from: "guest", text: msg, text_id: String(textId || "").trim() }, "chef");
    if (chatMode === "chef") return;
    setUi(u => ({ ...u, chatTyping: true }));
    clearTimeout(timers.current.chat);
    timers.current.chat = setTimeout(() => {
      const en = answer(msg, data.menu, EN_ONLY, myOrders);
      const id = answer(msg, data.menu, ID_ONLY, myOrders);
      setUi(u => ({ ...u, chatTyping: false }));
      pushChat(chatId, {
        from: "bot", text: en.text, text_id: id.text,
        chips: en.chips || [], dishes: en.dishes || [], go: en.go || "", track: en.track || "",
        handoff: !!en.handoff
      });
    }, 700 + Math.min(900, msg.length * 14));
  }, [pushChat, chatId, chatMode, data.menu, myOrders]);

  const setChatMode = useCallback(next => {
    const mode = next === "chef" ? "chef" : "bot";
    clearTimeout(timers.current.chat);
    setUi(u => (u.chatTyping ? { ...u, chatTyping: false } : u));
    write(d => {
      const th = ensureThread(d);
      if ((th.mode || "bot") === mode) return;
      th.mode = mode;
      const now = new Date().toISOString();
      const line = HANDOFF[mode];
      th.msgs.push({ id: uid("m"), from: "sys", text: line[0], text_id: line[1], chips: [], dishes: [], at: now });
      th.unread ||= { guest: 0, chef: 0 };
      if (mode === "chef") th.unread.chef = (th.unread.chef || 0) + 1;
      th.updated = now;
    });
  }, [write]);

  const chefReply = useCallback((id, text) => {
    const msg = String(text || "").trim();
    if (!msg) return;
    let who = "";
    write(d => {
      const th = threadOf(d, id);
      if (!th) return;
      who = th.name || "";
      th.unread ||= { guest: 0, chef: 0 };
      const now = new Date().toISOString();
      th.msgs.push({ id: uid("m"), from: "chef", text: msg, by: STAFF.name, chips: [], dishes: [], at: now });
      th.unread.guest = (th.unread.guest || 0) + 1;
      th.updated = now;
    });
    if (who) toast(t(`Replied to ${who}. It lands in their chat panel`,
      `Balasan untuk ${who} sudah masuk ke panel chat mereka`), "💬");
  }, [write, toast, t]);

  const readChat = useCallback((id, side) => write(d => {
    const th = threadOf(d, id);
    if (!th) return;
    th.unread ||= { guest: 0, chef: 0 };
    th.unread[side] = 0;
  }), [write]);

  const clearChat = useCallback(id => {
    write(d => {
      const th = threadOf(d, id);
      if (th) { th.msgs = []; th.unread = { guest: 0, chef: 0 }; }
    });
    toast(t("That conversation is cleared from the board", "Percakapan itu sudah dibersihkan dari papan"), "🧹");
  }, [write, toast, t]);

  const removeChat = useCallback(id => write(d => { d.chats = d.chats.filter(c => c.id !== id); }), [write]);

  /* ── kitchen board ── */
  const addDish = useCallback(dish => {
    write(d => { d.menu.push(dish); });
    setUi(u => ({ ...u, cat: "All", wishOnly: false, query: "" }));
    toast(t(`${dish.name} is on the board. Guests can order it now`,
      `${dish.name_id || dish.name} sudah di papan. Tamu bisa langsung pesan`), "🆕");
  }, [write, toast, t]);

  const patchDish = useCallback((id, patch) => {
    write(d => { const x = d.menu.find(m => m.id === id); if (x) Object.assign(x, patch); });
  }, [write]);

  const toggleDish = useCallback(id => {
    let name = "", on = false;
    write(d => {
      const x = d.menu.find(m => m.id === id);
      if (!x) return;
      x.available = x.available === false;
      name = x.name; on = x.available;
    });
    if (name) toast(on
      ? t(`${name} is back on the board`, `${name} sudah kembali ke papan`)
      : t(`${name} is off the board`, `${name} sudah turun dari papan`), on ? "✅" : "🚫");
  }, [write, toast, t]);

  const removeDish = useCallback(id => {
    write(d => {
      const x = d.menu.find(m => m.id === id);
      if (x) x.available = false;
      delete d.cart[id];
      syncVault(d);
    });
  }, [write]);

  const resetDemo = useCallback(() => {
    write(d => {
      d.orders = [];
      d.reviews = structuredClone(SEED_REVIEWS);
      d.menu = structuredClone(MENU);
      d.cart = {};
      d.wish = ["m1", "b2"];
      syncVault(d);
    });
    toast("Demo service reset", "♻️");
  }, [write, toast]);

  /* ── navigation ── */
  const goSection = useCallback(id => {
    if (isStaff && ui.view === "admin") {
      const toMenu = id === "menu" || ui.adminTab !== "dishes";
      setUi(u => ({ ...u, view: "admin", adminTab: "dishes" }));
      if (toMenu) requestAnimationFrame(() => document.querySelector(".admin__panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    setUi(u => ({ ...u, view: "guest" }));
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isStaff, ui.view, ui.adminTab]);

  const previewSite = useCallback(() => {
    closeModal(); closeDrawer();
    setUi(u => ({ ...u, view: "guest", drawer: false, drawerOut: false, search: false }));
    window.scrollTo(0, 0);
    toast(t("Guest site. Looking only. Nothing you tap here changes an order.",
      "Situs tamu. Sekadar melihat. Tidak ada yang kamu ketuk di sini mengubah pesanan."), "👀");
  }, [toast, closeModal, closeDrawer, t]);

  const backToConsole = useCallback(() => {
    closeModal(); closeDrawer();
    setUi(u => ({ ...u, view: "admin", drawer: false, drawerOut: false, search: false }));
    window.scrollTo(0, 0);
  }, [closeModal, closeDrawer]);

  const jumpCat = useCallback(cat => {
    setUi(u => ({ ...u, cat, wishOnly: false }));
    goSection("menu");
  }, [goSection]);

  const openBasket = useCallback(() => {
    if (asCustomer(t("Sign in to open your basket.", "Masuk dulu untuk membuka keranjang."))) openDrawer();
  }, [asCustomer, openDrawer, t]);
  const openWishlist = useCallback(() => {
    if (!asCustomer(t("Sign in to keep a saved list. Hearts are stored with your account.",
      "Masuk dulu untuk punya daftar simpanan. Favorit tersimpan di akunmu."))) return;
    showSavedOnly(!ui.wishOnly);
    goSection("menu");
    toast(ui.wishOnly
      ? t("Back to the whole board", "Kembali ke papan lengkap")
      : t("Showing your saved dishes", "Menampilkan hidangan favoritmu"), "❤️");
  }, [asCustomer, showSavedOnly, goSection, toast, ui.wishOnly, t]);

  const toggleSearch = useCallback(on => {
    setUi(u => {
      const want = on ?? !u.search;
      return { ...u, search: want };
    });
  }, []);

  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current || ui.view !== "guest") return;
    const to = decodeURIComponent(location.hash.slice(1));
    if (!to) return;
    deepLinked.current = true;
    if (to === "chat") openChat();
    else if (to === "basket") openBasket();
    else if (document.getElementById(to)) goSection(to);
  }, [ui.view, openChat, openBasket, goSection]);

  useEffect(() => {
    const onKey = e => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "");
      if (e.key === "Escape") {
        setUi(u => ({ ...u, search: false }));
        closeDrawer(); closeModal(); closeChat();
      }
      if (e.key === "/" && !typing) { e.preventDefault(); setUi(u => ({ ...u, search: true })); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [closeDrawer, closeModal, closeChat]);

  useEffect(() => () => {
    clearTimeout(timers.current.modal); clearTimeout(timers.current.drawer);
    clearTimeout(timers.current.chat); clearTimeout(timers.current.chatOut);
  }, []);

  const value = {
    data, ui, toasts, modal, tracker,
    isStaff, signedIn, me, findAccount,
    lang: data.lang === "id" ? "id" : "en", setLang, t,
    cloud: cloudUi, readCloud,
    onSale, counts, results, cartList, cartCount, myOrders, dishById, totals,
    setUi, patchUi, write,
    toast, openModal, closeModal, openDrawer, closeDrawer, setTracker,
    showAuth, leaveAuth, asCustomer, beginSession, endSession, createAccount, updateMe, setTheme,
    setQty, toggleWish, clearWish, showSavedOnly, resetFilters,
    placeOrder, advanceOrder, receiveOrder, sendToSheet,
    addReview, toggleReview, deleteReview,
    chatId, chatThread, chatMode, openChat, closeChat, askChat, setChatMode, chefReply, readChat, clearChat, removeChat,
    addDish, patchDish, toggleDish, removeDish, resetDemo,
    goSection, jumpCat, openBasket, openWishlist, toggleSearch, previewSite, backToConsole
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { defaults, searchDishes };
