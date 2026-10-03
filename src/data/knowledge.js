import { BIZ, PROMOS, PAY_METHODS, DELIVERY_FEE, FREE_OVER, PICKUP_FEE, STAFF } from "./biz.js";
import { money } from "../lib/format.js";
import { ALLERGEN_ID, CAT_ID, HOURS_ID, PAY_ID, PROMO_ID } from "../lib/i18n.js";

export const VISITOR_THREAD = "this-visitor";

export const CHAT_SUGGESTIONS = [
  "What is the chef's pick?",
  "Any vegan plates?",
  "How much is delivery?",
  "Do you take QRIS?",
  "Opening hours?"
];

export const CHIP_ID = {
  "What is the chef's pick?": "Menu rekomendasi chef?",
  "Any vegan plates?": "Ada menu nabati?",
  "How much is delivery?": "Berapa ongkirnya?",
  "Do you take QRIS?": "Bisa bayar pakai QRIS?",
  "Opening hours?": "Jam berapa kita buka?",
  "Opening hours": "Jam berapa kita buka?",
  "What is on the menu?": "Apa saja menunya?",
  "📖 What is on the menu?": "📖 Apa saja menunya?",
  "What is cheap?": "Yang paling murah apa?",
  "Do I need a reservation?": "Perlu reservasi dulu?",
  "How far do you deliver?": "Sampai mana saja kalian antar?",
  "Where are you?": "Di mana lokasi kalian?",
  "Is there parking?": "Ada parkiran?",
  "How long does cooking take?": "Berapa lama masaknya?",
  "Payment methods": "Metode pembayaran",
  "💳 Payment methods": "💳 Metode pembayaran",
  "Chef's recommendation": "Rekomendasi chef",
  "⭐ Chef's recommendation": "⭐ Rekomendasi chef",
  "Allergens": "Alergen",
  "🥜 Allergens": "🥜 Alergen",
  "Talk to a human": "Bicara dengan staf",
  "👨‍ Talk to a human": "👨‍ Bicara dengan staf",
  "Anything spicy?": "Ada yang pedas?",
  "Vegetarian options?": "Ada opsi vegetarian?",
  "Any allergens in those?": "Ada alergen di situ?",
  "Any allergens in it?": "Ada alergen di situ?",
  "What is in that sauce?": "Apa isi saus itu?",
  "What is in the Rainbow Bistro Bowl?": "Apa isi Rainbow Bistro Bowl?",
  "Can I bring a group?": "Bisa bawa rombongan?",
  "Any promo codes?": "Ada kode promo?",
  "How do I order?": "Cara pesannya bagaimana?",
  "Where is my order?": "Di mana pesanan saya?",
  "How do I leave a review?": "Bagaimana cara memberi ulasan?",
  "How long does it take?": "Berapa lama waktunya?",
  "Can I get a table?": "Bisa minta meja?"
};

export const chipText = (s, t) => t(s, CHIP_ID[s] || "");

const names = (t, arr, n = 4) => {
  const head = arr.slice(0, n).map(d => t(d.name, d.name_id)).join(", ");
  return arr.length > n ? `${head} ${t(`(+${arr.length - n} more)`, `(+${arr.length - n} lagi)`)}` : head;
};
const byTag = (menu, tag) => menu.filter(d => (d.tags || []).includes(tag));
const cheapest = menu => [...menu].sort((a, b) => a.price - b.price)[0];
const priciest = menu => [...menu].sort((a, b) => b.price - a.price)[0];
const range = menu => {
  const p = menu.map(d => d.price).sort((a, b) => a - b);
  return p.length ? `${money(p[0])} – ${money(p[p.length - 1])}` : "-";
};
const hoursLines = t => BIZ.hours.map(([d, h]) => `${t(d, HOURS_ID[d])} ${h}`).join(" · ");
const promoLines = t => Object.entries(PROMOS).map(([c, p]) => `${c}: ${t(p.label, PROMO_ID[p.label])}`).join(" · ");
const payLines = t => PAY_METHODS.map(p => `${p[1]} ${t(...(PAY_ID[p[2]] || [p[2], ""]))}`).join(" · ");
const cardLines = t => BIZ.payments.map(p => t(p, p === "Cash" ? "Tunai" : p)).join(", ");

