import { useApp, searchDishes } from "../lib/store.jsx";
import useReveal from "../hooks/useReveal.js";
import { initial, money, plural, safeAvatar } from "../lib/format.js";
import { SHEET_URL } from "../lib/sheets.js";
import Stars from "../components/Stars.jsx";
import Ico from "../lib/icons.jsx";
import NewDishForm from "../components/modals/NewDishForm.jsx";
import OrderTicket from "../components/admin/OrderTicket.jsx";
import OrderLedger from "../components/admin/OrderLedger.jsx";
import DeviceMove from "../components/modals/DeviceMove.jsx";
import DishRow from "../components/admin/DishRow.jsx";
import ChatDesk from "../components/admin/ChatDesk.jsx";

const TABS = [["orders", "Orders", "Pesanan"], ["ledger", "Ledger", "Buku"], ["chats", "Chats", "Obrolan"], ["dishes", "Menu", "Menu"], ["feedback", "Reviews", "Ulasan"]];

export default function AdminPage() {
  const app = useApp();
  const { data, ui, onSale, t } = app;
  useReveal([ui.adminTab, data.orders.length]);

  const orders = data.orders;
  const revenue = orders.reduce((t, o) => t + (o.status === "cancelled" ? 0 : o.totals.total), 0);
  const sold = orders.reduce((t, o) => t + o.items.reduce((n, i) => n + i.qty, 0), 0);
  const open = orders.filter(o => o.status !== "done").length;
  const live = data.reviews.filter(r => !r.hidden);
  const avg = live.length ? live.reduce((t, r) => t + r.stars, 0) / live.length : 0;
  const tally = {};
  orders.forEach(o => o.items.forEach(i => { tally[i.name] = (tally[i.name] || 0) + i.qty; }));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const topName = top ? t(top[0], data.menu.find(m => m.name === top[0])?.name_id) : "";
  const chatUnread = data.chats.reduce((n, c) => n + (c.unread?.chef || 0), 0);

  const stats = [
    ["revenue", t("Revenue booked", "Pendapatan tercatat"), money(revenue), t(plural(orders.length, "order"), `${orders.length} pesanan`), "sheet"],
    ["live", t("Live tickets", "Tiket aktif"), open, open ? t("kitchen is busy", "dapur lagi sibuk") : t("all quiet", "semua tenang")],
    ["plates", t("Plates fired", "Piring terkirim"), sold, top ? t(`top: ${topName}`, `terlaris: ${topName}`) : t("no sales yet", "belum ada penjualan")],
    ["score", t("Guest score", "Nilai tamu"), avg.toFixed(2), t(plural(live.length, "review"), `${live.length} ulasan`)]
  ];
  const counts = { orders: open, ledger: orders.length, chats: chatUnread || data.chats.length, dishes: onSale.length, feedback: live.length };
  const tab = ui.adminTab;
  const dishQuery = ui.query.trim().toLowerCase();
  const foundDishes = searchDishes(data.menu, dishQuery).list;

  return (
    <section className="admin">
      <div className="wrap">
        <header className="admin__head">
          <div>
            <span className="eyebrow"><i className="eyebrow__dot" /> {t("Chef console", "Konsol chef")}</span>
            <h2>{t("Service board", "Papan layanan")}</h2>
          </div>
          <div className="admin__head-actions">
            <span className="live"><i /> {t("live", "langsung")}</span>
            <button className="btn btn--ghost btn--sm" onClick={app.previewSite}><Ico name="eye" /> {t("View the guest site", "Lihat situs tamu")}</button>
            <button className="btn btn--ghost btn--sm" onClick={() => app.openModal(<DeviceMove />, "modal--slim")}><Ico name="share" /> {t("Move to another device", "Pindah ke perangkat lain")}</button>
            <button className="btn btn--ghost btn--sm" onClick={app.resetDemo}>{t("Reset demo data", "Setel ulang data demo")}</button>
          </div>
        </header>

        <div className="stat-grid">
          {stats.map(([id, k, v, s, go]) => {
            const face = <><span>{k}</span><b>{v}</b><small>{s}</small></>;
            return go === "sheet" ? (
              <a className="stat stat--link" key={id} href={SHEET_URL} target="_blank" rel="noopener noreferrer">
                {face}
                <span className="stat__go">{t("Open the spreadsheet", "Buka spreadsheet")} <Ico name="external" /></span>
              </a>
            ) : <div className="stat" key={id}>{face}</div>;
          })}
        </div>

        <div className="admin__tabs" role="tablist">
          {TABS.map(([k, label, labelId]) => (
            <button key={k} type="button" className={tab === k ? "is-on" : ""}
                    onClick={() => app.patchUi({ adminTab: k })}>
              {t(label, labelId)} <span>{counts[k]}</span>
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="admin__panel">
            {orders.length ? (
              <div className="ticket-rail">{orders.map(o => <OrderTicket key={o.id} o={o} />)}</div>
            ) : (
              <div className="empty">
                <span>🧾</span>
                <h4>{t("No tickets yet", "Belum ada tiket")}</h4>
                <p>{t("Place an order in the Guest view and it prints here.", "Buat pesanan di tampilan Tamu, tiketnya muncul di sini.")}</p>
              </div>
            )}
          </div>
        )}

        {tab === "ledger" && (
          <div className="admin__panel">
            <OrderLedger />
          </div>
        )}

        {tab === "chats" && (
          <div className="admin__panel">
            <ChatDesk />
          </div>
        )}

        {tab === "dishes" && (
          <div className="admin__panel">
            <div className="da-bar">
              <button className="btn btn--primary btn--sm" onClick={() => app.openModal(<NewDishForm />, "modal--wide")}>
                <Ico name="plus" /> {t("Add a new dish", "Tambah hidangan baru")}
              </button>
              {dishQuery && (
                <small className="muted">
                  <b>{foundDishes.length}</b> {t(`of ${data.menu.length} dishes match`, `dari ${data.menu.length} hidangan cocok dengan`)} “{dishQuery}” ·{" "}
                  <button className="text-btn" onClick={() => app.patchUi({ query: "" })}>{t("Clear", "Bersihkan")}</button>
                </small>
              )}
            </div>
            <div className="dish-admin">
              {foundDishes.length ? foundDishes.map(d => <DishRow key={d.id} d={d} />) : (
                <div className="empty">
                  <span>🔍</span>
                  <h4>{t("Nothing on the board matches", "Tidak ada di papan yang cocok dengan")} “{dishQuery}”</h4>
                  <p>{t("The chef search reads dish names, tags and categories.", "Pencarian chef membaca nama hidangan, tag, dan kategori.")}</p>
                  <button className="btn btn--ghost btn--sm" onClick={() => app.patchUi({ query: "" })}>{t("Clear search", "Bersihkan pencarian")}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "feedback" && (
          <div className="admin__panel">
            <div className="feedback-admin">
              {data.reviews.length ? data.reviews.map(r => {
                const pic = safeAvatar(app.findAccount(r.email)?.avatar);
                return (
                  <div className={`fb${r.hidden ? " is-hidden" : ""}`} key={r.id} data-fb={r.id}>
                    <span className="avatar" style={{ width: 44, height: 44 }}>
                      {pic ? <img src={pic} alt="" /> : initial(r.name || "G")}
                    </span>
                    <div className="fb__meta">
                      <b>{r.name} · <Stars value={r.stars} /></b>
                      <p>{t(r.text, r.text_id)}</p>
                      <span style={{ fontSize: ".72rem", color: "var(--ink-3)" }}>
                        {r.dish ? t(r.dish, data.menu.find(m => m.name === r.dish)?.name_id) : t("the room", "ruang makan")} · {r.date}{r.hidden ? t(" · hidden from guests", " · tersembunyi dari tamu") : ""}
                      </span>
                    </div>
                    <div className="fb__actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => app.toggleReview(r.id)}>
                        {r.hidden ? t("Publish", "Tayangkan") : t("Hide", "Sembunyikan")}
                      </button>
                      <button className="da-btn danger" aria-label={t("Delete review", "Hapus ulasan")} onClick={() => app.deleteReview(r.id)}>
                        <Ico name="trash" />
                      </button>
                    </div>
                  </div>
                );
              }) : <p className="muted">{t("No reviews yet.", "Belum ada ulasan.")}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
