import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import User from "../models/User.js";
import { AIProvider } from "../core/AIProvider.js";

export const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const PLAN_LIMITS = { free: 3, starter: 10, growth: 50, pro: -1 };

function getSafeErrorMessage(err) {
  if (err?.cause?.code === "ENOTFOUND") {
    return `Host not found: ${err.cause.hostname ?? "unknown host"}`;
  }
  return err?.message ?? "Unknown error";
}

/**
 * Resolve user credits from MongoDB (replaces Supabase).
 * Expects authHeader to contain a JWT with the user's MongoDB _id.
 */
export async function resolveUserCredits(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    // Decode the JWT to get the user ID
    const jwt = (await import("jsonwebtoken")).default;
    const JWT_SECRET = process.env.JWT_SECRET || "3d_studio_secret_key_change_in_prod";
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select(
      "plan builds_used builds_limit video_used video_limit builds_reset_at"
    );
    if (!user) return null;

    const limit = user.builds_limit ?? PLAN_LIMITS[user.plan ?? "free"] ?? 3;

    return {
      userId: user._id.toString(),
      plan: user.plan ?? "free",
      builds_used: user.builds_used ?? 0,
      builds_limit: limit,
      video_used: user.video_used ?? 0,
      video_limit: user.video_limit ?? 0,
      can_build: limit === -1 || (user.builds_used ?? 0) < limit,
    };
  } catch (err) {
    console.warn(`[resolveUserCredits] ${getSafeErrorMessage(err)}`);
    return null;
  }
}

/**
 * Increment the build count for a user in MongoDB.
 */
export async function incrementBuildCount(userId) {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { builds_used: 1 } });
  } catch (err) {
    console.warn(`[incrementBuildCount] Failed: ${getSafeErrorMessage(err)}`);
  }
}

export const PLAN_MODEL = {
  free: "gemini",
  starter: "gemini",
  growth: "gemini",
  pro: "claude",
};

async function generateGroq(systemPrompt, userPrompt, isJson) {
  if (!groq) {
    throw new Error("Groq API key not configured. Set GROQ_API_KEY in .env");
  }
  const payload = {
    model: "llama-3.3-70b-versatile",
    max_tokens: isJson ? 8192 : 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  if (isJson) {
    payload.response_format = { type: "json_object" };
  }

  const completion = await groq.chat.completions.create(payload);
  return completion.choices[0].message.content.trim();
}

export async function generateWithModel(plan, systemPrompt, userPrompt) {
  const model = PLAN_MODEL[plan] ?? "groq";
  const isJson =
    systemPrompt.toLowerCase().includes("json") ||
    userPrompt.toLowerCase().includes("json");

  if (model === "claude") {
    if (!claude) {
      throw new Error("Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env");
    }
    const msg = await claude.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: isJson ? 8192 : 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    return msg.content[0].text.trim();
  }

  if (model === "gemini") {
    try {
      if (isJson) {
        const jsonResult = await AIProvider.generateJSON(systemPrompt, userPrompt, plan);
        return JSON.stringify(jsonResult);
      } else {
        return await AIProvider.generateText(systemPrompt, userPrompt, plan);
      }
    } catch (bedrockErr) {
      console.warn(
        "[generateWithModel] AWS Bedrock exhausted or failed, falling back to Groq:",
        bedrockErr.message,
      );
      return await generateGroq(systemPrompt, userPrompt, isJson);
    }
  }

  return await generateGroq(systemPrompt, userPrompt, isJson);
}

export function parseModelJson(raw) {
  const clean = raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = clean.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }
    throw new Error("Model returned malformed JSON");
  }
}
