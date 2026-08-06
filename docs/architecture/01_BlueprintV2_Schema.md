# Blueprint V2 Schema Audit

## Intent
The current codebase is operating in a mixed mode: the generator expects a normalized structure, while the route and some services still populate older fields.

## Canonical fields observed in the generator
The main consumer path in [server/core/CodeGenerator.js](server/core/CodeGenerator.js) reads:
- `brand.name`
- `brand.industry`
- `brand.tagline`
- `brand.palette`
- `navigation.links`
- `navigation.cta`
- `hero.headline`
- `hero.description`
- `hero.layout`
- `hero.scene`
- `sections`
- `pages`
- `theme`
- `scene.sceneId`
- `scene.camera`
- `scene.lighting`
- `layout_plan`
- `scene_plan`

## Legacy compatibility fields still present
- `websiteBlueprint`
- `concept`
- `palette`
- `color_palette`
- `designSystem`
- `visualIdentity`
- `navbar`
- `heroScene`
- `business_type`
- `website_name`
- `design_style`

## Ownership notes
- The route currently owns much of the top-level shape reconstruction.
- The generator owns normalization and compatibility projection into the canonical shape.
- The orchestrator currently owns only phase outputs rather than a final blueprint object.
