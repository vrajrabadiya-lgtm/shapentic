import { Queue } from "bullmq";
import { connection, REDIS_AVAILABLE } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

export const projectQueue = REDIS_AVAILABLE
  ? new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  : null;

export async function enqueueProjectGeneration(jobData) {
  if (!projectQueue) {
    console.warn("[Queue] Redis not available — job skipped.");
    return null;
  }
  try {
    const job = await projectQueue.add("generate-website", jobData);
    console.log(`[Queue] Job enqueued: ${job.id}`);
    return job;
  } catch (error) {
    console.error("[Queue] Failed to enqueue job:", error.message);
    throw error;
  }
}

export async function getJob(jobId) {
  if (!projectQueue) return null;
  return await projectQueue.getJob(jobId);
}

export async function getJobState(jobId) {
  const job = await getJob(jobId);
  return job ? await job.getState() : "unknown";
}

export async function removeJob(jobId) {
  const job = await getJob(jobId);
  if (job) { await job.remove(); return true; }
  return false;
}
