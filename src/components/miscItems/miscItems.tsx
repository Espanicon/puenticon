import styles from "./miscItems.module.css";

export function Hr() {
  return <div className={styles.hr}></div>;
}

type WalletProps = {
  chain?: string;
};

export function WalletSelect({ chain = "icon" }: WalletProps) {
  return (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        {chain === "icon" ? <p>ICON:</p> : <p>BSC:</p>}
      </div>
      <div
        className={`${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`}
      >
        <input
          type="text"
          name="name"
          value="value"
          className={styles.walletSelectInput}
        />
      </div>
      <div className={styles.walletSelectButton}>
        <img src="menu.png" />
      </div>
    </div>
  );
}
