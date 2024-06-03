import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import blockService from "../services/block.service";
import _ from "lodash";
import { Request, Response } from "express";

const getAllCharts = catchAsync(async (req: Request, res: Response) => {
  const data = await blockService.getAllCharts({});

  res.status(httpStatus.OK).json({
    message: "Get all charts successfully",
    data,
  });
});

export default { getAllCharts };
