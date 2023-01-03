import {useState, useEffect } from "react";
import styles from "./IconLoginBtn.module.css";

type IconLoginType = {
  handleWalletSelect : (wallet: string) => void;
};

interface CustomEventType  extends Event {
  detail: {
    type: string;
    payload: string
  }
}
declare global {
  interface WindowEventMap {
    "ICONEX_RELAY_RESPONSE": CustomEventType
  } 
}

export default function IconLoginBtn({ handleWalletSelect }: IconLoginType) {
  const [wallet, setWallet] = useState<null | string>(null)

  function handleLogin() {
    // event dispatcher for ICON wallets
    window.dispatchEvent(
      new CustomEvent("ICONEX_RELAY_REQUEST", {
        detail: {
          type: "REQUEST_ADDRESS"
        }
      })
    );
  }

  useEffect(() => {
    if (wallet !== null) {
      handleWalletSelect(wallet)
    }
  }, [wallet, handleWalletSelect])

  useEffect(() => {
    function iconexRelayResponseEventHandler(evnt: CustomEventType) {
      const { type, payload } = evnt?.detail;

      switch (type) {
        case "RESPONSE_ADDRESS":
          setWallet(payload);
          break;
        case "CANCEL":
          console.log("ICONEX/Hana wallet selection window closed by user");
          break;
        default:
      }
    }

    // add event listener for the wallet response on wallet selection
    window.addEventListener(
      "ICONEX_RELAY_RESPONSE",
        iconexRelayResponseEventHandler
    )

    // return function to clean up event on component unmount
    return function removeCustomEventListener() {
      window.removeEventListener(
        "ICONEX_RELAY_RESPONSE",
        iconexRelayResponseEventHandler
      );
    };
  }, []);

  return (
    <div className={styles.btnContainer} onClick={handleLogin}>
      <img src="menu.png" alt="menu button" />
    </div>
  );
}
