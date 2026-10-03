import { useEffect, useRef, useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { STAFF } from "../../data/biz.js";
import { initial, shortDate, clockTime } from "../../lib/format.js";
import Ico from "../../lib/icons.jsx";

const when = iso => {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? clockTime(d) : shortDate(d);
};

const LAST = (m, t) => (m
  ? m.from === "sys"
    ? t(m.text, m.text_id)
    : `${m.from === "guest" ? t("They ask: ", "Tamu tanya: ") : m.from === "chef" ? t("You said: ", "Kamu balas: ") : t("Assistant: ", "Asisten: ")}${t(m.text, m.text_id)}`
  : t("No messages yet", "Belum ada pesan"));

export default function ChatDesk() {
  const app = useApp();
  const threads = app.data.chats;
  const [pick, setPick] = useState(null);
  const [draft, setDraft] = useState("");
  const scroll = useRef(null);

  const t = threads.find(x => x.id === pick) || threads.find(x => x.id === app.chatId) || threads[0] || null;
  const unreadAll = threads.reduce((n, x) => n + (x.unread?.chef || 0), 0);

  useEffect(() => {
    if (t?.unread?.chef) app.readChat(t.id, "chef");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t?.id, t?.msgs.length]);

  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [t?.id, t?.msgs.length, draft]);

  const send = () => {
    if (!t || !draft.trim()) return;
    app.chefReply(t.id, draft);
    app.readChat(t.id, "chef");
    setDraft("");
  };

  if (!threads.length) {
    return (
      <div className="empty">
        <span>💬</span>
        <h4>{app.t("No conversations yet", "Belum ada percakapan")}</h4>
        <p>{app.t("The assistant answers guests instantly and every question is filed here for you. Open the guest site and try the bubble in the bottom-right corner.", "Asisten menjawab tamu dengan cepat, dan setiap pertanyaan tersimpan di sini untuk kamu. Buka situs tamu dan coba gelembung di pojok kanan bawah.")}</p>
        <button className="btn btn--ghost btn--sm" onClick={app.previewSite}><Ico name="eye" /> {app.t("View the guest site", "Lihat situs tamu")}</button>
      </div>
    );
  }

  return (
    <div className="cd">
      <div className="cd-list">
        {threads.map(x => {
          const last = x.msgs[x.msgs.length - 1];
          const mine = x.mode === "chef" && last?.from === "guest";
          return (
            <button key={x.id} type="button" className={`cd-row${t?.id === x.id ? " is-on" : ""}`}
                    onClick={() => { setPick(x.id); app.readChat(x.id, "chef"); }}>
              <span className="avatar" style={{ width: 40, height: 40 }}>{initial(x.name)}</span>
              <span className="cd-row__main">
                <b>{x.name || app.t("Guest", "Tamu")}{x.id === app.chatId && <small className="cd-live">{app.t("live", "langsung")}</small>}</b>
                {mine && <small className="cd-needs">{app.t("Needs your reply", "Butuh balasanmu")}</small>}
                <small>{LAST(last, app.t)}</small>
              </span>
              <span className="cd-row__side">
                <time>{when(x.updated || last?.at)}</time>
                {!!x.unread?.chef && <i>{x.unread.chef}</i>}
              </span>
            </button>
          );
        })}
        <button className="btn btn--ghost btn--sm cd-test" type="button" onClick={app.previewSite}>
          <Ico name="eye" /> {app.t("Test the chat as a new guest", "Uji chat sebagai tamu baru")}
        </button>
      </div>

      <div className="cd-pane">
        <header className="cd-pane__head">
          <div>
            <b>{t.name || app.t("Guest", "Tamu")}</b>
            <small>
              {t.email ? `${t.email} · ` : ""}{t.phone ? `${t.phone} · ` : ""}
              {t.msgs.length} {t.msgs.length === 1 ? app.t("message", "pesan") : app.t("messages", "pesan")}
              {t.mode === "chef" ? ` · ${app.t("asked to speak with you", "minta bicara dengan kamu")}` : ""}
            </small>
          </div>
          <div className="cd-pane__acts">
            {!!t.msgs.length && (
              <button className="da-btn" title={app.t("Clear this conversation", "Bersihkan percakapan ini")} aria-label={app.t("Clear this conversation", "Bersihkan percakapan ini")}
                      onClick={() => app.clearChat(t.id)}>
                <Ico name="trash" />
              </button>
            )}
          </div>
        </header>

        <div className="cd-scroll" ref={scroll}>
          {t.msgs.length ? t.msgs.map(m => (
            m.from === "sys"
              ? <p key={m.id} className="cd-sys">{app.t(m.text, m.text_id)}</p>
              : (
              <div key={m.id} className={`cd-msg${m.from === "chef" ? " cd-msg--you" : ""}${m.from === "bot" ? " cd-msg--bot" : ""}`}>
                <span className="cd-who">
                  {m.from === "chef" ? m.by || STAFF.name : m.from === "bot" ? app.t("assistant · auto", "asisten · otomatis") : t.name || app.t("Guest", "Tamu")}
                  <time>{when(m.at)}</time>
                </span>
                <div className="cd-bubble">{app.t(m.text, m.text_id)}</div>
              </div>
            )
          )) : (
            <p className="muted">{app.t("Nothing said yet. The assistant greets the guest when they open the panel, and their questions land here.", "Belum ada yang terucap. Asisten menyapa tamu saat mereka membuka panel, dan pertanyaan mereka muncul di sini.")}</p>
          )}
        </div>

        <form className="cd-foot" onSubmit={e => { e.preventDefault(); send(); }}>
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={app.t(`Reply to ${t.name || "the guest"} as ${STAFF.name}…`, `Balas ${t.name || "tamu"} sebagai ${STAFF.name}…`)}
            aria-label={app.t("Reply to the guest", "Balas tamu")}
            autoComplete="off"
          />
          <button className="btn btn--primary btn--sm" type="submit" disabled={!draft.trim()}>
            {app.t("Reply", "Balas")} <Ico name="send" />
          </button>
        </form>
        <p className="cd-note">
          {app.t("The assistant writes its own answers from the live menu; anything you send here appears in the guest's chat panel", "Asisten menulis jawabannya sendiri dari menu langsung; apa pun yang kamu kirim di sini muncul di panel chat tamu")}
          {unreadAll ? app.t(` · ${unreadAll} unread across the board`, ` · ${unreadAll} belum dibaca di papan`) : ""}.
        </p>
      </div>
    </div>
  );
}
