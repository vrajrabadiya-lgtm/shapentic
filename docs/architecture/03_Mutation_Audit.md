# Blueprint Mutation Audit

## Mutation points discovered
1. [server/routes/ai.js](server/routes/ai.js)
   - Builds a new blueprint object from orchestrator phase data.
   - Injects `hero`, `pages`, `navbar`, `websiteBlueprint`, `palette`, `layout_plan`, and `scene_plan`.
   - This is the main place where a new blueprint shape is effectively constructed rather than passed through.

2. [server/core/BlueprintService.js](server/core/BlueprintService.js)
   - Mutates generated blueprints by attaching `layout_plan`, `scene_plan`, `navbar`, `navigation`, `content_library`, and `seo`.
   - Adds compatibility placeholders where data is missing.

3. [server/core/CodeGenerator.js](server/core/CodeGenerator.js)
   - Mutates the blueprint through `normalizeBlueprint()` before consuming it.
   - Fills missing values for brand, navigation, hero, scene, sections, and compatibility fields.

4. [server/core/BlueprintAdapterV1.js](server/core/BlueprintAdapterV1.js)
   - Normalizes older shapes into a V2-like structure.
   - Creates `brand`, `navigation`, `hero`, `scene`, `pages`, `sections`, and `footer` fields from legacy input.

## Mutation characteristics
- The route reconstructs a blueprint object from agent phases.
- The generator normalizes and enriches the blueprint in place.
- Legacy fields are frequently filled even when canonical fields already exist.
- The overall architecture is shape-shifting rather than strictly preserving a single source of truth.
