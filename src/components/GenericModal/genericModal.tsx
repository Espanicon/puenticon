import styles from "./genericModal.module.css";

type GenericModalType = {
  isOpen: boolean;
  onClose: any;
  useSmall?: boolean;
  children?: any;
};
export default function GenericModal({
  isOpen,
  onClose,
  useSmall = false,
  children
}: GenericModalType) {
  function handleOnClose() {
    onClose();
  }

  function onMainClick(event: any) {
    event.stopPropagation();
  }
  return (
    <div
      className={`${styles.modal} ${
        isOpen ? styles.modalOpen : styles.modalClosed
      }`}
      onClick={handleOnClose}
    >
      <div
        className={
          useSmall
            ? `${styles.main} ${styles.mainSmall}`
            : `${styles.main} ${styles.mainBig}`
        }
        onClick={onMainClick}
      >
        {children}
      </div>
    </div>
  );
}
