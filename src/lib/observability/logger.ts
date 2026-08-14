import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["req.headers.authorization", "*.key", "*.token", "*.secret"],
});

export function withCorrelationId(id: string) {
  return logger.child({ correlationId: id });
}
