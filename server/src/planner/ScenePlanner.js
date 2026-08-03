/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SCENE PLANNER – PREMIUM 3D EXPERIENCE ENGINE (PHASE 10)
 *  Intelligent engine that analyzes user intent, domain industry, and visual
 *  theme to synthesize tailored 3D experiences, camera rigs, and lighting.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SCENE_REGISTRY, getScenesForIndustry, getSceneById } from "../3d/sceneRegistry.js";

// Dedicated Domain to Scene mappings (Phase 10 Step 3 & 9)
const DIRECT_INDUSTRY_SCENE_MAP = {
  "Portfolio": "InteractivePlanetScene",
  "Developer Portfolio": "InteractivePlanetScene",
  "Developer": "FloatingSkillsScene",
  "Restaurant": "FloatingFoodScene",
  "Food": "RotatingPlateScene",
  "Cafe": "SteamScene",
  "Healthcare": "DNAHelixScene",
  "Clinic": "MedicalMoleculesScene",
  "Medical": "DNAHelixScene",
  "SaaS": "DashboardScene",
  "Automobile": "VehicleShowcaseScene",
  "Auto": "ProductPedestalScene",
  "Agency": "FloatingCardsScene",
  "Studio": "GlassObjectsScene",
  "Fashion": "ProductPedestalScene",
  "Luxury": "FloatingFabricScene",
  "Law Firm": "GlassCubeScene",
  "Legal": "GlassCubeScene",
  "Photography": "LightBeamScene",
  "Fitness": "EnergyCoreScene",
  "Gym": "EnergyCoreScene",
  "Travel": "GradientCloudScene",
  "Education": "ConstellationScene",
  "Space": "ParticleGalaxyScene",
  "Gaming": "NeonTunnelScene",
  "FinTech": "GlassOrbScene",
  "Real Estate": "WireframeWorldScene"
};

/**
 * Main entrypoint to generate a complete 3D scene plan
 */
export function generateScenePlan(bp = {}, prompt = "", industry = "Technology", theme = "modernDark", pageType = "Home") {
  const normIndustry = String(industry || bp.industry || "Technology").trim();
  const lowerPrompt = (prompt || "").toLowerCase();

  // 1. Resolve selected scene ID prioritizing blueprint selection, then fallback to mappings
  let sceneId = bp.heroScene?.type || bp.scene?.sceneId || bp.scene_plan?.sceneId;
  
  if (!sceneId || !SCENE_REGISTRY[sceneId]) {
    sceneId = DIRECT_INDUSTRY_SCENE_MAP[normIndustry];
    if (!sceneId) {
      for (const [key, val] of Object.entries(DIRECT_INDUSTRY_SCENE_MAP)) {
        const regex = new RegExp(`\\b${key}\\b`, "i");
        if (regex.test(normIndustry) || regex.test(lowerPrompt)) {
          sceneId = val;
          break;
        }
      }
    }

    // Check prompt keywords for explicit scene hints using regex word boundaries
    if (/\b(planet|globe|space|aerospace|galaxy|constellation|satellite)\b/i.test(lowerPrompt)) sceneId = "ParticleGalaxyScene";
    else if (/\b(dashboard|analytics|saas|workflow)\b/i.test(lowerPrompt)) sceneId = "DashboardScene";
    else if (/\b(dna|helix|molecule|genomics|medical|healthcare)\b/i.test(lowerPrompt)) sceneId = "DNAHelixScene";
    else if (/\b(cards?|card portfolio|agency|branding)\b/i.test(lowerPrompt)) sceneId = "FloatingCardsScene";
    else if (/\b(vehicle|cars?|auto|automotive|automobile|turntable)\b/i.test(lowerPrompt)) sceneId = "VehicleShowcaseScene";
    else if (/\b(food|menu|restaurant|plate|culinary|dining)\b/i.test(lowerPrompt)) sceneId = "FloatingFoodScene";
    else if (/\b(pedestal|fashion|apparel|luxury|couture)\b/i.test(lowerPrompt)) sceneId = "ProductPedestalScene";

    // If still undetermined, pick the best match from registry
    if (!sceneId) {
      const candidates = getScenesForIndustry(normIndustry);
      sceneId = candidates[0]?.id || "FloatingBlobScene";
    }
  }

  const sceneMeta = getSceneById(sceneId);

  // 2. Resolve Camera Preset
  let cameraPreset = sceneMeta.cameraPreset || "Hero Camera";
  if (pageType !== "Home") cameraPreset = "Wide";

  // 3. Resolve Lighting Preset based on Theme & Scene
  let lightingPreset = sceneMeta.lightingPreset || "Studio";
  if (theme === "modernDark" || theme === "linear") lightingPreset = "Dark Tech";
  else if (theme === "apple" || theme === "vercel") lightingPreset = "Apple";
  else if (theme === "stripe" || theme === "notion") lightingPreset = "Glass";
  else if (theme === "minimal") lightingPreset = "Studio";
  else if (theme === "framer") lightingPreset = "Cinematic";
  else if (lowerPrompt.includes("neon") || lowerPrompt.includes("cyberpunk") || normIndustry === "Gaming") lightingPreset = "Neon";
  else if (lowerPrompt.includes("warm") || lowerPrompt.includes("sunset") || normIndustry === "Restaurant") lightingPreset = "Sunset";

  // 4. Resolve Interaction & Animation Presets
  const defaultAnims = sceneMeta.defaultAnimations || ["Idle Float", "Hover Rotation"];
  const interactionPreset = defaultAnims.length > 0 ? defaultAnims[0] : "Hover Rotation";

  // 5. Compute performance profile
  let qualityProfile = "High";
  if (sceneMeta.performanceCost === "Low" || sceneMeta.performanceCost === "Medium") {
    qualityProfile = "High"; // Lightweight scenes run High by default
  } else {
    qualityProfile = "High"; // Responsive performance layer will downgrade at runtime if device FPS drops
  }

  return {
    selectedScene: sceneId,
    sceneName: sceneMeta.name,
    complexity: sceneMeta.complexity,
    animationPreset: [...defaultAnims],
    cameraPreset,
    lightingPreset,
    interactionPreset,
    performanceCost: sceneMeta.performanceCost,
    qualityProfile,
    supportedThemes: sceneMeta.supportedThemes || ["modernDark", "apple", "vercel", "linear", "stripe", "framer", "notion", "minimal"]
  };
}
