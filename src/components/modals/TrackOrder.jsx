import { useEffect, useState } from "react";
import { useApp } from "../../lib/store.jsx";
import ModalHead from "../ModalHead.jsx";
import Ico from "../../lib/icons.jsx";
import ReviewForm from "./ReviewForm.jsx";
import { BIZ, riderFor, routeKm } from "../../data/biz.js";
import { clamp, clockTime } from "../../lib/format.js";

const ROUTE = [[26, 182], [26, 120], [92, 120], [92, 44], [160, 44], [160, 108], [232, 108], [232, 52], [300, 52]];
const D = "M" + ROUTE.map(([x, y]) => `${x} ${y}`).join(" L ");
const START = ROUTE[0];
const END = ROUTE[ROUTE.length - 1];
const CUM = (() => {
  const acc = [0];
  let len = 0;
  for (let i = 1; i < ROUTE.length; i++) {
    len += Math.abs(ROUTE[i][0] - ROUTE[i - 1][0]) + Math.abs(ROUTE[i][1] - ROUTE[i - 1][1]);
    acc.push(len);
  }
  return { acc, len };
})();

function at(frac) {
  const d = CUM.len * clamp(frac, 0, 1);
  for (let i = 1; i < ROUTE.length; i++) {
    if (d <= CUM.acc[i]) {
      const t = (d - CUM.acc[i - 1]) / (CUM.acc[i] - CUM.acc[i - 1] || 1);
      return [
        ROUTE[i - 1][0] + (ROUTE[i][0] - ROUTE[i - 1][0]) * t,
        ROUTE[i - 1][1] + (ROUTE[i][1] - ROUTE[i - 1][1]) * t
      ];
    }
  }
  return END;
}

const GRID_V = [26, 92, 160, 232, 300];
const GRID_H = [44, 108, 120, 182];
const BLOCKS = [
  [42, 60, 34, 42], [106, 60, 40, 40], [42, 136, 34, 46], [106, 136, 40, 46],
  [176, 60, 40, 34], [176, 136, 40, 46], [248, 68, 74, 32], [42, 12, 40, 22]
];
const PARK = [244, 128, 78, 42];

const STEPS = [
  ["Ticket on the pass", "Tiket masuk dapur"],
  ["In the kitchen", "Sedang dimasak"],
  ["Packed and sealed", "Dikemas dan disegel"],
  ["Rider on the way", "Kurir berangkat"],
  ["At your door", "Sampai di depan pintu"]
];
const STAGE = { new: 0, cooking: 1, ready: 2, delivering: 3, done: 4 };
const PARKED = [54, 176];
const CREEP = .86;
const TAU = 6000;

const still = () => typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion:reduce)").matches;

