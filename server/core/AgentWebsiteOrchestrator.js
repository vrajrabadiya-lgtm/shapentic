import { generateWithModel } from "../lib/ai-clients.js";
import { ReasoningEngine } from "./planner/v3/ReasoningEngine.js";
import { BlueprintValidator } from "./BlueprintValidator.js";

function parseJsonResponse(raw, agentName) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`${agentName} returned invalid JSON: ${error.message}`);
  }
}

// NOTE: runPlannerAgent is deprecated and will be removed.
// It is replaced by the V3 ReasoningEngine.
async function runPlannerAgent(plan, prompt) {
  const system = `You are Planner Agent.
Return only JSON. No markdown.
Convert a website request into structured intent.`;

  const user = `Prompt: "${prompt}"

Return JSON with this exact schema:
{
  "projectType": "startup|agency|ecommerce|portfolio|saas|other",
  "theme": "dark|light|mixed",
  "style": "futuristic|minimal|luxury|corporate|gaming|custom",
  "animations": true,
  "threeD": true,
  "pages": ["home", "pricing", "about", "contact"],
  "sections": ["navbar", "hero", "features", "pricing", "testimonials", "contact", "footer"],
  "notes": []
}`;

  const raw = await generateWithModel(plan, system, user);
  return parseJsonResponse(raw, "Planner Agent");
}

async function runUiDesignerAgent(plan, prompt, intent) {
  const system = `You are UI Designer Agent.
Return only JSON. No markdown.
Generate a production-ready design system for a modern 3D website.`;

  const user = `Original prompt: "${prompt}"
Intent JSON:
${JSON.stringify(intent, null, 2)}

Return JSON:
{
  "background": "#hex",
  "primary": "#hex",
  "secondary": "#hex",
  "accent": "#hex",
  "text": "#hex",
  "fontHeading": "Inter",
  "fontBody": "Inter",
  "cardStyle": "glass|solid|gradient",
  "radius": "16px",
  "shadowStyle": "soft|neon|none",
  "spacingScale": "comfortable|compact",
  "animationLanguage": "framer-motion",
  "layout": {
    "container": "max-w-7xl mx-auto",
    "heroMode": "split|fullscreen|overlay",
    "sectionOrder": []
  }
}`;

  const raw = await generateWithModel(plan, system, user);
  return parseJsonResponse(raw, "UI Designer Agent");
}

export async function runThreeDSceneAgent(plan, prompt, intent, designSystem) {
  const system = `You are 3D Scene Agent.
Return only JSON. No markdown.
Create an implementable React Three Fiber scene plan.`;

  const user = `Original prompt: "${prompt}"
Intent:
${JSON.stringify(intent, null, 2)}
Design system:
${JSON.stringify(designSystem, null, 2)}

Return JSON:
{
  "sceneName": "",
  "heroObject": "ai-brain|robot|earth|rocket|car|phone|blob|dna|particles|custom",
  "camera": { "fov": 55, "position": [0, 0, 6] },
  "lights": [
    { "type": "ambient", "intensity": 0.5, "color": "#hex" },
    { "type": "point", "intensity": 1.2, "position": [4, 4, 4], "color": "#hex" }
  ],
  "effects": ["float", "rotate", "mouse-follow", "bloom"],
  "performance": {
    "mobileFallback": "static-gradient",
    "adaptiveQuality": true,
    "lazyLoadScene": true
  },
  "r3fDependencies": ["three", "@react-three/fiber", "@react-three/drei"]
}`;

  const raw = await generateWithModel(plan, system, user);
  return parseJsonResponse(raw, "3D Scene Agent");
}

