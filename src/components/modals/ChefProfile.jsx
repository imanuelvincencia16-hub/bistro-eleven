import { useApp } from "../../lib/store.jsx";
import { STAFF } from "../../data/biz.js";
import { initial, money } from "../../lib/format.js";
import ModalHead from "../ModalHead.jsx";

export default function ChefProfile() {
  const app = useApp();
  const { data, onSale, t } = app;
  const open = data.orders.filter(o => o.status !== "done").length;
  const booked = data.orders.reduce((n, o) => n + (o.status === "cancelled" ? 0 : o.totals.total), 0);
  const unread = data.chats.reduce((n, c) => n + (c.unread?.chef || 0), 0);

  const signOut = () => { app.closeModal(); app.endSession(); };

  return (
    <>
      <ModalHead title={t("Chef profile", "Profil chef")}
                 sub={t("This tab holds the pass. Everything on it is yours to run.", "Tab ini memegang pass. Semuanya bisa kamu jalankan dari sini.")} />
      <div className="modal__body">
        <div className="acc__top">
          <div className="acc__pic"><span className="avatar">{initial(STAFF.name)}</span></div>
          <div className="acc__who">
            <b>{STAFF.name}</b>
            <span>{t(STAFF.title, "Manajer dapur")} · {t(`signed in as ${STAFF.user}`, `masuk sebagai ${STAFF.user}`)}</span>
          </div>
          <button type="button" className="link-btn acc__out" onClick={signOut}>{t("Sign out", "Keluar")}</button>
        </div>

        <div className="bill__sum">
          <div><span>{t("Open tickets", "Tiket aktif")}</span><b>{open}</b></div>
          <div><span>{t("Revenue booked", "Pendapatan tercatat")}</span><b>{money(booked)}</b></div>
          <div><span>{t("Guest chats", "Obrolan tamu")}</span><b>{unread ? t(`${unread} unread`, `${unread} belum dibaca`) : t("all read", "sudah dibaca semua")}</b></div>
          <div><span>{t("Dishes on the board", "Hidangan di papan")}</span><b>{onSale.length}</b></div>
        </div>
      </div>

      <div className="modal__foot">
        <button type="button" className="btn btn--primary" onClick={app.closeModal}>{t("Back to the board", "Kembali ke papan")}</button>
      </div>
    </>
  );
}
