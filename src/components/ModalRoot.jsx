import { useApp } from "../lib/store.jsx";

export default function ModalRoot() {
  const { modal, closeModal } = useApp();
  return (
    <div
      className="modal-root"
      hidden={!modal}
      onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
    >
      {modal && (
        <div className={`modal ${modal.cls || ""}${modal.closing ? " is-out" : ""}`}
             role="dialog" aria-modal="true">
          {modal.node}
        </div>
      )}
    </div>
  );
}
