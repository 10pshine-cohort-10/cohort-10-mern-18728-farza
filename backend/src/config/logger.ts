import pino from "pino";
import { env } from "./env";

const isProduction = env.nodeEnv === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true } },
});