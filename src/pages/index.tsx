import { useState, useEffect } from "react";
import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import WalletSelect from "../components/WalletSelect/WalletSelect";
import Head from "next/head";
import lib from "../lib/lib";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";
import GenericModal from "../components/GenericModal/genericModal";

const sdkTestnet = new IconBridgeSDK({ useMainnet: false });
const sdkMainnet = new IconBridgeSDK({ useMainnet: true });

const WALLETS_INIT: {
  icon?: null | string;
  bsc?: null | string;
} = {
  icon: null,
  bsc: null
};

type Tokens = typeof lib.tokens[number];

const TOKENS_AVAILABLE: Partial<typeof lib.tokens> = [
  lib.tokenNames.icx,
  // lib.tokenNames.sicx,
  lib.tokenNames.bnb,
  lib.tokenNames.btcb,
  lib.tokenNames.eth,
  // lib.tokenNames.bnusd,
  lib.tokenNames.busd,
  lib.tokenNames.usdt,
  lib.tokenNames.usdc
  // lib.tokenNames.icz
];

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
  const [firstTxResult, setFirstTxResult] = useState<any>(null);

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
  //

  function handleWalletsChange(wallets: typeof WALLETS_INIT) {
    setLoginWallets(state => {
      return { ...state, ...wallets };
    });
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

  async function handleOnTransfer() {
    // TODO:
    console.log("transfer");
    console.log(loginWallets);
    console.log(fromIcon);
    console.log(tokenToTransfer);
    console.log(amountToTransfer);
    console.log(useMainnet);
    console.log(targetAddress);

    // reset the primary and secondary tx result states
    setPrimaryTxResult(null);
    setSecondaryTxResult(null);
    setFirstTxResult(null);
    if (
      (fromIcon && loginWallets.icon === null) ||
      (!fromIcon && loginWallets.bsc === null)
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
      let query: any = null;

      if (fromIcon) {
        // if originating chain is ICON
        if (tokenToTransfer === lib.tokenNames.icx) {
          // if token to transfer is ICX. use 'transferNativeCoin' method
          // of btp contract.
          query = await sdkMethods.transferNativeCoin(
            targetAddress, // target bsc wallet address
            "bsc", // target chain
            loginWallets.icon, // originating icon wallet address
            amountToTransfer // amount
          );
          console.log("query");
          console.log(query);
        } else {
          const contractAddress = useMainnet
            ? lib.contracts.icon[tokenToTransfer]!.mainnet
            : lib.contracts.icon[tokenToTransfer]!.testnet;
          console.log("token contract");
          console.log(contractAddress);

          if (lib.iconTokens.native.includes(tokenToTransfer)) {
            // if token to transfer is a native ICON token, the proccess
            // requires 2 transfers. The first one is to transfer the amount
            // of tokens to the BTP contract and then the second one is to call
            // the 'transfer' method of the BTP contract.

            query = await sdkMethods.transferToBTSContract(
              amountToTransfer,
              contractAddress,
              loginWallets.icon
            );
            console.log("query");
            console.log(query);
          } else if (lib.iconTokens.wrapped.includes(tokenToTransfer)) {
            // if the token to transfer is an ICON wrapped token the proccess
            // requires 2 tx. the first tx is to call the 'approve' method of
            // the token contract and approve the BTP contract for the required
            // amount and the second tx is to call the 'transfer' method of the
            // btp contract.

            query = await sdkMethods.approveBTSContract(
              amountToTransfer,
              contractAddress,
              loginWallets.icon
            );
            console.log("query");
            console.log(query);
          }
        }

        console.log(query);
        dispatchTxEvent(query);
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
        if (primaryTxResult === null) {
          setPrimaryTxResult(payload);
        } else {
          setSecondaryTxResult(payload);
        }
        break;
      case "CANCEL_JSON-RPC":
      default:
    }
  }

  useEffect(() => {
    async function dispatchSecondTx() {
      if (typeof tokenToTransfer === "string") {
        const localSdk = useMainnet ? sdkMainnet : sdkTestnet;
        const sdkMethods = fromIcon ? localSdk.icon.web : localSdk.bsc.web;

        const btpCoinName = lib.getBtpCoinName(tokenToTransfer, useMainnet);
        const query = await sdkMethods.transfer(
          btpCoinName,
          amountToTransfer,
          targetAddress,
          loginWallets.icon
        );
        console.log("query");
        console.log(query);
        dispatchTxEvent(query);
      }
    }

    async function checkFirstTxAndDispatchSecondTx() {
      const txResult = await lib.getTxResult(
        primaryTxResult.result,
        useMainnet
      );

      // validate here the result of getTxResult
      // if the last tx resulted in error dont execute
      // the second tx.
      if (txResult != null && txResult.failure == null) {
        await dispatchSecondTx();
      }
    }

    if (primaryTxResult != null && tokenToTransfer != null) {
      if (fromIcon && tokenToTransfer !== lib.tokenNames.icx) {
        // if the originating chain is ICON and the token to transfer is not
        // ICX.  Dispatch the second tx.

        if (primaryTxResult.error != null) {
          setSecondaryTxResult({ error: "Pre approval tx failed" });
        } else {
          checkFirstTxAndDispatchSecondTx();
        }
        // if the originating chain is BSC and the token to transfer is not BNB
      } else if (!fromIcon && tokenToTransfer !== lib.tokenNames.bnb) {
      }
    }
  }, [primaryTxResult, useMainnet, fromIcon, tokenToTransfer]);

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
            <TxResultComponent txResult={secondaryTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={primaryTxResult} />
          </>
        ) : (
          <>
            <p>transferring ICON wrapped token</p>
            <p>Pre approval transaction result:</p>
            <TxResultComponent txResult={secondaryTxResult} />
            <p>Main transaction result:</p>
            <TxResultComponent txResult={primaryTxResult} />
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
  return txResult === null ? (
    <p>waiting...</p>
  ) : txResult.error != null ? (
    <p>Error response from chain: {txResult.error}</p>
  ) : (
    <p>Tx hash result: {txResult.result}</p>
  );
}
export default Home;
