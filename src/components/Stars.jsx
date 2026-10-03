export default function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= full ? "" : "off"}>★</span>)}
    </span>
  );
}
