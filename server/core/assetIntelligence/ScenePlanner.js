
class ScenePlanner {
  /**
   * @param {object} blueprint - The Blueprint V3 object.
   */
  constructor(blueprint) {
    this.blueprint = blueprint;
  }

  /**
   * Creates a production ScenePlan.
   * @returns {object} The ScenePlan.
   */
  createScenePlan() {
    const scenePlan = {
      camera: this.planCamera(),
      lights: this.planLights(),
      environment: this.planEnvironment(),
      hdri: this.planHDRI(),
      materials: this.planMaterials(),
      postProcessing: this.planPostProcessing(),
      animations: this.planAnimations(),
      interaction: this.planInteraction(),
      performance: {
        profile: 'balanced', // default
        lodStrategy: 'distance',
        mobileFallback: 'low-quality-materials',
      },
    };

    if (this.blueprint.settings && this.blueprint.settings.performance) {
        scenePlan.performance.profile = this.blueprint.settings.performance.profile || 'balanced';
    }


    return scenePlan;
  }

  planCamera() {
    const cameraSettings = this.blueprint.scene?.camera || {};
    return {
      type: 'PerspectiveCamera',
      position: cameraSettings.position || [0, 1.6, 5],
      fov: cameraSettings.fov || 50,
      near: cameraSettings.near || 0.1,
      far: cameraSettings.far || 1000,
    };
  }

  planLights() {
    const lightSettings = this.blueprint.scene?.lights || [
        { type: 'AmbientLight', intensity: 0.7 },
        { type: 'DirectionalLight', intensity: 1.0, position: [5, 5, 5] }
    ];
    return lightSettings;
  }

  planEnvironment() {
      const environmentSettings = this.blueprint.scene?.environment || {};
      return {
          background: environmentSettings.background || 'sky', // can be 'sky', 'color', 'transparent'
          fog: environmentSettings.fog, // e.g., { type: 'linear', color: 0x000000, near: 1, far: 100 }
      };
  }

  planHDRI() {
      const hdri = this.blueprint.scene?.hdri;
      if (!hdri) return null;
      // An assetId might be provided directly if it's already known
      return hdri.assetId || hdri.src || null;
  }

  planMaterials() {
    // Extract material definitions from blueprint styles or scene settings
    return this.blueprint.scene?.materials || {
        default: { type: 'MeshStandardMaterial', color: 0xffffff },
    };
  }

  planPostProcessing() {
      return this.blueprint.scene?.postProcessing || [];
      // e.g. [ { type: 'Bloom', strength: 1.5, radius: 0.4, threshold: 0.85 }]
  }

  planAnimations() {
      // Extract animation instructions from the blueprint
      return this.blueprint.scene?.animations || [];
      // e.g. [ { target: 'model_id', animation: 'idle', loop: true }]
  }

  planInteraction() {
      // Extract interaction definitions from the blueprint
      return this.blueprint.scene?.interaction || [];
      // e.g. [ { target: 'button_id', event: 'onClick', action: 'navigate', payload: '/contact' }]
  }
}

export default ScenePlanner;
