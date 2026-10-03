import { useState } from "react";
import { useApp } from "../lib/store.jsx";
import { BADGES } from "../data/menu.js";
import { BADGE_ID, CAT_ID } from "../lib/i18n.js";
import { money } from "../lib/format.js";
import Ico from "../lib/icons.jsx";
import PhotoGallery from "./PhotoGallery.jsx";
import DishDetail from "./modals/DishDetail.jsx";

export default function DishCard({ d }) {
  const app = useApp();
  const { t } = app;
  const q = app.data.cart[d.id] || 0;
  const saved = app.data.wish.includes(d.id);
  const badge = d.badge ? BADGES[d.badge] : null;
  const name = t(d.name, d.name_id);
  const [burst, setBurst] = useState(false);

  const fav = () => {
    if (app.toggleWish(d.id) === false) return;
    setBurst(true);
    setTimeout(() => setBurst(false), 620);
  };

  return (
    <article className="dish" data-id={d.id}>
      <div className="dish__media">
        <PhotoGallery photos={d.imgs} name={name} cat={d.cat} size="card" />
        <div className="dish__scrim" />
        <div className="dish__badge">
          {badge && <span className={badge[1]}>{t(badge[0], BADGE_ID[d.badge])}</span>}
          <span className="tag">{t(d.cat, CAT_ID[d.cat])}</span>
        </div>
        <button className={`heart${saved ? " is-on" : ""}${burst ? " burst" : ""}`}
                onClick={fav} aria-label={t(`Save ${name} to wishlist`, `Simpan ${name} ke wishlist`)} aria-pressed={saved}>
          <Ico name="heart" />
        </button>
      </div>

      <div className="dish__body">
        <div className="dish__top">
          <h3 className="dish__name">{name}</h3>
          <span className="dish__price">{money(d.price)}</span>
        </div>
        <p className="dish__desc">{t(d.desc, d.desc_id)}</p>
        <div className="dish__meta">
          <span className="star">★ {Number(d.rating).toFixed(1)}</span>
          <span>⏱ {d.mins} {t("min", "mnt")}</span>
          <span>🔥 {d.kcal} kcal</span>
        </div>
        <div className="dish__foot">
          <button className="dish__details" onClick={() => app.openModal(<DishDetail dish={d} />, "modal--wide")}>
            {t("Details", "Rincian")} <Ico name="arrow" />
          </button>
          {q ? (
            <div className="dish__qty">
              <button onClick={() => app.setQty(d.id, -1)} aria-label={t("One less", "Kurangi satu")}>−</button>
              <b>{q}</b>
              <button onClick={() => app.setQty(d.id, 1)} aria-label={t("One more", "Tambah satu")}>+</button>
            </div>
          ) : (
            <button className="dish__add" onClick={() => app.setQty(d.id, 1)}>
              <Ico name="plus" /> {t("Add to cart", "Tambah ke keranjang")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
