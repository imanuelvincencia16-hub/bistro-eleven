import { TOPICS, CHAT_SUGGESTIONS } from "../data/knowledge.js";
import { STAFF, riderFor, routeKm } from "../data/biz.js";
import { ALLERGEN_ID } from "../lib/i18n.js";
import { money, clockTime } from "./format.js";

const STOP = new Set([
  "the", "a", "an", "and", "with", "for", "to", "of", "in", "is", "are", "do", "does", "you", "your",
  "we", "our", "i", "me", "my", "it", "its", "on", "how", "what", "whats", "any", "have", "has",
  "there", "this", "that", "can", "could", "would", "please", "tell", "give", "want", "need",
  "makanan", "apa", "yang", "ini", "itu", "ada", "berapa", "saya", "kamu", "juga", "saja", "untuk"
]);

const norm = s => String(s || "").toLowerCase().replace(/['’]/g, "");
const clean = s => ` ${norm(s).replace(/[^a-z0-9?]+/g, " ").replace(/\s+/g, " ").trim()} `;
const hit = (msg, k) => {
  const key = norm(k).trim();
  const tiny = key.length <= 3;
  if (!msg.includes(tiny ? ` ${key} ` : key)) return 0;
  return (key.includes(" ") ? 3 : 2) + (tiny || msg.includes(` ${key} `) ? 1 : 0);
};
const hits = (msg, keys) => keys.reduce((n, k) => n + hit(msg, k), 0);

const names = d => [d.name, d.name_id].filter(Boolean);

const cardsFor = (text, onSale) => {
  const low = text.toLowerCase();
  return onSale.filter(d => names(d).some(n => low.includes(n.toLowerCase()))).slice(0, 3).map(d => d.id);
};

const ingWords = (d, t) => (d.ing || []).slice(0, 6).map((i, k) => t(i[1], d.ing_id?.[k])).join(", ");
const algWords = (d, t) => (d.alg || []).map(a => t(a, ALLERGEN_ID[a])).join(", ");

const DISH_FIELDS = [
  { keys: ["alergen", "allergen", "gluten", "nut", "nuts", "kacang", "dairy", "susu", "lactose", "egg", "eggs", "telur", "soy", "kedelai", "sesame", "wijen", "seafood", "ikan", "udang", "shrimp", "fish", "sulphite", "sulfite"],
    line: (d, t) => d.alg?.length
      ? t(`${t(d.name, d.name_id)} carries ${d.alg.join(", ")}. Everything else on that plate is listed on its card, and the kitchen can swap components, just mention it in the order note.`,
          `${t(d.name, d.name_id)} mengandung ${algWords(d, t)}. Sisanya tercatat di kartunya, dan dapur bisa mengganti komponen, tulis saja di catatan pesanan.`)
      : t(`${t(d.name, d.name_id)} has no declared allergens on the board. The kitchen still runs one fryer and one grill, so cross-contact is possible if it is a true allergy.`,
          `${t(d.name, d.name_id)} tidak punya alergen yang tercatat di papan. Dapur tetap memakai satu wajan goreng dan satu panggangan, jadi kontak silang masih mungkin kalau alergimu berat.`) },
  { keys: ["harga", "price", "cost", "berapa", "mahal", "murah", "expensive", "cheap"],
    line: (d, t) => t(`${t(d.name, d.name_id)} is ${money(d.price)}, served for one. Tax and service are added at checkout, delivery is separate.`,
      `${t(d.name, d.name_id)} harganya ${money(d.price)}, untuk satu porsi. Pajak dan service masuk saat checkout, ongkir terpisah.`) },
  { keys: ["ingredient", "bahan", "isi", "made of", "what is in", "whats in", "resep", "recipe", "sauce", "saus"],
    line: (d, t) => t(`${t(d.name, d.name_id)} is built from ${(d.ing || []).slice(0, 6).map(i => i[1]).join(", ")}. The full list sits on the dish card under Ingredients.`,
      `${t(d.name, d.name_id)} dibuat dari ${ingWords(d, t)}. Daftar lengkapnya ada di kartu hidangan, bagian Bahan.`) },
  { keys: ["lama", "how long", "wait", "minute", "menit", "prep", "ready", "fire"],
    line: (d, t) => t(`${t(d.name, d.name_id)} fires in about ${d.mins} minutes. If the pass is busy I would call it ${d.mins + 10}.`,
      `${t(d.name, d.name_id)} matang sekitar ${d.mins} menit. Kalau dapur sedang ramai, anggap ${d.mins + 10} menit.`) },
  { keys: ["kcal", "kalori", "calorie", "diet", "healthy", "sehat", "protein", "gizi"],
    line: (d, t) => t(`${t(d.name, d.name_id)} is ${d.kcal} kcal per plate. ${d.cat === "Drinks" ? "That is the whole glass." : "It is one of the lighter plates on the board."}`,
      `${t(d.name, d.name_id)} ${d.kcal} kcal per porsi. ${d.cat === "Drinks" ? "Itu untuk segelas penuh." : "Ini salah satu yang lebih ringan di papan."}`) },
  { keys: ["pedas", "spicy", "chilli", "chili", "cabai", "hot", "level"],
    line: (d, t) => d.badge === "hot"
      ? t(`${t(d.name, d.name_id)} is flagged hot, the house chilli level. We can dial it back if you say so in the note.`,
          `${t(d.name, d.name_id)} ditandai pedas, level cabai rumah. Bisa kami kurangi kalau kamu tulis di catatan.`)
      : t(`${t(d.name, d.name_id)} is not spicy as written. The house chilli oil goes on request, at any level you want.`,
          `${t(d.name, d.name_id)} tidak pedas sesuai resepnya. Minyak cabai rumah bisa ditambah kalau kamu minta, levelnya terserah.`) },
  { keys: ["vegan", "nabati", "plant", "vegetarian", "veggie", "sayur", "daging", "meat"],
    line: (d, t) => {
      const tags = d.tags || [];
      if (tags.includes("vegan"))
        return t(`${t(d.name, d.name_id)} is fully plant-based: no dairy, no honey, nothing from an animal.`,
          `${t(d.name, d.name_id)} sepenuhnya nabati: tanpa susu, tanpa madu, tidak ada yang berasal dari hewan.`);
      if (tags.includes("vegetarian") || d.badge === "veg")
        return t(`${t(d.name, d.name_id)} is vegetarian but not vegan: it does carry dairy${d.alg?.includes("Dairy") ? "" : " or egg"}. Ask us to build it without and we will try.`,
          `${t(d.name, d.name_id)} vegetarian tapi belum vegan: masih ada ${d.alg?.includes("Dairy") ? "produk susu" : "susu atau telur"}. Minta kami membuatnya tanpa itu, akan kami usahakan.`);
      return t(`${t(d.name, d.name_id)} is not a vegetarian plate: ${d.alg?.includes("Fish") ? "it is built on the fish" : "it goes out with the meat"}. I can name the vegan ones if you want.`,
        `${t(d.name, d.name_id)} bukan hidangan vegetarian: ${d.cat === "Drinks" ? "ini minuman" : "keluarnya bersama daging atau ikan"}. Sebutkan yang nabati kalau kamu mau.`);
    } },
  { keys: ["order", "pesan", "beli", "add", "checkout", "cart", "keranjang"],
    line: (d, t) => t(`${t(d.name, d.name_id)} is ${money(d.price)} and ready in ${d.mins} minutes. Tap the card to put it in your basket.`,
      `${t(d.name, d.name_id)} ${money(d.price)}, siap dalam ${d.mins} menit. Ketuk kartunya untuk memasukkan ke keranjang.`) }
];

function dishAnswer(d, msg, t) {
  const field = DISH_FIELDS.find(f => hits(msg, f.keys) > 0);
  const text = field
    ? field.line(d, t)
    : t(`${t(d.name, d.name_id)}: ${d.desc} It is ${money(d.price)}, ready in ${d.mins} minutes, ${d.kcal} kcal${d.alg?.length ? `, with ${d.alg.join(", ")}` : ""}. Guests rate it ${Number(d.rating).toFixed(1)} out of five.`,
        `${t(d.name, d.name_id)}: ${t(d.desc, d.desc_id)} Harganya ${money(d.price)}, siap dalam ${d.mins} menit, ${d.kcal} kcal${d.alg?.length ? `, dengan ${algWords(d, t)}` : ""}. Tamu menilai ${Number(d.rating).toFixed(1)} dari lima.`);
  return { text, dishes: [d.id], chips: ["Any allergens in it?", "How long does it take?", "What is the chef's pick?"] };
}

function dishMention(msg, onSale, blindTo = new Set()) {
  return onSale.filter(d => names(d).some(n => {
    const name = norm(n);
    if (msg.includes(` ${name} `)) return true;
    return name.split(/[^a-z0-9]+/).some(w =>
      w.length > 3 && !STOP.has(w) && !blindTo.has(w) && msg.includes(` ${w} `));
  }));
}

const ORDER_KEYS = [
  "my order", "my delivery", "my rider", "my courier", "my food", "order status", "track my",
  "pesanan saya", "pesanan ku", "pesanku", "orderan saya", "orderanku", "order saya", "status pesanan",
  "pengiriman saya", "kurir saya", "sudah sampai", "udah sampai", "sampai mana", "kapan sampai",
  "cek pesanan", "cek order", "posisi pesanan", "lacak pesanan"
];

const HAND = [
  ["to your door", "ke pintumu"],
  ["to the counter", "ke bar"],
  ["to your table", "ke mejamu"]
];
const READY_TAIL = [
  ["held at the pass for the next free rider, nothing has left the kitchen yet", "menunggu kurir bebas di pass, belum ada yang berangkat dari dapur"],
  ["on the shelf at the bar, ready whenever you walk in", "ada di rak bar, siap kapan pun kamu mampir"],
  ["plated and walking out to you", "sudah ditata dan sedang keluar"]
];

function orderAnswer(o, say) {
  if (!o) {
    return {
      text: say(
        `There is no ticket under your name on the board right now, so there is nothing on the road to follow. Place an order and ask me again, I read the status straight off the kitchen board.`,
        `Belum ada tiket atas nama kamu di papan, jadi belum ada yang bisa dilacak di jalan. Pesan dulu lalu tanya lagi, saya baca statusnya langsung dari papan dapur.`),
      chips: ["How do I order?", "What is on the menu?"],
      dishes: [],
      track: ""
    };
  }

  const kind = { delivery: 0, pickup: 1, table: 2 }[o.type] ?? 0;
  const hand = HAND[kind];
  const tail = READY_TAIL[kind];
  const rider = riderFor(o.id);
  const km = routeKm(o.id).toFixed(1);
  const eta = Math.max(1, o.eta || 25);
  const placed = clockTime(o.created);
  const due = clockTime(o.created + eta * 60000);

  const L = {
    new: say(
      `${o.id} is printed and sitting on the pass. The chef has not started it, so nothing is cooking and nothing is heading ${hand[0]} yet. The kitchen works its tickets top down and yours is in that queue.`,
      `${o.id} sudah tercetak dan ada di pass. Chef belum memulainya, jadi belum ada yang dimasak dan belum ada yang berangkat ${hand[1]}. Dapur mengerjakan tiket dari yang paling atas, punyamu antre di situ.`),
    cooking: say(
      `${o.id} is on the fire now. It went in at ${placed} on a ${eta} minute run, so I would call it ready around ${due}. Nothing has left the kitchen yet.`,
      `${o.id} sedang dimasak sekarang. Masuk jam ${placed} dengan jatah ${eta} menit, jadi kira-kira siap sekitar ${due}. Belum ada yang berangkat dari dapur.`),
    ready: say(
      `${o.id} is cooked, packed and sealed. It is ${tail[0]}.`,
      `${o.id} sudah matang, dikemas, dan disegel. Statusnya ${tail[1]}.`),
    delivering: kind === 0 ? say(
      `${o.id} left the pass with ${rider.name} on the ${rider.bike}, plate ${rider.plate}. The run is ${km} km, due ${hand[0]} around ${due}. Open the tracker to watch the ride, then tap the button there once the bag is in your hands.`,
      `${o.id} sudah berangkat dari pass bersama ${rider.name} naik ${rider.bike}, nopol ${rider.plate}. Jaraknya ${km} km, perkiraan sampai ${hand[1]} sekitar ${due}. Buka pelacaknya untuk melihat lintasannya, lalu tekan tombolnya begitu bungkusnya ada di tanganmu.`)
      : say(
      `${o.id} is out of the kitchen, heading ${hand[0]}.`,
      `${o.id} sudah keluar dari dapur, menuju ${hand[1]}.`),
    done: o.receivedAt ? say(
      `${o.id} is signed for. You confirmed it at ${clockTime(o.receivedAt)} and the chef's board has it served too. Tell the pass how it ate.`,
      `${o.id} sudah kamu terima. Konfirmasinya pukul ${clockTime(o.receivedAt)} dan papan chef juga mencatatnya selesai. Kabari dapur rasanya.`)
      : say(
      `The kitchen marked ${o.id} served from our side. If it never reached you, write it here and ${STAFF.name} will chase the rider before the next service.`,
      `Dapur sudah menandai ${o.id} selesai dari sisi kami. Kalau tidak sampai ke kamu, tulis di sini dan ${STAFF.name} akan mengejar kurirnya sebelum jam masak berikutnya.`)
  };

  return {
    text: L[o.status] || L.new,
    chips: o.status === "done"
      ? ["How do I leave a review?", "Any promo codes?"]
      : ["Where is my order?", "How long does cooking take?"],
    dishes: (o.items || []).slice(0, 3).map(i => i.id),
    track: kind === 0 ? o.id : "",
    handoff: o.status === "done" && !o.receivedAt
  };
}

export function answer(raw, menu, t, orders) {
  const say = t || ((en) => en);
  const msg = clean(raw);
  const onSale = liveMenu(menu);
  const ctx = { menu: onSale, onSale, count: onSale.length, q: msg, t: say };

  const mine = (orders || []).filter(o => o && o.id);
  if (hits(msg, ORDER_KEYS) > 0) {
    return orderAnswer(mine.find(x => x.status !== "done") || mine[0] || null, say);
  }

  const scored = TOPICS.map(x => ({ x, s: hits(msg, x.keys) })).filter(y => y.s > 0).sort((a, b) => b.s - a.s);
  const top = scored[0]?.x || null;
  const named = dishMention(msg, onSale, new Set(top?.keys || []));

  if (named.length === 1) return dishAnswer(named[0], msg, say);
  if (named.length > 1) {
    const few = named.slice(0, 3);
    return {
      text: say(`I can hear more than one plate in that: ${few.map(d => d.name).join(", ")}. Which one shall I read out to you?`,
        `Saya dengar lebih dari satu hidangan di situ: ${few.map(d => say(d.name, d.name_id)).join(", ")}. Yang mana mau saya bacakan?`),
      dishes: few.map(d => d.id),
      chips: few.map(d => `Tell me about ${d.name}`)
    };
  }

  if (top) {
    const also = (scored.find(y => y.x !== top && y.s >= scored[0].s - 1) || {}).x;
    const text = also ? `${top.text(ctx)}\n${also.text(ctx)}` : top.text(ctx);
    const chips = [...new Set([...(top.chips || []), ...(also?.chips || [])])].slice(0, 3);
    const dishes = [...new Set([...cardsFor(top.text(ctx), onSale), ...(also ? cardsFor(also.text(ctx), onSale) : [])])].slice(0, 3);
    return { text, chips, dishes, go: top.go || also?.go, handoff: !!(top.handoff || also?.handoff) };
  }

  return {
    text: say(
      `I did not catch that one, and I would rather say so than guess. The menu, allergens, prices, delivery, payment and our hours are mine. This one needs a person: press the button below and it goes to ${STAFF.name} in this same thread.`,
      `Yang satu ini saya kurang tangkap, dan saya lebih baik mengaku daripada mengarang. Menu, alergen, harga, pengiriman, pembayaran, dan jam buka itu bagian saya. Yang ini butuh manusia: tekan tombol di bawah dan pertanyaannya masuk ke ${STAFF.name} di obrolan yang sama.`),
    chips: CHAT_SUGGESTIONS.slice(0, 3),
    dishes: [],
    go: "menu",
    handoff: true
  };
}

export function opening(menu, t) {
  const say = t || ((en) => en);
  const onSale = liveMenu(menu);
  return {
    text: say(`Welcome to Bistro Eleven. I know all ${onSale.length} plates on the board, what is in them, and how the kitchen runs. Ask away.`,
      `Selamat datang di Bistro Eleven. Saya hafal ${onSale.length} hidangan di papan, apa isinya, dan bagaimana dapur berjalan. Silakan tanya apa saja.`),
    chips: CHAT_SUGGESTIONS.slice(0, 3),
    dishes: [],
    at: new Date().toISOString(),
    from: "bot"
  };
}

export function liveMenu(menu) { return (menu || []).filter(d => d.available !== false); }
export { CHAT_SUGGESTIONS };
