/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  3D EXPERIENCE ENGINE CODE GENERATOR (PHASE 10)
 *  Synthesizes complete client-side 3D runtime files: Scene Composer, Camera
 *  Manager, Lighting Presets, Interaction Presets, Performance Layer, and
 *  all 35 Production React Three Fiber Scene components.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { SCENE_REGISTRY } from "../src/3d/sceneRegistry.js";

function createItem(fileName, relPath, content) {
  return {
    name: fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName,
    file: relPath,
    path: relPath,
    content: content,
    code: content,
    toString: () => content
  };
}

export function get3DExperienceComponents(bp = {}, themeParam = "modernDark") {
  const componentsMap = {};

  // 1. Client-side sceneRegistry.js
  const registryCode = `// Standardized 3D Scene Registry for client runtime
export const SCENE_REGISTRY = ${JSON.stringify(SCENE_REGISTRY, null, 2)};

export function getSceneMeta(id) {
  return SCENE_REGISTRY[id] || SCENE_REGISTRY.FloatingBlobScene;
}
`;
  componentsMap["sceneRegistry.js"] = createItem("sceneRegistry.js", "src/3d/sceneRegistry.js", registryCode);

  // 2. CameraManager.jsx
  const cameraCode = `import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function CameraManager({ preset = "Hero Camera", interactive = true }) {
  const cameraRef = useRef();
  const controlsRef = useRef();

  useEffect(() => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    switch (preset) {
      case "Hero Camera":
        cam.position.set(0, 0, 7.5);
        cam.fov = 45;
        break;
      case "Orbit Camera":
        cam.position.set(6, 3, 6);
        cam.fov = 50;
        break;
      case "Product Camera":
        cam.position.set(0, 2.5, 5.5);
        cam.fov = 40;
        break;
      case "Close-up":
        cam.position.set(0, 0.5, 3.8);
        cam.fov = 38;
        break;
      case "Wide":
        cam.position.set(0, 1.5, 12);
        cam.fov = 60;
        break;
      case "Scroll Camera":
        cam.position.set(0, 4, 8);
        cam.fov = 48;
        break;
      default:
        cam.position.set(0, 0, 7.5);
        cam.fov = 45;
    }
    cam.updateProjectionMatrix();
  }, [preset]);

  useFrame(({ clock, mouse }) => {
    if (!cameraRef.current || preset === "Orbit Camera") return;
    const elapsedTime = clock.getElapsedTime();
    if (preset === "Hero Camera" || preset === "Close-up" || preset === "Product Camera") {
      const targetX = mouse.x * 0.45;
      const targetY = -mouse.y * 0.35 + (preset === "Product Camera" ? 2.5 : 0);
      cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.04;
      cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.04;
      cameraRef.current.lookAt(0, 0, 0);
    } else if (preset === "Scroll Camera") {
      cameraRef.current.position.y = 4 + Math.sin(elapsedTime * 0.5) * 0.3;
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 7.5]} />
      {interactive && preset === "Orbit Camera" && <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.6} />}
    </>
  );
}
`;
  componentsMap["CameraManager.jsx"] = createItem("CameraManager.jsx", "src/3d/CameraManager.jsx", cameraCode);

  // 3. LightingPresets.jsx
  const lightingCode = `import React from 'react';
import { Environment } from '@react-three/drei';

export default function LightingPresets({ preset = "Studio", primaryColor = "#3b82f6", secondaryColor = "#10b981" }) {
  switch (preset) {
    case "Apple":
      return (
        <>
          <ambientLight intensity={0.7} color="#ffffff" />
          <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color="#e2e8f0" />
          <Environment preset="city" />
        </>
      );
    case "Neon":
      return (
        <>
          <ambientLight intensity={0.15} color="#0a0a14" />
          <pointLight position={[8, 8, 8]} intensity={5.0} color="#38bdf8" decay={2} />
          <pointLight position={[-8, -5, -6]} intensity={4.5} color="#f43f5e" decay={2} />
          <spotLight position={[0, 15, 5]} intensity={6.0} color="#a855f7" angle={0.4} />
        </>
      );
    case "Cinematic":
      return (
        <>
          <ambientLight intensity={0.25} />
          <spotLight position={[5, 12, 8]} intensity={4.0} color={primaryColor} angle={0.45} penumbra={1} castShadow />
          <directionalLight position={[-8, 3, -5]} intensity={1.5} color={secondaryColor} />
          <pointLight position={[0, -8, 4]} intensity={1.0} color="#ffffff" />
        </>
      );
    case "Sunset":
      return (
        <>
          <ambientLight intensity={0.5} color="#f59e0b" />
          <directionalLight position={[12, 6, 8]} intensity={3.0} color="#f97316" castShadow />
          <pointLight position={[-8, 4, -4]} intensity={2.0} color="#ec4899" />
          <Environment preset="sunset" />
        </>
      );
    case "Dark Tech":
      return (
        <>
          <ambientLight intensity={0.18} color="#030712" />
          <directionalLight position={[10, 10, 10]} intensity={2.8} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#06b6d4" />
          <pointLight position={[0, 0, 6]} intensity={1.2} color="#6366f1" />
        </>
      );
    case "Glass":
      return (
        <>
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight position={[5, 10, 7]} intensity={3.2} color="#ffffff" />
          <directionalLight position={[-5, -8, -5]} intensity={1.5} color="#94a3b8" />
          <Environment preset="studio" />
        </>
      );
    case "Studio":
    default:
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[8, 12, 8]} intensity={2.2} color="#ffffff" castShadow />
          <pointLight position={[-8, -8, -8]} intensity={0.9} color={primaryColor} />
          <Environment preset="studio" />
        </>
      );
  }
}
`;
  componentsMap["LightingPresets.jsx"] = createItem("LightingPresets.jsx", "src/3d/LightingPresets.jsx", lightingCode);

  // 4. InteractionPresets.js
  const interactionCode = `import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useInteractionPreset(ref, preset = "Hover Rotation", speedMultiplier = 1.0) {
  useFrame(({ clock, mouse, camera }) => {
    if (!ref.current) return;
    const elapsed = clock.getElapsedTime() * speedMultiplier;

    switch (preset) {
      case "Mouse Follow":
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.8, 0.05);
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.8, 0.05);
        break;
      case "Scroll Rotation":
        ref.current.rotation.y = elapsed * 0.4;
        ref.current.rotation.x = Math.sin(elapsed * 0.3) * 0.3;
        break;
      case "Parallax":
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.x * 0.6, 0.06);
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -mouse.y * 0.6, 0.06);
        break;
      case "Idle Float":
        ref.current.position.y = Math.sin(elapsed * 1.5) * 0.3;
        ref.current.rotation.y = elapsed * 0.2;
        break;
      case "Pulse":
        const scale = 1.0 + Math.sin(elapsed * 2.8) * 0.08;
        ref.current.scale.set(scale, scale, scale);
        ref.current.rotation.y = elapsed * 0.25;
        break;
      case "Morph":
        ref.current.rotation.y = elapsed * 0.3;
        ref.current.rotation.z = Math.sin(elapsed * 0.8) * 0.25;
        break;
      case "Reveal":
        ref.current.rotation.y = elapsed * 0.15;
        break;
      case "Hover Rotation":
      default:
        ref.current.rotation.y += 0.008 * speedMultiplier;
        ref.current.rotation.x = Math.sin(elapsed * 0.5) * 0.15;
        break;
    }
  });
}
`;
  componentsMap["InteractionPresets.js"] = createItem("InteractionPresets.js", "src/3d/InteractionPresets.js", interactionCode);

  // 5. PerformanceManager.js
  const performanceCode = `export const PERFORMANCE_PROFILES = {
  High: {
    bloom: true,
    bloomIntensity: 1.2,
    particleCount: 1500,
    geometrySegments: 64,
    shadows: true,
    pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)
  },
  Medium: {
    bloom: true,
    bloomIntensity: 0.7,
    particleCount: 700,
    geometrySegments: 32,
    shadows: false,
    pixelRatio: 1.5
  },
  Low: {
    bloom: false,
    bloomIntensity: 0,
    particleCount: 250,
    geometrySegments: 16,
    shadows: false,
    pixelRatio: 1.0
  }
};

export function getQualityProfile(level = "High") {
  return PERFORMANCE_PROFILES[level] || PERFORMANCE_PROFILES.High;
}
`;
  componentsMap["PerformanceManager.js"] = createItem("PerformanceManager.js", "src/3d/PerformanceManager.js", performanceCode);

  // 6. Generate Scene component files dynamically from SCENE_REGISTRY
  const scenesList = Object.values(SCENE_REGISTRY).map(s => ({
    name: s.id,
    type: s.type || "sphere",
    color: s.color || "#3b82f6",
    dist: s.dist || false
  }));

  scenesList.forEach((s) => {
    const fileName = `${s.name}.jsx`;
    const sceneContent = generateIndividualSceneCode(s.name, s.type, s.color, s.dist);
    componentsMap[fileName] = createItem(fileName, `src/3d/scenes/${fileName}`, sceneContent);
  });

  // 7. SceneComposer.jsx (Exports SceneContent for existing Canvas & SceneComposer container)
  const composerCode = `import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CameraManager from './CameraManager';
import LightingPresets from './LightingPresets';
import { getQualityProfile } from './PerformanceManager';

// Import All 35 Reusable Scenes
${scenesList.map(s => `import ${s.name} from './scenes/${s.name}';`).join('\n')}

const SCENE_COMPONENTS = {
${scenesList.map(s => `  ${s.name}: ${s.name},`).join('\n')}
};

export function SceneContent({
  sceneId = "FloatingBlobScene",
  cameraPreset = "Hero Camera",
  lightingPreset = "Studio",
  interactionPreset = "Hover Rotation",
  quality = "High",
  primaryColor = "#3b82f6",
  secondaryColor = "#10b981"
}) {
  const TargetScene = SCENE_COMPONENTS[sceneId] || SCENE_COMPONENTS.FloatingBlobScene;
  const profile = getQualityProfile(quality);

  return (
    <Suspense fallback={null}>
      <CameraManager preset={cameraPreset} interactive={true} />
      <LightingPresets preset={lightingPreset} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      
      {quality !== "Low" && <Stars radius={80} depth={50} count={profile.particleCount} factor={4} fade speed={1} />}

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <TargetScene interactionPreset={interactionPreset} qualityProfile={profile} color={primaryColor} />
      </Float>

      {profile.bloom && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={profile.bloomIntensity} />
        </EffectComposer>
      )}
    </Suspense>
  );
}

export default function SceneComposer({
  sceneId = "FloatingBlobScene",
  cameraPreset = "Hero Camera",
  lightingPreset = "Studio",
  interactionPreset = "Hover Rotation",
  quality = "High",
  primaryColor = "#3b82f6",
  secondaryColor = "#10b981",
  style = {}
}) {
  const profile = getQualityProfile(quality);

  return (
    <div className="w-full h-full relative pointer-events-auto" style={{ minHeight: '400px', ...style }}>
      <Canvas
        shadows={profile.shadows}
        dpr={profile.pixelRatio}
        gl={{ alpha: true, antialias: quality !== "Low" }}
        className="!absolute inset-0 w-full h-full"
      >
        <SceneContent
          sceneId={sceneId}
          cameraPreset={cameraPreset}
          lightingPreset={lightingPreset}
          interactionPreset={interactionPreset}
          quality={quality}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </Canvas>
    </div>
  );
}
`;
  componentsMap["SceneComposer.jsx"] = createItem("SceneComposer.jsx", "src/3d/SceneComposer.jsx", composerCode);

  return componentsMap;
}

