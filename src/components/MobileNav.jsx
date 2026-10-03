import { useApp } from "../lib/store.jsx";
import useActiveSection from "../hooks/useActiveSection.js";
import Ico from "../lib/icons.jsx";

const TABS = [
  ["top", "Home", "Beranda", "home"],
  ["menu", "Board", "Menu", "board"],
  ["search", "Search", "Cari", "search"],
  ["chat", "Chat", "Obrolan", "chat"],
  ["basket", "Basket", "Keranjang", "cart"]
];

export default function MobileNav() {
  const app = useApp();
  const { t } = app;
  const guest = app.ui.view === "guest";
  const [active] = useActiveSection(["top", "menu"], guest);
  if (!guest) return null;

  const open = app.ui.search || app.ui.chat || app.ui.drawer;
  const unread = app.chatThread?.unread?.guest || 0;
  const pip = id => (id === "basket" ? app.cartCount : id === "chat" ? unread : 0);

  const isOn = id => {
    if (id === "search") return app.ui.search;
    if (id === "chat") return app.ui.chat;
    if (id === "basket") return app.ui.drawer;
    return !open && active === id;
  };

  const tap = id => {
    if (id === "search") return app.toggleSearch();
    if (id === "chat") return app.ui.chat ? app.closeChat() : app.openChat();
    if (id === "basket") return app.openBasket();
    app.goSection(id);
  };

  return (
    <nav className="mnav" aria-label={t("Bistro Eleven sections", "Bagian Bistro Eleven")}>
      {TABS.map(([id, en, idn, icon]) => (
        <button key={id} type="button" className={`mnav__tab${isOn(id) ? " is-on" : ""}`}
                aria-current={isOn(id) ? "page" : undefined} onClick={() => tap(id)}>
          <Ico name={icon} />
          <span>{t(en, idn)}</span>
          {pip(id) > 0 && <i className="mnav__pip">{pip(id)}</i>}
        </button>
      ))}
    </nav>
  );
}
