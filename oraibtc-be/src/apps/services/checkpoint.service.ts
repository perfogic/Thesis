import httpStatus from "http-status";
import { DuckDbNode } from "../../services/db";
import HttpException from "../../utils/exceptions/http.exception";
import { calcDepositFee, calcWithdrawFees } from "utils/oraibtc";
import { DepositFeeChartItem } from "@types";
import { getScriptPubkey } from "utils/lcd";

const getDepositFeeByDate = async (date: number): Promise<number> => {
  const checkpoints =
    await DuckDbNode.instances.queryCheckpointsByUpperBoundTime(date, 1);
  if (checkpoints.length == 0) {
    throw new HttpException(
      httpStatus.BAD_REQUEST,
      "There is no checkpoint matched"
    );
  }
  const depositFee = calcDepositFee(checkpoints[0]);
  return depositFee * 10 ** 6;
};

const getWithdrawFeeByDate = async (
  date: number,
  address: string
): Promise<number> => {
  const checkpoints =
    await DuckDbNode.instances.queryCheckpointsByUpperBoundTime(date, 1);
  if (checkpoints.length == 0) {
    throw new HttpException(
      httpStatus.BAD_REQUEST,
      "There is no checkpoint matched"
    );
  }
  const scriptPubkey = await getScriptPubkey(address);
  const withdrawFee = calcWithdrawFees(scriptPubkey, checkpoints[0]);
  return withdrawFee * 10 ** 6;
};

// Get by day
const getAllCharts = async ({ startTime, endTime, address }): Promise<any> => {
  const allCheckpoints = await DuckDbNode.instances.queryCheckpointsByRangeTime(
    startTime,
    endTime
  );
  const scriptPubkey = await getScriptPubkey(address);

  const depositData = allCheckpoints.map((item) => {
    return {
      time: item.createTime,
      value: calcDepositFee(item) * 10 ** 6,
    };
  });
  const withdrawData = allCheckpoints.map((item) => {
    return {
      time: item.createTime,
      value: calcWithdrawFees(scriptPubkey, item) * 10 ** 6,
    };
  });
  const feeRateData = allCheckpoints.map((item) => {
    return {
      time: item.createTime,
      value: item.feeRate,
    };
  });
  const valueLockedData = allCheckpoints.map((item) => {
    return {
      time: item.createTime,
      value: item.valueLocked,
    };
  });

  return {
    deposit: depositData,
    withdraw: withdrawData,
    feeRate: feeRateData,
    valueLocked: valueLockedData,
  };
};

export default {
  getDepositFeeByDate,
  getAllCharts,
  getWithdrawFeeByDate,
};
