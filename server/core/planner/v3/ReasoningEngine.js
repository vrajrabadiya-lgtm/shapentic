
import { AIProvider } from '../../AIProvider.js';
import { createV3PlannerSystemPrompt } from './prompts.js';
import { logger } from '../../logger.js';

export class ReasoningEngine {
  /**
   * Generates a V3 blueprint by orchestrating an AI-driven reasoning process.
   * @param {string} userPrompt The raw prompt from the user.
   * @returns {Promise<object>} The generated V3 blueprint.
   */
  static async generateBlueprintV3(userPrompt) {
    logger.info(`[ReasoningEngine] Starting V3 blueprint generation for prompt: "${userPrompt}"`);

    // 1. Create the detailed system prompt, injecting the component registry.
    const systemPrompt = createV3PlannerSystemPrompt();

    try {
      // 2. Call the AI provider to get the structured JSON blueprint.
      // The generateJSON method will handle retries and parsing.
      const generatedJson = await AIProvider.generateJSON(systemPrompt, userPrompt);
      
      logger.info('[ReasoningEngine] Successfully received and parsed JSON from AI.');

      // 3. TODO: Add validation step using BlueprintValidator.js
      // For now, we will trust the AI's output if it's valid JSON.
      
      // 4. TODO: Add assembly/cleanup step using BlueprintAssembler.js
      // This step would normalize data, fix minor issues, and ensure schema conformance.

      // 5. Return the generated blueprint.
      // This blueprint is the direct result of the AI's reasoning.
      return generatedJson;

    } catch (error) {
      logger.error('[ReasoningEngine] Failed to generate V3 blueprint.', error);
      // In a real scenario, we might want to fall back to a simpler mechanism
      // or return a structured error. For now, we re-throw.
      throw new Error('The AI reasoning engine failed to produce a valid blueprint.');
    }
  }

  /**
   * Adapts the rich V3 blueprint into the legacy `intent` object for backward compatibility.
   * @param {object} v3Blueprint The AI-generated V3 blueprint.
   * @returns {object} The legacy intent object.
   */
  static adaptV3BlueprintToLegacyIntent(v3Blueprint) {
    const homePage = v3Blueprint.structure?.pages?.find(p => p.path === '/') || v3Blueprint.structure?.pages?.[0];

    const projectTypeMap = {
      'legal ai': 'saas',
      'decentralized finance': 'saas',
      'artisanal coffee': 'ecommerce',
      'default': 'startup',
    };
    const domain = v3Blueprint.domain?.toLowerCase() || 'default';
    const projectType = projectTypeMap[domain] || projectTypeMap.default;

    const themeMap = {
      'dark mode': 'dark',
      'light mode': 'light',
      'vibrant': 'mixed'
    };
    const visualTheme = v3Blueprint.visual?.theme?.toLowerCase();
    
    const styleMap = {
        'minimalist': 'minimal',
        'cyberpunk': 'gaming',
        'luxury': 'luxury',
        'corporate': 'corporate',
    };
    const visualStyle = v3Blueprint.visual?.style?.toLowerCase();

    return {
      projectType,
      theme: themeMap[visualTheme] || 'dark',
      style: styleMap[visualStyle] || 'futuristic',
      animations: v3Blueprint.visual?.motion !== 'static',
      threeD: (v3Blueprint.requirements?.['3d']?.length || 0) > 0,
      pages: v3Blueprint.structure?.pages?.map(p => p.name.toLowerCase()) || ['home', 'about', 'contact'],
      sections: homePage?.sections?.map(s => s.componentName) || ['navbar', 'hero', 'features', 'contact', 'footer'],
      notes: [v3Blueprint.brand?.name || 'AI Project'],
    };
  }
}
