import { DuckDbNode } from "services/db";

const getAllCharts = async ({}): Promise<any> => {
  let gap = 100;
  const blocks = await DuckDbNode.instances.getLatestBlocksWithGap(gap, 1000);
  console.log(blocks);
  const blockTime = blocks
    .filter((_, index) => index < blocks.length - 1)
    .map((item, index) => {
      return {
        time: item.timestamp,
        value: Math.floor(
          -(blocks[index + 1].timestamp - item.timestamp) / 60 / gap
        ),
      };
    })
    .reverse();
  const blockSize = blocks
    .map((item) => ({
      time: item.timestamp,
      value: item.size,
    }))
    .reverse();
  const blockTxsCount = blocks
    .map((item) => ({
      time: item.timestamp,
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
