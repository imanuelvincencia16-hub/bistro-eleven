import { useSyncExternalStore } from "react";

const listeners = new Set();
let snap = {
  installable: false,
  installed: false,
  standalone: matchMedia("(display-mode: standalone)").matches || navigator.standalone === true,
  offline: typeof navigator.onLine === "boolean" ? !navigator.onLine : false,
  updateReady: false
};

const emit = patch => {
  snap = { ...snap, ...patch };
  listeners.forEach(l => l());
};

const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };

export function usePwa() {
  return useSyncExternalStore(subscribe, () => snap, () => snap);
}

let deferred = null;

export async function promptInstall() {
  if (!deferred) return "unavailable";
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  emit({ installable: false });
  return outcome;
}

export function applyUpdate() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistration().then(reg => {
    if (!reg?.waiting) return;
    navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
    reg.waiting.postMessage("skip-waiting");
  });
}

export function syncThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#131010" : "#f7f2ea";
}

const secure = () =>
  location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname);

export function setupPwa() {
  addEventListener("online", () => emit({ offline: false }));
  addEventListener("offline", () => emit({ offline: true }));

  const mode = matchMedia("(display-mode: standalone)");
  mode.addEventListener?.("change", e => emit({ standalone: e.matches }));

  addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferred = e;
    emit({ installable: true });
  });
  addEventListener("appinstalled", () => {
    deferred = null;
    emit({ installable: false, installed: true, standalone: true });
  });

  if (!import.meta.env.PROD || !secure() || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(reg => {
    if (reg.waiting) emit({ updateReady: true });
    reg.addEventListener("updatefound", () => {
      const next = reg.installing;
      if (!next) return;
      next.addEventListener("statechange", () => {
        if (next.state === "installed" && navigator.serviceWorker.controller) emit({ updateReady: true });
      });
    });
  }).catch(() => {});
}
