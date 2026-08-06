
import AssetRegistry from './AssetRegistry.js';
import fetch from 'node-fetch';
import fs from 'fs';

class AssetResolver {
    /**
     * @param {AssetRegistry} assetRegistry - An instance of the AssetRegistry.
     * @param {object} config - Configuration for different resolvers.
     */
    constructor(assetRegistry, config = {}) {
        if (!(assetRegistry instanceof AssetRegistry)) {
            throw new Error('AssetResolver requires an instance of AssetRegistry.');
        }
        this.registry = assetRegistry;
        this.config = config; // Config for local paths, external URLs, etc.
        this.cache = new Map(); // A simple in-memory cache for resolved assets
    }

    /**
     * Resolves all assets in the registry and returns an AssetManifest.
     * @returns {Promise<object>} A promise that resolves to the AssetManifest.
     */
    async resolveAll() {
        const assetsToResolve = this.registry.findAssets(asset => asset.status === 'unresolved');
        const resolutionPromises = assetsToResolve.map(asset => this.resolveAsset(asset));
        await Promise.all(resolutionPromises);

        return this.createAssetManifest();
    }

    /**
     * Resolves a single asset based on its source type.
     * @param {object} asset - The asset entry from the registry.
     * @returns {Promise<void>}
     */
    async resolveAsset(asset) {
        if (this.cache.has(asset.source)) {
            const cached = this.cache.get(asset.source);
            this.registry.updateAssetStatus(asset.id, cached.status, { resolvedUri: cached.uri, error: cached.error });
            return;
        }

        this.registry.updateAssetStatus(asset.id, 'resolving');

        try {
            let resolvedUri;
            if (asset.source.startsWith('http')) {
                resolvedUri = await this.resolveExternalAsset(asset);
            } else if (asset.source.startsWith('file://') || asset.source.startsWith('/')) {
                resolvedUri = await this.resolveLocalAsset(asset);
            } else if (asset.source.startsWith('generate://')) {
                resolvedUri = await this.resolveGeneratedAsset(asset);
            } else {
                resolvedUri = await this.resolveRegistryAsset(asset);
            }

            this.registry.updateAssetStatus(asset.id, 'resolved', { resolvedUri });
            if (asset.cachePolicy !== 'no-cache') {
                this.cache.set(asset.source, { status: 'resolved', uri: resolvedUri, error: null });
            }
        } catch (error) {
            this.registry.updateAssetStatus(asset.id, 'error', { error: error.message });
            if (asset.cachePolicy !== 'no-cache') {
                this.cache.set(asset.source, { status: 'error', uri: null, error: error.message });
            }
        }
    }

    async resolveExternalAsset(asset) {
        console.log(`Resolving external asset: ${asset.source}`);
        try {
            const response = await fetch(asset.source, { method: 'HEAD' });
            if (!response.ok) {
                console.warn(`External asset HEAD check returned status ${response.status} for ${asset.source}. Using source as-is.`);
            }
        } catch (error) {
            console.warn(`External asset HEAD check failed for ${asset.source}: ${error.message}. Using source as-is.`);
        }
        return asset.source;
    }

    async resolveLocalAsset(asset) {
        console.log(`Resolving local asset: ${asset.source}`);
        const path = asset.source.replace('file://', '');
        try {
            await fs.promises.access(path, fs.constants.F_OK);
            return asset.source;
        } catch (error) {
            throw new Error(`Local asset not found at: ${path}`);
        }
    }

    async resolveGeneratedAsset(asset) {
        // This is a placeholder for AI-based asset generation.
        console.log(`Generating asset: ${asset.source}`);
        const prompt = asset.source.substring('generate://'.length);
        const generatedAssetUri = `https://generated.assets.com/${prompt.replace(/\s/g, '-')}.gltf`; // dummy URI
        return generatedAssetUri;
    }

    async resolveRegistryAsset(asset) {
        // This could look up an asset in a central company-wide registry.
        console.log(`Resolving from registry: ${asset.source}`);
        const registryUri = `https://internal.assets.com/${asset.source}`;
        return registryUri;
    }


    /**
     * Creates the final AssetManifest from the resolved assets in the registry.
     * @returns {object} The AssetManifest.
     */
    createAssetManifest() {
        const resolvedAssets = this.registry.findAssets(asset => asset.status === 'resolved');
        const manifest = {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            assets: {},
        };
        resolvedAssets.forEach(asset => {
            manifest.assets[asset.id] = {
                type: asset.type,
                format: asset.format,
                uri: asset.resolvedUri,
                size: asset.size,
                dependencies: asset.dependencies,
                license: asset.license,
            };
        });
        return manifest;
    }
}

export default AssetResolver;
