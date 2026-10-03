import { useApp } from "../lib/store.jsx";
import { CATEGORIES } from "../data/menu.js";
import { CAT_ID } from "../lib/i18n.js";
import Ico from "../lib/icons.jsx";

export default function ChipBar() {
  const { ui, counts, data, patchUi, showSavedOnly, t } = useApp();
  const cats = ["All", ...CATEGORIES];

  return (
    <>
      <div className="chips">
        {cats.map(c => (
          <button key={c} className={`chip${ui.cat === c ? " is-on" : ""}`} onClick={() => patchUi({ cat: c })}>
            {t(c === "All" ? "Everything" : c, CAT_ID[c])}
            <span className="chip__n">{counts[c] || 0}</span>
          </button>
        ))}
      </div>
      <div className="toolbar__right">
        <label className="sort">
          <span>{t("Sort", "Urutkan")}</span>
          <select value={ui.sort} onChange={e => patchUi({ sort: e.target.value })}>
            <option value="featured">{t("Featured", "Unggulan")}</option>
            <option value="price-asc">{t("Price · low to high", "Harga · terendah")}</option>
            <option value="price-desc">{t("Price · high to low", "Harga · tertinggi")}</option>
            <option value="rating">{t("Top rated", "Nilai tertinggi")}</option>
            <option value="az">{t("Name A–Z", "Nama A–Z")}</option>
          </select>
        </label>
        <button className={`chip chip--wish${ui.wishOnly ? " is-on" : ""}`} aria-pressed={ui.wishOnly}
                onClick={() => showSavedOnly(!ui.wishOnly)}>
          <Ico name="heart" />
          {t("Saved", "Tersimpan")} <span className="chip__n">{data.wish.length}</span>
        </button>
      </div>
    </>
  );
}
