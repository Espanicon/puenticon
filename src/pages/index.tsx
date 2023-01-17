import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
// import DetailsSection from "../components/DetailsSection/DetailsSection";
import Head from "next/head";
import lib from "../lib/lib";
import GenericModal from "../components/GenericModal/genericModal";
import { WALLETS_INIT, helpers } from "../helpers/helpers";
import {
  Tokens,
  TxType,
  TokenType,
  WalletsType,
  ChainComponentType,
  TxResultComponentType
} from "../types";

// DetailsSection imported with Next.js dynamic imports functionality
// and no SSR to allow for the component to use native web browser API
// from the global 'Window' object without Next.js throwing and error
// when trying to access it on the backend
const DetailsSection = dynamic(
  () => import("../components/DetailsSection/DetailsSection"),
  { ssr: false }
);

// variable declarations
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

const iconInitTokenBalance: Array<TokenType> = TOKENS_AVAILABLE.map(
  tokenName => {
    return {
      token: tokenName!,
      label: "",
      claiming: false,
      balance: {
        locked: "0",
        refundable: "0",
        usable: "0",
        userBalance: "0"
      }
    };
  }
);

// main component
function Home() {
  const [fromIcon, setFromIcon] = useState<boolean>(true);
  const [tokenToTransfer, setTokenToTransfer] = useState<Tokens>(
    lib.tokens[0]!
  );
  const [amountToTransfer, setAmountToTransfer] = useState<string>("");
  const [useMainnet, setUseMainnet] = useState(false);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transferTxResult, setTransferTxResult] = useState<any>(null);
  const [methodCallTxResult, setMethodCallTxResult] = useState<any>(null);
  const [reclaimCallTxResult, setReclaimCallTxResult] = useState<any>(null);
  const [loginWallets, setLoginWallets] = useState<WalletsType>(WALLETS_INIT);
  const [iconTokensBalance, setIconTokenBalance] = useState<Array<TokenType>>(
    iconInitTokenBalance
  );

  const txFlag = useRef<TxType>("");

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
      transferTxResult,
      methodCallTxResult,
      loginWallets
    },
    "Home"
  );

  function resetTxStates() {
    setTransferTxResult(null);
    setMethodCallTxResult(null);
    setReclaimCallTxResult(null);
  }

  function handleWalletsChange(wallets: WalletsType) {
    return helpers.handleWalletsChange(wallets, setLoginWallets);
  }

  function handleModalClose() {
    setIsModalOpen(false);
  }

  function handleOnChainFromIcon(evnt: any) {
    return helpers.handleOnChainFromIcon(evnt, setFromIcon);
  }

  function handleOnChainFromBsc(evnt: any) {
    return helpers.handleOnChainFromBsc(evnt, setFromIcon);
  }

  function handleTokenSelection(evnt: any) {
    return helpers.handleTokenSelection(evnt, setTokenToTransfer);
  }

  function handleAmountToTransferChange(evnt: any) {
    helpers.handleAmountToTransferChange(evnt, setAmountToTransfer);
  }

  function handleOnNetworkChange(evnt: any) {
    return helpers.handleOnNetworkChange(evnt, setUseMainnet);
  }

  async function handleOnTransfer() {
    const result = await helpers.handleOnTransfer(
      fromIcon,
      loginWallets,
      targetStatus,
      tokenToTransfer,
      amountToTransfer,
      useMainnet,
      targetAddress!
    );
    if (result.query != null) {
      txFlag.current = result.type;
      helpers.dispatchTxEvent(result.query);
      setIsModalOpen(true);
    }
  }

  function handleOnTargetAddressChange(evnt: any) {
    return helpers.handleOnTargetAddressChange(evnt, setTargetAddress);
  }

  async function handleTokenToRefund(token: TokenType) {
    setIconTokenBalance(status => {
      const result: Array<TokenType> = [];
      status.forEach(eachToken => {
        if (eachToken.token === token.token) {
          result.push({ ...token, claiming: true });
        } else result.push(eachToken);
      });
      return result;
    });

    const queryObj = await helpers.refundIconTokenBalance(
      loginWallets,
      useMainnet,
      token
    );
    console.log(queryObj);
    txFlag.current = "reclaimCall";
    helpers.dispatchTxEvent(queryObj);
  }

  async function handleIconWalletResponse(evnt: any) {
    const { type, payload } = evnt.detail;
    console.log("event response");
    console.log(type);
    console.log(payload);

    let txResult = payload;
    if (payload.result != null) {
      txResult = await lib.getTxResult(payload.result, useMainnet);
    }
    // switch case for every type of event raised
    switch (type) {
      case "RESPONSE_JSON-RPC":
        switch (txFlag.current) {
          case "":
            break;
          case "transfer":
            setTransferTxResult(txResult);
            break;
          case "methodCall":
            // dispatch second Tx executing the 'transfer' call on the btp
            // smart contract
            setMethodCallTxResult(txResult);
            break;
          case "reclaimCall":
            setReclaimCallTxResult(txResult);
            break;
          default:
        }
        break;
      case "CANCEL_JSON-RPC":
      default:
    }
  }

  useEffect(() => {
    console.log("transferTxResult");
    console.log(transferTxResult);
  }, [transferTxResult]);

  useEffect(() => {
    if (reclaimCallTxResult != null && txFlag.current === "reclaimCall") {
      txFlag.current = "";
      helpers.getIconTokensBalance(
        loginWallets,
        useMainnet,
        TOKENS_AVAILABLE,
        setIconTokenBalance
      );
    }
  }, [reclaimCallTxResult, loginWallets, useMainnet]);

  useEffect(() => {
    if (
      methodCallTxResult != null &&
      txFlag.current === "methodCall" &&
      targetAddress != null
    ) {
      txFlag.current = "transfer";
      helpers.dispatchSecondTx(
        tokenToTransfer,
        fromIcon,
        useMainnet,
        amountToTransfer,
        targetAddress,
        loginWallets
      );
    }
  }, [
    methodCallTxResult,
    tokenToTransfer,
    fromIcon,
    useMainnet,
    amountToTransfer,
    targetAddress,
    loginWallets
  ]);

  useEffect(() => {
    if (loginWallets.icon != null) {
      helpers.getIconTokensBalance(
        loginWallets,
        useMainnet,
        TOKENS_AVAILABLE,
        setIconTokenBalance
      );
    } else if (loginWallets.bsc != null) {
      //
    }
  }, [loginWallets]);

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
      resetTxStates();
      txFlag.current = "";
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
        transferTxResult={transferTxResult}
        methodCallTxResult={methodCallTxResult}
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
            <div className={styles.card}>
              <DetailsSection
                wallets={loginWallets}
                iconWalletDetails={iconTokensBalance}
                bscWalletDetails={"string4"}
                handleTokenToRefund={handleTokenToRefund}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

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
  transferTxResult: any;
  methodCallTxResult: any;
};

function TxModal({
  isOpen,
  onClose,
  onClickHandler,
  fromIcon,
  tokenToTransfer,
  transferTxResult,
  methodCallTxResult
}: TxModalType) {
  const header = fromIcon ? "ICON -> BSC" : "BSC -> ICON";
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} useSmall={true}>
      <h1>{header}</h1>
      {fromIcon ? (
        tokenToTransfer === lib.tokenNames.icx ? (
          <>
            <p>Transferring ICX from ICON to BSC</p>
            <TxResultComponent txResult={transferTxResult} />
          </>
        ) : lib.iconTokens.native.includes(tokenToTransfer!) ? (
          <>
            <p>Transferring ICON native token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent txResult={methodCallTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={transferTxResult} />
          </>
        ) : (
          <>
            <p>transferring ICON wrapped token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent txResult={methodCallTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={transferTxResult} />
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
