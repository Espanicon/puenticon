import { useState, useEffect } from "react";
import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import BscLoginBtn from "../BscLoginBtn/BscLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
  handleWalletsChange: any;
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

export default function WalletSelect({
  chain = "icon",
  handleWalletsChange
}: WalletProps) {
  const [iconWallet, setIconWallet] = useState(initIconWallet);
  const [bscWallet, setBscWallet] = useState(initBscWallet);
  const [selectedIconWallet, setSelectedIconWallet] = useState(initIconWallet);
  const [selectedBscWallet, setSelectedBscWallet] = useState(initBscWallet);

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

  function handleSelectChange(evnt: any, chain: string) {
    if (chain === "icon") {
      setSelectedIconWallet(evnt.target.value);
    } else {
      setSelectedBscWallet(evnt.target.value);
    }
  }

  useEffect(() => {
    //
    console.log("selectedIconWallet and selectedBscWallet");
    console.log(selectedIconWallet);
    console.log(selectedBscWallet);
    handleWalletsChange({ icon: selectedIconWallet, bsc: selectedBscWallet });
  }, [selectedBscWallet, selectedIconWallet]);

  useEffect(() => {
    //
    console.log("iconWallet and bscWallet");
    console.log(iconWallet);
    console.log(bscWallet);
  }, [iconWallet, bscWallet]);

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
        <select
          name="selectList"
          id="selectList"
          className={styles.select}
          value={defaultStr}
          onChange={evnt => handleSelectChange(evnt, "icon")}
        >
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
        <select
          name="selectList"
          id="selectList"
          className={styles.select}
          value={defaultStr}
          onChange={evnt => handleSelectChange(evnt, "bsc")}
        >
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
