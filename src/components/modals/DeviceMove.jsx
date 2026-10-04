import { useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { getHook } from "../../lib/sheets.js";
import { plural, stamp } from "../../lib/format.js";
import { backupName, downloadBundle, installBundle, readBundle } from "../../lib/migrate.js";
import ModalHead from "../ModalHead.jsx";
import Ico from "../../lib/icons.jsx";

const tally = (t, s) => [
  [(s.menu || []).length, "dish", "hidangan"],
  [(s.orders || []).length, "order", "pesanan"],
  [(s.reviews || []).length, "review", "ulasan"],
  [(s.chats || []).length, "chat", "obrolan"]
].map(([n, en, id]) => t(plural(n, en), `${n} ${id}`)).join(" · ");

const STEPS = [
  ["Download the file here, then open the site on the other device.",
   "Unduh berkasnya di sini, lalu buka situsnya di perangkat lain."],
  ["Pick the file below and hit Restore. The page reloads with your data and your sheet url.",
   "Pilih berkasnya di bawah lalu tekan Pulihkan. Halamannya dimuat ulang beserta data dan URL sheet-mu."],
  ["Restoring replaces everything on that device with what is inside the file.",
   "Memulihkan mengganti seluruh isi perangkat itu dengan isi berkas."],
  ["The file holds your accounts and their passwords in plain text. Keep it off shared drives.",
   "Berkas ini menyimpan akun dan kata sandi dalam teks biasa. Jangan taruh di drive bersama."]
];

export default function DeviceMove() {
  const app = useApp();
  const { t } = app;
  const [staged, setStaged] = useState(null);
  const [err, setErr] = useState("");

  const hookOn = !!getHook();

  const pick = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    try {
      setStaged({ bundle: await readBundle(f), name: f.name });
    } catch {
      setStaged(null);
      setErr(t("That file is not a Bistro Eleven backup.", "Berkas itu bukan cadangan Bistro Eleven."));
    }
  };

  const restore = () => {
    try {
      installBundle(staged.bundle);
    } catch {
      setErr(t("This browser refused to store the file, it is probably too large.",
               "Browser menolak menyimpan berkas ini, kemungkinan terlalu besar."));
      return;
    }
    location.reload();
  };

  return (
    <>
      <ModalHead title={t("Move to another device", "Pindah ke perangkat lain")}
                 sub={t("Everything this app knows lives inside one browser. Carry it out as a file and drop it on the other device.",
                        "Semua yang diketahui aplikasi ini tinggal di satu browser. Bawa keluar sebagai berkas, lalu isi ke perangkat lain.")} />
      <div className="modal__body">
        <p className={`sync-state${hookOn ? " is-on" : ""}`}>
          <i />
          {t("On this device", "Di perangkat ini")}: {tally(t, app.data)}.
          {hookOn
            ? t(" The sheet url travels with it.", " URL sheet ikut terbawa.")
            : t(" No sheet url is saved here, so the other device will still need one.",
                " Tidak ada URL sheet di sini, jadi perangkat lain tetap butuh satu.")}
        </p>

        <button className="btn btn--primary btn--block" type="button" onClick={downloadBundle}>
          <Ico name="download" /> {t("Download the backup file", "Unduh berkas cadangan")}
        </button>
        <p className="muted move-name">{backupName()}</p>

        <hr className="move-sep" />

        <div className="move-form">
          <label htmlFor="bundle-file">{t("Restore from a file", "Pulihkan dari berkas")}</label>
          <input id="bundle-file" type="file" accept="application/json,.json" onChange={pick} />
        </div>
        {err && <small className="sync-err">{err}</small>}

        {staged && (
          <div className="move-staged">
            <p className="muted">
              {t("Saved", "Disimpan")} {stamp(staged.bundle.savedAt)} · {staged.name}
            </p>
            <p className="move-counts">{tally(t, staged.bundle.state)}</p>
            <button className="btn btn--primary btn--block" type="button" onClick={restore}>
              <Ico name="arrow" /> {t("Restore and reload", "Pulihkan dan muat ulang")}
            </button>
          </div>
        )}

        <ol className="sync-steps">
          {STEPS.map(([en, id]) => <li key={en}>{t(en, id)}</li>)}
        </ol>
      </div>

      <div className="modal__foot">
        <button type="button" className="btn btn--ghost" onClick={app.closeModal}>{t("Close", "Tutup")}</button>
      </div>
    </>
  );
}
