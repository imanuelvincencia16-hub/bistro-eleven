import { useApp } from "../lib/store.jsx";
import { HOURS_ID, PAY_ID } from "../lib/i18n.js";
import Ico from "../lib/icons.jsx";
import { BIZ } from "../data/biz.js";
import AccountPanel from "./modals/AccountPanel.jsx";

const NAV = [["menu", "Full menu", "Menu lengkap"], ["story", "Our story", "Kisah kami"],
  ["gallery", "From the pass", "Dari dapur"], ["reviews", "Guest book", "Buku tamu"],
  ["visit", "Visit us", "Kunjungi kami"]];

const SOCIALS = [
  ["ig", "Instagram", BIZ.socials.instagram, "@" + BIZ.socials.instagram.split("/").pop()],
  ["fb", "Facebook", BIZ.socials.facebook, "Bistro Eleven"],
  ["xs", "X", BIZ.socials.x, "@" + BIZ.socials.x.split("/").pop()],
  ["tt", "TikTok", BIZ.socials.tiktok, "@" + BIZ.socials.tiktok.split("/").pop()]
];

export default function Footer() {
  const app = useApp();
  const { t } = app;
  const openAccount = () => {
    if (app.me) app.openModal(<AccountPanel tab="profile" />, "modal--wide");
    else app.showAuth(t("Sign in to open your account.", "Masuk untuk membuka akunmu."));
  };

  return (
    <footer className="ftr">
      <div className="wrap ftr__main">

        <div className="ftr__brand">
          <a className="brand" href="#top" onClick={e => { e.preventDefault(); app.goSection("top"); }}>
            <span className="brand__mark">XI</span>
            <span className="brand__text"><strong>Bistro Eleven</strong></span>
          </a>
          <p className="ftr__tag">{t(BIZ.tagline, "Dapur tetangga dengan sebelas kursi dan tanpa jalan pintas.")}</p>
          <h6>{t("Follow the kitchen", "Ikuti dapur kami")}</h6>
          <div className="ftr__social">
            {SOCIALS.map(([ico, label, href, handle]) => (
              <a key={ico} href={href} target="_blank" rel="noopener" title={handle} aria-label={label}>
                <Ico name={ico} />
              </a>
            ))}
          </div>
        </div>

        <nav className="ftr__col">
          <h5>{t("Explore", "Jelajahi")}</h5>
          {NAV.map(([id, label, idn]) => (
            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); app.goSection(id); }}>{t(label, idn)}</a>
          ))}
          <button className="link-btn" onClick={openAccount}>{t("Account settings", "Pengaturan akun")}</button>
        </nav>

        <div className="ftr__col">
          <h5>{t("Talk to us", "Hubungi kami")}</h5>
          <div className="ftr__rows">
            <div className="ftr__row">
              <Ico name="mail" />
              <div><b>Email</b><a href={`mailto:${BIZ.email}`}>{BIZ.email}</a><small>{t("Replies within a day", "Kami balas dalam sehari")}</small></div>
            </div>
            <div className="ftr__row">
              <Ico name="tel" />
              <div><b>{t("Phone", "Telepon")}</b><a href={`tel:${BIZ.phoneTel}`}>{BIZ.phoneShow}</a><small>{t("Reservations and large orders", "Reservasi dan pesanan besar")}</small></div>
            </div>
            <div className="ftr__row">
              <Ico name="wa" />
              <div><b>WhatsApp</b><a href={`https://wa.me/${BIZ.wa}`} target="_blank" rel="noopener">{t("Chat with the host", "Chat dengan host")}</a><small>{"+" + BIZ.wa}</small></div>
            </div>
          </div>
        </div>

        <div className="ftr__col">
          <h5>{t("Find us", "Temukan kami")}</h5>
          <div className="ftr__rows">
            <div className="ftr__row">
              <Ico name="pin" />
              <div>
                <b>{t("Address", "Alamat")}</b>
                {BIZ.street[0]}<br />
                {BIZ.street[1]}
                <small><a href={BIZ.mapQuery} target="_blank" rel="noopener">{t("Open in Google Maps", "Buka di Google Maps")}</a></small>
              </div>
            </div>
            <div className="ftr__row">
              <Ico name="dir" />
              <div><b>{t("Getting here", "Cara ke sini")}</b>{t("Arrival station, 4 min walk", "Stasiun Arrival, 4 menit jalan")}<small>{t("Riverside car park, lane B", "Parkir Riverside, lajur B")}</small></div>
            </div>
          </div>
        </div>

        <div className="ftr__col">
          <h5>{t("Kitchen hours", "Jam buka dapur")}</h5>
          <div className="ftr__rows ftr__rows--hours">
            {BIZ.hours.map(([day, time]) => <div key={day}><span>{t(day, HOURS_ID[day])}</span><b>{time}</b></div>)}
          </div>
          <small className="muted">{t("Last kitchen order 30 min before close.", "Pesanan dapur terakhir 30 menit sebelum tutup.")}</small>
        </div>

      </div>
      <div className="wrap ftr__bar">
        <small>{t(`© ${new Date().getFullYear()} ${BIZ.name} · All rights reserved · Made on Lantern Lane`, `© ${new Date().getFullYear()} ${BIZ.name} · Seluruh hak cipta dilindungi · Dibuat di Lantern Lane`)}</small>
        <div className="ftr__pay">
          {BIZ.payments.map(p => <span key={p}>{t(p, PAY_ID[p]?.[1])}</span>)}
        </div>
      </div>
    </footer>
  );
}
