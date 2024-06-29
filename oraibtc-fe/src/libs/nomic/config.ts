class Config {
  chainId: string;
  chainName: string;
  stakingUrl: string;
  rpcUrl: string;
  restUrl: string;
  relayerUrl: string[];

  constructor() {
    this.chainId = "oraibtc-testnet-1";
    this.chainName = "OraiBtcTestnet";
    this.stakingUrl = "";
    this.rpcUrl = "https://oraibtc-rpc.perfogic.store";
    this.restUrl = "https://oraibtc-rest.perfogic.store";
    this.relayerUrl = [
      "https://oraibtc-relayer.perfogic.store",
      "http://139.180.186.128:8999",
    ];
  }
}

export const config = new Config();
