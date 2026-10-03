import { useApp } from "../lib/store.jsx";
import { CAT_ID } from "../lib/i18n.js";
import ChipBar from "./ChipBar.jsx";
import DishGrid from "./DishGrid.jsx";

export default function MenuSection() {
  const { ui, results, onSale, resetFilters, t } = useApp();
  const list = results.list;
  const label = ui.wishOnly ? t("saved dishes", "hidangan tersimpan")
    : ui.cat === "All" ? t("the full board", "menu lengkap")
    : (t(ui.cat, CAT_ID[ui.cat]) || "").toLowerCase();
  const query = ui.query.trim().toLowerCase();

  return (
    <section className="menu" id="menu">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <span className="eyebrow reveal" data-reveal><i className="eyebrow__dot" /> {t("The board", "Papan menu")}</span>
            <h2 className="reveal" data-reveal>{t("Our kitchen specials", "Spesial dapur kami")}</h2>
          </div>
        </header>

        <div className="toolbar reveal" data-reveal>
          <ChipBar />
        </div>

        {list.length > 0 && (
          <p className="result-meta">
            {t("Showing", "Menampilkan")} <b>{list.length}</b> {t("of", "dari")} {onSale.length} · {label}
            {query && <> · {t("matching", "cocok dengan")} “<b>{query}</b>”</>}
            {results.exact === false && <small> {t("(no dish starts with that, widened to contains)", "(tidak ada hidangan yang dimulai dengan kata itu, pencarian diperluas)")}</small>}
          </p>
        )}

        {list.length > 0 ? <DishGrid /> : (
          <div className="empty">
            <span>🍽️</span>
            <h4>{t("Nothing on the board matches that", "Tidak ada yang cocok di papan menu")}</h4>
            <p>{query ? t(`Nothing on the board begins with “${query}”.`, `Tidak ada hidangan yang dimulai dengan “${query}”.`)
              : ui.wishOnly ? t("You haven't saved anything yet.", "Kamu belum menyimpan apa pun.")
              : t("That section is empty right now.", "Bagian itu sedang kosong.")}</p>
            <button className="btn btn--ghost" onClick={resetFilters}>{t("Show the full menu", "Tampilkan menu lengkap")}</button>
          </div>
        )}
      </div>
    </section>
  );
}
