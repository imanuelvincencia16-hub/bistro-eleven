import { useApp } from "../lib/store.jsx";
import { CAT_ID } from "../lib/i18n.js";
import { money, plural } from "../lib/format.js";
import { thumbPic } from "../data/photos.js";
import Ico from "../lib/icons.jsx";
import Photo from "./Photo.jsx";
import Checkout from "./modals/Checkout.jsx";

export default function CartDrawer() {
  const { ui, cartList, cartCount, setQty, closeDrawer, patchUi, openModal, goSection, asCustomer, t } = useApp();
  const sub = cartList.reduce((t, x) => t + x.d.price * x.q, 0);

  const toCheckout = () => {
    if (!asCustomer(t("Sign in so we know who this order belongs to.", "Masuk dulu, supaya kami tahu pesanan ini milik siapa."))) return;
    closeDrawer();
    openModal(<Checkout />, "modal--wide");
  };

  return (
    <>
      <div className="backdrop" hidden={!ui.drawer} onClick={closeDrawer} />
      <aside className={`drawer${ui.drawerOut ? " is-out" : ""}`} aria-label={t("Your order", "Pesananmu")} hidden={!ui.drawer}>
        <header className="drawer__head">
          <div>
            <h3>{t("Your table order", "Pesanan mejamu")}</h3>
            <small>{t(`${plural(cartCount, "item")} on the table`, `${cartCount} barang di meja`)}</small>
          </div>
          <button className="icon-btn" aria-label={t("Close cart", "Tutup keranjang")} onClick={closeDrawer}><Ico name="close" /></button>
        </header>

        <div className="drawer__body" hidden={cartList.length === 0}>
          {cartList.map(({ d, q }) => (
            <div className="ci" key={d.id}>
              <Photo src={thumbPic(d.imgs?.[0])} alt={t(d.name, d.name_id)} cat={d.cat} />
              <div className="ci__info">
                <b>{t(d.name, d.name_id)}</b>
                <span>{t(d.cat, CAT_ID[d.cat])} · {money(d.price)} {t("each", "per item")}</span>
              </div>
              <div className="ci__right">
                <span className="ci__price">{money(d.price * q)}</span>
                <div className="stepper">
                  <button onClick={() => setQty(d.id, -1)} aria-label={t("One less", "Kurangi satu")}>−</button>
                  <b>{q}</b>
                  <button onClick={() => setQty(d.id, 1)} aria-label={t("One more", "Tambah satu")}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="drawer__empty" hidden={cartList.length > 0}>
          <span>🧺</span>
          <p>{t("Nothing in the basket yet.", "Belum ada apa-apa di keranjang.")}</p>
          <button className="btn btn--ghost" onClick={() => { closeDrawer(); goSection("menu"); }}>{t("Browse the menu", "Lihat menu")}</button>
        </div>

        <footer className="drawer__foot">
          <div className="line"><span>{t("Subtotal", "Subtotal")}</span><b>{money(sub)}</b></div>
          <div className="line line--muted"><small>{t("Taxes & service calculated at checkout", "Pajak & layanan dihitung saat bayar")}</small></div>
          <button className="btn btn--primary btn--block" disabled={!cartList.length} onClick={toCheckout}>
            {t("Checkout", "Bayar")} <span>{money(sub)}</span>
          </button>
        </footer>
      </aside>
    </>
  );
}
