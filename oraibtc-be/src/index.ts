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
import { ChainIdToLcd, DiscordConfig, ONE_DAY } from "./utils/constants";
import { getClientState, getConsensusState } from "./utils/ibc";
import { WebhookClient } from "discord.js";
import IbcData from "./data/ibc.json";
import cron from "node-cron";

const app = express();
const server = http.createServer(app);

// SET UP DEFAULTS APPS
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(helmet());
app.use(
  cors({
    origin: "*",
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

cron.schedule("0 9 * * *", async () => {
  console.log("Starting handling monitor report handler...");
  await monitorReportHandler();
  console.log("End handling monitor report handler...");
});

server.listen(PORT, async () => {
  console.log("NODE IS RUNNING ON PORT " + PORT);
  await DuckDbNode.create(resolve(__dirname, "../src/storages/db.duckdb"));
  await DuckDbNode.instances.createTable();
  await monitorReportHandler();
  await CheckpointPolling.polling();
});

const monitorReportHandler = async () => {
  const webhookClient = new WebhookClient({
    url: DiscordConfig.discord_webhook as string,
  });
  const ibc = IbcData;

  let notifyMessage = "=========MONITORING IBC CHANNELS=========";
  try {
    for (const ibcData of ibc) {
      const srcChainId = ibcData.src["chain-id"];
      const srcClientId = ibcData.src["client-id"];
      const lcd = ChainIdToLcd[srcChainId];

      const clientStateData = await getClientState(lcd, srcClientId);
      console.log(lcd, clientStateData);

      const clientStateInfo = clientStateData.client_state;
      const {
        revision_number: revisionNumber,
        revision_height: revisionHeight,
      } = clientStateInfo.latest_height;

      const consensusState = await getConsensusState(
        lcd,
        srcClientId,
        revisionNumber,
        revisionHeight
      );
      console.log(lcd, consensusState);

      const dstChainId = ibcData.dst["chain-id"];
      const dstClientId = ibcData.dst["client-id"];

      const timestamp = new Date(
        consensusState.consensus_state.timestamp
      ).getTime();
      const currentTimestamp = new Date().getTime();

      notifyMessage += `\n`;

      if (currentTimestamp - timestamp > 3 * ONE_DAY) {
        notifyMessage += "🔴 ";
      } else if (currentTimestamp - timestamp > ONE_DAY) {
        notifyMessage += "🟡 ";
      } else {
        notifyMessage += "🟢 ";
      }

      notifyMessage += `[${srcChainId} x ${dstChainId}] - Client: ${srcClientId} x ${dstClientId}`;
    }
    notifyMessage += "\n=========================================";
  } catch (err) {
    notifyMessage = `[MONITORING IBC CHANNELS ERROR]: ${err?.message}`;
  }
  notifyMessage += `\n${DiscordConfig.discord_users_id
    .map((item) => `<@${item}>`)
    .join(" ")}`;

  console.log("notify message: ", notifyMessage);
  webhookClient.send(notifyMessage);
};
