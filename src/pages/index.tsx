import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
import DetailsSection from "../components/DetailsSection/DetailsSection";
import Head from "next/head";
import lib from "../lib/lib";
import GenericModal from "../components/GenericModal/genericModal";
import { WALLETS_INIT, helpers } from "./helpers";

type Tokens = typeof lib.tokens[number];

const TOKENS_AVAILABLE: Partial<typeof lib.tokens> = [
  lib.tokenNames.icx,
  // lib.tokenNames.sicx,
  lib.tokenNames.bnb
  // lib.tokenNames.btcb,
  // lib.tokenNames.eth,
  // lib.tokenNames.bnusd,
  // lib.tokenNames.busd,
  // lib.tokenNames.usdt,
  // lib.tokenNames.usdc
  // lib.tokenNames.icz
];

function Home() {
  const [fromIcon, setFromIcon] = useState<boolean>(true);
  const [tokenToTransfer, setTokenToTransfer] = useState<Tokens>(
    lib.tokens[0]!
  );
  const [amountToTransfer, setAmountToTransfer] = useState("");
  const [useMainnet, setUseMainnet] = useState(false);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [primaryTxResult, setPrimaryTxResult] = useState<any>(null);
  const [secondaryTxResult, setSecondaryTxResult] = useState<any>(null);
  const [loginWallets, setLoginWallets] = useState(WALLETS_INIT);
  const [tempTxResult, setTempTxResult] = useState<any>(null);

  const waitingSecondTx = useRef(false);

  // FOR TESTING
  lib.useTraceUpdate(
    {
      fromIcon,
      tokenToTransfer,
      amountToTransfer,
      useMainnet,
      targetAddress,
      targetStatus,
      isModalOpen,
      primaryTxResult,
      secondaryTxResult,
      loginWallets
    },
    "Home"
  );

  function handleWalletsChange(wallets: typeof WALLETS_INIT) {
    return helpers.handleWalletsChange(wallets, setLoginWallets);
  }
  function handleModalClose() {
    return helpers.handleModalClose(
      setIsModalOpen,
      setPrimaryTxResult,
      setSecondaryTxResult
    );
  }
  function handleOnChainFromIcon(evnt: any) {
    return helpers.handleOnChainFromIcon(
      evnt,
      setPrimaryTxResult,
      setSecondaryTxResult,
      setFromIcon
    );
  }
  function handleOnChainFromBsc(evnt: any) {
    return helpers.handleOnChainFromBsc(evnt, setFromIcon);
  }
  function handleTokenSelection(evnt: any) {
    return helpers.handleTokenSelection(
      evnt,
      setPrimaryTxResult,
      setSecondaryTxResult,
      setTokenToTransfer
    );
  }
  function handleAmountToTransferChange(evnt: any) {
    helpers.handleAmountToTransferChange(evnt, setAmountToTransfer);
  }
  function handleOnNetworkChange(evnt: any) {
    return helpers.handleOnNetworkChange(evnt, setUseMainnet);
  }
  async function handleOnTransfer() {
    return await helpers.handleOnTransfer(
      fromIcon,
      loginWallets,
      targetStatus,
      tokenToTransfer,
      amountToTransfer,
      useMainnet,
      targetAddress,
      setIsModalOpen
    );
  }
  function handleOnTargetAddressChange(evnt: any) {
    return helpers.handleOnTargetAddressChange(evnt, setTargetAddress);
  }

  async function handleIconWalletResponse(evnt: any) {
    const { type, payload } = evnt.detail;
    console.log("event response");
    console.log(type);
    console.log(payload);

    // switch case for every type of event raised
    switch (type) {
      case "RESPONSE_JSON-RPC":
        let txResult = payload;
        if (payload.error == null) {
          txResult = await lib.getTxResult(payload.result, useMainnet);
        }
        setTempTxResult(txResult);
        break;
      case "CANCEL_JSON-RPC":
      default:
    }
  }

  useEffect(() => {
    if (loginWallets.icon != null) {
      //
    } else if (loginWallets.bsc != null) {
      //
    }
  }, [loginWallets]);

  useEffect(() => {
    if (tempTxResult != null) {
      if (!waitingSecondTx.current) {
        setPrimaryTxResult(tempTxResult);
        if (tempTxResult.error == null && tempTxResult.failure == null) {
          if (
            (fromIcon && tokenToTransfer !== lib.tokenNames.icx) ||
            (!fromIcon && tokenToTransfer !== lib.tokenNames.bnb)
          ) {
            // if the transaction originated on ICON and the token is not
            // ICX or the transaction originated on BSC and the token is
            // not BNB, initiate second transaction logic
            helpers.dispatchSecondTx(
              tokenToTransfer,
              fromIcon,
              useMainnet,
              amountToTransfer,
              targetAddress,
              loginWallets
            );
            waitingSecondTx.current = true;
          }
        }
      } else {
        setSecondaryTxResult(tempTxResult);
        waitingSecondTx.current = false;
      }
    }
  }, [fromIcon, tokenToTransfer, tempTxResult]);

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
      <TxModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onClickHandler={setIsModalOpen}
        fromIcon={fromIcon}
        tokenToTransfer={tokenToTransfer}
        primaryTxResult={primaryTxResult}
        secondaryTxResult={secondaryTxResult}
      />
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
                      {TOKENS_AVAILABLE.map((token, index) => {
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
        <div className={styles.container}>
          <div className={styles.card}>
            <DetailsSection
              iconWallet={loginWallets.icon}
              iconWalletDetails={"string2"}
              bscWallet={loginWallets.bsc}
              bscWalletDetails={"string4"}
            />
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

type TxModalType = {
  isOpen: boolean;
  onClose: any;
  onClickHandler: any;
  fromIcon: boolean;
  tokenToTransfer: string | undefined;
  primaryTxResult: any;
  secondaryTxResult: any;
};

function TxModal({
  isOpen,
  onClose,
  onClickHandler,
  fromIcon,
  tokenToTransfer,
  primaryTxResult,
  secondaryTxResult
}: TxModalType) {
  const header = fromIcon ? "ICON -> BSC" : "BSC -> ICON";
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} useSmall={true}>
      <h1>{header}</h1>
      {fromIcon ? (
        tokenToTransfer === lib.tokenNames.icx ? (
          <>
            <p>Transferring ICX from ICON to BSC</p>
            <TxResultComponent txResult={primaryTxResult} />
          </>
        ) : lib.iconNativeTokens.includes(tokenToTransfer!) ? (
          <>
            <p>Transferring ICON native token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent txResult={primaryTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={secondaryTxResult} />
          </>
        ) : (
          <>
            <p>transferring ICON wrapped token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent txResult={primaryTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={secondaryTxResult} />
          </>
        )
      ) : tokenToTransfer === lib.tokenNames.bnb ? (
        <>
          <p>transferring BNB from BSC to ICON</p>
        </>
      ) : (
        <>
          <p>transferring token from BSC to ICON</p>
        </>
      )}

      <button onClick={() => onClickHandler(false)}>Close</button>
    </GenericModal>
  );
}

type TxResultComponentType = {
  txResult: any;
};

function TxResultComponent({ txResult }: TxResultComponentType) {
  console.log("txResult");
  console.log(txResult);
  let message = "ERROR";

  if (txResult != null) {
    if (txResult.error != null || txResult.failure != null) {
      message = txResult.error == null ? txResult.failure : txResult.error;
    } else {
      message = txResult.txHash;
    }
  }

  const parsedMessage = JSON.stringify(message);
  return txResult === null ? (
    <p>waiting...</p>
  ) : txResult.error != null ? (
    <p>Error response from chain: {parsedMessage}</p>
  ) : (
    <p>Tx hash result: {parsedMessage}</p>
  );
}
export default Home;
