import { useState, useEffect, useRef } from "react";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";
import dynamic from "next/dynamic";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
import { TxModal2 } from "../components/TxModal/TxModal";
// import DetailsSection from "../components/DetailsSection/DetailsSection";
import Head from "next/head";
import lib from "../lib/lib";
import { WALLETS_INIT, helpers } from "../helpers/helpers";
import {
  Tokens,
  TxType,
  TokenType,
  WalletsObjType,
  ChainComponentType,
  DefaultTxResultType,
} from "../types";

// DetailsSection imported with Next.js dynamic imports functionality
// and no SSR to allow for the component to use native web browser API
// from the global 'Window' object without Next.js throwing and error
// when trying to access it on the backend
const DetailsSection = dynamic(
  () => import("../components/DetailsSection/DetailsSection"),
  { ssr: false }
);

// iconBridge sdk instances
const sdkTestnet = new IconBridgeSDK({ useMainnet: false });
const sdkMainnet = new IconBridgeSDK({ useMainnet: true });
const CONTRACTS = sdkTestnet.sdkUtils.contracts;
// const CONTRACT_LABELS = sdkTestnet.sdkUtils.labels;
const CONTRACT_LIST = lib.buildContractList(CONTRACTS);

// variable declarations
const TOKENS_AVAILABLE: Partial<typeof lib.tokens> = [
  lib.tokenNames.icx,
  lib.tokenNames.sicx,
  lib.tokenNames.bnb,
  // lib.tokenNames.btcb,
  // lib.tokenNames.eth,
  // lib.tokenNames.bnusd,
  // lib.tokenNames.busd,
  // lib.tokenNames.usdt,
  // lib.tokenNames.usdc
  // lib.tokenNames.icz
];

const iconInitTokenBalance: Array<TokenType> = TOKENS_AVAILABLE.map(
  (tokenName) => {
    return {
      token: tokenName!,
      label: "",
      claiming: false,
      balance: {
        locked: "0",
        refundable: "0",
        usable: "0",
        userBalance: "0",
      },
    };
  }
);

