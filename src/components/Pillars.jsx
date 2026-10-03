import { useApp } from "../lib/store.jsx";

export default function Pillars() {
  const app = useApp();
  const { t } = app;

  return (
    <section className="pillars" id="pillars">
      <div className="wrap">
        <div className="pillar-grid">
          <article className="pillar reveal" data-reveal>
            <span className="pillar__ico">🔥</span>
            <h3>{t("Wood-Fired Mains", "Hidangan Utama Panggang Kayu")}</h3>
            <p>{t("Slow-grilled over oak and vine. Cooked to order, never held under a lamp.",
              "Dipanggang lambat di atas kayu oak dan kayu anggur. Dimasak saat dipesan, tidak pernah dihangatkan di bawah lampu.")}</p>
            <button className="link-btn" onClick={() => app.jumpCat("Mains")}>{t("Browse mains →", "Lihat hidangan utama →")}</button>
          </article>
          <article className="pillar reveal" data-reveal>
            <span className="pillar__ico">🥐</span>
            <h3>{t("Fresh Bakery", "Bakery Segar")}</h3>
            <p>{t("Laminated at 4am, out of the oven by seven. Butter, salt, time, that's all.",
              "Dilaminasi pukul empat pagi, keluar oven sebelum tujuh. Mentega, garam, waktu, itu saja.")}</p>
            <button className="link-btn" onClick={() => app.jumpCat("Bakery")}>{t("Browse bakery →", "Lihat bakery →")}</button>
          </article>
          <article className="pillar reveal" data-reveal>
            <span className="pillar__ico">🍹</span>
            <h3>{t("Small-Batch Drinks", "Minuman Batch Kecil")}</h3>
            <p>{t("Single-origin pour-overs and zero-proof cordials pressed in house.",
              "Seduhan manual single origin dan cordial tanpa alkohol yang diperas sendiri di rumah.")}</p>
            <button className="link-btn" onClick={() => app.jumpCat("Drinks")}>{t("Browse drinks →", "Lihat minuman →")}</button>
          </article>
        </div>
      </div>
    </section>
  );
}