const ALLERGEN_WORDS = [
  ["Tree nuts", ["peanut", "walnut", "hazelnut", "cashew", "almond", "tree nut", "nuts", "kacang", "kaju"]],
  ["Dairy", ["dairy", "susu", "lactose", "keju", "cheese", "cream", "butter", "mentega"]],
  ["Gluten", ["gluten", "gandum", "wheat", "bread", "roti", "tepung"]],
  ["Egg", ["egg", "telur"]],
  ["Soy", ["soy", "kedelai", "tofu", "tahu"]],
  ["Sesame", ["sesame", "wijen"]],
  ["Fish", ["fish", "seafood", "ikan", "udang", "shrimp", "prawn"]],
  ["Sulphites", ["sulphite", "sulfite", "anggur"]]
];

export const TOPICS = [
  {
    id: "greet",
    keys: ["halo", "hai", "hi ", "hello", "hey", "pagi", "siang", "malam", "assalam", "good morning", "good evening", "selamat"],
    text: ({ count, t }) => t(
      `Welcome to ${BIZ.name}. Ask me anything about the ${count} dishes on the board: allergens, prices, delivery, or when we cook.`,
      `Selamat datang di ${BIZ.name}. Tanyakan apa saja soal ${count} hidangan di papan ini: alergen, harga, pengiriman, atau jam masak kami.`),
    chips: ["What is the chef's pick?", "Any vegan plates?"]
  },
  {
    id: "thanks",
    keys: ["thank", "thanks", "makasih", "terima kasih", "trimakasih", "nice", "great job"],
    text: ({ t }) => t(
      `Anytime. If the kitchen can prep something ahead for you, just ask. ${STAFF.name} reads this board between services.`,
      `Sama-sama. Kalau dapur bisa menyiapkan sesuatu lebih dulu untukmu, bilang saja. ${STAFF.name} membaca papan ini di sela jam masak.`)
  },
  {
    id: "menu",
    chip: "📖 What is on the menu?",
    keys: ["menu", "daftar", "makanan apa", "what do you serve", "serve", "food", "dishes", "pilihan"],
    text: ({ menu, onSale, t }) => {
      const cats = [...new Set(menu.map(d => d.cat))].join(", ");
      const catsId = [...new Set(menu.map(d => t(d.cat, CAT_ID[d.cat])))].join(", ");
      return t(
        `We cook ${onSale.length} plates across Starters, Mains, Pizza & Pasta, Desserts, Bakery and Drinks. Everything sits between ${range(onSale)}. Categories: ${cats}.`,
        `Kami memasak ${onSale.length} hidangan: Pembuka, Hidangan Utama, Pizza & Pasta, Hidangan Manis, Roti & Kue, dan Minuman. Semuanya ada di rentang ${range(onSale)}. Kategorinya: ${catsId}.`);
    },
    chips: ["What is the chef's pick?", "What is cheap?", "Any vegan plates?"],
    go: "menu"
  },
  {
    id: "hours",
    chip: "🕙 Opening hours",
    keys: ["hour", "hours", "open", "opens", "closing", "close", "tutup", "jam buka", "buka", "sampai jam", "waktu"],
    text: ({ t }) => t(
      `Kitchen hours: ${hoursLines(t)}. Last orders go out thirty minutes before each block closes.`,
      `Jam dapur: ${hoursLines(t)}. Pesanan terakhir keluar tiga puluh menit sebelum tutup di tiap blok.`),
    chips: ["Do I need a reservation?", "How far do you deliver?"]
  },
  {
    id: "where",
    keys: ["where", "address", "alamat", "lokasi", "location", "di mana", "dimana", "maps", "map", "arah"],
    text: ({ t }) => t(
      `${BIZ.street[0]}, ${BIZ.street[1]}. Eleven seats at the counter and four small tables. The pin is in the Visit section, and ${BIZ.phoneShow} reaches us if you get lost.`,
      `${BIZ.street[0]}, ${BIZ.street[1]}. Sebelas kursi di bar dan empat meja kecil. Titik lokasinya ada di bagian Kunjungi, dan ${BIZ.phoneShow} bisa kamu hubungi kalau nyasar.`),
    chips: ["Is there parking?", "Do I need a reservation?"],
    go: "visit"
  },
  {
    id: "parking",
    keys: ["parkir", "parking", "motor", "mobil", "car", "bike"],
    text: ({ t }) => t(
      `Street parking along Jl. Lantern after 18:00, and a guarded lot two doors down for cars. Motorbikes park right in front of the window.`,
      `Parkir di tepi Jl. Lantern setelah jam 18.00, dan ada lahan berjaga dua pintu ke bawah untuk mobil. Motor boleh parkir tepat di depan jendela.`),
    chips: ["Where are you?"]
  },
  {
    id: "delivery",
    chip: "🛵 How much is delivery?",
    keys: ["deliver", "delivery", "kirim", "pengiriman", "gofood", "grabfood", "shopee", "ongkir", "antar", "pickup", "takeaway", "bawa pulang"],
    text: ({ t }) => t(
      `Delivery is a flat ${money(DELIVERY_FEE)} anywhere in our zone and free over ${money(FREE_OVER)}. Pickup is ${money(PICKUP_FEE)} for the packaging, ready to collect about 20 minutes after you order.`,
      `Ongkirnya ${money(DELIVERY_FEE)} rata ke seluruh area kami, dan gratis untuk pesanan di atas ${money(FREE_OVER)}. Ambil sendiri kena ${money(PICKUP_FEE)} untuk kemasan, siap diambil sekitar 20 menit setelah kamu pesan.`),
    chips: ["How long does cooking take?", "Do you take QRIS?"]
  },
  {
    id: "payment",
    chip: "💳 Payment methods",
    keys: ["pay", "payment", "bayar", "qris", "card", "kartu", "credit", "debit", "cash", "tunai", "transfer", "gopay", "ovo", "dana", "virtual account"],
    text: ({ t }) => t(
      `${payLines(t)} plus ${cardLines(t)}. QRIS and cards are settled at the counter or with the rider.`,
      `${payLines(t)}, plus ${cardLines(t)}. QRIS dan kartu dibayarkan di bar atau ke kurir.`),
    chips: ["Any promo codes?", "How much is delivery?"]
  },
  {
    id: "promo",
    keys: ["promo", "discount", "diskon", "voucher", "kode", "code", "murah sedikit", "deal"],
    text: ({ t }) => t(
      `Working codes right now: ${promoLines(t)}. Type the code at checkout and we take it off the subtotal before tax.`,
      `Kode yang aktif sekarang: ${promoLines(t)}. Masukkan kodenya saat checkout, potongannya dihitung sebelum pajak.`),
    chips: ["Do you take QRIS?"]
  },
  {
    id: "chefpick",
    chip: "⭐ Chef's recommendation",
    keys: ["recommend", "rekomendasi", "suggest", "best", "signature", "famous", "popular", "chef pick", "chef's pick", "paling enak", "enak", "favorite", "favorit", "must try",
      "menu favorit", "makanan favorit", "rekomendasi menu", "apa yang enak", "pilihan terbaik", "what should i order", "what to order", "best seller", "terlaris", "most ordered"],
    text: ({ onSale, t }) => {
      const picks = onSale.filter(d => d.badge === "chef");
      const hot = onSale.filter(d => d.rating >= 4.8);
      const top = [...new Set([...picks, ...hot])].slice(0, 3);
      return t(
        `The board's regulars: ${names(t, top, 3)}. ${top[0] ? top[0].desc : ""}`,
        `Langganan di papan ini: ${names(t, top, 3)}. ${top[0] ? t(top[0].desc, top[0].desc_id) : ""}`);
    },
    chips: ["What is cheap?", "Anything spicy?"]
  },
  {
    id: "budget",
    keys: ["cheap", "murah", "budget", "afford", "expensive", "mahal", "price", "harga", "berapa harga", "termurah", "under", "below"],
    text: ({ onSale, t }) => {
      const lo = cheapest(onSale), hi = priciest(onSale);
      return t(
        `Plates run ${range(onSale)}. Cheapest is ${lo.name} at ${money(lo.price)}, the splurge is ${hi.name} at ${money(hi.price)}. Tell me a budget and I will pick from it.`,
        `Harganya ${range(onSale)}. Paling murah ${t(lo.name, lo.name_id)} seharga ${money(lo.price)}, paling bikin boros ${t(hi.name, hi.name_id)} seharga ${money(hi.price)}. Sebutkan budgetmu, nanti saya pilihkan.`);
    },
    chips: ["What is the chef's pick?", "Any vegan plates?"],
    go: "menu"
  },
  {
    id: "vegan",
    keys: ["vegan", "nabati", "plant based", "plant-based", "no dairy", "dairy free", "bebas susu"],
    text: ({ menu, t }) => {
      const v = byTag(menu, "vegan");
      return v.length
        ? t(
            `Fully plant-based right now: ${names(t, v)}. Everything else can be built without cheese or cream, say the word in the order note.`,
            `Yang sepenuhnya nabati hari ini: ${names(t, v)}. Sisanya bisa dibuat tanpa keju atau krim, tulis saja di catatan pesanan.`)
        : t(
            `Nothing is labelled fully vegan today, but most plates can drop the dairy. Ask me about a specific dish.`,
            `Hari ini belum ada yang berlabel penuh vegan, tapi kebanyakan hidangan bisa tanpa produk susu. Tanyakan satu hidangan tertentu.`);
    },
    chips: ["Vegetarian options?", "Any allergens in those?"]
  },
  {
    id: "vegetarian",
    keys: ["vegetarian", "veggie", "sayuran", "sayur", "no meat", "tanpa daging"],
    text: ({ onSale, t }) => t(
      `Veggie-friendly: ${names(t, onSale.filter(d => d.badge === "veg" || (d.tags || []).some(x => ["vegetarian", "vegan"].includes(x))), 5)}.`,
      `Yang ramah vegetarian: ${names(t, onSale.filter(d => d.badge === "veg" || (d.tags || []).some(x => ["vegetarian", "vegan"].includes(x))), 5)}.`),
    chips: ["Any vegan plates?"]
  },
  {
    id: "halal",
    keys: ["halal", "haram", "pork", "babi", "alcohol", "alkohol", "wine", "bacon", "gelatin"],
    text: ({ menu, t }) => t(
      `No pork and no lard ever enters the kitchen, and the mocktail list (${names(t, menu.filter(d => (d.tags || []).includes("no-alcohol")), 3)}) is alcohol-free. We are not a certified halal kitchen: alcohol is used in two sauces, so ask which before you order.`,
      `Babi dan lard tidak pernah masuk dapur, dan daftar mocktail (${names(t, menu.filter(d => (d.tags || []).includes("no-alcohol")), 3)}) bebas alkohol. Kami bukan dapur tersertifikasi halal: ada alkohol di dua saus, jadi tanya dulu sebelum pesan.`),
    chips: ["What is in that sauce?", "Any allergens in those?"]
  },
  {
    id: "allergen",
    chip: "🥜 Allergens",
    keys: ["allergen", "alergen", "allergy", "alergi", "gluten", "gandum", "lactose", "lactosa", "dairy", "susu", "nut", "nuts", "kacang", "peanut", "tree nut", "soy", "kedelai", "egg", "eggs", "telur", "sesame", "wijen", "seafood", "ikan", "udang", "shrimp", "sulphite", "sulfite"],
    text: ({ onSale, q = " ", t }) => {
      const bad = ALLERGEN_WORDS.find(([, ws]) => ws.some(w => q.includes(w)));
      if (bad) {
        const safe = onSale.filter(d => !(d.alg || []).includes(bad[0]));
        return t(
          `${bad[0]} is out of ${names(t, safe, 6)}, that is ${safe.length} of the ${onSale.length} plates on the board. Tap any of them and its card lists the rest. We run one fryer and one grill, so write it in the order note if this is a true allergy and the kitchen will plate it separately.`,
          `${t(bad[0], ALLERGEN_ID[bad[0]])} tidak ada di ${names(t, safe, 6)}, artinya ${safe.length} dari ${onSale.length} hidangan di papan. Ketuk salah satunya dan kartunya menampilkan alergen yang lain. Kami cuma punya satu wajan goreng dan satu panggangan, jadi kalau alerginya berat tulis di catatan pesanan supaya dapur memisah piringnya.`);
      }
      const list = [...new Set(onSale.flatMap(d => d.alg || []))].join(", ");
      const listId = [...new Set(onSale.flatMap(d => d.alg || []))].map(x => t(x, ALLERGEN_ID[x])).join(", ");
      return t(
        `Every card lists its allergens and I can read any dish back to you. Across the board we cook with: ${list}. Name the dish and I will list what is in it.`,
        `Semua kartu mencantumkan alergenya, dan saya bisa membacakan isi satu hidangan. Di papan ini kami memakai: ${listId}. Sebutkan hidangannya, saya daftarkan isinya.`);
    },
    chips: ["What is in the Rainbow Bistro Bowl?", "Any vegan plates?"]
  },
  {
    id: "spicy",
    keys: ["spicy", "pedas", "chilli", "chili", "cabai", "hot", "level", "pedess"],
    text: ({ onSale, t }) => t(
      `Flagged hot: ${names(t, onSale.filter(d => d.badge === "hot"), 4)}. Anything else can be finished with the house chilli oil on request, tell us the level in the order note.`,
      `Yang ditandai pedas: ${names(t, onSale.filter(d => d.badge === "hot"), 4)}. Sisanya bisa ditutup dengan minyak cabai rumah kalau kamu minta, sebutkan levelnya di catatan pesanan.`),
    chips: ["What is the chef's pick?"]
  },
  {
    id: "kids",
    keys: ["kid", "kids", "anak", "children", "baby", "bayi", "balita", "family", "keluarga"],
    text: ({ onSale, t }) => {
      const picks = names(t, onSale.filter(d => (d.tags || []).includes("kids") || d.badge === "veg").slice(0, 3), 3);
      return t(
        `Little people do well with ${picks || "the bakery counter, the pasta and the roast chicken"}. We cut nothing into halves but we plate without chilli, and high chairs live by the door.`,
        `Anak-anak biasanya cocok dengan ${picks || "counter roti, pasta, dan ayam panggang"}. Kami tidak memotong porsi jadi dua, tapi bisa menyajikannya tanpa cabai, dan kursi bayi ada di dekat pintu.`);
    },
    chips: ["Anything spicy?"]
  },
  {
    id: "coffee",
    keys: ["coffee", "kopi", "espresso", "latte", "cold brew", "croissant", "pastry", "roti", "bakery", "dessert", "manis", "sweet", "cake", "cokelat", "chocolate"],
    text: ({ menu, t }) => {
      const drinks = menu.filter(d => d.cat === "Drinks"), bake = menu.filter(d => ["Bakery", "Desserts"].includes(d.cat));
      return t(
        `Bakery and sweets: ${names(t, bake, 4)}. Cold and hot drinks: ${names(t, drinks, 4)}. The croissant laminates overnight, so the first tray lands at 07:30.`,
        `Roti dan yang manis: ${names(t, bake, 4)}. Minuman dingin dan panas: ${names(t, drinks, 4)}. Croissant dilaminasi semalaman, jadi loyang pertama keluar pukul 07.30.`);
    },
    chips: ["What is cheap?", "Opening hours?"]
  },
  {
    id: "time",
    keys: ["how long", "lama", "wait", "waiting", "delay", "prep", "berapa lama", "cepat", "fast", "minutes"],
    text: ({ onSale, t }) => {
      const avg = Math.round(onSale.reduce((n, d) => n + d.mins, 0) / Math.max(1, onSale.length));
      const quick = [...onSale].sort((a, b) => a.mins - b.mins).slice(0, 2);
      return t(
        `Most plates fire in ${avg} minutes; the fastest are ${names(t, quick, 2)}. Delivery adds whatever the rider needs, and we never send food out cold.`,
        `Kebanyakan hidangan matang dalam ${avg} menit; yang paling cepat ${names(t, quick, 2)}. Pengiriman bertambah sesuai jarak kurir, dan kami tidak pernah mengirim makanan dalam keadaan dingin.`);
    },
    chips: ["How much is delivery?"]
  },
  {
    id: "healthy",
    keys: ["calorie", "calories", "kcal", "kalori", "diet", "healthy", "sehat", "protein", "gizi", "nutrition"],
    text: ({ onSale, t }) => {
      const light = [...onSale].sort((a, b) => a.kcal - b.kcal).slice(0, 3);
      return t(
        `Every card shows its kcal. The lightest three today: ${names(t, light, 3)}. We cook with real olive oil, so "light" is relative. Nothing here is boiled and sad.`,
        `Setiap kartu menampilkan kkal-nya. Tiga paling ringan hari ini: ${names(t, light, 3)}. Kami masak dengan minyak zaitun asli, jadi kata "ringan" itu relatif. Tidak ada yang direbus lalu menyedihkan di sini.`);
    },
    chips: ["Any vegan plates?", "What is the chef's pick?"]
  },
  {
    id: "booking",
    keys: ["book", "booking", "reservation", "reservasi", "table", "meja", "seat", "kursi", "tempat duduk", "walk in"],
    text: ({ t }) => t(
      `Eleven counter seats and four tables, first come first served. For five or more, ring ${BIZ.phoneShow} or WhatsApp ${BIZ.wa} and we hold the back room, no deposit.`,
      `Sebelas kursi di bar dan empat meja, siapa cepat dia dapat. Untuk lima orang atau lebih, telepon ${BIZ.phoneShow} atau WhatsApp ${BIZ.wa}, ruang belakang kami simpan tanpa uang muka.`),
    chips: ["Where are you?", "Can I bring a group?"]
  },
  {
    id: "group",
    keys: ["group", "grup", "rombongan", "party", "acara", "event", "sewa", "private", "ulang tahun", "birthday"],
    text: ({ t }) => t(
      `Groups of 6–14 work well: we pre-set the back room, the kitchen fires in waves so nothing lands cold, and the bill splits however you like. Message ${BIZ.phoneShow} two days ahead.`,
      `Rombongan 6–14 orang pas: ruang belakang kami atur lebih dulu, dapur masak bergelombang supaya tidak ada piring yang datang dingin, dan tagihan boleh dipecah sesukamu. Kirim pesan ke ${BIZ.phoneShow} dua hari sebelumnya.`),
    chips: ["Do I need a reservation?"]
  },
  {
    id: "wifi",
    keys: ["wifi", "wi-fi", "internet", "laptop", "kerja", "work", "colokan", "socket", "charger", "stop kontak", "meeting"],
    text: ({ t }) => t(
      `Wi-Fi is open, no password page, ask the counter for it. Two sockets at the left end of the counter, and the room is quietest between 14:00 and 17:00 for laptops.`,
      `Wi-Fi terbuka, tidak ada halaman sandi, minta saja ke bar. Ada dua colokan di ujung kiri bar, dan ruangan paling tenang antara jam 14.00 sampai 17.00 kalau kamu mau kerja laptop.`),
    chips: ["Opening hours?"]
  },
  {
    id: "human",
    chip: "👨‍ Talk to a human",
    handoff: true,
    keys: ["human", "manusia", "orang", "owner", "chef", "staff", "staf", "karyawan", "hubungi", "contact", "telepon", "phone", "wa", "whatsapp", "email", "instagram", "ig"],
    text: ({ t }) => t(
      `Press Ask the chef above and your next message goes straight to ${STAFF.name} (${STAFF.title}), who runs the pass, with no answer from me in between. Off this panel you can also reach us on ${BIZ.phoneShow} · WhatsApp ${BIZ.wa} · ${BIZ.email}.`,
      `Tekan Tanya chef di atas, pesanmu berikutnya langsung sampai ke ${STAFF.name} (${t(STAFF.title, "Manajer dapur")}) yang memimpin pass, tanpa jawaban dari saya di antaranya. Di luar panel ini kamu juga bisa menghubungi ${BIZ.phoneShow} · WhatsApp ${BIZ.wa} · ${BIZ.email}.`),
    chips: ["Do you take QRIS?", "Opening hours?"]
  },
  {
    id: "order",
    keys: ["order", "pesan", "checkout", "beli", "buy", "mau pesan", "cara pesan", "how to order", "add to cart"],
    text: ({ t }) => t(
      `Tap any dish, hit Add to cart, then Checkout. You will pick delivery or pickup, a payment method and an optional promo code. Your basket and wishlist are saved to your account.`,
      `Ketuk hidangan mana pun, tekan Tambah ke keranjang, lalu Checkout. Kamu pilih antar atau ambil sendiri, metode bayar, dan kode promo kalau ada. Keranjang dan favorit tersimpan di akunmu.`),
    chips: ["Do you take QRIS?", "How much is delivery?"],
    go: "menu"
  },
  {
    id: "account",
    keys: ["account", "akun", "login", "sign in", "daftar", "register", "password", "sandi", "wishlist", "saved"],
    text: ({ t }) => t(
      `Sign in from the top-right button to keep your basket, wishlist and order history on your account. Creating one takes a name, an email and a password.`,
      `Masuk lewat tombol di kanan atas supaya keranjang, favorit, dan riwayat pesanan tersimpan di akunmu. Membuat akun cukup nama, email, dan kata sandi.`),
    chips: ["How do I order?"]
  },
  {
    id: "review",
    keys: ["review", "ulasan", "rating", "bintang", "star", "feedback", "komentar"],
    text: ({ t }) => t(
      `Guests rate what they ate. The Reviews section holds them all, and the chef can hide anything unfair. Leave one after your order lands.`,
      `Tamu menilai apa yang mereka makan. Semuanya ada di bagian Ulasan, dan chef bisa menyembunyikan yang tidak wajar. Tinggalkan ulasan setelah pesananmu datang.`),
    chips: ["What is the chef's pick?"],
    go: "reviews"
  },
  {
    id: "gallery",
    keys: ["photo", "foto", "gambar", "picture", "suasana", "vibe", "interior", "galeri", "gallery"],
    text: ({ t }) => t(
      `The Gallery section has the room, the bar and the pass. Tap any photo for the full frame, the food shots open too.`,
      `Bagian Galeri menampilkan ruangan, bar, dan dapur. Ketuk foto mana pun untuk layar penuh, termasuk foto makanannya.`),
    chips: ["Where are you?"],
    go: "gallery"
  }
];