const initRefParams = {
  iconWallet: null,
  bscWallet: null,
  from: null,
  to: null,
  token: null,
  target: null,
  amount: null,
  fromIcon: null,
};

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
  const [transferTxResult, setTransferTxResult] =
    useState<DefaultTxResultType | null>(null);
  const [methodCallTxResult, setMethodCallTxResult] =
    useState<DefaultTxResultType | null>(null);
  const [reclaimCallTxResult, setReclaimCallTxResult] = useState<any>(null);
  const [loginWallets, setLoginWallets] =
    useState<WalletsObjType>(WALLETS_INIT);
  const [iconTokensBalance, setIconTokensBalance] =
    useState<Array<TokenType>>(iconInitTokenBalance);
  const [bscTokensBalance, setBscTokensBalance] = useState<any>(null);

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
      loginWallets,
    },
    "Home"
  );

  function resetTxStates() {
    setTransferTxResult(null);
    setMethodCallTxResult(null);
    setReclaimCallTxResult(null);
  }

  function handleWalletsChange(wallets: WalletsObjType) {
    const typeOfWallet = Object.keys(wallets)[0];

    setLoginWallets((state) => {
      if (typeOfWallet === "icon") {
        return {
          ...state,
          icon: wallets.icon,
        };
      } else if (typeOfWallet === "bsc") {
        return {
          ...state,
          bsc: wallets.bsc,
        };
      } else {
        return {
          icon: "ERROR",
          bsc: "ERROR",
        };
      }
    });
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
      targetAddress!,
      sdkTestnet,
      sdkMainnet,
      CONTRACT_LIST
    );
    console.log("transfer request");
    console.log(result);
    if (fromIcon) {
      if (result.iconQuery != null) {
        txFlag.current = result.type;
        helpers.dispatchTxEvent(result.iconQuery);
        setIsModalOpen(true);
      }
    } else {
      if (result.bscQuery != null) {
        setIsModalOpen(true);
        // fetch the appropiate sdk depending of the network
        const localSdk = useMainnet ? sdkMainnet : sdkTestnet;
        const txHash = await helpers.dispatchBscTransfer(result.bscQuery);
        console.log("wallet response");
        console.log(txHash);
        if (result.type === "transfer") {
          // if the transaction of calling transferNativeCoin
          if (typeof txHash.txHash === "string") {
            const txResult = await lib.getBscTxResult(
              txHash.txHash,
              localSdk.params.bscProvider.hostname
            );
            setTransferTxResult(txResult);
          } else {
            setTransferTxResult(txHash);
          }
        } else if (result.type === "methodCall") {
          // if the tx is calling `approveTransfer`

          // make cross chain transaction of the token
          if (typeof txHash.txHash === "string") {
            const txResult = await lib.getBscTxResult(
              txHash.txHash,
              localSdk.params.bscProvider.hostname
            );
            setMethodCallTxResult(txResult);

            //dispatch second bsc tx. token transfer tx.
            if (result.bscQuery2 == null) {
              setTransferTxResult({
                txHash: null,
                failure: {
                  code: "0",
                  message: "ERROR: second tx object is null",
                },
              });
            } else {
              const txHash2 = await helpers.dispatchBscTransfer(
                result.bscQuery2
              );
              let txResult2 = txHash2;
              if (typeof txHash2.txHash === "string") {
                txResult2 = await lib.getBscTxResult(
                  txHash2.txHash,
                  localSdk.params.bscProvider.hostname
                );
              }
              setTransferTxResult(txResult2);
            }
          } else {
            setMethodCallTxResult(txHash);
            // setMethodCallTxResult({
            //   txHash: null,
            //   failure: {
            //     code: "0",
            //     message:
            //       "ERROR: unexpected error while trying to make transfer",
            //   },
            // });
          }
        } else {
          // should never happen
        }
      }
    }
  }

  function handleOnTargetAddressChange(evnt: any) {
    return helpers.handleOnTargetAddressChange(evnt, setTargetAddress);
  }

  async function handleTokenToRefund(token: TokenType) {
    setIconTokensBalance((status) => {
      const result: Array<TokenType> = [];
      status.forEach((eachToken) => {
        if (eachToken.token === token.token) {
          result.push({ ...token, claiming: true });
        } else result.push(eachToken);
      });
      return result;
    });

    const queryObj = await helpers.refundIconTokenBalance(
      loginWallets,
      useMainnet,
      token,
      sdkTestnet,
      sdkMainnet
    );
    txFlag.current = "reclaimCall";
    helpers.dispatchTxEvent(queryObj);
  }

  async function handleIconWalletResponse(evnt: any) {
    const { type, payload } = evnt.detail;
    console.log("event response");
    console.log(type);
    console.log(payload);

    let txResult = payload;
    if (payload != null && payload.result != null) {
      txResult = await lib.getTxResult(payload.result, useMainnet);
    }

    if (payload.code != null && payload.message != null) {
      txResult = {
        txHash: null,
        failure: {
          code: payload.code,
          message: payload.message,
        },
      };
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
        handleModalClose();
      default:
    }
  }

  useEffect(() => {
    if (reclaimCallTxResult != null && txFlag.current === "reclaimCall") {
      txFlag.current = "";
      helpers.getIconTokensBalance(
        loginWallets,
        useMainnet,
        TOKENS_AVAILABLE,
        setIconTokensBalance,
        sdkTestnet,
        sdkMainnet
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
        loginWallets,
        sdkTestnet,
        sdkMainnet
      );
    }
  }, [
    methodCallTxResult,
    tokenToTransfer,
    fromIcon,
    useMainnet,
    amountToTransfer,
    targetAddress,
    loginWallets,
  ]);

  useEffect(() => {
    // if (loginWallets.icon != null) {
    //   helpers.getIconTokensBalance(
    //     loginWallets,
    //     useMainnet,
    //     TOKENS_AVAILABLE,
    //     setIconTokensBalance,
    //     sdkTestnet,
    //     sdkMainnet
    //   );
    // } else if (loginWallets.bsc != null) {
    //   helpers.getBscTokensBalance(
    //     loginWallets,
    //     useMainnet,
    //     TOKENS_AVAILABLE,
    //     setBscTokensBalance,
    //     sdkTestnet,
    //     sdkMainnet
    //   );
    // }
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
      <TxModal2
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onClickHandler={setIsModalOpen}
        fromIcon={fromIcon}
        tokenToTransfer={tokenToTransfer}
        transferTxResult={transferTxResult}
        methodCallTxResult={methodCallTxResult}
        //
        // isOpen={true}
        // fromIcon={true}
        // tokenToTransfer={"ICX"}
        // transferTxResult={null}
      />
      <main className={styles.main}>
        <div className={styles.networkSelection}>
          <p>Network:</p>
          <select
            className={styles.networkSelect}
            value={useMainnet ? "mainnet" : "testnet"}
            onChange={handleOnNetworkChange}
          >
            {/* <option value="mainnet">Mainnet</option> */}
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
                  <div className={styles.chainContainer}>
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
                    className={styles.inputTarget}
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
              </div>
              <Hr />
              <div className={styles.bottomContainer}>
                <div className={styles.submitContainer}>
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
                  <button
                    disabled={!targetStatus}
                    className={
                      !targetStatus
                        ? `${styles.submitBtn} ${styles.submitBtnDisabled}`
                        : `${styles.submitBtn}`
                    }
                    onClick={handleOnTransfer}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
            {/* <div className={styles.card}> */}
            {/*   <DetailsSection */}
            {/*     wallets={loginWallets} */}
            {/*     iconWalletDetails={iconTokensBalance} */}
            {/*     bscWalletDetails={bscTokensBalance} */}
            {/*     handleTokenToRefund={handleTokenToRefund} */}
            {/*   /> */}
            {/* </div> */}
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

export default Home;
