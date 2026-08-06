/**
 * RendererUtils.js
 * 
 * Pure utility functions for the rendering engine.
 * These functions must be stateless and have no side effects other than their return value.
 */

/**
 * Formats a headline string, optionally splitting it and adding a colored span.
 * @param {string} headline - The headline text.
 * @param {boolean} isSplitColor - Whether to split the headline and color the second half.
 * @param {string} priColor - The primary color for the span.
 * @returns {string} The formatted HTML string for the headline.
 */
export function formatHeadline(headline, isSplitColor = false, priColor = '#3d5eff') {
  const clean = (headline || '').replace(/\\n/g, '\n')
  if (!isSplitColor) {
    return clean.replace(/\n/g, '<br />\n          ')
  }
  const tokens = clean.split(/\s+/).filter(Boolean)
  const mid = Math.ceil(tokens.length / 2)
  const firstPart = tokens.slice(0, mid).join(' ').replace(/\n/g, '<br />\n          ')
  const secondPart = tokens.slice(mid).join(' ').replace(/\n/g, '<br />\n            ')
  return `${firstPart}\n          <span style={{ color: '${priColor}' }}>\n            {' '}${secondPart}\n          </span>`
}

/**
 * Validates the core structure of the blueprint required for generation.
 * Throws an error if validation fails.
 * @param {object} bp - The blueprint object.
 */
export function validateBlueprintForGeneration(bp) {
  const errors = [];
  if (!bp || typeof bp !== 'object') {
    throw new Error('Blueprint is missing or invalid.');
  }

  // version
  if (!bp.version || !String(bp.version).startsWith("2.")) {
    // Loosening this for now to support legacy blueprints
    // errors.push("Missing or invalid blueprint.version (must be 2.x)");
  }
  
  // brand
  if (!bp.brand) errors.push("Missing blueprint.brand");
  else {
    if (!bp.brand.name) errors.push("Missing blueprint.brand.name");
  }

  // theme
  if (!bp.theme) errors.push("Missing blueprint.theme");
  else {
    if (!bp.theme.colors) errors.push("Missing blueprint.theme.colors");
    else {
      if (!bp.theme.colors.primary) errors.push("Missing blueprint.theme.colors.primary");
      if (!bp.theme.colors.background) errors.push("Missing blueprint.theme.colors.background");
      if (!bp.theme.colors.text) errors.push("Missing blueprint.theme.colors.text");
    }
  }

  // navigation
  if (!bp.navigation) errors.push("Missing blueprint.navigation");
  else {
    if (!Array.isArray(bp.navigation.links)) errors.push("Missing blueprint.navigation.links array");
  }
  
  // hero
  if (!bp.hero) errors.push("Missing blueprint.hero");
  else {
    if (!bp.hero.headline) errors.push("Missing blueprint.hero.headline");
    if (!Array.isArray(bp.hero.buttons)) errors.push("Missing blueprint.hero.buttons array");
  }

  // scene
  if (!bp.scene) errors.push("Missing blueprint.scene");
  else {
    if (!bp.scene.sceneId) errors.push("Missing blueprint.scene.sceneId");
  }

  // pages
  if (!Array.isArray(bp.pages) || bp.pages.length === 0) errors.push("Missing blueprint.pages array or it is empty");

  // sections
  if (!Array.isArray(bp.sections)) errors.push("Missing blueprint.sections array");

  if (errors.length > 0) {
    console.error("Blueprint validation failed for:", JSON.stringify(bp, null, 2));
    throw new Error(`Blueprint Validation Error: ${errors.join("; ")}`);
  }
}

/**
 * Logs the details of a component generation for auditing and debugging.
 * @param {string} name - The name of the component being generated.
 * @param {string} sourcePath - The path within the blueprint where the data is from.
 * @param {string[]} fieldsConsumed - A list of fields read from the blueprint.
 * @param {string[]} [missingFields=[]] - A list of fields that were expected but not found.
 */
export function logComponentGeneration(name, sourcePath, fieldsConsumed, missingFields = []) {
  console.log(`
======================================================`);
  console.log(`Component Name:      ${name}`);
  console.log(`Blueprint Source:    ${sourcePath}`);
  console.log(`Fields Consumed:     ${fieldsConsumed.join(", ")}`);
  console.log(`Missing Fields:      ${missingFields.length > 0 ? missingFields.join(", ") : "None"}`);
  console.log(`Fallback Used?:      ${missingFields.length > 0 ? "YES" : "NO"}`);
  console.log(`======================================================
`);
}
