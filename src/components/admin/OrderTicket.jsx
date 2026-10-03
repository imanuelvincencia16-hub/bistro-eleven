import { useApp } from "../../lib/store.jsx";
import { STATUS_FLOW, STATUS_LABEL } from "../../data/menu.js";
import { STATUS_ID, PAY_ID, ORDER_TYPE_ID, SPICE_ID } from "../../lib/i18n.js";
import { SPICE_WORDS, payLabel } from "../../data/biz.js";
import { money, clockTime } from "../../lib/format.js";
import Ico from "../../lib/icons.jsx";
import Bill from "../modals/Bill.jsx";

export default function OrderTicket({ o }) {
  const app = useApp();
  const { t } = app;
  const at = STATUS_FLOW.indexOf(o.status);
  const next = STATUS_FLOW[Math.min(at + 1, STATUS_FLOW.length - 1)];

  return (
    <article className="ticket" data-t={o.id}>
      <div className="ticket__head">
        <span className="ticket__id">
          {o.id}
          <small>{o.name} · {t(o.type, ORDER_TYPE_ID[o.type]) || o.type}{o.type === "table" && o.table ? ` #${o.table}` : ""}</small>
        </span>
        <span className={`pill pill--${o.status}`}>{t(STATUS_LABEL[o.status] || o.status, STATUS_ID[o.status])}</span>
      </div>

      <div className="ticket__body">
        {o.items.map(i => (
          <div className="ticket__line" key={i.id}><span>{i.qty}× {t(i.name, app.data.menu.find(m => m.id === i.id)?.name_id)}</span><b>{money(i.price * i.qty)}</b></div>
        ))}
        {o.spice != null && (
          <div className="ticket__line">
            <span>{t("Heat level", "Tingkat pedas")}</span><b>{t(SPICE_WORDS[o.spice] || SPICE_WORDS[0], SPICE_ID[SPICE_WORDS[o.spice] || SPICE_WORDS[0]])}</b>
          </div>
        )}
        <div className="ticket__line"><span>{t("Payment", "Pembayaran")}</span><b>{t(payLabel(o.pay), PAY_ID[payLabel(o.pay)]?.[1])}</b></div>
        {o.contactless && o.type === "delivery" && (
          <div className="ticket__line"><span>{t("Hand-off", "Serah terima")}</span><b>{t("Contactless", "Tanpa kontak")}</b></div>
        )}
        {o.receivedAt && (
          <div className="ticket__line"><span>{t("Guest confirmed", "Tamu konfirmasi")}</span><b>{t(`Received at ${clockTime(o.receivedAt)}`, `Diterima ${clockTime(o.receivedAt)}`)}</b></div>
        )}
        {o.notes && <div className="ticket__note">“{o.notes}”</div>}
      </div>

      <div className="ticket__foot">
        <span className="ticket__total">{money(o.totals.total)} · {o.slot}</span>
        {o.status !== "done" && (
          <button className="btn btn--primary btn--sm" onClick={() => app.advanceOrder(o.id)}>
            {o.status === "new" ? t("Start cooking", "Mulai masak") : t(STATUS_LABEL[next] || "Next", STATUS_ID[next] || "Lanjut")}
          </button>
        )}
        <button className="da-btn" title={t("Open receipt", "Buka struk")} aria-label={t(`Open the receipt for ${o.id}`, `Buka struk untuk ${o.id}`)}
                onClick={() => app.openModal(<Bill order={o} />, "modal--slim")}>
          <Ico name="receipt" />
        </button>
      </div>
    </article>
  );
}
