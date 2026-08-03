/**
 * MasterLayoutEngine.js
 *
 * Generates completely different React + Tailwind + Three.js code structures
 * for each of the 10 layout archetypes (A-J) from the Master Prompt spec.
 *
 * Used as the local fallback when the AI code-generation API is unavailable.
 * Each archetype produces a structurally different Hero, Scene, and Section.
 */

import { getIndustryHeroData, inferBusinessType } from './BlueprintGenerator.js'

// ─── Colour helpers ────────────────────────────────────────────────────────────

function hex2rgb(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function lighten(hex, amt = 30) {
  const h = hex.replace('#', '')
  const clamp = v => Math.min(255, Math.max(0, v))
  const r = clamp(parseInt(h.slice(0, 2), 16) + amt).toString(16).padStart(2, '0')
  const g = clamp(parseInt(h.slice(2, 4), 16) + amt).toString(16).padStart(2, '0')
  const b = clamp(parseInt(h.slice(4, 6), 16) + amt).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

// ─── Scene code builders ───────────────────────────────────────────────────────
// Each scene_* function returns the SceneContent component body as a string.
// ${primary} / ${accent} are interpolated to real hex values at call time.

function scene_web(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const nodes = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const theta = (i / 18) * Math.PI * 2
    const r = 0.7 + (i % 3) * 0.4
    return { pos: [Math.cos(theta) * r, (i % 5 - 2) * 0.35, Math.sin(theta) * r], s: 0.04 + (i % 4) * 0.02 }
  }), [])
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.15
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.28) * 0.1
    }
  })
  return (
    <group ref={groupRef}>
      <mesh><sphereGeometry args={[0.14, 16, 16]} /><meshStandardMaterial color="${p}" emissive="${p}" emissiveIntensity={1.5} /></mesh>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.s, 10, 10]} />
          <meshStandardMaterial color={i % 3 === 0 ? "${a}" : "${p}"} emissive={i % 3 === 0 ? "${a}" : "${p}"} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[0.55, 1.05, 1.55].map((r, i) => (
        <mesh key={i} rotation={[i * 0.55, i * 0.28, 0]}>
          <torusGeometry args={[r, 0.007, 6, 72]} />
          <meshStandardMaterial color="${p}" emissive="${p}" emissiveIntensity={0.5} transparent opacity={0.65 - i * 0.15} />
        </mesh>
      ))}
    </group>
  )
}`
}

function scene_ar(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const panelRef = useRef(null)
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.32
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.09
    }
    if (panelRef.current) panelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.09 + 0.72
  })
  return (
    <group ref={groupRef}>
      {[-0.54, 0.54].map((x, li) => (
        <group key={li} position={[x, 0, 0]}>
          <mesh><torusGeometry args={[0.4, 0.055, 20, 56]} /><meshStandardMaterial color="${p}" roughness={0.08} metalness={0.96} emissive="${p}" emissiveIntensity={0.28} /></mesh>
          <mesh><circleGeometry args={[0.34, 36]} /><meshPhysicalMaterial color="${p}" transmission={0.88} roughness={0} thickness={0.5} transparent opacity={0.14} /></mesh>
          <mesh scale={1.18}><torusGeometry args={[0.4, 0.012, 8, 56]} /><meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={1.0} transparent opacity={0.55} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.32, 0.045, 0.055]} /><meshStandardMaterial color="${p}" roughness={0.2} metalness={0.92} /></mesh>
      <mesh ref={panelRef} position={[0, 0.72, 0.18]}>
        <planeGeometry args={[1.15, 0.3]} />
        <meshStandardMaterial color="${a}" transparent opacity={0.14} side={2} emissive="${a}" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0.18]}><planeGeometry args={[1.15, 0.01]} /><meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={1.2} /></mesh>
    </group>
  )
}`
}

function scene_hand(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.48
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.28) * 0.09 - 0.14
    }
  })
  const fingers = [{ x: -0.31, len: [0.22, 0.18, 0.13] }, { x: -0.105, len: [0.26, 0.2, 0.14] }, { x: 0.105, len: [0.27, 0.21, 0.14] }, { x: 0.31, len: [0.22, 0.17, 0.12] }]
  return (
    <group ref={groupRef} position={[0, -0.28, 0]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[0.76, 0.64, 0.19]} /><meshStandardMaterial color="${p}" roughness={0.35} metalness={0.62} emissive="${p}" emissiveIntensity={0.1} /></mesh>
      <group position={[-0.46, 0.06, 0]} rotation={[0, 0, 0.72]}>
        <mesh position={[0, 0.16, 0]}><capsuleGeometry args={[0.062, 0.19, 8, 16]} /><meshStandardMaterial color="${p}" roughness={0.35} metalness={0.6} /></mesh>
        <mesh position={[0, 0.37, 0]}><capsuleGeometry args={[0.052, 0.15, 8, 16]} /><meshStandardMaterial color="${a}" roughness={0.3} metalness={0.55} emissive="${a}" emissiveIntensity={0.22} /></mesh>
      </group>
      {fingers.map((f, fi) => (
        <group key={fi} position={[f.x, 0.3, 0]}>
          {f.len.map((l, si) => (
            <mesh key={si} position={[0, f.len.slice(0, si).reduce((s, v) => s + v * 2.1 + 0.05, 0.18), 0]}>
              <capsuleGeometry args={[0.052 - si * 0.007, l, 8, 16]} />
              <meshStandardMaterial color={si === 2 ? "${a}" : "${p}"} roughness={0.33} metalness={0.6} emissive={si === 2 ? "${a}" : "${p}"} emissiveIntensity={si === 2 ? 0.28 : 0.08} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.1, 0]}><sphereGeometry args={[0.72, 16, 16]} /><meshStandardMaterial color="${a}" transparent opacity={0.055} side={2} /></mesh>
    </group>
  )
}`
}

function scene_galaxy(p, a) {
  return `function SceneContent() {
  const pointsRef = useRef(null)
  const armCount = 3, ppa = 480
  const { pos, col } = useMemo(() => {
    const pos = new Float32Array(armCount * ppa * 3)
    const col = new Float32Array(armCount * ppa * 3)
    const c1r = parseInt("${p}".slice(1, 3), 16) / 255
    const c1g = parseInt("${p}".slice(3, 5), 16) / 255
    const c1b = parseInt("${p}".slice(5, 7), 16) / 255
    const c2r = parseInt("${a}".slice(1, 3), 16) / 255
    const c2g = parseInt("${a}".slice(3, 5), 16) / 255
    const c2b = parseInt("${a}".slice(5, 7), 16) / 255
    let idx = 0
    for (let arm = 0; arm < armCount; arm++) {
      const armBase = (arm / armCount) * Math.PI * 2
      for (let i = 0; i < ppa; i++) {
        const t = i / ppa, r = t * 2.4, spin = t * Math.PI * 3.2, sc = (1 - t) * 0.18
        const ang = armBase + spin
        pos[idx * 3]     = Math.cos(ang) * r + (Math.random() - 0.5) * sc
        pos[idx * 3 + 1] = (Math.random() - 0.5) * 0.22 * (1 - t)
        pos[idx * 3 + 2] = Math.sin(ang) * r + (Math.random() - 0.5) * sc
        col[idx * 3]     = c1r + (c2r - c1r) * t
        col[idx * 3 + 1] = c1g + (c2g - c1g) * t
        col[idx * 3 + 2] = c1b + (c2b - c1b) * t
        idx++
      }
    }
    return { pos, col }
  }, [])
  useFrame((_, dt) => { if (pointsRef.current) pointsRef.current.rotation.y += dt * 0.055 })
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.016} vertexColors sizeAttenuation transparent opacity={0.88} />
    </points>
  )
}`
}

function scene_music(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const barsRef = useRef([])
  const BAR = 28
  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.22
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      const h = 0.25 + Math.abs(Math.sin(state.clock.elapsedTime * 2.8 + i * 0.38)) * 1.6
      bar.scale.y = h
      bar.position.y = h * 0.25
    })
  })
  const barData = Array.from({ length: BAR }, (_, i) => {
    const ang = (i / BAR) * Math.PI * 2
    return { x: Math.cos(ang) * 1.25, z: Math.sin(ang) * 1.25 }
  })
  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.68, 0.68, 0.045, 52]} /><meshStandardMaterial color="#0a0a0a" roughness={0.08} metalness={0.95} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.03, 12, 36]} /><meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={1.0} /></mesh>
      {barData.map((b, i) => (
        <mesh key={i} ref={el => barsRef.current[i] = el} position={[b.x, 0.3, b.z]}>
          <boxGeometry args={[0.075, 1, 0.075]} />
          <meshStandardMaterial color={i % 5 === 0 ? "${a}" : "${p}"} emissive={i % 5 === 0 ? "${a}" : "${p}"} emissiveIntensity={0.55} roughness={0.18} metalness={0.75} />
        </mesh>
      ))}
    </group>
  )
}`
}

