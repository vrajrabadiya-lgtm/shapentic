import { AIProvider } from "./AIProvider.js";
import { 
  buildLocalBlueprint, 
  inferBusinessType, 
  getIndustryHeroData, 
  inferHeroLayout, 
  getThemeVisualIdentity,
  getIndustrySectionMapping,
  getIntelligentDomainContent,
  PAGE_SECTIONS
} from "./BlueprintGenerator.js";
import { generateLayoutPlan } from "../src/planner/LayoutPlanner.js";
import { generateScenePlan } from "../src/planner/ScenePlanner.js";
import { BlueprintAdapterV1 } from "./BlueprintAdapterV1.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { BlueprintValidator } from "./BlueprintValidator.js";



function parseExplicitPages(text) {
  const match = text.match(/(?:navigation\s+links|nav\s+links|pages|navbar|menu)\s*(?:must\s+be|should\s+be)?\s*[:=]\s*([a-zA-Z0-9,\s&]+)/i);
  if (match) {
    const items = match[1].split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.replace(/\b\w/g, c => c.toUpperCase()));
    if (items.length > 0) {
      const filtered = items.filter(item => item.toLowerCase() !== 'home');
      return ['Home', ...filtered];
    }
  }
  return null;
}

function parseExplicitSections(prompt, defaultThree) {
  const match = prompt.match(/(?:landing\s+page\s+)?sections?\s*(?:must\s+be|should\s+be)?\s*[:=]\s*([a-zA-Z0-9,\s&-]+)/i);
  if (match) {
    const items = match[1].split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    if (items.length > 0) {
      return items.map(name => {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
        const componentName = `${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}Section`;
        const id = name.toLowerCase().replace(/\s+/g, '-');
        return {
          id,
          name,
          componentName,
          purpose: `Specialized ${name} section`,
          animation: "slide-up",
          threeObject: defaultThree,
          content: { heading: name }
        };
      });
    }
  }
  return null;
}

export class BlueprintService {
  /**
   * Generates a website blueprint from intent.
   * Uses AWS Bedrock as primary provider, falls back to local generation.
   * @param {object} intent - Intent object containing prompt, websiteName, industry, etc.
   * @returns {Promise<object>} Blueprint JSON
   */
  static async generate(intent) {
    // This method is now exclusively responsible for the V1 legacy fallback generation.
    // The primary V2 pipeline is handled by AgentWebsiteOrchestrator and is not called from this service.
    const startMs = Date.now();
    
    console.log(`[BlueprintService] Invoking legacy blueprint generation path.`);
    
    // 1. Generate a blueprint using the V1 local template-based system.
    const v1Blueprint = buildLocalBlueprint(intent);
    
    // 2. Adapt the V1 blueprint to a V2-compatible structure.
    // This isolates all legacy-to-v2 conversion logic within the adapter.
    const adaptedBlueprint = BlueprintAdapterV1.adapt(v1Blueprint, intent);
    
    const duration = Date.now() - startMs;
    console.log(`[BlueprintService] Legacy blueprint generation and adaptation completed in ${duration}ms.`);
    
    return adaptedBlueprint;
  }
}
