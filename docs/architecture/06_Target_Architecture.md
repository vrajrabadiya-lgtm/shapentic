# Target Architecture (Documented Intent)

## Goal
The target architecture is a single-source-of-truth blueprint flow:
1. Prompt
2. Intent analysis
3. Agent orchestration
4. Blueprint V2
5. Code generation

## Desired characteristics
- The orchestrator should return or preserve a real Blueprint V2 object.
- The route should not reconstruct a second blueprint from phase outputs.
- The generator should consume the blueprint directly after normalization.
- Legacy compatibility logic should remain limited to a narrow adapter layer, not be spread across route and generator code.

## Architectural gaps identified
- The orchestrator currently returns phase outputs rather than a final blueprint.
- The route currently synthesizes blueprint data from those phases.
- The generator still depends on a broad set of legacy compatibility fields.
- There is duplicated responsibility between route assembly, service normalization, adapter adaptation, and generator normalization.
