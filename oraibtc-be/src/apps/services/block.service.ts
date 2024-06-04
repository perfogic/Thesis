import { DuckDbNode } from "services/db";

const getAllCharts = async ({}): Promise<any> => {
  const blockTime = await DuckDbNode.instances.getAvgConfirmationTimeByDays();
  return {
    blockTime: blockTime.map((item) => ({
      time: Math.floor(new Date(item.day).getTime() / 1000),
      value: Math.floor(item.avg_confirmation_time / 60),
    })),
  };
};

export default {
  getAllCharts,
};
