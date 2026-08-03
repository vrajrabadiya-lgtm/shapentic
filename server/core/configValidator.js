import "dotenv/config";
import { logger } from "./logger.js";

/**
 * Validates that all required environment variables are present on startup.
 * Fails fast by throwing an error if configuration is invalid.
 */
export function validateConfig() {
  const requiredVars = [
    "MONGO_URI",
    "DATABASE_NAME",
    "JWT_SECRET",
    "AWS_REGION",
    "AWS_BEDROCK_TEXT_MODEL_ID",
  ];

  const missing = [];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }

  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    missing.push("REDIS_HOST or REDIS_URL");
  }

  // AI Provider check
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    missing.push("AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY");
  }

  if (missing.length > 0) {
    const errorMsg = `FATAL ERROR: Missing required environment configuration: ${missing.join(", ")}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  logger.info("Configuration validated successfully.");
}
