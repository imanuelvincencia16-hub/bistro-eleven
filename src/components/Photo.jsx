import { useState } from "react";

const PALETTE = {
  Starters: "#7ba05b", Mains: "#b16d2a", "Pizza & Pasta": "#c8552f",
  Desserts: "#b0455c", Bakery: "#d5a246", Drinks: "#5b7ba0"
};

function standIn(label, cat) {
  const tone = PALETTE[cat] || "#b16d2a";
  const letter = (label || "X").trim()[0] || "X";
  return "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${tone}"/><stop offset="1" stop-color="#211a14"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <text x="200" y="150" font-family="Georgia,serif" font-size="58" fill="rgba(255,255,255,.92)"
        text-anchor="middle">${letter}</text>
      <text x="200" y="188" font-family="Helvetica,sans-serif" font-size="15" letter-spacing="3"
        fill="rgba(255,255,255,.6)" text-anchor="middle">BISTRO ELEVEN</text>
    </svg>`);
}

export default function Photo({ src, alt, cat, eager = false, ...rest }) {
  const [broken, setBroken] = useState(false);
  return (
    <img
      src={broken || !src ? standIn(alt, cat) : src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setBroken(true)}
      {...rest}
    />
  );
}
