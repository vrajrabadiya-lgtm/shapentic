import { Worker } from "bullmq";
import { connection, REDIS_AVAILABLE } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

export const projectWorker = REDIS_AVAILABLE
  ? new Worker(
      QUEUE_NAME,
      async (job) => {
        console.log(`[Worker] Job received: ${job.id}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log(`[Worker] Job completed: ${job.id}`);
        return { success: true, message: "Infrastructure verification complete" };
      },
      { connection, concurrency: 2 }
    )
  : null;

if (projectWorker) {
  projectWorker.on("error", (err) => {
    console.error("[Worker] Unhandled error:", err.message);
  });
}
