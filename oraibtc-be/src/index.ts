import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import xss from "xss-clean";
import helmet from "helmet";
import http from "http";
import compression from "compression";
import morgan from "configs/morgan";
import env from "configs/env";
const app = express();
const server = http.createServer(app);

// SET UP DEFAULTS APPS
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(helmet());
app.use(
  cors({
    origin: [
      "*"
    ],
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
 * There are 3 main routes here:
 * /api/pending_withdraws/${bitcoin_address}
 * /api/pending_deposits/${orai_address}
 * /api/checkpoints/${checkpoint_index} 
 * /api/value_locked/charts?type=${day,week,month} // we should cache here, after each time polling
 * /api/fee_rate/charts?type=${day,week,month} // we should cache here, after each time polling
 * /api/checkpoint/config // this one we only should cache 3 days
 * /api/bitcoin/config // this one we only should cache 3 days
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

server.listen(PORT, async () => {
  console.log("NODE IS RUNNING ON PORT " + PORT);
});