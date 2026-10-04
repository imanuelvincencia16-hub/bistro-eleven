import { useState } from "react";
import { useApp } from "../lib/store.jsx";
import { badEmail } from "../lib/format.js";
import { STAFF } from "../data/biz.js";
import { AMBIENCE, BANNER, pic } from "../data/photos.js";
import Photo from "../components/Photo.jsx";
import DeviceMove from "../components/modals/DeviceMove.jsx";

const TABS = [["in", "Sign in", "Masuk"], ["up", "Create account", "Buat akun"], ["staff", "Kitchen staff", "Staf dapur"]];

const POINTS = [
  ["🧺", "Build an order", "Susun pesanan", "Add plates, change quantities, check out in one flow.", "Tambah hidangan, ubah jumlah, checkout dalam satu alur."],
  ["❤️", "Save what you love", "Simpan yang kamu suka", "The heart keeps dishes on your own list.", "Ikon hati menyimpan hidangan ke daftar kamu."],
  ["🧾", "Follow the ticket", "Pantau tiket", "Live cooking stages, then an itemised bill.", "Tahap memasak langsung, lalu rincian tagihan."],
  ["⭐", "Review the table", "Beri ulasan", "Your notes land straight on the chef’s board.", "Catatan kamu langsung muncul di papan chef."]
];

function fieldErr(k, err) { return `field${err[k] ? " err" : ""}`; }

