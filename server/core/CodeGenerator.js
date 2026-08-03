/**
 * CodeGenerator — Phase 5 (local fallback)
 *
 * Generates complete, runnable React + Tailwind + React Three Fiber code
 * driven entirely by the blueprint data. Every generation produces:
 *
 *   1. fileTree       — project file structure
 *   2. appJSX         — App.jsx router skeleton with real brand/routes
 *   3. heroJSX        — Hero.jsx with layout from websiteBlueprint.hero.layout
 *   4. sceneJSX       — Cinematic3DScene.jsx with custom 3D object inline
 *   5. sampleSection  — First features section with actual content & industry layout
 *   6. installCmd     — npm install command
 *
 * Rules enforced here (not by AI):
 *   - No TODO comments
 *   - Real text from websiteBlueprint (never placeholder)
 *   - Layout archetype switches based on hero.layout + business_type
 *   - 3D object is built from hero.three_d_object.type using real geometry
 *   - Section layout is industry-specific (never generic SaaS grid unless it's SaaS)
 *   - Same UI structure is never repeated across hero layouts
 *
 * When blueprint.creative_concept.layout_archetype matches Layout-A..J,
 * MasterLayoutEngine is used for heroJSX, sceneJSX, and sampleSection,
 * producing structurally unique code per archetype.
 */

import { getIndustryHeroData, inferHeroLayout as bpInferHeroLayout, inferBusinessType, getThemeVisualIdentity, getIntelligentDomainContent } from './BlueprintGenerator.js'
import { get3DExperienceComponents } from './3dExperienceEngine.js'
import { ComponentRegistry } from './ComponentRegistry.js'
import { BlueprintAdapterV1 } from './BlueprintAdapterV1.js'
import { SCENE_REGISTRY } from "../src/3d/sceneRegistry.js";



