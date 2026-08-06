# Current Pipeline Architecture Audit

## Scope
This document records the current backend pipeline from prompt input to generated React project output without changing runtime behavior.

## End-to-end pipeline
1. Prompt enters the API route in [server/routes/ai.js](server/routes/ai.js).
2. [server/core/AIArchitect.js](server/core/AIArchitect.js) analyzes the prompt into an intent object.
3. [server/core/AgentWebsiteOrchestrator.js](server/core/AgentWebsiteOrchestrator.js) runs the agentic planning phases.
4. The route constructs a blueprint object from orchestrator output and local fallback data.
5. [server/core/CodeGenerator.js](server/core/CodeGenerator.js) normalizes the blueprint and generates React code artifacts.
6. The generated project is returned to the caller as code strings and file metadata.

## Stage-by-stage summary
- Prompt analysis: creates intent only.
- Orchestrator: produces planner/designer/scene/component/code phase outputs.
- Route: reconstructs a blueprint object and injects legacy compatibility fields.
- Code generator: consumes normalized blueprint and emits React project files.

## Observed overlap
- The route and generator both reconstruct or normalize blueprint shape.
- The generator contains a compatibility layer that still reads legacy fields such as `websiteBlueprint`, `concept`, `palette`, `navbar`, and `layout_plan`.
