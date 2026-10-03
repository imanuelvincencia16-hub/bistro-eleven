import { useState } from "react";
import { useApp } from "../../lib/store.jsx";
import { money, plural } from "../../lib/format.js";
import { getHook, ledgerHead, ledgerRow } from "../../lib/sheets.js";
import SheetSync from "../modals/SheetSync.jsx";
import Ico from "../../lib/icons.jsx";

const SyncPill = ({ on, unsent, t, onClick }) => (
  <button type="button" className={"sync-pill" + (on ? " is-on" : "")} onClick={onClick}>
    <i className="sync-dot" />
    {on ? t("Sheet sync is on", "Sinkronisasi sheet aktif")
        : t("Set up sheet sync", "Atur sinkronisasi sheet")}
    {unsent > 0 && <b>{unsent}</b>}
  </button>
);

const quote = v => `"${String(v).replace(/"/g, '""')}"`;

export default function OrderLedger() {
  const app = useApp();
  const { t, data } = app;
  const [hook, setHookUi] = useState(getHook);

  const rows = [...data.orders].reverse().map(o => ({
    id: o.id,
    sent: !!o.synced,
    cells: ledgerRow(o, t, data.menu)
  }));
  const head = ledgerHead(t);
  const booked = data.orders.reduce((n, o) => n + (o.status === "cancelled" ? 0 : o.totals.total), 0);

  const matrix = [head, ...rows.map(r => r.cells)];
  const csv = () => "\ufeff" + matrix.map(line => line.map(quote).join(",")).join("\r\n");
  const tsv = () => matrix.map(line => line.map(c => String(c).replace(/[\t\n]+/g, " ")).join("\t")).join("\n");

  const download = () => {
    const url = URL.createObjectURL(new Blob([csv()], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bistro-eleven-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    app.toast(t("Sheet downloaded, every column included", "Spreadsheet terunduh, semua kolom ikut"), "📄");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tsv());
      app.toast(t("Copied. Paste it straight into Sheets", "Tersalin. Langsung tempel di Sheets"), "📋");
    } catch {
      app.toast(t("The browser blocked the clipboard, use the download instead", "Clipboard diblokir browser, pakai unduh saja"), "⚠️");
    }
  };

  const hookOn = !!hook;
  const unsent = hookOn ? data.orders.filter(o => !o.synced).length : 0;
  const openSync = () => app.openModal(<SheetSync onSaved={setHookUi} />, "modal--slim");
  const pill = <SyncPill on={hookOn} unsent={unsent} t={t} onClick={openSync} />;

  if (!rows.length) {
    return (
      <div className="empty">
        <span>📄</span>
        <h4>{t("The ledger is empty", "Buku pesanan masih kosong")}</h4>
        <p>{t("Every ticket that prints on the board lands here as a row.", "Setiap tiket yang tercetak di papan masuk ke sini sebagai baris.")}</p>
        {pill}
      </div>
    );
  }

  return (
    <div className="ledger">
      <div className="da-bar">
        <p className="muted ledger__note">
          {t(`${plural(rows.length, "row")}, newest first, read straight off the kitchen board.`,
              `${rows.length} baris, terbaru di atas, dibaca langsung dari papan dapur.`)}
          {hookOn && (unsent
            ? t(` ${unsent} not in the sheet yet.`, ` ${unsent} belum masuk sheet.`)
            : t(" Every row is in the sheet.", " Semua baris sudah masuk sheet."))}
        </p>
        {pill}
        <button className="btn btn--ghost btn--sm" onClick={copy}><Ico name="board" /> {t("Copy for Sheets", "Salin untuk Sheets")}</button>
        <button className="btn btn--ghost btn--sm" onClick={download}><Ico name="download" /> {t("Download CSV", "Unduh CSV")}</button>
      </div>

      <div className="sheet-wrap">
        <table className="sheet">
          <thead>
            <tr>
              <th className="sheet__n" aria-hidden="true" />
              {head.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <th className="sheet__n" scope="row">{i + 1}</th>
                {r.cells.map((c, j) => <td key={j} className={j >= 7 ? "sheet__num" : j === 5 ? "sheet__wide" : ""}>{c}</td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="sheet__n" aria-hidden="true" />
              <td colSpan={7}>{t(`Revenue booked across ${plural(rows.length, "order")}`, `Pendapatan tercatat dari ${rows.length} pesanan`)}</td>
              <td className="sheet__num">{money(booked)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