export default function TrackOrder({ orderId }) {
  const app = useApp();
  const { t } = app;
  const [startAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const order = app.data.orders.find(o => o.id === orderId);

  const eta = Math.max(1, order?.eta || 25);
  const idx = STAGE[order?.status] ?? 0;
  const arrived = idx === STEPS.length - 1;
  const out = order?.status === "delivering";

  useEffect(() => {
    if (!out || still()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 240);
    return () => clearInterval(id);
  }, [out]);

  const elapsed = still() ? Infinity : now - startAt;
  const roll = arrived ? 1 : !out ? 0 : CREEP - (CREEP - .1) * Math.exp(-elapsed / TAU);
  const here = roll > 0 ? at(roll) : PARKED;
  const km = routeKm(orderId);
  const rider = riderFor(orderId);
  const kmLeft = km * (1 - roll);
  const minsLeft = arrived ? 0 : out ? Math.max(2, Math.round(eta * (1 - roll))) : eta;
  const door = order?.address || BIZ.street[0];
  const signed = order?.receivedAt;
  const near = out && roll >= .6;

  if (!order) return null;

  const head = [
    [t("Ticket on the pass", "Tiketmu sudah masuk dapur"), t("The printer just woke up.", "Printer dapur baru saja mencetak.")],
    [t("Cooking your order", "Pesananmu sedang dimasak"), t("Two burners, one pass, nothing rushed.", "Dua tungku, satu pass, semuanya tetap rapi.")],
    [t("Packed and sealed", "Sudah dikemas dan disegel"), t("Waiting for the next free rider.", "Tinggal menunggu kurir yang bebas.")],
    [t("Rider on the way", "Kurirnya sudah di jalan"),
      `${t(`${kmLeft.toFixed(1)} km to your door`, `${kmLeft.toFixed(1)} km menuju pintumu`)} · ${door}`],
    [t("Delivered to your door", "Sudah sampai di depan pintumu"),
      signed
        ? t(`You confirmed it at ${clockTime(signed)}. Eat while it is hot.`, `Kamu terima pukul ${clockTime(signed)}. Makan selagi panas.`)
        : t(`${clockTime(order.created)} ticket, served. Eat while it is hot.`, `Tiket ${clockTime(order.created)}, sudah tiba. Makan selagi panas.`)]
  ][idx];

  return (
    <>
      <ModalHead title={t(`Where is order ${order.id}?`, `Di mana pesanan ${order.id}?`)}
                 sub={t("The map follows the chef's board. Once your ticket is out, the ride plays at demo speed.",
                        "Petanya ikut papan chef. Begitu tiketmu berangkat, lintasannya diputar cepat.")} />
      <div className="dlv">
        <div className="dlv__map">
          <svg viewBox="0 0 340 210" role="img" aria-label={t("Delivery route map", "Peta rute antar")}>
            <g className="dlv__streets">
              {GRID_V.map(x => <line key={`v${x}`} x1={x} y1="8" x2={x} y2="202" />)}
              {GRID_H.map(y => <line key={`h${y}`} x1="8" y1={y} x2="332" y2={y} />)}
            </g>
            {BLOCKS.map(([x, y, w, h], i) => <rect key={i} className="dlv__block" x={x} y={y} width={w} height={h} rx="5" />)}
            <rect className="dlv__park" x={PARK[0]} y={PARK[1]} width={PARK[2]} height={PARK[3]} rx="5" />

            <path className="dlv__road" d={D} />
            <path className="dlv__done" d={D}
                  style={{ strokeDasharray: CUM.len, strokeDashoffset: CUM.len * (1 - roll) }} />

            <g transform={`translate(${START[0]} ${START[1]})`}>
              <text className="dlv__pin" y="1">🍳</text>
              <text className="dlv__label" y="20">{t("Bistro", "Bistro")}</text>
            </g>
            <g transform={`translate(${END[0]} ${END[1]})`}>
              {!arrived && <circle className="dlv__pulse" r="14" />}
              <text className="dlv__pin" y="1">🏠</text>
              <text className="dlv__label" y="-16">{t("You", "Kamu")}</text>
            </g>
            <g className="dlv__dot" style={{ transform: `translate(${here[0]}px, ${here[1]}px)` }}>
              <circle className="dlv__halo" r="18" />
              <circle className="dlv__chip" r="13" />
              <text className="dlv__pin" y="1">🛵</text>
            </g>
          </svg>
        </div>

        <div className="modal__body">
          <div className="dlv__now">
            <div className="dlv__clock">
              <b>{arrived ? "✓" : minsLeft}</b>
              <small>{arrived ? t("arrived", "tiba") : t("min left", "mnt lagi")}</small>
            </div>
            <div className="dlv__head">
              <b>{head[0]}</b>
              <small>{head[1]}</small>
            </div>
          </div>

          <ol className="dlv__steps">
            {STEPS.map((s, i) => {
              const ok = arrived || i < idx;
              return (
                <li key={i} className={ok ? "is-done" : i === idx ? "is-active" : ""}>
                  <i>{ok ? "✓" : i + 1}</i>{t(...s)}
                </li>
              );
            })}
          </ol>

          {idx >= 2 && (
            <div className="dlv__rider">
              <span>🛵</span>
              <div>
                <b>{rider.name}</b>
                <small>{rider.bike} · {rider.plate} · {t("your rider", "kurirmu")}</small>
              </div>
              {(out || arrived) && <em>{Math.round(roll * 100)}%</em>}
            </div>
          )}

          <p className="dlv__addr">
            <Ico name="pin" />
            <span>{door} · {t("hand-off around", "perkiraan tiba jam")} {order.slot}</span>
          </p>
          <p className="muted" style={{ fontSize: ".76rem" }}>
            {t(`Placed ${clockTime(order.created)} · ${order.contactless ? "contactless at the door" : "signed for at the door"}`,
               `Dipesan ${clockTime(order.created)} · ${order.contactless ? "antar tanpa kontak" : "tanda tangan di depan pintu"}`)}
          </p>

          {near && (
            <p className="dlv__sign">
              <Ico name="check" />
              <span>{t("The rider is at your kerb. Tap the button below once the bag is in your hands.",
                       "Kurirnya sudah di depan pintumu. Tekan tombol di bawah begitu bungkusnya ada di tanganmu.")}</span>
            </p>
          )}
        </div>

        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={app.closeModal}>{t("Close", "Tutup")}</button>
          {arrived ? (
            <button className="btn btn--primary"
                    onClick={() => { app.closeModal(); app.openModal(<ReviewForm />); }}>
              {t("Rate this order", "Beri ulasan pesanan ini")}
            </button>
          ) : near ? (
            <button className="btn btn--primary" onClick={() => app.receiveOrder(orderId)}>
              {t("Order received", "Pesanan sudah diterima")}
            </button>
          ) : (
            <button className="btn btn--primary"
                    onClick={() => { app.closeModal(); app.openChat(); }}>
              {t("Ask the kitchen", "Tanya dapur")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
