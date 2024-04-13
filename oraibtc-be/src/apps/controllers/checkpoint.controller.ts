import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import checkpointService from "../services/checkpoint.service";
import _ from "lodash";
import { Request, Response } from "express";

const getDepositFeeByDate = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.query;

  const data = await checkpointService.getDepositFeeByDate(
    parseInt(date as string)
  );

  res.status(httpStatus.OK).json({
    message: "Get deposit fee by date successfully",
    data: {
      deposit_fee: data,
    },
  });
});

const getWithdrawFee = catchAsync(async (req: Request, res: Response) => {
  const { date, address } = req.query;

  const data = await checkpointService.getWithdrawFeeByDate(
    parseInt(date as string),
    address as string
  );

  res.status(httpStatus.OK).json({
    message: "Get withdrawal fee by date successfully",
    data: {
      withdraw_fee: data,
    },
  });
});

const getAllCharts = catchAsync(async (req: Request, res: Response) => {
  const { startTime, endTime, address } = req.query;

  const data = await checkpointService.getAllCharts({
    startTime: parseInt(startTime as string),
    endTime: parseInt(endTime as string),
    address: address as string,
  });

  res.status(httpStatus.OK).json({
    message: "Get all charts successfully",
    data,
  });
});

export default { getDepositFeeByDate, getWithdrawFee, getAllCharts };
