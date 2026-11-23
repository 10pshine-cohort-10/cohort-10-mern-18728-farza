import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { logger } from "./config/logger";

function startHttpServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port);
    server.once("listening", () => resolve());
    server.once("error", reject);
  });
}

async function start(): Promise<void> {
  try {
    await connectDB();
    await startHttpServer(env.port);
    logger.info(`Server running on http://localhost:${env.port}`);
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

void start();