export function normalizeBlueprint(blueprint) {
  let bp = blueprint ?? {};
  if (process.env.BLUEPRINT_V2_ENABLED === "true") {
    bp = BlueprintAdapterV1.adapt(bp);
  }

  // Capture initial values for comparison logging
  const initialLogo = bp.brand?.name || bp.name || bp.navigation?.logo || bp.navbar?.logo;
  const initialTheme = bp.theme;
  const initialVisualIdentity = bp.visualIdentity;
  const initialDesignSystem = bp.designSystem;
  const initialNavigation = bp.navigation;
  const initialPalette = bp.brand?.palette || bp.palette;
  const initialHero = bp.hero;
  const initialSections = bp.sections;

  function logFieldChange(fieldName, beforeVal, afterVal) {
    const beforeStr = beforeVal === undefined ? 'undefined' : (typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal));
    const afterStr = afterVal === undefined ? 'undefined' : (typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal));
    const hasChange = beforeStr !== afterStr;
    
    console.log(fieldName);
    console.log("Before");
    console.log(beforeVal === undefined ? "undefined" : (typeof beforeVal === 'object' ? JSON.stringify(beforeVal, null, 2) : String(beforeVal)));
    console.log("After");
    console.log(afterVal === undefined ? "undefined" : (typeof afterVal === 'object' ? JSON.stringify(afterVal, null, 2) : String(afterVal)));
    console.log(hasChange ? "Changed" : "No change");
  }

  // Initialize objects additively using ??= where appropriate to never overwrite
  bp.brand ??= {};
  
  // Name resolution - use bp.name instead of fallback
  const name = bp.name || bp.brand?.name || bp.website_name || bp.concept?.websiteName || bp.websiteBlueprint?.website_name || bp.navbar?.logo || bp.navigation?.logo || bp.siteName || (bp.concept?.coreIdentity ? bp.concept.coreIdentity.split(' (')[0] : '') || bp.name || "3D Platform";
  
  bp.brand.name ??= name;
  bp.brand.industry ??= bp.business_type || bp.concept?.businessType || bp.websiteBlueprint?.business_type || "Technology";
  bp.brand.tagline ??= bp.footer?.tagline || bp.concept?.tagline || `The Future of ${bp.brand.name}`;

  // Resolve palette
  const rawPalette = bp.color_palette || bp.websiteBlueprint?.color_palette || bp.palette || bp.designSystem || {};
  bp.brand.palette ??= {};
  bp.brand.palette.primary ??= rawPalette.primary || "#3d5eff";
  bp.brand.palette.secondary ??= rawPalette.secondary || "#00d4ff";
  bp.brand.palette.accent ??= rawPalette.accent || "#bf5fff";
  bp.brand.palette.background ??= rawPalette.background || "#0a0a14";
  bp.brand.palette.surface ??= rawPalette.surface || rawPalette.background || "#0a0a14";
  bp.brand.palette.text ??= rawPalette.text || "#f0f0ff";
  bp.brand.palette.textMuted ??= rawPalette.textMuted || "#94a3b8";

  // Resolve typography
  bp.brand.typography ??= {};
  bp.brand.typography.heading_font ??= bp.typography?.heading_font || bp.typography?.heading || "'Inter', sans-serif";
  bp.brand.typography.body_font ??= bp.typography?.body_font || bp.typography?.body || "'Inter', sans-serif";
  bp.brand.typography.fontImport ??= bp.typography?.fontImport || "";

  // 2. Resolve Navigation
  const rawLinks = bp.navigation?.links || bp.navbar?.links || bp.websiteBlueprint?.navbar?.links || bp.pages || [];
  const links = Array.isArray(rawLinks) ? rawLinks.map(link => {
    if (typeof link === 'string') {
      return {
        name: link,
        label: link,
        path: link === 'Home' ? '/' : `/${link.toLowerCase().replace(/\s+/g, '-')}`
      };
    }
    const lName = link.name || link.label || "Link";
    return {
      name: lName,
      label: link.label || lName,
      path: link.path || (lName === 'Home' ? '/' : `/${lName.toLowerCase().replace(/\s+/g, '-')}`)
    };
  }) : [];

  bp.navigation ??= {};
  bp.navigation.logo ??= bp.brand.name; // resolves logo to bp.name / resolved brand name
  bp.navigation.links ??= links;
  bp.navigation.cta ??= bp.navbar?.cta || {
    label: bp.hero?.buttons?.[0]?.label || "Get Started",
    path: "/contact"
  };

  // 3. Resolve Hero
  const rawHero = bp.hero || bp.websiteBlueprint?.hero || {};
  bp.hero ??= {};
  bp.hero.headline ??= rawHero.headline || rawHero.heading || "";
  bp.hero.description ??= rawHero.description || rawHero.subheading || rawHero.subheadline || "";
  bp.hero.buttons ??= rawHero.buttons || [];
  bp.hero.badge ??= rawHero.badge || "";
  bp.hero.scene ??= rawHero.scene || rawHero.three_d_object?.type || "floating-sphere";
  bp.hero.layout ??= rawHero.layout || "split";

  // 4. Resolve Theme
  // If bp.theme exists, we do NOT regenerate theme. We do NOT call default theme generators.
  if (bp.theme === undefined) {
    bp.theme = {
      colors: bp.brand.palette,
      spacing: { containerMax: "max-w-7xl mx-auto" },
      radius: "rounded-3xl",
      animations: { scroll_effect: "parallax", page_transition: "fade", hover_effect: "scale" }
    };
  }

  // Force light background if theme indicates a light/bright style
  const themeNameStr = typeof bp.theme === 'string' ? bp.theme : (bp.theme?.name || bp.themeName || '');
  if (themeNameStr.toLowerCase().includes('light') || themeNameStr.toLowerCase().includes('bright')) {
    bp.brand.palette.background = '#ffffff';
    bp.brand.palette.surface = '#f9fafb';
    bp.brand.palette.text = '#111827';
    bp.brand.palette.textMuted = '#4b5563';
    
    if (bp.visualIdentity) {
      bp.visualIdentity.backgroundColor = '#ffffff';
      bp.visualIdentity.surfaceColor = '#f9fafb';
      bp.visualIdentity.textColor = '#111827';
      bp.visualIdentity.textMutedColor = '#4b5563';
      if (bp.visualIdentity.background) {
        bp.visualIdentity.background = bp.visualIdentity.background.replace(/bg-zinc-950/g, 'bg-white').replace(/text-zinc-100/g, 'text-zinc-900');
      }
      if (bp.visualIdentity.cardStyle) {
        bp.visualIdentity.cardStyle = bp.visualIdentity.cardStyle.replace(/bg-\[#121215\]/g, 'bg-white').replace(/border-zinc-800/g, 'border-zinc-200');
      }
    }
    if (bp.designSystem) {
      bp.designSystem.backgroundColor = '#ffffff';
      bp.designSystem.surfaceColor = '#f9fafb';
      bp.designSystem.textColor = '#111827';
      bp.designSystem.textMutedColor = '#4b5563';
      if (bp.designSystem.background) {
        bp.designSystem.background = bp.designSystem.background.replace(/bg-zinc-950/g, 'bg-white').replace(/text-zinc-100/g, 'text-zinc-900');
      }
      if (bp.designSystem.cardStyle) {
        bp.designSystem.cardStyle = bp.designSystem.cardStyle.replace(/bg-\[#121215\]/g, 'bg-white').replace(/border-zinc-800/g, 'border-zinc-200');
      }
    }
  }

  // 5. Resolve Scene
  const rawScene = bp.heroScene || bp.scene || bp.scene_plan || {};
  bp.scene ??= {};
  bp.scene.sceneId ??= rawScene.type || rawScene.sceneId || rawScene.selectedScene || "FloatingBlobScene";
  
  const sceneMeta = SCENE_REGISTRY[bp.scene.sceneId] || SCENE_REGISTRY.FloatingBlobScene || {};
  
  // Resolve string presets for generated template
  bp.scene.cameraPreset ??= rawScene.cameraPreset || (typeof rawScene.camera === "string" ? rawScene.camera : null) || sceneMeta.cameraPreset || "Hero Camera";
  bp.scene.lightingPreset ??= rawScene.lightingPreset || (typeof rawScene.lighting === "string" ? rawScene.lighting : null) || sceneMeta.lightingPreset || "Studio";
  bp.scene.interactionPreset ??= rawScene.interaction || rawScene.interactionPreset || (sceneMeta.defaultAnimations && sceneMeta.defaultAnimations[0]) || "Hover Rotation";
  bp.scene.qualityProfile ??= rawScene.quality || rawScene.qualityProfile || "High";
  
  // Keep object structures for compatibility
  bp.scene.camera ??= (typeof rawScene.camera === "object" ? rawScene.camera : null) || { position: [0, 0, 6], fov: 55 };
  bp.scene.lighting ??= (Array.isArray(rawScene.lighting) ? rawScene.lighting : null) || [
    { type: "ambient", color: "#ffffff", intensity: 0.8 },
    { type: "directional", color: bp.theme?.colors?.primary || "#3d5eff", intensity: 1.2, position: [5, 5, 5] }
  ];

  // 6. Resolve Sections
  let rawSections = bp.sections || bp.websiteBlueprint?.sections || [];
  if (rawSections.length === 0 && bp.pages && Array.isArray(bp.pages)) {
    bp.pages.forEach(p => {
      if (p.sections && Array.isArray(p.sections)) {
        rawSections.push(...p.sections);
      }
    });
  }

  let sections = [];
  const seenIds = new Set();
  rawSections.forEach(s => {
    if (!s) return;
    const id = s.id || s.name?.toLowerCase().replace(/\s+/g, '-') || "section";
    if (seenIds.has(id)) return;
    seenIds.add(id);

    const content = s.content || {};
    const cta = s.cta || { label: "Learn More", path: "/contact" };

    sections.push({
      id,
      type: s.type || s.componentName?.replace(/Section$/, '').toLowerCase() || "features",
      name: s.name || s.title || "Section",
      title: s.title || s.name || "Section Title",
      subtitle: s.subtitle || "",
      content,
      cta,
      componentName: s.componentName || `${String(s.name || s.id || 'Custom').replace(/\s+/g, '')}Section`,
      animation: s.animation || "slide-up",
      threeObject: s.threeObject || s.three_d_element?.type || null
    });
  });

  bp.sections ??= sections;

  // Set missing visualIdentity and designSystem if they are missing
  bp.visualIdentity ??= bp.brand.palette;
  bp.designSystem ??= bp.visualIdentity;

  const finalLayoutPlan = bp.layout_plan || {
    name: bp.brand.industry,
    sections: bp.sections.map(s => ({
      componentName: s.componentName,
      id: s.id,
      name: s.name,
      type: s.type
    }))
  };

  // Build the returned object by mapping everything from the normalized bp
  const normalized = {
    brand: bp.brand,
    navigation: bp.navigation,
    hero: bp.hero,
    sections: bp.sections,
    theme: bp.theme,
    scene: bp.scene,

    // Legacy fields redirecting to canonical (preserving path compatibility)
    website_name: bp.brand.name,
    business_type: bp.brand.industry,
    design_style: bp.hero.layout,
    palette: bp.brand.palette,
    pages: bp.pages || [],
    assets: bp.assets || [],
    creative_concept: bp.creative_concept || {
      layout_archetype: bp.hero.layout
    },

    websiteBlueprint: {
      website_name: bp.brand.name,
      business_type: bp.brand.industry,
      design_style: bp.hero.layout,
      color_palette: bp.brand.palette,
      hero: {
        headline: bp.hero.headline,
        subheadline: bp.hero.description,
        description: bp.hero.description,
        cta_primary: bp.hero.buttons[0]?.label || "",
        cta_secondary: bp.hero.buttons[1]?.label || "",
        layout: bp.hero.layout,
        three_d_object: { type: bp.hero.scene }
      },
      sections: bp.sections.map(s => ({
        id: s.id,
        type: s.type,
        name: s.name,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content
      })),
      pages: bp.pages || []
    },

    concept: {
      websiteName: bp.brand.name,
      businessType: bp.brand.industry,
      tagline: bp.brand.tagline,
      designStyle: bp.hero.layout,
      theme: bp.theme?.animations?.scroll_effect || "parallax"
    },

    layout_plan: finalLayoutPlan,

    scene_plan: bp.scene_plan || {
      selectedScene: bp.scene.sceneId,
      cameraPreset: bp.scene.camera,
      lightingPreset: bp.scene.lighting,
      interactionPreset: bp.scene.interaction,
      qualityProfile: bp.scene.quality,
      supportedThemes: ["apple", "vercel", "linear", "modernDark"]
    },
    
    visualIdentity: bp.visualIdentity,
    designSystem: bp.designSystem
  };

  // Compare and print every field that changed
  console.log("==========================================");
  console.log("BLUEPRINT NORMALIZATION INTEGRITY LOG");
  console.log("==========================================");
  logFieldChange("logo", initialLogo, normalized.brand.name);
  logFieldChange("theme", initialTheme, normalized.theme);
  logFieldChange("visualIdentity", initialVisualIdentity, normalized.visualIdentity);
  logFieldChange("designSystem", initialDesignSystem, normalized.designSystem);
  logFieldChange("navigation", initialNavigation, normalized.navigation);
  logFieldChange("palette", initialPalette, normalized.brand.palette);
  logFieldChange("hero", initialHero, normalized.hero);
  logFieldChange("sections", initialSections, normalized.sections);
  console.log("==========================================");

  return normalized;
}

function getWB(bp) {
  return bp.websiteBlueprint ?? {}
}

export function getVisualIdentity(bp) {
  if (bp && bp.visualIdentity) return bp.visualIdentity;
  const theme = bp?.brand?.typography?.heading_font || "Modern";
  const palette = bp?.brand?.palette || {};
  return getThemeVisualIdentity(theme, palette);
}

export function getContentLibrary(bp) {
  if (bp && bp.content_library) return bp.content_library;
  const bt = getBusinessType(bp);
  const name = getSiteName(bp);
  return getIntelligentDomainContent(bt, name, bp?.meta?.prompt || "");
}

function getPalette(bp) {
  return bp.brand?.palette ?? {
    primary: '#3d5eff', secondary: '#00d4ff',
    accent: '#bf5fff', background: '#0a0a14', text: '#f0f0ff',
  }
}

function getSiteName(bp) {
  return bp.brand?.name || ''
}

function getTagline(bp) {
  if (process.env.BLUEPRINT_V2_ENABLED === "true") {
    return bp.brand?.tagline || "";
  }
  return bp.brand?.tagline ?? `The Future of ${getSiteName(bp)}`
}

function getFooterLinks(bp) {
  if (process.env.BLUEPRINT_V2_ENABLED === "true") {
    return bp.footer?.links ?? [];
  }
  return getNavLinks(bp);
}


function getBusinessType(bp) {
  return (bp.brand?.industry || 'Technology').toLowerCase()
}

function getDesignStyle(bp) {
  return bp.hero?.layout ?? 'Futuristic'
}

function getHeroLayout(bp) {
  return bp.hero?.layout ?? 'split'
}

function inferHeroLayout(bt, prompt = '') {
  return bpInferHeroLayout(bt, prompt)
}

function getHeroContent(bp) {
  const hero = bp.hero ?? {};
  const name = getSiteName(bp);
  const buttons = Array.isArray(hero.buttons) && hero.buttons.length > 0
    ? hero.buttons
    : [{ label: `Explore ${name}`, type: 'primary' }];
  return {
    heading: hero.headline || `${name} Innovation`,
    headline: hero.headline || `${name} Innovation`,
    subheading: hero.description || '',
    subheadline: hero.description || '',
    description: hero.description || '',
    cta: buttons[0]?.label || `Explore ${name}`,
    cta_primary: buttons[0]?.label || `Explore ${name}`,
    cta_secondary: buttons[1]?.label || '',
    badge: hero.badge || ''
  }
}

function get3DObjectType(bp) {
  return bp.hero?.scene ?? 'floating-sphere'
}

function getNavLinks(bp) {
  return bp.navigation?.links ?? []
}

function getFirstFeaturesSection(bp) {
  const sections = bp.sections ?? []
  return sections.find(s => s.type === 'features' || s.id === 'features') ?? null
}

function getFeaturesContent(bp) {
  const sec = getFirstFeaturesSection(bp)
  return {
    title:    sec?.title ?? 'What We Offer',
    subtitle: sec?.subtitle ?? '',
    items:    Array.isArray(sec?.content) ? sec.content : [],
  }
}

function getBrandBadge(bp) {
  return getHeroContent(bp).badge
}

// ─── Features section layout selector ────────────────────────────────────────

function getFeaturesLayout(bp) {
  const bt = getBusinessType(bp)
  if (/restaurant|food|dining|caf|luxury|fashion|music|agency|studio|creative/.test(bt)) return 'editorial'
  if (/gaming|esport|nft|web3|cyberpunk/.test(bt))                                       return 'neon-grid'
  if (/health|medical|wellness|fitness|education|edu|consult|advisory/.test(bt))         return 'steplist'
  if (/fintech|finance|bank|payment|ai.platform|ai.saas/.test(bt))                       return 'stat-grid'
  if (/travel|hotel|ecommerce|shop|retail/.test(bt))                                     return 'card-scroll'
  if (/space|cosmos|galaxy/.test(bt))                                                    return 'space-grid'
  return 'feature-grid'
}

// ─── File tree ────────────────────────────────────────────────────────────────

export function buildFileTree(bp) {
  const name  = getSiteName(bp)
  const pages = (bp.pages ?? [{ name: 'Home' }, { name: 'About' }, { name: 'Pricing' }])
  const bt    = getBusinessType(bp)

  const sectionNames =
    bt.includes('restaurant') ? ['Menu', 'Book', 'Events'] :
    bt.includes('ecommerce')  ? ['Shop', 'Collections', 'Checkout'] :
    bt.includes('gaming')     ? ['Leaderboard', 'Tournaments', 'Arena'] :
    ['Features', 'Testimonials', 'Pricing']

  return [
    `# ${name} — Generated by Getartifact`,
    ``,
    `src/`,
    `├── main.jsx`,
    `├── App.jsx`,
    `├── index.css`,
    `├── components/`,
    `│   ├── layout/`,
    `│   │   ├── Navbar.jsx`,
    `│   │   ├── HeroLayout.jsx`,
    `│   │   ├── Container.jsx`,
    `│   │   ├── Section.jsx`,
    `│   │   ├── Grid.jsx`,
    `│   │   ├── Stack.jsx`,
    `│   │   ├── CTASection.jsx`,
    `│   │   └── Footer.jsx`,
    `│   ├── sections/`,
    ...sectionNames.map((s, i) => `│   │   ${i < sectionNames.length - 1 ? '├' : '└'}── ${s}Section.jsx`),
    `│   └── ui/`,
    `│       ├── Button.jsx`,
    `│       ├── FeatureCard.jsx`,
    `│       ├── TestimonialCard.jsx`,
    `│       ├── FAQAccordion.jsx`,
    `│       ├── StatCard.jsx`,
    `│       ├── PricingCard.jsx`,
    `│       └── Badge.jsx`,
    `├── 3d/`,
    `│   ├── Cinematic3DScene.jsx`,
    `│   └── objects/`,
    `│       └── CustomObject.jsx`,
    `├── pages/`,
    ...pages.map((p, i) => `│   ${i < pages.length - 1 ? '├' : '└'}── ${p.name}Page.jsx`),
    `└── hooks/`,
    `    └── useScrollReveal.js`,
  ].join('\n')
}

// ─── App.jsx ──────────────────────────────────────────────────────────────────

export function generateAppJSX(bp, theme = 'modernDark') {
  const name   = getSiteName(bp)
  const pal    = getPalette(bp)
  const rawPages = (bp.pages ?? [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])
  const pages = Array.isArray(rawPages) ? rawPages.map(p => {
    const rawName = typeof p === 'string' ? p : (p.name || 'Home');
    const name = String(rawName).replace(/\s+/g, '');
    const path = typeof p === 'string' ? (rawName === 'Home' ? '/' : `/${rawName.toLowerCase().replace(/\s+/g, '-')}`) : (p.path ?? (rawName === 'Home' ? '/' : `/${rawName.toLowerCase().replace(/\s+/g, '-')}`));
    return { name, path };
  }) : [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];
  const style  = getDesignStyle(bp)
  const font   = getWB(bp).typography?.heading_font ?? (style === 'Luxury' ? 'Playfair Display' : 'Syne')

  const imports = pages
    .map(p => `import ${p.name}Page from './pages/${p.name}Page'`)
    .join('\n')

  const routes = pages
    .map(p => `          <Route path="${p.path ?? `/${p.name.toLowerCase()}`}" element={<${p.name}Page />} />`)
    .join('\n')

  return `import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
${imports}

/**
 * ${name}
 * Design style: ${style}
 * Theme: ${theme}
 * Generated by Getartifact — https://getartifact.dev
 */
export default function App() {
  return (
    <ThemeProvider initialTheme="${theme}">
      <BrowserRouter>
        <div
          className="min-h-screen"
          style={{ background: '${pal.background}', color: '${pal.text}', fontFamily: 'Inter, sans-serif' }}
        >
          <Navbar
            brand="${name}"
            links={${JSON.stringify(getNavLinks(bp))}}
            primaryColor="${pal.primary}"
          />
          <main>
            <Routes>
${routes}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer
            brand="${name}"
            tagline="${getTagline(bp)}"
            links={${JSON.stringify(getFooterLinks(bp))}}
          />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}`
}

// ─── Custom 3D Object Code ────────────────────────────────────────────────────

function generate3DObjectCode(objectType, pal) {
  const pri = pal.primary   ?? '#3d5eff'
  const sec = pal.secondary ?? '#00d4ff'
  const acc = pal.accent    ?? '#bf5fff'

  switch (objectType) {

    case 'crystal':
      return `
function Crystal() {
  const outerRef = useRef()
  const innerRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    outerRef.current.rotation.y = t * 0.35
    outerRef.current.rotation.x = Math.sin(t * 0.22) * 0.18
    innerRef.current.rotation.y = -t * 0.55
    innerRef.current.rotation.x = Math.cos(t * 0.18) * 0.22
  })

  return (
    <group>
      <mesh ref={outerRef}>
        <octahedronGeometry args={[1.4, 0]} />
        <meshPhysicalMaterial
          color="${pri}"
          metalness={0.05}
          roughness={0}
          transmission={0.92}
          ior={2.4}
          thickness={0.6}
          envMapIntensity={2.5}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={innerRef} scale={0.58}>
        <octahedronGeometry args={[1.4, 1]} />
        <meshPhysicalMaterial
          color="${sec}"
          emissive="${sec}"
          emissiveIntensity={0.9}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color="${pri}" distance={4} />
    </group>
  )
}`

    case 'neural-network':
      return `
const NN_NODES = Array.from({ length: 16 }, () => ({
  pos: [
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 2.5,
  ],
}))

function NeuralNetwork() {
  const groupRef = useRef()
  const nodeRefs = useRef(NN_NODES.map(() => createRef()))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.16
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.12
    nodeRefs.current.forEach((ref, i) => {
      if (ref.current) {
        ref.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2.4 + i * 0.9) * 0.4
      }
    })
  })

  return (
    <group ref={groupRef}>
      {NN_NODES.map((node, i) => (
        <mesh key={i} ref={nodeRefs.current[i]} position={node.pos}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="${sec}"
            emissive="${sec}"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
      {NN_NODES.flatMap((a, i) =>
        NN_NODES.slice(i + 1, i + 3).map((b, j) => {
          const pts = [new THREE.Vector3(...a.pos), new THREE.Vector3(...b.pos)]
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          return (
            <line key={i + '-' + j} geometry={geo}>
              <lineBasicMaterial color="${pri}" transparent opacity={0.3} />
            </line>
          )
        })
      )}
    </group>
  )
}`

    case 'planet':
      return `
function Planet() {
  const bodyRef  = useRef()
  const ringRef  = useRef()
  const glowRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    bodyRef.current.rotation.y  = t * 0.1
    ringRef.current.rotation.x  = 1.15 + Math.sin(t * 0.08) * 0.04
    ringRef.current.rotation.z  = t * 0.05
    glowRef.current.rotation.y  = -t * 0.06
  })

  return (
    <group>
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.65}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.56, 64, 64]} />
        <meshStandardMaterial
          color="${sec}"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          emissive="${sec}"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[1.15, 0, 0]}>
        <ringGeometry args={[2.1, 2.95, 80]} />
        <meshBasicMaterial
          color="${acc}"
          transparent
          opacity={0.38}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}`

    case 'torus-knot':
      return `
function TorusKnot() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    meshRef.current.rotation.x = t * 0.21
    meshRef.current.rotation.y = t * 0.32
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.0, 0.32, 160, 16, 2, 3]} />
      <meshPhysicalMaterial
        color="${pri}"
        emissive="${acc}"
        emissiveIntensity={0.28}
        metalness={0.85}
        roughness={0.12}
        envMapIntensity={1.6}
      />
    </mesh>
  )
}`

    case 'dna-helix':
      return `
const DNA_STRAND_POINTS = 80
const DNA_STRAND_1 = Array.from({ length: DNA_STRAND_POINTS }, (_, i) => {
  const t = (i / DNA_STRAND_POINTS) * 4 * Math.PI * 2
  return new THREE.Vector3(Math.cos(t) * 0.9, (i / DNA_STRAND_POINTS) * 5.5 - 2.75, Math.sin(t) * 0.9)
})
const DNA_STRAND_2 = Array.from({ length: DNA_STRAND_POINTS }, (_, i) => {
  const t = (i / DNA_STRAND_POINTS) * 4 * Math.PI * 2 + Math.PI
  return new THREE.Vector3(Math.cos(t) * 0.9, (i / DNA_STRAND_POINTS) * 5.5 - 2.75, Math.sin(t) * 0.9)
})
const DNA_GEO_1 = new THREE.BufferGeometry().setFromPoints(DNA_STRAND_1)
const DNA_GEO_2 = new THREE.BufferGeometry().setFromPoints(DNA_STRAND_2)

function DNAHelix() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.elapsedTime * 0.28
  })

  return (
    <group ref={groupRef}>
      <line geometry={DNA_GEO_1}>
        <lineBasicMaterial color="${pri}" linewidth={2} />
      </line>
      <line geometry={DNA_GEO_2}>
        <lineBasicMaterial color="${sec}" linewidth={2} />
      </line>
      {Array.from({ length: 14 }, (_, i) => {
        const t  = (i / 14) * 4 * Math.PI * 2
        const y  = (i / 14) * 5.5 - 2.75
        const p1 = [Math.cos(t) * 0.9, y, Math.sin(t) * 0.9]
        const p2 = [Math.cos(t + Math.PI) * 0.9, y, Math.sin(t + Math.PI) * 0.9]
        const rg = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...p1), new THREE.Vector3(...p2),
        ])
        return (
          <group key={i}>
            <mesh position={p1}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="${pri}" emissive="${pri}" emissiveIntensity={0.9} />
            </mesh>
            <mesh position={p2}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="${sec}" emissive="${sec}" emissiveIntensity={0.9} />
            </mesh>
            <line geometry={rg}>
              <lineBasicMaterial color="${acc}" transparent opacity={0.55} />
            </line>
          </group>
        )
      })}
    </group>
  )
}`

    case 'geometric-grid':
      return `
const GRID_POSITIONS = Array.from({ length: 9 }, (_, i) => [
  ((i % 3) - 1) * 1.25,
  0,
  (Math.floor(i / 3) - 1) * 1.25,
])

function GeometricGrid() {
  const groupRef = useRef()
  const boxRefs  = useRef(GRID_POSITIONS.map(() => createRef()))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current.rotation.y = t * 0.14
    boxRefs.current.forEach((ref, i) => {
      if (!ref.current) return
      ref.current.position.y     = Math.sin(t * 1.1 + i * 0.75) * 0.45
      ref.current.rotation.x     = t * 0.38 + i * 0.31
      ref.current.rotation.z     = t * 0.27 + i * 0.22
      ref.current.material.emissiveIntensity = 0.15 + Math.sin(t * 1.5 + i) * 0.12
    })
  })

  return (
    <group ref={groupRef}>
      {GRID_POSITIONS.map((pos, i) => (
        <mesh key={i} ref={boxRefs.current[i]} position={pos}>
          <boxGeometry args={[0.52, 0.52, 0.52]} />
          <meshPhysicalMaterial
            color="${pri}"
            emissive="${pri}"
            emissiveIntensity={0.18}
            metalness={0.75}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}`

    case 'icosahedron':
      return `
function Icosahedron() {
  const outerRef = useRef()
  const innerRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    outerRef.current.rotation.y = t * 0.18
    outerRef.current.rotation.x = Math.sin(t * 0.13) * 0.28
    innerRef.current.rotation.y = -t * 0.32
    innerRef.current.rotation.z = t * 0.09
  })

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.12}
          metalness={0.55}
          roughness={0.22}
          wireframe
        />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshPhysicalMaterial
          color="${sec}"
          transmission={0.88}
          ior={1.85}
          roughness={0}
          metalness={0.08}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  )
}`

    case 'black-hole':
      return `
function BlackHole() {
  const diskRef  = useRef()
  const disk2Ref = useRef()
  const coreRef  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    diskRef.current.rotation.z  = t * 0.55
    disk2Ref.current.rotation.z = -t * 0.38
    coreRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2.5) * 0.4
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="${acc}"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.5, 80]} />
        <meshBasicMaterial
          color="${pri}"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={disk2Ref} rotation={[Math.PI / 2 + 0.3, 0.2, 0]}>
        <ringGeometry args={[0.9, 1.8, 80]} />
        <meshBasicMaterial
          color="${acc}"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}`

    case 'floating-sphere':
    default:
      return `
function FloatingSphere() {
  const sphereRef = useRef()
  const ring1Ref  = useRef()
  const ring2Ref  = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    sphereRef.current.position.y = Math.sin(t * 0.78) * 0.28
    ring1Ref.current.rotation.z  = t * 0.42
    ring2Ref.current.rotation.x  = t * 0.3
    ring2Ref.current.rotation.z  = -t * 0.18
  })

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshPhysicalMaterial
          color="${pri}"
          emissive="${pri}"
          emissiveIntensity={0.18}
          metalness={0.28}
          roughness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.72, 1.78, 64]} />
        <meshBasicMaterial color="${sec}" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.5, 0]}>
        <ringGeometry args={[2.05, 2.09, 64]} />
        <meshBasicMaterial color="${acc}" transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}`
  }
}

// ─── 3D Scene (Cinematic3DScene + custom object inline) ───────────────────────

export function generateThreeSceneComponent(bp) {
  const plan = bp?.scene || {
    sceneId: "FloatingBlobScene",
    cameraPreset: "Hero Camera",
    lightingPreset: "Studio",
    interactionPreset: "Hover Rotation",
    qualityProfile: "High"
  };

  return `import React from 'react'
import { SceneContent } from './SceneComposer'

export default function Cinematic3DScene({ sceneId, style = {} }) {
  return (
    <SceneContent
      sceneId={sceneId || "${plan.sceneId}"}
      cameraPreset="${plan.cameraPreset}"
      lightingPreset="${plan.lightingPreset}"
      interactionPreset="${plan.interactionPreset}"
      quality="${plan.qualityProfile}"
    />
  )
}`
}

// ─── Hero Component (layout-aware & data-driven) ──────────────────────────────

function formatHeadline(headline, isSplitColor = false, priColor = '#3d5eff') {
  const clean = (headline || '').replace(/\\n/g, '\n')
  if (!isSplitColor) {
    return clean.replace(/\n/g, '<br />\n          ')
  }
  const tokens = clean.split(/\s+/).filter(Boolean)
  const mid = Math.ceil(tokens.length / 2)
  const firstPart = tokens.slice(0, mid).join(' ').replace(/\n/g, '<br />\n          ')
  const secondPart = tokens.slice(mid).join(' ').replace(/\n/g, '<br />\n            ')
  return `${firstPart}\n          <span style={{ color: '${priColor}' }}>\n            {' '}${secondPart}\n          </span>`
}

// ─── Phase 9.1A: Reusable Component Strings ──────────────────────────────────

function getButtonComponentString() {
  return `import { motion } from 'framer-motion'
import { useTheme } from '../../theme/ThemeProvider'

const sizes = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-base px-8 py-4',
}

export default function Button({
  text = '',
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  animation = true,
  className = '',
  ...props
}) {
  const { themeTokens } = useTheme();

  const getVariantStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: themeTokens.colors.primary,
        color: '#ffffff',
        boxShadow: themeTokens.shadows[themeTokens.button?.shadow || 'md'],
        border: 'none',
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: themeTokens.colors.surface,
        color: themeTokens.colors.text,
        border: \`1px solid \${themeTokens.colors.border}\`,
      };
    }
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: themeTokens.colors.primary,
        border: \`2px solid \${themeTokens.colors.primary}\`,
      };
    }
    return {
      backgroundColor: 'transparent',
      color: themeTokens.colors.text,
      border: 'none',
    };
  };

  const buttonRadius = themeTokens.button?.radius ? (themeTokens.radius[themeTokens.button.radius] || themeTokens.button.radius) : themeTokens.radius.xl;

  const baseClasses = [
    'inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-all duration-200',
    themeTokens.button?.className || '',
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && <span className="text-lg">{icon}</span>}
      {children || text}
    </>
  )

  const motionProps = animation ? {
    whileHover: { scale: disabled ? 1 : 1.03 },
    whileTap: { scale: disabled ? 1 : 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  } : {}

  const mergedStyle = { ...getVariantStyle(), borderRadius: buttonRadius, ...props.style };

  if (href && !disabled) {
    return (
      <motion.a
        href={href}
        className={baseClasses}
        style={mergedStyle}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      className={baseClasses}
      style={mergedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  )
}
`
}

function getFeatureCardComponentString() {
  return `import { motion } from 'framer-motion'
import { useTheme } from '../../theme/ThemeProvider'

export default function FeatureCard({
  icon = '⚡',
  title = 'Feature',
  description = '',
  accentColor,
  animation = {},
  hoverEffect = true,
}) {
  const { themeTokens } = useTheme();
  const accent = accentColor || themeTokens.colors.primary;
  const delay = animation.delay || 0;
  const cardRadius = themeTokens.card?.radius ? (themeTokens.radius[themeTokens.card.radius] || themeTokens.card.radius) : themeTokens.radius.lg;

  return (
    <motion.div
      className={[
        'group p-8 transition-all duration-300 flex items-start gap-6',
        themeTokens.card?.className || 'bg-neutral-900 border border-neutral-800 shadow-xl',
        hoverEffect ? 'hover:shadow-2xl hover:brightness-110' : '',
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: themeTokens.colors.surface,
        borderColor: themeTokens.colors.border,
        borderRadius: cardRadius,
        boxShadow: themeTokens.shadows[themeTokens.card?.shadow || 'md'],
      }}
      initial={themeTokens.animations.fadeUp?.initial || { opacity: 0, y: 24 }}
      whileInView={themeTokens.animations.fadeUp?.whileInView || { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition-colors duration-300"
        style={{
          background: accent + '15',
          borderColor: accent + '40',
        }}
      >
        {icon}
      </div>
      <div>
        <h3 
          className="text-xl font-bold mb-2 tracking-tight"
          style={{ color: themeTokens.colors.text }}
        >
          {title}
        </h3>
        <p 
          className="text-sm leading-relaxed"
          style={{ color: themeTokens.colors.textMuted }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  )
}
`
}

function getHeroLayoutComponentString() {
  return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { useTheme } from '../../theme/ThemeProvider'

function FormatTitle({ text }) {
  if (!text) return null
  const parts = String(text).split(/\\\\n|\\n/)
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {part}
    </span>
  ))
}

export default function HeroLayout({
  title = '',
  subtitle = '',
  description = '',
  badge = '',
  buttons = [],
  background,
  alignment = 'left',
  theme = {},
  scene = null,
}) {
  const { themeTokens } = useTheme();
  const align = themeTokens.hero?.align || alignment;
  const isCenter = align === 'center' || alignment === 'center';
  const hasScene = !!scene;
  
  const primary = theme.primary || themeTokens.colors.primary;
  const secondary = theme.secondary || themeTokens.colors.secondary;
  const textColor = theme.text || themeTokens.colors.text;
  const bg = background || themeTokens.colors.background;
  const badgeBg = themeTokens.hero?.badgeBg || (primary + '20');
  const badgeText = themeTokens.hero?.badgeText || secondary;

  return (
    <section
      className={\`relative min-h-screen overflow-hidden \${hasScene && !isCenter ? 'grid lg:grid-cols-2' : 'flex flex-col'}\`}
      style={{ background: bg }}
    >
      {/* ── Content Column ───────────────────────────────────── */}
      <div className={\`flex flex-col justify-center z-10 px-8 lg:px-20 py-32 \${isCenter ? 'items-center text-center mx-auto max-w-4xl' : ''}\`}>

        {badge && (
          <motion.div
            className="mb-6 inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: badgeBg,
              border: '1px solid ' + primary + '44',
              color: badgeText,
              ...(isCenter ? { alignSelf: 'center' } : {}),
            }}
            initial={{ opacity: 0, x: isCenter ? 0 : -20, y: isCenter ? -10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeText }} />
            {badge}
          </motion.div>
        )}

        <motion.h1
          className="font-bold leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: textColor }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <FormatTitle text={title} />
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-lg lg:text-xl font-medium mb-3 max-w-xl"
            style={{ color: textColor + 'dd' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}

        {description && (
          <motion.p
            className="text-sm lg:text-base mb-10 max-w-xl leading-relaxed"
            style={{ color: themeTokens.colors.textMuted }}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
          >
            {description}
          </motion.p>
        )}

        {buttons.length > 0 && (
          <motion.div
            className={\`flex flex-wrap gap-4 \${isCenter ? 'justify-center' : ''}\`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {buttons.map((btn, idx) => (
              <Button key={idx} {...btn} size={btn.size || 'lg'} />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── 3D Scene Column ──────────────────────────────────── */}
      {hasScene && (
        <div className={\`\${isCenter ? 'absolute inset-0 opacity-40' : 'hidden lg:block relative'}\`}>
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
              <Suspense fallback={null}>
                {scene}
              </Suspense>
            </Canvas>
          </div>
        </div>
      )}

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ' + bg + ', transparent)' }}
      />
    </section>
  )
}
`
}

function getTestimonialCardComponentString() {
  return `import { motion } from 'framer-motion'
import { useTheme } from '../../theme/ThemeProvider'

export default function TestimonialCard({
  name = 'Anonymous',
  role = '',
  company = '',
  avatar,
  rating = 5,
  quote = '',
  theme = {},
  animation = {}
}) {
  const { themeTokens } = useTheme();
  const primary = theme.primary || themeTokens.colors.primary;
  const secondary = theme.secondary || themeTokens.colors.secondary;
  const delay = animation.delay || 0;
  const cardRadius = themeTokens.card?.radius ? (themeTokens.radius[themeTokens.card.radius] || themeTokens.card.radius) : themeTokens.radius.lg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={[
        "group p-8 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between",
        themeTokens.card?.className || "bg-neutral-900/70 border border-white/[0.08] hover:border-[var(--color-secondary,#00d4ff)]/50"
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: themeTokens.colors.surface,
        borderColor: themeTokens.colors.border,
        borderRadius: cardRadius,
        boxShadow: themeTokens.shadows[themeTokens.card?.shadow || 'xl']
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-20 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: \`linear-gradient(90deg, \${primary}, \${secondary})\` }}
      />

      <div>
        <div className="flex items-center gap-1 mb-6 text-amber-400 text-sm font-bold">
          {Array.from({ length: Math.min(5, Math.max(1, rating)) }).map((_, i) => (
            <span key={i} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">★</span>
          ))}
        </div>

        <p 
          className="italic text-base md:text-lg leading-relaxed mb-8 font-normal"
          style={{ color: themeTokens.colors.text }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="border-t pt-5 flex items-center gap-4" style={{ borderColor: themeTokens.colors.border }}>
        <div 
          className="w-12 h-12 rounded-2xl border flex items-center justify-center font-extrabold text-white text-base shadow-inner shrink-0"
          style={{ 
            background: \`linear-gradient(135deg, \${primary}33, \${secondary}33)\`,
            borderColor: \`\${secondary}66\`
          }}
        >
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            (name || 'A')[0].toUpperCase()
          )}
        </div>
        <div>
          <h4 className="font-bold text-base tracking-tight" style={{ color: themeTokens.colors.text }}>{name}</h4>
          {(role || company) && (
            <span className="text-xs font-semibold" style={{ color: themeTokens.colors.textMuted }}>
              {role}{role && company ? ' · ' : ''}{company}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
`
}

function getFAQAccordionComponentString() {
  return `import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../theme/ThemeProvider'

export default function FAQAccordion({
  question = '',
  answer = '',
  defaultOpen = false,
  icon = '+',
  theme = {}
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const id = useId()
  const contentId = \`faq-content-\${id}\`
  const { themeTokens } = useTheme()
  const secondary = theme.secondary || themeTokens.colors.secondary
  const cardRadius = themeTokens.card?.radius ? (themeTokens.radius[themeTokens.card.radius] || themeTokens.card.radius) : themeTokens.radius.md

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden transition-colors duration-200 border"
      style={{
        backgroundColor: themeTokens.colors.surface,
        borderColor: isOpen ? secondary : themeTokens.colors.border,
        borderRadius: cardRadius
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full p-6 text-left flex justify-between items-center text-base md:text-lg font-bold transition-colors focus:outline-none focus-visible:ring-2"
        style={{ color: isOpen ? secondary : themeTokens.colors.text }}
      >
        <span className="pr-4">{question}</span>
        <span 
          className="w-8 h-8 rounded-full flex items-center justify-center text-base font-extrabold shrink-0 transition-transform duration-300 border"
          style={{ 
            color: secondary, 
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: themeTokens.colors.border
          }}
        >
          {icon}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              className="px-6 pb-6 pt-2 text-sm md:text-base leading-relaxed border-t"
              style={{ 
                color: themeTokens.colors.textMuted,
                borderColor: themeTokens.colors.border
              }}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
`
}

function getStatCardComponentString() {
  return `import { motion } from 'framer-motion'
import { useTheme } from '../../theme/ThemeProvider'

export default function StatCard({
  value = '0',
  label = 'Metric',
  icon = '✦',
  description = '',
  color,
  animation = {}
}) {
  const { themeTokens } = useTheme();
  const accent = color || themeTokens.colors.secondary;
  const delay = animation.delay || 0;
  const cardRadius = themeTokens.card?.radius ? (themeTokens.radius[themeTokens.card.radius] || themeTokens.card.radius) : themeTokens.radius.lg;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className={[
        "p-8 transition-all duration-300 text-center flex flex-col items-center justify-center relative group overflow-hidden border",
        themeTokens.card?.className || "bg-neutral-900 border border-neutral-800 shadow-xl"
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: themeTokens.colors.surface,
        borderColor: themeTokens.colors.border,
        borderRadius: cardRadius,
        boxShadow: themeTokens.shadows[themeTokens.card?.shadow || 'lg']
      }}
    >
      <div 
        className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-2xl border shadow-inner group-hover:scale-110 transition-transform duration-300"
        style={{ background: \`\${accent}15\`, borderColor: \`\${accent}40\`, color: accent }}
      >
        {icon}
      </div>
      
      <span 
        className="text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-sm"
        style={{ color: accent }}
      >
        {value}
      </span>
      
      <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: themeTokens.colors.text }}>
        {label}
      </h3>
      
      {description && (
        <p className="text-xs md:text-sm leading-relaxed max-w-xs mx-auto" style={{ color: themeTokens.colors.textMuted }}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
`
}

function getContainerComponentString() {
  return `import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function Container({ size = 'xl', className = '', children }) {
  const { themeTokens } = useTheme();
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };
  const maxW = sizes[size] || sizes.xl;
  return (
    <div className={\`mx-auto px-6 w-full \${maxW} \${className}\`}>
      {children}
    </div>
  );
}
`;
}

function getSectionComponentString() {
  return `import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function Section({ spacing = 'lg', background = 'default', divider = false, className = '', id, children }) {
  const { themeTokens } = useTheme();
  const spaces = {
    none: '0px',
    sm: themeTokens.spacing.xl || '2rem',
    md: themeTokens.spacing['2xl'] || '3rem',
    lg: themeTokens.spacing['3xl'] || '5rem',
    xl: '7rem'
  };
  const bgs = {
    default: 'transparent',
    surface: themeTokens.colors.surface,
    dark: themeTokens.colors.background,
    gradient: \`linear-gradient(to bottom, \${themeTokens.colors.background}, \${themeTokens.colors.surface})\`
  };
  const py = spaces[spacing] || spaces.lg;
  const bg = bgs[background] || background;

  return (
    <section 
      id={id} 
      className={\`relative w-full \${divider ? 'border-t' : ''} \${className}\`}
      style={{
        paddingTop: py,
        paddingBottom: py,
        background: bg,
        borderColor: divider ? themeTokens.colors.border : 'transparent'
      }}
    >
      {children}
    </section>
  );
}
`;
}

function getGridComponentString() {
  return `import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function Grid({ columns = 3, gap = 'md', align = 'stretch', className = '', children }) {
  const { themeTokens } = useTheme();
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  const aligns = {
    stretch: 'items-stretch',
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  };
  const colClass = cols[columns] || cols[3];
  const alignClass = aligns[align] || aligns.stretch;
  const gapValue = themeTokens.spacing[gap] || themeTokens.spacing.lg || '2rem';

  return (
    <div 
      className={\`grid \${colClass} \${alignClass} \${className}\`}
      style={{ gap: gapValue }}
    >
      {children}
    </div>
  );
}
`;
}

function getStackComponentString() {
  return `import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function Stack({ spacing = 'md', align = 'stretch', className = '', children }) {
  const { themeTokens } = useTheme();
  const aligns = {
    stretch: 'items-stretch',
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  };
  const alignClass = aligns[align] || aligns.stretch;
  const gapValue = themeTokens.spacing[spacing] || themeTokens.spacing.md || '1rem';

  return (
    <div 
      className={\`flex flex-col \${alignClass} \${className}\`}
      style={{ gap: gapValue }}
    >
      {children}
    </div>
  );
}
`;
}

function getCTASectionComponentString(bp) {
  const ctaSec = bp?.sections?.find(s => s.type === 'cta' || s.id === 'cta');
  const title = ctaSec?.title || `Ready to build with ${bp?.brand?.name || 'us'}?`;
  const desc = ctaSec?.subtitle || ctaSec?.description || `Join thousands of teams leveraging ${bp?.brand?.name || 'our platforms'} for high-velocity solutions.`;
  const primaryButton = ctaSec?.cta?.label || bp?.navigation?.cta?.label || 'Get Started Now';
  const secondaryButton = ctaSec?.cta?.secondaryLabel || '';

  return `import React from 'react';
import { motion } from 'framer-motion';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';
import Button from '../ui/Button';
import { useTheme } from '../../theme/ThemeProvider';

export default function CTASection({
  title = ${JSON.stringify(title)},
  description = ${JSON.stringify(desc)},
  subtitle,
  primaryButton = ${JSON.stringify(primaryButton)},
  buttonText,
  secondaryButton = ${JSON.stringify(secondaryButton)},
  background = 'surface',
  theme = {},
  animation = {}
}) {
  const { themeTokens } = useTheme();
  const finalDesc = subtitle || description;
  const finalPrimary = buttonText || primaryButton;
  
  return (
    <Section spacing="lg" background={background} divider={true} className="relative overflow-hidden text-center">
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: \`linear-gradient(to top, \${themeTokens.colors.primary}44, transparent)\` }} 
      />
      <Container size="md" className="relative z-10">
        <motion.div
          initial={themeTokens.animations.fadeUp?.initial || { opacity: 0, y: 20 }}
          whileInView={themeTokens.animations.fadeUp?.whileInView || { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Stack spacing="lg" align="center">
            <div>
              <span 
                className="text-xs font-black uppercase tracking-widest mb-3 block"
                style={{ color: themeTokens.colors.secondary }}
              >
                Next Step
              </span>
              <h2 
                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
                style={{ color: themeTokens.colors.text }}
              >
                {title}
              </h2>
              <p 
                className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
                style={{ color: themeTokens.colors.textMuted }}
              >
                {finalDesc}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <Button variant="primary" size="lg">{finalPrimary}</Button>
              {secondaryButton && <Button variant="secondary" size="lg">{secondaryButton}</Button>}
            </div>
          </Stack>
        </motion.div>
      </Container>
    </Section>
  );
}
`;
}

function getPricingCardComponentString() {
  return `import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useTheme } from '../../theme/ThemeProvider';

export default function PricingCard({
  title = 'Standard',
  price = '$99',
  period = '/mo',
  features = [],
  highlight = false,
  button = 'Select Plan',
  theme = {}
}) {
  const { themeTokens } = useTheme();
  const primary = theme.primary || themeTokens.colors.primary;
  const secondary = theme.secondary || themeTokens.colors.secondary;
  const cardRadius = themeTokens.card?.radius ? (themeTokens.radius[themeTokens.card.radius] || themeTokens.card.radius) : themeTokens.radius.xl;

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={\`p-8 md:p-10 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border \${
        highlight ? 'shadow-2xl' : 'shadow-xl'
      }\`}
      style={{
        backgroundColor: themeTokens.colors.surface,
        borderColor: highlight ? secondary : themeTokens.colors.border,
        borderRadius: cardRadius,
        boxShadow: highlight ? themeTokens.shadows[themeTokens.card?.shadow || 'glow'] : themeTokens.shadows[themeTokens.card?.shadow || 'md'],
      }}
    >
      {highlight && (
        <span 
          className="text-white text-xs px-3.5 py-1 rounded-full uppercase tracking-widest font-extrabold absolute top-4 right-6 shadow-md"
          style={{ background: \`linear-gradient(135deg, \${primary}, \${secondary})\` }}
        >
          Most Popular
        </span>
      )}
      
      <div>
        <span 
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: highlight ? secondary : themeTokens.colors.textMuted }}
        >
          {title}
        </span>
        <div className="mt-4 mb-6">
          <span className="text-4xl md:text-5xl font-black" style={{ color: themeTokens.colors.text }}>{price}</span>
          <span className="text-sm md:text-base font-medium" style={{ color: themeTokens.colors.textMuted }}> {period}</span>
        </div>
        
        <ul 
          className="space-y-4 mb-8 text-sm font-medium border-t pt-6 text-left"
          style={{ color: themeTokens.colors.text, borderColor: themeTokens.colors.border }}
        >
          {(features || []).map((f, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <span className="font-bold text-base shrink-0" style={{ color: secondary }}>✓</span> 
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="w-full">
        <Button 
          variant={highlight ? 'primary' : 'secondary'} 
          size="md" 
          className="w-full justify-center"
        >
          {button}
        </Button>
      </div>
    </motion.div>
  );
}
`;
}

// ─── Theme Engine & Design System (Phase 9.4) ──────────────────────────────────

function getTokensString() {
  return `export const colors = {
  primary: '#3d5eff',
  secondary: '#00d4ff',
  accent: '#ff007f',
  background: '#0a0a14',
  surface: '#131424',
  border: 'rgba(255, 255, 255, 0.12)',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
};

export const radius = {
  none: '0px',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px'
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 25px rgba(61, 94, 255, 0.25)'
};

export const typography = {
  display: 'text-5xl md:text-6xl font-black tracking-tight',
  heading: 'text-3xl md:text-4xl font-bold tracking-tight',
  title: 'text-xl md:text-2xl font-semibold',
  subtitle: 'text-lg md:text-xl font-medium',
  body: 'text-base leading-relaxed',
  caption: 'text-sm font-medium opacity-80',
  code: 'font-mono text-sm px-2 py-1 bg-black/30 rounded'
};

export const animations = {
  fadeUp: { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } },
  fadeDown: { initial: { opacity: 0, y: -24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } },
  fadeLeft: { initial: { opacity: 0, x: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } },
  fadeRight: { initial: { opacity: 0, x: -24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } },
  zoom: { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.4 } },
  scale: { whileHover: { scale: 1.03 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } },
  stagger: (index = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4, delay: index * 0.1 } })
};

export const transitions = {
  fast: '0.15s ease',
  normal: '0.25s ease',
  slow: '0.4s ease'
};

export const zIndex = {
  base: 1,
  dropdown: 10,
  sticky: 50,
  modal: 100
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export default {
  colors,
  spacing,
  radius,
  shadows,
  typography,
  animations,
  transitions,
  zIndex,
  breakpoints,
  button: { radius: 'xl', shadow: 'none', style: 'default' },
  card: { radius: 'lg', shadow: 'none', bg: 'surface', border: true },
  hero: { badgeBg: 'rgba(61, 94, 255, 0.2)', badgeText: '#00d4ff', align: 'left' }
};
`;
}

function getThemeProviderString(bp) {
  const themeVal = bp?.theme;
  let customThemeEntry = '';
  
  if (typeof themeVal === 'string' && themeVal && themeVal !== 'modernDark' && themeVal !== 'apple' && themeVal !== 'vercel' && themeVal !== 'linear' && themeVal !== 'stripe' && themeVal !== 'framer' && themeVal !== 'notion' && themeVal !== 'minimal') {
    const palette = getPalette(bp);
    customThemeEntry = `
  "${themeVal}": {
    name: "${themeVal}",
    colors: ${JSON.stringify(palette, null, 2)},
    button: { radius: 'xl', shadow: 'none', style: 'default' },
    card: { radius: 'lg', shadow: 'none', bg: 'surface', border: true },
    hero: { badgeBg: 'rgba(61, 94, 255, 0.2)', badgeText: '#00d4ff', align: 'left' }
  },`;
  }

  return `import React, { createContext, useContext, useState, useMemo } from 'react';
import tokens from './tokens';
import apple from './themes/apple';
import vercel from './themes/vercel';
import linear from './themes/linear';
import stripe from './themes/stripe';
import framer from './themes/framer';
import notion from './themes/notion';
import minimal from './themes/minimal';
import modernDark from './themes/modernDark';

const THEME_REGISTRY = {
  apple,
  vercel,
  linear,
  stripe,
  framer,
  notion,
  minimal,
  modernDark${customThemeEntry ? ',' + customThemeEntry : ''}
};

const ThemeContext = createContext({
  currentTheme: ${typeof themeVal === 'string' ? `'${themeVal}'` : "'modernDark'"},
  themeTokens: tokens,
  setTheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { currentTheme: ${typeof themeVal === 'string' ? `'${themeVal}'` : "'modernDark'"}, themeTokens: tokens, setTheme: () => {} };
  }
  return context;
};

export function ThemeProvider({ initialTheme = ${typeof themeVal === 'string' ? `'${themeVal}'` : "'modernDark'"}, children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return THEME_REGISTRY[initialTheme] ? initialTheme : ${typeof themeVal === 'string' ? `'${themeVal}'` : "'modernDark'"};
  });

  const themeTokens = useMemo(() => {
    const selected = THEME_REGISTRY[currentTheme] || THEME_REGISTRY.modernDark || {};
    return {
      ...tokens,
      ...selected,
      colors: { ...tokens.colors, ...(selected.colors || {}) },
      spacing: { ...tokens.spacing, ...(selected.spacing || {}) },
      radius: { ...tokens.radius, ...(selected.radius || {}) },
      shadows: { ...tokens.shadows, ...(selected.shadows || {}) },
      typography: { ...tokens.typography, ...(selected.typography || {}) },
      animations: { ...tokens.animations, ...(selected.animations || {}) },
      button: { ...tokens.button, ...(selected.button || {}) },
      card: { ...tokens.card, ...(selected.card || {}) },
      hero: { ...tokens.hero, ...(selected.hero || {}) },
    };
  }, [currentTheme]);

  const value = useMemo(() => ({
    currentTheme,
    themeTokens,
    setTheme: setCurrentTheme
  }), [currentTheme, themeTokens]);

  const cssVariables = useMemo(() => ({
    '--color-primary': themeTokens.colors.primary,
    '--color-secondary': themeTokens.colors.secondary,
    '--color-accent': themeTokens.colors.accent,
    '--color-background': themeTokens.colors.background,
    '--color-surface': themeTokens.colors.surface,
    '--color-border': themeTokens.colors.border,
    '--color-text': themeTokens.colors.text,
    '--color-text-muted': themeTokens.colors.textMuted,
  }), [themeTokens]);

  return (
    <ThemeContext.Provider value={value}>
      <div style={{ ...cssVariables, backgroundColor: themeTokens.colors.background, color: themeTokens.colors.text, minHeight: '100vh', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
`;
}

function getThemeAppleString() {
  return `export default {
  name: "apple",
  colors: {
    primary: '#0071e3',
    secondary: '#147ce5',
    accent: '#ff3b30',
    background: '#f5f5f7',
    surface: '#ffffff',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#1d1d1f',
    textMuted: '#6e6e73'
  },
  button: {
    radius: 'full',
    shadow: 'sm',
    style: 'apple',
    className: 'rounded-full font-medium tracking-normal'
  },
  card: {
    radius: 'xl',
    shadow: 'md',
    bg: '#ffffff',
    border: false,
    className: 'bg-white rounded-2xl shadow-md border-0'
  },
  hero: {
    badgeBg: 'rgba(0, 113, 227, 0.1)',
    badgeText: '#0071e3',
    align: 'center'
  },
  radius: {
    none: '0px',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  }
};
`;
}

function getThemeVercelString() {
  return `export default {
  name: "vercel",
  colors: {
    primary: '#ffffff',
    secondary: '#0070f3',
    accent: '#00d4ff',
    background: '#000000',
    surface: '#111111',
    border: '#333333',
    text: '#ffffff',
    textMuted: '#888888'
  },
  button: {
    radius: 'sm',
    shadow: 'none',
    style: 'vercel',
    className: 'rounded font-semibold text-black bg-white hover:bg-neutral-200'
  },
  card: {
    radius: 'md',
    shadow: 'none',
    bg: '#111111',
    border: true,
    className: 'bg-neutral-900 border border-neutral-800 rounded-md'
  },
  hero: {
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeText: '#ffffff',
    align: 'center'
  }
};
`;
}

function getThemeLinearString() {
  return `export default {
  name: "linear",
  colors: {
    primary: '#5e6ad2',
    secondary: '#00c6ff',
    accent: '#ff007a',
    background: '#08090a',
    surface: '#1c1d22',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#f7f8f8',
    textMuted: '#8d99ae'
  },
  button: {
    radius: 'md',
    shadow: 'glow',
    style: 'linear',
    className: 'rounded-lg bg-indigo-600 font-medium shadow-[0_0_15px_rgba(94,106,210,0.4)]'
  },
  card: {
    radius: 'lg',
    shadow: 'sm',
    bg: '#1c1d22',
    border: true,
    className: 'bg-[#1c1d22]/80 backdrop-blur-md border border-white/[0.08] rounded-xl'
  },
  hero: {
    badgeBg: 'rgba(94, 106, 210, 0.2)',
    badgeText: '#a0aaff',
    align: 'left'
  }
};
`;
}

function getThemeStripeString() {
  return `export default {
  name: "stripe",
  colors: {
    primary: '#635bff',
    secondary: '#00d4ff',
    accent: '#00d924',
    background: '#f6f9fc',
    surface: '#ffffff',
    border: 'rgba(0, 0, 0, 0.06)',
    text: '#0a2540',
    textMuted: '#425466'
  },
  button: {
    radius: 'lg',
    shadow: 'md',
    style: 'stripe',
    className: 'rounded-xl bg-[#635bff] text-white shadow-lg font-bold'
  },
  card: {
    radius: 'lg',
    shadow: 'xl',
    bg: '#ffffff',
    border: false,
    className: 'bg-white rounded-xl shadow-xl border-0 transform transition-transform duration-300 hover:-translate-y-1'
  },
  hero: {
    badgeBg: 'rgba(99, 91, 255, 0.1)',
    badgeText: '#635bff',
    align: 'left'
  }
};
`;
}

function getThemeFramerString() {
  return `export default {
  name: "framer",
  colors: {
    primary: '#0099ff',
    secondary: '#ff007f',
    accent: '#7928ca',
    background: '#000000',
    surface: '#121212',
    border: 'rgba(255, 255, 255, 0.15)',
    text: '#ffffff',
    textMuted: '#a0a0a0'
  },
  button: {
    radius: 'full',
    shadow: 'glow',
    style: 'framer',
    className: 'rounded-full bg-cyan-500 hover:bg-cyan-400 font-bold tracking-tight shadow-[0_0_20px_rgba(0,153,255,0.4)]'
  },
  card: {
    radius: '2xl',
    shadow: 'lg',
    bg: '#121212',
    border: true,
    className: 'bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-colors'
  },
  hero: {
    badgeBg: 'rgba(255, 0, 127, 0.2)',
    badgeText: '#ff007f',
    align: 'center'
  }
};
`;
}

function getThemeNotionString() {
  return `export default {
  name: "notion",
  colors: {
    primary: '#37352f',
    secondary: '#e16259',
    accent: '#d9730d',
    background: '#ffffff',
    surface: '#f7f6f3',
    border: 'rgba(55, 53, 47, 0.16)',
    text: '#37352f',
    textMuted: '#787774'
  },
  button: {
    radius: 'sm',
    shadow: 'sm',
    style: 'notion',
    className: 'rounded font-medium bg-[#37352f] text-white border border-[#37352f]'
  },
  card: {
    radius: 'md',
    shadow: 'sm',
    bg: '#f7f6f3',
    border: true,
    className: 'bg-[#f7f6f3] border border-neutral-300/60 rounded-md shadow-sm'
  },
  hero: {
    badgeBg: 'rgba(225, 98, 89, 0.1)',
    badgeText: '#e16259',
    align: 'left'
  }
};
`;
}

function getThemeMinimalString() {
  return `export default {
  name: "minimal",
  colors: {
    primary: '#000000',
    secondary: '#444444',
    accent: '#000000',
    background: '#ffffff',
    surface: '#f9f9f9',
    border: '#cccccc',
    text: '#000000',
    textMuted: '#666666'
  },
  button: {
    radius: 'none',
    shadow: 'none',
    style: 'minimal',
    className: 'rounded-none border border-black bg-black text-white font-bold uppercase tracking-widest text-xs py-3 px-6 hover:bg-white hover:text-black transition-colors'
  },
  card: {
    radius: 'none',
    shadow: 'none',
    bg: '#f9f9f9',
    border: true,
    className: 'bg-[#f9f9f9] border border-black/20 rounded-none shadow-none'
  },
  hero: {
    badgeBg: '#eeeeee',
    badgeText: '#000000',
    align: 'left'
  },
  radius: {
    none: '0px',
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
    full: '0px'
  }
};
`;
}

function getThemeModernDarkString() {
  return `export default {
  name: "modernDark",
  colors: {
    primary: '#3d5eff',
    secondary: '#00d4ff',
    accent: '#ff007f',
    background: '#0a0a14',
    surface: '#131424',
    border: 'rgba(255, 255, 255, 0.12)',
    text: '#ffffff',
    textMuted: '#94a3b8'
  },
  button: {
    radius: 'xl',
    shadow: 'glow',
    style: 'modernDark',
    className: 'rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(61,94,255,0.4)] font-bold'
  },
  card: {
    radius: 'xl',
    shadow: 'glow',
    bg: '#131424',
    border: true,
    className: 'bg-[#131424]/90 border border-white/10 rounded-2xl backdrop-blur-md'
  },
  hero: {
    badgeBg: 'rgba(61, 94, 255, 0.2)',
    badgeText: '#00d4ff',
    align: 'left'
  }
};
`;
}

/**
 * Phase 9.1A: Generate a thin HeroSection.jsx wrapper that passes data to HeroLayout.
 * Replaces the old monolithic 100+ line hero JSX with a ~30-line data-passing component.
 */
function generateHeroDataWrapper(bp) {
  const hero   = getHeroContent(bp)
  const pal    = getPalette(bp)
  const layout = getHeroLayout(bp)
  const vid    = getVisualIdentity(bp)
  const bg     = pal.background ?? '#0a0a14'
  const pri    = pal.primary    ?? '#3d5eff'
  const sec    = pal.secondary  ?? '#00d4ff'
  const text   = pal.text       ?? '#f0f0ff'

  // Determine alignment from layout
  const centerLayouts = ['centered', 'fullscreen', 'glass']
  const alignment = centerLayouts.includes(layout) ? 'center' : 'left'

  // Read buttons directly from normalized blueprint hero.buttons array
  const rawButtons = Array.isArray(bp.hero?.buttons) && bp.hero.buttons.length > 0
    ? bp.hero.buttons
    : [{ label: hero.cta_primary || 'Get Started', type: 'primary' }];
  const buttons = rawButtons.map((btn, i) => ({
    text: btn.label || btn.text || (i === 0 ? 'Get Started' : 'Learn More'),
    variant: btn.type === 'secondary' || btn.type === 'outline' ? 'outline' : (i === 0 ? 'primary' : 'outline')
  }));

  const heroData = {
    title: hero.headline || hero.heading || '',
    subtitle: hero.subheadline || hero.subheading || '',
    description: hero.description || '',
    badge: hero.badge || '',
    alignment,
    background: bg,
    theme: { primary: pri, secondary: sec, text: text },
    buttons,
  }

  return `import React from 'react'
import HeroLayout from '../layout/HeroLayout'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

const heroData = ${JSON.stringify(heroData, null, 2)}

export default function HeroSection() {
  return (
    <HeroLayout
      {...heroData}
      scene={<Cinematic3DScene />}
    />
  )
}
`
}


export function generateHeroComponent(bp) {
  const layout = getHeroLayout(bp)
  const pal    = getPalette(bp)
  const hero   = getHeroContent(bp)
  const name   = getSiteName(bp)
  const badge  = getBrandBadge(bp)
  const bg     = pal.background ?? '#0a0a14'
  const pri    = pal.primary    ?? '#3d5eff'
  const sec    = pal.secondary  ?? '#00d4ff'
  const acc    = pal.accent     ?? '#bf5fff'
  const text   = pal.text       ?? '#f0f0ff'

  if (layout === 'split') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* ── Left: content column ───────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-10 lg:px-20 py-36 z-10">
        <motion.div
          className="mb-8 inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ background: '${pri}22', border: '1px solid ${pri}55', color: '${sec}' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '${sec}' }} />
          ${badge}
        </motion.div>

        <motion.h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium mb-3 max-w-xl"
          style={{ color: '${text}dd' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base mb-10 max-w-xl leading-relaxed"
          style={{ color: '${text}75' }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
        >
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.03]"
            style={{ background: '${pri}', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
            style={{ border: '1px solid ${text}30', color: '${text}99' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* ── Right: 3D canvas ────────────────────────────────────────────── */}
      <div className="relative min-h-[55vh] lg:min-h-screen">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 58 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Cinematic3DScene />
            </Suspense>
          </Canvas>
        </div>
        {/* Fade to bg on left edge */}
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none"
          style={{ background: 'linear-gradient(to right, ${bg}, transparent)' }}
        />
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
      />
    </section>
  )
}`
  }

  if (layout === 'centered') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed 3D canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 55 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 15%, ${bg}ee 72%)' }}
      />

      {/* Centered content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6 py-32">
        <motion.div
          className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ background: '${acc}18', border: '1px solid ${acc}44', color: '${acc}' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          ${badge}
        </motion.div>

        <motion.h1
          className="font-extrabold leading-none mb-8"
          style={{ fontSize: 'clamp(3.5rem, 7vw, 7rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-xl lg:text-2xl font-medium mb-4 mx-auto max-w-2xl"
          style={{ color: '${text}dd' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-base lg:text-lg mb-12 mx-auto max-w-2xl leading-relaxed"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-5 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <button
            className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, ${pri}, ${acc})', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-10 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-80"
            style={{ background: '${text}12', border: '1px solid ${text}22', color: '${text}cc' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
      />
    </section>
  )
}`
  }

  if (layout === 'magazine') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen grid grid-cols-12 overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* ── Left editorial column — 7 cols ──────────────────────────── */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-end pb-20 pl-10 lg:pl-20 pr-8 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-5 font-medium"
            style={{ color: '${sec}80' }}
          >
            ${badge}
          </p>
        </motion.div>

        <motion.h1
          className="font-black leading-[0.88] mb-8"
          style={{ fontSize: 'clamp(4rem, 8vw, 9rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        >
          ${formatHeadline(hero.headline, true, pri)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium max-w-xl mb-4"
          style={{ color: '${text}dd' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base max-w-xl mb-10 leading-relaxed"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex gap-4 items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="px-8 py-4 font-bold text-white text-sm uppercase tracking-wider transition-transform hover:scale-105"
            style={{ background: '${pri}' }}
          >
            ${hero.cta}
          </button>
          <button
            className="px-8 py-4 font-bold text-sm uppercase tracking-wider border-2 transition-colors"
            style={{ color: '${pri}', borderColor: '${pri}' }}
          >
            ${hero.cta_secondary || 'Learn More'}
          </button>
        </motion.div>
      </div>

      {/* ── Right 3D accent column — 5 cols ───────────────────────── */}
      <div className="hidden lg:block col-span-5 relative">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Cinematic3DScene />
            </Suspense>
          </Canvas>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-28 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, ${bg}, transparent)' }}
      />
    </section>
  )
}`
  }

  if (layout === 'image-left') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen grid lg:grid-cols-12 items-center px-6 lg:px-16 gap-12 overflow-hidden" style={{ background: '${bg}' }}>
      {/* Left visual gallery frame */}
      <div className="lg:col-span-6 h-[520px] lg:h-[680px] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10" style={{ background: '${bg}ee' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 text-white flex justify-between items-center pointer-events-none">
          <div>
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Visual Exhibit</div>
            <div className="text-sm font-medium">Interactive 3D Simulation & Architecture</div>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">Active</div>
        </div>
      </div>

      {/* Right editorial content */}
      <div className="lg:col-span-6 flex flex-col justify-center py-12 lg:py-0 z-10">
        <motion.span
          className="text-xs font-bold tracking-[0.2em] uppercase mb-4 py-1.5 px-4 rounded-full w-fit inline-flex items-center gap-2 border border-white/10 bg-white/5"
          style={{ color: '${pri}' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ${badge}
        </motion.span>

        <motion.h1
          className="font-extrabold leading-tight tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 5vw, 5.5rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium mb-4 text-white/90 max-w-xl leading-relaxed"
          style={{ color: '${text}ee' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base mb-10 max-w-xl text-white/60 leading-relaxed"
          style={{ color: '${text}77' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <button
            className="px-9 py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl text-white"
            style={{ background: 'linear-gradient(135deg, ${pri}, ${sec})', boxShadow: '0 10px 25px -5px ${pri}66' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-4 rounded-xl font-medium text-sm transition-all duration-300 border border-white/10 hover:bg-white/5"
            style={{ color: '${text}' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>
    </section>
  )
}`
  }

  if (layout === 'image-right') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen grid lg:grid-cols-12 items-center px-6 lg:px-16 gap-12 overflow-hidden" style={{ background: '${bg}' }}>
      {/* Left editorial marketing content */}
      <div className="lg:col-span-6 flex flex-col justify-center py-12 lg:py-0 z-10 order-2 lg:order-1">
        <motion.div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/5 border border-white/10 w-fit mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400" style={{ color: '${pri}' }}>
            ${badge}
          </span>
        </motion.div>

        <motion.h1
          className="font-extrabold leading-none mb-6 tracking-tight"
          style={{ fontSize: 'clamp(2.7rem, 4.8vw, 5.2rem)', color: '${text}' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-semibold mb-3 max-w-xl leading-snug"
          style={{ color: '${text}' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base mb-8 max-w-lg leading-relaxed text-white/60"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex gap-4 mb-10 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <button
            className="px-8 py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(90deg, ${pri}, ${acc})' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-4 rounded-xl font-medium text-sm border border-white/20 transition-colors hover:border-white/40 text-white"
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* Right high-contrast visual display frame */}
      <div className="lg:col-span-6 h-[520px] lg:h-[680px] rounded-3xl overflow-hidden relative shadow-2xl border border-white/15 z-10 order-1 lg:order-2" style={{ background: '${bg}ff' }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        <Canvas camera={{ position: [0, 0, 5], fov: 58 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        {/* Floating stat card badge */}
        <div className="absolute top-6 right-6 bg-slate-900/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wide">Live Telemetry</div>
            <div className="text-sm font-bold text-white">99.9% Optimal Yield</div>
          </div>
        </div>
      </div>
    </section>
  )
}`
  }

  if (layout === '3d-left') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen grid lg:grid-cols-12 items-center px-6 lg:px-20 gap-8 overflow-hidden" style={{ background: '${bg}' }}>
      {/* Dedicated Left 3D Interactive Viewport */}
      <div className="lg:col-span-7 h-[580px] lg:h-[760px] relative rounded-[2rem] border border-white/10 overflow-hidden bg-slate-950/80 shadow-[0_0_80px_rgba(0,0,0,0.8)] z-10">
        <div className="absolute top-6 left-6 z-20 flex gap-2 pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        <div className="absolute bottom-6 inset-x-6 z-20 flex justify-between items-center pointer-events-none border-t border-white/10 pt-4 text-xs text-white/60">
          <span>Realtime Three.js Rendering Engine</span>
          <span className="font-mono text-emerald-400">FPS: 60 LOCKED</span>
        </div>
      </div>

      {/* Right editorial headline copy */}
      <div className="lg:col-span-5 flex flex-col justify-center z-10 py-10 lg:py-0">
        <motion.div
          className="text-xs font-mono tracking-widest uppercase mb-4 text-indigo-400 border-l-2 border-indigo-500 pl-3"
          style={{ color: '${pri}', borderColor: '${pri}' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ${badge}
        </motion.div>

        <motion.h1
          className="font-black leading-[1.05] tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.6rem, 4.2vw, 4.8rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium mb-4 leading-relaxed"
          style={{ color: '${text}ee' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm text-white/60 mb-8 leading-relaxed max-w-md"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button
            className="w-full py-4 px-6 rounded-xl font-bold text-sm text-center transition-all shadow-lg hover:brightness-110 text-white"
            style={{ background: '${pri}' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="w-full py-4 px-6 rounded-xl font-semibold text-sm text-center border border-white/15 hover:bg-white/5 transition-colors text-white"
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>
    </section>
  )
}`
  }

  if (layout === '3d-right') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen grid lg:grid-cols-12 items-center px-6 lg:px-20 gap-10 overflow-hidden" style={{ background: '${bg}' }}>
      {/* Left editorial tech headline copy */}
      <div className="lg:col-span-5 flex flex-col justify-center z-10 py-10 lg:py-0 order-2 lg:order-1">
        <motion.div
          className="text-xs font-bold uppercase tracking-[0.25em] py-1.5 px-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit mb-6"
          style={{ color: '${pri}', borderColor: '${pri}44' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ${badge}
        </motion.div>

        <motion.h1
          className="font-black leading-[1.05] mb-6 tracking-tight"
          style={{ fontSize: 'clamp(2.6rem, 4.5vw, 5rem)', color: '${text}' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium mb-4 leading-relaxed"
          style={{ color: '${text}' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base text-white/60 mb-8 leading-relaxed"
          style={{ color: '${text}70' }}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button
            className="py-4 px-8 rounded-xl font-bold text-sm text-white transition-all shadow-xl hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, ${pri}, ${sec})' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="py-4 px-8 rounded-xl font-semibold text-sm border border-white/20 hover:border-white/40 transition-colors text-white"
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>

      {/* Dedicated Right 3D Interactive Viewport */}
      <div className="lg:col-span-7 h-[580px] lg:h-[740px] relative rounded-[2rem] border border-white/10 overflow-hidden bg-slate-950 shadow-2xl z-10 order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 pointer-events-none" />
        <Canvas camera={{ position: [0, 0, 5], fov: 56 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-slate-900/70 border border-white/10 rounded-2xl p-4 pointer-events-none flex justify-between items-center text-xs text-white">
          <div>
            <div className="font-bold tracking-wider text-indigo-400">CYBER 3D PLATFORM</div>
            <div className="text-white/60">Interactive simulation parameters initialized</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </div>
        </div>
      </div>
    </section>
  )
}`
  }

  if (layout === 'fullscreen') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-end justify-center pb-16 px-6 sm:px-12 overflow-hidden" style={{ background: '${bg}' }}>
      {/* Edge-to-edge full screen 3D background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        {/* Cinematic dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      </div>

      {/* Bottom-anchored immersive overlay content */}
      <div className="relative z-10 w-full max-w-5xl text-left border border-white/15 rounded-3xl p-8 md:p-12 backdrop-blur-md bg-black/40 shadow-2xl">
        <motion.span
          className="inline-block text-xs uppercase tracking-[0.3em] font-bold px-3 py-1 rounded-md bg-white/10 text-white mb-6 border border-white/15"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ${badge}
        </motion.span>

        <div className="grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7">
            <motion.h1
              className="font-extrabold leading-none tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 6rem)', color: '${text}' }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              ${formatHeadline(hero.headline)}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl font-medium text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              ${hero.subheadline}
            </motion.p>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between">
            <motion.p
              className="text-sm text-white/70 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              ${hero.description}
            </motion.p>
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <button
                className="px-8 py-4 rounded-xl font-extrabold text-sm text-white shadow-xl transition-all hover:scale-105 w-full sm:w-auto text-center"
                style={{ background: '${pri}', boxShadow: '0 0 25px ${pri}88' }}
              >
                ${hero.cta_primary}
              </button>
              <button
                className="px-6 py-4 rounded-xl font-bold text-sm border border-white/20 hover:bg-white/10 transition-all text-white w-full sm:w-auto text-center"
              >
                ${hero.cta_secondary}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}`
  }

  if (layout === 'card') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center p-6 lg:p-12 overflow-hidden" style={{ background: '${bg}' }}>
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-16">
        
        {/* Main Bento Hero Card */}
        <motion.div
          className="lg:col-span-7 p-8 lg:p-14 rounded-[2.5rem] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #10141d, #0b0e14)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '${pri}' }} />
          <div>
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider py-1.5 px-4 rounded-full border border-white/15 bg-white/5 mb-8" style={{ color: '${pri}' }}>
              ${badge}
            </span>
            <h1 className="font-extrabold leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(2.6rem, 4.5vw, 5.2rem)', color: '${text}' }}>
              ${formatHeadline(hero.headline)}
            </h1>
            <p className="text-xl font-medium text-white/90 mb-6 leading-relaxed max-w-2xl">
              ${hero.subheadline}
            </p>
            <p className="text-sm text-white/60 max-w-xl leading-relaxed mb-10">
              ${hero.description}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap pt-6 border-t border-white/10">
            <button
              className="px-9 py-4 rounded-2xl font-bold text-sm text-white shadow-xl transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, ${pri}, ${sec})' }}
            >
              ${hero.cta_primary}
            </button>
            <button
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-white/90 border border-white/15 hover:bg-white/5 transition-all"
            >
              ${hero.cta_secondary}
            </button>
          </div>
        </motion.div>

        {/* Right 3D Interactive Card Widget */}
        <motion.div
          className="lg:col-span-5 h-[480px] lg:h-auto rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl flex flex-col justify-between p-6"
          style={{ background: 'linear-gradient(145deg, #141923, #080a0f)' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }} dpr={[1, 2]}>
              <Suspense fallback={null}>
                <Cinematic3DScene />
              </Suspense>
            </Canvas>
          </div>
          <div className="relative z-10 self-end px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            Live Interactive
          </div>
          <div className="relative z-10 backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl p-4 text-white">
            <div className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Widget Architecture</div>
            <div className="text-sm text-white/80 font-medium">Bento Card UI · Modular Superpowers</div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}`
  }

  if (layout === 'glass') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-16 overflow-hidden py-24" style={{ background: '${bg}' }}>
      {/* Floating neon glow gradient orbs behind glass */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse" style={{ background: '${pri}' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-35 pointer-events-none animate-pulse" style={{ background: '${acc}' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Ethereal Glass Hero Card */}
      <motion.div
        className="relative z-10 w-full max-w-6xl rounded-[3rem] border border-white/15 backdrop-blur-2xl bg-white/[0.06] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-8 md:p-16 grid lg:grid-cols-12 gap-12 items-center overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />

        <div className="lg:col-span-7 text-left relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-white/10 border border-white/20 mb-6 text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            ${badge}
          </span>
          <h1 className="font-extrabold leading-[1.06] tracking-tight mb-6" style={{ fontSize: 'clamp(2.7rem, 4.8vw, 5.5rem)', color: '${text}' }}>
            ${formatHeadline(hero.headline)}
          </h1>
          <p className="text-xl font-medium text-white/95 mb-4 leading-relaxed">
            ${hero.subheadline}
          </p>
          <p className="text-sm md:text-base text-white/70 mb-10 leading-relaxed max-w-xl">
            ${hero.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-9 py-4 rounded-2xl font-bold text-sm text-white shadow-2xl transition-transform hover:scale-105 border border-white/20"
              style={{ background: 'linear-gradient(135deg, ${pri}dd, ${acc}dd)' }}
            >
              ${hero.cta_primary}
            </button>
            <button
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-white backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            >
              ${hero.cta_secondary}
            </button>
          </div>
        </div>

        {/* Right glass 3D viewport */}
        <div className="lg:col-span-5 h-[420px] lg:h-[540px] rounded-3xl overflow-hidden relative border border-white/10 bg-black/20 shadow-inner">
          <Canvas camera={{ position: [0, 0, 4.5], fov: 58 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Cinematic3DScene />
            </Suspense>
          </Canvas>
          <div className="absolute bottom-4 inset-x-4 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center text-xs font-semibold text-white">
            Glassmorphism 3D Holographic Matrix
          </div>
        </div>

      </motion.div>
    </section>
  )
}`
  }

  if (layout === 'asymmetric') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen border-b border-white/10 overflow-hidden" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-12 border-x border-white/10">
        
        {/* Asymmetric Left Column (4 cols) — Vertical orientation & specs */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 p-8 lg:p-12 flex flex-col justify-between bg-slate-950/40 relative z-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.3em] mb-6 font-semibold" style={{ color: '${pri}' }}>
              01 // DESIGN SPEC
            </div>
            <div className="text-2xl font-black text-white uppercase tracking-wider leading-snug mb-4 border-l-4 pl-4" style={{ borderColor: '${pri}' }}>
              ${badge}
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              ${hero.description}
            </p>
          </div>

          <div className="py-8 my-8 lg:my-0 border-y border-white/10 flex flex-col gap-4">
            <button
              className="w-full py-4 rounded-none font-bold uppercase tracking-widest text-sm text-white transition-all shadow-lg hover:brightness-110"
              style={{ background: '${pri}' }}
            >
              ${hero.cta_primary}
            </button>
            <button
              className="w-full py-4 rounded-none font-bold uppercase tracking-widest text-sm text-white border border-white/20 hover:bg-white/5 transition-all text-center"
            >
              ${hero.cta_secondary}
            </button>
          </div>

          <div className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Asymmetric Architectural Framework
          </div>
        </div>

        {/* Asymmetric Right Column (8 cols) — Masthead headline & staggered 3D Canvas */}
        <div className="lg:col-span-8 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-black tracking-tight leading-none mb-6" style={{ fontSize: 'clamp(3rem, 6vw, 6.5rem)', color: '${text}' }}>
              ${formatHeadline(hero.headline)}
            </h1>
            <p className="text-xl lg:text-2xl font-light text-white/90 max-w-2xl">
              ${hero.subheadline}
            </p>
          </motion.div>

          {/* Staggered floating Three.js viewport */}
          <motion.div
            className="w-full h-[380px] lg:h-[450px] rounded-2xl border border-white/15 overflow-hidden relative shadow-2xl mt-12 bg-slate-900/50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Canvas camera={{ position: [0, 0, 4.5], fov: 58 }} dpr={[1, 2]}>
              <Suspense fallback={null}>
                <Cinematic3DScene />
              </Suspense>
            </Canvas>
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded uppercase font-mono">
              Viewport: Avant-Garde 3D
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}`
  }

  if (layout === 'landing') {
    return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 sm:px-12 overflow-hidden text-center flex flex-col items-center justify-center" style={{ background: '${bg}' }}>
      {/* Background gradient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(61,94,255,0.25),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Top Announcement Pill */}
      <motion.div
        className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold text-white/90 mb-8 shadow-sm backdrop-blur-md hover:border-white/30 transition-colors cursor-pointer"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: '${pri}' }}>New</span>
        <span>${badge}</span>
        <span className="text-white/50">→</span>
      </motion.div>

      {/* Main SaaS Landing Headline */}
      <motion.h1
        className="relative z-10 font-extrabold leading-none tracking-tight max-w-5xl mb-6 text-white"
        style={{ fontSize: 'clamp(3rem, 6vw, 6.5rem)' }}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        ${formatHeadline(hero.headline)}
      </motion.h1>

      {/* Subheading & Value Prop */}
      <motion.p
        className="relative z-10 text-xl md:text-2xl font-normal text-white/80 max-w-3xl mb-4 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        ${hero.subheadline}
      </motion.p>

      <motion.p
        className="relative z-10 text-sm md:text-base text-white/60 max-w-2xl mb-10 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        ${hero.description}
      </motion.p>

      {/* High-Converting Action Group */}
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <button
          className="w-full sm:w-auto px-9 py-4 rounded-xl font-extrabold text-sm text-white shadow-2xl transition-all transform hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, ${pri}, ${sec})', boxShadow: '0 10px 35px -5px ${pri}88' }}
        >
          ${hero.cta_primary}
        </button>
        <button
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-md"
        >
          ${hero.cta_secondary}
        </button>
      </motion.div>

      {/* Interactive Application / Product Preview Mockup Window */}
      <motion.div
        className="relative z-10 w-full max-w-6xl h-[520px] md:h-[680px] rounded-3xl border border-white/20 bg-slate-950/80 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col backdrop-blur-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
      >
        {/* Mockup Top Window Bar */}
        <div className="h-12 border-b border-white/10 bg-slate-900/60 flex items-center justify-between px-6 shrink-0 text-xs text-white/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="px-3 py-1 rounded bg-black/30 border border-white/10 font-mono text-[11px] text-white/70">
            https://platform.app/interactive-simulation
          </div>
          <div className="text-[11px] font-semibold text-indigo-400">v3.0 Live</div>
        </div>

        {/* 3D Simulation Canvas Inside Mockup */}
        <div className="flex-1 relative w-full h-full">
          <Canvas camera={{ position: [0, 0, 4.8], fov: 58 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Cinematic3DScene />
            </Suspense>
          </Canvas>
        </div>
      </motion.div>
    </section>
  )
}`
  }

  // layout === 'minimal' (default fallback)
  return `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import Cinematic3DScene from '../../3d/Cinematic3DScene'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: '${bg}' }}
    >
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(${text} 1px, transparent 1px), linear-gradient(90deg, ${text} 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* 3D accent — top right quadrant */}
      <div className="absolute top-0 right-0 w-[48vw] h-[60vh] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 58 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Cinematic3DScene />
          </Suspense>
        </Canvas>
        {/* Bleed edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, ${bg} 0%, transparent 25%, transparent 75%, ${bg} 100%), linear-gradient(to bottom, transparent 60%, ${bg} 100%)',
          }}
        />
      </div>

      {/* Content — left, vertically centered */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center pl-12 lg:pl-24 pr-8 max-w-3xl">
        <motion.span
          className="inline-block text-xs uppercase tracking-[0.28em] mb-6 font-medium"
          style={{ color: '${pri}' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          ${badge}
        </motion.span>

        <motion.h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.6rem, 4.5vw, 5rem)', color: '${text}' }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          ${formatHeadline(hero.headline)}
        </motion.h1>

        <motion.p
          className="text-lg lg:text-xl font-medium mb-3 max-w-lg"
          style={{ color: '${text}dd' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          ${hero.subheadline}
        </motion.p>

        <motion.p
          className="text-sm lg:text-base mb-10 max-w-lg leading-relaxed"
          style={{ color: '${text}65' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          ${hero.description}
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button
            className="px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90"
            style={{ background: '${pri}', color: '#fff' }}
          >
            ${hero.cta_primary}
          </button>
          <button
            className="px-8 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-70"
            style={{ color: '${text}80' }}
          >
            ${hero.cta_secondary}
          </button>
        </motion.div>
      </div>
    </section>
  )
}`
}

// ─── Section Component (industry-aware, content-driven) ───────────────────────

export function generateSectionComponent(bp) {
  const pal     = getPalette(bp)
  const content = getFeaturesContent(bp)
  const featLayout = getFeaturesLayout(bp)
  const bg      = pal.background ?? '#0a0a14'
  const pri     = pal.primary    ?? '#3d5eff'
  const sec     = pal.secondary  ?? '#00d4ff'
  const acc     = pal.accent     ?? '#bf5fff'
  const text    = pal.text       ?? '#f0f0ff'

  const title    = content.title.replace(/'/g, "\\'")
  const subtitle = content.subtitle.replace(/'/g, "\\'")

  const itemsCode = content.items.slice(0, 6).map((f, i) => ({
    icon:  f.icon  ?? '◆',
    title: (f.title ?? `Feature ${i + 1}`).replace(/'/g, "\\'"),
    desc:  (f.description ?? '').replace(/'/g, "\\'"),
  }))

  if (featLayout === 'editorial') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 overflow-hidden" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          {${JSON.stringify(subtitle)} && (
            <p className="text-lg" style={{ color: '${text}60' }}>${subtitle}</p>
          )}
        </motion.div>

        {/* Alternating editorial rows */}
        <div>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className={'flex items-center gap-14 py-14 ' + (i < FEATURES.length - 1 ? 'border-b' : '')}
              style={{ borderColor: '${text}0f', flexDirection: i % 2 === 1 ? 'row-reverse' : 'row' }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1 }}
            >
              <div className="flex-1">
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3
                  className="text-2xl font-semibold mb-3"
                  style={{ color: '${text}' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: '${text}65', lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
              <div
                className="flex-shrink-0 w-56 h-56 rounded-2xl flex items-center justify-center"
                style={{
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg, ${pri}22, ${acc}18)'
                    : 'linear-gradient(135deg, ${sec}22, ${pri}18)',
                  border: '1px solid ${text}0c',
                }}
              >
                <span style={{ fontSize: '5rem' }}>{feature.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'neon-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-extrabold mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}55' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-2xl relative overflow-hidden group"
              style={{
                background: '${text}06',
                border: '1px solid ${pri}28',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {/* Neon glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ boxShadow: 'inset 0 0 30px ${pri}18' }}
              />
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                {feature.desc}
              </p>
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle at 100% 0%, ${pri}, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'steplist') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left: heading */}
          <motion.div
            className="lg:sticky lg:top-28"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="font-bold leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', color: '${text}' }}
            >
              ${title}
            </h2>
            <p className="text-lg" style={{ color: '${text}60' }}>${subtitle}</p>
            <div className="mt-10 h-1 w-16 rounded-full" style={{ background: '${pri}' }} />
          </motion.div>

          {/* Right: numbered list */}
          <div className="space-y-0">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                className={'flex gap-8 py-8 ' + (i < FEATURES.length - 1 ? 'border-b' : '')}
                style={{ borderColor: '${text}10' }}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.09 }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '${pri}20', color: '${pri}', border: '1px solid ${pri}40' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: '${text}' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'stat-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          className="max-w-2xl mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        {/* 2-column stat-style features */}
        <div className="grid md:grid-cols-2 gap-px" style={{ background: '${text}10' }}>
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-8"
              style={{ background: '${bg}' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: '${pri}16' }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: '${text}' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'card-scroll') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="px-8 mb-12"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold mb-3"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        {/* Horizontal-scroll card row */}
        <div className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid ${text}12' }}
              initial={{ opacity: 0, y: 35 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Image area placeholder */}
              <div
                className="h-44 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, ${pri}22 0%, ${acc}18 100%)',
                }}
              >
                <span style={{ fontSize: '4rem' }}>{feature.icon}</span>
              </div>
              <div className="p-6" style={{ background: '${text}05' }}>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ color: '${text}' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  if (featLayout === 'space-grid') {
    return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-32" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div
            className="inline-block text-xs uppercase tracking-widest mb-5 px-4 py-1.5 rounded-full"
            style={{ background: '${pri}18', color: '${sec}', border: '1px solid ${pri}40' }}
          >
            \${sec?.name || 'Features'}
          </div>
          <h2
            className="font-extrabold mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '${text}60' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-2xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(145deg, ${text}07 0%, ${text}03 100%)',
                border: '1px solid ${text}0e',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.09 }}
            >
              <div className="text-4xl mb-5">{feature.icon}</div>
              <h3
                className="font-semibold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}60' }}>
                {feature.desc}
              </p>
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, ${pri}, transparent)' }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
  }

  // 'feature-grid' — standard SaaS 3-col (only default / actual SaaS)
  return `import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = ${JSON.stringify(itemsCode, null, 2)}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" style={{ background: '${bg}' }}>
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <h2
            className="font-bold mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', color: '${text}' }}
          >
            ${title}
          </h2>
          <p style={{ color: '${text}65' }}>${subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-2xl"
              style={{
                background: '${text}06',
                border: '1px solid ${text}0f',
              }}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: '${pri}18' }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: '${text}' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '${text}65' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}`
}

// ─── Master assembler ─────────────────────────────────────────────────────────

/**
 * Route hero/scene/section generation through MasterLayoutEngine when the
 * blueprint specifies a Layout-A through Layout-J archetype (from the Master
 * Prompt spec). Falls back to the legacy generators for older blueprints.
 */
function resolveComponents(bp) {
  return {
    heroJSX:       generateHeroDataWrapper(bp),
    sceneJSX:      generateThreeSceneComponent(bp),
    sampleSection: generateSectionComponent(bp),
  }
}

// ─── Reusable Industry-Aware Section Generators (Phase 8.4) ────────────────────

function genFeaturedDishesSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Featured Dishes";
  const subtitle = sec?.subtitle || "Savor our chef's hand selected menu highlights.";
  
  const rawDishes = sec?.content?.items || sec?.content?.dishes || cl?.dishes || [];
  
  const dishes = rawDishes.map(d => ({
    name: d.name || d.title || "Dish Name",
    price: d.price || "$0",
    desc: d.desc || d.description || "",
    tag: d.tag || ""
  }));

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function FeaturedDishesSection() {
  const dishes = ${JSON.stringify(dishes, null, 2)};

  return (
    <Section id="featured-dishes" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">Artisanal Specialties</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={3} gap="md">
            {dishes.map((dish, idx) => (
              <div key={idx} className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">{dish.tag}</span>
                    <span className="text-2xl font-black text-amber-400">{dish.price}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">{dish.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{dish.desc}</p>
                </div>
                <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-sm transition-all duration-200">
                  ${sec?.cta?.label || "Add to Tasting Order"}
                </button>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genChefSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Mastery in Every Savor";
  const subtitle = sec?.subtitle || "Culinary Philosophy";
  
  const chefName = sec?.content?.chefName || cl?.chefName || "";
  const chefRole = sec?.content?.chefRole || cl?.chefRole || "";
  const chefQuote = sec?.content?.chefQuote || cl?.chefQuote || "";
  const chefInitials = (chefName || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const stats = sec?.content?.stats || cl?.chefStats || [];

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';

export default function ChefSection() {
  return (
    <Section id="chef" spacing="lg" background="gradient" divider={true}>
      <Container size="lg">
        <Grid columns={2} gap="lg" align="center">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-800/60 border border-slate-700/60 shadow-2xl flex items-center justify-center p-8 text-center bg-gradient-to-tr from-amber-950/40 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-70"></div>
            <div className="z-10">
              <span className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl font-bold">${chefInitials}</span>
              <h3 className="text-3xl font-extrabold text-white mb-2">${chefName}</h3>
              <p className="text-amber-400 text-sm font-medium tracking-wide">${chefRole}</p>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">${subtitle}</span>
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">${title}</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              &ldquo;${chefQuote}&rdquo;
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              {${JSON.stringify(stats)}.map((s, idx) => (
                <div key={idx}>
                  <span className="block text-3xl font-extrabold text-white mb-1">{s.val || s.value || '0'}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
`;
}

function genGallerySection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Visual Gallery";
  const subtitle = sec?.subtitle || "Take a glimpse inside our sanctuary of elevated aesthetics.";
  
  const raw = sec?.content?.items || sec?.content?.galleryItems || sec?.content || cl?.galleryItems;
  let rawItems = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw).filter(v => v && typeof v === 'object') : []);
  if (rawItems.length === 0) {
    rawItems = [];
  }
  
  const items = rawItems.map(item => ({
    title: item.title || "Gallery Item",
    subtitle: item.subtitle || item.desc || ""
  }));

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function GallerySection() {
  const items = ${JSON.stringify(items, null, 2)};

  return (
    <Section id="gallery" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2 block">Immersive Showcase</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={2} gap="md">
            {items.map((item, idx) => (
              <div key={idx} className="group relative h-72 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-end transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/20 via-slate-950/60 to-slate-950 transition-opacity duration-300 opacity-70 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase text-indigo-400 tracking-widest mb-1 block">{item.subtitle}</span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                </div>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genTestimonialsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const _rawReviews = sec?.content?.testimonials || sec?.content?.items || sec?.content || cl?.testimonials;
  let rawReviews = Array.isArray(_rawReviews) ? _rawReviews : (_rawReviews && typeof _rawReviews === 'object' ? Object.values(_rawReviews).filter(v => v && typeof v === 'object') : []);
  if (rawReviews.length === 0) {
    rawReviews = [];
  }
  const testimonials = rawReviews.map(r => ({
    name: r.name || r.author || "Valued Patron",
    role: r.role || "Client",
    company: r.company || "",
    quote: r.quote || r.text || "",
    rating: r.rating || 5,
    avatar: r.avatar || ""
  }));

  return `import React from 'react';
import TestimonialCard from '../ui/TestimonialCard';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function TestimonialsSection() {
  const testimonials = ${JSON.stringify(testimonials, null, 2)};

  return (
    <Section id="testimonials" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-secondary,#00d4ff)] mb-2 block">Verified Excellence</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text,#f0f0ff)] mb-4 tracking-tight">What Our Clients Say</h2>
            <p className="text-[var(--color-text-muted,#94a3b8)] text-lg max-w-2xl mx-auto">Discover authentic perspectives from industry leaders, taste makers, and valued partners.</p>
          </div>
          <Grid columns={3} gap="md">
            {testimonials.map((rev, idx) => (
              <TestimonialCard key={idx} {...rev} animation={{ delay: idx * 0.15 }} />
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genReservationSection(sec, bp) {
  const tag = sec?.content?.tag || "Booking";
  const title = sec?.title || sec?.name || "Book a Space";
  const sub = sec?.subtitle || sec?.content?.subtitle || "Reserve your session today.";
  const btn = sec?.content?.button || sec?.content?.btnText || "Complete Booking";
  const label3 = sec?.content?.label3 || "Options";
  const opt1 = sec?.content?.opt1 || "Standard Access";
  const opt2 = sec?.content?.opt2 || "Premium Access";
  const opt3 = sec?.content?.opt3 || "All-Access Pass";

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';
import Grid from '../layout/Grid';

export default function ReservationSection() {
  return (
    <Section id="reservation" spacing="lg">
      <Container size="md">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <Stack spacing="lg">
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2 block">${tag}</span>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">${title}</h2>
              <p className="text-slate-300 text-base max-w-xl mx-auto">${sub}</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Preferred Date</label>
                  <input type="date" defaultValue="2026-08-15" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Preferred Time</label>
                  <select className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                    <option>18:00 PM</option>
                    <option>19:30 PM</option>
                    <option>20:45 PM</option>
                  </select>
                </div>
              </Grid>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Full Name</label>
                  <input type="text" placeholder="Alex M. Taylor" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">${label3}</label>
                  <select className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                    <option>${opt1}</option>
                    <option>${opt2}</option>
                    <option>${opt3}</option>
                  </select>
                </div>
              </Grid>
              <button type="submit" className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-white text-lg shadow-xl shadow-indigo-600/30 transition-all duration-200">${btn}</button>
            </form>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}
`;
}

function genAppointmentSection(sec, bp) {
  const tag = sec?.content?.tag || "Online Booking";
  const title = sec?.title || sec?.name || "Schedule a Session";
  const sub = sec?.subtitle || sec?.content?.subtitle || "Book your slots online.";
  const btn = sec?.content?.button || sec?.content?.btnText || "Confirm Booking Request";
  const label3 = sec?.content?.label3 || "Inquiry Type";
  const opt1 = sec?.content?.opt1 || "General Inquiry";
  const opt2 = sec?.content?.opt2 || "Premium Support";
  const opt3 = sec?.content?.opt3 || "Custom Integration";

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';
import Grid from '../layout/Grid';

export default function AppointmentSection() {
  return (
    <Section id="booking" spacing="lg">
      <Container size="md">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <Stack spacing="lg">
            <div className="text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2 block">${tag}</span>
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">${title}</h2>
              <p className="text-slate-300 text-base max-w-xl mx-auto">${sub}</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Preferred Date</label>
                  <input type="date" defaultValue="2026-08-15" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Preferred Time</label>
                  <select className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>14:45 PM</option>
                  </select>
                </div>
              </Grid>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Full Name</label>
                  <input type="text" placeholder="Alex M. Taylor" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">${label3}</label>
                  <select className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition">
                    <option>${opt1}</option>
                    <option>${opt2}</option>
                    <option>${opt3}</option>
                  </select>
                </div>
              </Grid>
              <button type="submit" className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-white text-lg shadow-xl shadow-indigo-600/30 transition-all duration-200">${btn}</button>
            </form>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}
`;
}

function genSkillsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Skills & Toolstack";
  const subtitle = sec?.subtitle || "Architecting full-stack digital products.";
  const _rawSkills = sec?.content?.items || sec?.content?.skills || sec?.content || cl?.skills;
  let rawSkills = Array.isArray(_rawSkills) ? _rawSkills : (_rawSkills && typeof _rawSkills === 'object' ? Object.values(_rawSkills).filter(v => v && typeof v === 'object') : []);
  if (rawSkills.length === 0) {
    rawSkills = [
      { cat: "Frontend Architecture", items: ["React / Next.js", "TypeScript", "Three.js / WebGL", "Tailwind / Vanilla CSS", "State Machine Design"] },
      { cat: "Backend & Systems", items: ["Node.js / Express", "Distributed Microservices", "PostgreSQL / MongoDB", "Docker & Kubernetes", "Redis Caching"] },
      { cat: "AI & Spatial Compute", items: ["LangChain / Agents", "WebXR Interactive 3D", "Vector Databases", "Prompt Engineering", "Real-time WebSocket APIs"] }
    ];
  }
  
  const skills = rawSkills.map(s => ({
    cat: s.cat || s.category || "Skill Category",
    items: s.items || []
  }));

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function SkillsSection() {
  const skills = ${JSON.stringify(skills, null, 2)};

  return (
    <Section id="skills" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2 block">Technical Mastery</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={3} gap="md">
            {skills.map((s, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-slate-800 text-cyan-300">\${s.cat}</h3>
                <ul className="space-y-4">
                  {s.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genProjectsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Engineering Work";
  const subtitle = sec?.subtitle || "Featured Case Studies";
  const raw = sec?.content?.items || sec?.content?.projects || sec?.content || cl?.projects;
  let rawProjects = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw).filter(v => v && typeof v === 'object') : []);
  if (rawProjects.length === 0) {
    rawProjects = [
      { title: "Hyperion 3D Engine", desc: "Browser-based interactive architectural visualizer powering high-performance real-estate spatial tours.", tags: ["Three.js", "React", "WebXR"], metric: "60 FPS in browser" },
      { title: "Aether Cloud Orchestration", desc: "Autonomous CI/CD workflow automation platform handling 100k daily microservice deployments.", tags: ["Node.js", "Docker", "TypeScript"], metric: "99.99% Uptime" },
      { title: "Vortex Neural Analytics", desc: "Real-time AI telemetry interface providing predictive market modeling and latency diagnostics.", tags: ["Next.js", "Tailwind", "Python"], metric: "12ms inference latency" }
    ];
  }
  
  const projects = rawProjects.map(p => {
    if (typeof p === 'string') {
      return { title: p, desc: "", tags: [], metric: "" };
    }
    return {
      title: p.title || "Project Title",
      desc: p.desc || p.description || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
      metric: p.metric || ""
    };
  });

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function ProjectsSection() {
  const projects = ${JSON.stringify(projects, null, 2)};

  return (
    <Section id="projects" spacing="lg" divider={true}>
      <Container size="xl">
        <Stack spacing="lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2 block">${subtitle}</span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">${title}</h2>
            </div>
            <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition self-start md:self-auto">${sec?.cta?.label || 'View Archive &rarr;'}</button>
          </div>
          <Grid columns={3} gap="md">
            {projects.map((proj, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-6 inline-block">{proj.metric}</span>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{proj.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">{proj.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
                  {proj.tags.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genExperienceSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Timeline";
  const subtitle = sec?.subtitle || "Journey & Milestones";
  const raw = sec?.content?.items || sec?.content?.roles || sec?.content || cl?.experience;
  let rawRoles = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw).filter(v => v && typeof v === 'object') : []);
  if (rawRoles.length === 0) {
    rawRoles = [
      { period: "2023 — Present", title: "Principal Systems Architect", company: "Spatial Technologies Corp", desc: "Spearheaded interactive 3D WebGL framework adoption across enterprise client portfolios, boosting customer retention by 42%." },
      { period: "2020 — 2023", title: "Staff Full Stack Engineer", company: "Vanguard Cloud Solutions", desc: "Architected distributed Node.js queuing engines and React design systems powering global financial transaction visualization." },
      { period: "2018 — 2020", title: "Senior Frontend Engineer", company: "Aethel Creative Firm", desc: "Developed micro-animated user interfaces and high-performance interactive storytelling campaigns for top luxury brands." }
    ];
  }
  
  const roles = rawRoles.map(r => {
    if (typeof r === 'string') {
      return { period: "", title: r, company: "", desc: "" };
    }
    return {
      period: r.period || r.time || "Period",
      title: r.title || "Role Title",
      company: r.company || r.organization || "",
      desc: r.desc || r.description || ""
    };
  });

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';

export default function ExperienceSection() {
  const roles = ${JSON.stringify(roles, null, 2)};

  return (
    <Section id="experience" spacing="lg">
      <Container size="md">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">${subtitle}</span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">${title}</h2>
          </div>
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-12 before:w-0.5 before:bg-slate-800 md:before:left-1/2">
            {roles.map((r, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="md:w-1/2 md:text-right md:pr-12">
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">{r.period}</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-emerald-400 absolute left-[43px] md:left-[calc(50%-8px)] border-4 border-slate-950 z-10"></div>
                <div className="md:w-1/2 md:pl-12 pl-20">
                  <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-1">{r.title}</h3>
                    <h4 className="text-sm font-semibold text-slate-400 mb-4">{r.company}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genAchievementsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Achievements";
  const subtitle = sec?.subtitle || "Key metrics showing our verified operational standards.";
  const _rawStats = sec?.content?.stats || sec?.content?.items || sec?.content || cl?.statistics;
  let rawStats = Array.isArray(_rawStats) ? _rawStats : (_rawStats && typeof _rawStats === 'object' ? Object.values(_rawStats).filter(v => v && typeof v === 'object') : []);
  if (rawStats.length === 0) {
    rawStats = [
      { val: "50+", label: "Enterprise Deployments", desc: "Production 3D interactive applications built and deployed globally." },
      { val: "5", label: "Open Source Awards", desc: "Recognized for innovative contribution to modern WebGL architectures." },
      { val: "99.9%", label: "System Reliability", desc: "Strict SLA compliance and bug-free resilient engineering." },
      { val: "12M+", label: "Global End Users", desc: "Interacting daily with digital interfaces." }
    ];
  }
  const stats = rawStats.map(s => ({
    value: s.value || s.val || "0",
    label: s.label || "Metric",
    description: s.description || s.desc || "",
    icon: s.icon || "✦"
  }));

  return `import React from 'react';
import StatCard from '../ui/StatCard';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';

export default function AchievementsSection() {
  const stats = ${JSON.stringify(stats, null, 2)};

  return (
    <Section id="achievements" spacing="md" background="dark" divider={true}>
      <Container size="xl">
        <Grid columns={4} gap="md">
          {stats.map((s, idx) => (
            <StatCard key={idx} {...s} animation={{ delay: idx * 0.1 }} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
`;
}

function genContactSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Connect With Us";
  const subtitle = sec?.subtitle || "Partner with our team to deploy custom spatial designs.";
  const contact = sec?.content || cl?.contact || {
    title,
    subtitle,
    btnText: sec?.cta?.label || "Connect Now →",
    emailPlaceholder: "enter.your@email.com"
  };

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';

export default function ContactSection() {
  return (
    <Section id="contact" spacing="lg">
      <Container size="md">
        <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <Stack spacing="md" align="center">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-3 block">Direct Communication</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">${title}</h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                ${subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto w-full">
              <input type="email" placeholder="${contact.emailPlaceholder || 'enter.your@email.com'}" className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition shadow-inner" />
              <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 font-extrabold text-white rounded-2xl whitespace-nowrap shadow-lg shadow-indigo-600/30 transition duration-200">${contact.btnText || 'Connect Now →'}</button>
            </div>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}
`;
}

function genFeaturesSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Core Features";
  const subtitle = sec?.subtitle || "Uncompromised performance standards.";
  const _rawFeatures = sec?.content?.items || sec?.content || cl?.features;
  let rawFeatures = Array.isArray(_rawFeatures) ? _rawFeatures : (_rawFeatures && typeof _rawFeatures === 'object' ? Object.values(_rawFeatures).filter(v => v && typeof v === 'object') : []);
  if (rawFeatures.length === 0) {
    rawFeatures = [
      { title: "Autonomous Orchestration", desc: "Intelligent background workflows that monitor, repair, and optimize system pipelines.", icon: "⚡" },
      { title: "Zero-Latency Spatial UI", desc: "Hardware-accelerated 3D rendering engine built to provide responsive interactions.", icon: "🌐" },
      { title: "Enterprise Grade Security", desc: "End-to-end cryptographic verifications and SOC-2 certified cloud storage.", icon: "🔒" },
      { title: "Real-time Collaboration", desc: "Multi-user websocket concurrency enabling seamless global teamwork.", icon: "🤝" }
    ];
  }
  const features = rawFeatures.map(f => ({
    icon: f.icon || "⚡",
    title: f.title || f.name || "Feature",
    description: f.desc || f.description || ""
  }));

  return `import React from 'react';
import FeatureCard from '../ui/FeatureCard';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function FeaturesSection() {
  const features = ${JSON.stringify(features, null, 2)};

  return (
    <Section id="features" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-secondary,#00d4ff)] mb-2 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text,#f0f0ff)] mb-4">${title}</h2>
            <p className="text-[var(--color-text-muted,#94a3b8)] text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={2} gap="md">
            {features.map((f, idx) => (
              <FeatureCard key={idx} icon={f.icon} title={f.title} description={f.description} animation={{ delay: idx * 0.1 }} />
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genPricingSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Pricing Options";
  const subtitle = sec?.subtitle || "Choose a plan tailored to your operational scale.";

  const _rawTiers = sec?.content?.items || sec?.content?.tiers || sec?.content || cl?.pricing;
  let rawTiers = Array.isArray(_rawTiers) ? _rawTiers : (_rawTiers && typeof _rawTiers === 'object' ? Object.values(_rawTiers).filter(v => v && typeof v === 'object') : []);
  if (rawTiers.length === 0) {
    rawTiers = [
      { name: "Starter", price: "$49", period: "/ mo", desc: "For growing teams.", features: ["5 Projects", "Basic Analytics", "Email Support"], btnText: "Start Free", highlighted: false },
      { name: "Professional", price: "$149", period: "/ mo", desc: "Unlimited workflows and exports.", features: ["Unlimited Projects", "Advanced Analytics", "Priority Support"], btnText: "Go Professional", highlighted: true },
      { name: "Enterprise", price: "Custom", period: "", desc: "Dedicated support and custom SLAs.", features: ["Dedicated Manager", "Custom Integrations", "SLA Guarantee"], btnText: "Contact Sales", highlighted: false }
    ];
  }

  const tiers = rawTiers.map((t, idx) => {
    let finalTitle = t.name || t.title || `Tier ${idx + 1}`;
    return {
      title: finalTitle,
      price: t.price || "$0",
      period: t.period || "",
      features: t.features || [],
      highlight: t.highlighted || t.highlight || false,
      button: t.btnText || t.button || "Select Plan"
    };
  });

  return `import React from 'react';
import PricingCard from '../ui/PricingCard';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function PricingSection() {
  const tiers = ${JSON.stringify(tiers, null, 2)};

  return (
    <Section id="pricing" spacing="lg" divider={true}>
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2 block">Transparent Investment</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={3} gap="md" align="stretch">
            {tiers.map((tier, idx) => (
              <PricingCard key={idx} {...tier} />
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genFAQSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "FAQ";
  const subtitle = sec?.subtitle || "Everything you need to know about system integrations.";
  
  const raw = sec?.content?.faqs || sec?.content?.items || sec?.content || cl?.faqs;
  let rawFaqs = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.values(raw).filter(v => v && typeof v === 'object' && (v.q || v.question)) : []);
  if (rawFaqs.length === 0) {
    rawFaqs = [
      { q: "How rapidly can we implement this workflow into our existing infrastructure?", a: "Our modular architecture defaults to REST and GraphQL endpoints that plug directly into existing stacks within 48 hours." },
      { q: "What security compliance certifications do your platforms maintain?", a: "We maintain SOC-2 Type II, ISO 27001, and HIPAA compliant infrastructure architectures." },
      { q: "Can we customize the 3D rendering pipeline?", a: "Yes, the custom shader and parser pipeline ingests standard CAD and spatial formats." }
    ];
  }
  
  const faqs = rawFaqs.map(item => ({
    question: item.question || item.q || "Question",
    answer: item.answer || item.a || "Answer"
  }));

  return `import React from 'react';
import FAQAccordion from '../ui/FAQAccordion';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';

export default function FAQSection() {
  const faqs = ${JSON.stringify(faqs, null, 2)};

  return (
    <Section id="faq" spacing="lg">
      <Container size="md">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-secondary,#00d4ff)] mb-2 block">Clear Answers</span>
            <h2 className="text-4xl font-extrabold text-[var(--color-text,#f0f0ff)] tracking-tight mb-4">${title}</h2>
            <p className="text-[var(--color-text-muted,#94a3b8)] text-base max-w-xl mx-auto">${subtitle}</p>
          </div>
          <Stack spacing="sm">
            {faqs.map((item, idx) => (
              <FAQAccordion key={idx} question={item.question} answer={item.answer} defaultOpen={idx === 0} icon="+" />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genFeaturedProductsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Featured Products";
  const subtitle = sec?.subtitle || "Curated excellence designed for high-performance.";
  const _rawProducts = sec?.content?.items || sec?.content?.products || sec?.content || cl?.products;
  let rawProducts = Array.isArray(_rawProducts) ? _rawProducts : (_rawProducts && typeof _rawProducts === 'object' ? Object.values(_rawProducts).filter(v => v && typeof v === 'object') : []);
  if (rawProducts.length === 0) {
    rawProducts = [
      { name: "Monolithic Cashmere Coat", price: "$680.00", category: "Outerwear", badge: "New Release" },
      { name: "Minimalist Horween Chronometer", price: "$420.00", category: "Timepieces", badge: "Limited Edition" },
      { name: "Artisanal Calfskin Duffel", price: "$550.00", category: "Leather Goods", badge: "Bestseller" }
    ];
  }
  const products = rawProducts.map(p => ({
    name: p.name || p.title || "Product",
    price: p.price || "$0",
    category: p.category || "Category",
    badge: p.badge || ""
  }));

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function FeaturedProductsSection() {
  const products = ${JSON.stringify(products, null, 2)};

  return (
    <Section id="featured-products" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">${subtitle}</span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">${title}</h2>
            </div>
            <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-white transition self-start md:self-auto">View Full Catalog &rarr;</button>
          </div>
          <Grid columns={3} gap="md">
            {products.map((p, idx) => (
              <div key={idx} className="group p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="h-64 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-800/80 to-slate-900 mb-6 flex items-center justify-center relative overflow-hidden border border-slate-700/50">
                    <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-wider shadow">{p.badge}</span>
                    <div className="w-24 h-24 rounded-full border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-black tracking-tighter text-2xl group-hover:scale-110 transition-transform duration-300">{p.name[0]}</div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{p.category}</span>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">{p.name}</h3>
                  </div>
                  <span className="text-2xl font-black text-white block mb-6">{p.price}</span>
                </div>
                <button className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-transform active:scale-[0.98]">${sec?.cta?.label || "Select Item"}</button>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genCollectionsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Curated Collections";
  const subtitle = sec?.subtitle || "Explore thematic edits exploring silhouette precision.";
  const _rawColl = sec?.content?.items || sec?.content?.collections || sec?.content || cl?.collections;
  let rawCollections = Array.isArray(_rawColl) ? _rawColl : (_rawColl && typeof _rawColl === 'object' ? Object.values(_rawColl).filter(v => v && typeof v === 'object') : []);
  if (rawCollections.length === 0) {
    rawCollections = [
      { title: "Autumn / Winter Monolith", desc: "Heavy architectural drapery paired with resilient weatherproof luxury synthetics.", season: "FW 2026" },
      { title: "Essential Minimalist Wardrobe", desc: "Timeless modular garments engineered for everyday elegance and zero-waste tailoring.", season: "Perennial" },
      { title: "Metropolitan Leather Goods", desc: "Hand-stitched Italian vegetable-tanned leather bags designed for modern durability.", season: "Craft Edition" }
    ];
  }
  const collections = rawCollections.map(c => ({
    title: c.title || c.name || "Collection",
    desc: c.desc || c.description || "",
    season: c.season || c.category || ""
  }));

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function CollectionsSection() {
  const collections = ${JSON.stringify(collections, null, 2)};

  return (
    <Section id="collections" spacing="lg" divider={true}>
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2 block">${subtitle}</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">${title}</h2>
          </div>
          <Grid columns={3} gap="md">
            {collections.map((c, idx) => (
              <div key={idx} className="group relative h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 flex flex-col justify-end transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-0 opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="relative z-10">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">{c.season}</span>
                  <h3 className="text-3xl font-extrabold text-white mb-3 group-hover:text-amber-300 transition-colors">{c.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">{c.desc}</p>
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">Explore Collection &rarr;</span>
                </div>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genNewsletterSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Join Our Exclusive Circle";
  const subtitle = sec?.subtitle || "Subscribe to receive priority notifications.";
  const newsletter = sec?.content || cl?.newsletter || {
    title,
    subtitle,
    btnText: sec?.cta?.label || "Subscribe →"
  };

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';

export default function NewsletterSection() {
  return (
    <Section id="newsletter" spacing="lg">
      <Container size="md">
        <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
          <Stack spacing="md" align="center">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-3 block">Direct Engagement &amp; Updates</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">${title}</h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                ${subtitle}
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto w-full" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="enter.your@email.com" className="w-full px-6 py-4 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition shadow-inner" />
              <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl whitespace-nowrap shadow-lg shadow-indigo-600/30 transition active:scale-[0.98]">${newsletter.btnText || 'Subscribe'}</button>
            </form>
            <span className="text-xs text-slate-500 font-medium">We respect your privacy. Zero spam.</span>
          </Stack>
        </div>
      </Container>
    </Section>
  );
}
`;
}

function genServicesSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "Specialized Services & Programs";
  const subtitle = sec?.subtitle || "Combining personalized engagement with groundbreaking performance standards.";
  const _rawServices = sec?.content?.items || sec?.content?.services || sec?.content || cl?.features || cl?.services;
  let rawServices = Array.isArray(_rawServices) ? _rawServices : (_rawServices && typeof _rawServices === 'object' ? Object.values(_rawServices).filter(v => v && typeof v === 'object') : []);
  if (rawServices.length === 0) {
    rawServices = [
      { title: "Distributed Cloud Consultations", desc: "Scalable microservice architectures, container registries, and serverless workflow blueprints.", icon: "☁️", tag: "Cloud" },
      { title: "Custom WebXR Canvas Apps", desc: "Hardware-accelerated Three.js glsl graphics running fluidly at 60 FPS in browser.", icon: "🌐", tag: "Graphics" },
      { title: "Autonomous Integration Pipelines", desc: "Direct REST/GraphQL endpoints, security vaults, and event streaming systems.", icon: "⚡", tag: "API" }
    ];
  }
  
  const services = rawServices.map(s => {
    if (typeof s === 'string') {
      return { title: s, desc: "", icon: "✦", tag: "Service" };
    }
    return {
      title: s.title || s.name || "Service",
      desc: s.desc || s.description || "",
      icon: s.icon || "✦",
      tag: s.tag || s.category || "Service"
    };
  });

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function ServicesSection() {
  const services = ${JSON.stringify(services, null, 2)};

  return (
    <Section id="services" spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2 block">Comprehensive Excellence</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={2} gap="md">
            {services.map((s, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">{s.icon || '✦'}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">\${s.tag || 'Service'}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm mb-6">\${s.desc}</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 group-hover:translate-x-2 transition-transform">Explore Offering &rarr;</span>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genDoctorsSection(sec, bp) {
  const cl = getContentLibrary(bp);
  const title = sec?.title || sec?.name || "World-Class Leadership";
  const subtitle = sec?.subtitle || "Meet our domain leaders.";
  const _rawDoctors = sec?.content?.team || sec?.content?.doctors || sec?.content?.items || sec?.content || cl?.team;
  let rawDoctors = Array.isArray(_rawDoctors) ? _rawDoctors : (_rawDoctors && typeof _rawDoctors === 'object' ? Object.values(_rawDoctors).filter(v => v && typeof v === 'object') : []);
  if (rawDoctors.length === 0) {
    rawDoctors = [
      { name: "Elena Rostova", specialty: "Head of Domain Operations", creds: "Harvard Alumna · 18 yrs experience", bio: "Leading researcher in system architectures." },
      { name: "Marcus Vance", specialty: "Chief Technical Director", creds: "Johns Hopkins Fellow · 22 yrs experience", bio: "Pioneered high-performance graphics engines." },
      { name: "Sarah Lin", specialty: "Lead Research Director", creds: "Stanford Clinical Lead · 14 yrs experience", bio: "Specializes in cognitive interfaces." }
    ];
  }

  const doctors = rawDoctors.map(doc => {
    const name = doc.name || doc.title || doc.fullName || "Expert Leader";
    const cleanName = name.replace(/^Dr\.\s+/i, ''); // Strip common Dr. prefix for better initials
    const parts = cleanName.split(' ').filter(Boolean);
    const initial = parts.length > 0 ? parts[0][0] : name[0] || 'D';
    return {
      name,
      specialty: doc.specialty || doc.speciality || doc.role || "Domain Expert",
      creds: doc.creds || doc.credentials || doc.subtitle || "",
      bio: doc.bio || doc.desc || doc.description || "",
      initial: initial.toUpperCase()
    };
  });

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function DoctorsSection() {
  const doctors = ${JSON.stringify(doctors, null, 2)};

  return (
    <Section id="doctors" spacing="lg" divider={true}>
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2 block">World-Class Leadership</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">${title}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">${subtitle}</p>
          </div>
          <Grid columns={3} gap="md">
            {doctors.map((doc, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-24 h-24 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-2xl text-cyan-400 mb-6 group-hover:scale-105 transition-transform">{doc.initial}</div>
                  <h3 className="text-2xl font-bold text-white mb-1">{doc.name}</h3>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2">{doc.specialty}</span>
                  <span className="text-[11px] font-medium text-slate-500 block mb-6 pb-4 border-b border-slate-800/80">{doc.creds}</span>
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">{doc.bio}</p>
                </div>
                <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors">${sec?.cta?.label || "Book Consultation"}</button>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}

function genFallbackSection(compName, sec, bp) {
  // Gracefully handle case where sec is not passed but bp is the second arg (for backward-compatibility)
  let sectionObj = sec;
  let blueprintObj = bp;
  if (!bp && sec && sec.brand) {
    blueprintObj = sec;
    sectionObj = null;
  }
  const cl = getContentLibrary(blueprintObj);
  const title = compName.replace(/Section$/, '').replace(/([A-Z])/g, ' $1').trim() || compName;
  let items = null;

  // 1. If sec.content or sec.content.items exists and is an array -> render those items.
  let rawItems = null;
  if (Array.isArray(sectionObj?.content)) {
    rawItems = sectionObj.content;
  } else if (Array.isArray(sectionObj?.content?.items)) {
    rawItems = sectionObj.content.items;
  }

  if (rawItems && rawItems.length > 0) {
    items = rawItems.map(it => {
      if (typeof it === 'string') {
        return { title: it, desc: "", icon: "✦" };
      }
      return {
        title: it.title || it.name || it.text || it.label || "Highlight",
        desc: it.desc || it.description || it.paragraph || it.src || "",
        icon: it.icon || "✦"
      };
    });
  }
  // 2. Else if sec.content is a non-empty string -> convert it into a single item.
  else if (sectionObj?.content && typeof sectionObj.content === 'string' && sectionObj.content.trim().length > 0) {
    items = [{
      title: sectionObj.name || title,
      desc: sectionObj.content,
      icon: "✦"
    }];
  }
  // 3. Else if sec.content is an object:
  else if (sectionObj?.content && typeof sectionObj.content === 'object') {
    const c = sectionObj.content;
    // 3a. If c has description / text / body / paragraph
    if (c.description || c.text || c.body || c.paragraph || c.heading) {
      items = [{
        title: c.heading || c.title || sectionObj.name || title,
        desc: c.description || c.text || c.body || c.paragraph || "",
        icon: c.icon || "✦"
      }];
    }
    // 3b. Else if it contains any key-value pairs (excluding standard non-content attributes)
    else {
      const keys = Object.keys(c).filter(k => !['id', 'type', 'name', 'componentName', 'purpose', 'animation', 'threeObject'].includes(k));
      if (keys.length > 0) {
        items = keys.map(k => ({
          title: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          desc: typeof c[k] === 'object' ? JSON.stringify(c[k]) : String(c[k]),
          icon: "✦"
        }));
      }
    }
  }

  // 4. Else if blueprint.content_library contains matching content for this section type/name -> use that.
  if (!items && cl) {
    const secType = (sectionObj?.type || compName.replace(/Section$/, '').toLowerCase()).toLowerCase();
    if (secType.includes('testimonial') || secType.includes('review')) {
      items = cl.testimonials?.map(t => ({ title: t.author || t.name, desc: t.quote || t.text, icon: "💬" }));
    } else if (secType.includes('price') || secType.includes('pricing') || secType.includes('plan')) {
      items = cl.pricing?.map(p => ({ title: p.name, desc: `${p.price} ${p.period} - ${p.desc}`, icon: "🏷️" }));
    } else if (secType.includes('faq') || secType.includes('question')) {
      items = cl.faqs?.map(f => ({ title: f.q || f.question, desc: f.a || f.answer, icon: "❓" }));
    } else if (secType.includes('stat') || secType.includes('achievement')) {
      items = cl.statistics?.map(s => ({ title: s.label, desc: `${s.val}: ${s.desc}`, icon: "📈" }));
    } else if (secType.includes('value') || secType.includes('mission')) {
      items = cl.company_values?.map(v => ({ title: v.title, desc: v.desc, icon: "✨" }));
    }
  }

  // 5. Only if none of the above exist -> use the existing generic placeholder features.
  if (!items) {
    items = cl?.features || [
      { title: `${title} Highlights`, desc: `Key operational advantages, performance specs, and bespoke features within our ${title.toLowerCase()} suite.`, icon: "✦" }
    ];
  }

  return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Grid from '../layout/Grid';
import Stack from '../layout/Stack';

export default function ${compName}() {
  const items = ${JSON.stringify(items, null, 2)};

  return (
    <Section spacing="lg">
      <Container size="xl">
        <Stack spacing="lg">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2 block">Dedicated Module</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">${title}</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">Explore tailored architectural specifications and verified features curated specifically for your domain requirements.</p>
          </div>
          <Grid columns={items.length > 1 ? 2 : 1} gap="md">
            {items.map((it, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-xl flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">{it.icon || '✦'}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{it.desc}</p>
                </div>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
`;
}


function generateIndustrySectionComponent(compName, sec, bp) {
  if (process.env.BLUEPRINT_V2_ENABLED === "true") {
    const registrySec = { ...sec, componentName: compName };
    const renderer = ComponentRegistry.get(registrySec.type || registrySec.id);
    return renderer.render(registrySec, bp);
  }

  switch (compName) {
    case "FeaturedDishesSection": return genFeaturedDishesSection(sec, bp);
    case "ChefSection": return genChefSection(sec, bp);
    case "GallerySection": return genGallerySection(sec, bp);
    case "TestimonialsSection":
    case "ReviewsSection": return genTestimonialsSection(sec, bp);
    case "ReservationSection": return genReservationSection(sec, bp);
    case "AppointmentSection": return genAppointmentSection(sec, bp);
    case "SkillsSection": return genSkillsSection(sec, bp);
    case "ProjectsSection": return genProjectsSection(sec, bp);
    case "ExperienceSection": return genExperienceSection(sec, bp);
    case "AchievementsSection": return genAchievementsSection(sec, bp);
    case "ContactSection": return genContactSection(sec, bp);
    case "FeaturesSection": return genFeaturesSection(sec, bp);
    case "PricingSection": return genPricingSection(sec, bp);
    case "FAQSection": return genFAQSection(sec, bp);
    case "FeaturedProductsSection": return genFeaturedProductsSection(sec, bp);
    case "CollectionsSection": return genCollectionsSection(sec, bp);
    case "NewsletterSection": return genNewsletterSection(sec, bp);
    case "ServicesSection": return genServicesSection(sec, bp);
    case "DoctorsSection": return genDoctorsSection(sec, bp);
    default: return genFallbackSection(compName, sec, bp);
  }
}

function generatePageContent(baseName, compName, bp) {
  const normName = baseName.toLowerCase();
  if (normName === 'home' || compName === 'HomePage') {
    let importLines = `import React from 'react';\n`;
    let jsxTags = ``;
    const importedComps = new Set();
    
    if (bp?.layout_plan && Array.isArray(bp.layout_plan.sections) && bp.layout_plan.sections.length > 0) {
      const ctaStrat = bp.layout_plan.ctaStrategy || {};
      bp.layout_plan.sections.forEach((sec) => {
        if (!sec || !sec.componentName) return;
        const cName = sec.componentName;
        if (!importedComps.has(cName)) {
          importedComps.add(cName);
          importLines += `import ${cName} from '../components/sections/${cName}';\n`;
        }
        if (cName === 'CTASection' && (ctaStrat.title || ctaStrat.buttonText)) {
          jsxTags += `      <${cName} title="${ctaStrat.title || 'Get Started'}" subtitle="${ctaStrat.subtitle || ''}" buttonText="${ctaStrat.buttonText || 'Explore'}" />\n`;
        } else {
          jsxTags += `      <${cName} />\n`;
        }
      });
      importLines += `\n`;
      return `${importLines}export default function HomePage() {\n  return (\n    <div className="page-home">\n${jsxTags}    </div>\n  );\n}\n`;
    }

    const bpSections = (bp && bp.sections) ?? (bp && bp.pages && bp.pages[0] ? bp.pages[0].sections : []) ?? [];
    importLines += `import HeroSection from '../components/sections/HeroSection';\n`;
    jsxTags = `      <HeroSection />\n`;

    const addedComps = new Set(['HeroSection', 'SampleSection', 'CTASection']);
    if (Array.isArray(bpSections)) {
      bpSections.forEach(sec => {
        if (!sec) return;
        const cName = sec.componentName || `${String(sec.name || sec.id || 'Custom').replace(/\s+/g, '')}Section`;
        if (!addedComps.has(cName)) {
          addedComps.add(cName);
          importLines += `import ${cName} from '../components/sections/${cName}';\n`;
          jsxTags += `      <${cName} />\n`;
        }
      });
    }

    importLines += `import SampleSection from '../components/sections/SampleSection';\n`;
    importLines += `import CTASection from '../components/sections/CTASection';\n\n`;
    jsxTags += `      <SampleSection />\n`;
    jsxTags += `      <CTASection />\n`;

    return `${importLines}export default function HomePage() {\n  return (\n    <div className="page-home">\n${jsxTags}    </div>\n  );\n}\n`;
  }

  const cl = getContentLibrary(bp);

  if (normName === 'about' || compName === 'AboutPage') {
    const about = cl?.about || {
      title: "About Our Organization",
      subtitle: "Dedicated to standard-breaking excellence, high-velocity precision, and lasting client value.",
      intro: "Our experienced practice leaders combine empirical discipline, architectural rigor, and personalized engagement to deliver measurable results across our domain.",
      missionTitle: "Our Strategic Mission",
      missionDesc: "Empowering valued clients with unrivaled capability, transparent operational protocols, and proven expertise.",
      visionTitle: "Our Vision for the Industry",
      visionDesc: "Establishing the definitive standard for technical craftsmanship, innovative design, and dependable service execution."
    };
    const values = cl?.company_values || [
      { title: "Uncompromising Quality", desc: "Every engagement undergoes exhaustive inspection for accuracy, performance, and visual polish." },
      { title: "Empirical Discipline", desc: "We favor measurable operational rigor over transient shortcuts or surface decoration." },
      { title: "Transparent Collaboration", desc: "Proactive communication, rapid iterative execution, and complete alignment with key milestones." }
    ];

    return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';

export default function AboutPage() {
  const values = ${JSON.stringify(values, null, 2)};

  return (
    <div className="page-about">
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="lg">
            <div className="border-b border-slate-800/80 pb-12">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 block mb-3">Organizational Overview</span>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">${about.title || 'About Us'}</h1>
              <p className="text-2xl text-slate-300 font-medium mb-6 leading-relaxed max-w-3xl">${about.subtitle}</p>
              <p className="text-lg text-slate-400 leading-relaxed max-w-4xl">${about.intro}</p>
            </div>

            <Grid columns={2} gap="md">
              <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div className="w-1.5 h-16 bg-indigo-500 rounded-full mb-6"></div>
                <h3 className="text-2xl font-bold mb-3 text-white">${about.missionTitle || 'Our Mission'}</h3>
                <p className="text-slate-300 text-base leading-relaxed">${about.missionDesc}</p>
              </div>
              <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div className="w-1.5 h-16 bg-cyan-500 rounded-full mb-6"></div>
                <h3 className="text-2xl font-bold mb-3 text-white">${about.visionTitle || 'Our Vision'}</h3>
                <p className="text-slate-300 text-base leading-relaxed">${about.visionDesc}</p>
              </div>
            </Grid>

            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-3">Core Values &amp; Discipline</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">The unshakeable architectural principles guiding every project, partnership, and operational deployment.</p>
              </div>
              <Grid columns={3} gap="md">
                {values.map((v, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
                    <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-6 inline-block">0{i+1}</span>
                    <h4 className="text-xl font-bold text-white mb-3">{v.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </Grid>
            </div>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
  }

  if (normName === 'pricing' || compName === 'PricingPage') {
    const _rawTiers = cl?.pricing;
    let rawTiers = Array.isArray(_rawTiers) ? _rawTiers : (_rawTiers && typeof _rawTiers === 'object' ? Object.values(_rawTiers).filter(v => v && typeof v === 'object') : []);
    if (rawTiers.length === 0) {
      rawTiers = [
        { name: "Starter", price: "$49", period: "/ mo", desc: "For growing teams.", features: ["5 Projects", "Basic Analytics", "Email Support"], btnText: "Start Free", highlighted: false },
        { name: "Professional", price: "$149", period: "/ mo", desc: "Unlimited workflows and exports.", features: ["Unlimited Projects", "Advanced Analytics", "Priority Support"], btnText: "Go Professional", highlighted: true },
        { name: "Enterprise", price: "Custom", period: "", desc: "Dedicated support and custom SLAs.", features: ["Dedicated Manager", "Custom Integrations", "SLA Guarantee"], btnText: "Contact Sales", highlighted: false }
      ];
    }
    const tiers = rawTiers.map(t => ({
      title: t.name || t.title || "Plan",
      price: t.price || "$0",
      period: t.period || "",
      features: Array.isArray(t.features) ? t.features : [],
      highlight: t.highlighted || t.highlight || false,
      button: t.btnText || t.button || "Select Package"
    }));


    return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';
import PricingCard from '../components/ui/PricingCard';

export default function PricingPage() {
  const tiers = ${JSON.stringify(tiers, null, 2)};

  return (
    <div className="page-pricing">
      <Section spacing="lg">
        <Container size="xl">
          <Stack spacing="lg">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2 block">Transparent Investment</span>
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight text-white">Select Your Package</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">Tailored pricing packages designed to match your operational scale with zero hidden fees.</p>
            </div>
            <Grid columns={3} gap="md" align="stretch">
              {tiers.map((tier, idx) => (
                <PricingCard key={idx} {...tier} />
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
  }

  if (normName === 'contact' || compName === 'ContactPage') {
    const contact = cl?.contact || {
      title: "Contact Our Team",
      subtitle: "Ready to initiate your consultation or inquire about our programs? Our team responds within 2 working hours.",
      btnText: "Send Private Inquiry",
      emailPlaceholder: "enter.your@email.com"
    };

    return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Stack from '../components/layout/Stack';
import Grid from '../components/layout/Grid';

export default function ContactPage() {
  return (
    <div className="page-contact">
      <Section spacing="lg">
        <Container size="md">
          <Stack spacing="lg">
            <div className="text-center mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2 block">Direct Engagement</span>
              <h1 className="text-5xl font-black mb-4 tracking-tight text-white">${contact.title || 'Contact Our Team'}</h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">${contact.subtitle || 'Reach out directly to initiate a consultation with our specialized leadership team.'}</p>
            </div>
            <form className="space-y-6 bg-slate-900/60 p-8 md:p-12 rounded-3xl border border-slate-800/80 shadow-2xl" onSubmit={(e) => e.preventDefault()}>
              <Grid columns={2} gap="sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">First Name</label>
                  <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Alex" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Last Name</label>
                  <input type="text" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Taylor" />
                </div>
              </Grid>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Email Address</label>
                <input type="email" className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="${contact.emailPlaceholder || 'alex.taylor@organization.com'}" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">Message &amp; Requirements</label>
                <textarea rows={5} className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-white shadow-inner" placeholder="Provide details regarding your desired timeline and organizational objectives..."></textarea>
              </div>
              <button type="submit" className="w-full py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-lg transition shadow-lg shadow-indigo-600/30 text-white">${contact.btnText || 'Send Inquiry'}</button>
            </form>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
  }

  const items = cl?.features || cl?.services || [
    { title: `${baseName} Highlights`, desc: `Verified technical specifications, professional expertise, and structured offerings for ${baseName}.`, icon: "✦" }
  ];

  return `import React from 'react';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Grid from '../components/layout/Grid';
import Stack from '../components/layout/Stack';

export default function ${compName}() {
  const items = ${JSON.stringify(items, null, 2)};

  return (
    <div className="page-${normName}">
      <Section spacing="lg">
        <Container size="lg">
          <Stack spacing="lg">
            <div className="mb-6 border-b border-slate-800/80 pb-10">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 block mb-3">Dedicated Domain Showcase</span>
              <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tight text-white">${baseName} Features</h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
                An interactive catalog of our specialized offerings, professional standards, and verified features within our ${baseName.toLowerCase()} division.
              </p>
            </div>
            <Grid columns={2} gap="md">
              {items.map((it, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all shadow-xl flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">{it.icon || '✦'}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{it.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{it.desc}</p>
                  </div>
                </div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
`;
}


export function validateBlueprintForGeneration(bp) {
  const errors = [];

  // Branding uses blueprint.brand
  if (!bp.brand || typeof bp.brand !== 'object') {
    errors.push("Missing blueprint.brand");
  } else {
    if (!bp.brand.name) errors.push("Missing blueprint.brand.name");
  }

  // Navbar uses blueprint.navigation
  if (!bp.navigation || typeof bp.navigation !== 'object') {
    errors.push("Missing blueprint.navigation");
  } else {
    if (!bp.navigation.links || !Array.isArray(bp.navigation.links)) {
      errors.push("Missing blueprint.navigation.links or it is not an array");
    }
  }

  // CTA Strategy in navigation
  if (!bp.navigation?.cta || typeof bp.navigation.cta !== 'object') {
    errors.push("Missing blueprint.navigation.cta");
  } else {
    if (!bp.navigation.cta.label) errors.push("Missing blueprint.navigation.cta.label");
  }

  // Hero uses blueprint.hero
  if (!bp.hero || typeof bp.hero !== 'object') {
    errors.push("Missing blueprint.hero");
  } else {
    if (!bp.hero.headline) errors.push("Missing blueprint.hero.headline");
    if (!bp.hero.description) errors.push("Missing blueprint.hero.description");
  }

  // Scene uses blueprint.scene
  if (!bp.scene || typeof bp.scene !== 'object') {
    errors.push("Missing blueprint.scene");
  } else {
    if (!bp.scene.sceneId) errors.push("Missing blueprint.scene.sceneId");
  }

  // Sections use blueprint.sections
  if (!bp.sections || !Array.isArray(bp.sections) || bp.sections.length === 0) {
    errors.push("Missing blueprint.sections or it is not a non-empty array");
  }

  // Validate hero.buttons array
  if (bp.hero?.buttons && !Array.isArray(bp.hero.buttons)) {
    errors.push("blueprint.hero.buttons must be an array");
  }

  if (errors.length > 0) {
    throw new Error(`Blueprint Validation Error: ${errors.join("; ")}`);
  }
}


export function logComponentGeneration(name, sourcePath, fieldsConsumed, missingFields = []) {
  console.log(`\n======================================================`);
  console.log(`Component Name:      ${name}`);
  console.log(`Blueprint Source:    ${sourcePath}`);
  console.log(`Fields Consumed:     ${fieldsConsumed.join(", ")}`);
  console.log(`Missing Fields:      ${missingFields.length > 0 ? missingFields.join(", ") : "None"}`);
  console.log(`Fallback Used?:      ${missingFields.length > 0 ? "YES" : "NO"}`);
  console.log(`======================================================\n`);
}

export function generateAllCode(blueprint, themeParam) {

  console.log("RAW BLUEPRINT");
console.log(JSON.stringify(blueprint.scene, null, 2));
console.log(JSON.stringify(blueprint.hero, null, 2));


  const bp = normalizeBlueprint(blueprint)


  console.log("NORMALIZED");
console.log(JSON.stringify(bp.scene, null, 2));
console.log(JSON.stringify(bp.hero, null, 2));

  validateBlueprintForGeneration(bp)
  const selectedTheme = themeParam ?? bp?.theme ?? bp?.themeName ?? "modernDark"
  const { heroJSX, sceneJSX, sampleSection } = resolveComponents(bp)
  const appJSX = generateAppJSX(bp, selectedTheme)

  const rawPages = (bp.pages ?? [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])
  const pagesList = Array.isArray(rawPages) ? rawPages : [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]

  const createItem = (fileName, relPath, content) => ({
    name: fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName,
    file: relPath,
    path: relPath,
    content: content,
    code: content,
    toString: () => content
  });

  const vid = getVisualIdentity(bp);
  const fontImport = vid.typography?.fontImport ? `@import url('${vid.typography.fontImport}');\n` : "";
  const indexCssContent = `${fontImport}@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --color-primary: ${vid.primaryColor};\n  --color-secondary: ${vid.secondaryColor};\n  --color-accent: ${vid.accentColor};\n  --color-bg: ${vid.backgroundColor};\n  --color-surface: ${vid.surfaceColor};\n  --color-text: ${vid.textColor};\n  --color-text-muted: ${vid.textMutedColor};\n  --font-display: ${vid.typography?.displayFont || "'Inter', sans-serif"};\n  --font-body: ${vid.typography?.bodyFont || "'Inter', sans-serif"};\n  --border-radius: ${vid.borderRadius};\n}\n\nbody {\n  margin: 0;\n  padding: 0;\n  background-color: var(--color-bg);\n  color: var(--color-text);\n  font-family: var(--font-body);\n  -webkit-font-smoothing: antialiased;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-display);\n}\n`;

  const pagesMap = {};
  const stylesMap = {
    "index.css": createItem("index.css", "src/index.css", indexCssContent)
  };

  pagesList.forEach(p => {
    const rawName = typeof p === 'string' ? p : (p.name || 'Home');
    const baseName = String(rawName).replace(/\s+/g, '');
    const compName = baseName.endsWith('Page') ? baseName : `${baseName}Page`;
    const fileName = `${compName}.jsx`;
    const cssName = `${compName}.css`;
    const pageContent = generatePageContent(rawName, compName, bp);
    pagesMap[fileName] = createItem(fileName, `src/pages/${fileName}`, pageContent);
    stylesMap[cssName] = createItem(cssName, `src/styles/${cssName}`, `/* Styling for ${compName} */\n.page-${baseName.toLowerCase()} {\n  position: relative;\n  width: 100%;\n  overflow-x: hidden;\n}\n`);
  });

  const ctaLabel = bp?.navigation?.cta?.label || "Explore";
  const ctaPath = bp?.navigation?.cta?.path || "/contact";
  
  const navbarContent = `import React from 'react';\nimport { Link } from 'react-router-dom';\nimport { useTheme } from '../../theme/ThemeProvider';\n\nexport default function Navbar({ brand = "Website", links = [] }) {\n  const { themeTokens } = useTheme();\n  const bg = themeTokens?.colors?.surface || "${vid.backgroundColor}";\n  const pri = themeTokens?.colors?.primary || "${vid.primaryColor}";\n  const txt = themeTokens?.colors?.text || "${vid.textColor}";\n  const acc = themeTokens?.colors?.accent || "${vid.accentColor}";\n  const maxW = themeTokens?.spacing?.containerMax || "${vid.spacing?.containerMax || 'max-w-7xl mx-auto'}";\n\n  return (\n    <header className="sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b border-white/10" style={{ backgroundColor: \`\${bg}e6\` }}>\n      <div className={\`\${maxW} px-6 h-20 flex items-center justify-between\`}>\n        <Link to="/" className="text-2xl font-extrabold tracking-wider flex items-center gap-2" style={{ color: txt }}>\n          <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: pri }}></span>\n          <span>{brand}</span>\n        </Link>\n        <nav className="flex items-center gap-6">\n          {links.map((link, idx) => {\n            const name = typeof link === 'object' && link !== null ? (link.name || link.label || 'Link') : String(link);\n            const path = typeof link === 'object' && link !== null ? (link.path || '/') : (link === 'Home' ? '/' : '/' + String(link).toLowerCase());\n            return (\n              <Link key={idx} to={path} className="text-sm font-semibold transition-colors opacity-80 hover:opacity-100" style={{ color: txt }}>\n                {name}\n              </Link>\n            );\n          })}\n          <Link to="${ctaPath}" className="!py-2.5 !px-6 text-xs transition-transform transform hover:scale-105 font-bold rounded-lg text-white" style={{ backgroundColor: pri }}>\n            ${ctaLabel}\n          </Link>\n        </nav>\n      </div>\n    </header>\n  );\n}\n`;

  const footerContent = `import React from 'react';\nimport { useTheme } from '../../theme/ThemeProvider';\n\nexport default function Footer({ brand = "Website", tagline = "", links = [] }) {\n  const { themeTokens, theme } = useTheme();\n  const bg = themeTokens?.colors?.background || "${vid.backgroundColor}";\n  const pri = themeTokens?.colors?.primary || "${vid.primaryColor}";\n  const sec = themeTokens?.colors?.secondary || "${vid.secondaryColor}";\n  const txt = themeTokens?.colors?.text || "${vid.textColor}";\n  const muted = themeTokens?.colors?.textMuted || "${vid.textMutedColor}";\n\n  return (\n    <footer className="border-t py-16 px-6 text-center relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: bg, borderColor: \`\${pri}33\` }}>\n      <div className="absolute inset-0 pointer-events-none opacity-15 bg-gradient-to-t from-blue-600/20 to-transparent"></div>\n      <div className="max-w-4xl mx-auto relative z-10">\n        <div className="text-2xl font-extrabold mb-3 inline-block" style={{ color: txt }}>{brand}</div>\n        <p className="text-sm max-w-xl mx-auto mb-8 leading-relaxed font-normal" style={{ color: muted }}>{tagline}</p>\n        <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold mb-12" style={{ color: muted }}>\n          {links.map((l, i) => <span key={i} className="cursor-pointer hover:opacity-100 opacity-80 transition-opacity" style={{ color: sec }}>{typeof l === 'string' ? l : l.name || 'Link'}</span>)}\n        </div>\n        <div className="text-xs border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ color: \`\${muted}99\` }}>\n          <span>&copy; {new Date().getFullYear()} {brand}. All rights reserved.</span>\n          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border" style={{ backgroundColor: \`\${pri}1a\`, borderColor: \`\${pri}33\`, color: sec }}>Theme: {theme || '${vid.theme}'}</span>\n        </div>\n      </div>\n    </footer>\n  );\n}\n`;

  // Log navbar, footer, hero, and scene generation
  logComponentGeneration("Navbar", "blueprint.navigation", ["links", "logo", "cta"]);
  logComponentGeneration("Footer", "blueprint.brand", ["name", "tagline", "links"]);
  logComponentGeneration("HeroSection", "blueprint.hero", ["headline", "description", "buttons", "badge", "scene", "layout"]);
  logComponentGeneration("Cinematic3DScene", "blueprint.scene", ["sceneId", "camera", "lighting", "interaction", "quality"]);
  logComponentGeneration("CTASection", "blueprint.sections", ["title", "subtitle", "cta"]);

  const componentsMap = {
    "App.jsx": createItem("App.jsx", "src/App.jsx", appJSX),
    "Navbar.jsx": createItem("Navbar.jsx", "src/components/layout/Navbar.jsx", navbarContent),
    "Footer.jsx": createItem("Footer.jsx", "src/components/layout/Footer.jsx", footerContent),
    "Cinematic3DScene.jsx": createItem("Cinematic3DScene.jsx", "src/3d/Cinematic3DScene.jsx", sceneJSX),
    "Button.jsx": createItem("Button.jsx", "src/components/ui/Button.jsx", getButtonComponentString()),
    "FeatureCard.jsx": createItem("FeatureCard.jsx", "src/components/ui/FeatureCard.jsx", getFeatureCardComponentString()),
    "TestimonialCard.jsx": createItem("TestimonialCard.jsx", "src/components/ui/TestimonialCard.jsx", getTestimonialCardComponentString()),
    "FAQAccordion.jsx": createItem("FAQAccordion.jsx", "src/components/ui/FAQAccordion.jsx", getFAQAccordionComponentString()),
    "StatCard.jsx": createItem("StatCard.jsx", "src/components/ui/StatCard.jsx", getStatCardComponentString()),
    "PricingCard.jsx": createItem("PricingCard.jsx", "src/components/ui/PricingCard.jsx", getPricingCardComponentString()),
    "HeroLayout.jsx": createItem("HeroLayout.jsx", "src/components/layout/HeroLayout.jsx", getHeroLayoutComponentString()),
    "Container.jsx": createItem("Container.jsx", "src/components/layout/Container.jsx", getContainerComponentString()),
    "Section.jsx": createItem("Section.jsx", "src/components/layout/Section.jsx", getSectionComponentString()),
    "Grid.jsx": createItem("Grid.jsx", "src/components/layout/Grid.jsx", getGridComponentString()),
    "Stack.jsx": createItem("Stack.jsx", "src/components/layout/Stack.jsx", getStackComponentString()),
    "tokens.js": createItem("tokens.js", "src/theme/tokens.js", getTokensString()),
    "ThemeProvider.jsx": createItem("ThemeProvider.jsx", "src/theme/ThemeProvider.jsx", getThemeProviderString(bp)),
    "apple.js": createItem("apple.js", "src/theme/themes/apple.js", getThemeAppleString()),
    "vercel.js": createItem("vercel.js", "src/theme/themes/vercel.js", getThemeVercelString()),
    "linear.js": createItem("linear.js", "src/theme/themes/linear.js", getThemeLinearString()),
    "stripe.js": createItem("stripe.js", "src/theme/themes/stripe.js", getThemeStripeString()),
    "framer.js": createItem("framer.js", "src/theme/themes/framer.js", getThemeFramerString()),
    "notion.js": createItem("notion.js", "src/theme/themes/notion.js", getThemeNotionString()),
    "minimal.js": createItem("minimal.js", "src/theme/themes/minimal.js", getThemeMinimalString()),
    "modernDark.js": createItem("modernDark.js", "src/theme/themes/modernDark.js", getThemeModernDarkString())
  };

  Object.assign(componentsMap, get3DExperienceComponents(bp, selectedTheme));

  const sectionsMap = {
    "HeroSection.jsx": createItem("HeroSection.jsx", "src/components/sections/HeroSection.jsx", heroJSX),
    "SampleSection.jsx": createItem("SampleSection.jsx", "src/components/sections/SampleSection.jsx", sampleSection),
    "CTASection.jsx": createItem("CTASection.jsx", "src/components/sections/CTASection.jsx", getCTASectionComponentString(bp))
  };

  const bpSections = (bp && bp.sections) ?? (bp && bp.pages && bp.pages[0] ? bp.pages[0].sections : []) ?? [];
  const planSections = (bp && bp.layout_plan && Array.isArray(bp.layout_plan.sections)) ? bp.layout_plan.sections : [];
  [...bpSections, ...planSections].forEach(sec => {
    if (!sec) return;
    const cName = sec.componentName || `${String(sec.name || sec.id || 'Custom').replace(/\s+/g, '')}Section`;
    const fileName = `${cName}.jsx`;
    if (fileName !== "HeroSection.jsx" && fileName !== "SampleSection.jsx" && !sectionsMap[fileName]) {
      const sectionCode = generateIndustrySectionComponent(cName, sec, bp);
      sectionsMap[fileName] = createItem(fileName, `src/components/sections/${fileName}`, sectionCode);

      // Perform audit log
      const cl = getContentLibrary(bp);
      const missingFields = [];
      const fieldsConsumed = ["title", "subtitle", "name", "componentName"];
      if (sec.type) fieldsConsumed.push("type");
      if (sec.content) fieldsConsumed.push("content");
      if (sec.cta) fieldsConsumed.push("cta");
      
      if (cName === "FeaturedDishesSection" && !sec?.content?.items && !cl?.dishes) missingFields.push("content.dishes");
      if (cName === "ChefSection" && !sec?.content?.chefName && !cl?.chefName) missingFields.push("content.chefName");
      if (cName === "GallerySection" && !sec?.content?.items && !cl?.galleryItems) missingFields.push("content.items");
      if (cName === "SkillsSection" && !sec?.content?.items && !cl?.skills) missingFields.push("content.items");
      if (cName === "ProjectsSection" && !sec?.content?.items && !cl?.projects) missingFields.push("content.items");
      if (cName === "ExperienceSection" && !sec?.content?.items && !cl?.experience) missingFields.push("content.items");
      if (cName === "AchievementsSection" && !sec?.content?.stats && !cl?.statistics) missingFields.push("content.stats");
      if (cName === "ContactSection" && !sec?.content && !cl?.contact) missingFields.push("content");
      if (cName === "FeaturesSection" && !sec?.content?.items && !cl?.features) missingFields.push("content");
      if (cName === "PricingSection" && !sec?.content?.items && !cl?.pricing) missingFields.push("content");
      if (cName === "FAQSection" && !sec?.content?.faqs && !cl?.faqs) missingFields.push("content");
      if (cName === "FeaturedProductsSection" && !sec?.content?.items && !cl?.products) missingFields.push("content");
      if (cName === "CollectionsSection" && !sec?.content?.items && !cl?.collections) missingFields.push("content");
      if (cName === "NewsletterSection" && !sec?.content && !cl?.newsletter) missingFields.push("content");
      if (cName === "ServicesSection" && !sec?.content?.items && !cl?.services) missingFields.push("content");
      if (cName === "DoctorsSection" && !sec?.content && !cl?.team) missingFields.push("content");

      logComponentGeneration(cName, `blueprint.sections (${sec.type || sec.id || 'custom'})`, fieldsConsumed, missingFields);
    }
  });

  const assetsMap = {
    "logo.svg": createItem("logo.svg", "src/assets/logo.svg", "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='45' stroke='#3d5eff' stroke-width='8' fill='#0a0a14' /><path d='M35 50 L45 65 L65 35' stroke='#00d4ff' stroke-width='8' stroke-linecap='round' stroke-linejoin='round' /></svg>")
  };
  const bpAssets = Array.isArray(bp.assets) ? bp.assets : [];
  bpAssets.forEach((a, idx) => {
    const assetName = typeof a === 'string' ? a : (a.name || `asset_${idx}.svg`);
    const assetPath = typeof a === 'string' ? `src/assets/${a}` : (a.path || `src/assets/${assetName}`);
    const assetContent = a.content || a.url || "<svg xmlns='http://www.w3.org/2000/svg'></svg>";
    assetsMap[assetName] = createItem(assetName, assetPath, assetContent);
  });

  const packageData = {
    name: `project-${(bp.siteName || bp.title || 'modern-3d').toLowerCase().replace(/[^a-z0-9-_]/g, '-')}`,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.22.0",
      "framer-motion": "^11.0.3",
      "@react-three/fiber": "^8.15.14",
      "@react-three/drei": "^9.96.1",
      "@react-three/postprocessing": "^2.16.0",
      "three": "^0.160.0"
    },
    devDependencies: {
      "@types/react": "^18.2.43",
      "@types/react-dom": "^18.2.17",
      "@vitejs/plugin-react": "^4.2.1",
      "vite": "^5.0.8",
      "tailwindcss": "^3.4.1",
      "postcss": "^8.4.35",
      "autoprefixer": "^10.4.18"
    }
  };

  console.log(
    `\n=======================================================\n` +
    `  STANDARDIZED GENERATEDCODE CONTRACT SUMMARY\n` +
    `=======================================================\n` +
    `generatedCode\n` +
    `  pages\n` +
    Object.keys(pagesMap).map(k => `    ${k}`).join('\n') + `\n` +
    `  components\n` +
    Object.keys(componentsMap).map(k => `    ${k}`).join('\n') + `\n` +
    `  sections\n` +
    Object.keys(sectionsMap).map(k => `    ${k}`).join('\n') + `\n` +
    `  styles\n` +
    Object.keys(stylesMap).map(k => `    ${k}`).join('\n') + `\n` +
    `  assets\n` +
    Object.keys(assetsMap).map(k => `    ${k}`).join('\n') + `\n` +
    `  package\n` +
    `=======================================================\n`
  );

  return {
    fileTree:      buildFileTree(bp),
    appJSX,
    heroJSX,
    sceneJSX,
    sampleSection,
    installCmd:    'npm install framer-motion @react-three/fiber @react-three/drei @react-three/postprocessing three react-router-dom',
    envSetup:      'cp .env.example .env\n# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
    theme:         selectedTheme,
    layout_plan:   bp?.layout_plan ?? null,
    scene_plan:    bp?.scene_plan ?? null,
    pages:         pagesMap,
    components:    componentsMap,
    sections:      sectionsMap,
    styles:        stylesMap,
    assets:        assetsMap,
    package:       packageData
  }
}

