import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
import Head from "next/head";
import lib from "../lib/lib";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";

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

function Home() {
  const [fromIcon, setFromIcon] = useState<boolean>(true);
  const [tokenToTransfer, setTokenToTransfer] = useState(tokens[0]);
  const [amountToTransfer, setAmountToTransfer] = useState("");
  const [useMainnet, setUseMainnet] = useState(false);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<boolean>(false);
  const walletsRef = useRef(WalletsInit);

  function handleWalletsChange(wallets: typeof initWallets) {
    walletsRef.current = { ...walletsRef.current, ...wallets };
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

  function handleOnTransfer(evnt: any) {
    // TODO:
    console.log("transfer");
    console.log(walletsRef.current);
    console.log(fromIcon);
    console.log(tokenToTransfer);
    console.log(amountToTransfer);
    console.log(useMainnet);
    console.log(targetAddress);

    if (!targetStatus) {
      alert("invalid target address");
    }
  }

  function handleOnTargetAddressChange(evnt: any) {
    const regex = /^[A-Za-z0-9]*$/;

    if (evnt.target.value.match(regex)) {
      setTargetAddress(evnt.target.value);
    }
  }

  useEffect(() => {
    if (
      (fromIcon && lib.isValidIconAddress(targetAddress)) ||
      (!fromIcon && lib.isValidBscAddress(targetAddress))
    ) {
      setTargetStatus(true);
    } else {
      setTargetStatus(false);
    }
  }, [fromIcon, targetAddress]);
  return (
    <>
      <Head>
        <title>Puenticon</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
