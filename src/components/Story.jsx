import { useApp } from "../lib/store.jsx";
import { pic } from "../data/photos.js";
import Photo from "./Photo.jsx";

const SHOTS = [
  { cls: "shot shot--1", slug: "1414235077428-338989a2e8c0", w: 752, h: 768, alt: "Candlelit table being served at Bistro Eleven", alt_id: "Meja berlilin yang sedang dilayani di Bistro Eleven" },
  { cls: "shot shot--2", slug: "1543007630-9710e4a00a20", w: 504, h: 492, alt: "The amber-lit bar", alt_id: "Barnya yang bercahaya amber" },
  { cls: "shot shot--3", slug: "1442512595331-e89e73853f31", w: 408, h: 396, alt: "Barista pouring a slow brew", alt_id: "Barista menuang seduhan lambat" }
];

export default function Story() {
  const app = useApp();
  const { t } = app;
  return (
    <section className="story" id="story">
      <div className="wrap story__grid">
        <div className="story__media">
          {SHOTS.map(s => (
            <figure className={s.cls} key={s.slug}>
              <Photo src={pic(s.slug, s.w, s.h)} alt={t(s.alt, s.alt_id)} cat="Mains" />
            </figure>
          ))}
        </div>
        <div className="story__copy">
          <span className="eyebrow reveal" data-reveal><i className="eyebrow__dot" /> {t("Our story", "Kisah kami")}</span>
          <h2 className="reveal" data-reveal>{t("Eleven seats,", "Sebelas kursi,")}<br />{t("one very stubborn oven", "satu oven yang keras kepala")}</h2>
          <p className="reveal" data-reveal>{t("We opened in a narrow corner unit with eleven stools and a second-hand wood oven that leaked smoke for the first three weeks. Nobody left. Turns out people will wait for a thing that is actually being cooked.", "Kami buka di unit sudut yang sempit, dengan sebelas kursi dan oven kayu bekas yang berasap selama tiga minggu pertama. Ternyata tidak ada yang pergi. Orang mau menunggu makanan yang benar-benar dimasak.")}</p>
          <p className="reveal" data-reveal>{t("Everything still follows that rule. The bread is laminated before sunrise, the cordials are pressed by hand, and nothing on the board has been sitting since yesterday. When you order, the ticket prints on the pass and the clock starts.", "Semuanya masih memegang aturan itu. Roti dilipat sebelum matahari terbit, cordial diperas dengan tangan, dan tidak ada hidangan yang menunggu sejak kemarin. Saat kamu memesan, tiket tercetak di dapur dan waktunya mulai berjalan.")}</p>
          <ul className="story__list reveal" data-reveal>
            <li><b>{t("Sourced daily", "Dipasok setiap hari")}</b> {t("from four farms inside the province", "dari empat pertanian dalam provinsi ini")}</li>
            <li><b>{t("Cooked to order", "Dimasak sesuai pesanan")}</b>, {t("we close the kitchen at 22:30, not before", "dapur tutup jam 22.30, tidak lebih awal")}</li>
            <li><b>{t("Allergens listed", "Alergen dicantumkan")}</b> {t("on every dish, no exceptions", "di setiap hidangan, tanpa kecuali")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
