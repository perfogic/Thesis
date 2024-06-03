import { DuckDbNode } from "services/db";

const getAllCharts = async ({}): Promise<any> => {
  const blocks = await DuckDbNode.instances.getLatestBlock(1000);
  const blockTime = blocks
    .filter((_, index) => index < blocks.length - 1)
    .map((item, index) => {
      return {
        time: item.mediantime,
        value: Math.floor(
          (blocks[index + 1].mediantime - item.mediantime) / 60
        ),
      };
    })
    .reverse();
  const blockSize = blocks
    .map((item) => ({
      time: item.mediantime,
      value: item.size,
    }))
    .reverse();
  const blockTxsCount = blocks
    .map((item) => ({
      time: item.mediantime,
      value: item.txCount,
    }))
    .reverse();
  return {
    blockTime,
    blockSize,
    blockTxsCount,
  };
};

export default {
  getAllCharts,
};