/**
 * Generates custom Three.js mesh logic tailored to archetype category
 */
function generateIndividualSceneCode(name, type, defaultColor, isDistort = false) {
  return `import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useInteractionPreset } from '../InteractionPresets';
import * as THREE from 'three';

export default function ${name}({ interactionPreset = "Hover Rotation", qualityProfile = { geometrySegments: 64 }, color = "${defaultColor}" }) {
  const meshRef = useRef();
  useInteractionPreset(meshRef, interactionPreset);

  const segs = qualityProfile.geometrySegments || 64;

  ${type === 'particles' || type === 'constellation' || type === 'icons' || type === 'cloud' ? `
  const particlePositions = useMemo(() => {
    const count = ${type === 'particles' ? 600 : 300};
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 10;
      arr[i + 1] = (Math.random() - 0.5) * 10;
      arr[i + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);
  ` : ''}

  return (
    <group ref={meshRef}>
      ${type === 'sphere' || type === 'globe' ? `
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2.2, segs, segs]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} wireframe={${type === 'globe-wire'}} />
      </mesh>
      ${type === 'globe' ? `
      <mesh scale={1.05}>
        <sphereGeometry args={[2.2, segs / 2, segs / 2]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>` : ''}
      ` : type === 'sphere-glass' ? `
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2.3, segs, segs]} />
        <meshPhysicalMaterial color={color} transmission={0.9} opacity={1} transparent roughness={0.1} ior={1.5} thickness={0.5} />
      </mesh>
      ` : type === 'rings' || type === 'pedestal' ? `
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.5, 0.18, segs / 2, segs]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, 0, 0]} scale={0.8}>
        <torusGeometry args={[2.5, 0.12, segs / 2, segs]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>
      ` : type === 'core' || type === 'beam' || type === 'helix' ? `
      <mesh>
        <octahedronGeometry args={[2.0, 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]} scale={1.3}>
        <icosahedronGeometry args={[2.0, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>
      ` : type === 'cube' || type === 'dashboard' || type === 'cards' || type === 'device' || type === 'hologram' ? `
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.2, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.25]} scale={0.95}>
        <boxGeometry args={[3.2, 2.2, 0.05]} />
        <meshBasicMaterial color="#ffffff" wireframe={${type === 'hologram'}} transparent opacity={0.2} />
      </mesh>
      ` : type === 'grid' || type === 'globe-wire' ? `
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.8} wireframe={${type === 'globe-wire'}} />
      </mesh>
      ` : `
      {/* Particles & Clouds */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.07} transparent opacity={0.85} sizeAttenuation />
      </points>
      `}
    </group>
  );
}
`;
}
