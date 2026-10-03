import { useRef, useState } from "react";
import ModalHead from "../ModalHead.jsx";
import Photo from "../Photo.jsx";
import { useApp } from "../../lib/store.jsx";
import { ingredientLines, parseIngredients, readAndShrink, safeSrc, uid } from "../../lib/format.js";
import { CATEGORIES } from "../../data/menu.js";
import { CAT_ID } from "../../lib/i18n.js";

const BADGE_OPTS = [["", "None", "Tanpa badge"], ["new", "New", "Baru"], ["chef", "Chef's pick", "Pilihan chef"], ["hot", "Spicy", "Pedas"], ["veg", "Veggie", "Veggie"]];
const SLOT_HINTS = [
  ["Angle 1, the plate straight on", "Sudut 1, piring dari depan"],
  ["Angle 2, close on the toppings", "Sudut 2, dekat ke toping"],
  ["Angle 3, the wider table shot", "Sudut 3, tampilan meja lebih lebar"]
];

const emptyForm = {
  name: "", nameId: "", cat: CATEGORIES[0], price: "", badge: "", mins: "18", kcal: "520",
  desc: "", descId: "", ing: "", ingId: "", alg: ""
};

export default function NewDishForm() {
  const app = useApp();
  const { t } = app;
  const [f, setF] = useState(emptyForm);
  const [shots, setShots] = useState(["", "", ""]);
  const [err, setErr] = useState({});
  const fileRefs = [useRef(null), useRef(null), useRef(null)];

  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const setShot = (i, v) => setShots(s => s.map((x, n) => (n === i ? v : x)));

  const pastePhoto = (i, raw) => {
    const value = String(raw || "").trim();
    if (!value) { setShot(i, ""); return; }
    const ok = safeSrc(value);
    setShot(i, ok);
    if (!ok) app.toast(t("Only a full https:// image link can be used", "Hanya tautan gambar https:// penuh yang bisa dipakai"), "🔗");
  };

  const uploadPhoto = async (i, file) => {
    if (!file) return;
    try {
      setShot(i, await readAndShrink(file, 900));
    } catch {
      app.toast(t("That file isn't a readable image", "File itu bukan gambar yang bisa dibaca"), "🖼️");
    }
  };

  const submit = () => {
    const name = f.name.trim(), desc = f.desc.trim();
    const price = parseFloat(f.price), mins = parseInt(f.mins, 10), kcal = parseInt(f.kcal, 10);
    const imgs = shots.map(s => safeSrc(s)).filter(Boolean);
    const okName = name.length >= 2, okPrice = isFinite(price) && price > 0, okDesc = desc.length >= 8;
    setErr({ name: !okName, price: !okPrice, desc: !okDesc, photo: !imgs.length });
    if (!okName || !okPrice || !okDesc || !imgs.length) {
      app.toast(t("Name, price, description and at least one photo are needed", "Nama, harga, deskripsi, dan minimal satu foto diperlukan"), "✍️");
      return;
    }
    const ing = parseIngredients(f.ing);
    const ingId = ingredientLines(f.ingId.replace(/\s+$/, ""));
    const cat = f.cat;
    app.addDish({
      id: uid("X"), name, cat, price: Math.round(price),
      badge: f.badge || null, rating: 5, reviews: 0,
      mins: mins > 0 ? mins : 18, kcal: kcal > 0 ? kcal : 520,
      name_id: f.nameId.trim(),
      desc, desc_id: f.descId.trim(),
      ing: ing.length ? ing : [["•", "Made to the chef's recipe"]],
      ing_id: ingId,
      alg: f.alg.split(",").map(s => s.trim()).filter(Boolean),
      tags: `${cat} ${name}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      imgs, available: true
    });
    app.closeModal();
  };

  return (
    <>
      <ModalHead title={t("Add a dish", "Tambah hidangan")} sub={t("Fill the ticket and it goes straight onto the guest board.", "Isi tiketnya dan langsung muncul di papan tamu.")} />
      <div className="modal__body">
        <div className="row2">
          <div className={`field${err.name ? " err" : ""}`}>
            <label htmlFor="nd-name">{t("Dish name", "Nama hidangan")}</label>
            <input id="nd-name" value={f.name} onChange={e => set("name", e.target.value)} placeholder={t("e.g. Miso Butter Ramen", "mis. Miso Butter Ramen")} />
            <small className="field__err">{t("Give the dish a name.", "Beri nama untuk hidangannya.")}</small>
          </div>
          <div className="field">
            <label htmlFor="nd-cat">{t("Category", "Kategori")}</label>
            <select id="nd-cat" value={f.cat} onChange={e => set("cat", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(c, CAT_ID[c])}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="nd-name-id">{t("Name in Bahasa Indonesia", "Nama dalam Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <input id="nd-name-id" value={f.nameId} onChange={e => set("nameId", e.target.value)}
                 placeholder={t("e.g. Ramen Mentega Miso", "mis. Ramen Mentega Miso")} />
          <small>{t("The English name stays how orders and reviews find this dish; this one is only what guests read on the board.", "Nama bahasa Inggris tetap dipakai pesanan dan ulasan menemukan hidangan ini; yang ini hanya yang tamu baca di papan.")}</small>
        </div>

        <div className="row2">
          <div className={`field${err.price ? " err" : ""}`}>
            <label htmlFor="nd-price">{t("Price (Rp)", "Harga (Rp)")}</label>
            <input id="nd-price" type="number" step="1000" min="0" value={f.price}
                   onChange={e => set("price", e.target.value)} placeholder="85000" />
            <small className="field__err">{t("Enter a price above zero.", "Isi harga di atas nol.")}</small>
          </div>
          <div className="field">
            <label htmlFor="nd-badge">{t("Badge on the card", "Badge di kartu")}</label>
            <select id="nd-badge" value={f.badge} onChange={e => set("badge", e.target.value)}>
              {BADGE_OPTS.map(([v, l, lId]) => <option key={v} value={v}>{t(l, lId)}</option>)}
            </select>
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="nd-mins">{t("Minutes from the pass", "Menit dari dapur")}</label>
            <input id="nd-mins" type="number" min="1" value={f.mins} onChange={e => set("mins", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="nd-kcal">{t("kcal per serving", "kcal per sajian")}</label>
            <input id="nd-kcal" type="number" min="1" value={f.kcal} onChange={e => set("kcal", e.target.value)} />
          </div>
        </div>

        <div className={`field${err.desc ? " err" : ""}`}>
          <label htmlFor="nd-desc">{t("What the guest reads", "Yang dibaca tamu")}</label>
          <textarea id="nd-desc" rows="2" value={f.desc} onChange={e => set("desc", e.target.value)}
                    placeholder={t("Two lines on what it is and how we cook it.", "Dua baris tentang isinya dan cara kami memasaknya.")} />
          <small className="field__err">{t("A short description, please.", "Tulis deskripsi singkat ya.")}</small>
        </div>

        <div className="field">
          <label htmlFor="nd-desc-id">{t("The same line in Bahasa Indonesia", "Versi Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <textarea id="nd-desc-id" rows="2" value={f.descId} onChange={e => set("descId", e.target.value)}
                    placeholder={t("Miso broth, hand-pulled noodles and a soft egg.", "Kaldu miso, mie tarik tangan, dan telur lunak.")} />
          <small>{t("Left empty, this dish shows in English on the guest board.", "Kalau dikosongkan, hidangan ini tampil bahasa Inggris di papan tamu.")}</small>
        </div>

        <div className="field">
          <label htmlFor="nd-ing">{t("Ingredients, one per line, emoji then text", "Bahan, satu per baris, emoji lalu teks")}</label>
          <textarea id="nd-ing" rows="5" value={f.ing} onChange={e => set("ing", e.target.value)}
                    placeholder={t("🍜 Hand-pulled noodles\n🥚 Soft egg", "🍜 Mie tarik tangan\n🥚 Telur lunak")} />
          <small>{t("Format:", "Format:")} <code>{t("🧈 French butter", "🧈 Mentega Prancis")}</code>{t(". The emoji is optional.", ", emoji boleh tidak dipakai.")}</small>
        </div>

        <div className="field">
          <label htmlFor="nd-ing-id">{t("The same list in Bahasa Indonesia", "Daftar bahan dalam Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <textarea id="nd-ing-id" rows="5" value={f.ingId} onChange={e => set("ingId", e.target.value)}
                    placeholder={t("🍜 Hand-pulled noodles\n🥚 Soft egg", "🍜 Mie tarik tangan\n🥚 Telur lunak")} />
          <small>{t("Keep the same order as the list above, one per line. The emoji is ignored here.", "Samakan urutannya dengan daftar di atas, satu per baris. Emojinya tidak dipakai di sini.")}</small>
        </div>

        <div className="field">
          <label htmlFor="nd-alg">{t("Allergens, comma separated", "Alergen, pisahkan dengan koma")}</label>
          <input id="nd-alg" value={f.alg} onChange={e => set("alg", e.target.value)} placeholder="Gluten, Egg" />
        </div>

        <div className={`field${err.photo ? " err" : ""}`}>
          <label>{t("Photos guests can swipe through", "Foto yang bisa digeser tamu")}</label>
          <small>{t("Angle 1 is the card photo. Add two more so the guest can swipe for a different view.", "Sudut 1 jadi foto kartu. Tambah dua lagi supaya tamu bisa menggeser ke tampilan lain.")}</small>
          <small className="field__err">{t("Add at least one photo.", "Tambah minimal satu foto.")}</small>
        </div>

        <div className="nd-shots">
          {SLOT_HINTS.map(([hint, hintId], i) => (
            <div className="nd-shot" key={hint}>
              <div className="nd-shot__frame">
                {shots[i]
                  ? <Photo src={shots[i]} alt={t(`${f.name || "New dish"}, angle ${i + 1}`, `${f.name || "Hidangan baru"}, sudut ${i + 1}`)} cat={f.cat} />
                  : <span className="nd-shot__empty">{i + 1}</span>}
              </div>
              <input className="nd-shot__url" type="url" value={shots[i].startsWith("data:") ? "" : shots[i]}
                     onChange={e => pastePhoto(i, e.target.value)} placeholder="https://images.unsplash.com/photo-…"
                     aria-label={t(`Photo ${i + 1} link`, `Tautan foto ${i + 1}`)} />
              <button type="button" className="link-btn" onClick={() => fileRefs[i].current?.click()}>
                {i === 0 ? t("upload from this device", "unggah dari perangkat ini") : t("upload", "unggah")}
              </button>
              <input ref={fileRefs[i]} type="file" accept="image/*" tabIndex={-1}
                     onChange={e => { uploadPhoto(i, e.target.files?.[0]); e.target.value = ""; }} />
              <small className="muted">{t(hint, hintId)}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="modal__foot">
        <button className="btn btn--ghost" onClick={app.closeModal}>{t("Cancel", "Batal")}</button>
        <button className="btn btn--primary" onClick={submit}>{t("Put it on the board", "Pasang di papan")}</button>
      </div>
    </>
  );
}
