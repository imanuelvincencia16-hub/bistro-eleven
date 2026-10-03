export const LANGS = [
  { code: "en", name: "English", short: "EN" },
  { code: "id", name: "Bahasa Indonesia", short: "ID" }
];

export const LOCALE = { en: "en-GB", id: "id-ID" };

export const makeT = lang => (en, id) => (lang === "id" && id ? id : en);

export const CAT_ID = {
  All: "Semua",
  Starters: "Pembuka",
  Mains: "Hidangan Utama",
  "Pizza & Pasta": "Pizza & Pasta",
  Desserts: "Hidangan Manis",
  Bakery: "Roti & Kue",
  Drinks: "Minuman"
};

export const TAG_ID = {
  cheese: "keju", sharing: "untuk berbagi", grilled: "panggang", salad: "salad",
  vegan: "nabati", vegetarian: "vegetarian", healthy: "sehat", bowl: "mangkuk",
  soup: "sup", warm: "hangat", comfort: "nyaman", fresh: "segar", citrus: "sitrus",
  light: "ringan", japanese: "jepang", raw: "sajian mentah", seafood: "seafood",
  beef: "daging sapi", grill: "grill", signature: "andalan", fish: "ikan",
  seared: "panggang cepat", pasta: "pasta", pizza: "pizza", tomato: "tomat",
  truffle: "truffle", chicken: "ayam", burger: "burger", crispy: "renyah",
  sweet: "manis", chocolate: "cokelat", ice: "es", fruit: "buah", coffee: "kopi",
  black: "hitam", brew: "seduh", cappuccino: "cappuccino", latte: "latte",
  milk: "susu", drink: "minuman", mocktail: "mocktail", cold: "dingin",
  juice: "jus", refreshing: "menyegarkan", "no-alcohol": "tanpa alkohol",
  pastry: "pai", croissant: "croissant", breakfast: "sarapan", butter: "mentega",
  bread: "roti", loaf: "roti padat", sourdough: "sourdough", brunch: "brunch",
  toast: "roti panggang", set: "porsi lengkap"
};

export const ALLERGEN_ID = {
  Dairy: "Susu", Gluten: "Gluten", "Tree nuts": "Kacang-kacangan", Egg: "Telur",
  Soy: "Kedelai", Sesame: "Wijen", Fish: "Ikan", Sulphites: "Sulfit", Peanut: "Kacang tanah"
};

export const STATUS_ID = {
  new: "Baru", cooking: "Dimasak", ready: "Siap", delivering: "Diantar", done: "Selesai"
};

export const ORDER_TYPE_ID = { delivery: "antar", pickup: "ambil sendiri", table: "meja" };

export const BADGE_ID = { chef: "Pilihan chef", hot: "Pedas", new: "Baru", veg: "Veggie" };

export const HOURS_ID = {
  "Mon – Thu": "Sen – Kam", "Fri – Sat": "Jum – Sab", Sunday: "Minggu"
};

export const PAY_ID = {
  QRIS: ["QRIS", "QRIS"],
  "scan it now": ["scan it now", "pindai sekarang"],
  Card: ["Card", "Kartu"],
  "Visa · Mastercard": ["Visa · Mastercard", "Visa · Mastercard"],
  Cash: ["Cash", "Tunai"],
  "rider or counter": ["rider or counter", "kurir atau kasir"],
  "Bank transfer": ["Bank transfer", "Transfer bank"],
  "virtual account": ["virtual account", "virtual account"]
};

export const PROMO_ID = {
  "Eleven percent off": "Potongan sebelas persen",
  "Rp40.000 off your first order": "Potongan Rp40.000 untuk pesanan pertama",
  "Late kitchen discount": "Diskon dapur larut"
};

export const SPICE_ID = {
  "no chilli at all": "tanpa cabai sama sekali",
  "just a warm hum": "hangat sedikit saja",
  "medium, the house balance": "sedang, takaran rumah",
  "medium — the house balance": "sedang, takaran rumah",
  "properly hot": "pedas yang serius",
  "fire. signed for it.": "api. sudah tanda tangan."
};

export const SPICE_SHORT_ID = ["tanpa", "sedikit", "sedang", "pedas", "api"];

export const PROSE_ID = {
  "A neighbourhood kitchen with eleven seats and no shortcuts.": "Dapur tetangga dengan sebelas kursi dan tanpa jalan pintas.",
  "Kitchen manager": "Manajer dapur"
};
