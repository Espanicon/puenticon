import { useState } from "react";
import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import BscLoginBtn from "../BscLoginBtn/BscLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
};

const initIconWallet: string | null = null;
const initBscWallet: string | null = null;

export default function WalletSelect({ chain = "icon" }: WalletProps) {
  const [iconWallet, setIconWallet] = useState(initIconWallet);
  const [bscWallet, setBscWallet] = useState(initBscWallet);

  const defaultStr =
    chain === "icon" ? "Select ICON Wallet" : "select BSC Wallet";

  function handleLogin(wallet: string) {
    if (chain === "icon") {
      setIconWallet(wallet);
    } else if (chain === "bsc") {
      setBscWallet(wallet);
    } else {
    }
  }
  return (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        {chain === "icon" ? <p>ICON:</p> : <p>BSC:</p>}
      </div>
      <div
        className={
          chain === "icon"
            ? iconWallet === null
              ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
              : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
            : bscWallet === null
            ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
            : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
        }
      >
        <input
          type="text"
          name="name"
          value={
            chain === "icon"
              ? iconWallet === null
                ? defaultStr
                : iconWallet
              : bscWallet === null
              ? defaultStr
              : bscWallet
          }
          readOnly
          className={styles.walletSelectInput}
        />
      </div>
      {chain === "icon" ? (
        <IconLoginBtn handleWalletSelect={handleLogin} />
      ) : (
        <BscLoginBtn handleWalletSelect={handleLogin} />
      )}
    </div>
  );
}
