import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";
import env from "../configs/env";
import { CheckpointQueueInterface } from "../@types";
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
  baseURL: env.oraibtc.lcd,
});

export const getCheckpointData = async (
  checkpointIndex: number
): Promise<any | null> => {
  try {
    const res = await axios.get(`/bitcoin/checkpoint/${checkpointIndex}`, {});
    let data = res.data.data;
    return toCamel(data) as any;
  } catch (e) {
    console.error("getCheckpointData", e);
    return null;
  }
};

export const getCheckpointQueue =
  async (): Promise<CheckpointQueueInterface> => {
    try {
      const res = await axios.get("/bitcoin/checkpoint_queue", {});
      return res.data;
    } catch (e) {
      console.error("getCheckpointQueue", e);
      throw new Error(e?.message);
    }
  };

export const getCheckpointConfig = async (): Promise<any | null> => {
  try {
    const res = await axios.get("/bitcoin/checkpoint/config", {});
    return res.data;
  } catch (e) {
    console.error("getCheckpointConfig", e);
    null;
  }
};

export const getDepositFees = async (
  checkpointIndex: number | undefined
): Promise<number> => {
  try {
    const res = await axios.get("/bitcoin/deposit_fees", {
      params: {
        checkpoint_index: checkpointIndex,
      },
    });
    return res.data.deposit_fees;
  } catch (e) {
    console.error("getCheckpointQueue", e);
    return -1;
  }
};

export const getValueLocked = async (): Promise<number> => {
  try {
    const res = await axios.get("/bitcoin/value_locked", {});
    return res.data.value;
  } catch (e) {
    console.error("getValueLocked", e);
    return 0;
  }
};

export const getScriptPubkey = async (dest: string) => {
  try {
    const res = await axios(`/bitcoin/script_pubkey/${dest}`);
    const scriptPubkey = res.data;
    return scriptPubkey;
  } catch (err) {
    return "";
  }
};
