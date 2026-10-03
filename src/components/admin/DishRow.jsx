import { useEffect, useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { CAT_ID } from "../../lib/i18n.js";
import { thumbPic } from "../../data/photos.js";
import Ico from "../../lib/icons.jsx";
import Photo from "../Photo.jsx";
import EditDishForm from "../modals/EditDishForm.jsx";

export default function DishRow({ d }) {
  const app = useApp();
  const { t } = app;
  const name = t(d.name, d.name_id);
  const on = d.available !== false;
  const [pv, setPv] = useState(String(d.price));
  useEffect(() => setPv(String(d.price)), [d.price]);

  const commitPrice = value => {
    const v = parseFloat(value);
    if (!isFinite(v) || v < 0) return;
    app.patchDish(d.id, { price: Math.round(v) });
  };

  const remove = () => {
    app.removeDish(d.id);
    app.toast(t(`${d.name} removed from the board`, `${name} dihapus dari papan`), "🗑️");
  };

  const angles = (d.imgs || []).length;

  return (
    <div className="da-row" data-drow={d.id}>
      <Photo src={d.imgs?.[0] ? thumbPic(d.imgs[0]) : ""} alt={name} cat={d.cat} />
      <div>
        <div className="da-name">{name}</div>
        <div className="da-cat">{t(d.cat, CAT_ID[d.cat])} · ★{Number(d.rating).toFixed(1)} · {angles} {angles === 1 ? t("angle", "sudut") : t("angles", "sudut")}</div>
      </div>
      <input className="da-price" type="number" step="1000" min="0" value={pv} aria-label={t(`${name} price`, `harga ${name}`)}
             onChange={e => { setPv(e.target.value); commitPrice(e.target.value); }} />
      <span className="da-stock">{on ? t("● on the board", "● di papan") : t("○ off the board", "○ tidak di papan")}</span>
      <button className={`da-btn ${on ? "is-on-av" : "is-off"}`} onClick={() => app.toggleDish(d.id)}
              aria-label={t(`${on ? "Take" : "Put"} ${name} ${on ? "off" : "on"} the board`, `${on ? "Angkat" : "Letakkan"} ${name} ${on ? "dari" : "ke"} papan`)}
              title={on ? t("Take off the board", "Angkat dari papan") : t("Put back on the board", "Kembalikan ke papan")}>
        <Ico name={on ? "eye" : "eyeOff"} />
      </button>
      <button className="da-btn" title={t("Edit dish", "Ubah hidangan")}
              onClick={() => app.openModal(<EditDishForm dish={d} />, "modal--wide")}>
        <Ico name="pen" />
      </button>
      <button className="da-btn danger" title={t("Remove from board", "Hapus dari papan")} onClick={remove}>
        <Ico name="trash" />
      </button>
    </div>
  );
}