async function runComponentPlannerAgent(plan, prompt, intent, designSystem) {
  const system = `You are Component Planner Agent.
Return only JSON. No markdown.
Plan page/component architecture for Next.js App Router.`;

  const user = `Prompt: "${prompt}"
Intent:
${JSON.stringify(intent, null, 2)}
Design:
${JSON.stringify(designSystem, null, 2)}

Return JSON:
{
  "folders": ["app", "components", "components/sections", "components/3d", "lib", "types"],
  "routes": [{ "name": "home", "path": "/", "file": "app/page.tsx" }],
  "components": [
    { "name": "Navbar", "file": "components/sections/Navbar.tsx" },
    { "name": "Hero3D", "file": "components/sections/Hero3D.tsx" },
    { "name": "Features", "file": "components/sections/Features.tsx" },
    { "name": "Pricing", "file": "components/sections/Pricing.tsx" },
    { "name": "Testimonials", "file": "components/sections/Testimonials.tsx" },
    { "name": "Contact", "file": "components/sections/Contact.tsx" },
    { "name": "Footer", "file": "components/sections/Footer.tsx" }
  ],
  "libraries": {
    "framework": "next",
    "styling": "tailwindcss",
    "animation": ["framer-motion"],
    "threeD": ["three", "@react-three/fiber", "@react-three/drei"]
  }
}`;

  const raw = await generateWithModel(plan, system, user);
  return parseJsonResponse(raw, "Component Planner Agent");
}

async function runCodeAgent(
  plan,
  prompt,
  intent,
  designSystem,
  scenePlan,
  componentPlan,
) {
  const system = `You are Code Agent.
Return only JSON. No markdown.
Generate starter files for a Next.js + Tailwind + React Three Fiber website.`;

  const user = `Prompt: "${prompt}"
Intent:
${JSON.stringify(intent, null, 2)}
Design system:
${JSON.stringify(designSystem, null, 2)}
3D scene plan:
${JSON.stringify(scenePlan, null, 2)}
Component plan:
${JSON.stringify(componentPlan, null, 2)}

Return JSON:
{
  "packageJson": {
    "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
    "dependencies": {},
    "devDependencies": {}
  },
  "files": {
    "app/layout.tsx": "",
    "app/page.tsx": "",
    "components/3d/HeroScene.tsx": "",
    "components/sections/Navbar.tsx": "",
    "components/sections/Hero3D.tsx": "",
    "components/sections/Features.tsx": "",
    "components/sections/Pricing.tsx": "",
    "components/sections/Testimonials.tsx": "",
    "components/sections/Contact.tsx": "",
    "components/sections/Footer.tsx": "",
    "app/globals.css": ""
  }
}

Rules:
- TSX only
- Tailwind classes
- Use Framer Motion where relevant
- Use React Three Fiber in HeroScene
- Intelligent Content Generation: Generate distinct, industry-specific Feature titles, Descriptions, Testimonials, Pricing plans, FAQs, Statistics, Mission statement, and Company values that match the domain and user intent.
- NEVER generate placeholder content or generic copy such as 'Lorem Ipsum', 'Feature One', 'Feature Two', 'The Future of...', or simple filler copy.`;

  const raw = await generateWithModel(plan, system, user);
  return parseJsonResponse(raw, "Code Agent");
}

function runDebuggerAgent(codeOutput) {
  const files = codeOutput?.files ?? {};
  const requiredFiles = [
    "app/layout.tsx",
    "app/page.tsx",
    "components/3d/HeroScene.tsx",
    "app/globals.css",
  ];

  const missingFiles = requiredFiles.filter((file) => !files[file]);
  const todoMarkers = Object.entries(files)
    .filter(
      ([, content]) => typeof content === "string" && content.includes("TODO"),
    )
    .map(([name]) => name);

  const status =
    missingFiles.length === 0 && todoMarkers.length === 0 ? "pass" : "fail";

  return {
    status,
    missingFiles,
    todoMarkers,
    suggestedFixes: [
      ...missingFiles.map((file) => `Generate missing file: ${file}`),
      ...todoMarkers.map((file) => `Remove TODO markers from: ${file}`),
    ],
  };
}

function runDeployAgent(debugReport) {
  return {
    readyForDeploy: debugReport.status === "pass",
    previewBuilder: ["npm install", "npm run build", "npm run start"],
    deployProvider: "vercel",
    deploySteps: ["vercel login", "vercel --prod"],
  };
}

