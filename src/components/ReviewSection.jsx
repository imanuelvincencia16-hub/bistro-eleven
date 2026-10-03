import { useApp } from "../lib/store.jsx";
import { initial, safeAvatar, shortDate } from "../lib/format.js";
import Ico from "../lib/icons.jsx";
import Stars from "./Stars.jsx";
import ReviewForm from "./modals/ReviewForm.jsx";

export default function ReviewSection() {
  const app = useApp();
  const { t } = app;
  const live = app.data.reviews.filter(r => !r.hidden);
  const avg = live.length ? live.reduce((t, r) => t + r.stars, 0) / live.length : 0;

  return (
    <section className="reviews" id="reviews">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <span className="eyebrow reveal" data-reveal><i className="eyebrow__dot" /> {t("Guest book", "Buku tamu")}</span>
            <h2 className="reveal" data-reveal>{t("What people said", "Kata mereka")}</h2>
          </div>
          <div className="rating-summary reveal" data-reveal>
            <strong>{avg.toFixed(1)}</strong>
            <div>
              <Stars value={avg} />
              <small>{t(`${live.length} ${live.length === 1 ? "review" : "reviews"} · last 30 days`, `${live.length} ulasan · 30 hari terakhir`)}</small>
            </div>
          </div>
        </header>

        <div className="review-grid">
          {live.slice(0, 8).map((r, i) => {
            const pic = safeAvatar(app.findAccount(r.email)?.avatar);
            const plate = app.data.menu.find(m => m.name === r.dish);
            return (
              <article className="review" key={r.id || `rv-${i}`} data-reveal>
                <div className="review__head">
                  <span className="avatar">{pic ? <img src={pic} alt="" /> : initial(r.name)}</span>
                  <span className="review__who">
                    <b>{r.name}</b>
                    <span>{shortDate(r.date)}</span>
                  </span>
                  <Stars value={r.stars} />
                </div>
                <p className="review__body">{`“${t(r.text, r.text_id)}”`}</p>
                {r.dish && <span className="review__dish">{t(`ordered · ${r.dish}`, `pesanan · ${t(r.dish, plate?.name_id)}`)}</span>}
              </article>
            );
          })}
        </div>

        <div className="reviews__cta reveal" data-reveal>
          <p>{t("Been by the table? Tell the kitchen how it went.", "Mampir dan makan di sini? Kabari dapur bagaimana rasanya.")}</p>
          <button className="btn btn--primary"
                  onClick={() => {
                    if (app.asCustomer(t("Sign in to leave a review, we keep them tied to your account.", "Masuk dulu untuk menulis ulasan, ulasanmu tersimpan di akunmu."))) {
                      app.openModal(<ReviewForm />);
                    }
                  }}>
            <Ico name="pen" /> {t("Write a review", "Tulis ulasan")}
          </button>
        </div>
      </div>
    </section>
  );
}
