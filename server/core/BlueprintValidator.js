import { SCENE_REGISTRY } from "../src/3d/sceneRegistry.js";

/**
 * BlueprintValidator
 * 
 * Performs structural, types, and schema checks against standard Blueprint V2 requirements.
 */
export class BlueprintValidator {
  /**
   * Validate a blueprint payload.
   * @param {any} bp 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(bp) {
    const errors = [];

    if (!bp || typeof bp !== "object") {
      return { valid: false, errors: ["Blueprint must be a non-null object."] };
    }

    // 1. Check for legacy/disallowed fields
    const legacyKeys = ["landingPage", "heroSection", "navigationLinks", "visualStyling", "layoutArchetype"];
    legacyKeys.forEach(k => {
      if (k in bp) {
        errors.push(`Disallowed legacy field found: "${k}". LLM should produce Blueprint V2 structure.`);
      }
    });

    // 2. Check top-level required fields
    const requiredTop = ["brand", "theme", "navigation", "hero", "heroScene", "pages", "footer"];
    requiredTop.forEach(f => {
      if (!(f in bp) || !bp[f] || typeof bp[f] !== "object") {
        errors.push(`Missing or invalid required top-level object: "${f}"`);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // 3. Validate Brand
    if (typeof bp.brand.name !== "string" || !bp.brand.name.trim()) {
      errors.push("brand.name must be a non-empty string.");
    }
    if (typeof bp.brand.tagline !== "string" || !bp.brand.tagline.trim()) {
      errors.push("brand.tagline must be a non-empty string.");
    }

    // 4. Validate Theme
    const colors = bp.theme.colors;
    if (!colors || typeof colors !== "object") {
      errors.push("theme.colors must be an object.");
    } else {
      const requiredColors = ["primary", "secondary", "background", "surface", "text"];
      requiredColors.forEach(c => {
        if (typeof colors[c] !== "string" || !colors[c].startsWith("#")) {
          errors.push(`theme.colors.${c} must be a valid hex color starting with "#"`);
        }
      });
    }

    const typography = bp.theme.typography;
    if (!typography || typeof typography !== "object") {
      errors.push("theme.typography must be an object.");
    } else {
      if (typeof typography.headingFont !== "string" || !typography.headingFont.trim()) {
        errors.push("theme.typography.headingFont must be a non-empty string.");
      }
      if (typeof typography.bodyFont !== "string" || !typography.bodyFont.trim()) {
        errors.push("theme.typography.bodyFont must be a non-empty string.");
      }
    }

    // 5. Validate Navigation
    if (typeof bp.navigation.logo !== "string" || !bp.navigation.logo.trim()) {
      errors.push("navigation.logo must be a non-empty string.");
    }
    if (!Array.isArray(bp.navigation.links)) {
      errors.push("navigation.links must be an array.");
    } else {
      bp.navigation.links.forEach((l, idx) => {
        if (typeof l.label !== "string" || typeof l.path !== "string") {
          errors.push(`navigation.links[${idx}] must contain "label" and "path" string fields.`);
        }
      });
    }
    if (!bp.navigation.cta || typeof bp.navigation.cta !== "object") {
      errors.push("navigation.cta must be an object.");
    } else {
      if (typeof bp.navigation.cta.label !== "string" || typeof bp.navigation.cta.path !== "string") {
        errors.push("navigation.cta must contain 'label' and 'path' string fields.");
      }
    }

    // 6. Validate Hero
    if (typeof bp.hero.heading !== "string" || !bp.hero.heading.trim()) {
      errors.push("hero.heading must be a non-empty string.");
    }
    if (typeof bp.hero.description !== "string" || !bp.hero.description.trim()) {
      errors.push("hero.description must be a non-empty string.");
    }
    if (!Array.isArray(bp.hero.ctas)) {
      errors.push("hero.ctas must be an array.");
    } else {
      bp.hero.ctas.forEach((c, idx) => {
        if (typeof c.label !== "string" || typeof c.path !== "string") {
          errors.push(`hero.ctas[${idx}] must contain "label" and "path" string fields.`);
        }
      });
    }
    const allowedHeroLayouts = ["3d-right", "3d-left", "split", "centered", "fullscreen"];
    if (!allowedHeroLayouts.includes(bp.hero.layout)) {
      errors.push(`hero.layout must be one of: ${allowedHeroLayouts.join(", ")}`);
    }

    // 7. Validate Hero Scene
    const allowedSceneIds = Object.keys(SCENE_REGISTRY);
    if (!allowedSceneIds.includes(bp.heroScene.type)) {
      errors.push(`heroScene.type must be one of the supported scene types in the registry.`);
    }
    if (typeof bp.heroScene.style !== "string") {
      errors.push("heroScene.style must be a string.");
    }
    if (typeof bp.heroScene.mood !== "string") {
      errors.push("heroScene.mood must be a string.");
    }
    if (!Array.isArray(bp.heroScene.colors)) {
      errors.push("heroScene.colors must be an array of strings.");
    }

    // 8. Validate Pages and Sections
    if (!Array.isArray(bp.pages) || bp.pages.length === 0) {
      errors.push("pages must be a non-empty array.");
    } else {
      bp.pages.forEach((p, idx) => {
        if (typeof p.name !== "string" || typeof p.path !== "string") {
          errors.push(`pages[${idx}] must contain name and path string properties.`);
        }
        if (!Array.isArray(p.sections)) {
          errors.push(`pages[${idx}].sections must be an array.`);
        } else {
          // Landing page (typically index 0 or Home) sections must be non-empty
          if (idx === 0 && p.sections.length === 0) {
            errors.push("Home page sections list must contain at least one section.");
          }
          p.sections.forEach((sec, sIdx) => {
            const prefix = `pages[${idx}].sections[${sIdx}]`;
            if (typeof sec.id !== "string" || !sec.id.trim()) {
              errors.push(`${prefix}.id must be a non-empty string.`);
            }
            if (typeof sec.type !== "string" || !sec.type.trim()) {
              errors.push(`${prefix}.type must be a non-empty string.`);
            }
            if (typeof sec.componentName !== "string" || !sec.componentName.trim()) {
              errors.push(`${prefix}.componentName must be a non-empty string.`);
            }
            if (!sec.content || typeof sec.content !== "object") {
              errors.push(`${prefix}.content must be an object.`);
            } else {
              if (typeof sec.content.heading !== "string" || !sec.content.heading.trim()) {
                errors.push(`${prefix}.content.heading must be a non-empty string.`);
              }
              if (sec.content.items && !Array.isArray(sec.content.items)) {
                errors.push(`${prefix}.content.items must be an array.`);
              }
            }
          });
        }
      });
    }

    // 9. Validate Footer
    if (typeof bp.footer.copyright !== "string" || !bp.footer.copyright.trim()) {
      errors.push("footer.copyright must be a non-empty string.");
    }
    if (!Array.isArray(bp.footer.links)) {
      errors.push("footer.links must be an array.");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default BlueprintValidator;
