import { useState, useEffect } from "react";
import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import BscLoginBtn from "../BscLoginBtn/BscLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
};

const initIconWallet: string[] | null = null;
const initBscWallet: string[] | null = null;

function updateArrayOfIconWallets(newAddress: string, array: string[]) {
  if (array.includes(newAddress)) {
    return [...array];
  } else {
    return [...array, newAddress];
  }
}

export default function WalletSelect({ chain = "icon" }: WalletProps) {
  const [iconWallet, setIconWallet] = useState(initIconWallet);
  const [bscWallet, setBscWallet] = useState(initBscWallet);

  const defaultStr =
    chain === "icon" ? "Select ICON Wallet" : "select BSC Wallet";

  function handleIconLogin(wallet: string) {
    setIconWallet(state => {
      const arr = state == null ? [] : state;
      const newState = updateArrayOfIconWallets(wallet, arr);
      return newState;
    });
  }

  function handleBscLogin(wallet: string[]) {
    setBscWallet(wallet);
  }

  return chain === "icon" ? (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        <p>ICON:</p>
      </div>
      <div
        className={
          iconWallet === null
            ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
            : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
        }
      >
        <select name="selectList" id="selectList" className={styles.select}>
          {iconWallet === null ? (
            <option value="null">{defaultStr}</option>
          ) : (
            iconWallet.map((wallet, index) => {
              return (
                <option value={`${index}`} key={`${wallet}-${index}`}>
                  {wallet}
                </option>
              );
            })
          )}
        </select>
      </div>
      <IconLoginBtn handleWalletSelect={handleIconLogin} />
    </div>
  ) : (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        <p>BSC:</p>
      </div>
      <div
        className={
          bscWallet === null
            ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
            : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
        }
      >
        <select name="selectList" id="selectList" className={styles.select}>
          {bscWallet === null ? (
            <option value="null">{defaultStr}</option>
          ) : (
            bscWallet.map((wallet, index) => {
              return (
                <option value={`${index}`} key={`${wallet}-${index}`}>
                  {wallet}
                </option>
              );
            })
          )}
        </select>
      </div>
      <BscLoginBtn handleWalletSelect={handleBscLogin} />
    </div>
  );
}
