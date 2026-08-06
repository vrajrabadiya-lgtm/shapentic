
class AssetValidator {
    /**
     * @param {object} assetManifest - The AssetManifest from AssetResolver.
     * @param {object} sceneDefinition - The SceneDefinition from SceneComposer.
     */
    constructor(assetManifest, sceneDefinition) {
        this.assetManifest = assetManifest;
        this.sceneDefinition = sceneDefinition;
    }

    /**
     * Validates assets and scene references.
     * @returns {object[]} An array of validation error objects.
     */
    validate() {
        const errors = [];
        if (!this.assetManifest || !this.sceneDefinition) {
            errors.push({ code: 'MISSING_DATA', message: 'AssetManifest or SceneDefinition not provided.' });
            return errors;
        }

        const allAssetIds = new Set(Object.keys(this.assetManifest.assets));
        const usedAssetIds = new Set();

        // Validate scene nodes
        this.sceneDefinition.scene.nodes.forEach(node => {
            this.validateNode(node, allAssetIds, usedAssetIds, errors);
        });

        // Check for missing HDRIs
        if (this.sceneDefinition.scene.hdri) {
            const hdriVal = this.sceneDefinition.scene.hdri;
            const hdriSrc = typeof hdriVal === 'string' ? hdriVal : (hdriVal.src || hdriVal.assetId);
            const hdriAssetId = hdriSrc ? this.generateAssetId(hdriSrc) : null;
            if (hdriAssetId && !allAssetIds.has(hdriAssetId)) {
                errors.push({
                    code: 'MISSING_HDRI',
                    message: `HDRI asset '${hdriAssetId}' is specified in scene plan but not found in manifest.`,
                });
            }
        }


        // Check for duplicate assets (can be done at registry level, but good to double check)
        // A better check would be for duplicate sources, not just IDs
        const sources = new Map();
        for (const [id, asset] of Object.entries(this.assetManifest.assets)) {
            if(sources.has(asset.uri)) {
                errors.push({
                    code: 'DUPLICATE_ASSET',
                    message: `Asset URI '${asset.uri}' is used by multiple asset IDs: '${sources.get(asset.uri)}' and '${id}'.`,
                });
            } else {
                sources.set(asset.uri, id);
            }
        }

        return errors;
    }

    validateNode(node, allAssetIds, usedAssetIds, errors) {
        if (node.assetId) {
            if (!allAssetIds.has(node.assetId)) {
                errors.push({
                    code: 'BROKEN_SCENE_REFERENCE',
                    message: `Node '${node.id}' references a missing asset ID: '${node.assetId}'.`,
                });
            } else {
                usedAssetIds.add(node.assetId);
            }
        }

        if (node.children) {
            node.children.forEach(child => this.validateNode(child, allAssetIds, usedAssetIds, errors));
        }
    }

    generateAssetId(src) {
        if (!src) return '';
        let hash = 0;
        for (let i = 0; i < src.length; i++) {
            const char = src.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return `asset_${Math.abs(hash).toString(16)}`;
    }
}

export default AssetValidator;
