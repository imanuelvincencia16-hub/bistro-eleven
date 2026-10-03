import { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/store.jsx";
import { money, plural } from "../lib/format.js";
import Bill from "./modals/Bill.jsx";

const TYPE_LABEL = { delivery: ["Delivery", "Antar"], pickup: ["Pickup", "Ambil sendiri"], table: ["Table", "Meja"] };
const MAX_LINES = 5;

const beatsFor = order => [
  [["Sending your ticket to the pass…", "Tiketmu sedang dikirim ke dapur…"]],
  [["Printed and on the board", "Sudah tercetak, sudah di papan"],
   ["The kitchen works its tickets top down.", "Dapur mengerjakan tiket dari yang paling atas."]],
  [["Now the kitchen takes over", "Sekarang dapur yang ambil alih"],
   ["Your receipt is ready.", "Struknya sudah siap."]]
];

const FEED = 2600;

export default function OrderTracker() {
  const app = useApp();
  const { t } = app;
  const order = app.tracker;
  const [beat, setBeat] = useState(0);
  const [out, setOut] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    setBeat(0); setOut(false);
    if (!order) return undefined;

    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    push(() => setBeat(1), FEED);
    push(() => setBeat(2), FEED + 2200);
    const tEnd = FEED + 2200;
    push(() => setOut(true), tEnd + 800);
    push(() => {
      app.setTracker(null);
      app.openModal(<Bill order={order} />, "modal--slim");
    }, tEnd + 800 + 500);

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (!order) return null;

  const beats = beatsFor(order);
  const itemCount = order.items.reduce((q, i) => q + i.qty, 0);
  const pair = beats[Math.min(beat, beats.length - 1)];
  const sub = beat === 0
    ? [`${order.id} · ${plural(itemCount, "item")} · ${money(order.totals.total)}`,
       `${order.id} · ${itemCount} barang · ${money(order.totals.total)}`]
    : pair[1];
  const shown = order.items.slice(0, MAX_LINES);
  const rest = order.items.length - shown.length;
  const type = TYPE_LABEL[order.type];

  return (
    <div className={`tracker${out ? " is-out" : ""}`} id="tracker">
      <div className="tracker__card">
        <div className="tracker__pass">
          <span className="tracker__slot" />
          <div className="tracker__paper">
            <div className="tracker__head">
              <b>{order.id}</b>
              <small>{type ? t(...type) : order.type} · {order.slot} · ~{order.eta} {t("min", "mnt")}</small>
            </div>
            <ul className="tracker__lines">
              {shown.map(i => (
                <li key={i.id}>
                  <span>{i.qty}× {t(i.name, app.data.menu.find(m => m.id === i.id)?.name_id)}</span>
                  <b>{money(i.price * i.qty)}</b>
                </li>
              ))}
              {rest > 0 && <li className="more">{t(`+${rest} more ${plural(rest, "line")}`, `+${rest} baris lagi`)}</li>}
            </ul>
            {order.notes && <p className="tracker__note">“{order.notes}”</p>}
            <span className="tracker__tear" />
          </div>
        </div>
        <h3 id="tracker-title" key={`t${beat}`}>{t(...pair[0])}</h3>
        <p id="tracker-sub" key={`s${beat}`}>{t(...sub)}</p>
      </div>
    </div>
  );
}