export async function runAgenticWebsitePipeline({ plan, prompt }) {
  // Wrap each agent call in try/catch so one failure doesn't crash the whole pipeline.
  // If an agent fails, we use a sensible default for that phase and continue.

  async function safeRun(agentName, fn) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[AgentWebsiteOrchestrator] ${agentName} failed: ${err.message.slice(0, 120)}`);
      return null;
    }
  }

  // =================================================================
  // == V3 PLANNER: AI REASONING ENGINE                           ==
  // =================================================================
  // This is the new, primary planning step. It generates a rich,
  // comprehensive blueprint directly from the user prompt.
  const v3Blueprint = await safeRun("Reasoning Engine", () => ReasoningEngine.generateBlueprintV3(prompt));

  // If the new planner failed, we cannot proceed.
  if (!v3Blueprint) {
    throw new Error(
      "AI Reasoning Engine failed. This is likely because no AI API keys are configured. " +
      "Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your .env file."
    );
  }

  // =================================================================
  // == V3 BLUEPRINT VALIDATION                                   ==
  // =================================================================
  const validationReport = BlueprintValidator.validate(v3Blueprint);
  console.log(`[BlueprintValidator] ${validationReport.summary}`);

  if (validationReport.errors.length > 0) {
    // TODO: In the future, trigger the RepairEngine here.
    // For now, we stop execution as requested.
    throw new Error(`Blueprint validation failed with ${validationReport.errors.length} errors. Halting pipeline.`);
  }

  // Adapt the rich V3 blueprint to the simple `intent` object required by legacy agents.
  const intent = ReasoningEngine.adaptV3BlueprintToLegacyIntent(v3Blueprint);
  // =================================================================


  const designSystem = await safeRun("UI Designer Agent", () =>
    runUiDesignerAgent(plan, prompt, intent)
  );

  const scenePlan = await safeRun("3D Scene Agent", () =>
    runThreeDSceneAgent(plan, prompt, intent, designSystem || {})
  );

  const componentPlan = await safeRun("Component Planner Agent", () =>
    runComponentPlannerAgent(plan, prompt, intent, designSystem || {})
  );

  const codeOutput = await safeRun("Code Agent", () =>
    runCodeAgent(
      plan,
      prompt,
      intent,
      designSystem || {},
      scenePlan || {},
      componentPlan || {},
    )
  );

  const debugReport = runDebuggerAgent(codeOutput || { files: {} });
  const deployment = runDeployAgent(debugReport);

  // =================================================================
  // == V3 Blueprint Assembly                                     ==
  // =================================================================
  // Start with the rich V3 blueprint and enrich it with details from other agents.
  const finalBlueprint = v3Blueprint;

  // Merge Design System from the UI Designer Agent
  if (designSystem) {
    finalBlueprint.brand.colors = {
      primary:    designSystem.primary    || finalBlueprint.brand.colors.primary,
      secondary:  designSystem.secondary  || finalBlueprint.brand.colors.secondary,
      accent:     designSystem.accent     || finalBlueprint.brand.colors.accent,
      background: designSystem.background || finalBlueprint.brand.colors.background,
      text:       designSystem.text       || finalBlueprint.brand.colors.text,
    };
    finalBlueprint.brand.fonts = {
        heading: designSystem.fontHeading || finalBlueprint.brand.fonts.heading,
        body: designSystem.fontBody || finalBlueprint.brand.fonts.body,
    };
  }

  // Merge Scene Plan from the 3D Scene Agent
  if (scenePlan) {
    finalBlueprint.requirements.scene = finalBlueprint.requirements.scene || [];
    finalBlueprint.requirements.scene.push(
        `Hero Object: ${scenePlan.heroObject}`,
        `Camera: ${JSON.stringify(scenePlan.camera)}`,
        `Lights: ${JSON.stringify(scenePlan.lights)}`,
        `Effects: ${scenePlan.effects.join(', ')}`
    );
  }

  // Ensure the final object has a version number for compatibility
  finalBlueprint.version = "3.0.0";
  finalBlueprint.meta = {
      source: "V3ReasoningEnginePipeline",
      generatedAt: new Date().toISOString(),
      prompt: prompt,
  };


  return {
    blueprint: finalBlueprint, // <-- The new canonical V3 blueprint
    phases: {
      planner: intent, // The legacy intent for compatibility
      v3Planner: v3Blueprint, // The new rich blueprint
      designer: designSystem,
      threeDScene: scenePlan,
      componentPlanner: componentPlan,
      code: codeOutput,
      debugger: debugReport,
      deployer: deployment,
    },
    summary: {
      architecture:
        "V3_Reasoning_Engine → UI Designer → 3D Scene → Component Planner → Code → Debugger → Deployer",
      readyForDeploy: deployment.readyForDeploy,
    },
  };
}
