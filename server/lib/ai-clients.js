import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import User from "../models/User.js";

export const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

let _googleAI = null;

/**
 * Initialise Gemini using the simple Developer API key (GEMINI_API_KEY).
 * This works on any hosting platform (Render, Vercel, Railway…) without
 * needing GCP Application Default Credentials or a service-account JSON.
 */
function getGoogleAI() {
  if (!_googleAI && process.env.GEMINI_API_KEY) {
    _googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _googleAI;
}

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

async function generateGeminiWithRetry(
  userPrompt,
  config,
  retries = 2,
  delay = 1000,
) {
  const ai = getGoogleAI();
  if (!ai) {
    throw new Error("Google AI not configured. Set GOOGLE_PROJECT_ID and GOOGLE_LOCATION in .env");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config,
    });
    return response.text.trim();
  } catch (err) {
    const isRateLimit =
      err.status === "RESOURCE_EXHAUSTED" ||
      err.statusCode === 429 ||
      String(err.status || "").includes("429") ||
      String(err.message || "").includes("429") ||
      String(err.message || "").includes("RESOURCE_EXHAUSTED") ||
      String(err.message || "").includes("Resource exhausted");

    if (isRateLimit && retries > 0) {
      console.warn(
        `[generateWithModel] Gemini rate limited (RESOURCE_EXHAUSTED). Retrying in ${delay}ms... (${retries} retries left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateGeminiWithRetry(
        userPrompt,
        config,
        retries - 1,
        delay * 2,
      );
    }
    throw err;
  }
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
    const config = {
      systemInstruction: systemPrompt,
      temperature: 0.9,
      maxOutputTokens: isJson ? 8192 : 4096,
    };
    if (isJson) {
      config.responseMimeType = "application/json";
    }

    try {
      return await generateGeminiWithRetry(userPrompt, config, 2);
    } catch (geminiErr) {
      console.warn(
        "[generateWithModel] Gemini exhausted or failed, falling back to Groq:",
        geminiErr.message,
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
