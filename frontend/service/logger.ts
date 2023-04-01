import pino, { LoggerOptions } from "pino";

export const logger = pino<LoggerOptions>(
  {}
  // pino.destination("./pino-logger.log")
);
