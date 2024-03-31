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

const axios = Axios.create({
  timeout: AXIOS_TIMEOUT,
  retryTimes: 3,
  // cache will be enabled by default in 2 seconds
  adapter: retryAdapterEnhancer(
    throttleAdapterEnhancer(Axios.defaults.adapter! as any, {
      threshold: AXIOS_THROTTLE_THRESHOLD,
    })
  ),
  baseURL: env.oraibtc.relayer,
});
