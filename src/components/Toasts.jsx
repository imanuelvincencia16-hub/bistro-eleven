import { useEffect, useState } from "react";
import { useApp } from "../lib/store.jsx";

function ToastNode({ t }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOut(true), 2200);
    return () => clearTimeout(id);
  }, []);
  return <div className={`toast${out ? " out" : ""}`}><i>{t.icon}</i><span>{t.msg}</span></div>;
}

export default function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map(t => <ToastNode key={t.id} t={t} />)}
    </div>
  );
}
