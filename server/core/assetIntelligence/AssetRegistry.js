
class AssetRegistry {
  constructor(initialAssets = []) {
    this.assets = new Map(); // Using a Map for efficient lookups by ID
    initialAssets.forEach(asset => this.registerAsset(asset));
  }

  /**
   * Registers a new asset or updates an existing one.
   * @param {object} assetData - The asset data to register.
   * @returns {string} The asset ID.
   */
  registerAsset(assetData) {
    if (!assetData.id) {
      throw new Error('Asset ID is required.');
    }
    if (!assetData.type) {
        throw new Error('Asset type is required.');
    }
    if (!assetData.source) {
        throw new Error('Asset source is required.');
    }

    const entry = {
        id: assetData.id,
        type: assetData.type, // e.g., 'model', 'texture', 'font'
        source: assetData.source, // URL, file path, or generation prompt
        license: assetData.license || 'proprietary',
        format: assetData.format, // e.g., 'gltf', 'png', 'woff2'
        dependencies: assetData.dependencies || [],
        size: assetData.size || -1, // in bytes
        lod: assetData.lod || [], // array of LOD asset IDs
        tags: assetData.tags || [],
        cachePolicy: assetData.cachePolicy || 'default', // 'default', 'no-cache', 'long-lived'
        status: 'unresolved', // 'unresolved', 'resolving', 'resolved', 'error'
        resolvedUri: null,
        error: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    this.assets.set(entry.id, entry);
    return entry.id;
  }

  /**
   * Retrieves an asset by its ID.
   * @param {string} id - The ID of the asset.
   * @returns {object|undefined} The asset entry.
   */
  getAsset(id) {
    return this.assets.get(id);
  }

  /**
   * Finds assets based on a filter function.
   * @param {function} filterFn - A function that returns true for matching assets.
   * @returns {object[]} An array of matching asset entries.
   */
  findAssets(filterFn) {
    const results = [];
    for (const asset of this.assets.values()) {
      if (filterFn(asset)) {
        results.push(asset);
      }
    }
    return results;
  }

  /**
   * Updates the status of an asset.
   * @param {string} id - The ID of the asset.
   * @param {string} status - The new status.
   * @param {object} details - Additional details (e.g., resolvedUri, error).
   */
  updateAssetStatus(id, status, details = {}) {
    const asset = this.getAsset(id);
    if (asset) {
      asset.status = status;
      Object.assign(asset, details);
      asset.updatedAt = Date.now();
      this.assets.set(id, asset);
    }
  }

  /**
   * Returns all assets in the registry.
   * @returns {object[]}
   */
  getAllAssets() {
      return Array.from(this.assets.values());
  }
}

export default AssetRegistry;
