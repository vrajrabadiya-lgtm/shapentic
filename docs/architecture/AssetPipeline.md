# Asset Pipeline Documentation

This document outlines the architecture of the Asset Intelligence Pipeline.

## 1. Overview

The Asset Intelligence Pipeline is responsible for transforming a high-level `Blueprint V3` into a detailed, renderable `SceneDefinition`. It automates the process of identifying, resolving, and optimizing all assets required for a 3D website experience.

The pipeline is a series of stages, each handled by a specialized module:

`Blueprint V3` -> **AssetPlanner** -> `AssetPlan` -> **AssetRegistry** -> **AssetResolver** -> `AssetManifest` -> **ScenePlanner** -> `ScenePlan` -> **SceneComposer** -> `SceneDefinition` -> **AssetValidator** & **PerformancePlanner** -> `Validated SceneDefinition` & `PerformanceReport`

## 2. Modules

### AssetPlanner
- **Input**: `Blueprint V3`
- **Output**: `AssetPlan`
- **Responsibility**: Traverses the blueprint to identify all required assets (models, textures, fonts, etc.). It does not resolve them but creates a list of what is needed.

### AssetRegistry
- **Input**: `AssetPlan`
- **Output**: A populated registry instance.
- **Responsibility**: Acts as a centralized database for all assets identified by the `AssetPlanner`. It tracks metadata, source, type, and status for each asset.

### AssetResolver
- **Input**: `AssetRegistry`
- **Output**: `AssetManifest`
- **Responsibility**: Resolves the assets listed in the registry. It handles different sources (local, external, generated), manages caching, and produces a final manifest of resolved, accessible assets.

### ScenePlanner
- **Input**: `Blueprint V3`
- **Output**: `ScenePlan`
- **Responsibility**: Defines the overall scene characteristics, including lighting, cameras, environment, and post-processing, based on the blueprint's scene settings.

### SceneComposer
- **Input**: `Blueprint V3`, `ScenePlan`, `AssetManifest`
- **Output**: `SceneDefinition`
- **Responsibility**: Assembles the final, detailed scene graph. It maps blueprint components to scene nodes and links them to the resolved assets in the `AssetManifest`.

### AssetValidator
- **Input**: `SceneDefinition`, `AssetManifest`
- **Output**: A list of validation errors.
- **Responsibility**: Performs integrity checks, ensuring there are no missing assets, broken references, or unsupported formats.

### PerformancePlanner
- **Input**: `SceneDefinition`
- **Output**: `PerformanceReport`
- **Responsibility**: Estimates the performance characteristics of the scene, such as draw calls, polygon count, and memory usage, against predefined performance profiles.

## 3. Data Flow

The data flows through the pipeline, being enriched at each stage. This ensures a clear separation of concerns and allows for modular implementation and testing.

## 4. Caching

Caching is implemented at the `AssetResolver` stage. It keeps track of resolved assets to avoid redundant fetching or generation. The cache can be configured with different strategies (in-memory, persistent).