function scene_city(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const blds = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    x: ((i % 8) - 3.5) * 0.52 + (Math.random() - 0.5) * 0.18,
    z: (Math.floor(i / 8) - 1.5) * 0.62 + (Math.random() - 0.5) * 0.14,
    h: 0.45 + Math.random() * 2.4,
    w: 0.16 + Math.random() * 0.16,
    glow: Math.random() > 0.7,
  })), [])
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.07
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.28) * 0.04
    }
  })
  return (
    <group ref={groupRef} position={[0, -1.1, 0]}>
      {blds.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.w * 0.88]} />
            <meshStandardMaterial color="${p}" roughness={0.28} metalness={0.82} emissive="${p}" emissiveIntensity={b.glow ? 0.28 : 0.04} />
          </mesh>
          {b.glow && (
            <mesh position={[0, b.h / 2 + 0.025, 0]}>
              <boxGeometry args={[b.w * 0.32, 0.045, b.w * 0.32]} />
              <meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={2.0} />
            </mesh>
          )}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="${p}" emissive="${p}" emissiveIntensity={0.06} roughness={0.85} />
      </mesh>
    </group>
  )
}`
}

function scene_crystal(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const gems = useMemo(() => Array.from({ length: 11 }, (_, i) => ({
    pos: [(Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.3],
    sc: 0.28 + Math.random() * 0.65,
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    isAccent: i % 3 === 0,
  })), [])
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.11
    }
  })
  return (
    <group ref={groupRef}>
      <mesh><octahedronGeometry args={[0.95, 0]} /><meshPhysicalMaterial color="${p}" roughness={0} metalness={0.08} transmission={0.88} thickness={2.2} /></mesh>
      {gems.map((g, i) => (
        <mesh key={i} position={g.pos} rotation={g.rot} scale={g.sc}>
          <octahedronGeometry args={[0.65, 0]} />
          <meshPhysicalMaterial color={g.isAccent ? "${a}" : "${p}"} roughness={0} metalness={0.06} transmission={0.75} thickness={1.2} emissive={g.isAccent ? "${a}" : "${p}"} emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  )
}`
}

function scene_dna(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const N = 22
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * 0.22 })
  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {Array.from({ length: N }).map((_, i) => {
        const t = i / N, ang = t * Math.PI * 5.5, y = t * 2.6, r = 0.72
        return (
          <group key={i}>
            <mesh position={[Math.cos(ang) * r, y, Math.sin(ang) * r]}>
              <sphereGeometry args={[0.085, 14, 14]} />
              <meshStandardMaterial color="${p}" emissive="${p}" emissiveIntensity={0.65} roughness={0.18} />
            </mesh>
            <mesh position={[Math.cos(ang + Math.PI) * r, y, Math.sin(ang + Math.PI) * r]}>
              <sphereGeometry args={[0.085, 14, 14]} />
              <meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={0.65} roughness={0.18} />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0, y, 0]} rotation={[0, ang, 0]}>
                <boxGeometry args={[r * 2, 0.028, 0.028]} />
                <meshStandardMaterial color="white" transparent opacity={0.35} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}`
}

function scene_neural(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const N = 28
  const nodes = useMemo(() => Array.from({ length: N }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / N), theta = Math.sqrt(N * Math.PI) * phi
    return [1.55 * Math.cos(theta) * Math.sin(phi), 1.55 * Math.cos(phi), 1.55 * Math.sin(theta) * Math.sin(phi)]
  }), [])
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * 0.18 })
  return (
    <group ref={groupRef}>
      <mesh><icosahedronGeometry args={[0.92, 2]} /><meshStandardMaterial color="${p}" wireframe emissive="${p}" emissiveIntensity={0.72} /></mesh>
      <mesh scale={0.68}><icosahedronGeometry args={[0.92, 0]} /><meshStandardMaterial color="${p}" roughness={0.08} metalness={0.92} emissive="${p}" emissiveIntensity={0.18} /></mesh>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[i % 6 === 0 ? 0.075 : 0.042, 8, 8]} />
          <meshStandardMaterial color={i % 4 === 0 ? "${a}" : "${p}"} emissive={i % 4 === 0 ? "${a}" : "${p}"} emissiveIntensity={0.95} />
        </mesh>
      ))}
    </group>
  )
}`
}

