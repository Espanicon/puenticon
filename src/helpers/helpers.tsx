import { Dispatch } from "react";
import lib from "../lib/lib";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";

// type declarations
type QueryType = {
  jsonrpc: string;
  error?: any;
  result?: any;
};

type JSONRPCType = {
  jsonrpc: string;
  method: string;
  id: number;
  params: {
    to: string;
    from?: string;
    stepLimit?: string;
    nid?: string;
    nonce?: string;
    version?: string;
    timestamp?: string;
    dataType: string;
    value?: string;
    data: {
      method: string;
      params?: {
        [key: string]: string;
      };
    };
  };
};

// variable declarations
const sdkTestnet = new IconBridgeSDK({ useMainnet: false });
const sdkMainnet = new IconBridgeSDK({ useMainnet: true });

export const WALLETS_INIT: {
  icon?: null | string;
  bsc?: null | string;
} = {
  icon: null,
  bsc: null
};

// functions
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

function handleWalletsChange(
  wallets: typeof WALLETS_INIT,
  setLoginWallets: Dispatch<typeof WALLETS_INIT>
) {
  setLoginWallets(wallets);
}

function resetTxStates(setPrimaryTxResult: any, setSecondaryTxResult: any) {
  // reset the primary and secondary tx result states
  setPrimaryTxResult(null);
  setSecondaryTxResult(null);
}

function handleModalClose(
  setIsModalOpen: any,
  setPrimaryTxResult: any,
  setSecondaryTxResult: any
) {
  setIsModalOpen(false);
  resetTxStates(setPrimaryTxResult, setSecondaryTxResult);
}

