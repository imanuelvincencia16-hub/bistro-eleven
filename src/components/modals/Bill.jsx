import { useMemo } from "react";
import Ico from "../../lib/icons.jsx";
import { useApp } from "../../lib/store.jsx";
import { PAY_ID, PROMO_ID } from "../../lib/i18n.js";
import { payLabel } from "../../data/biz.js";
import { clockTime, money, okEmail, shortDate } from "../../lib/format.js";
import TrackOrder from "./TrackOrder.jsx";

const STYLE_LABEL = { delivery: ["Delivery", "Antar"], pickup: ["Pickup", "Ambil sendiri"], table: ["Table", "Meja"] };
const DELIVERY_LABEL = { delivery: ["Delivery", "Ongkos antar"], pickup: ["Pickup tray", "Baki ambil"], table: ["Table service", "Layanan meja"] };

export default function Bill({ order }) {
  const app = useApp();
  const t = order.totals;
  const billTo = String(order.billTo || order.email || "").trim();
  const bars = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    height: `${28 + ((i * 37) % 60)}%`,
    width: `${1 + ((i * 13) % 3)}px`,
    animationDelay: `${650 + i * 22}ms`
  })), []);

  const plain = () => {
    const L = [];
    const line = (k, v) => { if (v) L.push(`${k}: ${v}`); };
    const at = order.type === "delivery" ? [app.t("Address", "Alamat"), order.address]
      : order.type === "table" ? [app.t("Table", "Meja"), order.table]
        : [app.t("Pickup", "Ambil sendiri"), app.t("At the pass", "Di pass")];
    L.push(app.t("BISTRO ELEVEN · your bill", "BISTRO ELEVEN · strukmu"));
    L.push(`${order.id} · ${shortDate(order.created)} · ${clockTime(order.created)}`);
    L.push("");
    line(app.t("Name", "Nama"), order.name);
    line(app.t("Phone", "Telepon"), order.phone);
    line(at[0], at[1]);
    line(app.t("Service", "Layanan"), STYLE_LABEL[order.type] ? app.t(...STYLE_LABEL[order.type]) : order.type);
    line(app.t("Ready", "Siap"), `${order.slot} · ~${order.eta} ${app.t("min", "mnt")}`);
    line(app.t("Payment", "Pembayaran"), app.t(payLabel(order.pay), PAY_ID[payLabel(order.pay)]?.[1]));
    L.push("", app.t("Items", "Daftar makanan"));
    order.items.forEach(i => L.push(`${i.qty}× ${app.t(i.name, app.data.menu.find(m => m.id === i.id)?.name_id)} · ${money(i.price * i.qty)}`));
    L.push("");
    line(app.t("Subtotal", "Subtotal"), money(t.sub));
    line(app.t("Kitchen tax 8.25%", "Pajak dapur 8,25%"), money(t.tax));
    line(app.t("Service 5%", "Layanan 5%"), money(t.service));
    line(DELIVERY_LABEL[order.type] ? app.t(...DELIVERY_LABEL[order.type]) : app.t("Service", "Layanan"),
         t.delivery === 0 ? app.t("Free", "Gratis") : money(t.delivery));
    if (t.discount) line(app.t(t.promo.label, PROMO_ID[t.promo.label]), `−${money(t.discount)}`);
    line(app.t("Total paid", "Total bayar"), money(t.total));
    line(app.t("Notes", "Catatan"), order.notes);
    L.push("", app.t("Reply to this mail and it reaches the pass. Thank you for eating with us.",
                     "Balas email ini dan pesannya sampai ke pass. Terima kasih sudah makan bersama kami."));
    return L.join("\r\n");
  };

  const emailBill = () => {
    if (!okEmail(billTo)) {
      app.toast(app.t("No email on this ticket. Add one in your account and the bill can go there.",
                      "Tiket ini belum punya email. Isi dulu di akunmu supaya struknya bisa dikirim."), "📮");
      return;
    }
    const addr = billTo.split("@").map(encodeURIComponent).join("@");
    const subject = encodeURIComponent(app.t(`Bistro Eleven · your bill ${order.id}`, `Bistro Eleven · struk ${order.id}`));
    const a = document.createElement("a");
    a.href = `mailto:${addr}?subject=${subject}&body=${encodeURIComponent(plain())}`;
    a.click();
    app.toast(app.t(`Your mail app is open with the bill for ${billTo}`, `Aplikasi emailmu terbuka dengan struk untuk ${billTo}`), "📧");
  };

  return (
    <div className="bill">
      <div className="bill__top">
        <div className="bill__ok"><Ico name="check" /></div>
        <h3>{app.t("Order confirmed", "Pesanan dikonfirmasi")}</h3>
        <p>{app.t(`${order.name}, the kitchen has your ticket.`, `${order.name}, dapur sudah menerima tiketmu.`)}</p>
      </div>

      <div className="bill__body">
        <div className="bill__meta">
          <div><span>{app.t("Order", "Pesanan")}</span><b>{order.id}</b></div>
          <div><span>{app.t("Placed", "Dibuat")}</span><b>{clockTime(order.created)}</b></div>
          <div><span>{app.t("Style", "Layanan")}</span><b>{order.type === "table" ? app.t(`Table${order.table ? " " + order.table : ""}`, `Meja${order.table ? " " + order.table : ""}`) : (STYLE_LABEL[order.type] ? app.t(...STYLE_LABEL[order.type]) : order.type)}</b></div>
          <div><span>{app.t("Payment", "Pembayaran")}</span><b>{app.t(payLabel(order.pay), PAY_ID[payLabel(order.pay)]?.[1])}</b></div>
          <div><span>{app.t("Ready", "Siap")}</span><b>{order.slot} · ~{order.eta} {app.t("min", "mnt")}</b></div>
          <div><span>{app.t("Bill goes to", "Dikirim ke")}</span><b>{billTo || app.t("not given", "belum diisi")}</b></div>
        </div>

        <div className="bill__items">
          {order.items.map(i => (
            <div key={i.id}><span>{app.t(i.name, app.data.menu.find(m => m.id === i.id)?.name_id)} <i>×{i.qty}</i></span><b>{money(i.price * i.qty)}</b></div>
          ))}
        </div>

        <div className="bill__sum">
          <div><span>{app.t("Subtotal", "Subtotal")}</span><span>{money(t.sub)}</span></div>
          <div><span>{app.t("Kitchen tax 8.25%", "Pajak dapur 8,25%")}</span><span>{money(t.tax)}</span></div>
          <div><span>{app.t("Service 5%", "Layanan 5%")}</span><span>{money(t.service)}</span></div>
          <div><span>{DELIVERY_LABEL[order.type] ? app.t(...DELIVERY_LABEL[order.type]) : app.t("Service", "Layanan")}</span><span>{t.delivery === 0 ? app.t("Free", "Gratis") : money(t.delivery)}</span></div>
          {!!t.discount && (
            <div><span className="disc">{app.t(t.promo.label, PROMO_ID[t.promo.label])}</span><span className="disc">−{money(t.discount)}</span></div>
          )}
          <div className="grand"><span>{app.t("Total paid", "Total bayar")}</span><b>{money(t.total)}</b></div>
        </div>

        {order.notes && <div className="ticket__note">{app.t(`“${order.notes}” · passed to the chef.`, `“${order.notes}” · sudah diteruskan ke chef.`)}</div>}
      </div>

      <div className="bill__foot">
        {order.type === "delivery" && (
          <button className="btn btn--ghost" onClick={() => app.openModal(<TrackOrder orderId={order.id} />)}>{app.t("Track the rider", "Lacak kurir")}</button>
        )}
        <button className="btn btn--ghost" onClick={emailBill}><Ico name="mail" /> {app.t("Email bill", "Kirim struk")}</button>
        <button className="btn btn--primary" onClick={app.closeModal}>{app.t("Back to the menu", "Kembali ke menu")}</button>
      </div>

      <div className="barcode">{bars.map((s, i) => <i key={i} style={s} />)}</div>
      <div className="bill__zip">BISTRO · ELEVEN · {order.id}</div>
    </div>
  );
}
