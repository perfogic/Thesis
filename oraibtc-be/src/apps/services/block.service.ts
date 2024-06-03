import { DuckDbNode } from "services/db";

const getAllCharts = async ({}): Promise<any> => {
  const blocks = await DuckDbNode.instances.getLatestBlock(1000);
  const blockTime = blocks
    .filter((_, index) => index < blocks.length - 1)
    .map((item, index) => {
      return {
        time: item.timestamp,
        value: Math.floor((blocks[index + 1].timestamp - item.timestamp) / 60),
      };
    });
  const blockSize = blocks.map((item) => ({
    time: item.timestamp,
    value: item.size,
  }));
  const blockTxsCount = blocks.map((item) => ({
    time: item.timestamp,
    value: item.txCount,
  }));
  return {
    blockTime,
    blockSize,
    blockTxsCount,
  };
};

export default {
  getAllCharts,
};