function scene_planet(p, a) {
  return `function SceneContent() {
  const planetRef = useRef(null)
  const ring1Ref = useRef(null)
  const moonRef = useRef(null)
  useFrame((state, dt) => {
    if (planetRef.current) planetRef.current.rotation.y += dt * 0.16
    if (ring1Ref.current) ring1Ref.current.rotation.z += dt * 0.035
    if (moonRef.current) {
      const t = state.clock.elapsedTime * 0.45
      moonRef.current.position.set(Math.cos(t) * 2.25, Math.sin(t) * 0.28, Math.sin(t) * 2.25)
    }
  })
  return (
    <group>
      <mesh ref={planetRef}><sphereGeometry args={[1.05, 64, 64]} /><meshStandardMaterial color="${p}" roughness={0.62} metalness={0.28} emissive="${p}" emissiveIntensity={0.07} /></mesh>
      <mesh scale={1.14}><sphereGeometry args={[1.05, 32, 32]} /><meshStandardMaterial color="${a}" transparent opacity={0.07} side={2} /></mesh>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.7, 0, 0]}><torusGeometry args={[1.68, 0.24, 3, 140]} /><meshStandardMaterial color="${p}" roughness={0.82} transparent opacity={0.58} /></mesh>
      <mesh rotation={[Math.PI / 2.7, 0, 0]}><torusGeometry args={[2.05, 0.07, 3, 100]} /><meshStandardMaterial color="${a}" transparent opacity={0.32} emissive="${a}" emissiveIntensity={0.45} /></mesh>
      <mesh ref={moonRef} position={[2.25, 0, 0]}><sphereGeometry args={[0.19, 18, 18]} /><meshStandardMaterial color="#b8b8c8" roughness={0.92} /></mesh>
    </group>
  )
}`
}

function scene_wave(p, a) {
  return `function SceneContent() {
  const meshRef = useRef(null)
  const posRef = useRef(null)
  const W = 32, H = 32
  const base = useMemo(() => {
    const pos = new Float32Array(W * H * 3)
    for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) {
      const idx = (i * H + j) * 3
      pos[idx] = (i / (W - 1) - 0.5) * 4
      pos[idx + 1] = 0
      pos[idx + 2] = (j / (H - 1) - 0.5) * 4
    }
    return pos
  }, [])
  useFrame((state) => {
    if (!meshRef.current) return
    const geo = meshRef.current.geometry
    const pos = geo.attributes.position.array
    for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) {
      const idx = (i * H + j) * 3
      pos[idx + 1] = Math.sin(i * 0.55 + state.clock.elapsedTime * 1.8) * 0.28 + Math.sin(j * 0.62 + state.clock.elapsedTime * 1.4) * 0.22
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
  })
  const indices = useMemo(() => {
    const idx = []
    for (let i = 0; i < W - 1; i++) for (let j = 0; j < H - 1; j++) {
      const a = i * H + j, b = a + 1, c = (i + 1) * H + j, d = c + 1
      idx.push(a, b, c, b, d, c)
    }
    return new Uint16Array(idx)
  }, [])
  return (
    <mesh ref={meshRef} position={[0, -0.4, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base.slice(), 3]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>
      <meshStandardMaterial color="${p}" wireframe emissive="${p}" emissiveIntensity={0.55} transparent opacity={0.8} />
    </mesh>
  )
}`
}

