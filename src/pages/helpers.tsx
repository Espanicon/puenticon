import { Dispatch } from "react";
import lib from "../lib/lib";
import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";

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
  lib.tokenNames.bnb
  // lib.tokenNames.btcb,
  // lib.tokenNames.eth,
  // lib.tokenNames.bnusd,
  // lib.tokenNames.busd,
  // lib.tokenNames.usdt,
  // lib.tokenNames.usdc
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

export function handleWalletsChange(
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

export function handleModalClose(
  setIsModalOpen: any,
  setPrimaryTxResult: any,
  setSecondaryTxResult: any
) {
  setIsModalOpen(false);
  resetTxStates(setPrimaryTxResult, setSecondaryTxResult);
}

export function handleOnChainFromIcon(
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

export function handleOnChainFromBsc(evnt: any, setFromIcon: any) {
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

export function handleTokenSelection(
  evnt: any,
  setPrimaryTxResult: any,
  setSecondaryTxResult: any,
  setTokenToTransfer: any
) {
  // reset the primary and secondary tx result states
  resetTxStates(setPrimaryTxResult, setSecondaryTxResult);

  setTokenToTransfer(evnt.target.value);
}

export function handleAmountToTransferChange(
  evnt: any,
  setAmountToTransfer: any
) {
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

export function handleOnNetworkChange(evnt: any, setUseMainnet: any) {
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

export async function handleOnTransfer(
  fromIcon: any,
  loginWallets: any,
  targetStatus: any,
  tokenToTransfer: any,
  amountToTransfer: any,
  useMainnet: any,
  targetAddress: any,
  setIsModalOpen: any
) {
  // TODO:
  console.log("transfer");
  console.log(loginWallets);
  console.log(fromIcon);
  console.log(tokenToTransfer);
  console.log(amountToTransfer);
  console.log(useMainnet);
  console.log(targetAddress);

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
        }
      }

      console.log("first query");
      console.log(query);
      dispatchTxEvent(query);
    }
  }
  setIsModalOpen(true);
}

export function handleOnTargetAddressChange(evnt: any, setTargetAddress: any) {
  const regex = /^[A-Za-z0-9]*$/;

  if (evnt.target.value.match(regex)) {
    setTargetAddress(evnt.target.value);
  }
}

export async function dispatchSecondTx(
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

export async function handleIconWalletResponse(
  evnt: any,
  useMainnet: boolean,
  setTempTxResult: any
) {
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
