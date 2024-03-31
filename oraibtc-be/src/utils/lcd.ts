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
import {
  CheckpointDataInterface,
  CheckpointQueueInterface,
  CheckpointStatus,
} from "../@types";
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
): Promise<CheckpointDataInterface> => {
  try {
    const res = await axios.get(`/bitcoin/checkpoint/${checkpointIndex}`, {});
    let data = res.data.data;
    return toCamel(data) as any;
  } catch (e) {
    return {
      feesCollected: 0,
      feeRate: 0,
      signedAtBtcHeight: 0,
      sigset: {
        createTime: 0,
        index: 0,
        possibleVp: 0,
        presentVp: 0,
        signatories: [],
      },
      status: CheckpointStatus.Building,
      transaction: {
        hash: "",
        data: {
          input: [],
          output: [],
          lockTime: 0,
        },
      },
    };
  }
};

export const getCheckpointQueue =
  async (): Promise<CheckpointQueueInterface> => {
    try {
      const res = await axios.get("/bitcoin/checkpoint_queue", {});
      return res.data;
    } catch (e) {
      console.error("getCheckpointQueue", e);
      return {
        index: 0,
        first_unhandled_confirmed_cp_index: 0,
        confirmed_index: 0,
      };
    }
  };
