import { useEffect, useState } from "react";

export default function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState("");
  const key = ids.join(",");

  useEffect(() => {
    if (!enabled) return undefined;
    const secs = key.split(",").map(id => document.getElementById(id)).filter(Boolean);
    if (!secs.length) return undefined;
    const io = new IntersectionObserver(
      es => es.forEach(en => { if (en.isIntersecting) setActive(en.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [key, enabled]);

  return [active, setActive];
}
