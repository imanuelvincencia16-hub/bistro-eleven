import { useEffect, useRef } from "react";
import { useApp, searchDishes } from "../lib/store.jsx";
import Ico from "../lib/icons.jsx";

export default function SearchSheet() {
  const app = useApp();
  const { ui, patchUi, results, goSection, t } = app;
  const input = useRef(null);

  useEffect(() => {
    if (!ui.search) return;
    const id = setTimeout(() => input.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [ui.search]);

  const close = () => patchUi({ search: false });
  const q = ui.query.trim().toLowerCase();
  const onConsole = app.isStaff && ui.view === "admin";
  const chefN = onConsole ? searchDishes(app.data.menu, q).list.length : 0;
  const n = onConsole ? chefN : results.list.length;

  const type = v => patchUi(onConsole && v.trim() ? { query: v, adminTab: "dishes" } : { query: v });

  return (
    <div className="search-sheet" hidden={!ui.search}>
      <div className="search-sheet__inner">
        <Ico name="search" className="search-sheet__ico" />
        <input
          ref={input}
          id="search-input"
          type="text"
          value={ui.query}
          placeholder={onConsole
            ? t("Search the chef board, names, tags, categories…", "Cari di papan dapur, nama, tag, kategori…")
            : t("Search the menu, try “p” for Penne, Pesto, Pan-Seared…", "Cari menu, coba “p” untuk Penne, Pesto, Pan-Seared…")}
          autoComplete="off"
          spellCheck="false"
          aria-label={onConsole ? t("Search the chef board", "Cari di papan dapur") : t("Search the menu", "Cari menu")}
          onChange={e => type(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Escape") close();
            if (e.key === "Enter") { close(); goSection("menu"); }
          }}
        />
        <kbd>Esc</kbd>
        <button className="text-btn" onClick={() => type("")}>{t("Clear", "Bersihkan")}</button>
      </div>
      <p className="search-sheet__hint">
        {!q
          ? onConsole
            ? t("Filters the Menu tab below, hidden dishes included.", "Menyaring tab Menu di bawah, termasuk hidangan yang disembunyikan.")
            : t("Prefix search, one letter is enough. Press / anywhere to jump here.", "Pencarian awalan, satu huruf sudah cukup. Tekan / di mana pun untuk ke sini.")
          : n === 0
            ? t(`Nothing on the ${onConsole ? "chef board" : "board"} matches “${q}”.`, `Tidak ada yang cocok dengan “${q}” di ${onConsole ? "papan dapur" : "papan menu"}.`)
            : onConsole
              ? <>
                  <b>{n}</b> {t("of", "dari")} {app.data.menu.length} {t("dishes match", "hidangan cocok")} “{q}”
                  {t(", showing them on the Menu tab", ", ditampilkan di tab Menu")}
                </>
              : <>
                  <b>{n}</b> {n === 1 ? t("dish", "hidangan") : t("dishes", "hidangan")} {t("match", "cocok")} “{q}”
                  {results.exact === false ? t(", none start with it, so we widened the search", ", tidak ada yang diawali kata itu, jadi pencarian diperluas") : ""}
                </>}
      </p>
    </div>
  );
}