function scene_chart(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const barsRef = useRef([])
  const data = [0.38, 0.62, 0.51, 0.88, 0.72, 0.95, 1.0, 0.78, 0.84, 0.58, 0.91, 0.44]
  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.08
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      const target = data[i] * 2.0 + Math.sin(state.clock.elapsedTime * 1.6 + i * 0.5) * 0.12
      bar.scale.y += (target - bar.scale.y) * 0.06
    })
  })
  return (
    <group ref={groupRef} position={[0, -0.9, 0]}>
      {data.map((d, i) => {
        const x = (i - data.length / 2 + 0.5) * 0.34
        return (
          <mesh key={i} ref={el => barsRef.current[i] = el} position={[x, d, 0]} scale={[1, d * 2.0, 1]}>
            <boxGeometry args={[0.22, 1, 0.22]} />
            <meshStandardMaterial color={i === 6 ? "${a}" : "${p}"} emissive={i === 6 ? "${a}" : "${p}"} emissiveIntensity={i === 6 ? 0.6 : 0.14} roughness={0.18} metalness={0.82} />
          </mesh>
        )
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial color="${p}" emissive="${p}" emissiveIntensity={0.05} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}`
}

function scene_robot(p, a) {
  return `function SceneContent() {
  const groupRef = useRef(null)
  const eyeRef = useRef(null)
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.38
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.07
    }
    if (eyeRef.current) eyeRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3.5) * 0.4
  })
  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <mesh position={[0, 1.35, 0]}><boxGeometry args={[0.58, 0.52, 0.46]} /><meshStandardMaterial color="${p}" roughness={0.22} metalness={0.92} /></mesh>
      <mesh ref={eyeRef} position={[0, 1.42, 0.26]}><boxGeometry args={[0.3, 0.08, 0.02]} /><meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={1.2} /></mesh>
      <mesh position={[0, 0.78, 0]}><boxGeometry args={[0.72, 0.72, 0.52]} /><meshStandardMaterial color="${p}" roughness={0.25} metalness={0.88} emissive="${p}" emissiveIntensity={0.06} /></mesh>
      {[-0.52, 0.52].map((x, i) => (
        <group key={i} position={[x, 0.82, 0]}>
          <mesh position={[0, -0.22, 0]}><boxGeometry args={[0.22, 0.52, 0.22]} /><meshStandardMaterial color="${p}" roughness={0.28} metalness={0.85} /></mesh>
          <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.2, 0.44, 0.2]} /><meshStandardMaterial color="${a}" roughness={0.2} metalness={0.9} emissive="${a}" emissiveIntensity={0.2} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.24, 0]}><boxGeometry args={[0.56, 0.06, 0.42]} /><meshStandardMaterial color="${a}" emissive="${a}" emissiveIntensity={0.5} /></mesh>
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, -0.12, 0]}>
          <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.24, 0.68, 0.24]} /><meshStandardMaterial color="${p}" roughness={0.28} metalness={0.85} /></mesh>
          <mesh position={[0, -0.75, 0]}><boxGeometry args={[0.26, 0.18, 0.3]} /><meshStandardMaterial color="${p}" roughness={0.4} metalness={0.7} /></mesh>
        </group>
      ))}
    </group>
  )
}`
}

function scene_abstract(p, a) {
  return `function SceneContent() {
  const meshRef = useRef(null)
  const pointsRef = useRef(null)
  const N = 700
  const positions = useMemo(() => {
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const r = 1.9 + Math.random() * 1.3, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])
  useFrame((state, dt) => {
    if (meshRef.current) { meshRef.current.rotation.y += dt * 0.32; meshRef.current.rotation.x += dt * 0.1 }
    if (pointsRef.current) pointsRef.current.rotation.y -= dt * 0.05
  })
  return (
    <group>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[0.88, 0.28, 220, 32, 2, 3]} />
          <meshStandardMaterial color="${p}" roughness={0.14} metalness={0.96} emissive="${p}" emissiveIntensity={0.12} />
        </mesh>
      </Float>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
        <pointsMaterial size={0.024} color="${a}" sizeAttenuation transparent opacity={0.72} />
      </points>
    </group>
  )
}`
}

// ─── Scene dispatcher ──────────────────────────────────────────────────────────

const SCENE_MAP = {
  web:     scene_web,
  ar:      scene_ar,
  hand:    scene_hand,
  galaxy:  scene_galaxy,
  music:   scene_music,
  city:    scene_city,
  crystal: scene_crystal,
  dna:     scene_dna,
  neural:  scene_neural,
  planet:  scene_planet,
  wave:    scene_wave,
  chart:   scene_chart,
  robot:   scene_robot,
  abstract: scene_abstract,
}

function detectSceneType(subject, concept) {
  const s = (subject + ' ' + concept).toLowerCase()
  // Direct match — if AI sets scene_type exactly, honour it immediately
  const exactTypes = ['web','ar','hand','robot','galaxy','wave','music','city','crystal','dna','neural','planet','chart','abstract']
  for (const t of exactTypes) {
    if (s.startsWith(t) || s.includes(` ${t} `) || s === t) return t
  }
  // Keyword fallback
  if (/web|spider|network|link|node|connect/.test(s))              return 'web'
  if (/ar\b|vr\b|goggles|glasses|lens|headset|xr|mixed reality/.test(s)) return 'ar'
  if (/\bhand\b|finger|glove|palm|reach|touch/.test(s))           return 'hand'
  if (/robot|mech|android|drone|cyborg/.test(s))                  return 'robot'
  if (/galaxy|cosmos|nebula|universe|astro|space/.test(s))        return 'galaxy'
  if (/\bwave|ocean|water|sea|fluid|liquid|surf/.test(s))         return 'wave'
  if (/music|sound|audio|frequency|beat|dj|vinyl|song/.test(s))  return 'music'
  if (/city|building|urban|skyline|tower|architect/.test(s))      return 'city'
  if (/crystal|gem|diamond|jewel|prism/.test(s))                  return 'crystal'
  if (/dna|helix|molecule|bio|pharma|gene/.test(s))               return 'dna'
  if (/brain|neural|ai\b|chip|circuit|deep learn/.test(s))        return 'neural'
  if (/planet|globe|earth|world|orbit/.test(s))                   return 'planet'
  if (/chart|graph|data|analytics|stock|finance|fintech/.test(s)) return 'chart'
  if (/tattoo|ink|art|studio|creative|design|fashion|cloth/.test(s)) return 'abstract'
  return 'abstract'
}

function buildSceneJSX(blueprint) {
  const scene   = blueprint?.cinematic_3d_scene ?? {}
  const ds      = blueprint?.palette ?? blueprint?.design_system?.color_palette ?? blueprint?.designSystem ?? {}
  const primary = ds.primary ?? ds.primaryColor ?? '#6366f1'
  const accent  = ds.accent  ?? ds.accentColor  ?? '#a78bfa'
  const subject = scene.main_3d_subject ?? scene.scene_type ?? ''
  const concept = blueprint?.creative_concept?.business_type ?? ''

  const sceneType   = detectSceneType(subject, concept)
  const sceneBuilder = SCENE_MAP[sceneType] ?? scene_abstract
  const sceneBody   = sceneBuilder(primary, accent)

  const needsUseMemo = /useMemo/.test(sceneBody)

  return `import { useRef${needsUseMemo ? ', useMemo' : ''} } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, OrbitControls } from '@react-three/drei'

${sceneBody}

export default function Cinematic3DScene({ style = {} }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 44 }} dpr={[1, 1.5]} style={{ width: '100%', height: '100%', ...style }}>
      <ambientLight intensity={0.22} />
      <pointLight position={[4, 4, 4]} intensity={9} color="${primary}" />
      <pointLight position={[-4, -3, -4]} intensity={4.5} color="${accent}" />
      <pointLight position={[0, 6, -3]} intensity={2.5} color="#ffffff" />
      <Stars radius={90} depth={70} count={3500} factor={3} fade speed={0.7} />
      <SceneContent />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  )
}`
}

// ─── Hero builders per archetype ───────────────────────────────────────────────

function getMasterHeroData(blueprint) {
  const ds = blueprint?.palette ?? blueprint?.design_system?.color_palette ?? blueprint?.designSystem ?? {}
  const bg = ds.background ?? ds.backgroundColor ?? '#0a0a0f'
  const primary = ds.primary ?? ds.primaryColor ?? '#6366f1'
  const accent = ds.accent ?? ds.accentColor ?? '#a78bfa'
  const surface = ds.surface ?? ds.surfaceColor ?? '#14141a'
  const text = ds.text ?? ds.textColor ?? '#ffffff'

  const prompt = blueprint?.meta?.prompt || blueprint?.creative_concept?.business_type || ''
  const bt = blueprint?.creative_concept?.business_type ?? blueprint?.concept?.businessType ?? inferBusinessType(prompt)
  const name = blueprint?.creative_concept?.website_name ?? blueprint?.concept?.websiteName ?? '3D Platform'
  const defaults = getIndustryHeroData(bt, name)

  const hero = blueprint?.hero ?? blueprint?.websiteBlueprint?.hero ?? {}
  const badge = hero.badge || blueprint?.creative_concept?.business_type || defaults.badge
  const rawHeadline = hero.heading || hero.headline || defaults.heading || ''
  const headline = rawHeadline.replace(/\\n/g, '\n')
  const subheadline = hero.subheading || hero.subheadline || defaults.subheading
  const description = hero.description || defaults.description
  const primary_cta = hero.cta || hero.cta_primary || hero.primary_cta || defaults.cta
  const secondary_cta = hero.cta_secondary || hero.secondary_cta || defaults.cta_secondary

  return { bg, primary, accent, surface, text, badge, headline, subheadline, description, primary_cta, secondary_cta }
}

function heroA(blueprint) {
  // Layout-A: Fullscreen 3D, floating glass panel overlay
  const { bg, primary, text, badge, headline, subheadline, description, primary_cta, secondary_cta } = getMasterHeroData(blueprint)

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ position: 'relative', width: '100vw', height: '100vh', background: '${bg}', overflow: 'hidden' }}>
      {/* Full-viewport 3D canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Cinematic3DScene />
      </div>

      {/* Glassmorphism overlay panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', bottom: '12%', left: '8%',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2.5rem 3rem',
          maxWidth: '560px',
          zIndex: 10,
        }}
      >
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ color: '${primary}', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}
        >
          ${badge}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '${text}', lineHeight: 1.1, marginBottom: '1.2rem', whiteSpace: 'pre-line' }}
        >
          ${headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.8rem' }}
        >
          ${subheadline}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}
        >
          ${description}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: '${primary}', color: '#fff', border: 'none', borderRadius: '50px', padding: '0.85rem 2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            ${primary_cta}
          </button>
          <button style={{ background: 'transparent', color: '${text}', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50px', padding: '0.85rem 2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
            ${secondary_cta}
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}`
}

