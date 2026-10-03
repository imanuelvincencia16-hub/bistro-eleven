import { useApp } from "../lib/store.jsx";
import { HOURS_ID } from "../lib/i18n.js";
import { BIZ } from "../data/biz.js";
import { pic, AMBIENCE } from "../data/photos.js";
import Photo from "./Photo.jsx";

export default function VisitSection() {
  const app = useApp();
  const { t } = app;
  return (
    <section className="visit" id="visit">
      <div className="wrap visit__grid">
        <div className="visit__card reveal" data-reveal>
          <h3>{t("Find the table", "Temukan mejanya")}</h3>
          <dl className="visit__dl">
            <div><dt>{t("Address", "Alamat")}</dt><dd>{BIZ.street.join(", ")}</dd></div>
            <div>
              <dt>{t("Hours", "Jam buka")}</dt>
              <dd>{BIZ.hours.map(([day, time]) => <div key={day}>{t(day, HOURS_ID[day])} {time}</div>)}</dd>
            </div>
            <div><dt>{t("Phone", "Telepon")}</dt><dd><a href={`tel:${BIZ.phoneTel}`}>{BIZ.phoneShow}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${BIZ.email}`}>{BIZ.email}</a></dd></div>
          </dl>
          <div className="visit__acts">
            <a className="btn btn--ghost" href={BIZ.mapQuery} target="_blank" rel="noopener">{t("Get directions", "Lihat rute")}</a>
          </div>
        </div>
        <div className="visit__map reveal" data-reveal>
          <Photo src={pic(AMBIENCE.room, 1000, 600)} alt={t("The dining room", "Ruang makannya")} cat="Mains" />
          <span className="visit__pin">{`${BIZ.name} · ${BIZ.street[0]}`}</span>
        </div>
      </div>
    </section>
  );
}
