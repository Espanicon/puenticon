import { MetaMaskInpageProvider } from "@metamask/providers";
declare module "@espanicon/icon-bridge-sdk-js";
declare module "@espanicon/espanicon-sdk";
declare global {
  interface Window {
    ethereum: MetamaskInpageProvider;
  }
}
