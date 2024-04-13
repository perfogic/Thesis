import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import xss from "xss-clean";
import helmet from "helmet";
import http from "http";
import { resolve } from "path";
import compression from "compression";
import morgan from "./configs/morgan";
import env from "./configs/env";
import { DuckDbNode } from "./services/db";
import { CheckpointPolling } from "./services/checkpoint";
import checkpointRoute from "./routes/checkpoint.route";
const app = express();
const server = http.createServer(app);

// SET UP DEFAULTS APPS
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(helmet());
app.use(
  cors({
    origin: ["*"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());
app.use(xss());
app.use(compression());
app.use(cookieParser());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    status,
    message,
    success: false,
    stack: env.env == "development" ? err.stack : null,
  });
});

const PORT = env.port || 8000;

/**
 * There are api main routes here:
 * /api/value_locked/charts?time=${SECONDS} // we should cache here, after each time polling
 * /api/fee_rate/charts?time=${SECONDS} // we should cache here, after each time polling
 * /api/deposit_fees?date=${}
 */

/**
 * There is only one table instead
 * Checkpoint:
 *  checkpoint_index: number primary key
 *  fee_rate: number
 *  fee_collected: number
 *  signed_at_btc_height: number
 *  sigset: string
 *  transactions: string
 *  status: string (COMPLETE, SIGNING, BUILDING)
 *  create_time: number
 */

app.use("/api/checkpoint", checkpointRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    status,
    message,
    success: false,
    stack: env.env == "development" ? err.stack : null,
  });
});

server.listen(PORT, async () => {
  console.log("NODE IS RUNNING ON PORT " + PORT);
  await DuckDbNode.create(resolve(__dirname, "../src/storages/db.duckdb"));
  await DuckDbNode.instances.createTable();
  await CheckpointPolling.polling();
});
