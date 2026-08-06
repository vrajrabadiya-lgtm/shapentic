import { SCENE_REGISTRY } from "../src/3d/sceneRegistry.js";
import { SECTION_REGISTRY } from "../src/planner/LayoutPlanner.js";

/**
 * BlueprintValidator - Phase 5
 *
 * Performs production-grade validation on a Blueprint V3 object.
 * It checks for schema compliance, consistency, and completeness.
 */
export class BlueprintValidator {
  /**
   * Orchestrates the validation process and returns a comprehensive report.
   * @param {any} bp The blueprint object to validate.
   * @returns {{errors: string[], warnings: string[], score: number, summary: string}}
   */
  static validate(bp) {
    const errors = [];
    const warnings = [];

    if (!bp || typeof bp !== "object") {
      return {
        errors: ["Blueprint must be a non-null object."],
        warnings: [],
        score: 0,
        summary: "Fatal error: Blueprint is not a valid object.",
      };
    }

    // --- Run All Validation Checks ---
    errors.push(...this.#validateSchema(bp));
    errors.push(...this.#validateThemeCompleteness(bp));
    errors.push(...this.#checkForDuplicateIDs(bp));
    errors.push(...this.#checkForDuplicateRoutes(bp));
    
    const navResult = this.#validateNavigationConsistency(bp);
    errors.push(...navResult.errors);
    warnings.push(...navResult.warnings);
    
    errors.push(...this.#validatePageAndSectionReferences(bp));
    errors.push(...this.#validateSceneReferences(bp));
    errors.push(...this.#validateCTAIntegrity(bp));

    warnings.push(...this.#validateSEOMetadata(bp));
    warnings.push(...this.#validateAccessibilityMetadata(bp));
    warnings.push(...this.#validateAnimationDefinitions(bp));

    // --- Calculate Score & Summary ---
    let score = 100;
    score -= errors.length * 10;
    score -= warnings.length * 2;
    score = Math.max(0, score);

    let summary = `Validation complete. Score: ${score}.`;
    if (errors.length > 0) {
      summary += ` ${errors.length} error(s) found. Blueprint is NOT safe for generation.`;
    } else if (warnings.length > 0) {
      summary += ` ${warnings.length} warning(s) found. Blueprint is valid but could be improved.`;
    } else {
      summary += " Blueprint is valid and ready for generation.";
    }

    return { errors, warnings, score, summary };
  }

  // ----------------------------------------------------
  // PRIVATE VALIDATION HELPERS
  // ----------------------------------------------------

  static #validateSchema(bp) {
    const errors = [];
    const requiredTopLevel = ["brand", "visual", "structure", "seo", "accessibility"];
    requiredTopLevel.forEach(key => {
      if (!bp[key] || typeof bp[key] !== 'object') {
        errors.push(`Missing or invalid required top-level object: "${key}"`);
      }
    });
    if (errors.length) return errors;

    if (!bp.structure.pages || !Array.isArray(bp.structure.pages) || bp.structure.pages.length === 0) {
      errors.push("`structure.pages` must be a non-empty array.");
    }
    return errors;
  }
  
  static #validateThemeCompleteness(bp) {
    const errors = [];
    const { colors, fonts } = bp.brand || {};
    if (!colors || typeof colors !== 'object') {
      errors.push("`brand.colors` object is missing.");
      return errors;
    }
    const requiredColors = ["primary", "secondary", "accent", "background"];
    requiredColors.forEach(c => {
      if (typeof colors[c] !== "string" || !colors[c].trim()) {
        errors.push(`brand.colors.${c} must be a non-empty string.`);
      }
    });

    if (!fonts || typeof fonts !== 'object') {
        errors.push("`brand.fonts` object is missing.");
    } else {
        if(!fonts.heading || !fonts.body){
            errors.push("`brand.fonts` requires `heading` and `body` properties.");
        }
    }
    return errors;
  }

  static #checkForDuplicateIDs(bp) { 
    const errors = [];
    const ids = new Set();
    
    bp.structure?.pages?.forEach(p => {
        p.sections?.forEach(s => {
            if (ids.has(s.id)) {
                errors.push(`Duplicate section ID found: "${s.id}". IDs must be unique.`);
            }
            ids.add(s.id);
        });
    });
    return errors;
  }
  
  static #checkForDuplicateRoutes(bp) {
    const errors = [];
    const paths = new Set();
    bp.structure?.pages?.forEach(p => {
        if (paths.has(p.path)) {
            errors.push(`Duplicate page path found: "${p.path}". Paths must be unique.`);
        }
        paths.add(p.path);
    });
    return errors;
  }

  static #validateNavigationConsistency(bp) {
    const errors = [];
    const warnings = [];
    const pagePaths = new Set(bp.structure?.pages?.map(p => p.path) || []);
    
    bp.structure?.navigation?.links?.forEach(link => {
        if (link.url.startsWith('/') && !pagePaths.has(link.url)) {
            warnings.push(`Navigation link "${link.text}" points to a non-existent page path: "${link.url}".`);
        }
    });
    return { errors, warnings };
  }
  
  static #validatePageAndSectionReferences(bp) { 
      const errors = [];
      const availableComponents = Object.keys(SECTION_REGISTRY);
      bp.structure?.pages?.forEach(page => {
          page.sections?.forEach(section => {
              if(!availableComponents.includes(section.componentName)){
                  errors.push(`Section "${section.id}" uses an unknown component: "${section.componentName}".`);
              }
          })
      })
      return errors;
  }

  static #validateSceneReferences(bp) {
    const errors = [];
    const availableScenes = Object.keys(SCENE_REGISTRY);
    const sceneId = bp.requirements?.scene?.[0]; // Assuming scene is defined here
    if(sceneId && !availableScenes.includes(sceneId)) {
        errors.push(`Blueprint requires a scene ("${sceneId}") that does not exist in the SCENE_REGISTRY.`);
    }
    return errors;
   }
  
  static #validateCTAIntegrity(bp) {
      const errors = [];
      const pagePaths = new Set(bp.structure?.pages?.map(p => p.path) || []);
      bp.structure?.pages?.forEach(page => {
          page.sections?.forEach(section => {
              if (section.content?.cta && section.content?.cta.startsWith('/') && !pagePaths.has(section.content.cta)) {
                errors.push(`CTA in section "${section.id}" points to a non-existent page path: "${section.content.cta}".`);
              }
          })
      })
      return errors;
  }
  
  static #validateSEOMetadata(bp) {
    const warnings = [];
    if (!bp.seo || !bp.seo.title || !bp.seo.description) {
        warnings.push("SEO metadata (title, description) is missing or incomplete.");
    }
    if(bp.seo?.keywords && (!Array.isArray(bp.seo.keywords) || bp.seo.keywords.length === 0)){
        warnings.push("SEO keywords are present but empty.")
    }
    return warnings;
  }
  
  static #validateAccessibilityMetadata(bp) {
    const warnings = [];
    if (!bp.accessibility || !bp.accessibility.level) {
        warnings.push("Accessibility level (e.g., 'AA') is not defined.");
    }
    return warnings;
  }
  
  static #validateAnimationDefinitions(bp) {
    // Stub: Implement logic to check if animations are valid
    return [];
  }
  
  static #validateResponsiveConfiguration(bp) {
    // Stub: Implement logic for responsive checks
    return [];
  }
}

export default BlueprintValidator;

