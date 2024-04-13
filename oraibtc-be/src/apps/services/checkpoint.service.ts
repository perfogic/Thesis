import httpStatus from "http-status";
import { DuckDbNode } from "../../services/db";
import HttpException from "../../utils/exceptions/http.exception";
import { getDepositFees } from "../../utils/lcd";

const getDepositFeeByDate = async (date: number): Promise<number> => {
  const checkpoints =
    await DuckDbNode.instances.queryCheckpointsByUpperBoundTime(date, 1);
  if (checkpoints.length == 0) {
    throw new HttpException(
      httpStatus.BAD_REQUEST,
      "There is no checkpoint matched"
    );
  }
  const checkpointIndex = checkpoints[0].checkpointIndex;
  const depositFee = await getDepositFees(checkpointIndex);
  return depositFee;
};

export default { getDepositFeeByDate };
