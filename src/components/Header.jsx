import { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/store.jsx";
import useActiveSection from "../hooks/useActiveSection.js";
import Ico from "../lib/icons.jsx";
import { safeAvatar, initial } from "../lib/format.js";
import { STAFF } from "../data/biz.js";
import AccountPanel from "./modals/AccountPanel.jsx";
import ChefProfile from "./modals/ChefProfile.jsx";

const NAV = [
  ["menu", "Menu", "Menu"],
  ["story", "Our Story", "Kisah Kami"],
  ["gallery", "Gallery", "Galeri"],
  ["reviews", "Reviews", "Ulasan"],
  ["visit", "Visit", "Kunjungi"]
];
const NAV_IDS = NAV.map(([id]) => id);

export default function Header() {
  const { ui, data, me, isStaff, signedIn, cartCount, patchUi, setTheme, setLang, lang, t,
          openModal, openBasket, openWishlist, showAuth, goSection } = useApp();
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useActiveSection(NAV_IDS, ui.view === "guest");
  const cartBtn = useRef(null);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 24);
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      cartBtn.current?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.22) rotate(-8deg)" }, { transform: "scale(1)" }],
        { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const pic = safeAvatar(me?.avatar);
  const wishN = data.wish.length;
  const quiet = ui.view === "auth";
  const guestView = ui.view === "guest";

  const openAccountButton = () => {
    if (isStaff) { openModal(<ChefProfile />, "modal--slim"); return; }
    openModal(<AccountPanel tab="profile" />, "modal--wide");
  };

  const navTo = (e, id) => {
    e.preventDefault();
    setActive(id);
    goSection(id);
  };

  return (
    <header className={`hdr${stuck ? " is-stuck" : ""}`} id="hdr">
      <a className="brand" href="#top" onClick={e => navTo(e, "top")}>
        <span className="brand__mark">XI</span>
        <span className="brand__text">
          <strong>Bistro Eleven</strong>
        </span>
      </a>

      {guestView && (
        <nav className="hdr__nav" id="hdr-nav">
          {NAV.map(([id, en, idn]) => (
            <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""} onClick={e => navTo(e, id)}>{t(en, idn)}</a>
          ))}
        </nav>
      )}

      <div className="hdr__actions">
        {!quiet && (
          <button className={`icon-btn${ui.search ? " is-on" : ""}`} title={t("Search dishes", "Cari menu")} aria-label={t("Search dishes", "Cari menu")}
                  onClick={() => patchUi({ search: !ui.search })}>
            <Ico name="search" />
          </button>
        )}

        <button className="icon-btn" id="btn-lang" title={t("Switch language", "Ganti bahasa")}
                aria-label={t(`Switch to ${lang === "en" ? "Bahasa Indonesia" : "English"}`, `Beralih ke ${lang === "en" ? "Bahasa Indonesia" : "Bahasa Inggris"}`)}
                onClick={() => setLang(lang === "en" ? "id" : "en")}>
          <span className="lang-code">{lang === "en" ? "EN" : "ID"}</span>
        </button>

        <button className="icon-btn" id="btn-theme" title={t("Toggle light / dark", "Ganti terang / gelap")} aria-label={t("Toggle theme", "Ganti tema")}
                onClick={() => setTheme(data.theme === "light" ? "dark" : "light")}>
          <Ico name="sun" className="ico-sun" />
          <Ico name="moon" className="ico-moon" />
        </button>

        {guestView && (
          <>
            <button className="icon-btn" title={t("Wishlist", "Wishlist")} aria-label={t("Wishlist", "Wishlist")} onClick={openWishlist}>
              <Ico name="heart" />
              <span className="pip" hidden={wishN === 0}>{wishN}</span>
            </button>

            <button className="icon-btn icon-btn--cart" ref={cartBtn} title={t("Open cart", "Buka keranjang")} aria-label={t("Open cart", "Buka keranjang")}
                    onClick={() => (ui.drawer ? patchUi({ drawer: false }) : openBasket())}>
              <Ico name="cart" />
              <span className="pip" hidden={cartCount === 0}>{cartCount}</span>
            </button>
          </>
        )}

        <button className="account-btn" title={isStaff ? t("Chef profile", "Profil chef") : t("Account settings", "Pengaturan akun")}
                hidden={!signedIn} data-role={isStaff ? "admin" : "user"} onClick={openAccountButton}>
          <span className="avatar avatar--sm" id="hdr-avatar">
            {pic ? <img src={pic} alt="" />
                 : isStaff ? initial(STAFF.name) : <Ico name="user" />}
          </span>
          <span className="account-btn__name">{(isStaff ? STAFF.name : me?.name || t("Guest", "Tamu")).split(" ")[0]}</span>
          <span className="account-btn__tag" hidden={!isStaff}>{t("Staff", "Staf")}</span>
        </button>

        <button className="btn btn--primary btn--sm" hidden={signedIn || quiet} onClick={() => showAuth("")}>
          <Ico name="login" />
          <span>{t("Sign in", "Masuk")}</span>
        </button>
      </div>
    </header>
  );
}
