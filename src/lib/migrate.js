import { KEY } from "./storage.js";
import { getHook, setHook } from "./sheets.js";

const TAG = "bistro-eleven";

const readState = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
};

export const backupName = () => `bistro-eleven-backup-${new Date().toISOString().slice(0, 10)}.json`;

export const buildBundle = () => JSON.stringify(
  { app: TAG, version: 1, savedAt: new Date().toISOString(), sheetHook: getHook(), state: readState() },
  null, 1
);

export const downloadBundle = () => {
  const href = URL.createObjectURL(new Blob([buildBundle()], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = href;
  a.download = backupName();
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
};

export const readBundle = async file => {
  const b = JSON.parse(await file.text());
  if (!b || b.app !== TAG || !b.state || !Array.isArray(b.state.menu)) throw new Error("foreign bundle");
  return b;
};

export const installBundle = b => {
  localStorage.setItem(KEY, JSON.stringify(b.state));
  setHook(b.sheetHook || "");
};
