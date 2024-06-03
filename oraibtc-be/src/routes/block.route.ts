import express from "express";
import blockController from "apps/controllers/block.controller";
const router = express.Router();

router.get("/all_charts", blockController.getAllCharts);

export default router;
