import { useRef, useState } from "react";
import { useApp } from "../lib/store.jsx";
import { cardPic, widePic } from "../data/photos.js";
import Ico from "../lib/icons.jsx";
import Lightbox from "./Lightbox.jsx";

const SIZES = { card: cardPic, wide: widePic };
const SWIPE_PX = 44;
const DRAG_PX = 6;

export default function PhotoGallery({ photos = [], name, cat, size = "card", label }) {
  const { t } = useApp();
  const list = (photos.length ? photos : [""]).map(s => (SIZES[size] || cardPic)(s));
  const n = list.length;
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const [moving, setMoving] = useState(false);
  const [full, setFull] = useState(false);
  const box = useRef(null);
  const pt = useRef(null);
  const dragged = useRef(false);

  const go = step => setI(c => (c + step + n) % n);

  const down = e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest(".pg__nav,.pg__dots")) return;
    pt.current = { id: e.pointerId, x: e.clientX };
    dragged.current = false;
  };

  const move = e => {
    const p = pt.current;
    if (!p || e.pointerId !== p.id) return;
    const d = e.clientX - p.x;
    if (!dragged.current) {
      if (n < 2 || Math.abs(d) < DRAG_PX) return;
      dragged.current = true;
      setMoving(true);
      box.current?.setPointerCapture?.(e.pointerId);
    }
    setDx(d);
  };

  const end = () => {
    if (!pt.current) return;
    pt.current = null;
    if (!dragged.current) return;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
    setMoving(false);
    setDx(0);
  };

  const click = e => {
    if (e.target.closest(".pg__nav,.pg__dots")) return;
    if (dragged.current) { dragged.current = false; return; }
    setFull(true);
  };

  const stop = fn => e => { e.stopPropagation(); fn(); };

  return (
    <div
      ref={box}
      className={`pg${n > 1 ? " pg--multi" : ""}${size === "wide" ? " pg--wide" : ""}`}
      onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      onClick={click}
      onKeyDown={e => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFull(true); }
      }}
      tabIndex={0}
      role="group"
      aria-label={label || t(`${name}, ${n} photo${n > 1 ? "s" : ""}. Press enter for the full photo.`, `${name}, ${n} foto. Tekan enter untuk foto penuh.`)}
    >
      <div
        className={`pg__track${moving ? " is-drag" : ""}`}
        style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))` }}
      >
        {list.map((src, idx) => (
          <div className="pg__slide" key={idx} aria-hidden={idx !== i}>
            <img src={src} alt={idx === 0 ? name : t(`${name}, angle ${idx + 1}`, `${name}, sudut ${idx + 1}`)}
                 loading={idx === 0 ? "eager" : "lazy"} decoding="async"
                 draggable="false" />
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button className="pg__nav pg__nav--prev" onClick={stop(() => go(-1))} aria-label={t(`Previous photo of ${name}`, `Foto sebelumnya dari ${name}`)}>
            <Ico name="chevronL" />
          </button>
          <button className="pg__nav pg__nav--next" onClick={stop(() => go(1))} aria-label={t(`Next photo of ${name}`, `Foto berikutnya dari ${name}`)}>
            <Ico name="chevronR" />
          </button>
          <span className="pg__count" data-fb-tone={cat}>{i + 1}/{n}</span>
          <div className="pg__dots">
            {list.map((_, idx) => (
              <button key={idx}
                      className={`pg__dot${idx === i ? " is-on" : ""}`}
                      onClick={stop(() => setI(idx))}
                      aria-label={t(`Show photo ${idx + 1} of ${n}`, `Tampilkan foto ${idx + 1} dari ${n}`)} />
            ))}
          </div>
        </>
      )}

      {full && (
        <Lightbox photos={photos.length ? photos : [""]} index={i} name={name}
                  onIndex={setI} onClose={() => setFull(false)} />
      )}
    </div>
  );
}
