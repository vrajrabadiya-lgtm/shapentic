# Legacy Field Inventory

## Legacy and compatibility fields still in circulation
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
- `layout_plan`
- `scene_plan`

## Where they appear
- [server/routes/ai.js](server/routes/ai.js): reconstructed or injected during route assembly.
- [server/core/BlueprintService.js](server/core/BlueprintService.js): injected as compatibility placeholders.
- [server/core/CodeGenerator.js](server/core/CodeGenerator.js): read by `normalizeBlueprint()` and downstream generation helpers.
- [server/core/BlueprintAdapterV1.js](server/core/BlueprintAdapterV1.js): used to adapt older shapes.

## Assessment
These fields are not all dead. They remain in the system because the generator still has compatibility code that expects them. The architecture is therefore partially migrated, not fully V2-native.
