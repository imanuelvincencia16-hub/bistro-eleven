import { useApp } from "../lib/store.jsx";
import { GALLERY, scatterPic } from "../data/photos.js";
import Photo from "./Photo.jsx";

export default function GalleryScatter() {
  const { t } = useApp();
  return (
    <section className="gallery" id="gallery">
      <div className="wrap">
        <h2 className="reveal" data-reveal>{t("From the pass", "Dari dapur")}</h2>
        <div className="scatter">
          {GALLERY.map((g, i) => (
            <figure key={g.slug} data-cap={t(g.cap, g.cap_id)}>
              <Photo src={scatterPic(g.slug, i)} alt={t(g.cap, g.cap_id)} cat="Mains" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
