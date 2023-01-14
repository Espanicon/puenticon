import { useState } from "react";
import { Hr } from "../miscItems/miscItems";
import styles from "./DetailsSection.module.css";
import { WALLETS_INIT } from "../../helpers/helpers";

type DetailsSectionType = {
  wallets: typeof WALLETS_INIT;
  iconWalletDetails: any;
  bscWalletDetails: any;
};

export default function DetailsSection({
  wallets,
  iconWalletDetails,
  bscWalletDetails
}: DetailsSectionType) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    setIsOpen(state => {
      return !state;
    });
  }
  return (
    <div
      className={
        isOpen
          ? `${styles.detailsMain} ${styles.show}`
          : `${styles.detailsMain}`
      }
    >
      <div className={styles.header}>
        <h2>Details:</h2>
        <div
          className={
            isOpen
              ? `${styles.expandBtnContainer} ${styles.expandLess}`
              : `${styles.expandBtnContainer}`
          }
          onClick={handleToggle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48">
            <path
              d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z"
              fill="white"
              stroke="white"
            />
          </svg>
        </div>
      </div>
      <Hr />
      <div className={styles.body}>
        <p>Paragraph test</p>
      </div>
    </div>
  );
}
