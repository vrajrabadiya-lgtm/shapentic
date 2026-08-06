

class PerformancePlanner {
    constructor() {
        // thresholds can be configured
        this.profiles = {
            low: {
                polygonCount: 50000,
                drawCalls: 50,
                textureBudgetMB: 50,
                memoryBudgetMB: 200,
            },
            balanced: {
                polygonCount: 500000,
                drawCalls: 200,
                textureBudgetMB: 250,
                memoryBudgetMB: 500,
            },
            high: {
                polygonCount: 2000000,
                drawCalls: 500,
                textureBudgetMB: 1000,
                memoryBudgetMB: 1500,
            },
        };
    }

    /**
     * Estimates the performance impact of a scene.
     * @param {object} sceneDefinition - The scene definition from the SceneComposer.
     * @param {string} profileName - 'low', 'balanced', or 'high'.
     * @returns {object} An estimated performance report.
     */
    estimate(sceneDefinition, profileName = 'balanced') {
        const profile = this.profiles[profileName] || this.profiles.balanced;
        const estimates = {
            gpuLoad: 0,
            drawCalls: 0,
            polygonCount: 0,
            textureMemoryMB: 0,
            geometryMemoryMB: 0,
            totalMemoryMB: 0,
            animationBudget: 0, // Not implemented yet
            warnings: [],
        };

        // This is a very rough estimation logic. A real implementation
        // would need asset metadata (poly count, texture size, etc.)
        if (sceneDefinition.assets) {
            for (const asset of Object.values(sceneDefinition.assets)) {
                if (asset.type === 'model') {
                    estimates.drawCalls += asset.metadata?.drawCalls || 1;
                    estimates.polygonCount += asset.metadata?.polygons || 1000; // default guess
                    estimates.geometryMemoryMB += (asset.size || 1000000) / (1024 * 1024);
                } else if (asset.type === 'texture' || asset.type === 'hdri') {
                    estimates.textureMemoryMB += (asset.size || 500000) / (1024 * 1024);
                }
            }
        }

        estimates.totalMemoryMB = estimates.geometryMemoryMB + estimates.textureMemoryMB;

        // Compare against profile
        if (estimates.polygonCount > profile.polygonCount) {
            estimates.warnings.push(`Polygon count (${estimates.polygonCount}) exceeds target for '${profileName}' profile (${profile.polygonCount}).`);
        }
        if (estimates.drawCalls > profile.drawCalls) {
            estimates.warnings.push(`Draw call count (${estimates.drawCalls}) exceeds target for '${profileName}' profile (${profile.drawCalls}).`);
        }
        if (estimates.textureMemoryMB > profile.textureBudgetMB) {
            estimates.warnings.push(`Texture memory (${estimates.textureMemoryMB.toFixed(2)}MB) exceeds target for '${profileName}' profile (${profile.textureBudgetMB}MB).`);
        }
        if (estimates.totalMemoryMB > profile.memoryBudgetMB) {
            estimates.warnings.push(`Total memory (${estimates.totalMemoryMB.toFixed(2)}MB) exceeds target for '${profileName}' profile (${profile.memoryBudgetMB}MB).`);
        }

        estimates.gpuLoad = Math.min(1,
            (estimates.polygonCount / profile.polygonCount) * 0.5 +
            (estimates.drawCalls / profile.drawCalls) * 0.3 +
            (estimates.textureMemoryMB / profile.textureBudgetMB) * 0.2
        );


        return estimates;
    }
}

export default PerformancePlanner;
