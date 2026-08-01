import { QueueEvents } from "bullmq";
import { connection, REDIS_AVAILABLE } from "../config/redis.js";

const QUEUE_NAME = "project-generation";

export const queueEvents = REDIS_AVAILABLE
  ? new QueueEvents(QUEUE_NAME, { connection })
  : null;

if (queueEvents) {
  queueEvents.on("waiting",   ({ jobId }) => console.log(`[QueueEvent] Waiting: ${jobId}`));
  queueEvents.on("active",    ({ jobId }) => console.log(`[QueueEvent] Active: ${jobId}`));
  queueEvents.on("completed", ({ jobId }) => console.log(`[QueueEvent] Completed: ${jobId}`));
  queueEvents.on("failed",    ({ jobId, failedReason }) => console.error(`[QueueEvent] Failed: ${jobId} | ${failedReason}`));
  queueEvents.on("stalled",   ({ jobId }) => console.warn(`[QueueEvent] Stalled: ${jobId}`));
}
