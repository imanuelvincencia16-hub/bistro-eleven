import { useEffect, useState } from "react";
import { useApp } from "../lib/store.jsx";
import { usePwa, promptInstall, applyUpdate } from "../lib/pwa.js";
import Ico from "../lib/icons.jsx";

const KEY = "bistro-eleven.install-dismissed";
const COOLDOWN = 30 * 24 * 60 * 60 * 1000;
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function InstallBar() {
  const app = useApp();
  const { t } = app;
  const pwa = usePwa();
  const [gone, setGone] = useState(() => Number(localStorage.getItem(KEY) || 0) > Date.now() - COOLDOWN);
  const [hint, setHint] = useState(false);

  const needsHint = isIos() && !pwa.standalone && !pwa.installed;
  const show = !gone && app.ui.view === "guest" && !app.isStaff &&
    (pwa.updateReady || pwa.installable || needsHint);

  useEffect(() => {
    document.documentElement.classList.toggle("has-install", show);
    return () => document.documentElement.classList.remove("has-install");
  }, [show]);

  if (!show) return null;

  const update = pwa.updateReady;
  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    setGone(true);
  };
  const add = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") app.toast(t("Bistro Eleven is on your home screen", "Bistro Eleven sudah ada di layar utamamu"), "📲");
    else if (outcome !== "dismissed") setHint(true);
  };

  const title = update ? t("Tonight's board just changed", "Papan menu malam ini baru berubah")
    : t("Put Bistro Eleven on your home screen", "Pasang Bistro Eleven di layar utamamu");
  const sub = update ? t("Reload to pull the new menu, prices and replies.", "Muat ulang untuk menarik menu, harga dan balasan yang baru.")
    : hint ? t("Tap the share button in Safari's bar, then “Add to Home Screen”.", "Ketuk tombol share di bilah Safari, lalu “Add to Home Screen”.")
    : t("Full screen, the board readable offline, the assistant one tap away.", "Layar penuh, menu tetap terbaca tanpa internet, asisten cukup sekali ketuk.");

  return (
    <div className="install" role="region" aria-label={t("Install Bistro Eleven", "Pasang Bistro Eleven")}>
      <span className="install__mark">XI</span>
      <div className="install__text">
        <b>{title}</b>
        <p>{sub}</p>
      </div>
      <div className="install__acts">
        <button className="btn btn--primary btn--sm" onClick={update ? applyUpdate : hint ? dismiss : add}>
          <Ico name={hint && !update ? "share" : "download"} />
          <span>{update ? t("Reload", "Muat ulang") : hint ? t("Got it", "Mengerti") : t("Add", "Pasang")}</span>
        </button>
        <button className="install__x" onClick={dismiss} aria-label={t("Not now", "Nanti saja")}><Ico name="close" /></button>
      </div>
    </div>
  );
}
