/**
 * AI Routes — Express Router for AI-powered endpoints
 *
 * Provides:
 *   GET  /health                   — Health check
 *   POST /generate-agentic-website  — V2 PIPELINE: Run full agentic pipeline (AI-first)
 *   POST /generate-legacy-website  — V1 PIPELINE: Generate website from legacy templates (fallback)
 *
 * All endpoints wrapped in try/catch → res.status(500).json({ error: err.message })
 */

import { Router } from "express";
import { analyzePrompt } from "../core/AIArchitect.js";
import { BlueprintService } from "../core/BlueprintService.js";
import { runAgenticWebsitePipeline } from "../core/AgentWebsiteOrchestrator.js";
import { generateAllCode } from "../core/CodeGenerator.js";
import { resolveUserCredits } from "../lib/ai-clients.js";
import { validateBlueprintDomain } from "../core/BlueprintGenerator.js";

function getConfigStatus() {
  // ... (implementation remains the same)
}

const router = Router();

// ─── GET /health ──────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  // ... (implementation remains the same)
});

// ─── GET /check-credits ───────────────────────────────────────────────────────
router.get("/check-credits", async (req, res) => {
  // ... (implementation remains the same)
});


// ─── V2 PIPELINE: /generate-agentic-website ───────────────────────────────────
router.post("/generate-agentic-website", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    // 1. Run the pure V2 agentic pipeline. This is the primary, AI-first path.
    // It is expected to return a canonical Blueprint V2 or throw an error.
    // There is no fallback from this point forward.
    console.log("[V2 Pipeline] Initiating agentic website generation.");
    const result = await runAgenticWebsitePipeline({ plan: "free", prompt });
    const blueprint = result?.blueprint;

    if (!blueprint) {
      console.error("[V2 Pipeline] Agentic pipeline failed to return a blueprint.");
      return res.status(500).json({ error: "AI pipeline failed to generate a valid website blueprint." });
    }
    
    // 2. Generate code from the pure V2 blueprint.
    // The `generateAllCode` function now receives a trusted, canonical blueprint.
    console.log("[V2 Pipeline] Blueprint received, generating code.");
    const code = generateAllCode(blueprint);

    // 3. Return the complete result.
    res.json({
      pipeline: "V2_Agentic",
      result,
      plan: result.plan,
      blueprint: result.blueprint,
      components: {
        heroJSX:       code.heroJSX,
        sceneJSX:      code.sceneJSX,
        sampleSection: code.sampleSection,
        installCmd:    code.installCmd,
      },
      designSystem: result?.phases?.designer ?? {},
      config: getConfigStatus(),
    });

  } catch (err) {
    console.error("[V2 Pipeline] Fatal error:", err);
    res.status(500).json({ error: `Agentic pipeline failed: ${err.message}` });
  }
});

// ─── V1 PIPELINE: /generate-legacy-website ────────────────────────────────────
router.post("/generate-legacy-website", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }
    
    // 1. Analyze prompt to get intent for the legacy generator.
    const intent = analyzePrompt(prompt);
    
    // 2. Use the dedicated legacy service.
    // This calls `buildLocalBlueprint` and then adapts the result to a V2-compatible format.
    console.log("[V1 Pipeline] Initiating legacy website generation.");
    const blueprint = await BlueprintService.generate(intent);

    if (!blueprint) {
      console.error("[V1 Pipeline] Legacy pipeline failed to return a blueprint.");
      return res.status(500).json({ error: "Legacy pipeline failed to generate a valid website blueprint." });
    }

    // 3. Generate code from the adapted blueprint.
    console.log("[V1 Pipeline] Adapted blueprint received, generating code.");
    const code = generateAllCode(blueprint);

    // 4. Return the complete result in a format consistent with the V2 endpoint.
    res.json({
      pipeline: "V1_Legacy",
      plan: intent,
      blueprint,
      components: {
        heroJSX:       code.heroJSX,
        sceneJSX:      code.sceneJSX,
        sampleSection: code.sampleSection,
        installCmd:    code.installCmd,
      },
      designSystem: blueprint.brand?.palette ?? {},
      config: getConfigStatus(),
    });

  } catch (err) {
    console.error("[V1 Pipeline] Fatal error:", err);
    res.status(500).json({ error: `Legacy pipeline failed: ${err.message}` });
  }
});


// ─── DEPRECATED ENDPOINTS (Stubs) ─────────────────────────────────────────────

router.post("/generate-blueprint", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const intent = analyzePrompt(prompt);

    const blueprint = await BlueprintService.generate(intent);

    res.json({
      blueprint,
      plan: intent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate-code", async (req, res) => {
  try {
    const { prompt, blueprint } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    if (!blueprint) {
      return res.status(400).json({ error: "blueprint is required" });
    }

    const code = generateAllCode(blueprint);

    res.json({
      code: {
        heroJSX: code.heroJSX,
        sceneJSX: code.sceneJSX,
        sampleSection: code.sampleSection,
      },
      fileTree: code.fileTree,
      appJSX: code.appJSX,
      installCmd: code.installCmd,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate-3d-model", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const MESHY_API_KEY = process.env.MESHY_API_KEY;

    // If Meshy API key is not configured, return fallback
    if (!MESHY_API_KEY) {
      return res.json({
        modelUrl: null,
        previewUrl: null,
        fallback: true,
        status: "fallback",
        message: "MESHY_API_KEY not configured. 3D model generation requires a Meshy API key.",
      });
    }

    try {
      const response = await fetch("https://api.meshy.ai/v1/image-to-3d", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MESHY_API_KEY}`,
        },
        body: JSON.stringify({
          image_url: "",
          prompt: prompt,
          negative_prompt: "low quality, blurry, distorted",
        }),
      });

      if (!response.ok) {
        throw new Error(`Meshy API returned ${response.status}`);
      }

      const data = await response.json();
      res.json({
        modelUrl: data.model_urls?.glb || null,
        previewUrl: data.preview_url || null,
        fallback: false,
        status: "success",
      });
    } catch (meshyErr) {
      // Meshy failed — return graceful fallback
      console.warn("[generate-3d-model] Meshy API error:", meshyErr.message);
      res.json({
        modelUrl: null,
        previewUrl: null,
        fallback: true,
        status: "fallback",
        message: "3D model generation unavailable at this time.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
