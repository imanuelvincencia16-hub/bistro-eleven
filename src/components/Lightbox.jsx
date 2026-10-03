import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../lib/store.jsx";
import { fullPic } from "../data/photos.js";
import Ico from "../lib/icons.jsx";

export default function Lightbox({ photos = [], index = 0, name, onIndex, onClose }) {
  const { t } = useApp();
  const n = photos.length;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = e => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); }
      else if (n > 1 && e.key === "ArrowRight") onIndex((index + 1) % n);
      else if (n > 1 && e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
    };
    addEventListener("keydown", onKey, true);
    return () => {
      removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, n, onIndex, onClose]);

  const jump = i => e => { e.stopPropagation(); onIndex(i); };
  const close = e => { e.stopPropagation(); onClose(); };

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={t(`${name}, full photo`, `${name}, foto penuh`)} onClick={close}>
      <figure className="lb__stage" onClick={e => e.stopPropagation()}>
        <img className="lb__img" src={fullPic(photos[index])}
             alt={index === 0 ? name : t(`${name}, angle ${index + 1}`, `${name}, sudut ${index + 1}`)} />
        <figcaption className="lb__cap">
          <b>{name}</b>
          <span>{n > 1 ? t(`angle ${index + 1} of ${n}`, `sudut ${index + 1} dari ${n}`) : t("full photo", "foto penuh")}</span>
        </figcaption>
      </figure>

      <button className="lb__x" onClick={close} aria-label={t("Close the photo", "Tutup fotonya")}><Ico name="close" /></button>

      {n > 1 && (
        <>
          <button className="pg__nav lb__nav lb__nav--prev" onClick={jump((index - 1 + n) % n)}
                  aria-label={t(`Previous photo of ${name}`, `Foto sebelumnya dari ${name}`)}><Ico name="chevronL" /></button>
          <button className="pg__nav lb__nav lb__nav--next" onClick={jump((index + 1) % n)}
                  aria-label={t(`Next photo of ${name}`, `Foto berikutnya dari ${name}`)}><Ico name="chevronR" /></button>
          <div className="pg__dots lb__dots">
            {photos.map((_, i) => (
              <button key={i} className={`pg__dot${i === index ? " is-on" : ""}`}
                      onClick={jump(i)} aria-label={t(`Show photo ${i + 1} of ${n}`, `Tampilkan foto ${i + 1} dari ${n}`)} />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
