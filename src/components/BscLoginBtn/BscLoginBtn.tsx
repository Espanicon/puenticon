import { BscLoginType } from "../../types";
import styles from "./BscLoginBtn.module.css";

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

  return (
    <div className={styles.btnContainer} onClick={handleLogin}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="white">
        <path d="M6 36v-3h36v3Zm0-10.5v-3h36v3ZM6 15v-3h36v3Z" />
      </svg>
    </div>
  );
}
