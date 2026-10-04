import { getHook } from "./sheets.js";

const TEXT = { "Content-Type": "text/plain;charset=utf-8" };

const post = async body => {
  const hook = getHook();
  if (!hook) return null;
  try {
    const res = await fetch(hook, { method: "POST", headers: TEXT, body: JSON.stringify(body) });
    if (!res.ok) return null;
    const out = await res.json();
    return out && out.ok === true ? out : null;
  } catch { return null; }
};

export const pullCloud = () => post({ action: "load" });

export const pushCloud = async state => {
  const out = await post({ action: "save", state });
  return out ? String(out.saved || "") : null;
};
