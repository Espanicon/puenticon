const tokenNames = {
  icx: "ICX",
  sicx: "sICX",
  bnb: "BNB",
  btcb: "BTCB",
  eth: "ETH",
  bnusd: "bnUSD",
  busd: "BUSD",
  usdt: "USDT",
  usdc: "USDC",
  icz: "ICZ"
};
const contracts = {
  icon: {
    [tokenNames.bnb]: {
      mainnet: "cx077807f2322aeb42ea19a1fcc0c9f3d3f35e1461",
      testnet: "cxcea1078c39e8b887692d3ccdd81bd711a6260ea5"
    },
    [tokenNames.btcb]: {
      mainnet: "cx5b5a03cb525a1845d0af3a872d525b18a810acb0",
      testnet: "cx63be8619af9cdf1cb053ccde7642ae974648a8c1"
    },
    [tokenNames.eth]: {
      mainnet: "cx288d13e1b63563459a2ac6179f237711f6851cb5",
      testnet: "cx4b9cd9bb520b08d14c19c5035295f7e44003e42f"
    },
    [tokenNames.sicx]: {
      mainnet: "cx2609b924e33ef00b648a409245c7ea394c467824",
      testnet: "cx3044ad389267b50eb3c57103eade0c5a72261c1a"
    },
    [tokenNames.bnusd]: {
      mainnet: "cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
      testnet: "cx7f45afe9d8ce95e80c1be7c4eef2ea0dd843c4e3"
    },
    [tokenNames.busd]: {
      mainnet: "cxb49d82c46be6b61cab62aaf9824b597c6cf8a25d",
      testnet: "cxea67f5fe1d1f7e1d29d54f185f0585b8262c788e"
    },
    [tokenNames.usdt]: {
      mainnet: "cx8e4d9b4164618f796d493a8154f1f17ad75f11bb",
      testnet: "cxac717247714a0b8e2b9038fdadfdcc0f033e325b"
    },
    [tokenNames.usdc]: {
      mainnet: "cx532e4235f9004c233604c1be98ca839cd777d58c",
      testnet: "cxd840ae3c79c1366895747aa8c228bd7e3459032f"
    },
    [tokenNames.icz]: {
      mainnet: "cxbdcc8e15406998d99c4927fecfde99f7c1404358",
      testnet: "cx29e69bd4b79096dc6e07a4f3c22c1ef45675ff34"
    }
  },
  bsc: {
    [tokenNames.icx]: {
      mainnet: "0x9b7b6A964f8870699Ae74744941663D257b0ec1f",
      testnet: "0x0C8773fa9A67291e089cB8136Abb1bcb0Aae220F"
    },
    [tokenNames.btcb]: {
      mainnet: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      testnet: "0x299Fb600FB51A208d3c268Da187539a59bE40041"
    },
    [tokenNames.eth]: {
      mainnet: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      testnet: "0xd49a76cF9a79F13deaAcB789039e3ef76C4c1c5F"
    },
    [tokenNames.sicx]: {
      mainnet: "0x33acDF0Fe57C531095F6bf5a992bF5aA81c94Acf",
      testnet: "0xBBE70cE3dAe164a188a47e6Be898F09D29AFdF74"
    },
    [tokenNames.bnusd]: {
      mainnet: "0xa804D2e9221057099eF331AE1c0D6616cC27d770",
      testnet: "0x4F6f26967a882c12a03DAe27272Ed0fd85A94443"
    },
    [tokenNames.busd]: {
      mainnet: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      testnet: "0xED41B3B136a96c867Ee265cC8a79a8ea39eeC9C4"
    },
    [tokenNames.usdt]: {
      mainnet: "0x55d398326f99059fF775485246999027B3197955",
      testnet: "0x8dE8FaF129d5BD9844dbc92024907d48B415987C"
    },
    [tokenNames.usdc]: {
      mainnet: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      testnet: "0x9DDBcf279D1D01C32A2c13efCB6415f37416857F"
    },
    [tokenNames.icz]: {
      mainnet: "0xEC018C4e38A67038c2dFBFe94ff2df1B6c6F5385",
      testnet: "0xe3CdBBEE28f7EbB0E2b81764a6E71ce7C681C0E9"
    }
  }
};

const lib = {
  tokenNames,
  contracts
};

export default lib;