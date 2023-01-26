import type { ReactNode, ChangeEventHandler } from "react";
import lib from "./lib/lib";

export type Tokens = (typeof lib.tokens)[number];

export interface CustomEventType extends Event {
  detail: {
    type: string;
    payload: string;
  };
}

declare global {
  interface WindowEventMap {
    ICONEX_RELAY_RESPONSE: CustomEventType;
  }
}

export type TokenType = {
  token: string;
  label: string;
  claiming: boolean;
  balance: {
    refundable?: string;
    locked?: string;
    usable?: string;
    userBalance?: string;
  };
};

export type WalletsType = {
  icon: string | null;
  bsc: string | null;
};

export type TokenTableType = {
  tableLabel: string;
  tokens: Array<TokenType>;
  handleTokenToRefund: any;
};

export type DetailsSectionType = {
  wallets: WalletsType;
  iconWalletDetails: Array<TokenType>;
  bscWalletDetails: any;
  handleTokenToRefund: any;
};

export type ChainComponentType = {
  label: string;
  fromIcon: boolean;
  handle: ChangeEventHandler<HTMLSelectElement>;
};

export type TxResultComponentType = {
  txResult: any;
  fromIcon: boolean;
};

export type WalletProps = {
  chain?: string;
  handleWalletsChange: any;
};

export type BscLoginType = {
  handleWalletSelect: (wallet: string) => void;
};

export type IconLoginType = BscLoginType;

export type GenericModalType = {
  isOpen: boolean;
  onClose: () => void;
  useSmall?: boolean;
  children?: ReactNode;
};

export type QueryType = {
  jsonrpc: string;
  error?: any;
  result?: any;
};

export type JSONRPCType = {
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

export type TxType = "" | "transfer" | "methodCall" | "reclaimCall";

export type BscParams = {
  to: string;
  from: string;
  gas: string;
  data: string;
  value: string;
};

export type BscBalanceOfReply = {
  _usableBalance: string;
  _lockedBalance: string;
  _refundableBalance: string;
  _userBalance: string;
  error?: any;
};

export type IconBalanceOfReply = {
  result: {
    [key: string]: string;
  };
};

export type Url = {
  protocol: "https" | "http";
  hostname: string | null;
  path: string | null;
  port: string | null;
};

export type TxModalType = {
  isOpen: boolean;
  onClose: any;
  onClickHandler: any;
  fromIcon: boolean;
  tokenToTransfer: string | undefined;
  transferTxResult: any;
  methodCallTxResult: any;
};
