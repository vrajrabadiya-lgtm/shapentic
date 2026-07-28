/**
 * AI Routes — Express Router for AI-powered endpoints
 *
 * Provides:
 *   GET  /health              — Health check
 *   GET  /check-credits       — Check user credits (Supabase)
 *   POST /generate-blueprint  — Generate website blueprint
 *   POST /generate-agentic-website — Run full agentic pipeline
 *   POST /generate-code       — Generate code from blueprint
 *   POST /generate-3d-model   — Generate 3D model (Meshy fallback)
 *
 * All endpoints wrapped in try/catch → res.status(500).json({ error: err.message })
 */

import { Router } from "express";
import { analyzePrompt } from "../core/AIArchitect.js";
import { generateBlueprint } from "../core/BlueprintGenerator.js";
import { runAgenticWebsitePipeline } from "../core/AgentWebsiteOrchestrator.js";
import { generateAllCode } from "../core/CodeGenerator.js";
import { generateWebsiteBlueprint } from "../core/WebsiteBlueprintEngine.js";
import { resolveUserCredits } from "../lib/ai-clients.js";
import { buildLocalBlueprint } from "../core/BlueprintGenerator.js";

/**
 * Check which AI providers are configured and return a status object.
 */
function getConfigStatus() {
  const providers = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push('claude');
  if (process.env.GROQ_API_KEY) providers.push('groq');
  if (process.env.GEMINI_API_KEY) providers.push('gemini');
  return {
    hasAnyAI: providers.length > 0,
    providers,
    message: providers.length > 0
      ? `AI providers configured: ${providers.join(', ')}`
      : 'No AI API keys configured. Using local code generation (all features work, but AI-generated content uses templates).',
  };
}

const router = Router();

// ─── GET /health ──────────────────────────────────────────────────────────────

router.get("/health", (req, res) => {
  try {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      config: getConfigStatus(),
      env: {
        node: process.version,
        port: process.env.PORT || 5000,
        mongodb: !!process.env.MONGO_URI ? "configured" : "using default",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /check-credits ───────────────────────────────────────────────────────

router.get("/check-credits", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const credits = await resolveUserCredits(authHeader);

    if (!credits) {
      return res.json({
        authenticated: false,
        can_build: true,
        plan: "free",
        builds_used: 0,
        builds_limit: 3,
      });
    }

    return res.json({
      authenticated: true,
      can_build: credits.can_build,
      userId: credits.userId,
      plan: credits.plan,
      builds_used: credits.builds_used,
      builds_limit: credits.builds_limit,
      video_used: credits.video_used,
      video_limit: credits.video_limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /generate-blueprint ─────────────────────────────────────────────────

router.post("/generate-blueprint", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const intent = analyzePrompt(prompt);
    const blueprint = await generateBlueprint(intent);

    res.json({ blueprint, plan: intent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /generate-agentic-website ───────────────────────────────────────────

router.post("/generate-agentic-website", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const intent = analyzePrompt(prompt);
    
    // Try the AI pipeline first, fall back to local generation on any failure
    let result = null;
    let blueprint = null;
    let designSystem = {};

    try {
      result = await runAgenticWebsitePipeline({ plan: "free", prompt });

      // Generate the 3 renderable components from the pipeline's blueprint
      if (result?.phases?.code?.files) {
        blueprint = {
          websiteBlueprint: {
            website_name: result.phases.planner?.projectType ?? "My Site",
            business_type: result.phases.planner?.projectType ?? "technology",
            design_style: result.phases.designer?.cardStyle ?? "Futuristic",
            color_palette: {
              primary:    result.phases.designer?.primary    ?? "#3d5eff",
              secondary:  result.phases.designer?.secondary  ?? "#00d4ff",
              accent:     result.phases.designer?.accent     ?? "#bf5fff",
              background: result.phases.designer?.background ?? "#0a0a14",
              text:       result.phases.designer?.text       ?? "#f0f0ff",
            },
            hero: {
              headline:      `Welcome to ${result.phases.planner?.projectType ?? "My Site"}`,
              subheadline:   prompt,
              cta_primary:   "Get Started",
              cta_secondary: "Learn More",
              layout:        result.phases.designer?.layout?.heroMode ?? "split",
              three_d_object: { type: result.phases.threeDScene?.heroObject ?? "floating-sphere" },
            },
            sections: result.phases.componentPlanner?.components
              ?.filter(c => !["Navbar","Footer"].includes(c.name))
              .map(c => ({ type: "features", title: c.name, id: c.name.toLowerCase() })) ?? [],
          },
        };
        designSystem = result.phases.designer ?? {};
      }
    } catch (pipelineErr) {
      // Pipeline failed (likely no AI API keys). Use local fallback.
      console.warn("[generate-agentic-website] AI pipeline failed, falling back to local generation:", pipelineErr.message.slice(0, 100));
    }

    // If the AI pipeline didn't produce a usable blueprint, build one locally
    if (!blueprint) {
      blueprint = buildLocalBlueprint(intent);
      // Extract color palette from local blueprint for design system
      const pal = blueprint?.palette ?? {};
      designSystem = {
        primary: pal.primary ?? "#3d5eff",
        secondary: pal.secondary ?? "#00d4ff",
        accent: pal.accent ?? "#bf5fff",
        background: pal.background ?? "#0a0a14",
        text: pal.text ?? "#f0f0ff",
        cardStyle: blueprint?.concept?.designStyle === "Luxury" ? "glass" : "solid",
      };
    }

    const code = generateAllCode(blueprint);

    res.json({
      result,
      plan: intent,
      components: {
        heroJSX:       code.heroJSX,
        sceneJSX:      code.sceneJSX,
        sampleSection: code.sampleSection,
        installCmd:    code.installCmd,
      },
      designSystem,
      config: getConfigStatus(),
    });
  } catch (err) {
    console.error("[generate-agentic-website] Fatal error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /generate-code ──────────────────────────────────────────────────────

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

// ─── POST /generate-3d-model ──────────────────────────────────────────────────

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
