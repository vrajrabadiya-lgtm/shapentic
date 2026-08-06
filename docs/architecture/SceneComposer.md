# Scene Composer Documentation

This document details the role of the `SceneComposer` in the Asset Intelligence Pipeline.

## 1. Overview

The `SceneComposer` is the final assembly stage of the pipeline. Its primary responsibility is to convert the abstract `Blueprint V3` into a concrete `SceneDefinition` by combining the `ScenePlan` and the `AssetManifest`.

- **Input**: `Blueprint V3`, `ScenePlan`, `AssetManifest`
- **Output**: `SceneDefinition`

## 2. Core Logic

The `SceneComposer` iterates through the sections and components defined in the blueprint and constructs a hierarchical scene graph (`nodes`).

### Node Composition

For each component in the blueprint, the `SceneComposer` creates a corresponding node in the scene graph. This process involves:

1.  **Creating a Transform Group**: Each component is wrapped in a `Group` node that holds its position, rotation, and scale, derived from the component's `layout` properties.

2.  **Mapping Component Type to Node Content**: The `type` of the blueprint component determines the `type` of the scene node's content.
    - A blueprint `Model` component becomes a `GLTF` node in the scene.
    - A blueprint `Image` component becomes an `Image` node.
    - A blueprint `Text` component becomes a `Text` node.

3.  **Linking Assets**: The composer uses the `assetId` from the component's properties to look up the final asset URI in the `AssetManifest` and embeds it into the scene node.

4.  **Hierarchical Structure**: The composer respects the hierarchy of the blueprint (sections containing components) to build the `children` arrays within the scene graph, although the current implementation flattens the structure.

## 3. Example Mapping

| Blueprint Component (`type`) | `props` used                               | Scene Node (`type`) | `node` properties set                       |
| ---------------------------- | ------------------------------------------ | ------------------- | ------------------------------------------- |
| `Model`                      | `assetId`, `layout`                        | `GLTF`              | `assetId`, `uri`                            |
| `Text`                       | `text`, `fontAssetId`, `layout`            | `Text`              | `content`, `fontAssetId`                    |
| `Image`                      | `assetId`, `layout`                        | `Image`             | `assetId`, `uri`                            |
| `Background`                 | `assetId` (for HDRI)                       | (none)              | Populates `scene.hdri`                      |
| `Button`                     | `text`, `iconAssetId`, `layout`            | `Group`             | with `Text` and `Icon` children             |

## 4. Future Improvements

-   Support for nested components to create a deeper scene hierarchy.
-   More sophisticated material mapping from blueprint styles to scene materials.
-   Handling of component variants and A/B testing configurations.
