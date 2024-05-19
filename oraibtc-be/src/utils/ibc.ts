import Axios from "axios";
import {
  throttleAdapterEnhancer,
  retryAdapterEnhancer,
} from "axios-extensions";
import {
  AXIOS_TIMEOUT,
  AXIOS_THROTTLE_THRESHOLD,
} from "@oraichain/oraidex-common";

const axiosFc = (lcd: string, retryTimes: number = 100) =>
  Axios.create({
    timeout: AXIOS_TIMEOUT,
    retryTimes: retryTimes,
    // cache will be enabled by default in 2 seconds
    adapter: retryAdapterEnhancer(
      throttleAdapterEnhancer(Axios.defaults.adapter! as any, {
        threshold: AXIOS_THROTTLE_THRESHOLD,
      })
    ),
    baseURL: lcd,
  });

const getClientState = async (lcd: string, clientId: string) => {
  const axios = axiosFc(lcd);
  const res = await axios.get(
    `/ibc/core/client/v1/client_states/${clientId}`,
    {}
  );
  return res.data;
};

const getConsensusState = async (
  lcd: string,
  clientId: string,
  revisonNumber: number,
  revisionHeight: number
) => {
  const axios = axiosFc(lcd);
  const res = await axios.get(
    `/ibc/core/client/v1/consensus_states/${clientId}/revision/${revisonNumber}/height/${revisionHeight}`
  );
  return res.data;
};

export { getClientState, getConsensusState };