function heroB(blueprint) {
  // Layout-B: 50/50 split — left text, right 3D
  const { bg, primary, accent, text, badge, headline, subheadline, description, primary_cta, secondary_cta } = getMasterHeroData(blueprint)

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100vw', height: '100vh', background: '${bg}', overflow: 'hidden' }}>
      {/* Left: Text stack */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 6% 0 8%' }}
      >
        <span style={{ display: 'inline-block', background: '${primary}22', color: '${primary}', borderRadius: '4px', padding: '0.3rem 0.8rem', fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1.5rem', width: 'fit-content' }}>
          ${badge}
        </span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 900, color: '${text}', lineHeight: 1.05, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
          ${headline}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, maxWidth: '460px', marginBottom: '0.8rem' }}>
          ${subheadline}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '460px', marginBottom: '2.5rem' }}>
          ${description}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 24px ${primary}66' }}
            whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, ${primary}, ${accent})', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem 2.2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            ${primary_cta}
          </motion.button>
          <motion.button
            whileHover={{ borderColor: '${primary}', color: '${primary}' }}
            style={{ background: 'transparent', color: '${text}', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.9rem 2.2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
          >
            ${secondary_cta}
          </motion.button>
        </div>
      </motion.div>

      {/* Right: 3D Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.15 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <Cinematic3DScene style={{ position: 'absolute', inset: 0 }} />
        {/* Edge fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, ${bg}, transparent)', zIndex: 2 }} />
      </motion.div>
    </section>
  )
}`
}

function heroC(blueprint) {
  // Layout-C: Editorial magazine — giant typography, no traditional hero
  const { bg, primary, accent, text, badge, headline, subheadline, description, primary_cta, secondary_cta } = getMasterHeroData(blueprint)

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', padding: '6rem 5%', overflow: 'hidden' }}>
      {/* Oversized editorial headline */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ color: '${accent}', fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700, paddingTop: '0.5rem' }}
          >
            ${badge}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
          >
            Vol. 01
          </motion.span>
        </div>

        {/* Rule line */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7 }} style={{ height: '2px', background: '${primary}', transformOrigin: 'left', marginBottom: '1.5rem' }} />

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: 'clamp(3.5rem, 9vw, 9rem)', fontWeight: 900, color: '${primary}', lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: '3rem', whiteSpace: 'pre-line' }}
        >
          ${headline}
        </motion.h1>

        {/* Asymmetric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', alignItems: 'start' }}>
          <div>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              style={{ fontSize: '1.35rem', fontWeight: 600, color: 'rgba(0,0,0,0.85)', lineHeight: 1.5, marginBottom: '1rem', maxWidth: '540px' }}
            >
              ${subheadline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ fontSize: '1.05rem', color: 'rgba(0,0,0,0.65)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '540px' }}
            >
              ${description}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ display: 'flex', gap: '1.2rem' }}>
              <button style={{ background: '${primary}', color: '#fff', border: 'none', padding: '1rem 2.5rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                ${primary_cta}
              </button>
              <button style={{ background: 'transparent', color: '${primary}', border: '2px solid ${primary}', padding: '1rem 2.5rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                ${secondary_cta}
              </button>
            </motion.div>
          </div>

          {/* Small 3D accent */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }} style={{ height: '320px' }}>
            <Cinematic3DScene />
          </motion.div>
        </div>
      </div>
    </section>
  )
}`
}

function heroD(blueprint) {
  // Layout-D: Bento grid of cards
  const { bg, primary, accent, surface, text, badge, headline, subheadline, description, primary_cta, secondary_cta } = getMasterHeroData(blueprint)
  const sections = blueprint?.sections ?? []
  const features = sections.find(s => s.type === 'features' || s.type === 'services')?.content ?? []

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

const cards = ${JSON.stringify(features.slice(0, 4).map((f, i) => ({ title: f?.title ?? f ?? `Feature ${i + 1}`, desc: f?.description ?? '' })))}

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', padding: '5rem 4% 3rem', overflow: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'auto auto',
        gap: '1.2rem',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        {/* Main headline card — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ gridColumn: 'span 2', background: '${surface}', borderRadius: '20px', padding: '3rem', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ color: '${primary}', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>${badge}</p>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '${text}', lineHeight: 1.1, marginBottom: '1.2rem', whiteSpace: 'pre-line' }}>
            ${headline}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, maxWidth: '460px', marginBottom: '0.6rem' }}>
            ${subheadline}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '460px', marginBottom: '2rem', fontSize: '0.9rem' }}>
            ${description}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ background: '${primary}', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 700, cursor: 'pointer' }}>${primary_cta}</button>
            <button style={{ background: 'transparent', color: '${text}', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.8rem 2rem', cursor: 'pointer' }}>${secondary_cta}</button>
          </div>
        </motion.div>

        {/* 3D scene card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.8 }}
          style={{ gridRow: 'span 2', background: '${surface}', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', minHeight: '420px' }}
        >
          <Cinematic3DScene style={{ width: '100%', height: '100%' }} />
        </motion.div>

        {/* Feature cards */}
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
            style={{ background: '${surface}', borderRadius: '16px', padding: '1.8rem', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div style={{ width: '36px', height: '36px', background: '${primary}22', borderRadius: '8px', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '${primary}', fontSize: '1.1rem' }}>◆</span>
            </div>
            <h3 style={{ color: '${text}', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{c.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.6 }}>{c.desc || 'Powerful capability built for scale.'}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}`
}

