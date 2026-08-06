import { describe, it, expect } from 'vitest';
import AssetIntelligencePipeline from '../core/assetIntelligence/AssetIntelligencePipeline.js';


// Mock blueprint for testing
const mockBlueprint = {
    "version": "3.0",
    "id": "project_12345",
    "name": "Modern E-Commerce Site",
    "industry": "Retail",
    "style": "Minimalist",
    "settings": {
        "performance": {
            "profile": "balanced"
        }
    },
    "scene": {
        "camera": {
            "position": [0, 2, 8],
            "fov": 60
        },
        "lights": [
            { "type": "AmbientLight", "intensity": 0.8 },
            { "type": "DirectionalLight", "intensity": 1.5, "position": [5, 10, 7] }
        ],
        "hdri": {
            "src": "https://example.com/hdri/studio.hdr"
        }
    },
    "sections": {
        "hero": {
            "id": "hero_section",
            "type": "Hero",
            "components": {
                "main_model": {
                    "id": "comp_model_1",
                    "type": "Model",
                    "props": {
                        "modelSrc": "https://example.com/models/product.glb"
                    },
                    "layout": { "position": [0, 0, 0] }
                },
                "title": {
                    "id": "comp_text_1",
                    "type": "Text",
                    "props": {
                        "text": "Featured Product",
                        "fontFamily": "Arial"
                    },
                    "layout": { "position": [0, 1.5, 0] }
                }
            }
        }
    }
};


describe('AssetIntelligencePipeline', () => {
    it('should run the full pipeline and generate a scene definition', async () => {
        const pipeline = new AssetIntelligencePipeline(mockBlueprint);
        const result = await pipeline.run();

        expect(result).toBeDefined();
        expect(result.sceneDefinition).toBeDefined();
        expect(result.performanceReport).toBeDefined();

        const { sceneDefinition } = result;

        // Check Scene Plan parts
        expect(sceneDefinition.scene.camera.position).toEqual([0, 2, 8]);
        expect(sceneDefinition.scene.hdri).toBe("https://example.com/hdri/studio.hdr");

        // Check Assets
        expect(Object.keys(sceneDefinition.assets).length).toBeGreaterThan(0);
        const modelAssetId = "asset_23b41d5a"; // asset id for product.glb
        const fontAssetId = "asset_3c96063"; // asset id for Arial

        expect(sceneDefinition.assets[modelAssetId]).toBeDefined();
        expect(sceneDefinition.assets[modelAssetId].uri).toBe("https://example.com/models/product.glb");

        expect(sceneDefinition.assets[fontAssetId]).toBeDefined();

        // Check Scene Nodes
        expect(sceneDefinition.scene.nodes.length).toBe(2);
        const modelNode = sceneDefinition.scene.nodes.find(n => n.id === 'comp_model_1');
        expect(modelNode).toBeDefined();
        expect(modelNode.children[0].type).toBe('GLTF');
        expect(modelNode.children[0].assetId).toBe(modelAssetId);

        const textNode = sceneDefinition.scene.nodes.find(n => n.id === 'comp_text_1');
        expect(textNode).toBeDefined();
        expect(textNode.type).toBe('Text');
        expect(textNode.properties.content).toBe("Featured Product");
        expect(textNode.properties.fontAssetId).toBe(fontAssetId);
    }, 10000);
});
