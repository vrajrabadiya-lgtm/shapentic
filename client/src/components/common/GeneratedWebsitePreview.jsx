import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, OrbitControls, Stars } from "@react-three/drei";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Code2,
  Palette,
  Layers,
  Zap,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Play,
  ArrowRight,
  Box,
  Shield,
  Activity,
  X,
  RefreshCw,
  Eye,
  Sliders,
  Cpu,
  Globe,
  Lock,
  RotateCcw,
  Download,
  Send,
  Star,
  CheckCircle2,
  User,
  Mail,
  SlidersHorizontal,
} from "lucide-react";

// ─── 3D MESH COMPONENT FOR LIVE WEBSITE PREVIEW ─────────────────────────────
function DynamicWebsite3DMesh({ primaryColor, secondaryColor, accentColor, shapeType, materialType, rotateSpeed }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * rotateSpeed;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.3;
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.z = Math.cos(t * 0.3) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.3;
      ringRef.current.rotation.x = Math.cos(t * 0.2) * 0.3;
    }
  });

  const getMaterialProps = () => {
    switch (materialType) {
      case "glass":
        return {
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.9,
          clearcoat: 1.0,
          thickness: 1.5,
          wireframe: false,
        };
      case "wireframe":
        return {
          roughness: 0.4,
          metalness: 0.5,
          transmission: 0,
          wireframe: true,
        };
      case "hologram":
        return {
          roughness: 0.1,
          metalness: 0.9,
          clearcoat: 1.0,
          emissive: secondaryColor,
          emissiveIntensity: 0.4,
          wireframe: false,
        };
      case "metal":
      default:
        return {
          roughness: 0.15,
          metalness: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          wireframe: false,
        };
    }
  };

  const matProps = getMaterialProps();

  const renderGeometry = () => {
    switch (shapeType) {
      case "Sphere":
        return <sphereGeometry args={[1.2, 64, 64]} />;
      case "Box":
        return <boxGeometry args={[1.6, 1.6, 1.6]} />;
      case "Crystal":
        return <octahedronGeometry args={[1.4, 0]} />;
      case "Icosahedron":
        return <icosahedronGeometry args={[1.4, 1]} />;
      case "TorusKnot":
      default:
        return <torusKnotGeometry args={[1.1, 0.35, 128, 32, 2, 3]} />;
    }
  };

  return (
    <group>
      <mesh ref={meshRef}>
        {renderGeometry()}
        <meshPhysicalMaterial
          color={primaryColor || "#3d5eff"}
          emissive={secondaryColor || "#00d4ff"}
          emissiveIntensity={0.2}
          {...matProps}
        />
      </mesh>

      {/* Orbital Accent Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.1, 0.035, 16, 100]} />
        <meshStandardMaterial
          color={accentColor || "#bf5fff"}
          emissive={accentColor || "#bf5fff"}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

// Particle background system
function ParticleField() {
  const pointsRef = useRef();
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });
  return (
    <group ref={pointsRef}>
      <Stars radius={50} depth={40} count={1500} factor={4} fade speed={1} />
    </group>
  );
}

export default function GeneratedWebsitePreview({ aiResult, onClose }) {
  // Extract initial design tokens from AI result
  const designSys = aiResult?.designSystem || {};
  const [primary, setPrimary] = useState(designSys.primary || "#3d5eff");
  const [secondary, setSecondary] = useState(designSys.secondary || "#00d4ff");
  const [accent, setAccent] = useState(designSys.accent || "#bf5fff");
  const [bg, setBg] = useState(designSys.background || "#0a0a14");

  // 3D Model interactive controls state
  const [activeShape, setActiveShape] = useState("TorusKnot");
  const [activeMaterial, setActiveMaterial] = useState("metal");
  const [rotateSpeed, setRotateSpeed] = useState(1.0);

  // Layout & Viewport state
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "code" | "design"
  const [codeTab, setCodeTab] = useState("hero"); // "hero" | "scene" | "section" | "app"
  const [viewportMode, setViewportMode] = useState("desktop"); // "desktop" | "tablet" | "mobile"
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [urlPath, setUrlPath] = useState("https://nexus3d-generated-site.app");

  // Live website interactive state
  const [featureCategory, setFeatureCategory] = useState("all");
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Extract text content from blueprint or AI result
  const siteName =
    aiResult?.blueprint?.websiteBlueprint?.website_name ||
    aiResult?.result?.phases?.planner?.projectType ||
    "Nexus 3D Studio";

  const headline =
    aiResult?.blueprint?.websiteBlueprint?.hero?.headline ||
    `Build the Future with ${siteName}`;

  const subheadline =
    aiResult?.blueprint?.websiteBlueprint?.hero?.subheadline ||
    "A next-generation 3D web experience built with real-time WebGL shaders, responsive glassmorphic UI, and agentic React component architecture.";

  const heroCode = aiResult?.components?.heroJSX || `// Hero Component for ${siteName}\nexport default function Hero() {\n  return <div>Hero Section</div>;\n}`;
  const sceneCode = aiResult?.components?.sceneJSX || `// 3D Scene Component\nexport default function Cinematic3DScene() {\n  return <Canvas>...</Canvas>;\n}`;
  const sectionCode = aiResult?.components?.sampleSection || `// Features Section\nexport default function Features() {\n  return <div>Features Section</div>;\n}`;
  const installCmd = aiResult?.components?.installCmd || "npm install framer-motion @react-three/fiber @react-three/drei three react-router-dom";

  const appCode = `import React from "react";
import Hero from "./components/Hero";
import Cinematic3DScene from "./components/Cinematic3DScene";
import FeaturesSection from "./components/FeaturesSection";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      <Hero />
      <Cinematic3DScene />
      <FeaturesSection />
    </div>
  );
}`;

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInstallCmd = () => {
    navigator.clipboard.writeText(installCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.email) return;
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
    setTimeout(() => setNewsletterSubmitted(false), 4000);
    setNewsletterEmail("");
  };

  const getViewportContainerStyle = () => {
    switch (viewportMode) {
      case "mobile":
        return "max-w-[390px] mx-auto my-3 rounded-[36px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden flex-1";
      case "tablet":
        return "max-w-[768px] mx-auto my-3 rounded-2xl border-4 border-zinc-800 shadow-2xl overflow-hidden flex-1";
      case "desktop":
      default:
        return "w-full flex-1 rounded-xl border border-white/10 shadow-2xl overflow-hidden";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden text-white font-sans"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* ── TOP PREVIEW HEADER & TOOLBAR ─────────────────────────────────────── */}
      <header className="h-14 px-5 border-b border-white/10 bg-zinc-900/95 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-30">
        
        {/* Left: Brand / AI status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Preview
          </div>
          <span className="text-xs font-bold text-zinc-300 hidden sm:inline-block">
            {siteName}
          </span>
        </div>

        {/* Center: Main View Switcher */}
        <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Interactive Website</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Source Code</span>
          </button>

          <button
            onClick={() => setActiveTab("design")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "design"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Design System</span>
          </button>
        </div>

        {/* Right: Viewport mode & Close */}
        <div className="flex items-center gap-3">
          {activeTab === "preview" && (
            <div className="hidden md:flex items-center gap-1 bg-zinc-800/60 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setViewportMode("desktop")}
                title="Desktop View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewportMode === "desktop" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewportMode("tablet")}
                title="Tablet View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewportMode === "tablet" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewportMode("mobile")}
                title="Mobile View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewportMode === "mobile" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 bg-zinc-950 overflow-hidden relative flex flex-col p-2 md:p-4">

        {/* 1. LIVE INTERACTIVE WEBSITE TAB */}
        {activeTab === "preview" && (
          <div className="flex-1 overflow-hidden w-full h-full relative flex flex-col">
            <div className={`transition-all duration-300 flex flex-col ${getViewportContainerStyle()}`}>
              
              {/* REALISTIC BROWSER FRAME TOP BAR */}
              <div className="bg-zinc-900 border-b border-white/10 px-4 py-2 flex items-center justify-between gap-3 text-xs text-zinc-400 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <div className="flex items-center gap-1 ml-2 text-zinc-500">
                    <RotateCcw
                      className="h-3.5 w-3.5 hover:text-zinc-300 cursor-pointer"
                      onClick={() => setUrlPath("https://nexus3d-generated-site.app")}
                    />
                  </div>
                </div>

                {/* Address Bar */}
                <div className="flex-1 max-w-xl mx-auto flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-300">
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{urlPath}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    SSL Secured
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open("#", "_blank")}
                    title="Open in new window"
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* THE REAL GENERATED WEBSITE BODY */}
              <div
                className="flex-1 w-full relative flex flex-col overflow-y-auto overflow-x-hidden font-sans"
                style={{ backgroundColor: bg, color: "#f0f0ff" }}
              >
                {/* Ambient Glow Atmosphere */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    background: `radial-gradient(ellipse at 50% 15%, ${primary}aa 0%, transparent 65%)`,
                  }}
                />

                {/* ── WEBSITE NAVBAR ── */}
                <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10 relative z-20 backdrop-blur-xl bg-black/30 sticky top-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-black text-base tracking-tight text-white block leading-none">
                        {siteName}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono tracking-wider">3D ENGINE v2.0</span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
                    {["hero", "features", "pricing", "contact"].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => document.getElementById(sec)?.scrollIntoView({ behavior: "smooth" })}
                        className="capitalize hover:text-white transition-colors cursor-pointer"
                      >
                        {sec === "hero" ? "Home" : sec.charAt(0).toUpperCase() + sec.slice(1)}
                      </button>
                    ))}
                    <button
                      onClick={() => document.getElementById("viewport-3d")?.scrollIntoView({ behavior: "smooth" })}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      3D Scene
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform hover:scale-105 cursor-pointer shadow-lg"
                      style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                    >
                      Get Started
                    </button>
                  </div>
                </nav>

                {/* ── HERO SECTION WITH 3D CANVAS ── */}
                <section id="hero" className="relative min-h-[640px] w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-12 gap-10 z-10">
                  
                  {/* Left Column: Content */}
                  <div className="flex-1 max-w-2xl space-y-6 text-left">
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md"
                      style={{
                        backgroundColor: `${primary}15`,
                        borderColor: `${primary}40`,
                        color: secondary,
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Agentic Generated 3D Application</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                      {headline}
                    </h1>

                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                      {subheadline}
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => {
                          const target = document.getElementById("viewport-3d");
                          if (target) target.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-6 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-transform hover:scale-105 shadow-xl cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                      >
                        <Play className="h-4 w-4 fill-white" />
                        <span>Explore 3D Scene</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("code")}
                        className="px-6 py-3 rounded-xl text-xs font-bold text-zinc-300 border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Code2 className="h-4 w-4" />
                        <span>View Source Code</span>
                      </button>
                    </div>

                    {/* Live Tech Metrics */}
                    <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-zinc-400 text-[10px]">Render Speed</div>
                        <div className="font-bold text-emerald-400 text-sm">60 FPS</div>
                      </div>
                      <div>
                        <div className="text-zinc-400 text-[10px]">Framework</div>
                        <div className="font-bold text-blue-400 text-sm">React 19</div>
                      </div>
                      <div>
                        <div className="text-zinc-400 text-[10px]">Shader Engine</div>
                        <div className="font-bold text-purple-400 text-sm">Three.js</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive 3D Canvas Box */}
                  <div id="viewport-3d" className="w-full lg:w-[480px] h-[380px] lg:h-[450px] relative rounded-3xl overflow-hidden border border-white/15 bg-zinc-900/50 backdrop-blur-md shadow-2xl group flex flex-col">
                    
                    {/* Top overlay controls inside 3D viewport */}
                    <div className="p-3 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>3D WebGL Canvas</span>
                      </div>

                      {/* Shape selector inside viewport */}
                      <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded-lg border border-white/10 text-[10px]">
                        {["TorusKnot", "Sphere", "Crystal", "Box"].map((shp) => (
                          <button
                            key={shp}
                            onClick={() => setActiveShape(shp)}
                            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                              activeShape === shp ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {shp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* The 3D Canvas */}
                    <div className="flex-1 relative">
                      <Canvas camera={{ position: [0, 0, 4.3], fov: 45 }}>
                        <ambientLight intensity={0.4} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} color={primary} />
                        <pointLight position={[-10, -10, -10]} intensity={0.8} color={secondary} />
                        <directionalLight position={[5, 5, 5]} intensity={1.2} color={accent} />
                        
                        <ParticleField />

                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
                          <Center>
                            <DynamicWebsite3DMesh
                              primaryColor={primary}
                              secondaryColor={secondary}
                              accentColor={accent}
                              shapeType={activeShape}
                              materialType={activeMaterial}
                              rotateSpeed={rotateSpeed}
                            />
                          </Center>
                        </Float>

                        <OrbitControls enableZoom={true} enablePan={false} minDistance={2.5} maxDistance={6} />
                      </Canvas>
                    </div>

                    {/* Bottom toolbar inside 3D viewport */}
                    <div className="p-2.5 border-t border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between text-[10px] z-10 shrink-0">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span>Finish:</span>
                        {["metal", "glass", "wireframe", "hologram"].map((mat) => (
                          <button
                            key={mat}
                            onClick={() => setActiveMaterial(mat)}
                            className={`capitalize px-1.5 py-0.5 rounded transition-colors ${
                              activeMaterial === mat ? "bg-zinc-700 text-white font-bold" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {mat}
                          </button>
                        ))}
                      </div>

                      <div className="text-zinc-400 font-mono">360° Drag Enabled</div>
                    </div>

                  </div>

                </section>

                {/* ── FEATURES SECTION WITH CATEGORY FILTER ── */}
                <section id="features" className="w-full px-6 lg:px-16 py-20 border-t border-white/10 bg-black/40 z-10">
                  <div className="max-w-6xl mx-auto space-y-12">
                    
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl font-extrabold text-white">
                        Cutting-Edge Feature Suite
                      </h2>
                      <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                        Explore component features generated specifically for this application context.
                      </p>

                      {/* Feature Filter Tabs */}
                      <div className="flex justify-center items-center gap-2 pt-2">
                        {[
                          { id: "all", label: "All Features" },
                          { id: "3d", label: "3D Engine" },
                          { id: "ui", label: "UI Design" },
                          { id: "code", label: "Architecture" },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setFeatureCategory(cat.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              featureCategory === cat.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          category: "3d",
                          title: "Real-Time 3D Shaders",
                          desc: "React Three Fiber integration rendering custom physical materials, lighting depth, and camera rotations.",
                          icon: Box,
                          color: primary,
                        },
                        {
                          category: "ui",
                          title: "Responsive Theme Engine",
                          desc: "Tailwind CSS palette tokens engineered for dark mode, glassmorphic overlays, and fluid layouts.",
                          icon: Palette,
                          color: secondary,
                        },
                        {
                          category: "code",
                          title: "Agentic Code Generator",
                          desc: "Clean modular JSX components created automatically by AI architect pipelines.",
                          icon: Code2,
                          color: accent,
                        },
                        {
                          category: "3d",
                          title: "Orbit Camera Rig",
                          desc: "Free 360° orbital controls enabling users to inspect models from any angle smoothly.",
                          icon: Eye,
                          color: primary,
                        },
                        {
                          category: "code",
                          title: "Zero-Latency Compiler",
                          desc: "Fast build execution supporting instant hot reloads and zero runtime bloat.",
                          icon: Cpu,
                          color: secondary,
                        },
                        {
                          category: "ui",
                          title: "Production Accessibility",
                          desc: "Semantic HTML5 structure, ARIA accessibility attributes, and high contrast typography.",
                          icon: Shield,
                          color: accent,
                        },
                      ]
                        .filter((f) => featureCategory === "all" || f.category === featureCategory)
                        .map((feat, idx) => {
                          const IconComp = feat.icon;
                          return (
                            <div
                              key={idx}
                              className="p-6 rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all space-y-4 group hover:border-white/20 hover:-translate-y-1"
                            >
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: `${feat.color}25`, border: `1px solid ${feat.color}50` }}
                              >
                                <IconComp className="h-6 w-6" style={{ color: feat.color }} />
                              </div>
                              <h3 className="text-base font-bold text-white">{feat.title}</h3>
                              <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                            </div>
                          );
                        })}
                    </div>

                  </div>
                </section>

                {/* ── INTERACTIVE PRICING SECTION ── */}
                <section id="pricing" className="w-full px-6 lg:px-16 py-20 border-t border-white/10 bg-black/60 z-10">
                  <div className="max-w-5xl mx-auto space-y-12">
                    
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Plans</h2>
                      <p className="text-zinc-400 text-sm max-w-md mx-auto">
                        Choose the right tier to deploy your 3D AI applications.
                      </p>

                      {/* Billing Toggle Switch */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <span className={`text-xs font-semibold ${!isAnnualBilling ? "text-white" : "text-zinc-400"}`}>
                          Monthly
                        </span>
                        <button
                          onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                          className="w-12 h-6 rounded-full bg-zinc-800 border border-white/10 relative p-1 cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-blue-500 transition-transform ${
                              isAnnualBilling ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnualBilling ? "text-white" : "text-zinc-400"}`}>
                          <span>Annual</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            Save 20%
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        {
                          name: "Starter",
                          price: isAnnualBilling ? "$19" : "$24",
                          period: "/month",
                          desc: "Ideal for individual developers building 3D landing pages.",
                          features: ["3 Active 3D Projects", "Standard Shader Library", "Community Support", "WebGL 2.0 Engine"],
                          highlight: false,
                        },
                        {
                          name: "Pro 3D",
                          price: isAnnualBilling ? "$49" : "$59",
                          period: "/month",
                          desc: "For teams creating complex WebGL experiences.",
                          features: ["Unlimited 3D Projects", "Custom AI Code Generator", "Priority Render Server", "Custom Shaders & Materials", "24/7 Priority Support"],
                          highlight: true,
                        },
                        {
                          name: "Enterprise",
                          price: isAnnualBilling ? "$149" : "$179",
                          period: "/month",
                          desc: "Custom architecture & dedicated rendering pipelines.",
                          features: ["Dedicated Shader Cluster", "Custom React 19 Components", "SLA Guarantee", "Private Repository Sync"],
                          highlight: false,
                        },
                      ].map((plan) => (
                        <div
                          key={plan.name}
                          className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all ${
                            plan.highlight
                              ? "bg-zinc-900 border-blue-500 shadow-2xl shadow-blue-500/10 scale-105"
                              : "bg-zinc-900/40 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="space-y-4">
                            {plan.highlight && (
                              <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold uppercase tracking-wider w-max">
                                Most Popular
                              </div>
                            )}
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white">{plan.price}</span>
                              <span className="text-xs text-zinc-400">{plan.period}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">{plan.desc}</p>

                            <div className="space-y-2 pt-2 border-t border-white/10">
                              {plan.features.map((feat) => (
                                <div key={feat} className="flex items-center gap-2 text-xs text-zinc-300">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => setModalOpen(true)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              plan.highlight
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                                : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                            }`}
                          >
                            Choose {plan.name}
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                </section>

                {/* ── WORKING CONTACT & LEAD FORM ── */}
                <section id="contact" className="w-full px-6 lg:px-16 py-20 border-t border-white/10 bg-black/40 z-10">
                  <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    
                    <div className="space-y-4">
                      <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold w-max">
                        Get In Touch
                      </div>
                      <h2 className="text-3xl font-extrabold text-white">Let's Build Something Amazing</h2>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Have questions about generated code, 3D shader integration, or custom website blueprints? Send us a message!
                      </p>
                    </div>

                    {/* Interactive Form */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md relative">
                      {contactSubmitted && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Message Sent Successfully! We'll reply shortly.</span>
                        </div>
                      )}

                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-400 block mb-1">Message</label>
                          <textarea
                            required
                            rows="3"
                            placeholder="Tell us about your project..."
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Message</span>
                        </button>
                      </form>
                    </div>

                  </div>
                </section>

                {/* ── FOOTER & NEWSLETTER ── */}
                <footer className="w-full px-6 py-12 border-t border-white/10 bg-black/80 z-10 space-y-8">
                  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-blue-400" />
                        <span className="font-bold text-white text-sm">{siteName}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">Generated by Antigravity AI Engine</p>
                    </div>

                    {/* Newsletter Form */}
                    <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-sm w-full">
                      <input
                        type="email"
                        required
                        placeholder="Enter email for updates..."
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {newsletterSubmitted ? "Subscribed!" : "Subscribe"}
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
                    © {new Date().getFullYear()} {siteName}. All rights reserved. Real-time WebGL Prototype.
                  </div>
                </footer>

              </div>
            </div>
          </div>
        )}

        {/* 2. SOURCE CODE TAB */}
        {activeTab === "code" && (
          <div className="flex-1 flex flex-col bg-zinc-900/80 rounded-xl border border-white/10 overflow-hidden">
            
            {/* Header / Component file tabs */}
            <div className="px-4 py-3 bg-zinc-950 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: "hero", label: "Hero.jsx" },
                  { id: "scene", label: "Cinematic3DScene.jsx" },
                  { id: "section", label: "FeaturesSection.jsx" },
                  { id: "app", label: "App.jsx" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCodeTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                      codeTab === tab.id
                        ? "bg-zinc-800 text-blue-400 font-bold border border-blue-500/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  copyCode(
                    codeTab === "hero"
                      ? heroCode
                      : codeTab === "scene"
                      ? sceneCode
                      : codeTab === "section"
                      ? sectionCode
                      : appCode
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md shrink-0"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? "Copied!" : "Copy File Code"}</span>
              </button>
            </div>

            {/* Code Viewport */}
            <div className="flex-1 overflow-auto p-5 font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950/90 select-text">
              <pre className="whitespace-pre-wrap break-words">
                {codeTab === "hero"
                  ? heroCode
                  : codeTab === "scene"
                  ? sceneCode
                  : codeTab === "section"
                  ? sectionCode
                  : appCode}
              </pre>
            </div>

            {/* Install dependencies banner */}
            <div className="p-4 bg-zinc-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-zinc-200 truncate">{installCmd}</span>
              </div>

              <button
                onClick={copyInstallCmd}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer shrink-0"
              >
                {copiedCmd ? "Copied Command!" : "Copy Command"}
              </button>
            </div>
          </div>
        )}

        {/* 3. DESIGN SYSTEM TAB */}
        {activeTab === "design" && (
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-900/50 rounded-xl border border-white/10 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Design System & Token Customizer</h2>
              <p className="text-xs text-zinc-400">
                Change primary colors, background atmosphere, or 3D geometry types. The live website preview updates instantly!
              </p>
            </div>

            {/* Color Pickers */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Primary Brand", state: primary, set: setPrimary, name: "primary" },
                { label: "Secondary Highlight", state: secondary, set: setSecondary, name: "secondary" },
                { label: "Glow & Accent", state: accent, set: setAccent, name: "accent" },
                { label: "Background Depth", state: bg, set: setBg, name: "background" },
              ].map((c) => (
                <div key={c.name} className="p-4 rounded-xl border border-white/10 bg-zinc-950/80 space-y-3">
                  <div className="text-xs font-bold text-zinc-300 capitalize">{c.label}</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={c.state}
                      onChange={(e) => c.set(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={c.state.toUpperCase()}
                      onChange={(e) => c.set(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Geometry & Material Controls */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">3D Mesh Configuration</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 block">Geometry Shape</label>
                  <div className="flex gap-2">
                    {["TorusKnot", "Sphere", "Crystal", "Box"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveShape(s)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          activeShape === s
                            ? "border-blue-500 bg-blue-500/20 text-white"
                            : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 block">Physical Material Finish</label>
                  <div className="flex gap-2">
                    {["metal", "glass", "hologram", "wireframe"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveMaterial(m)}
                        className={`flex-1 py-2 rounded-lg border text-xs capitalize font-medium transition-all cursor-pointer ${
                          activeMaterial === m
                            ? "border-purple-500 bg-purple-500/20 text-white"
                            : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Theme Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Cyber Neon", p: "#3d5eff", s: "#00d4ff", a: "#bf5fff", bg: "#0a0a14" },
                  { name: "Emerald Matrix", p: "#10b981", s: "#34d399", a: "#059669", bg: "#06130d" },
                  { name: "Sunset Gold", p: "#f59e0b", s: "#ec4899", a: "#8b5cf6", bg: "#130906" },
                  { name: "Deep Space", p: "#6366f1", s: "#a855f7", a: "#ec4899", bg: "#030712" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setPrimary(preset.p);
                      setSecondary(preset.s);
                      setAccent(preset.a);
                      setBg(preset.bg);
                    }}
                    className="p-3 rounded-xl border border-white/10 bg-zinc-950 hover:border-white/30 text-left transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-white">{preset.name}</div>
                    <div className="flex gap-1.5">
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.p }} />
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.s }} />
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: preset.a }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── MODAL DIALOG ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-2 text-center">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                <Box className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Get Started with {siteName}</h3>
              <p className="text-xs text-zinc-400">
                Sign up to deploy this generated 3D WebGL website to production.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-xs text-white transition-transform hover:scale-[1.02] shadow-xl cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                Create Account & Deploy
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              >
                Continue Demo Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
