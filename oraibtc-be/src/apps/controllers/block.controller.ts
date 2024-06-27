import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import blockService from "../services/block.service";
import _ from "lodash";
import { Request, Response } from "express";

const getAllCharts = catchAsync(async (req: Request, res: Response) => {
  const { startTime, endTime } = req.query;

  const data = await blockService.getAllCharts({
    startTime: startTime ? parseInt(startTime as string) : 0,
    endTime: endTime ? parseInt(endTime as string) : new Date().getTime(),
  });

  res.status(httpStatus.OK).json({
    message: "Get all charts successfully",
    data,
  });
});

export default { getAllCharts };
