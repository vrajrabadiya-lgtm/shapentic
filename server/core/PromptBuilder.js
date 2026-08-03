import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SCENE_REGISTRY } from "../src/3d/sceneRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PromptBuilder
 * 
 * Assembles the V2 system prompt dynamically from modular instruction text files.
 */
export class PromptBuilder {
  static buildSystemPrompt() {
    const promptsDir = path.join(__dirname, "prompts");
    
    try {
      const core = fs.readFileSync(path.join(promptsDir, "CoreInstructions.txt"), "utf8");
      const schema = fs.readFileSync(path.join(promptsDir, "BlueprintSchema.txt"), "utf8");
      const sections = fs.readFileSync(path.join(promptsDir, "SectionDefinitions.txt"), "utf8");
      const rules = fs.readFileSync(path.join(promptsDir, "OutputRules.txt"), "utf8");
      const examples = fs.readFileSync(path.join(promptsDir, "FewShotExamples.txt"), "utf8");

      // Dynamically compile available scenes from the registry
      const scenesList = Object.values(SCENE_REGISTRY).map(s => 
        `- ${s.id}: tags=[${(s.tags || []).join(", ")}], industries=[${(s.industries || []).join(", ")}], mood="${s.mood || 'cinematic'}", colors=[${(s.colors || []).join(", ")}], complexity="${s.complexity || 'Medium'}", performance="${s.performance || 'Medium'}"`
      ).join("\n");

      const sceneInstructions = `AVAILABLE THREE.JS SCENE COMPONENTS:
You must select the most appropriate scene ID for "heroScene.type" from the following registered components. DO NOT output any ID outside this list:
${scenesList}`;
      
      return [
        core,
        schema,
        sceneInstructions,
        sections,
        rules,
        examples
      ].join("\n\n=========================================\n\n");
    } catch (err) {
      console.error("[PromptBuilder Error] Failed to read prompt files, using fallback:", err.message);
      return "You are a professional website blueprint architect. Generate complete website blueprint matching V2 schema.";
    }
  }
}

export default PromptBuilder;
