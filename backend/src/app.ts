import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Server is running" });
});

app.use(notFound);
app.use(errorHandler);