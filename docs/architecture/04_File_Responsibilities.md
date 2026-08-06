# File Responsibility Matrix

## Core files and responsibilities
| File | Inputs | Outputs | Creates / Mutates / Consumes blueprint | Notes |
|---|---|---|---|---|
| [server/core/AIArchitect.js](server/core/AIArchitect.js) | raw prompt | intent object | Creates intent only | No blueprint yet. |
| [server/core/AgentWebsiteOrchestrator.js](server/core/AgentWebsiteOrchestrator.js) | prompt + plan | phases object | Consumes prompt; does not produce final blueprint | Main pipeline stage before blueprint assembly. |
| [server/core/BlueprintGenerator.js](server/core/BlueprintGenerator.js) | intent | local blueprint fallback | Creates blueprint fallback | Produces many legacy and V2-style fields. |
| [server/core/BlueprintService.js](server/core/BlueprintService.js) | intent + blueprint | blueprint | Mutates blueprint | Adds compatibility fields and planning artifacts. |
| [server/core/BlueprintAdapterV1.js](server/core/BlueprintAdapterV1.js) | blueprint + intent | adapted blueprint | Mutates/normalizes blueprint | Legacy translation layer. |
| [server/routes/ai.js](server/routes/ai.js) | prompt + orchestrator output | generated code response | Reconstructs blueprint and passes it onward | Main overlap / duplication point. |
| [server/core/CodeGenerator.js](server/core/CodeGenerator.js) | blueprint | React code artifacts | Consumes and normalizes blueprint | Final consumer of the blueprint. |

## Responsibility overlap
- The route and the generator both perform blueprint normalization.
- The generator and adapter both rehydrate missing fields.
- The orchestrator does not own the final blueprint contract, which creates a gap between agent output and code generation.
