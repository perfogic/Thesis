import express from "express";
import checkpointController from "../apps/controllers/checkpoint.controller";
const router = express.Router();

router.get("/deposit_fees", checkpointController.getDepositFeeByDate);

export default router;
