import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { logger } from "./logger.js";

let _bedrockClient = null;

function getBedrockClient() {
  if (!_bedrockClient) {
    _bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    });
  }
  return _bedrockClient;
}

export function parseCleanJson(raw) {
  const clean = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = clean.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sliced);
      } catch (innerErr) {
        const firstBracket = clean.indexOf("[");
        const lastBracket = clean.lastIndexOf("]");
        if (firstBracket !== -1 && lastBracket > firstBracket) {
          const slicedArray = clean.slice(firstBracket, lastBracket + 1);
          return JSON.parse(slicedArray);
        }
        throw innerErr;
      }
    }
    throw err;
  }
}

function withTimeout(promise, timeoutMs = 90000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`AWS Bedrock request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([
    promise.then(res => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise
  ]);
}

export class AIProvider {
  /**
   * Generates unstructured text content from a prompt.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {string} [plan="free"]
   * @returns {Promise<string>}
   */
  static async generateText(systemPrompt, userPrompt, plan = "free") {
    const client = getBedrockClient();
    const modelId = process.env.AWS_BEDROCK_TEXT_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";
    const maxTokens = 4096;

    const command = new ConverseCommand({
      modelId,
      messages: [
        {
          role: "user",
          content: [{ text: userPrompt }]
        }
      ],
      system: [
        { text: systemPrompt }
      ],
      inferenceConfig: {
        maxTokens,
        temperature: 0.7,
      }
    });

    const startMs = Date.now();
    let error = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let response;

    const executeCall = async () => {
      return await withTimeout(client.send(command), 90000);
    };

    let retries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        response = await executeCall();
        break;
      } catch (err) {
        error = err;
        const isThrottled = err.name === "ThrottlingException" || err.$metadata?.httpStatusCode === 429;
        const isNetwork = err.name === "ServiceUnavailableException" || err.code === "ENOTFOUND" || err.code === "ECONNRESET" || err.message?.includes("network") || err.message?.includes("fetch") || err.message?.includes("timeout");
        
        if ((isThrottled || isNetwork) && attempt <= retries) {
          logger.warn(`[AIProvider] Attempt ${attempt} failed (Throttled/Network: ${err.name || err.code || err.message}). Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }

    const latency = Date.now() - startMs;
    inputTokens = response?.usage?.inputTokens || 0;
    outputTokens = response?.usage?.outputTokens || 0;

    // Log Telemetry
    console.log(JSON.stringify({
      level: "INFO",
      timestamp: new Date().toISOString(),
      message: "[AI Telemetry]",
      provider: "AWS Bedrock",
      model: modelId,
      latencyMs: latency,
      inputTokens,
      outputTokens,
      error: error ? error.message : null
    }));

    const text = response?.output?.message?.content?.[0]?.text || "";
    return text.trim();
  }

  /**
   * Generates structured JSON data from a prompt.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {string} [plan="free"]
   * @returns {Promise<object>}
   */
  static async generateJSON(systemPrompt, userPrompt, plan = "free") {
    const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not wrap in markdown block. Do not provide explanations or extra text.`;
    
    let retries = 3;
    let delay = 1000;
    let lastError = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const rawText = await this.generateText(enhancedSystemPrompt, userPrompt, plan);
        const parsed = parseCleanJson(rawText);
        return parsed;
      } catch (err) {
        lastError = err;
        if (attempt <= retries) {
          logger.warn(`[AIProvider] JSON generation/parsing failed on attempt ${attempt}: ${err.message}. Retrying...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
      }
    }
    throw lastError;
  }

  /**
   * Generates the entire website blueprint.
   * @param {object} intent
   * @returns {Promise<object>}
   */
  static async generateBlueprint(intent) {
    const systemPrompt = `You are a professional website blueprint architect. You generate a complete, valid website blueprint JSON structure based on the user's intent. The output must strictly conform to the expected schema with a landing page, navigation links, layout archetype, and visual styling properties.`;
    const userPrompt = `Generate a blueprint for a website named "${intent.websiteName}" in the "${intent.industry}" industry. Original user prompt: "${intent.prompt}"`;
    return await this.generateJSON(systemPrompt, userPrompt);
  }

  /**
   * Generates individual sections or code patches.
   * @param {string} prompt
   * @returns {Promise<object>}
   */
  static async generateSections(prompt) {
    const systemPrompt = `You are a professional React and UI component planner. Generate a JSON array representing the page sections and structure.`;
    return await this.generateJSON(systemPrompt, prompt);
  }
}
