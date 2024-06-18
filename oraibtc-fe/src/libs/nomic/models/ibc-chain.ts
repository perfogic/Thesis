import OraiBtc from "assets/icons/btc-icon.svg";
import { config } from "../config";
import Orai from "assets/icons/btc-icon.svg";

export interface ChainInfo {
  name: string;
  logo: string;
  chainId: string;
  rpcEndpoint: string;
}

export interface IbcInfo {
  source: {
    channelId: string;
    port: string;
    nBtcIbcDenom: string;
  };
  destination: {
    channelId: string;
    port: string;
  };
  locked: boolean;
}

export type IbcChain = ChainInfo & IbcInfo;

export const OraiBtcSubnetChain: IbcChain = {
  name: "OraiBtcSubnet",
  logo: OraiBtc,
  chainId: config.chainId,
  rpcEndpoint: config.rpcUrl,
  source: {
    channelId: "channel-1",
    port: "transfer",
    nBtcIbcDenom: "usat",
  },
  destination: {
    channelId: "channel-249",
    port: "transfer",
  },
  locked: true,
};

export const OraichainChain: IbcChain = {
  name: "Oraichain Mainnet",
  logo: Orai,
  chainId: "Oraichain",
  rpcEndpoint: "https://rpc.orai.io",
  source: {
    channelId: "channel-249",
    port: "transfer",
    nBtcIbcDenom:
      "ibc/CBC7979082B808A0A9DA4DB44DA17ABEBB615C962F367A1638ED66EE802F66BC",
  },
  destination: {
    channelId: "channel-1",
    port: "transfer",
  },
  locked: true,
};

const OBTCContractAddressMainnet =
  "orai10g6frpysmdgw5tdqke47als6f97aqmr8s3cljsvjce4n5enjftcqtamzsd";
export const OBTCContractAddress = OBTCContractAddressMainnet;
export const Chains: IbcChain[] = [OraiBtcSubnetChain, OraichainChain];
