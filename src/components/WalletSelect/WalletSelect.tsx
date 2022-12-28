import { useState } from "react";
import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
};

const initIconWallet: string | null = null;

export default function WalletSelect({ chain = "icon" }: WalletProps) {
  const [iconWallet, setIconWallet] = useState(initIconWallet);
  function handleLogin(wallet: string) {
    setIconWallet(wallet);
  }
  return (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        {chain === "icon" ? <p>ICON:</p> : <p>BSC:</p>}
      </div>
      <div
        className={
          iconWallet === null
            ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
            : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
        }
      >
        <input
          type="text"
          name="name"
          value={iconWallet === null ? "Select ICON Wallet" : iconWallet}
          readOnly
          className={styles.walletSelectInput}
        />
      </div>
      <IconLoginBtn handleWalletSelect={handleLogin} />
    </div>
  );
}
