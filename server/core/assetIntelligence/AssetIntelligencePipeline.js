import AssetPlanner from './AssetPlanner.js';
import ScenePlanner from './ScenePlanner.js';
import AssetRegistry from './AssetRegistry.js';
import AssetResolver from './AssetResolver.js';
import SceneComposer from './SceneComposer.js';
import AssetValidator from './AssetValidator.js';
import PerformancePlanner from './PerformancePlanner.js';

class AssetIntelligencePipeline {
    constructor(blueprint) {
        this.blueprint = blueprint;
    }

    async run() {
        // 1. Plan Assets
        const assetPlanner = new AssetPlanner(this.blueprint);
        const assetPlan = assetPlanner.generatePlan();

        // 2. Register Assets
        const assetRegistry = new AssetRegistry();
        this.registerAssetsFromPlan(assetRegistry, assetPlan);

        // 3. Resolve Assets
        const assetResolver = new AssetResolver(assetRegistry);
        const assetManifest = await assetResolver.resolveAll();

        // 4. Plan Scene
        const scenePlanner = new ScenePlanner(this.blueprint);
        const scenePlan = scenePlanner.createScenePlan();

        // 5. Compose Scene
        const sceneComposer = new SceneComposer();
        const sceneDefinition = sceneComposer.composeScene(this.blueprint, scenePlan, assetManifest);

        // 6. Validate Scene
        const validator = new AssetValidator(assetManifest, sceneDefinition);
        const validationErrors = validator.validate();
        if (validationErrors.length > 0) {
            console.warn('Asset validation failed:', validationErrors);
            // Decide on error handling strategy: throw, return partial, etc.
        }

        // 7. Estimate Performance
        const perfPlanner = new PerformancePlanner();
        const performanceReport = perfPlanner.estimate(sceneDefinition);


        return {
            sceneDefinition,
            performanceReport,
            validationErrors,
        };
    }

    registerAssetsFromPlan(registry, assetPlan) {
        for (const category of Object.values(assetPlan)) {
            for (const asset of category) {
                try {
                    registry.registerAsset(asset);
                } catch (error) {
                    console.warn(`Failed to register asset: ${error.message}`, asset);
                }
            }
        }
    }
}

export default AssetIntelligencePipeline;