function heroE(blueprint) {
  // Layout-E: Minimal whitespace — huge centred headline
  const { bg, primary, accent, text, badge, headline, subheadline, description, primary_cta, secondary_cta } = getMasterHeroData(blueprint)

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 5%', overflow: 'hidden' }}>
      <motion.p
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ color: '${accent}', fontSize: '0.78rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2rem' }}
      >
        ${badge}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
        style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', fontWeight: 900, color: '${text}', lineHeight: 0.9, letterSpacing: '-0.04em', maxWidth: '900px', marginBottom: '2.5rem', whiteSpace: 'pre-line' }}
      >
        ${headline}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 0.35 }}
        style={{ fontSize: '1.25rem', fontWeight: 600, color: '${text}', lineHeight: 1.5, maxWidth: '580px', marginBottom: '1rem' }}
      >
        ${subheadline}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.4 }}
        style={{ fontSize: '1.05rem', color: '${text}', lineHeight: 1.7, maxWidth: '580px', marginBottom: '3rem' }}
      >
        ${description}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{ background: '${primary}', color: '${bg}', border: 'none', borderRadius: '50px', padding: '1rem 3rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', letterSpacing: '0.02em' }}
      >
        ${primary_cta}
      </motion.button>

      {/* 3D object floats below */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
        style={{ width: '340px', height: '340px', marginTop: '5rem' }}
      >
        <Cinematic3DScene />
      </motion.div>
    </section>
  )
}`
}

function heroF(blueprint) {
  // Layout-F: Dashboard — left sidebar + right panels
  const { bg, primary, surface, text, badge, headline, subheadline, description } = getMasterHeroData(blueprint)
  const sections = blueprint?.sections ?? []
  const stats = sections.find(s => s.type === 'stats')?.content ?? []

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

const navItems = ['Dashboard', 'Analytics', 'Projects', 'Team', 'Settings']
const statItems = ${JSON.stringify(stats.slice(0, 4).map((s, i) => ({ label: s?.label ?? s ?? `Metric ${i + 1}`, value: s?.value ?? `${(i + 1) * 24}K` })))}

export default function Hero() {
  return (
    <section style={{ display: 'flex', width: '100vw', height: '100vh', background: '${bg}', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.nav
        initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{ width: '220px', flexShrink: 0, background: '${surface}', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
      >
        <div style={{ padding: '0 0.8rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
          <span style={{ color: '${text}', fontWeight: 800, fontSize: '1.1rem' }}>${blueprint?.creative_concept?.website_name ?? 'Platform'}</span>
        </div>
        {navItems.map((item, i) => (
          <button key={i} style={{ background: i === 0 ? '${primary}22' : 'transparent', color: i === 0 ? '${primary}' : 'rgba(255,255,255,0.45)', border: 'none', borderRadius: '8px', padding: '0.7rem 0.9rem', textAlign: 'left', cursor: 'pointer', fontWeight: i === 0 ? 700 : 400, fontSize: '0.88rem', width: '100%' }}>{item}</button>
        ))}
      </motion.nav>

      {/* Main area */}
      <div style={{ flex: 1, padding: '2rem', overflow: 'auto', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span style={{ display: 'inline-block', color: '${primary}', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>${badge}</span>
          <h1 style={{ color: '${text}', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem', whiteSpace: 'pre-line' }}>${headline}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>${subheadline}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>${description}</p>
        </motion.div>

        {/* Panels grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '1.2rem' }}>
          {/* 3D viz panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            style={{ gridColumn: 'span 2', gridRow: 'span 2', background: '${surface}', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', minHeight: '260px' }}
          >
            <Cinematic3DScene style={{ width: '100%', height: '100%' }} />
          </motion.div>

          {/* Stat panels */}
          {statItems.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              style={{ background: '${surface}', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '1.4rem' }}
            >
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
              <p style={{ color: '${text}', fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
}

function heroH(blueprint) {
  // Layout-H: Scroll-snap storytelling
  const { bg, primary, text, badge, headline, subheadline, description } = getMasterHeroData(blueprint)
  const ds = blueprint?.design_system?.color_palette ?? blueprint?.palette ?? {}
  const sections = blueprint?.sections ?? blueprint?.pages?.find(p => p.name === 'Home')?.sections ?? []

  const snapSections = [
    { bg: bg, badge: badge, headline: headline, sub: `${subheadline}\n\n${description}`, color: text },
    { bg: primary + 'cc', badge: 'Section 01', headline: sections[1]?.title ?? sections[1]?.content?.headline ?? 'The Problem', sub: sections[1]?.subtitle ?? sections[1]?.content?.subheadline ?? 'Old ways hold you back.', color: '#fff' },
    { bg: ds.secondary ?? '#7c3aed', badge: 'Section 02', headline: sections[2]?.title ?? sections[2]?.content?.headline ?? 'Our Solution', sub: sections[2]?.subtitle ?? sections[2]?.content?.subheadline ?? 'Rebuilt from the ground up.', color: '#fff' },
    { bg: ds.accent ?? '#f59e0b', badge: 'Section 03', headline: sections[3]?.title ?? sections[3]?.content?.headline ?? 'The Outcome', sub: sections[3]?.subtitle ?? sections[3]?.content?.subheadline ?? 'Results that speak for themselves.', color: '#000' },
  ]

  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

const snapSections = ${JSON.stringify(snapSections)}

export default function Hero() {
  return (
    <div style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
      {snapSections.map((s, i) => (
        <motion.section
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ height: '100vh', scrollSnapAlign: 'start', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }}
        >
          {i === 0 && (
            <div style={{ position: 'absolute', right: '5%', top: '10%', width: '40%', height: '80%', opacity: 0.5 }}>
              <Cinematic3DScene />
            </div>
          )}
          {s.badge && (
            <span style={{ color: s.color, opacity: 0.7, fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.2rem', fontWeight: 700 }}>
              {s.badge}
            </span>
          )}
          <motion.h2
            initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.7 }}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', fontWeight: 900, color: s.color, lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '1.5rem', position: 'relative', zIndex: 1, whiteSpace: 'pre-line' }}
          >
            {s.headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 0.8 }} transition={{ delay: 0.3 }}
            style={{ color: s.color, fontSize: '1.1rem', maxWidth: '560px', lineHeight: 1.7, position: 'relative', zIndex: 1, whiteSpace: 'pre-line' }}
          >
            {s.sub}
          </motion.p>
          {i === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
              <span style={{ color: s.color, opacity: 0.5, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
              <div style={{ width: '1px', height: '40px', background: s.color, opacity: 0.4 }} />
            </motion.div>
          )}
        </motion.section>
      ))}
    </div>
  )
}`
}

