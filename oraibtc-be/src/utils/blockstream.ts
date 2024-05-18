import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";

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
    console.error("getCheckpointQueue", e);
    return -1;
  }
};