export const SEED_CHATS = [
  {
    id: "c-seed-1", name: "Rania Putri", email: "rania@example.com", phone: "0811 2233 4455",
    unread: { guest: 0, chef: 1 }, updated: "2026-09-29T10:12:00.000Z",
    msgs: [
      {
        id: "m1", from: "guest", at: "2026-09-29T10:05:00.000Z",
        text: "hi! does the pesto farfalle have nuts? my friend is allergic",
        text_id: "hai! pesto farfalle-nya ada kacang tidak? temanku alergi"
      },
      {
        id: "m2", from: "bot", at: "2026-09-29T10:05:00.000Z", dishes: ["p2", "s2"],
        text: "Yes. Pesto Farfalle, Blistered Tomato carries Tree nuts in the pesto. I would steer her to the Pomodoro or the vegan bowl instead, both nut-free.",
        text_id: "Ada. Pesto Farfalle, Blistered Tomato memakai Kacang-kacangan di pesto-nya. Lebih baik arahkan dia ke Pomodoro atau bowl nabati, keduanya bebas kacang."
      },
      {
        id: "m3", from: "guest", at: "2026-09-29T10:11:00.000Z",
        text: "perfect, can we still sit at 8pm friday?",
        text_id: "oke, Jumat jam 8 malam masih dapat meja tidak?"
      }
    ]
  }
];

export const CHAT_SEED_BY_ID = Object.fromEntries(
  SEED_CHATS.flatMap(c => c.msgs.map(m => [m.id, m]))
);

export { range as priceRange };
