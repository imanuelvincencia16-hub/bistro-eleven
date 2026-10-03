import { useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { uid } from "../../lib/format.js";
import Ico from "../../lib/icons.jsx";
import ModalHead from "../ModalHead.jsx";

export default function ReviewForm() {
  const app = useApp();
  const { t } = app;
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(app.me?.name || "");
  const [dish, setDish] = useState("");
  const [text, setText] = useState("");
  const [errs, setErrs] = useState({});

  const post = () => {
    const bad = { stars: !stars, name: name.trim().length < 2, text: text.trim().length < 12 };
    setErrs(bad);
    if (bad.stars || bad.name || bad.text) {
      app.toast(t("Still missing a star rating, name and a sentence", "Masih kurang penilaian bintang, nama, dan satu kalimat"), "⭐");
      return;
    }
    app.addReview({
      id: uid("R"), email: app.me?.email || "", name: name.trim(), stars,
      text: text.trim(), dish, date: new Date().toISOString().slice(0, 10), hidden: false
    });
    app.closeModal();
    app.toast(t("Review posted. Thank you, the kitchen will read it", "Ulasan terkirim. Terima kasih, dapur akan membacanya"), "⭐");
    app.goSection("reviews");
  };

  return (
    <>
      <ModalHead title={t("Tell the kitchen", "Kabari dapur")}
                 sub={t("Reviews go straight to the pass. Be honest, the chef reads them at midnight.", "Ulasan langsung sampai ke dapur. Jujur saja, chef membacanya lewat tengah malam.")} />
      <div className="modal__body">
        <div className={`field${errs.stars ? " err" : ""}`}>
          <label>{t("How was it?", "Bagaimana rasanya?")}</label>
          <div className="picker" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" className={i <= (hover || stars) ? "on" : ""}
                      aria-label={t(`${i} stars`, `${i} bintang`)}
                      onClick={() => { setStars(i); setErrs(e => ({ ...e, stars: false })); }}
                      onMouseEnter={() => setHover(i)}>
                <Ico name="star" />
              </button>
            ))}
          </div>
          <small className="field__err">{t("Pick a star count first.", "Pilih jumlah bintangnya dulu.")}</small>
        </div>

        <div className="row2">
          <div className={`field${errs.name ? " err" : ""}`}>
            <label htmlFor="rv-name">{t("Your name", "Namamu")}</label>
            <input id="rv-name" value={name} placeholder={t("How the table knows you", "Nama untuk di ulasan")} autoFocus
                   onChange={e => { setName(e.target.value); setErrs(x => ({ ...x, name: false })); }} />
            <small className="field__err">{t("A name, please.", "Nama dulu, ya.")}</small>
          </div>
          <div className="field">
            <label htmlFor="rv-dish">{t("What did you order?", "Kamu pesan apa?")}</label>
            <select id="rv-dish" value={dish} onChange={e => setDish(e.target.value)}>
              <option value="">{t("Just the room", "Cuma mampir")}</option>
              {app.onSale.map(d => <option key={d.id} value={d.name}>{t(d.name, d.name_id)}</option>)}
            </select>
          </div>
        </div>

        <div className={`field${errs.text ? " err" : ""}`}>
          <label htmlFor="rv-text">{t("Your review", "Ulasanmu")}</label>
          <textarea id="rv-text" value={text} placeholder={t("The food, the noise, the wait, all of it helps.", "Makanannya, suasananya, tungguannya, semuanya membantu.")}
                    onChange={e => { setText(e.target.value); setErrs(x => ({ ...x, text: false })); }} />
          <small className="field__err">{t("Give us at least a sentence (12 characters).", "Tulis minimal satu kalimat (12 karakter).")}</small>
        </div>
      </div>

      <div className="modal__foot">
        <button className="btn btn--ghost" onClick={app.closeModal}>{t("Not now", "Nanti saja")}</button>
        <button className="btn btn--primary" onClick={post}>{t("Post the review", "Kirim ulasan")}</button>
      </div>
    </>
  );
}
