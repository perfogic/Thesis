import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";
import { BlockData } from "../@types/block.type";
import { toCamel } from "snake-camel";

const axios = Axios.create({
  timeout: AXIOS_TIMEOUT,
  retryTimes: 3,
  // cache will be enabled by default in 2 seconds
  adapter: retryAdapterEnhancer(
    throttleAdapterEnhancer(Axios.defaults.adapter! as any, {
      threshold: AXIOS_THROTTLE_THRESHOLD,
    })
  ),
  baseURL: "https://blockstream.info/testnet/api/",
});

export const getValueLocked = async (
  txid: string,
  vout: number
): Promise<number> => {
  try {
    const res = await axios.get(`/tx/${txid}`, {});
    return res.data.vout[vout].value;
  } catch (e) {
    console.error("getValueLocked", e);
    return -1;
  }
};

export const getBlocks = async (blockId: number): Promise<BlockData[]> => {
  try {
    const res = await axios.get(`/blocks/${blockId}`, {});
    return res.data.map((item) => toCamel(item));
  } catch (e) {
    console.error("getBlocks", e);
    return [];
  }
};

export const getLatestHeight = async (): Promise<number> => {
  try {
    const res = await axios.get(`/blocks/tip/height`, {});
    return res.data;
  } catch (e) {
    console.error("getLatestHeight", e);
    return 0;
  }
};
