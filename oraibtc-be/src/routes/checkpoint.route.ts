import express from "express";
import checkpointController from "../apps/controllers/checkpoint.controller";
const router = express.Router();

router.get("/deposit_fees", checkpointController.getDepositFeeByDate);
router.get("/withdraw_fees", checkpointController.getWithdrawFee);
router.get("/all_charts", checkpointController.getAllCharts);

export default router;
