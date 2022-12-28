import { useState, useEffect } from "react";
import styles from "./IconLoginBtn.module.css";

type IconLoginType = {
  handleWalletSelect : any;
};
export default function IconLoginBtn({ handleWalletSelect }: IconLoginType) {
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
    function iconexRelayResponseEventHandler(evnt: any) {
      const { type, payload } = evnt?.detail;

      switch (type) {
        case "RESPONSE_ADDRESS":
          handleWalletSelect(payload);
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
      <img src="menu.png" />
    </div>
  );
}
