import { useState, useEffect } from "react";
import styles from "./BscLoginBtn.module.css";

type BscLoginType = {
  handleWalletSelect: any;
};

// get ethereum scope from global window object

function isMetaMaskInstalled() {
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
}

export default function BscLoginBtn({ handleWalletSelect }: BscLoginType) {
  async function handleLogin() {
    if (!isMetaMaskInstalled) {
      alert("MetaMask is not installed");
    } else {
      try {
        const { ethereum } = window;
        await ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await ethereum.request({ method: "eth_accounts" });
        handleWalletSelect(accounts[0]);
      } catch (err) {
        console.log("error connecting to metamask wallet");
        console.log(err);
        alert("Error connecting to Metamask wallet, refresh page");
      }
    }
  }
  useEffect(() => {
    //
  }, []);

  return (
    <div className={styles.btnContainer} onClick={handleLogin}>
      <img src="menu.png" />
    </div>
  );
}
