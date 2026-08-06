class AssetPlanner {
  /**
   * @param {object} blueprint - The Blueprint V3 object.
   */
  constructor(blueprint) {
    this.blueprint = blueprint || {};
  }

  /**
   * Generates an AssetPlan from the blueprint.
   * @returns {object} The AssetPlan.
   */
  generatePlan() {
    const plan = {
      hero: [],
      background: [],
      decorative: [],
      interactive: [],
      icons: [],
      images: [],
      models: [],
      hdris: [],
      materials: [],
      textures: [],
      fonts: [],
      audio: [],
      video: []
    };

    const addAsset = (category, asset) => {
      if (!asset || !asset.id) return;
      if (!plan[category]) return;
      if (plan[category].some(a => a.id === asset.id)) {
        return;
      }
      plan[category].push(asset);
    };

    // 1. Process Fonts from typography settings
    if (this.blueprint.typography) {
      const fonts = ['displayFont', 'bodyFont', 'monoFont'];
      fonts.forEach(fontKey => {
        const fontFamily = this.blueprint.typography[fontKey];
        if (fontFamily) {
          const id = this.generateAssetId(fontFamily);
          addAsset('fonts', {
            id,
            type: 'font',
            source: fontFamily,
            format: 'woff2',
            license: 'google-fonts',
            cachePolicy: 'long-lived'
          });
        }
      });
    }

    // 2. Process HDRI from scene settings
    if (this.blueprint.scene?.hdri) {
      const hdri = this.blueprint.scene.hdri;
      const src = typeof hdri === 'string' ? hdri : (hdri.src || hdri.assetId);
      if (src) {
        const id = this.generateAssetId(src);
        addAsset('hdris', {
          id,
          type: 'hdri',
          source: src,
          format: this.getFileFormat(src, 'hdr'),
          license: 'creative-commons',
          cachePolicy: 'long-lived'
        });

        // HDRI also serves as background asset
        addAsset('background', {
          id,
          type: 'hdri',
          source: src,
          format: this.getFileFormat(src, 'hdr'),
          tags: ['background', 'env-map']
        });
      }
    }

    // 3. Process Materials from scene settings
    if (this.blueprint.scene?.materials) {
      Object.entries(this.blueprint.scene.materials).forEach(([matName, matProps]) => {
        const id = `material_${matName}`;
        addAsset('materials', {
          id,
          type: 'material',
          source: JSON.stringify(matProps),
          properties: matProps
        });

        // If material has maps/textures
        const textureKeys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'envMap'];
        textureKeys.forEach(tKey => {
          if (matProps[tKey] && typeof matProps[tKey] === 'string') {
            const tSrc = matProps[tKey];
            const tId = this.generateAssetId(tSrc);
            addAsset('textures', {
              id: tId,
              type: 'texture',
              source: tSrc,
              format: this.getFileFormat(tSrc, 'png')
            });
          }
        });
      });
    }

    // 4. Traverse Blueprint Sections & Components
    if (this.blueprint.sections) {
      for (const [sectionKey, section] of Object.entries(this.blueprint.sections)) {
        const isHeroSection = sectionKey.toLowerCase() === 'hero' || section.type?.toLowerCase() === 'hero';

        if (section.components) {
          for (const [compKey, component] of Object.entries(section.components)) {
            const props = component.props || {};

            // Extract Font from component if custom fontFamily is specified
            if (props.fontFamily) {
              const fontId = this.generateAssetId(props.fontFamily);
              addAsset('fonts', {
                id: fontId,
                type: 'font',
                source: props.fontFamily,
                format: 'woff2'
              });
            }

            // Extract Model (GLTF/GLB)
            if (component.type === 'Model' || props.modelSrc) {
              const modelSrc = props.modelSrc;
              if (modelSrc) {
                const id = this.generateAssetId(modelSrc);
                const asset = {
                  id,
                  type: 'model',
                  source: modelSrc,
                  format: this.getFileFormat(modelSrc, 'glb'),
                  tags: [sectionKey, component.type]
                };

                addAsset('models', asset);

                // Classify functional role
                if (isHeroSection) {
                  addAsset('hero', asset);
                } else if (props.interactive || props.onClick) {
                  addAsset('interactive', asset);
                } else if (props.decorative || props.isDecorative) {
                  addAsset('decorative', asset);
                } else if (props.isBackground) {
                  addAsset('background', asset);
                } else {
                  // Fallback
                  addAsset('decorative', asset);
                }
              }
            }

            // Extract Image / Texture
            if (component.type === 'Image' || props.imageSrc || props.texture) {
              const imgSrc = props.imageSrc || props.texture;
              if (imgSrc) {
                const id = this.generateAssetId(imgSrc);
                const asset = {
                  id,
                  type: 'texture',
                  source: imgSrc,
                  format: this.getFileFormat(imgSrc, 'png'),
                  tags: [sectionKey, component.type]
                };

                addAsset('images', asset);
                addAsset('textures', asset);

                if (props.isBackground) {
                  addAsset('background', asset);
                }
              }
            }

            // Extract Icons
            if (component.type === 'Icon' || props.icon || props.iconName) {
              const iconName = props.icon || props.iconName;
              if (iconName) {
                const id = this.generateAssetId(iconName);
                addAsset('icons', {
                  id,
                  type: 'icon',
                  source: iconName,
                  format: 'svg'
                });
              }
            }

            // Extract Audio
            if (props.audioSrc || props.audio) {
              const audioSrc = props.audioSrc || props.audio;
              const id = this.generateAssetId(audioSrc);
              addAsset('audio', {
                id,
                type: 'audio',
                source: audioSrc,
                format: this.getFileFormat(audioSrc, 'mp3')
              });
            }

            // Extract Video
            if (props.videoSrc || props.video) {
              const videoSrc = props.videoSrc || props.video;
              const id = this.generateAssetId(videoSrc);
              addAsset('video', {
                id,
                type: 'video',
                source: videoSrc,
                format: this.getFileFormat(videoSrc, 'mp4')
              });
            }
          }
        }
      }
    }

    return plan;
  }

  /**
   * Generates a deterministic ID for an asset based on its source.
   * @param {string} src - The source of the asset.
   * @returns {string} A unique ID.
   */
  generateAssetId(src) {
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      const char = src.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `asset_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Extracts format/extension from a filename or URL.
   */
  getFileFormat(src, fallback) {
    if (typeof src !== 'string') return fallback;
    try {
      const url = new URL(src, 'http://dummy.com');
      const ext = url.pathname.split('.').pop();
      if (ext && ext.length <= 5) return ext.toLowerCase();
    } catch (e) {
      // Not a valid URL, check direct filename
      const ext = src.split('.').pop();
      if (ext && ext.length <= 5) return ext.toLowerCase();
    }
    return fallback;
  }
}

export default AssetPlanner;
