import { useEffect, useState } from "react";
import { useApp } from "../lib/store.jsx";
import DishCard from "./DishCard.jsx";

export default function DishGrid() {
  const { ui, results } = useApp();
  const sig = `${ui.cat}|${ui.sort}|${ui.wishOnly}|${ui.query}`;
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(false);
    const raf = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(raf);
  }, [sig]);

  return (
    <div className={`grid is-stagger${on ? " is-in" : ""}`}>
      {results.list.map(d => <DishCard key={d.id} d={d} />)}
    </div>
  );
}
