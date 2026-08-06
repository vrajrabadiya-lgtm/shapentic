# Asset Registry Documentation

This document specifies the data structure for the `AssetRegistry` and the `AssetManifest`.

## 1. AssetRegistry

The `AssetRegistry` is an in-memory database of all assets required for a project. It is populated by the `AssetPlanner` and used by the `AssetResolver`. Each asset in the registry is represented by an `AssetEntry`.

### AssetEntry Schema

```json
{
  "id": "string", // Unique identifier for the asset
  "type": "string", // E.g., 'model', 'texture', 'hdri', 'font', 'audio'
  "source": "string", // URL, file path, or generation prompt (e.g., "generate://a_blue_dragon")
  "license": "string", // 'proprietary', 'cc-by', etc.
  "format": "string", // 'gltf', 'glb', 'png', 'jpeg', 'hdr', 'woff2'
  "dependencies": ["string"], // Array of other asset IDs
  "size": "number", // Size in bytes (-1 if unknown)
  "lod": ["string"], // Array of asset IDs for Levels of Detail
  "tags": ["string"], // Descriptive tags
  "cachePolicy": "string", // 'default', 'no-cache', 'long-lived'
  "status": "string", // 'unresolved', 'resolving', 'resolved', 'error'
  "resolvedUri": "string" | null, // The accessible URI after resolution
  "error": "string" | null, // Error message if resolution fails
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 2. AssetManifest

The `AssetManifest` is the output of the `AssetResolver`. It is a public-facing, simplified list of all resolved assets that are ready to be used by the renderer. It is included in the final `SceneDefinition`.

### AssetManifest Schema

```json
{
  "version": "1.0.0",
  "createdAt": "timestamp",
  "assets": {
    "assetId1": {
      "type": "model",
      "format": "gltf",
      "uri": "https://.../model.gltf",
      "size": 123456,
      "dependencies": ["textureAssetId1"],
      "license": "proprietary"
    },
    "textureAssetId1": {
      "type": "texture",
      "format": "png",
      "uri": "https://.../texture.png",
      "size": 78910
    }
  }
}
```
