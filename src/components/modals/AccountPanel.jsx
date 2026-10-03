import { useEffect, useRef, useState } from "react";
import Ico from "../../lib/icons.jsx";
import ModalHead from "../ModalHead.jsx";
import Photo from "../Photo.jsx";
import { useApp } from "../../lib/store.jsx";
import { ORDER_TYPE_ID, STATUS_ID } from "../../lib/i18n.js";
import { initial, money, okEmail, plural, readAndShrink, safeAvatar, shortDate } from "../../lib/format.js";
import { STATUS_LABEL } from "../../data/menu.js";
import { thumbPic } from "../../data/photos.js";
import Bill from "./Bill.jsx";
import TrackOrder from "./TrackOrder.jsx";

const TABS = [["profile", "Profile", "Profil"], ["orders", "Orders", "Pesanan"], ["saved", "Saved", "Tersimpan"]];

export default function AccountPanel({ tab = "profile" }) {
  const app = useApp();
  const { me, data, myOrders, findAccount, t } = app;
  const fileRef = useRef(null);
  const [pane, setPane] = useState(tab);
  const [err, setErr] = useState({});
  const [form, setForm] = useState(() => ({
    name: me?.name || "", email: me?.email || "", phone: me?.phone || "", address: me?.address || ""
  }));

  useEffect(() => {
    if (!me) app.closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!me) return null;

  const avatar = safeAvatar(me.avatar);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clash = form.email && form.email.toLowerCase() !== me.email.toLowerCase() && findAccount(form.email);

  const saveProfile = () => {
    const okName = form.name.trim().length >= 2;
    const okMail = !form.email || (!clash && okEmail(form.email));
    const okPhone = !form.phone || form.phone.replace(/\D/g, "").length >= 7;
    setErr({ name: !okName, email: !okMail, phone: !okPhone, addr: false });
    if (!okName || !okMail || !okPhone) {
      app.toast(t(clash ? "Another account already uses that email" : "Check the highlighted fields",
                  clash ? "Email itu sudah dipakai akun lain" : "Coba cek lagi isian yang ditandai"), clash ? "🔒" : "✍️");
      return;
    }
    app.updateMe({
      name: form.name.trim(), email: form.email.trim() || me.email,
      phone: form.phone.trim(), address: form.address.trim()
    });
    app.closeModal();
    app.toast(t(`Saved. Welcome back, ${form.name.trim().split(" ")[0]}`, `Tersimpan. Selamat datang kembali, ${form.name.trim().split(" ")[0]}`), "👤");
  };

  const pickPhoto = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await readAndShrink(file, 220);
      app.updateMe({ avatar: url });
      app.toast(t("Profile photo updated", "Foto profil diperbarui"), "📸");
    } catch {
      app.toast(t("Couldn't read that image", "Gambar itu gagal dibaca"), "⚠️");
    }
  };

  const savedDishes = data.wish.map(id => data.menu.find(d => d.id === id)).filter(Boolean);

  return (
    <>
      <ModalHead title={t("Account settings", "Pengaturan akun")} />
      <div className="modal__body">
        <div className="acc__top">
          <div className="acc__pic">
            <span className="avatar">{avatar ? <img src={avatar} alt="" /> : initial(me.name)}</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} aria-label={t("Choose a profile photo", "Pilih foto profil")} />
            <button type="button" aria-label={t("Change photo", "Ganti foto")} onClick={() => fileRef.current?.click()}>
              <Ico name="pen" />
            </button>
          </div>
          <div className="acc__who">
            <b>{me.name}</b>
            <span>{me.email || t("no email yet", "belum ada email")} · {t(plural(data.wish.length, "saved dish"), `${data.wish.length} hidangan tersimpan`)}</span>
          </div>
          <button type="button" className="link-btn acc__out"
                  onClick={() => { app.closeModal(); app.endSession(); }}>{t("Sign out", "Keluar")}</button>
        </div>

        <div className="acc__tabs" role="tablist">
          {TABS.map(([k, label, labelId]) => (
            <button key={k} type="button" className={pane === k ? "is-on" : ""}
                    aria-selected={pane === k} onClick={() => setPane(k)}>{t(label, labelId)}</button>
          ))}
        </div>

        {pane === "profile" && (
          <>
            <div className={`field${err.name ? " err" : ""}`}>
              <label htmlFor="ac-name">{t("Full name", "Nama lengkap")}</label>
              <input id="ac-name" value={form.name} onChange={e => set("name", e.target.value)} placeholder={t("Your name", "Nama kamu")} />
              <small className="field__err">{t("Name is required.", "Nama wajib diisi.")}</small>
            </div>
            <div className="row2">
              <div className={`field${err.email ? " err" : ""}`}>
                <label htmlFor="ac-email">{t("Email", "Email")}</label>
                <input id="ac-email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
                <small className="field__err">{t(clash ? "That email belongs to another account." : "Check that email.", clash ? "Email itu sudah punya akun lain." : "Cek lagi email-nya.")}</small>
              </div>
              <div className={`field${err.phone ? " err" : ""}`}>
                <label htmlFor="ac-phone">{t("Phone", "Nomor HP")}</label>
                <input id="ac-phone" inputMode="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder={t("+1 555 000 0000", "+62 811 2233 4455")} />
                <small className="field__err">{t("At least 7 digits.", "Minimal 7 angka.")}</small>
              </div>
            </div>
            <div className="field">
              <label htmlFor="ac-addr">{t("Delivery address", "Alamat antar")}</label>
              <textarea id="ac-addr" rows="2" value={form.address} onChange={e => set("address", e.target.value)} placeholder={t("Street, unit, postcode", "Nama jalan, nomor rumah, kode pos")} />
            </div>
          </>
        )}

        {pane === "orders" && (myOrders.length ? (
          <>{myOrders.map(o => {
            const first = data.menu.find(d => d.id === o.items[0]?.id);
            const qty = o.items.reduce((n, i) => n + i.qty, 0);
            return (
              <div className="mini-order" key={o.id}>
                <Photo src={first?.imgs?.[0] ? thumbPic(first.imgs[0]) : ""} alt={first ? t(first.name, first.name_id) : o.id} cat={first?.cat} />
                <div>
                  <b>{o.id} · {t(o.type, ORDER_TYPE_ID[o.type])}</b>
                  <small>{t(plural(qty, "item"), `${qty} barang`)} · {shortDate(o.created)}</small>
                  <div className="mini-order__acts">
                    <button type="button" className="text-btn"
                            onClick={() => app.openModal(<Bill order={o} />, "modal--slim")}>{t("Bill", "Struk")}</button>
                    {o.type === "delivery" && (
                      <button type="button" className="text-btn"
                              onClick={() => app.openModal(<TrackOrder orderId={o.id} />)}>{t("Track the rider", "Lacak kurir")}</button>
                    )}
                  </div>
                </div>
                <span className={`pill pill--${o.status}`}>{t(STATUS_LABEL[o.status] || o.status, STATUS_ID[o.status])}</span>
              </div>
            );
          })}</>
        ) : <p className="muted">{t("No orders yet. The first ticket is waiting.", "Belum ada pesanan. Tiket pertama masih menunggu.")}</p>)}

        {pane === "saved" && (savedDishes.length ? (
          <>
            <div className="co-list">
              {savedDishes.map(d => <div key={d.id}><span>{t(d.name, d.name_id)}</span><b>{money(d.price)}</b></div>)}
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={app.clearWish}>{t("Clear wishlist", "Kosongkan wishlist")}</button>
          </>
        ) : <p className="muted">{t("Tap the ♥ on any dish and it lands here.", "Ketuk ♥ di hidangan mana pun, nanti muncul di sini.")}</p>)}
      </div>

      {pane === "profile" && (
        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={app.closeModal}>{t("Cancel", "Batal")}</button>
          <button className="btn btn--primary" onClick={saveProfile}>{t("Save changes", "Simpan perubahan")}</button>
        </div>
      )}
    </>
  );
}
