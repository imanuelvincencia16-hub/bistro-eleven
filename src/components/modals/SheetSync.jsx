import { useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { clockTime } from "../../lib/format.js";
import { getHook, setHook } from "../../lib/sheets.js";
import ModalHead from "../ModalHead.jsx";
import Ico from "../../lib/icons.jsx";

const STEPS = [
  ["Open the sheet, then Extensions → Apps Script.",
   "Buka sheet-nya, lalu Extensions → Apps Script."],
  ["Replace everything in Code.gs with the script and save. The same one writes the rows and the device copy.",
   "Tempel skriptnya menimpa seluruh isi Code.gs, lalu simpan. Yang sama ini menulis baris dan salinan perangkat."],
  ["Deploy → Manage deployments → the pencil on your web app → Version: New version → Deploy.",
   "Deploy → Manage deployments → ikon pensil di web app-mu → Version: New version → Deploy."],
  ["The app already points at your deployment. Paste again only if you publish a different /exec url.",
   "App-nya sudah mengarah ke deploy-mu. Tempel lagi hanya kalau kamu publish URL /exec yang berbeda."]
];

export default function SheetSync({ onSaved }) {
  const app = useApp();
  const { t } = app;
  const [draft, setDraft] = useState(getHook);
  const [err, setErr] = useState("");
  const waiting = app.data.orders.filter(o => !o.synced);
  const url = draft.trim();
  const saved = getHook();
  const on = !!saved;
  const dirty = url !== saved;
  const { cloud } = app;
  const clock = cloud.saved ? t(`Last write ${clockTime(cloud.saved)}.`, `Tulis terakhir ${clockTime(cloud.saved)}.`)
    : t("Nothing is stored there yet.", "Belum ada yang tersimpan di sana.");

  const apply = next => {
    setHook(next); setDraft(next); setErr("");
    onSaved?.(next);
    app.readCloud();
    return next;
  };

  const save = e => {
    e.preventDefault();
    if (!/^https:\/\/script\.google\.com\/.+\/exec\/?$/.test(url)) {
      setErr(/^https:\/\/docs\.google\.com\/spreadsheets/.test(url)
        ? t("That is the sheet link, nothing can write through it. The url you need comes from the Apps Script deploy and ends in /exec.",
            "Itu link sheet, tidak bisa dipakai menulis. URL yang dibutuhkan hasil deploy Apps Script, berakhir dengan /exec.")
        : t("Paste the Apps Script url, it starts with https://script.google.com/ and ends in /exec.",
            "Tempel URL Apps Script, mulai dari https://script.google.com/ dan berakhir dengan /exec."));
      return;
    }
    setErr("");
    const next = apply(url);
    if (waiting.length) app.sendToSheet(waiting);
    app.toast(next && waiting.length
      ? t(`${waiting.length} waiting ${waiting.length === 1 ? "row" : "rows"} are going in now.`,
          `${waiting.length} baris tertunda sedang dikirim.`)
      : t("Sync is on. New orders go straight to the sheet.",
          "Sinkronisasi aktif. Pesanan baru langsung masuk sheet."), "🔌");
  };

  const turnOff = () => {
    apply("");
    app.toast(t("Sync is off. Nothing leaves this browser.", "Sinkronisasi mati. Tidak ada yang keluar browser."), "⏸️");
  };

  const send = async () => {
    const n = await app.sendToSheet(waiting);
    app.toast(n
      ? t(`${n} ${n === 1 ? "row" : "rows"} sent to the sheet`, `${n} baris dikirim ke sheet`)
      : t("The sheet did not answer. Check the webhook url.", "Sheet tidak menjawab. Cek URL webhook-nya."), n ? "📤" : "⚠️");
  };

  return (
    <>
      <ModalHead title={t("Spreadsheet sync", "Sinkronisasi spreadsheet")}
                 sub={t("One paste, then every new ticket writes itself into your sheet and your board follows you to another device.",
                        "Tempel sekali, tiap tiket baru menulis dirinya ke sheetmu dan papannya ikut ke perangkat lain.")} />
      <div className="modal__body">
        <p className={`sync-state${on ? " is-on" : dirty ? " is-wait" : ""}`}>
          <i />
          {on
            ? waiting.length
              ? t(`Sync is on, ${waiting.length} ${waiting.length === 1 ? "row" : "rows"} still waiting.`,
                  `Sinkronisasi aktif, ${waiting.length} baris masih menunggu.`)
              : t("Sync is on, every row is in the sheet.", "Sinkronisasi aktif, semua baris sudah masuk sheet.")
            : dirty
              ? t("Not saved yet. Hit Save and new orders start writing themselves into the sheet.",
                  "Belum tersimpan. Tekan Save, pesanan baru mulai menulis dirinya ke sheet.")
              : t("Sync is off. The ledger, the copy and the download still work, nothing reaches the sheet on its own.",
                  "Sinkronisasi mati. Buku pesanan, salin, dan unduh tetap jalan, tidak ada yang masuk sheet sendiri.")}
        </p>

        <form className="sync-form" onSubmit={save}>
          <label htmlFor="hook-url">{t("Apps Script /exec url", "URL /exec Apps Script")}</label>
          <input id="hook-url" value={draft} spellCheck={false} autoComplete="off"
                 placeholder="https://script.google.com/macros/s/…/exec"
                 onChange={e => { setDraft(e.target.value); setErr(""); }} />
          {err && <small className="sync-err">{err}</small>}
          <div className="sync-form__acts">
            <button className="btn btn--primary btn--sm" type="submit" disabled={!url || !dirty}>
              {t("Save", "Simpan")}
            </button>
            {on && <button className="btn btn--ghost btn--sm" type="button" onClick={turnOff}>
              {t("Turn it off", "Matikan")}
            </button>}
          </div>
        </form>

        <p className={`sync-state${cloud.on ? " is-on" : ""}`}>
          <i />
          {cloud.on
            ? t(`Other devices open this same board. ${clock}`, `Perangkat lain membuka papan yang sama. ${clock}`)
            : t("Devices keep their own copy until this url answers. New tickets reach the sheet either way.",
                "Tiap perangkat tetap menyimpan salinannya sendiri sampai URL ini menjawab. Tiket baru masuk sheet dalam kedua keadaan.")}
        </p>

        {!!waiting.length && (
          <button className="btn btn--ghost btn--sm sync-send" type="button" onClick={send}>
            <Ico name="send" /> {t(`Send the ${waiting.length} ${waiting.length === 1 ? "row" : "rows"} missing from the sheet`,
                                   `Kirim ${waiting.length} baris yang belum masuk sheet`)}
          </button>
        )}

        <ol className="sync-steps">
          {STEPS.map(([en, id]) => <li key={en}>{t(en, id)}</li>)}
        </ol>
      </div>

      <div className="modal__foot">
        <button type="button" className="btn btn--primary" onClick={app.closeModal}>{t("Done", "Selesai")}</button>
      </div>
    </>
  );
}
