import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import checkpointService from "../services/checkpoint.service";
import _ from "lodash";

const getDepositFeeByDate = catchAsync(async (req, res) => {
  const { date } = req.query;

  const data = await checkpointService.getDepositFeeByDate(parseInt(date));

  res.status(httpStatus.OK).json({
    message: "Get deposit fee by date successfully",
    data: {
      deposit_fee: data,
    },
  });
});

export default { getDepositFeeByDate };
