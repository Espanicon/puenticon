import { useState, useEffect } from "react";
import IconLoginBtn from "../IconLoginBtn/IconLoginBtn";
import BscLoginBtn from "../BscLoginBtn/BscLoginBtn";
import styles from "./WalletSelect.module.css";

type WalletProps = {
  chain?: string;
  handleWalletsChange: any;
};

function handleLoginGeneral(wallet: string, setArr: any, setSelected: any) {
  // update array of wallets in the options of the select component
  setArr((state: string[]) => {
    if (state.includes(wallet)) {
      return state;
    } else {
      return [...state, wallet];
    }
  });

  // updates the currently selected wallet
  setSelected(wallet);
}

export default function WalletSelect({
  chain = "icon",
  handleWalletsChange
}: WalletProps) {
  const [selectedBscWallet, setSelectedBscWallet] = useState<null | string>(
    null
  );
  const [selectedIconWallet, setSelectedIconWallet] = useState<null | string>(
    null
  );
  const [arrIconWallets, setArrIconWallets] = useState<string[]>([]);
  const [arrBscWallets, setArrBscWallets] = useState<string[]>([]);

  const defaultStr =
    chain === "icon" ? "Select ICON Wallet" : "select BSC Wallet";

  function handleIconLogin(wallet: string) {
    handleLoginGeneral(wallet, setArrIconWallets, setSelectedIconWallet);

    // pass selected wallet to parent component
    handleWalletsChange({ icon: wallet });
  }

  function handleBscLogin(wallet: string) {
    handleLoginGeneral(wallet, setArrBscWallets, setSelectedBscWallet);

    // pass selected wallet to parent component
    handleWalletsChange({ bsc: wallet });
  }

  function handleSelectChange(evnt: any, chain: string) {
    if (chain === "icon") {
      setSelectedIconWallet(evnt.target.value);
    } else {
      setSelectedBscWallet(evnt.target.value);
    }
  }

  return chain === "icon" ? (
    <WalletSelectSubComponent
      selectedWallet={selectedIconWallet}
      defaultStr={defaultStr}
      handleSelectChange={handleSelectChange}
      arrWallets={arrIconWallets}
      handleLogin={handleIconLogin}
      chain={chain}
    />
  ) : (
    <WalletSelectSubComponent
      selectedWallet={selectedBscWallet}
      defaultStr={defaultStr}
      handleSelectChange={handleSelectChange}
      arrWallets={arrBscWallets}
      handleLogin={handleBscLogin}
      chain={chain}
    />
  );
}

type WalletSelectSubComponentType = {
  selectedWallet: string | null;
  defaultStr: string;
  handleSelectChange: any;
  arrWallets: string[];
  handleLogin: any;
  chain: string;
};

function WalletSelectSubComponent({
  selectedWallet,
  defaultStr,
  handleSelectChange,
  arrWallets,
  handleLogin,
  chain
}: WalletSelectSubComponentType) {
  return (
    <div className={styles.walletSelectMain}>
      <div className={styles.walletSelectChain}>
        <p>{chain === "icon" ? "ICON:" : "BSC:"}</p>
      </div>
      <div
        className={
          selectedWallet === null
            ? `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerRed}`
            : `${styles.walletSelectInputContainer} ${styles.walletSelectInputContainerGreen}`
        }
      >
        <select
          name={`selectList-${chain}`}
          id={`selectListIcon-${chain}`}
          className={styles.select}
          value={selectedWallet === null ? defaultStr : selectedWallet}
          onChange={evnt => handleSelectChange(evnt, chain)}
          placeholder={defaultStr}
        >
          {arrWallets.map((wallet, index) => {
            return (
              <option value={`${wallet}`} key={`${wallet}-${index}`}>
                {wallet}
              </option>
            );
          })}
        </select>
      </div>
      {chain === "icon" ? (
        <IconLoginBtn handleWalletSelect={handleLogin} />
      ) : (
        <BscLoginBtn handleWalletSelect={handleLogin} />
      )}
    </div>
  );
}
