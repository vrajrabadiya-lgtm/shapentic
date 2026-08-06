# Blueprint Ownership Matrix

## File-level ownership
| Area | Primary owner | Role | Notes |
|---|---|---|---|
| Prompt analysis | [server/core/AIArchitect.js](server/core/AIArchitect.js) | Creates intent | Produces structured input for downstream stages. |
| Agent orchestration | [server/core/AgentWebsiteOrchestrator.js](server/core/AgentWebsiteOrchestrator.js) | Produces phase outputs | Does not return a final blueprint object. |
| Blueprint generation | [server/core/BlueprintGenerator.js](server/core/BlueprintGenerator.js) | Builds local blueprint fallback | Emits many legacy and V2-style fields. |
| Blueprint service | [server/core/BlueprintService.js](server/core/BlueprintService.js) | Normalizes generated blueprint | Adds compatibility fields such as `layout_plan` and `scene_plan`. |
| Route assembly | [server/routes/ai.js](server/routes/ai.js) | Reconstructs blueprint from agent phases | This is the main overlap point. |
| Code generation | [server/core/CodeGenerator.js](server/core/CodeGenerator.js) | Consumes normalized blueprint | Reads both canonical V2 fields and legacy aliases. |
| Compatibility adapter | [server/core/BlueprintAdapterV1.js](server/core/BlueprintAdapterV1.js) | Translates legacy input into V2-like structure | Used by normalization path. |

## Field-level ownership summary
- `intent` fields: owned by AIArchitect.
- `brand`, `hero`, `navigation`, `scene`, `sections`, `pages`: effectively owned by route + generator normalization.
- `layout_plan` / `scene_plan`: generated or injected by BlueprintService and route fallback.
- `websiteBlueprint`, `concept`, `palette`, `navbar`: legacy compatibility fields with overlapping ownership.
