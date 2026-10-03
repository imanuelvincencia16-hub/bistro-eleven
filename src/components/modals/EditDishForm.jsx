import { useRef, useState } from "react";
import ModalHead from "../ModalHead.jsx";
import Photo from "../Photo.jsx";
import { useApp } from "../../lib/store.jsx";
import { ingredientLines, parseIngredients, readAndShrink, safeSrc } from "../../lib/format.js";
import { pic } from "../../data/photos.js";

export default function EditDishForm({ dish }) {
  const app = useApp();
  const { t } = app;
  const [nameId, setNameId] = useState(dish.name_id || "");
  const [price, setPrice] = useState(String(dish.price));
  const [mins, setMins] = useState(String(dish.mins));
  const [desc, setDesc] = useState(dish.desc);
  const [descId, setDescId] = useState(dish.desc_id || "");
  const [ingText, setIngText] = useState(dish.ing.map(x => `${x[0]} ${x[1]}`.trim()).join("\n"));
  const [ingIdText, setIngIdText] = useState(() => {
    const ids = dish.ing_id || [];
    return dish.ing.map((x, i) => ids[i] || "").join("\n");
  });
  const [shots, setShots] = useState(() => [0, 1, 2].map(i => dish.imgs?.[i] || ""));
  const [err, setErr] = useState({});
  const fileRefs = [useRef(null), useRef(null), useRef(null)];

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
    const p = parseFloat(price), m = parseInt(mins, 10);
    const imgs = shots.map((s, i) => (s && s === (dish.imgs?.[i] || "") ? s : safeSrc(s))).filter(Boolean);
    const okPrice = isFinite(p) && p >= 0, okDesc = desc.trim().length >= 8;
    setErr({ price: !okPrice, desc: !okDesc, photo: !imgs.length });
    if (!okPrice || !okDesc || !imgs.length) {
      app.toast(t("Price, description and one photo are needed", "Harga, deskripsi, dan satu foto diperlukan"), "✍️");
      return;
    }
    const ing = parseIngredients(ingText);
    app.patchDish(dish.id, {
      name_id: nameId.trim(),
      price: Math.round(p),
      mins: m > 0 ? m : dish.mins,
      desc: desc.trim(),
      desc_id: descId.trim(),
      ing: ing.length ? ing : dish.ing,
      ing_id: ingredientLines(ingIdText.replace(/\s+$/, "")),
      imgs
    });
    app.closeModal();
    app.toast(t(`${dish.name} updated on the board`, `${nameId.trim() || dish.name} diperbarui di papan`), "👨‍🍳");
  };

  return (
    <>
      <ModalHead title={t(`Edit ${dish.name}`, `Ubah ${dish.name_id || dish.name}`)} sub={t("Change the price, rewrite the details or swap the angles guests swipe through.", "Ubah harganya, tulis ulang detailnya, atau tukar sudut foto yang digeser tamu.")} />
      <div className="modal__body">
        <div className="field">
          <label htmlFor="ed-name-id">{t("Name in Bahasa Indonesia", "Nama dalam Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <input id="ed-name-id" value={nameId} onChange={e => setNameId(e.target.value)}
                 placeholder={t("e.g. Ramen Mentega Miso", "mis. Ramen Mentega Miso")} />
          <small>{t("This is what the board shows when guests read it in Bahasa Indonesia. The English name stays on orders and reviews.", "Ini yang papan tampilkan saat tamu membacanya dalam Bahasa Indonesia. Nama bahasa Inggris tetap tercatat di pesanan dan ulasan.")}</small>
        </div>

        <div className="row2">
          <div className={`field${err.price ? " err" : ""}`}>
            <label htmlFor="ed-price">{t("Price (Rp)", "Harga (Rp)")}</label>
            <input id="ed-price" type="number" step="1000" min="0" value={price} onChange={e => setPrice(e.target.value)} />
            <small className="field__err">{t("Enter a price of zero or more.", "Isi harga nol atau lebih.")}</small>
          </div>
          <div className="field">
            <label htmlFor="ed-mins">{t("Prep minutes", "Menit masak")}</label>
            <input id="ed-mins" type="number" min="1" value={mins} onChange={e => setMins(e.target.value)} />
          </div>
        </div>

        <div className={`field${err.desc ? " err" : ""}`}>
          <label htmlFor="ed-desc">{t("Description", "Deskripsi")}</label>
          <textarea id="ed-desc" rows="2" value={desc} onChange={e => setDesc(e.target.value)} />
          <small className="field__err">{t("Keep at least a line of description.", "Pertahankan minimal satu baris deskripsi.")}</small>
        </div>

        <div className="field">
          <label htmlFor="ed-desc-id">{t("Same line in Bahasa Indonesia", "Versi Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <textarea id="ed-desc-id" rows="2" value={descId} onChange={e => setDescId(e.target.value)} />
          <small>{t("Empty, and this dish reads in English when the board is set to Bahasa.", "Kalau kosong, hidangan ini tampil bahasa Inggris saat papan memakai Bahasa.")}</small>
        </div>

        <div className="field">
          <label htmlFor="ed-ing">{t("Ingredients, one per line, emoji then text", "Bahan, satu per baris, emoji lalu teks")}</label>
          <textarea id="ed-ing" rows="8" value={ingText} onChange={e => setIngText(e.target.value)} />
          <small>{t("Format:", "Format:")} <code>{t("🧈 French butter", "🧈 Mentega Prancis")}</code>{t(". The emoji is optional.", ", emoji boleh tidak dipakai.")}</small>
        </div>

        <div className="field">
          <label htmlFor="ed-ing-id">{t("The same list in Bahasa Indonesia", "Daftar bahan dalam Bahasa Indonesia")} <em>{t("optional", "opsional")}</em></label>
          <textarea id="ed-ing-id" rows="8" value={ingIdText} onChange={e => setIngIdText(e.target.value)} />
          <small>{t("One line per ingredient, in the order above. Leave a line empty to keep it in English.", "Satu baris per bahan, sesuai urutan di atas. Kosongkan satu baris untuk membiarkannya bahasa Inggris.")}</small>
        </div>

        <div className={`field${err.photo ? " err" : ""}`}>
          <label>{t("Swipe angles", "Sudut geser")}</label>
          <small>{t("The first photo is the one on the card.", "Foto pertama adalah yang tampil di kartu.")}</small>
          <small className="field__err">{t("A dish needs at least one photo.", "Satu hidangan butuh minimal satu foto.")}</small>
        </div>

        <div className="nd-shots">
          {shots.map((shot, i) => (
            <div className="nd-shot" key={i}>
              <div className="nd-shot__frame">
                {shot
                  ? <Photo src={pic(shot, 400, 300)} alt={t(`${dish.name}, angle ${i + 1}`, `${dish.name_id || dish.name}, sudut ${i + 1}`)} cat={dish.cat} />
                  : <span className="nd-shot__empty">{i + 1}</span>}
              </div>
              <input className="nd-shot__url" type="text" value={shot.startsWith("data:") ? "" : shot}
                     onChange={e => pastePhoto(i, e.target.value)} placeholder="https://images.unsplash.com/photo-…"
                     aria-label={t(`Photo ${i + 1} link`, `Tautan foto ${i + 1}`)} />
              <button type="button" className="link-btn" onClick={() => fileRefs[i].current?.click()}>
                {shot ? t("replace", "ganti") : t("upload", "unggah")}
              </button>
              {!!shot && (
                <button type="button" className="link-btn" onClick={() => setShot(i, "")}>{t("remove", "hapus")}</button>
              )}
              <input ref={fileRefs[i]} type="file" accept="image/*" tabIndex={-1}
                     onChange={e => { uploadPhoto(i, e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          ))}
        </div>
      </div>

      <div className="modal__foot">
        <button className="btn btn--ghost" onClick={app.closeModal}>{t("Cancel", "Batal")}</button>
        <button className="btn btn--primary" onClick={submit}>{t("Save dish", "Simpan hidangan")}</button>
      </div>
    </>
  );
}
