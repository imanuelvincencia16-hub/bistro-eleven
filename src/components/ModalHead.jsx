import Ico from "../lib/icons.jsx";
import { useApp } from "../lib/store.jsx";

export default function ModalHead({ title, sub }) {
  const { closeModal, t } = useApp();
  return (
    <>
      <button className="modal__x" aria-label={t("Close", "Tutup")} onClick={closeModal}><Ico name="close" /></button>
      <div className="modal__head">
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
    </>
  );
}
