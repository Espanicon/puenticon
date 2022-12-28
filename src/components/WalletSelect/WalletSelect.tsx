import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
};

export default function WalletSelect({ chain = "icon" }: WalletProps) {
  function handleLogin(wallet: string) {
    console.log("selected wallet");
    console.log(wallet);
  }
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
      <IconLoginBtn handleWalletSelect={handleLogin} />
    </div>
  );
}
