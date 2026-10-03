import { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/store.jsx";
import { TOPICS, chipText } from "../data/knowledge.js";
import { STAFF } from "../data/biz.js";
import { money, clockTime, weekday } from "../lib/format.js";
import { kitchen } from "../lib/hours.js";
import Ico from "../lib/icons.jsx";
import Photo from "./Photo.jsx";
import DishDetail from "./modals/DishDetail.jsx";
import TrackOrder from "./modals/TrackOrder.jsx";

const QUICK = TOPICS.filter(t => t.chip)
  .map(t => [t.id, t.chip.replace(/^[^\p{L}\p{N}]+/u, "").trim()]);

const CHEF_QUICK = [
  ["Can you hold a table for four tonight?", "Boleh tahanin meja untuk empat orang malam ini?"],
  ["Someone at the table has a nut allergy, is that okay?", "Satu meja ada alergi kacang, aman?"],
  ["What do you recommend today?", "Hari ini kamu rekomendasiin apa?"]
];

const GO = {
  menu: ["menu", "See the whole board", "Lihat semua menu"],
  visit: ["visit", "Where we cook", "Lihat dapur kami"],
  reviews: ["reviews", "Read guest reviews", "Baca ulasan tamu"],
  gallery: ["gallery", "Look at the room", "Lihat suasananya"]
};

const chipLabel = (c, t, menu) => {
  const m = /^Tell me about (.+)$/.exec(c);
  if (!m) return chipText(c, t);
  const plate = (menu || []).find(d => d.name === m[1]);
  return t(`Tell me about ${m[1]}`, `Ceritakan soal ${plate?.name_id || m[1]}`);
};

const chipId = (c, menu) => chipLabel(c, (en, id) => id || en, menu);

function Bubble({ m, app, asks }) {
  if (m.from === "sys") {
    return (
      <div className="chat__msg chat__msg--sys">
        <p>{app.t(m.text, m.text_id)}</p>
      </div>
    );
  }
  const plates = (m.dishes || []).map(id => app.dishById(id)).filter(d => d && d.available !== false);
  const go = GO[m.go];
  return (
    <div className={`chat__msg chat__msg--${m.from}`}>
      <div className="chat__bubble">
        {m.from !== "bot" && (
          <b className="chat__by">{m.from === "chef" ? m.by || STAFF.name : app.t("You", "Kamu")}</b>
        )}
        <p>{app.t(m.text, m.text_id)}</p>

        {!!plates.length && (
          <div className="chat__plates">
            {plates.map(d => (
              <button
                key={d.id}
                onClick={() => app.openModal(<DishDetail dish={d} />, "modal--wide")}
                aria-label={app.t(`Open ${d.name}`, `Buka ${app.t(d.name, d.name_id)}`)}
              >
                <Photo src={d.imgs?.[0]} alt={app.t(d.name, d.name_id)} cat={d.cat} />
                <span><b>{app.t(d.name, d.name_id)}</b><em>{money(d.price)}</em></span>
              </button>
            ))}
          </div>
        )}

        {asks && !!m.chips?.length && (
          <div className="chat__asks">
            {m.chips.map(c => <button key={c} onClick={() => app.askChat(c, chipId(c, app.data.menu))}>{chipLabel(c, app.t, app.data.menu)}</button>)}
          </div>
        )}
        {asks && go && (
          <button className="chat__link" onClick={() => app.goSection(go[0])}>
            {app.t(go[1], go[2])} <Ico name="arrow" />
          </button>
        )}
        {asks && m.handoff && app.chatMode !== "chef" && (
          <button className="chat__chef" onClick={() => app.setChatMode("chef")}>
            <Ico name="user" /> {app.t(`Chat with ${STAFF.name} instead`, `Chat dengan ${STAFF.name} saja`)}
          </button>
        )}
        {m.track && (
          <button className="chat__link" onClick={() => app.openModal(<TrackOrder orderId={m.track} />)}>
            {app.t("Watch the rider on the map", "Lacak kurir di peta")} <Ico name="arrow" />
          </button>
        )}
      </div>
      <time className="chat__at" dateTime={m.at}>{clockTime(m.at)}</time>
    </div>
  );
}

export default function ChatWidget() {
  const app = useApp();
  const { ui, t } = app;
  const msgs = app.chatThread?.msgs || [];
  const [draft, setDraft] = useState("");
  const body = useRef(null);
  const input = useRef(null);

  const shown = ui.chat || ui.chatOut;
  const unread = app.chatThread?.unread?.guest || 0;

  useEffect(() => {
    if (!ui.chat) return;
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ui.chat, msgs.length, ui.chatTyping, draft]);

  useEffect(() => {
    if (!ui.chat) return undefined;
    const id = setTimeout(() => input.current?.focus({ preventScroll: true }), 240);
    return () => clearTimeout(id);
  }, [ui.chat]);

  if (ui.view !== "guest") return null;

  const send = (text, label) => {
    const v = String(text || "").trim();
    if (!v) return;
    setDraft("");
    app.askChat(v, label);
  };

  const last = msgs[msgs.length - 1];
  const asked = msgs.some(m => m.from === "guest");
  const chef = app.chatMode === "chef";
  const at = kitchen();
  const nextOpen = at.opensAt
    ? (at.inDays ? `${weekday(at.opensAt)} ${clockTime(at.opensAt)}` : clockTime(at.opensAt))
    : t("soon", "segera");
  const waiting = chef && last?.from === "guest";

  return (
    <>
      <button
        className={`chat-launch${shown ? " is-tuck" : ""}`}
        onClick={app.openChat}
        aria-label={unread
          ? t(`Open the live chat, ${unread} new message${unread > 1 ? "s" : ""} from the kitchen`, `Buka obrolan langsung, ${unread} pesan baru dari dapur`)
          : t("Open the live chat", "Buka obrolan langsung")}
      >
        <Ico name="chat" />
        <span>{chef ? t(`Chat ${STAFF.name}`, `Chat ${STAFF.name}`) : t("Ask about the menu", "Tanya soal menu")}</span>
        {!!unread && <b className="chat-launch__pip">{unread}</b>}
      </button>

      <section
        className={`chat${ui.chatOut ? " is-out" : ""}`}
        hidden={!shown}
        aria-label={t("Live chat with Bistro Eleven", "Obrolan langsung dengan Bistro Eleven")}
      >
        <header className="chat__head">
          <span className="chat__ava" aria-hidden="true">{chef ? "👨‍🍳" : "🤖"}</span>
          <div className="chat__who">
            <b>{chef ? STAFF.name : t("Bistro Eleven assistant", "Asisten Bistro Eleven")}</b>
            {chef ? (
              <span className={`chat__state${at.open ? "" : " is-shut"}`}>
                <i />
                {at.open
                  ? t(`At the pass until ${clockTime(at.closesAt)}`, `Ada di pass sampai ${clockTime(at.closesAt)}`)
                  : t(`Kitchen closed, opens ${nextOpen}`, `Dapur tutup, buka ${nextOpen}`)}
              </span>
            ) : (
              <span className="chat__state"><i /> {t("answers now", "siap menjawab")} · {STAFF.name} {t("reads the board", "ikut memantau")}</span>
            )}
          </div>
          <button className="chat__x" onClick={app.closeChat} aria-label={t("Close the chat", "Tutup obrolan")}>
            <Ico name="close" />
          </button>
        </header>

        <div className="chat__body" ref={body}>
          <div className="chat__log" aria-live="polite">
            {msgs.map(m => <Bubble key={m.id} m={m} app={app} asks={m === last} />)}
            {ui.chatTyping && (
              <div className="chat__msg chat__msg--bot">
                <div className="chat__bubble chat__bubble--typing" aria-label={t("The assistant is typing", "Asisten sedang mengetik")}>
                  <i /><i /><i />
                </div>
              </div>
            )}
            {waiting && (
              <p className="chat__wait">
                <i />
                {at.open
                  ? t(`Sent ${clockTime(last.at)}, waiting for ${STAFF.name} to reply`, `Terkirim ${clockTime(last.at)}, menunggu ${STAFF.name} balas`)
                  : t(`Saved on the board, the kitchen opens ${nextOpen}`, `Tersimpan di papan, dapur buka ${nextOpen}`)}
              </p>
            )}
          </div>

          {!asked && (
            <div className="chat__quick">
              {chef
                ? CHEF_QUICK.map(([en, id]) => <button key={en} onClick={() => send(en, id)}>{t(en, id)}</button>)
                : QUICK.map(([id, q]) => <button key={id} onClick={() => send(q, chipId(q, app.data.menu))}>{chipLabel(q, t, app.data.menu)}</button>)}
            </div>
          )}
        </div>

        <footer className="chat__foot">
          <form
            className="chat__form"
            onSubmit={e => { e.preventDefault(); send(draft); }}
          >
            <input
              ref={input}
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={chef
                ? t(`Message ${STAFF.name}…`, `Pesan untuk ${STAFF.name}…`)
                : t("Dish, allergen, price, hours…", "Hidangan, alergen, harga, jam buka…")}
              autoComplete="off"
              aria-label={chef ? t("Message the chef", "Kirim pesan ke chef") : t("Message the assistant", "Kirim pesan ke asisten")}
            />
            <button className="chat__send" type="submit" disabled={!draft.trim()} aria-label={t("Send message", "Kirim")}>
              <Ico name="send" />
            </button>
          </form>
          <p className="chat__note">
            {chef
              ? t(`${STAFF.name} answers between services, nothing is written for them here.`, `${STAFF.name} balas di sela jam masak, tidak ada yang ditulis otomatis untuknya di sini.`)
              : t("It reads the live menu, nothing here touches your basket.", "Ia membaca menu langsung, semuanya di sini tidak mengubah keranjangmu.")}
            <button className="chat__back" onClick={() => app.setChatMode(chef ? "bot" : "chef")}>
              {chef ? t("Back to the assistant", "Kembali ke asisten") : t(`Ask ${STAFF.name} directly`, `Tanya ${STAFF.name} langsung`)}
            </button>
          </p>
        </footer>
      </section>
    </>
  );
}
