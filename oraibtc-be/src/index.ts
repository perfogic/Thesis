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

server.listen(PORT, async () => {
  console.log("NODE IS RUNNING ON PORT " + PORT);
});