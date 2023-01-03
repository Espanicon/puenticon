import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
import Head from "next/head";
import lib from "../lib/lib";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";
import GenericModal from "../components/GenericModal/genericModal";

const sdkTestnet = new IconBridgeSDK({ useMainnet: false });
const sdkMainnet = new IconBridgeSDK({ useMainnet: true });

const initWallets: {
  icon: null | string;
  bsc: null | string;
} = {
  icon: null,
  bsc: null
};

const WalletsInit: {
  icon?: null | string;
  bsc?: null | string;
} = {
  icon: null,
  bsc: null
};

const tokens = [...Object.values(lib.tokenNames)];

function dispatchTxEvent(txData: any) {
  window.dispatchEvent(
    new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: "REQUEST_JSON-RPC",
        payload: txData
      }
    })
  );
}

function Home() {
  const [fromIcon, setFromIcon] = useState<boolean>(true);
  const [tokenToTransfer, setTokenToTransfer] = useState(tokens[0]);
  const [amountToTransfer, setAmountToTransfer] = useState("");
  const [useMainnet, setUseMainnet] = useState(false);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [primaryTxResult, setPrimaryTxResult] = useState<any>(null);
  const [secondaryTxResult, setSecondaryTxResult] = useState<any>(null);
  const walletsRef = useRef(WalletsInit);

  function handleWalletsChange(wallets: typeof initWallets) {
    walletsRef.current = { ...walletsRef.current, ...wallets };
  }

  function handleModalClose() {
    setIsModalOpen(false);
  }

  function handleOnChainFromIcon(evnt: any) {
    switch (evnt.target.value) {
      case "icon":
        setFromIcon(true);
        break;
      case "bsc":
        setFromIcon(false);
        break;
      default:
    }
  }

  function handleOnChainFromBsc(evnt: any) {
    switch (evnt.target.value) {
      case "icon":
        setFromIcon(false);
        break;
      case "bsc":
        setFromIcon(true);
        break;
      default:
    }
  }

  function handleTokenSelection(evnt: any) {
    setTokenToTransfer(evnt.target.value);
  }

  function handleAmountToTransferChange(evnt: any) {
    const valueArr = evnt.target.value.split(".");
    const result = [];
    for (let each = 0; each < 2; each++) {
      if (valueArr[each] != null) {
        result.push(valueArr[each].replace(/\D/, ""));
      }
    }

    const parsed = result.join(".");
    setAmountToTransfer(parsed);
  }

  function handleOnNetworkChange(evnt: any) {
    switch (evnt.target.value) {
      case "testnet":
        setUseMainnet(false);
        break;
      case "mainnet":
        setUseMainnet(true);
        break;
      default:
    }
  }

  async function handleOnTransfer(evnt: any) {
    // TODO:
    console.log("transfer");
    console.log(walletsRef.current);
    console.log(fromIcon);
    console.log(tokenToTransfer);
    console.log(amountToTransfer);
    console.log(useMainnet);
    console.log(targetAddress);

    if (
      (fromIcon && walletsRef.current.icon === null) ||
      (!fromIcon && walletsRef.current.bsc === null)
    ) {
      alert("Invalid source wallet");
      return;
    }
    if (!targetStatus) {
      alert("invalid target address");
      return;
    } else {
      const localSdk = useMainnet ? sdkMainnet : sdkTestnet;
      const sdkMethods = fromIcon ? localSdk.icon.web : localSdk.bsc.web;

      switch (tokenToTransfer) {
        case lib.tokenNames.icx:
          if (fromIcon) {
            const query = await sdkMethods.transferNativeCoin(
              targetAddress, // target bsc wallet address
              "bsc", // target chain
              walletsRef.current.icon, // originating icon wallet address
              amountToTransfer // amount
            );

            console.log(query);
            dispatchTxEvent(query);
          } else {
          }
          break;
        case lib.tokenNames.sicx:
          break;
        case lib.tokenNames.bnb:
          break;
        case lib.tokenNames.btcb:
          break;
        case lib.tokenNames.eth:
          break;
        case lib.tokenNames.bnusd:
          break;
        case lib.tokenNames.busd:
          break;
        case lib.tokenNames.usdt:
          break;
        case lib.tokenNames.usdc:
          break;
        case lib.tokenNames.icz:
          break;
        default:
      }
    }
    setIsModalOpen(true);
  }

  function handleOnTargetAddressChange(evnt: any) {
    const regex = /^[A-Za-z0-9]*$/;

    if (evnt.target.value.match(regex)) {
      setTargetAddress(evnt.target.value);
    }
  }

  function handleIconWalletResponse(evnt: any) {
    const { type, payload } = evnt.detail;

    // switch case for every type of event raised
    switch (type) {
      case "RESPONSE_JSON-RPC":
        setPrimaryTxResult(payload);
        break;
      case "CANCEL_JSON-RPC":
      default:
    }
  }

  useEffect(() => {
    if (targetAddress !== null) {
      if (
        (!fromIcon && lib.isValidIconAddress(targetAddress)) ||
        (fromIcon && lib.isValidBscAddress(targetAddress))
      ) {
        setTargetStatus(true);
      } else {
        setTargetStatus(false);
      }
    }
  }, [fromIcon, targetAddress]);

  useEffect(() => {
    if (!isModalOpen) {
      setPrimaryTxResult(null);
      setSecondaryTxResult(null);
    }
  }, [isModalOpen]);

  useEffect(() => {
    // create event listener for Hana/ICONex
    window.addEventListener("ICONEX_RELAY_RESPONSE", handleIconWalletResponse);

    // component cleanup after dismount
    return function cleanup() {
      window.removeEventListener(
        "ICONEX_RELAY_RESPONSE",
        handleIconWalletResponse
      );
    };
  }, []);
  return (
    <>
      <Head>
        <title>Puenticon</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GenericModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        useSmall={true}
      >
        <h1>Test Modal</h1>
        <p>Test paragraph for modal</p>
        <p>
          {primaryTxResult === null
            ? "waiting..."
            : JSON.stringify(primaryTxResult)}
        </p>
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </GenericModal>
      <main className={styles.main}>
        <div className={styles.networkSelection}>
          <p>Network:</p>
          <select
            className={styles.networkSelect}
            value={useMainnet ? "mainnet" : "testnet"}
            onChange={handleOnNetworkChange}
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <span className={styles.yellowrangeSpan}>Puenticon</span>
          </h1>
          <div className={styles.cardColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Select wallet:</h3>
              <WalletSelect handleWalletsChange={handleWalletsChange} />
              <WalletSelect
                chain="bsc"
                handleWalletsChange={handleWalletsChange}
              />
              <Hr />
              <div className={styles.middleContainer}>
                <div className={styles.middleContainerInner}>
                  <ChainComponent
                    label="From:"
                    fromIcon={fromIcon}
                    handle={handleOnChainFromIcon}
                  />
                  <ChainComponent
                    label="To:"
                    fromIcon={!fromIcon}
                    handle={handleOnChainFromBsc}
                  />
                  <div className={styles.tokenContainer}>
                    <p>Token:</p>
                    <select
                      className={styles.selectFrom}
                      value={tokenToTransfer}
                      onChange={handleTokenSelection}
                    >
                      {tokens.map((token, index) => {
                        return (
                          <option value={token} key={`${token}-${index}`}>
                            {token}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className={styles.targetContainer}>
                  <p>Target address:</p>
                  <input
                    className={styles.inputAmount}
                    type="text"
                    value={targetAddress === null ? "" : targetAddress}
                    onChange={handleOnTargetAddressChange}
                  />
                  <div
                    className={
                      targetStatus === false
                        ? `${styles.targetStatus} ${styles.targetStatusRed}`
                        : `${styles.targetStatus} ${styles.targetStatusGreen}`
                    }
                  />
                </div>
                <div className={styles.amountContainer}>
                  <p>Amount:</p>
                  <input
                    className={styles.inputAmount}
                    type="text"
                    pattern="[0-9]*"
                    value={amountToTransfer}
                    onChange={handleAmountToTransferChange}
                  />
                </div>
              </div>
              <Hr />
              <div className={styles.submitContainer}>
                <button className={styles.submitBtn} onClick={handleOnTransfer}>
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

type ChainComponentType = {
  label: string;
  fromIcon: boolean;
  handle: any;
};

function ChainComponent({ label, fromIcon, handle }: ChainComponentType) {
  return (
    <div className={styles.chainContainer}>
      <p>{label}</p>
      <select
        className={styles.selectFrom}
        value={fromIcon ? "icon" : "bsc"}
        onChange={handle}
      >
        <option value="icon">ICON</option>
        <option value="bsc">BSC</option>
      </select>
    </div>
  );
}
export default Home;