function heroG(blueprint) {
  // Layout-G: Fullscreen Immersive Hero
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
        <Cinematic3DScene />
      </div>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', width: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '3rem', border: '1px solid rgba(255,255,255,0.12)', color: '${text}' }}>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '${primary}', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, display: 'block', marginBottom: '1rem' }}>
          ${badge}
        </motion.span>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontSize: 'clamp(2.5rem, 5vw, 4.8rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
          ${headline}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.9 }}>
          ${subheadline}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '0.95rem', marginBottom: '2rem', opacity: 0.6, maxWidth: '600px' }}>
          ${description}
        </motion.p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{ background: '${primary}', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>${cta1}</button>
          <button style={{ background: 'transparent', color: '${text}', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>${cta2}</button>
        </div>
      </div>
    </section>
  )
}`
}

function heroI(blueprint) {
  // Layout-I: Glass Hero (Ethereal Glassmorphic)
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: '${primary}', filter: 'blur(140px)', opacity: 0.3, pointerEvents: 'none' }} />
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(25px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.15)', padding: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', color: '${text}', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>${badge}</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)', fontWeight: 900, color: '${text}', lineHeight: 1.1, marginBottom: '1.5rem' }}>${headline}</h1>
          <p style={{ fontSize: '1.2rem', color: '${text}', opacity: 0.9, marginBottom: '1rem', fontWeight: 500 }}>${subheadline}</p>
          <p style={{ fontSize: '0.95rem', color: '${text}', opacity: 0.65, marginBottom: '2.5rem', lineHeight: 1.6 }}>${description}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ background: '${primary}', color: '#fff', padding: '1rem 2.2rem', borderRadius: '16px', fontWeight: 700, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', cursor: 'pointer' }}>${cta1}</button>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: '${text}', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, cursor: 'pointer' }}>${cta2}</button>
          </div>
        </div>
        <div style={{ height: '480px', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Cinematic3DScene />
        </div>
      </motion.div>
    </section>
  )
}`
}

function heroJ(blueprint) {
  // Layout-J: 3D Right (Prominent 3D Simulation Frame)
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', padding: '5rem 5%', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ color: '${primary}', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '${primary}', display: 'inline-block' }} />
            ${badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: 'clamp(2.8rem, 5vw, 5.2rem)', fontWeight: 900, color: '${text}', lineHeight: 1.08, marginBottom: '1.5rem' }}>
            ${headline}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '1.25rem', color: '${text}', opacity: 0.9, marginBottom: '1rem', fontWeight: 600 }}>
            ${subheadline}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontSize: '1rem', color: '${text}', opacity: 0.6, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '540px' }}>
            ${description}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            <button style={{ background: '${primary}', color: '#fff', padding: '1.1rem 2.4rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px -5px ${primary}88' }}>${cta1}</button>
            <button style={{ background: 'transparent', color: '${text}', padding: '1.1rem 2.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>${cta2}</button>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ height: '640px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(10,12,20,0.8)', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 70px rgba(0,0,0,0.7)' }}>
          <Cinematic3DScene />
        </motion.div>
      </div>
    </section>
  )
}`
}

function heroK(blueprint) {
  // Layout-K: Asymmetric Architectural Framework
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 2fr', minHeight: '100vh', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '4rem 3rem', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
          <div>
            <span style={{ fontFamily: 'monospace', color: '${primary}', fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', marginBottom: '2rem', fontWeight: 700 }}>01 // SPECIFICATION</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '${text}', textTransform: 'uppercase', marginBottom: '1.5rem', borderLeft: '3px solid ${primary}', paddingLeft: '1rem' }}>${badge}</div>
            <p style={{ fontSize: '0.95rem', color: '${text}', opacity: 0.6, lineHeight: 1.7 }}>${description}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button style={{ background: '${primary}', color: '#fff', padding: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>${cta1}</button>
            <button style={{ background: 'transparent', color: '${text}', padding: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>${cta2}</button>
          </div>
        </div>
        <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(3rem, 6vw, 6.2rem)', fontWeight: 900, color: '${text}', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>${headline}</motion.h1>
            <p style={{ fontSize: '1.4rem', color: '${text}', opacity: 0.85, fontWeight: 300, maxWidth: '700px' }}>${subheadline}</p>
          </div>
          <div style={{ height: '440px', borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.15)', marginTop: '3rem', background: 'rgba(0,0,0,0.5)' }}>
            <Cinematic3DScene />
          </div>
        </div>
      </div>
    </section>
  )
}`
}

