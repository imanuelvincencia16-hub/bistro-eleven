import { useApp } from "../../lib/store.jsx";
import { ALLERGEN_ID } from "../../lib/i18n.js";
import { money } from "../../lib/format.js";
import ModalHead from "../ModalHead.jsx";
import Stars from "../Stars.jsx";
import PhotoGallery from "../PhotoGallery.jsx";

function kitchenNote(d, t) {
  if (d.cat === "Drinks") return t("Made to order at the bar. Tell us the ice level in your notes and we will honour it.", "Dibuat sesuai pesanan di bar. Tulis takaran esonya di catatan, kami turuti.");
  if (d.cat === "Bakery") return t("Baked at 06:00. Anything left after 19:00 goes to the shelter on Lantern Lane, never back in the case.", "Dipanggang jam 06.00. Sisa setelah jam 19.00 disumbangkan ke penampungan di Lantern Lane, tidak pernah kembali ke etalase.");
  if (d.cat === "Desserts") return t("Held chilled and finished at the pass. Can be made for the table in about ten minutes.", "Disimpan dingin dan diselesaikan di dapur. Bisa dibuat untuk meja dalam sekitar sepuluh menit.");
  if (d.alg.length) return t(
    `Contains ${d.alg.map(a => t(a, ALLERGEN_ID[a])).join(", ").toLowerCase()}. Swap any element out, the kitchen is happy to adapt, just say the word in your notes.`,
    `Mengandung ${d.alg.map(a => t(a, ALLERGEN_ID[a])).join(", ").toLowerCase()}. Ganti bagian mana pun, dapur siap menyesuaikan, tulis saja di catatanmu.`
  );
  return t("Cooked strictly to order. Nothing on this plate has been sitting under a lamp.", "Dimasak tepat setelah pesanan masuk. Tidak ada yang menghangat di bawah lampu.");
}

export default function DishDetail({ dish: d }) {
  const app = useApp();
  const { t } = app;
  const q = app.data.cart[d.id] || 0;
  const saved = app.data.wish.includes(d.id);
  const name = t(d.name, d.name_id);
  const reviewCount = d.reviews || 0;

  return (
    <>
      <div className="dd__hero">
        <PhotoGallery photos={d.imgs} name={name} cat={d.cat} size="wide"
                      label={t(`${name}, drag to change the angle`, `${name}, geser untuk ganti sudut`)} />
        <span className="dd__price-tag">{money(d.price)}</span>
      </div>

      <ModalHead
        title={name}
        sub={<>
          <Stars value={Number(d.rating)} /> {Number(d.rating).toFixed(1)} · {reviewCount} {t("guest reviews", "ulasan tamu")} · {d.mins} {t("min from the pass", "mnt dari dapur")}
        </>}
      />

      <div className="modal__body">
        <p className="dd__lead">{t(d.desc, d.desc_id)}</p>

        <div className="dd__sec">
          <h4>{t("What goes in it", "Isi di dalamnya")}</h4>
          <ul className="ing">
            {d.ing.map(([emoji, label], i) => (
              <li key={i} style={{ animationDelay: `${i * 45}ms` }}><i>{emoji || "•"}</i>{t(label, d.ing_id?.[i])}</li>
            ))}
          </ul>
        </div>

        {d.alg.length > 0 && (
          <div className="dd__sec">
            <h4>{t("Allergens", "Alergen")}</h4>
            <div className="allergens">{d.alg.map(a => <span className="allergen" key={a}>⚠ {t(a, ALLERGEN_ID[a])}</span>)}</div>
          </div>
        )}

        <div className="dd__sec">
          <h4>{t("Per serving", "Per sajian")}</h4>
          <div className="nutri">
            <div><b>{d.kcal}</b><span>kcal</span></div>
            <div><b>{Math.round(d.kcal * 0.045)}g</b><span>{t("protein", "protein")}</span></div>
            <div><b>{Math.round(d.kcal * 0.09)}g</b><span>{t("carbs", "karbo")}</span></div>
            <div><b>{Math.round(d.kcal * 0.038)}g</b><span>{t("fat", "lemak")}</span></div>
          </div>
        </div>

        <div className="dd__sec">
          <h4>{t("Kitchen note", "Catatan dapur")}</h4>
          <p className="dd__lead" style={{ margin: 0 }}>{kitchenNote(d, t)}</p>
        </div>
      </div>

      <div className="modal__foot">
        <button className="btn btn--ghost" onClick={() => app.toggleWish(d.id)}>
          {saved ? t("❤️ Saved", "❤️ Tersimpan") : t("🤍 Save this dish", "🤍 Simpan hidangan ini")}
        </button>
        <button className="btn btn--primary" onClick={() => { app.setQty(d.id, 1); app.closeModal(); }}>
          {q ? t(`Add another · ${money(d.price)}`, `Tambah lagi · ${money(d.price)}`) : t(`Add to cart · ${money(d.price)}`, `Tambah ke keranjang · ${money(d.price)}`)}
        </button>
      </div>
    </>
  );
}
