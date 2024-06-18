import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";
import { AllCheckpointChartsData } from "../@types/Analytics.types";
import { useQuery } from "@tanstack/react-query";

const axios = Axios.create({
  timeout: AXIOS_TIMEOUT,
  retryTimes: 3,
  // cache will be enabled by default in 2 seconds
  adapter: retryAdapterEnhancer(
    throttleAdapterEnhancer(Axios.defaults.adapter!, {
      threshold: AXIOS_THROTTLE_THRESHOLD,
    })
  ),
  baseURL: "https://mempool.space/testnet/api/v1/",
});

export const getLastestBlockHeight = async (): Promise<number> => {
  try {
    const res = await axios.get("/blocks/tip/height", {});
    console.log("Height", res.data);
    return parseInt(res.data);
  } catch (e) {
    console.error("getLastestBlockHeight", e);
    return 0;
  }
};

export const useGetLatestBlockHeight = () => {
  const { data } = useQuery(
    ["btc-block-height"],
    () => {
      return getLastestBlockHeight();
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 1000,
    }
  );
  return data;
};
