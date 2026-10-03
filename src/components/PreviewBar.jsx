import { useApp } from "../lib/store.jsx";
import { STAFF } from "../data/biz.js";
import Ico from "../lib/icons.jsx";

export default function PreviewBar() {
  const app = useApp();
  const { t } = app;
  if (!(app.isStaff && app.ui.view === "guest")) return null;

  return (
    <div className="preview-bar">
      <Ico name="eye" />
      <span>{t("Guest preview", "Pratinjau tamu")} · <b>{STAFF.name}</b> · {t("looking only", "sekadar melihat")}</span>
      <button className="btn btn--primary btn--sm" onClick={app.backToConsole}>{t("Service board", "Papan layanan")}</button>
    </div>
  );
}
