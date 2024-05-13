import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";
import { AllChartsData } from "../@types/Analytics.types";
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
  baseURL: "http://127.0.0.1:8888/api/",
});

export const getAllCharts = async ({
  startTime,
  endTime,
  address,
}: {
  startTime: number;
  endTime: number;
  address: string;
}): Promise<AllChartsData> => {
  try {
    const res = await axios.get("/checkpoint/all_charts", {
      params: {
        startTime,
        endTime,
        address,
      },
    });
    return res.data?.data;
  } catch (e) {
    console.error("getAllCharts", e);
    return {
      deposit: [],
      withdraw: [],
      feeRate: [],
      valueLocked: [],
    };
  }
};

export const useGetAllCharts = ({
  startTime,
  endTime,
  address,
}: {
  startTime: number;
  endTime: number;
  address: string;
}) => {
  const { data } = useQuery(
    ["all-charts", startTime, endTime, address],
    () => {
      return getAllCharts({ startTime, endTime, address });
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000,
    }
  );
  return data;
};
