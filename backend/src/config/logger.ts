import pino from "pino";
import { env } from "./env";

const isProduction = env.nodeEnv === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    censor: "[REDACTED]",
  },
  transport: isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true } },
});