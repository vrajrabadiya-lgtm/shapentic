import { generateWithModel } from "../lib/ai-clients.js";

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

  const intent = await safeRun("Planner Agent", () => runPlannerAgent(plan, prompt));

  // If the planner failed, we can't proceed meaningfully — throw a clear error
  if (!intent) {
    throw new Error(
      "AI Planner Agent failed. This is likely because no AI API keys are configured. " +
      "Set ANTHROPIC_API_KEY, GROQ_API_KEY, or GOOGLE_PROJECT_ID+GOOGLE_LOCATION in your .env file, " +
      "or use the local fallback path via /api/generate-blueprint."
    );
  }

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

  return {
    phases: {
      planner: intent,
      designer: designSystem,
      threeDScene: scenePlan,
      componentPlanner: componentPlan,
      code: codeOutput,
      debugger: debugReport,
      deployer: deployment,
    },
    summary: {
      architecture:
        "Planner → UI Designer → 3D Scene → Component Planner → Code → Debugger → Deployer",
      readyForDeploy: deployment.readyForDeploy,
    },
  };
}
