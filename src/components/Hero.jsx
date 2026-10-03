import { useApp } from "../lib/store.jsx";
import Ico from "../lib/icons.jsx";
import { pic } from "../data/photos.js";
import Photo from "./Photo.jsx";

const PLATES = [
  { cls: "float-card float-card--a", slug: "1504674900247-0877df9cc836", w: 618, h: 672,
    alt: ["Three plates of grilled seasonal mains", "Tiga piring hidangan panggang musiman"],
    name: ["Beef Tasting Trio", "Trio Cicip Daging Sapi"], tag: ["Chef’s pick", "Pilihan chef"] },
  { cls: "float-card float-card--b", slug: "1568901346375-23c9450c58cd", w: 444, h: 425,
    alt: ["Signature cheeseburger", "Burger keju andalan"],
    name: ["Eleven Burger", "Cheeseburger Sebelas"], tag: ["1.2k saved", "1,2 rb disimpan"] },
  { cls: "float-card float-card--c", slug: "1578985545062-69928b1d9587", w: 390, h: 347,
    alt: ["Dark chocolate drip cake", "Kue cokelat leleh"],
    name: ["Drip Cake", "Kue Cokelat Hitam Tetes"], tag: ["Bakery", "Roti & Kue"] }
];

export default function Hero() {
  const { t, goSection } = useApp();

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__copy">
          <span className="eyebrow reveal" data-reveal>
            <i className="eyebrow__dot" /> {t("Now taking orders · Open till 23:00", "Pesanan dibuka · Buka sampai 23.00")}
          </span>
          <h1 className="reveal" data-reveal>
            {t("Seasonal plates", "Piring musiman")}<br /><em>{t("& slow evenings", "& malam yang santai")}</em>
          </h1>
          <p className="lede reveal" data-reveal>
            {t(
              "Wood-fired mains, a bakery that starts at 4am, and small-batch drinks, served in a room that smells like butter and toasted coffee. Build your order, save what you love, and watch it come to life.",
              "Hidangan utama dari tungku kayu, roti yang mulai dipanggang jam 4 pagi, dan minuman edisi kecil, disajikan di ruangan yang beraroma mentega dan kopi sangrai. Susun pesananmu, simpan yang kamu suka, dan lihat semuanya dikerjakan."
            )}
          </p>
          <div className="hero__cta reveal" data-reveal>
            <a className="btn btn--primary" href="#menu"
               onClick={e => { e.preventDefault(); goSection("menu"); }}>
              {t("Explore the menu", "Lihat menu")}
              <Ico name="arrow" />
            </a>
          </div>
          <dl className="hero__stats reveal" data-reveal>
            <div><dt>25</dt><dd>{t("dishes daily", "hidangan tiap hari")}</dd></div>
            <div><dt>4.8</dt><dd>{t("guest rating", "nilai tamu")}</dd></div>
            <div><dt>22<span>{t("min", "mnt")}</span></dt><dd>{t("avg. to door", "rata-rata antar")}</dd></div>
          </dl>
        </div>

        <div className="hero__plates">
          {PLATES.map(p => (
            <figure className={p.cls} key={p.slug}>
              <Photo src={pic(p.slug, p.w, p.h)} alt={t(...p.alt)} cat="Mains" eager />
              <figcaption><b>{t(...p.name)}</b><span>{t(...p.tag)}</span></figcaption>
            </figure>
          ))}
          <div className="hero__ring" aria-hidden="true" />
        </div>
      </div>

      <a className="scroll-cue" href="#pillars" aria-label={t("Scroll down", "Gulir ke bawah")}
         onClick={e => { e.preventDefault(); goSection("pillars"); }}>
        <span />
        <em>{t("scroll, today’s board is below", "gulir, menu hari ini ada di bawah")}</em>
      </a>
    </section>
  );
}