function handleOnChainFromIcon(
  evnt: any,
  setPrimaryTxResult: any,
  setSecondaryTxResult: any,
  setFromIcon: any
) {
  // reset the primary and secondary tx result states
  resetTxStates(setPrimaryTxResult, setSecondaryTxResult);

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

function handleOnChainFromBsc(evnt: any, setFromIcon: any) {
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

function handleTokenSelection(
  evnt: any,
  setPrimaryTxResult: any,
  setSecondaryTxResult: any,
  setTokenToTransfer: any
) {
  // reset the primary and secondary tx result states
  resetTxStates(setPrimaryTxResult, setSecondaryTxResult);

  setTokenToTransfer(evnt.target.value);
}

function handleAmountToTransferChange(evnt: any, setAmountToTransfer: any) {
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

function handleOnNetworkChange(evnt: any, setUseMainnet: any) {
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

async function refundIconTokenBalance(
  loginWallets: any,
  useMainnet: any,
  tokenData: { token: string; label: string; balance: { refundable: string } }
  // callback: any
) {
  const wallet = loginWallets.icon;
  const localSdk = useMainnet ? sdkMainnet.icon : sdkTestnet.icon;
  const tokenLabel = lib.getBtpCoinName(tokenData.token, useMainnet);
  console.log("token label");
  console.log(tokenLabel);
  console.log(tokenData);
  const refundableBalance =
    parseInt(tokenData.balance.refundable, 16) / 10 ** 18;
  const queryObj = await localSdk.web.reclaim(
    tokenLabel,
    refundableBalance,
    wallet
  );

  return queryObj;
}

async function getIconTokensBalance(
  loginWallets: any,
  useMainnet: any,
  arrOfTokens: Partial<typeof lib.tokens>,
  callback: any
) {
  const wallet = loginWallets.icon;
  const localSdk = useMainnet ? sdkMainnet.icon : sdkTestnet.icon;
  const result = [];
  for (const token of arrOfTokens) {
    if (token != null) {
      const tokenLabel = lib.getBtpCoinName(token, useMainnet);
      const query = ((await localSdk.methods.balanceOf(
        wallet,
        tokenLabel
      )) as unknown) as QueryType;
      if (query != null) {
        const arrBalances = Object.keys(query.result);
        const parsedBalances: {
          [key: string]: any;
        } = {};
        for (const typeOfBalance of arrBalances) {
          const rawBalance =
            parseInt(query.result[typeOfBalance], 16) / 10 ** 18;
          parsedBalances[typeOfBalance] = rawBalance;
        }
        result.push({
          token: token,
          label: tokenLabel,
          balance: { ...parsedBalances }
        });
      }
    }
  }
  callback(result);
}

async function handleOnTransfer(
  fromIcon: any,
  loginWallets: any,
  targetStatus: any,
  tokenToTransfer: any,
  amountToTransfer: any,
  useMainnet: any,
  targetAddress: any
) {
  // TODO:
  const result: {
    query: null | JSONRPCType;
    type: string;
  } = {
    query: null,
    type: ""
  };

  if (
    (fromIcon && loginWallets.icon === null) ||
    (!fromIcon && loginWallets.bsc === null)
  ) {
    alert("Invalid source wallet");
    return result;
  }
  if (!targetStatus) {
    alert("invalid target address");
    return result;
  } else {
    const localSdk = useMainnet ? sdkMainnet : sdkTestnet;
    const sdkMethods = fromIcon ? localSdk.icon.web : localSdk.bsc.web;

    if (fromIcon) {
      // if originating chain is ICON
      if (tokenToTransfer === lib.tokenNames.icx) {
        // if token to transfer is ICX. use 'transferNativeCoin' method
        // of btp contract.
        result.query = await sdkMethods.transferNativeCoin(
          targetAddress, // target bsc wallet address
          "bsc", // target chain
          loginWallets.icon, // originating icon wallet address
          amountToTransfer // amount
        );
        result.type = "transfer";
      } else {
        const contractAddress = useMainnet
          ? lib.contracts.icon[tokenToTransfer]!.mainnet
          : lib.contracts.icon[tokenToTransfer]!.testnet;

        if (lib.iconTokens.native.includes(tokenToTransfer)) {
          // if token to transfer is a native ICON token, the proccess
          // requires 2 transfers. The first one is to transfer the amount
          // of tokens to the BTP contract and then the second one is to call
          // the 'transfer' method of the BTP contract.

          result.query = await sdkMethods.transferToBTSContract(
            amountToTransfer,
            contractAddress,
            loginWallets.icon
          );
          result.type = "methodCall";
        } else if (lib.iconTokens.wrapped.includes(tokenToTransfer)) {
          // if the token to transfer is an ICON wrapped token the proccess
          // requires 2 tx. the first tx is to call the 'approve' method of
          // the token contract and approve the BTP contract for the required
          // amount and the second tx is to call the 'transfer' method of the
          // btp contract.

          result.query = await sdkMethods.approveBTSContract(
            amountToTransfer,
            contractAddress,
            loginWallets.icon
          );
          result.type = "methodCall";
        }
      }
    } else {
      // if !fromIcon
    }
  }
  return result;
}

function handleOnTargetAddressChange(evnt: any, setTargetAddress: any) {
  const regex = /^[A-Za-z0-9]*$/;

  if (evnt.target.value.match(regex)) {
    setTargetAddress(evnt.target.value);
  }
}

async function dispatchSecondTx(
  tokenToTransfer: any,
  fromIcon: boolean,
  useMainnet: boolean,
  amountToTransfer: any,
  targetAddress: any,
  loginWallets: any
) {
  console.log("dispatch second tx");
  if (typeof tokenToTransfer === "string") {
    const localSdk = useMainnet ? sdkMainnet : sdkTestnet;
    const sdkMethods = fromIcon ? localSdk.icon.web : localSdk.bsc.web;

    const chain = fromIcon ? "icon" : "bsc";
    const btpCoinName = lib.getBtpCoinName(tokenToTransfer, useMainnet);
    const query = await sdkMethods.transfer(
      btpCoinName,
      amountToTransfer,
      chain,
      targetAddress,
      loginWallets.icon
    );
    console.log("second query");
    console.log(query);
    dispatchTxEvent(query);
  }
}

export const helpers = {
  dispatchTxEvent,
  handleWalletsChange,
  handleModalClose,
  handleOnChainFromIcon,
  handleOnChainFromBsc,
  handleTokenSelection,
  handleAmountToTransferChange,
  handleOnNetworkChange,
  handleOnTransfer,
  handleOnTargetAddressChange,
  dispatchSecondTx,
  getIconTokensBalance,
  refundIconTokenBalance
};
