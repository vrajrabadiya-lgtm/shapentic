import Redis from "ioredis";

const REDIS_AVAILABLE = !!(process.env.REDIS_URL || process.env.REDIS_HOST);

let connection = null;

if (REDIS_AVAILABLE) {
  const redisConfig = process.env.REDIS_URL
    ? process.env.REDIS_URL
    : {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      };

  connection = new Redis(redisConfig, { maxRetriesPerRequest: null });

  connection.on("error", (err) => {
    console.warn("[Redis] Not available:", err.message);
  });

  connection.on("ready", () => {
    console.log("[Redis] Connected successfully.");
  });
} else {
  console.log("[Redis] No REDIS_URL configured — queue features disabled.");
}

export { connection, REDIS_AVAILABLE };