function heroL(blueprint) {
  // Layout-L: Editorial Magazine Masthead
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', padding: '6rem 5% 4rem' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', borderBottom: '2px solid ${primary}', paddingBottom: '2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '${text}', textTransform: 'uppercase', letterSpacing: '0.3em' }}>${badge}</span>
        <span style={{ fontFamily: 'monospace', color: '${text}', opacity: 0.5, fontSize: '0.8rem' }}>EDITORIAL ISSUE // VOL. 01</span>
      </div>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'start' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(3.2rem, 6.5vw, 6.8rem)', fontWeight: 900, color: '${text}', lineHeight: 0.96, letterSpacing: '-0.04em', marginBottom: '2rem' }}>${headline}</motion.h1>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: '${primary}', marginBottom: '1.5rem', lineHeight: 1.3 }}>${subheadline}</p>
          <p style={{ fontSize: '1rem', color: '${text}', opacity: 0.7, lineHeight: 1.8, marginBottom: '2.5rem' }}>${description}</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button style={{ background: '${text}', color: '${bg}', padding: '1.1rem 2.5rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>${cta1}</button>
            <button style={{ background: 'transparent', color: '${text}', padding: '1.1rem 2rem', borderRadius: '4px', border: '1px solid ${text}66', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>${cta2}</button>
          </div>
        </div>
        <div style={{ height: '620px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.15)', background: '#000', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
          <Cinematic3DScene />
        </div>
      </div>
    </section>
  )
}`
}

function heroM(blueprint) {
  // Layout-M: High-Converting Product Landing Hero with Mockup
  const { bg, primary, text, badge, headline, subheadline, description, cta1, cta2 } = getMasterHeroData(blueprint)
  return `import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section style={{ background: '${bg}', minHeight: '100vh', position: 'relative', overflow: 'hidden', padding: '7rem 5% 5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.2rem', borderRadius: '50px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '2.5rem' }}>
        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '50px', background: '${primary}', color: '#fff', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>New</span>
        <span style={{ color: '${text}', fontSize: '0.85rem', fontWeight: 600 }}>${badge}</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontSize: 'clamp(3rem, 6.2vw, 6.5rem)', fontWeight: 900, color: '${text}', lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '1000px', margin: '0 auto 1.5rem' }}>
        ${headline}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '1.4rem', color: '${text}', opacity: 0.9, maxWidth: '760px', margin: '0 auto 1rem', fontWeight: 500 }}>
        ${subheadline}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ fontSize: '1rem', color: '${text}', opacity: 0.6, maxWidth: '640px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
        ${description}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
        <button style={{ background: '${primary}', color: '#fff', padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', border: 'none', boxShadow: '0 15px 35px -5px ${primary}88', cursor: 'pointer' }}>${cta1}</button>
        <button style={{ background: 'rgba(255,255,255,0.08)', color: '${text}', padding: '1.2rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>${cta2}</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }} style={{ maxWidth: '1200px', width: '100%', height: '600px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(12,15,25,0.9)', boxShadow: '0 30px 90px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '44px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>https://platform.app/interactive-3d-viewport</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '${primary}' }}>v3.0 LIVE</span>
        </div>
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
          <Cinematic3DScene />
        </div>
      </motion.div>
    </section>
  )
}`
}

function heroGeneric(blueprint) {
  // Generic fallback — clean centred dark hero
  return heroA(blueprint)
}

// ─── Section builder ───────────────────────────────────────────────────────────

function buildSampleSection(blueprint) {
  const ds = blueprint?.palette ?? blueprint?.design_system?.color_palette ?? blueprint?.designSystem ?? {}
  const bg = ds.background ?? ds.backgroundColor ?? '#0a0a0f'
  const primary = ds.primary ?? ds.primaryColor ?? '#6366f1'
  const accent = ds.accent ?? ds.accentColor ?? '#a78bfa'
  const surface = ds.surface ?? ds.surfaceColor ?? '#14141a'
  const text = ds.text ?? ds.textColor ?? '#ffffff'

  const sections = blueprint?.sections ?? []
  const featSection = sections.find(s => ['features', 'services', 'about', 'benefits'].includes(s.type)) ?? sections[1] ?? {}
  const items = Array.isArray(featSection.content) ? featSection.content : []

  const cardItems = items.slice(0, 6).map((item, i) => {
    if (typeof item === 'string') return { title: item, description: '', icon: '◆' }
    return { title: item.title ?? item.name ?? `Item ${i + 1}`, description: item.description ?? item.desc ?? '', icon: item.icon ?? '◆' }
  })

  if (cardItems.length < 3) {
    while (cardItems.length < 6) cardItems.push({ title: `Feature ${cardItems.length + 1}`, description: 'Powerful capability built for scale and performance.', icon: '◆' })
  }

  return `import { motion } from 'framer-motion'

const items = ${JSON.stringify(cardItems)}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const card = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } }

export default function FeaturesSection() {
  return (
    <section style={{ background: '${bg}', padding: '7rem 5%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <p style={{ color: '${primary}', fontSize: '0.8rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1rem' }}>
            ${featSection.type ?? 'Features'}
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '${text}', lineHeight: 1.1, maxWidth: '600px', margin: '0 auto 1.2rem' }}>
            ${featSection.title ?? 'Built for What Matters'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            ${featSection.subtitle ?? 'Everything you need, nothing you don\'t.'}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={card}
              whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              style={{
                background: '${surface}',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ width: '44px', height: '44px', background: i % 2 === 0 ? '${primary}22' : '${accent}22', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', fontSize: '1.3rem', color: i % 2 === 0 ? '${primary}' : '${accent}' }}>
                {item.icon}
              </div>
              <h3 style={{ color: '${text}', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.65 }}>{item.description || 'Built for performance and scale.'}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}`
}

// ─── Main dispatcher ───────────────────────────────────────────────────────────

const HERO_BUILDERS = {
  'Layout-A': heroA, 'centered': heroA,
  'Layout-B': heroB, 'split': heroB,
  'Layout-C': heroC, 'image-left': heroC,
  'Layout-D': heroD, 'image-right': heroD,
  'Layout-E': heroE, '3d-left': heroE,
  'Layout-F': heroF, 'minimal': heroF,
  'Layout-G': heroG, 'fullscreen': heroG,
  'Layout-H': heroH, 'card': heroH,
  'Layout-I': heroI, 'glass': heroI,
  'Layout-J': heroJ, '3d-right': heroJ,
  'Layout-K': heroK, 'asymmetric': heroK,
  'Layout-L': heroL, 'magazine': heroL,
  'Layout-M': heroM, 'landing': heroM,
}

/**
 * Generate local hero, scene, and sample section code from a blueprint.
 *
 * @param {object} blueprint  — website blueprint JSON from /api/generate-website-blueprint
 * @returns {{ heroJSX: string, sceneJSX: string, sampleSection: string }}
 */
export function generateFromBlueprint(blueprint) {
  let archetype = blueprint?.creative_concept?.layout_archetype ?? blueprint?.hero?.layout ?? 'Layout-A'
  if (typeof archetype !== 'string') archetype = 'Layout-A'
  archetype = archetype.trim()

  const archetypeKey = Object.keys(HERO_BUILDERS).find(k => archetype.toLowerCase().startsWith(k.toLowerCase())) ?? 'Layout-A'
  const heroBuilder = HERO_BUILDERS[archetypeKey] ?? heroA

  return {
    heroJSX: heroBuilder(blueprint),
    sceneJSX: buildSceneJSX(blueprint),
    sampleSection: buildSampleSection(blueprint),
  }
}

/**
 * Detect layout archetype from a prompt seed (used when no blueprint is available).
 * Returns one of Layout-A through Layout-M deterministically.
 */
export function pickArchetypeFromSeed(seed) {
  const archetypes = ['Layout-A', 'Layout-B', 'Layout-C', 'Layout-D', 'Layout-E', 'Layout-F', 'Layout-G', 'Layout-H', 'Layout-I', 'Layout-J', 'Layout-K', 'Layout-L', 'Layout-M']
  return archetypes[seed % archetypes.length]
}
