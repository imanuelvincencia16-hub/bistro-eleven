import { useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { PAY_METHODS, PROMOS, SPICE_WORDS, payLabel } from "../../data/biz.js";
import { wantsHeat } from "../../data/menu.js";
import { PAY_ID, PROMO_ID, SPICE_ID } from "../../lib/i18n.js";
import { money, okEmail, plural, uid } from "../../lib/format.js";
import ModalHead from "../ModalHead.jsx";

const SLOTS = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const TYPES = [
  ["delivery", "🛵", "Delivery", "22–35 min", "Antar", "22–35 mnt"],
  ["pickup", "🥡", "Pickup", "15 min", "Ambil sendiri", "15 mnt"],
  ["table", "🍷", "At the table", "now", "Di meja", "sekarang"]
];

export default function Checkout() {
  const app = useApp();
  const who = app.me;
  const [type, setType] = useState("delivery");
  const [pay, setPay] = useState(PAY_METHODS[0][0]);
  const [spice, setSpice] = useState(2);
  const [promo, setPromo] = useState("");
  const [code, setCode] = useState("");
  const [contactless, setContactless] = useState(true);
  const [errs, setErrs] = useState({});
  const [f, setF] = useState({
    name: who?.name || "", phone: who?.phone || "", address: who?.address || "",
    slot: "19:00", table: "4", notes: "", email: who?.email || ""
  });

  const t = app.totals(type, promo);
  const heat = app.cartList.some(({ d }) => wantsHeat(d.cat));
  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setErrs(e => ({ ...e, [k]: false })); };
  const feeName = type === "table" ? "Table service" : type === "pickup" ? "Pickup tray" : "Delivery";
  const feeId = type === "table" ? "Layanan meja" : type === "pickup" ? "Baki ambil" : "Ongkos antar";

  const applyPromo = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setPromo(""); return; }
    if (!PROMOS[c]) { app.toast(app.t(`“${c}” isn't a code we know`, `“${c}” bukan kode yang kami kenal`), "🎟️"); return; }
    setPromo(c);
    app.toast(app.t(`${PROMOS[c].label} applied`, `${PROMO_ID[PROMOS[c].label] || PROMOS[c].label} sudah dipakai`), "🎉");
  };

  const send = () => {
    const bad = {
      name: f.name.trim().length < 2,
      phone: f.phone.replace(/\D/g, "").length < 7,
      address: type === "delivery" && f.address.trim().length < 6,
      email: !!f.email.trim() && !okEmail(f.email.trim())
    };
    setErrs(bad);
    if (Object.values(bad).some(Boolean)) { app.toast(app.t("A couple of fields still need you", "Ada beberapa isian yang belum kamu isi"), "✍️"); return; }

    app.placeOrder({
      id: uid("BE-"), email: who?.email || "", billTo: f.email.trim() || who?.email || "",
      name: f.name.trim(), phone: f.phone.trim(),
      address: type === "delivery" ? f.address.trim() : "",
      type, slot: f.slot, table: type === "table" ? f.table : "",
      spice: heat ? spice : null, notes: f.notes.trim(), contactless, promo, pay,
      items: app.cartList.map(({ d, q }) => ({ id: d.id, name: d.name, price: d.price, qty: q, cat: d.cat })),
      totals: t, status: "new", created: Date.now(), eta: 22 + Math.floor(Math.random() * 12)
    });
    app.closeModal();
  };

  return (
    <>
      <ModalHead title={app.t("Set your order", "Atur pesananmu")} sub={app.t("The last few things the kitchen needs before it fires your ticket.", "Beberapa hal terakhir dari kami sebelum tiketmu mulai dimasak.")} />
      <div className="co">
        <div className="co__form">
          <div className="field">
            <label>{app.t("How are we getting this to you?", "Bagaimana pesananmu sampai ke kamu?")}</label>
            <div className="seg">
              {TYPES.map(([v, ico, title, sub, titleId, subId]) => (
                <label key={v}>
                  <input type="radio" name="otype" value={v} checked={type === v} onChange={() => setType(v)} />
                  <span>{ico}</span><b>{app.t(title, titleId)}</b><small>{app.t(sub, subId)}</small>
                </label>
              ))}
            </div>
          </div>

          <div className="row2">
            <div className={`field${errs.name ? " err" : ""}`}>
              <label htmlFor="co-name">{app.t("Name on the ticket", "Nama di tiket")}</label>
              <input id="co-name" value={f.name} placeholder={app.t("e.g. Nadia", "mis. Nadia")} autoFocus
                     onChange={e => set("name", e.target.value)} />
              <small className="field__err">{app.t("We need a name to call out.", "Butuh nama supaya kami bisa memanggil.")}</small>
            </div>
            <div className={`field${errs.phone ? " err" : ""}`}>
              <label htmlFor="co-phone">{app.t("Phone", "Nomor HP")}</label>
              <input id="co-phone" inputMode="tel" value={f.phone} placeholder="+62 811 2233 4455"
                     onChange={e => set("phone", e.target.value)} />
              <small className="field__err">{app.t("At least 7 digits, so the rider can reach you.", "Minimal 7 angka, supaya kurir bisa menghubungimu.")}</small>
            </div>
          </div>

          <div className={`field${errs.address ? " err" : ""}`} hidden={type !== "delivery"}>
            <label htmlFor="co-addr">{app.t("Delivery address", "Alamat antar")}</label>
            <input id="co-addr" value={f.address} placeholder={app.t("Street, unit, postcode", "Nama jalan, nomor rumah, kode pos")}
                   onChange={e => set("address", e.target.value)} />
            <small className="field__err">{app.t("Where is the door?", "Alamatnya di mana?")}</small>
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="co-slot">{type === "table" ? app.t("Sitting time", "Waktu duduk") : app.t("Ready at", "Siap jam")}</label>
              <select id="co-slot" value={f.slot} onChange={e => set("slot", e.target.value)}>
                {SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field" hidden={type !== "table"}>
              <label htmlFor="co-table">{app.t("Table number", "Nomor meja")}</label>
              <input id="co-table" type="number" min="1" max="11" value={f.table}
                     onChange={e => set("table", e.target.value)} />
              <small>{app.t("Eleven tables, no more.", "Sebelas meja, tidak lebih.")}</small>
            </div>
          </div>

          {heat && (
            <div className="field">
              <label htmlFor="co-spice">{app.t("Heat dial · how much chilli on the pass?", "Level pedas · mau seberapa banyak cabai?")}</label>
              <div className="range">
                <input id="co-spice" type="range" min="0" max="4" step="1" value={spice}
                       onChange={e => setSpice(+e.target.value)} />
                <div className="range__labels"><span>{app.t("None", "Nol")}</span><span>{app.t("Warm", "Hangat")}</span><span>{app.t("Medium", "Sedang")}</span><span>{app.t("Hot", "Pedas")}</span><span>{app.t("Fire", "Api")}</span></div>
                <span className="range__now">{app.t(SPICE_WORDS[spice], SPICE_ID[SPICE_WORDS[spice]])}</span>
              </div>
            </div>
          )}

          <label className="switch" htmlFor="co-contact">
            <span><b>{app.t("Contactless hand-off", "Antar tanpa kontak")}</b><small>{app.t("Rider leaves it at the door and steps back.", "Kurir menaruhnya di depan pintu, lalu mundur.")}</small></span>
            <input type="checkbox" id="co-contact" checked={contactless} onChange={e => setContactless(e.target.checked)} />
            <span className="track" />
          </label>

          <div className="field">
            <label htmlFor="co-notes">{app.t("Notes for the kitchen", "Catatan untuk dapur")}</label>
            <textarea id="co-notes" value={f.notes} placeholder={app.t("Allergies, well-done, no onion, ring the bell twice…", "Alergi, minta matang, tanpa bawang, bel dua kali…")}
                      onChange={e => set("notes", e.target.value)} />
          </div>

          <div className="field">
            <label>{app.t("How are you paying?", "Mau bayar dengan apa?")}</label>
            <div className="pay">
              {PAY_METHODS.map(([v, ico, title, hint]) => (
                <label key={v}>
                  <input type="radio" name="opay" value={v} checked={pay === v} onChange={() => setPay(v)} />
                  <span>{ico}</span><b>{app.t(title, PAY_ID[title]?.[1])}</b><small>{app.t(hint, PAY_ID[hint]?.[1])}</small>
                </label>
              ))}
            </div>
          </div>

          <div className={`field${errs.email ? " err" : ""}`}>
            <label htmlFor="co-email">{app.t("Receipt email", "Email struk")}</label>
            <input id="co-email" type="email" value={f.email} placeholder="you@example.com"
                   onChange={e => set("email", e.target.value)} />
            <small className="field__err">{app.t("That email doesn't look right.", "Email-nya belum pas.")}</small>
          </div>
        </div>

        <aside className="co__side">
          <h4>{app.t("Your basket", "Keranjangmu")}</h4>
          <div className="co-list">
            {app.cartList.map(({ d, q }) => <div key={d.id}><span>{q}× {app.t(d.name, d.name_id)}</span><b>{money(d.price * q)}</b></div>)}
          </div>

          <h4>{app.t("Promo", "Promo")}</h4>
          <div className="promo">
            <input value={code} placeholder="BISTRO11" onChange={e => setCode(e.target.value)}
                   onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }} />
            <button type="button" onClick={applyPromo}>{app.t("Apply", "Pakai")}</button>
          </div>

          <div className="co-totals">
            <div className="line"><span>{app.t("Subtotal", "Subtotal")}</span><b>{money(t.sub)}</b></div>
            <div className="line line--muted"><span>{app.t("Kitchen tax 8.25%", "Pajak dapur 8,25%")}</span><span>{money(t.tax)}</span></div>
            <div className="line line--muted"><span>{app.t("Service 5%", "Layanan 5%")}</span><span>{money(t.service)}</span></div>
            <div className="line line--muted"><span>{app.t(feeName, feeId)}</span><span>{t.delivery === 0 ? app.t("Free", "Gratis") : money(t.delivery)}</span></div>
            {t.discount > 0 && (
              <div className="line line--muted"><span className="disc">{app.t(t.promo.label, PROMO_ID[t.promo.label])}</span><span className="disc">−{money(t.discount)}</span></div>
            )}
            <div className="line grand"><span>{app.t("Total", "Total")}</span><b>{money(t.total)}</b></div>
            <div className="line line--muted"><span>{app.t("You pay with", "Kamu bayar dengan")}</span><b>{app.t(payLabel(pay), PAY_ID[payLabel(pay)]?.[1])}</b></div>
          </div>

          <p className="muted" style={{ fontSize: ".76rem" }}>
            {app.t(`${plural(app.cartCount, "item")} · ${feeName.toLowerCase()} · code BISTRO11 · FIRSTBITE · LATEPASS`, `${app.cartCount} item · ${feeId.toLowerCase()} · kode BISTRO11 · FIRSTBITE · LATEPASS`)}
          </p>
          <button className="btn btn--primary btn--block" onClick={send}>{app.t("Send to the kitchen", "Kirim ke dapur")}</button>
        </aside>
      </div>
    </>
  );
}
