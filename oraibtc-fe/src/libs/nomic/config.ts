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
      "https://oraibtc-relayer2.perfogic.store",
    ];
  }
}

export const config = new Config();
