import { Dispatch, ChangeEvent } from "react";
import lib from "../lib/lib";
import {
  Tokens,
  QueryType,
  JSONRPCType,
  TxType,
  TokenType,
  WalletsType,
  BscParams
} from "../types";

// import IconBridgeSDK from "@espanicon/icon-bridge-sdk-js";

// variable declarations
// const sdkTestnet = new IconBridgeSDK({ useMainnet: false });
// const sdkMainnet = new IconBridgeSDK({ useMainnet: true });

export const WALLETS_INIT: WalletsType = {
  icon: null,
  bsc: null
};

// functions
function dispatchTxEvent(txData: JSONRPCType) {
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
  wallets: WalletsType,
  setLoginWallets: Dispatch<WalletsType>
) {
  setLoginWallets(wallets);
}

function handleOnChainFromIcon(
  evnt: ChangeEvent<HTMLSelectElement>,
  setFromIcon: Dispatch<boolean>
) {
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

function handleOnChainFromBsc(
  evnt: ChangeEvent<HTMLSelectElement>,
  setFromIcon: Dispatch<boolean>
) {
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
  evnt: ChangeEvent<HTMLSelectElement>,
  setTokenToTransfer: Dispatch<string>
) {
  setTokenToTransfer(evnt.target.value);
}

function handleAmountToTransferChange(
  evnt: ChangeEvent<HTMLInputElement>,
  setAmountToTransfer: Dispatch<string>
) {
  const valueArr = evnt.target.value.split(".");
  const result = [];
  for (let each = 0; each < 2; each++) {
    if (valueArr[each] != null) {
      const a = valueArr[each]!.replace(/\D/, "");
      result.push(a);
    }
  }

  const parsed = result.join(".");
  setAmountToTransfer(parsed);
}

function handleOnNetworkChange(
  evnt: ChangeEvent<HTMLSelectElement>,
  setUseMainnet: Dispatch<boolean>
) {
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
  loginWallets: WalletsType,
  useMainnet: boolean,
  tokenData: TokenType,
  sdkTestnet: any,
  sdkMainnet: any
) {
  const wallet = loginWallets.icon;
  const localSdk = useMainnet ? sdkMainnet.icon : sdkTestnet.icon;
  const tokenLabel = lib.getBtpCoinName(tokenData.token, useMainnet);
  const refundableBalance = tokenData.balance.refundable!;
  // parseInt(tokenData.balance.refundable!, 16) / 10 ** 18;
  const queryObj = await localSdk.web.reclaim(
    tokenLabel,
    refundableBalance,
    wallet
  );

  return queryObj;
}

async function getIconTokensBalance(
  loginWallets: WalletsType,
  useMainnet: boolean,
  arrOfTokens: Partial<typeof lib.tokens>,
  callback: Dispatch<Array<TokenType>>,
  sdkTestnet: any,
  sdkMainnet: any
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
      console.log("query balance");
      console.log(query);
      if (query != null) {
        const arrBalances = Object.keys(query.result);
        const parsedBalances: {
          [key: string]: string;
        } = {};
        for (const typeOfBalance of arrBalances) {
          const rawBalance = query.result[typeOfBalance];
          // parseInt(query.result[typeOfBalance], 16) / 10 ** 18;
          parsedBalances[typeOfBalance] = rawBalance;
        }
        result.push({
          token: token,
          label: tokenLabel,
          claiming: false,
          balance: { ...parsedBalances }
        });
      }
    }
  }
  callback(result);
}

async function handleOnTransfer(
  fromIcon: boolean,
  loginWallets: WalletsType,
  targetStatus: boolean,
  tokenToTransfer: Tokens,
  amountToTransfer: string,
  useMainnet: boolean,
  targetAddress: string,
  sdkTestnet: any,
  sdkMainnet: any,
  sdkContracts: any
) {
  // TODO:
  const result: {
    iconQuery: null | JSONRPCType;
    bscQuery: null | BscParams;
    type: TxType;
  } = {
    iconQuery: null,
    bscQuery: null,
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
        result.iconQuery = await sdkMethods.transferNativeCoin(
          targetAddress, // target bsc wallet address
          "bsc", // target chain
          loginWallets.icon, // originating icon wallet address
          amountToTransfer // amount
        );
        result.type = "transfer";
      } else {
        const contractAddress = useMainnet
          ? sdkContracts.icon[tokenToTransfer]!.mainnet
          : sdkContracts.icon[tokenToTransfer]!.testnet;

        if (lib.iconTokens.native.includes(tokenToTransfer)) {
          // if token to transfer is a native ICON token, the proccess
          // requires 2 transfers. The first one is to transfer the amount
          // of tokens to the BTP contract and then the second one is to call
          // the 'transfer' method of the BTP contract.

          result.iconQuery = await sdkMethods.transferToBTSContract(
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

          result.iconQuery = await sdkMethods.approveBTSContract(
            amountToTransfer,
            contractAddress,
            loginWallets.icon
          );
          result.type = "methodCall";
          console.log(result.iconQuery);
        }
      }
    } else {
      // if !fromIcon
      if (tokenToTransfer === lib.tokenNames.bnb) {
        // if token to transfer is BNB. use 'transferNativeCoin' method
        // of btp contract.
        console.log("amount to transfer");
        console.log(amountToTransfer);
        const parsedAmount = lib.decimalToHex(
          Number(amountToTransfer) * 10 ** 18
        );
        console.log(parsedAmount);
        result.bscQuery = await sdkMethods.transferNativeCoin(
          targetAddress, // target icon wallet address
          "icon", // target chain
          loginWallets.bsc, // originating icon wallet address
          amountToTransfer // amount
          // parsedAmount // amount
        );
        result.type = "transfer";
      } else {
        // const contractAddress = useMainnet
        //   ? sdkContracts.bsc[tokenToTransfer]!.mainnet
        //   : sdkContracts.bsc[tokenToTransfer]!.testnet;
      }
    }
  }
  return result;
}

function handleOnTargetAddressChange(
  evnt: ChangeEvent<HTMLInputElement>,
  setTargetAddress: Dispatch<string>
) {
  const regex = /^[A-Za-z0-9]*$/;

  if (evnt.target.value.match(regex)) {
    setTargetAddress(evnt.target.value);
  }
}

async function dispatchSecondTx(
  tokenToTransfer: Tokens,
  fromIcon: boolean,
  useMainnet: boolean,
  amountToTransfer: string,
  targetAddress: string,
  loginWallets: WalletsType,
  sdkTestnet: any,
  sdkMainnet: any
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

async function dispatchBscTransfer(params: BscParams) {
  try {
    console.log("params");
    console.log(params);
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [params]
    });

    return txHash;
  } catch (err) {
    console.log(err);
    return err;
  }
}

export const helpers = {
  dispatchTxEvent,
  handleWalletsChange,
  handleOnChainFromIcon,
  handleOnChainFromBsc,
  handleTokenSelection,
  handleAmountToTransferChange,
  handleOnNetworkChange,
  handleOnTransfer,
  handleOnTargetAddressChange,
  dispatchSecondTx,
  getIconTokensBalance,
  refundIconTokenBalance,
  dispatchBscTransfer
};