export default function LoginPage() {
  const app = useApp();
  const { ui, patchUi, data, findAccount, beginSession, createAccount, toast, t } = app;

  const [in_, setIn] = useState({ email: "", pass: "" });
  const [up, setUp] = useState({ name: "", email: "", pass: "", phone: "", addr: "" });
  const [sf, setSf] = useState({ user: "", pass: "" });
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState({});

  const tab = ui.authTab;
  const setTab = t => { setErr({}); setMsg({}); patchUi({ authTab: t }); };

  /* ── customer sign in ── */
  const doSignIn = e => {
    e.preventDefault();
    const email = in_.email.trim(), acc = findAccount(email);
    const okMail = !badEmail(email);
    const wrongPass = okMail && !!acc && acc.pass !== in_.pass;
    setErr({ inEmail: !okMail, inPass: okMail && wrongPass });
    setMsg({ inEmail: okMail ? "" : t("That doesn’t look like an email address.", "Sepertinya ini bukan alamat email.") });
    if (!okMail) return;
    if (!acc) {
      setUp(s => ({ ...s, email }));
      setTab("up");
      toast(t("No account uses that email yet, create one.", "Belum ada akun dengan email itu, buat dulu ya."), "📝");
      return;
    }
    if (wrongPass) { setErr({ inEmail: false, inPass: true }); setMsg({ inPass: t("That password doesn’t match this account.", "Kata sandinya tidak cocok dengan akun ini.") }); return; }
    beginSession("user", acc.email);
    toast(t("Welcome back, ", "Selamat datang kembali, ") + acc.name.split(" ")[0], "🍽️");
  };

  /* ── customer sign up ── */
  const doSignUp = e => {
    e.preventDefault();
    const name = up.name.trim(), email = up.email.trim(), pass = up.pass;
    const taken = !badEmail(email) && findAccount(email);
    const okName = name.length >= 2, okMail = !badEmail(email) && !taken, okPass = pass.length >= 6;
    setErr({ upName: !okName, upEmail: !okMail, upPass: !okPass });
    if (!(okName && okMail && okPass)) {
      setMsg({ upPass: taken ? t("That email already has an account, sign in instead.", "Email ini sudah punya akun, silakan masuk saja.")
        : t("Check your name, a valid email and a password of 6 or more characters.", "Periksa namamu, email yang valid, dan kata sandi minimal 6 karakter.") });
      return;
    }
    createAccount({ name, email, pass, phone: up.phone.trim(), address: up.addr.trim(), avatar: "" });
    beginSession("user", email);
    toast(t("Account created, welcome to Bistro Eleven, ", "Akun dibuat, selamat datang di Bistro Eleven, ") + name.split(" ")[0], "🎉");
  };

  /* ── kitchen sign in ── */
  const doStaff = e => {
    e.preventDefault();
    const ok = sf.user.trim().toLowerCase() === STAFF.user && sf.pass === STAFF.pass;
    setErr({ sfUser: !ok, sfPass: !ok });
    if (!ok) { setMsg({ sfPass: t("Those credentials don’t match the kitchen.", "Kredensial itu tidak cocok dengan dapur.") }); return; }
    beginSession("staff", STAFF.user);
    toast(t("Chef console open, signed in as ", "Konsol chef terbuka, masuk sebagai ") + STAFF.name, "👨‍🍳");
  };

  const fillDemo = () => {
    const a = data.accounts[0];
    if (!a) return;
    setIn({ email: a.email, pass: a.pass });
    setErr({}); setMsg({});
    toast(t("Demo details filled in, press Sign in.", "Detail demo terisi, tekan Masuk."), "✨");
  };

  return (
    <section className="auth">
      <div className="wrap auth__grid">

        <aside className="auth__side">
          <span className="eyebrow"><i className="eyebrow__dot" /> {t("Welcome back", "Selamat datang")}</span>
          <h2>{t("Eleven seats.", "Sebelas kursi.")}<br /><em>{t("One ticket at a time.", "Satu tiket dalam satu waktu.")}</em></h2>
          <p>{t("An account keeps your order, your saved plates and every ticket you have fired in one place, and it lets the kitchen know who is calling.", "Satu akun menyimpan pesananmu, hidangan favoritmu, dan semua tiket yang kamu kirim di satu tempat. Dapur juga jadi tahu siapa yang memesan.")}</p>
          <ul className="auth__points">
            {POINTS.map(([ico, b, bId, s, sId]) => (
              <li key={b}><span>{ico}</span><div><b>{t(b, bId)}</b><small>{t(s, sId)}</small></div></li>
            ))}
          </ul>
          <figure className="auth__shot">
            <Photo src={pic(AMBIENCE.room, ...BANNER)} alt={t("The dining room at Bistro Eleven", "Ruang makan Bistro Eleven")} cat="Mains" />
          </figure>
        </aside>

        <div className="auth__panel">
          <div className="auth__tabs" role="tablist">
            {TABS.map(([k, label, labelId]) => (
              <button key={k} type="button" className={tab === k ? "is-on" : ""} onClick={() => setTab(k)}>{t(label, labelId)}</button>
            ))}
          </div>

          {!!ui.authReason && <p className="auth__note">{ui.authReason}</p>}

          {tab === "in" && (
            <form className="auth__form" onSubmit={doSignIn} noValidate>
              <div className={fieldErr("inEmail", err)}>
                <label htmlFor="in-email">{t("Email", "Email")}</label>
                <input id="in-email" type="email" value={in_.email} placeholder="you@example.com"
                       autoComplete="email" onChange={e => setIn(s => ({ ...s, email: e.target.value }))} />
                <span className="field__err">{msg.inEmail || t("Check your email and password.", "Periksa email dan kata sandimu.")}</span>
              </div>
              <div className={fieldErr("inPass", err)}>
                <label htmlFor="in-pass">{t("Password", "Kata sandi")}</label>
                <input id="in-pass" type="password" value={in_.pass} placeholder={t("Your password", "Kata sandimu")}
                       autoComplete="current-password" onChange={e => setIn(s => ({ ...s, pass: e.target.value }))} />
                <span className="field__err">{msg.inPass || t("Check your email and password.", "Periksa email dan kata sandimu.")}</span>
              </div>
              <button className="btn btn--primary btn--block" type="submit">{t("Sign in", "Masuk")}</button>
              <button className="text-btn" type="button" onClick={fillDemo}>{t("Use the demo account", "Pakai akun demo")}</button>
            </form>
          )}

          {tab === "up" && (
            <form className="auth__form" onSubmit={doSignUp} noValidate>
              <div className={fieldErr("upName", err)}>
                <label htmlFor="up-name">{t("Full name", "Nama lengkap")}</label>
                <input id="up-name" value={up.name} placeholder="Rania Putri" autoComplete="name"
                       onChange={e => setUp(s => ({ ...s, name: e.target.value }))} />
                <span className="field__err">{t("A name, please.", "Isi namamu dulu ya.")}</span>
              </div>
              <div className={fieldErr("upEmail", err)}>
                <label htmlFor="up-email">{t("Email", "Email")}</label>
                <input id="up-email" type="email" value={up.email} placeholder="you@example.com" autoComplete="email"
                       onChange={e => setUp(s => ({ ...s, email: e.target.value }))} />
                <span className="field__err">{t("A valid email that isn’t registered yet.", "Email yang valid dan belum terdaftar.")}</span>
              </div>
              <div className={fieldErr("upPass", err)}>
                <label htmlFor="up-pass">{t("Password", "Kata sandi")}</label>
                <input id="up-pass" type="password" value={up.pass} placeholder={t("At least 6 characters", "Minimal 6 karakter")}
                       autoComplete="new-password" onChange={e => setUp(s => ({ ...s, pass: e.target.value }))} />
                <span className="field__err">{t("Pick a password with 6 or more characters.", "Pilih kata sandi minimal 6 karakter.")}</span>
              </div>
              <div className="field">
                <label htmlFor="up-phone">{t("Phone", "Nomor HP")} <em>{t("optional", "opsional")}</em></label>
                <input id="up-phone" type="tel" value={up.phone} placeholder="0811 2233 4455" autoComplete="tel"
                       onChange={e => setUp(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="up-addr">{t("Delivery address", "Alamat pengiriman")} <em>{t("optional", "opsional")}</em></label>
                <input id="up-addr" value={up.addr} placeholder={t("Street, no., city", "Jalan, nomor, kota")} autoComplete="street-address"
                       onChange={e => setUp(s => ({ ...s, addr: e.target.value }))} />
              </div>
              <button className="btn btn--primary btn--block" type="submit">{t("Create account & sign in", "Buat akun & masuk")}</button>
            </form>
          )}

          {tab === "staff" && (
            <form className="auth__form" onSubmit={doStaff} noValidate>
              <div className={fieldErr("sfUser", err)}>
                <label htmlFor="sf-user">{t("Staff username", "Nama pengguna staf")}</label>
                <input id="sf-user" value={sf.user} placeholder="chef" autoComplete="username"
                       onChange={e => setSf(s => ({ ...s, user: e.target.value }))} />
              </div>
              <div className={fieldErr("sfPass", err)}>
                <label htmlFor="sf-pass">{t("Password", "Kata sandi")}</label>
                <input id="sf-pass" type="password" value={sf.pass} placeholder={t("Kitchen password", "Kata sandi dapur")}
                       autoComplete="current-password" onChange={e => setSf(s => ({ ...s, pass: e.target.value }))} />
                <span className="field__err">{msg.sfPass || t("Those credentials don’t match the kitchen.", "Kredensial itu tidak cocok dengan dapur.")}</span>
              </div>
              <button className="btn btn--primary btn--block" type="submit">{t("Open the service board", "Buka papan layanan")}</button>
              <p className="auth__hint">{t("Demo kitchen login, user", "Login dapur demo, pengguna")} <b>{STAFF.user}</b> · {t("password", "kata sandi")} <b>{STAFF.pass}</b>.
                {t("Change it in", "Ubah di")} <code>src/data/biz.js</code>.</p>
            </form>
          )}

          {tab === "staff" && (
            <p className="auth__back">
              <button className="text-btn" type="button" onClick={() => app.openModal(<DeviceMove />, "modal--slim")}>
                {t("Bring my data from another device", "Bawa datamu dari perangkat lain")}
              </button>
            </p>
          )}

          <p className="auth__back">
            <button className="text-btn" type="button" onClick={app.leaveAuth}>{t("Keep browsing without an account", "Lanjut lihat-lihat tanpa akun")}</button>
          </p>
        </div>

      </div>
    </section>
  );
}
