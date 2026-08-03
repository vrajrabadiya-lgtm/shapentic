/**
 * BlueprintGenerator — Phase 3-8
 *
 * Takes the intent object from AIArchitect and either:
 *   A) Calls the backend /api/generate endpoint (Claude API) for a rich AI-generated blueprint
 *   B) Falls back to local template-based generation if the API is unavailable
 *
 * Returns a fully populated blueprint conforming to blueprintSchema.js
 */

import {
  emptyBlueprint,
  BLUEPRINT_VERSION,
} from "../templates/blueprintSchema.js";
import { generateLayoutPlan } from "../src/planner/LayoutPlanner.js";
import { generateScenePlan } from "../src/planner/ScenePlanner.js";

// ─── Section templates per page type ─────────────────────────────────────────

export const PAGE_SECTIONS = {
  Home: [
    {
      id: "hero",
      name: "Hero",
      purpose:
        "First impression — grab attention and communicate the core value proposition",
      animation: "parallax + float",
      threeObject: null, // filled from intent
      content: {
        headline: "",
        subheadline: "",
        cta: { primary: "Get Started", secondary: "Watch Demo" },
      },
    },
    {
      id: "features",
      name: "Features",
      purpose:
        "Showcase 3 to 6 core product features with icons and micro-animations",
      animation: "slide-up on scroll",
      threeObject: "geometric-grid",
      content: {
        heading: "Built for the Future",
        items: [],
      },
    },
    {
      id: "showcase",
      name: "Product Showcase",
      purpose: "Interactive 3D product demo or rotating mockup",
      animation: "orbit rotation",
      threeObject: null,
      content: {
        heading: "See It in Action",
        description: "",
      },
    },
    {
      id: "testimonials",
      name: "Testimonials",
      purpose: "Social proof via glass cards with customer quotes",
      animation: "fade-in stagger",
      threeObject: null,
      content: {
        heading: "Trusted by Thousands",
        items: [],
      },
    },
    {
      id: "cta",
      name: "Call to Action",
      purpose: "Final conversion push before footer",
      animation: "scale-in + glow",
      threeObject: "particle-field",
      content: {
        heading: "",
        subheading: "Start your journey today.",
        button: "Start Free Trial",
      },
    },
  ],
  About: [
    {
      id: "about-hero",
      name: "About Hero",
      purpose: "Brand story header",
      animation: "fade-in",
      threeObject: "floating-sphere",
      content: { heading: "Our Story", description: "" },
    },
    {
      id: "team",
      name: "Team",
      purpose: "Team member cards with hover effects",
      animation: "slide-up stagger",
      threeObject: null,
      content: { heading: "Meet the Team", items: [] },
    },
    {
      id: "mission",
      name: "Mission & Values",
      purpose: "Core values in animated card grid",
      animation: "scale-in",
      threeObject: null,
      content: { heading: "What We Stand For", items: [] },
    },
  ],
  Services: [
    {
      id: "services-hero",
      name: "Services Hero",
      purpose: "Services overview header",
      animation: "float + parallax",
      threeObject: null,
      content: { heading: "What We Offer", description: "" },
    },
    {
      id: "service-cards",
      name: "Service Cards",
      purpose: "Individual service offerings in glass cards",
      animation: "slide-up stagger",
      threeObject: null,
      content: { heading: "Our Services", items: [] },
    },
    {
      id: "process",
      name: "Process",
      purpose: "Step-by-step visual workflow",
      animation: "slide-in sequential",
      threeObject: "geometric-grid",
      content: { heading: "How It Works", steps: [] },
    },
  ],
  Products: [
    {
      id: "products-hero",
      name: "Products Hero",
      purpose: "Product lineup header with 3D preview",
      animation: "orbit",
      threeObject: null,
      content: { heading: "Our Products", description: "" },
    },
    {
      id: "product-grid",
      name: "Product Grid",
      purpose: "Interactive product cards with 3D hover",
      animation: "scale-in hover",
      threeObject: null,
      content: { heading: "Explore the Lineup", items: [] },
    },
  ],
  Pricing: [
    {
      id: "pricing-hero",
      name: "Pricing Hero",
      purpose: "Pricing page header",
      animation: "fade-in",
      threeObject: "crystal",
      content: { heading: "Simple, Transparent Pricing", description: "" },
    },
    {
      id: "pricing-cards",
      name: "Pricing Cards",
      purpose: "Tiered pricing with glass card design",
      animation: "scale-in stagger",
      threeObject: null,
      content: {
        heading: "Choose Your Plan",
        tiers: ["Starter", "Pro", "Enterprise"],
      },
    },
  ],
  Contact: [
    {
      id: "contact-hero",
      name: "Contact Hero",
      purpose: "Contact page header",
      animation: "float",
      threeObject: "particle-field",
      content: { heading: "Get in Touch", description: "" },
    },
    {
      id: "contact-form",
      name: "Contact Form",
      purpose: "Glassmorphism contact form",
      animation: "slide-up",
      threeObject: null,
      content: { heading: "Let's Talk", fields: ["name", "email", "message"] },
    },
  ],
};

// ─── Video scene templates ────────────────────────────────────────────────────

function buildVideoScenes(intent = {}) {
  const siteName = intent.websiteName || "Modern Experience";
  const threeObjs = Array.isArray(intent.threeObjects) && intent.threeObjects.length ? intent.threeObjects : ["Interactive Sphere", "Holographic Monolith"];
  const primaryObj = threeObjs[0];
  const secondaryObj = threeObjs[1] || primaryObj;

  return [
    {
      id: 1,
      name: "Opening Hero",
      duration: 5,
      camera: "Slow zoom-in",
      elements: [
        "Logo reveal",
        "Background particle animation",
        "Main headline typewriter effect",
      ],
      description: `${siteName} logo fades in from darkness. Particles swirl. Main headline types out character by character.`,
    },
    {
      id: 2,
      name: "3D Hero Section",
      duration: 8,
      camera: "Orbit movement around central 3D object",
      elements: [
        "Floating 3D objects",
        "Particle field",
        "Interactive light trails",
      ],
      description: `Camera orbits a glowing ${primaryObj} object. Particles react to camera movement. Depth-of-field blur on edges.`,
    },
    {
      id: 3,
      name: "Features Section",
      duration: 8,
      camera: "Smooth horizontal scroll",
      elements: [
        "Feature cards slide in",
        "Icons animate",
        "Glass morphism cards",
      ],
      description:
        "Three feature cards enter from bottom with staggered timing. Each card glows on hover.",
    },
    {
      id: 4,
      name: "Product Showcase",
      duration: 10,
      camera: "Slow 360° rotation",
      elements: ["3D product model", "Holographic overlay", "Spec callouts"],
      description: `Central ${secondaryObj} slowly rotates. Holographic labels pop out pointing to key features.`,
    },
    {
      id: 5,
      name: "Testimonials",
      duration: 5,
      camera: "Static with subtle parallax",
      elements: ["Floating glass quote cards", "Avatar images", "Star ratings"],
      description:
        "Three testimonial cards float at different depths. Stars animate in sequence.",
    },
    {
      id: 6,
      name: "Pricing",
      duration: 5,
      camera: "Slight zoom-out",
      elements: [
        "3 pricing tier cards",
        "Highlight animation on recommended",
        "CTA buttons glow",
      ],
      description:
        "Pricing cards rise from bottom. Middle card has neon glow border. CTA buttons pulse.",
    },
    {
      id: 7,
      name: "Final CTA",
      duration: 5,
      camera: "Slow zoom-in to CTA button",
      elements: [
        "Brand logo",
        "CTA button with glow",
        "Particle burst on hover",
      ],
      description: `${siteName} logo centered. "Get Started" button glows with neon halo. Particle burst plays.`,
    },
  ];
}

function buildAIVideoPrompt(intent = {}, blueprint = {}) {
  const siteName = intent.websiteName || "Digital Platform";
  const style = intent.style || "Modern";
  const threeObjs = Array.isArray(intent.threeObjects) && intent.threeObjects.length ? intent.threeObjects.join(", ") : "Interactive Sphere, Holographic Canvas";
  const palette = blueprint.palette || { primary: "#3b82f6", secondary: "#10b981", accent: "#f59e0b", background: "#090d16" };

  return `Create an ultra-realistic futuristic website preview video (60fps, 4K quality).

Website: "${siteName}"
Type: ${intent.prompt || 'Interactive 3D platform'}
Style: ${style}

Visual direction:
Show a premium ${style.toLowerCase()} landing page with smooth cinematic camera movement, glassmorphism UI panels, floating ${threeObjs} 3D elements, animated typography with typewriter effects, interactive sections with hover states, ultra-smooth page transitions, cinematic depth-of-field lighting, volumetric god rays, particle systems with physics, realistic reflections on glass surfaces, smooth parallax scrolling effects, immersive spatial audio-reactive visuals, Apple-quality design aesthetics, high-end motion graphics.

Color palette: primary ${palette.primary}, secondary ${palette.secondary}, accent ${palette.accent} on background ${palette.background}.

Camera: Start with slow zoom-in hero reveal → orbit around central 3D object → horizontal scroll through features → 360° product rotation → gentle float on testimonials → zoom-out to pricing → final zoom-in CTA.

Quality: 8K textures, sub-pixel anti-aliasing, HDR rendering, physically-based materials, real-time ray tracing.`;
}

// ─── Component structure generator ────────────────────────────────────────────

function buildComponentStructure(intent, bp) {
  const layout = ["Navbar", "Footer", "ScrollProgress", "CustomCursor"];
  const sections = [];
  const threeD = ["ParticleField", "CameraRig"];
  const pages = (intent.pages || []).map((p) => `${p}Page`);

  if (bp && bp.pages) {
    bp.pages.forEach((page) => {
      (page.sections || []).forEach((s) => {
        const comp = s.componentName || (s.name ? s.name.replace(/\s+/g, "") : "Custom") + "Section";
        if (!sections.includes(comp)) sections.push(comp);
      });
    });
  } else {
    (intent.pages || []).forEach((page) => {
      const secs = PAGE_SECTIONS[page] || [];
      secs.forEach((s) => {
        const comp = s.name ? s.name.replace(/\s+/g, "") : "CustomSection";
        if (!sections.includes(comp)) sections.push(comp);
      });
    });
  }

  (intent.threeObjects || []).forEach((obj) => {
    const comp = obj
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("");
    if (!threeD.includes(comp)) threeD.push(comp);
  });

  return { layout, sections, threeD, pages };
}

// ─── Industry-Adaptive Hero Data & Layouts ─────────────────────────────────────

export function inferHeroLayout(businessType, prompt = '') {
  const text = `${businessType || ''} ${prompt || ''}`.toLowerCase();

  // 1. Landing Hero (SaaS, startup, conversion, app platform, cloud tech launch)
  if (/saas|software|startup|workflow|launch|cloud|app|conversion/.test(text)) return 'landing';
  // 2. Glass Hero (Glassmorphism, ethereal, crystal, blur, transparent, vision)
  if (/glass|crystal|transparent|blur|ethereal|dream|mirage/.test(text)) return 'glass';
  // 3. Card Hero (Neumorphic, dashboard, bento, widget, banking, clay, embossed, finance, financial)
  if (/neumorph|clay|widget|bento|dashboard|embossed|pastel|finance|financial/.test(text)) return 'card';
  // 4. Fullscreen Hero (Gaming, esports, space, cosmos, universe, tournament, twitch, cinema, rocket)
  if (/esport|tournament|twitch|space|cosmos|galaxy|orbital|rocket|universe|cinema/.test(text)) return 'fullscreen';
  // 5. Asymmetric Hero (Fashion, couture, lookbook, avant-garde, studio, tattoo, art, model, trendy)
  if (/fashion|couture|lookbook|outfit|avant|trendy|tattoo|art/.test(text)) return 'asymmetric';
  // 6. 3D Right Hero (AI, cyber, glitch, virtual reality, vr, robot, future, dynamic, electric, neon)
  if (/cyber|cyberpunk|glitch|vr|virtual reality|ai|robot|electric|dystopian/.test(text)) return '3d-right';
  // 7. 3D Left Hero (Healthcare, clinic, laboratory, lab, biotech, biological, medical, diagnostics, hardware)
  if (/health|clinic|laboratory|lab|biotech|biological|medical|doctor|hospital|hardware/.test(text)) return '3d-left';
  // 8. Image Left Hero (Real estate, estates, property, villa, interior, builder, residence)
  if (/real estate|estate|property|villa|interior|builder|residence/.test(text)) return 'image-left';
  // 9. Image Right Hero (E-commerce, retail, merchandise, store, botanical, farm, organic, garden, eco, flora)
  if (/ecommerce|retail|merchandise|store|botanical|farm|organic|garden|eco|flora/.test(text)) return 'image-right';
  // 10. Magazine Hero (Restaurant, gastronomy, food, bistro, bakery, coffee, cafe, culinary, magazine, editorial, wine, autumn)
  if (/restaurant|gastronomy|food|bistro|bakery|coffee|cafe|culinary|magazine|editorial|wine|autumn/.test(text)) return 'magazine';
  // 11. Minimal Hero (Zen, minimal, simple, clean, architecture, whitespace, light, elegant, white)
  if (/zen|minimal|simple|clean|architecture|whitespace|light|elegant/.test(text)) return 'minimal';
  // 12. Split Hero (Corporate, B2B, consulting, consultancy, enterprise, legal, advisory, network, agency)
  if (/corporate|b2b|consult|enterprise|legal|advisory|network|agency/.test(text)) return 'split';
  // 13. Centered Hero (Portfolio, developer, resume, freelancer, bio, showcase, community, general)
  if (/portfolio|developer|resume|freelancer|bio|showcase|community/.test(text)) return 'centered';

  // Deterministic hash fallback across all 13 layouts for unmatched prompts
  const allLayouts = ['centered', 'split', 'image-left', 'image-right', '3d-left', 'minimal', 'fullscreen', 'card', 'glass', '3d-right', 'asymmetric', 'magazine', 'landing'];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash << 5) - hash + text.charCodeAt(i);
  return allLayouts[Math.abs(hash) % allLayouts.length];
}

export function getIndustryHeroData(businessType, websiteName = 'Brand Name') {
  const type = (businessType || 'Technology').toLowerCase();

  // Evaluate specific vertical domains first before generic tech/platform terms
  if (type.includes('automotive') || type.includes('car') || type.includes('vehicle') || type.includes('hypercar') || type.includes('supercar')) {
    return {
      heading: 'The Future of Performance',
      subheading: 'Experience revolutionary aerodynamics and electric powertrain engineering.',
      description: 'Discover next-generation automotive design merging sustainable power with unparalleled track performance and autonomous intelligence.',
      cta: 'Explore Models',
      cta_secondary: 'Book Test Drive',
      badge: 'Zero Emissions · Peak Performance'
    };
  }
  if (type.includes('cybersecurity') || type.includes('security') || type.includes('cyber') || type.includes('defense') || type.includes('threat') || type.includes('infosec') || type.includes('soc')) {
    return {
      heading: 'Defending the Digital Frontier',
      subheading: 'AI-powered threat intelligence, zero-trust endpoint protection, and autonomous incident response.',
      description: 'Protect your enterprise networks, cloud workloads, and sensitive customer data with our industry-leading cyber defense platform.',
      cta: 'Deploy Protection',
      cta_secondary: 'Request Security Audit',
      badge: 'Zero-Trust Protocol · SOC-2 Type II Certified'
    };
  }
  if (type.includes('architecture') || type.includes('architect') || type.includes('construction')) {
    return {
      heading: 'Shaping Tomorrow’s Skyline',
      subheading: 'Visionary structural design and sustainable architectural masterplanning.',
      description: 'An award-winning architecture studio transforming urban spaces through innovative parametric design, environmental sustainability, and iconic aesthetics.',
      cta: 'View Projects',
      cta_secondary: 'Our Philosophy',
      badge: 'Award-Winning Studio · Global Reach'
    };
  }
  if (type.includes('hotel') || type.includes('resort') || type.includes('hospitality') || type.includes('accommodation')) {
    return {
      heading: 'Redefining Luxury Stays',
      subheading: 'An unparalleled sanctuary of comfort, elegance, and bespoke services.',
      description: 'Immerse yourself in a world-class hospitality experience featuring award-winning wellness offerings, exclusive leisure retreats, and breathtaking architectural grandeur.',
      cta: 'Book Your Stay',
      cta_secondary: 'Explore Suites',
      badge: 'Five-Star Excellence · Global Destinations'
    };
  }
  if (type.includes('restaurant') || type.includes('food') || type.includes('gastronomy') || type.includes('cafe') || type.includes('bistro') || type.includes('pizza') || type.includes('sushi') || type.includes('burger') || type.includes('kitchen') || type.includes('bakery')) {
    return {
      heading: 'Taste Authentic Italian Cuisine',
      subheading: 'An immersive culinary journey celebrating timeless traditions and artisanal flavor.',
      description: 'Award-winning kitchen serving authentic Italian recipes prepared with imported organic farm-to-table ingredients and curated vintage wine pairings.',
      cta: 'Reserve a Table',
      cta_secondary: 'Explore Menu',
      badge: 'Michelin Guide Recommended · Fine Gastronomy'
    };
  }
  if (type.includes('health') || type.includes('medical') || type.includes('wellness') || type.includes('care') || type.includes('clinic') || type.includes('doctor') || type.includes('hospital')) {
    return {
      heading: 'Better Care Through Technology',
      subheading: 'Empowering clinical excellence and patient outcomes with intelligent digital healthcare diagnostics.',
      description: 'Secure, HIPAA-compliant patient management platforms engineered to streamline medical consultations, precision analytics, and collaborative patient care.',
      cta: 'Book Consultation',
      cta_secondary: 'Patient Portal',
      badge: 'Verified Medical Intelligence · HIPAA Certified'
    };
  }
  if (type.includes('gaming') || type.includes('game') || type.includes('esport')) {
    return {
      heading: 'Dominate the Digital Arena',
      subheading: 'Next-generation multiplayer combat powered by ultra-low latency spatial audio and ray-traced visuals.',
      description: 'Step into competitive decentralized gaming ecosystems built for high-speed performance, interactive community tournaments, and limitless customization.',
      cta: 'Play Free Now',
      cta_secondary: 'Watch Cinematic',
      badge: 'Season 4 Live · Official Esports League'
    };
  }
  if (type.includes('fintech') || type.includes('finance') || type.includes('bank') || type.includes('payment') || type.includes('crypto') || type.includes('web3') || type.includes('wallet') || type.includes('invest') || type.includes('trading')) {
    return {
      heading: 'Next-Generation Financial Protocol',
      subheading: 'Borderless enterprise treasury management and autonomous institutional yielding.',
      description: 'Programmable financial infrastructure powered by quantum-resistant security algorithms and instant real-time international multi-currency settlement.',
      cta: 'Open Account',
      cta_secondary: 'Read Whitepaper',
      badge: 'Institutional Security · SOC-2 Type II Certified'
    };
  }
  if (type.includes('real estate') || type.includes('property') || type.includes('realty') || type.includes('housing') || type.includes('apartments') || type.includes('villas')) {
    return {
      heading: 'Architectural Luxury Living',
      subheading: 'Experience futuristic virtual 3D property walkthroughs and premier real estate acquisitions.',
      description: 'Curated architectural masterpieces and elite metropolitan residences tailored for exceptional living standards and timeless investment.',
      cta: 'Explore Properties',
      cta_secondary: 'Meet Agents',
      badge: 'Exclusive Listings · VR Ready Walkthroughs'
    };
  }
  if (type.includes('fashion') || type.includes('clothing') || type.includes('luxury') || type.includes('apparel') || type.includes('style') || type.includes('boutique') || type.includes('wear') || type.includes('brand') || type.includes('haute')) {
    return {
      heading: 'Modern Clothing For Every Occasion',
      subheading: 'Discover curated collections blending visionary contemporary aesthetics with sustainable craftsmanship.',
      description: 'Luxury ready-to-wear essentials and seasonal statement designs tailored for timeless sophistication, ethical sustainability, and everyday expression.',
      cta: 'Explore Collection',
      cta_secondary: 'View Lookbook',
      badge: 'Sustainable Luxury · Autumn Release'
    };
  }
  if (type.includes('ecommerce') || type.includes('shop') || type.includes('store') || type.includes('retail') || type.includes('merch') || type.includes('goods')) {
    return {
      heading: 'Elevate Your Everyday Style',
      subheading: 'Premium artisanal collections delivered directly to your doorstep with guaranteed authenticity.',
      description: 'Handpicked goods designed for durability and elegance, supported by global carbon-neutral shipping and lifetime craftsmanship warranties.',
      cta: 'Shop New Arrivals',
      cta_secondary: 'Browse Bestsellers',
      badge: 'Free Express Global Shipping'
    };
  }
  if (type.includes('agency') || type.includes('studio') || type.includes('creative') || type.includes('marketing') || type.includes('advertising') || type.includes('consultancy') || type.includes('firm')) {
    return {
      heading: 'We Craft Digital Masterpieces',
      subheading: 'Visionary brand architecture and cinematic interactive storytelling for ambitious innovators.',
      description: 'An award-winning multidisciplinary studio transforming complex ideas into stunning visual design systems, immersive 3D motion, and scalable web software.',
      cta: 'Start a Project',
      cta_secondary: 'View Showreel',
      badge: 'Global Design Awards Winner 2026'
    };
  }
  if (type.includes('portfolio') || type.includes('developer') || type.includes('personal') || type.includes('freelance') || type.includes('bio') || type.includes('showcase') || type.includes('creator') || type.includes('resume') || type.includes('cv')) {
    return {
      heading: "Interactive Portfolio.\nSenior Technologist.",
      subheading: 'Architecting scalable web applications, immersive 3D interfaces, and resilient cloud backend engineering.',
      description: 'Senior Software Engineer specializing in modern JavaScript ecosystems, distributed architecture, spatial computing, and interactive digital design.',
      cta: 'View Projects',
      cta_secondary: 'Contact Me',
      badge: 'Available for Hire · Full-time & Freelance'
    };
  }
  if (type.includes('space') || type.includes('cosmos') || type.includes('orbital') || type.includes('nasa')) {
    return {
      heading: 'Pioneering the Orbital Frontier',
      subheading: 'Advanced autonomous interplanetary transit and sustainable commercial lunar infrastructure.',
      description: 'Designing next-generation aerospace telemetry systems and commercial space habitats engineered for humanity’s multi-planetary exploration.',
      cta: 'Explore Missions',
      cta_secondary: 'Investor Briefing',
      badge: 'Commercial Aerospace · Mission 2030'
    };
  }
  if (type.includes('law') || type.includes('legal') || type.includes('attorney') || type.includes('litigation') || type.includes('counsel') || type.includes('jurist') || type.includes('justice') || type.includes('advocate')) {
    return {
      heading: 'Uncompromising Legal Excellence & Strategic Defense',
      subheading: 'Experienced institutional trial counsel defending high-stakes corporate advocacy and intellectual property litigation.',
      description: 'A distinguished practice area focused on cross-border commercial arbitration, corporate restructuring, and trial-ready courtroom mastery.',
      cta: 'Request Legal Counsel',
      cta_secondary: 'Explore Practice Areas',
      badge: 'Tier 1 Global Litigation Practice · Top Rated 2026'
    };
  }
  if (type.includes('gym') || type.includes('fitness') || type.includes('workout') || type.includes('athletic') || type.includes('training') || type.includes('crossfit') || type.includes('strength') || type.includes('muscle') || type.includes('bodybuilding')) {
    return {
      heading: 'Forge Your Peak Physical Endurance',
      subheading: 'Elite sports biometrics, custom resistance engineering, and pro-grade strength training regimens.',
      description: 'Experience intelligent biomechanical coaching, temperature-controlled recovery plunge suites, and state-of-the-art strength zones built for serious performance.',
      cta: 'Start Athlete Trial',
      cta_secondary: 'Explore Facilities',
      badge: '24/7 VIP Biometric Facility · Pro Coaching'
    };
  }
  if (type.includes('saas') || type.includes('workflow') || type.includes('platform') || type.includes('software') || type.includes('cloud') || type.includes('enterprise') || type.includes('app') || type.includes('automation') || type.includes('tool') || type.includes('tech')) {
    return {
      heading: 'Automate Your Workflow',
      subheading: 'Supercharge productivity with AI-powered enterprise orchestration and real-time operational integrations.',
      description: 'Connect all your teams and essential tools in one seamless operating system engineered for velocity, security, and effortless scalable teamwork.',
      cta: 'Start Free Trial',
      cta_secondary: 'Schedule Demo',
      badge: 'Next-Gen Enterprise SaaS · 99.99% Uptime'
    };
  }
  if (type.includes('education') || type.includes('school') || type.includes('college') || type.includes('university') || type.includes('academy') || type.includes('admission') || type.includes('course') || type.includes('learning') || type.includes('campus') || type.includes('tutor')) {
    return {
      heading: `Shaping Future Excellence at ${websiteName}`,
      subheading: 'An inspiring academic sanctuary empowering future generations through dynamic curriculum, mentorship, and breakthrough research.',
      description: 'Discover accredited degree programs, world-class faculty, and a thriving campus ecosystem designed to ignite academic passion and career trajectory.',
      cta: 'Explore Admissions',
      cta_secondary: 'Schedule Campus Visit',
      badge: 'Accredited Academic Institution · Enrolling Now'
    };
  }

  // Default / Universal Business
  return {
    heading: `Welcome to ${websiteName}`,
    subheading: 'Elevating standards with extraordinary quality, dynamic performance, and dedicated client focus.',
    description: 'Experience a seamless fusion of visionary design, intuitive performance, and uncompromised excellence tailored specifically to your aspirations.',
    cta: 'Get Started',
    cta_secondary: 'Learn More',
    badge: 'Premier Excellence & Innovation'
  };
}

export function getIndustrySectionMapping(businessType, heroData = {}, defaultThree = "Floating Sphere", websiteName = "Website") {
  const type = (businessType || 'Technology').toLowerCase();

  const heroSection = {
    id: "hero",
    name: "Hero",
    componentName: "HeroSection",
    purpose: "First impression — grab attention and communicate core value proposition",
    animation: "parallax + float",
    threeObject: defaultThree,
    content: {
      headline: heroData.heading || `Next-Gen Architecture by ${websiteName}`,
      subheadline: heroData.subheading || "",
      description: heroData.description || "",
      cta: { primary: heroData.cta || "Launch Architecture", secondary: heroData.cta_secondary || "Explore Platform" },
      badge: heroData.badge || ""
    }
  };

  if (type.includes('cybersecurity') || type.includes('security') || type.includes('cyber') || type.includes('defense') || type.includes('threat') || type.includes('infosec') || type.includes('soc')) {
    return [
      heroSection,
      { id: "features", name: "Features", componentName: "FeaturesSection", purpose: "Showcase cybersecurity threat intelligence and encryption features", animation: "slide-up stagger", threeObject: null, content: { heading: "Core Security Features", items: ["Threat Detection Engine", "SOC Monitoring", "Endpoint Protection", "Cloud Security"] } },
      { id: "services", name: "Services", componentName: "ServicesSection", purpose: "Cybersecurity specialized threat advisory and forensics", animation: "slide-up stagger", threeObject: null, content: { heading: "Cyber Defense Services", items: ["Threat Intelligence", "Incident Response", "Vulnerability Assessment", "Digital Forensics"] } },
      { id: "pricing", name: "Pricing", componentName: "PricingSection", purpose: "Transparent security shielding subscription plans", animation: 'slide-up', threeObject: null, content: { heading: "Protection Plans", tiers: ["Standard Shield", "Enterprise Guard", "Sentinel Premier"] } },
      { id: "faq", name: "FAQ", componentName: "FAQSection", purpose: "Answer integration, zero-trust and compliance questions", animation: 'fade-in', threeObject: null, content: { heading: "Security & Compliance FAQ", items: 4 } },
      { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Social proof via verified CISO client quotes", animation: 'fade-in stagger', threeObject: null, content: { heading: "Trusted by Enterprise CISOs", items: [] } }
    ];
  }
  if (type.includes('restaurant') || type.includes('food') || type.includes('gastronomy') || type.includes('cafe') || type.includes('bistro') || type.includes('pizza') || type.includes('sushi') || type.includes('burger') || type.includes('kitchen') || type.includes('bakery')) {
    return [
      heroSection,
      { id: "featured-dishes", name: "Featured Dishes", componentName: "FeaturedDishesSection", purpose: "Showcase culinary menu highlights and prices", animation: "slide-up stagger", threeObject: null, content: { heading: "Featured Dishes", items: ["Truffle Tagliolini", "Wood-Fired Margherita", "Bistecchine di Manzo"] } },
      { id: "chef", name: "Chef", componentName: "ChefSection", purpose: "Introduce executive chef and culinary craft", animation: 'fade-in', threeObject: null, content: { heading: "Meet the Chef", chef: "Chef Marco Bellini" } },
      { id: "gallery", name: "Gallery", componentName: "GallerySection", purpose: "Visual gallery of gastronomy hall and ambiance", animation: "scale-up stagger", threeObject: null, content: { heading: "Ambiance Gallery", items: 4 } },
      { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Verified guest reviews and critical praise", animation: 'fade-in stagger', threeObject: null, content: { heading: "Guest Reviews", items: [] } },
      { id: "booking", name: "Booking", componentName: "ContactSection", purpose: "Table reservation booking form", animation: "slide-up", threeObject: null, content: { heading: "Book a Table", button: "Confirm Booking" } }
    ];
  }

  if (type.includes('education') || type.includes('school') || type.includes('college') || type.includes('university') || type.includes('academy') || type.includes('admission') || type.includes('course') || type.includes('learning') || type.includes('campus') || type.includes('tutor')) {
    return [
      heroSection,
      { id: "programs", name: "Programs", componentName: "ServicesSection", purpose: "Showcase academic faculties, degrees, and specialized curricula", animation: "slide-up stagger", threeObject: null, content: { heading: "Academic Programs", items: ["Undergraduate Studies", "Postgraduate Research", "Global Executive MBA", "STEM Innovation Bootcamps"] } },
      { id: "faculty", name: "Faculty", componentName: "DoctorsSection", purpose: "Profile esteemed professors, researchers, and mentors", animation: "fade-in stagger", threeObject: null, content: { heading: "Distinguished Faculty", doctors: ["Prof. Eleanor Vance, Ph.D.", "Dr. Harrison Forde, Sc.D.", "Prof. Marcus Lin"] } },
      { id: "student-life", name: "Student Life", componentName: "FeaturesSection", purpose: "Highlight campus innovation centers, clubs, and modern laboratories", animation: "slide-up stagger", threeObject: null, content: { heading: "Campus & Innovation", items: ["State-of-the-Art Labs", "Global Exchange Programs", "Olympic Athletic Facilities", "Collaborative Dorms"] } },
      { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Alumni success achievements and career impact stories", animation: "fade-in stagger", threeObject: null, content: { heading: "Alumni Excellence", items: [] } },
      { id: "admissions", name: "Admissions", componentName: "ContactSection", purpose: "Online admissions booking and tour scheduling portal", animation: "slide-up", threeObject: null, content: { heading: "Schedule Campus Tour", button: "Submit Inquiry" } }
    ];
  }

  if (type.includes('portfolio') || type.includes('developer') || type.includes('personal') || type.includes('freelance') || type.includes('bio') || type.includes('showcase') || type.includes('creator') || type.includes('resume') || type.includes('cv')) {
    return [
      heroSection,
      { id: "skills", name: "Skills", componentName: "SkillsSection", purpose: "Showcase technical toolstack and features", animation: "fade-in stagger", threeObject: null, content: { heading: "Technical Skills", items: ["React", "TypeScript", "Three.js", "Node.js"] } },
      { id: "projects", name: "Projects", componentName: "ProjectsSection", purpose: "Highlight engineered applications and case studies", animation: 'slide-up stagger', threeObject: null, content: { heading: "Featured Projects", items: 3 } },
      { id: "experience", name: "Experience", componentName: "ExperienceSection", purpose: "Professional employment timeline and impact", animation: 'slide-up', threeObject: null, content: { heading: "Career Timeline", items: 3 } },
      { id: "achievements", name: "Achievements", componentName: "AchievementsSection", purpose: "Quantitative milestones and awards", animation: 'count-up', threeObject: null, content: { heading: "Key Benchmarks", stats: ["50+ Deployments", "5 Open Source Awards", "99.9% SLA"] } },
      { id: "contact", name: "Contact", componentName: "ContactSection", purpose: "Direct booking inquiry and consultation portal", animation: "fade-in", threeObject: null, content: { heading: "Get in Touch", button: "Send Inquiry" } }
    ];
  }

  if (type.includes('saas') || type.includes('workflow') || type.includes('platform') || type.includes('software') || type.includes('cloud') || type.includes('enterprise') || type.includes('app') || type.includes('automation') || type.includes('tool')) {
    return [
      heroSection,
      { id: "features", name: "Features", componentName: "FeaturesSection", purpose: "Showcase automation superpowers and cloud architecture", animation: "slide-up stagger", threeObject: null, content: { heading: "Core Features", items: ["Autonomous Pipelines", "Zero-Latency UI", "Enterprise Security"] } },
      { id: "pricing", name: "Pricing", componentName: "PricingSection", purpose: "Transparent multi-tier SaaS pricing packages", animation: 'slide-up', threeObject: null, content: { heading: "Transparent Pricing", tiers: ["Starter", "Professional", "Enterprise"] } },
      { id: "faq", name: "FAQ", componentName: "FAQSection", purpose: "Answer integration and billing questions", animation: 'fade-in', threeObject: null, content: { heading: "Frequently Asked Questions", items: 4 } },
      { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Social proof via glass cards with customer quotes", animation: 'fade-in stagger', threeObject: null, content: { heading: "Trusted by Leaders", items: [] } }
    ];
  }

  if (type.includes('store') || type.includes('shop') || type.includes('ecommerce') || type.includes('e-commerce') || type.includes('retail') || type.includes('merch') || type.includes('goods')) {
    return [
      heroSection,
      { id: "featured-products", name: "Featured Products", componentName: "FeaturedProductsSection", purpose: "Showcase top retail items and prices", animation: "slide-up stagger", threeObject: null, content: { heading: "Featured Products", items: ["Monolith Coat", "Horween Watch", "Leather Duffel"] } },
      { id: "collections", name: "Collections", componentName: "CollectionsSection", purpose: "Themed seasonal lookbook edits", animation: "scale-up stagger", threeObject: null, content: { heading: "Curated Collections", categories: 3 } },
      { id: "reviews", name: "Reviews", componentName: "ReviewsSection", purpose: "Verified customer praise and star ratings", animation: 'fade-in stagger', threeObject: null, content: { heading: "Customer Reviews", rating: "4.9 / 5.0" } },
      { id: "newsletter", name: "Newsletter", componentName: "NewsletterSection", purpose: "VIP drop subscription and discounts", animation: 'slide-up', threeObject: null, content: { heading: "Join Our Exclusive Circle", button: "Subscribe" } }
    ];
  }

  if (type.includes('health') || type.includes('medical') || type.includes('wellness') || type.includes('care') || type.includes('clinic') || type.includes('doctor') || type.includes('hospital')) {
    return [
      heroSection,
      { id: "services", name: "Services", componentName: "ServicesSection", purpose: "Detail clinical diagnostics and medical wellness care", animation: "slide-up stagger", threeObject: null, content: { heading: "Clinical Services", items: ["Genomic Screening", "Clinical Diagnostics", "General Medicine", "Wellness Care"] } },
      { id: "doctors", name: "Doctors", componentName: "DoctorsSection", purpose: "Profile board-certified physician experts", animation: 'fade-in stagger', threeObject: null, content: { heading: "Physician Experts", doctors: ["Dr. Elena Rostova", "Dr. Marcus Vance", "Dr. Sarah Lin"] } },
      { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Patient success stories and reviews", animation: 'fade-in', threeObject: null, content: { heading: "Patient Stories", items: [] } },
      { id: "contact", name: "Contact", componentName: "ContactSection", purpose: "Online medical consultation booking portal", animation: "slide-up", threeObject: null, content: { heading: "Get in Touch", button: "Submit Inquiry" } }
    ];
  }

  if (type.includes('fashion') || type.includes('clothing') || type.includes('luxury') || type.includes('apparel') || type.includes('style') || type.includes('boutique') || type.includes('wear') || type.includes('brand') || type.includes('haute')) {
    return [
      heroSection,
      { id: "collections", name: "Collections", componentName: "CollectionsSection", purpose: "Seasonal editorial lookbook showcases", animation: "scale-up stagger", threeObject: null, content: { heading: "Seasonal Lookbooks", items: 3 } },
      { id: "featured-products", name: "Featured Products", componentName: "FeaturedProductsSection", purpose: "Showcase high-end couture designs and essentials", animation: "slide-up stagger", threeObject: null, content: { heading: "Featured Pieces", items: 3 } },
      { id: "reviews", name: "Reviews", componentName: "ReviewsSection", purpose: "Vogue and editorial community praise", animation: 'fade-in stagger', threeObject: null, content: { heading: "Editorial Praise", items: [] } },
      { id: "newsletter", name: "Newsletter", componentName: "NewsletterSection", purpose: "Private runway preview invitations", animation: 'slide-up', threeObject: null, content: { heading: "Private Club Access", button: "Join Circle" } }
    ];
  }

  if (type.includes('gaming') || type.includes('game') || type.includes('esport')) {
    return [
      heroSection,
      { id: "features", name: "Features", componentName: "FeaturesSection", purpose: "Showcase low-latency engine superpowers", animation: "slide-up stagger", threeObject: null, content: { heading: "Engine Features", items: 4 } },
      { id: "achievements", name: "Achievements", componentName: "AchievementsSection", purpose: "Live tournament brackets and player benchmarks", animation: "count-up", threeObject: null, content: { heading: "Arena Benchmarks", items: 4 } },
      { id: "reviews", name: "Reviews", componentName: "ReviewsSection", purpose: "Streamer and esports team testimonials", animation: 'fade-in stagger', threeObject: null, content: { heading: "Player Reviews", items: [] } },
      { id: "newsletter", name: "Newsletter", componentName: "NewsletterSection", purpose: "Tournament schedule alerts and beta drop signups", animation: "slide-up", threeObject: null, content: { heading: "Join Beta Queue", button: "Enlist Now" } }
    ];
  }

  if (type.includes('law') || type.includes('legal') || type.includes('attorney') || type.includes('litigation') || type.includes('counsel') || type.includes('jurist') || type.includes('justice') || type.includes('advocate')) {
    return [
      heroSection,
      { id: "practice-areas", name: "Practice Areas", componentName: "ServicesSection", purpose: "Detail legal specializations and corporate counseling domains", animation: "slide-up stagger", threeObject: null, content: { heading: "Legal Practice Areas", items: ["Corporate M&A", "Intellectual Property Defense", "Cross-Border Arbitration", "Regulatory Compliance"] } },
      { id: "attorneys", name: "Attorneys", componentName: "DoctorsSection", purpose: "Profile senior partners and lead courtroom trial attorneys", animation: "fade-in stagger", threeObject: null, content: { heading: "Senior Trial Partners", doctors: ["Arthur J. Sterling, Esq.", "Victoria M. Vance, JD", "David H. Kensington"] } },
      { id: "case-studies", name: "Case Studies", componentName: "TestimonialsSection", purpose: "Summary of favorable trial rulings and landmark client representation", animation: "fade-in stagger", threeObject: null, content: { heading: "Landmark Rulings", items: [] } },
      { id: "faq", name: "FAQ", componentName: "FAQSection", purpose: "Answer litigation timelines, retainers, and confidentiality inquiries", animation: "fade-in", threeObject: null, content: { heading: "Legal Counsel Inquiries", items: 4 } },
      { id: "consultation", name: "Consultation", componentName: "ContactSection", purpose: "Confidential case inquiry and consultation portal", animation: "slide-up", threeObject: null, content: { heading: "Request Confidential Case Review", button: "Submit Case Inquiry" } }
    ];
  }

  if (type.includes('gym') || type.includes('fitness') || type.includes('workout') || type.includes('athletic') || type.includes('training') || type.includes('crossfit') || type.includes('strength') || type.includes('muscle') || type.includes('bodybuilding')) {
    return [
      heroSection,
      { id: "facilities", name: "Facilities", componentName: "FeaturesSection", purpose: "Showcase strength arenas, recovery plunge pools, and biomechanical lab", animation: "slide-up stagger", threeObject: null, content: { heading: "Facility Features", items: ["Biometric Lab", "Olympic Free Weights", "Cryothermal Recovery", "24/7 Facial Recognition Access"] } },
      { id: "membership", name: "Membership", componentName: "PricingSection", purpose: "Transparent membership tiers with unrestricted athletic access", animation: "slide-up", threeObject: null, content: { heading: "Athlete Memberships", tiers: ["Off-Peak Athlete", "Premier Competitor", "All-Access VIP"] } },
      { id: "reviews", name: "Reviews", componentName: "ReviewsSection", purpose: "Verified member performance transformations and praise", animation: "fade-in stagger", threeObject: null, content: { heading: "Athlete Success Stories", items: [] } },
      { id: "faq", name: "FAQ", componentName: "FAQSection", purpose: "Answer membership holds, personal training booking, and facility protocols", animation: "fade-in", threeObject: null, content: { heading: "Facility FAQ", items: 4 } },
      { id: "newsletter", name: "Newsletter", componentName: "NewsletterSection", purpose: "Class schedules, special seminars, and VIP guest drops", animation: "slide-up", threeObject: null, content: { heading: "Join the Athletic Queue", button: "Get Class Alerts" } }
    ];
  }

  if (type === 'space' || type.includes('space') || type.includes('aerospace')) {
    return [
      heroSection,
      { id: "rocket-programs", name: "Rocket Programs", componentName: "FeaturesSection", purpose: "Showcase rocket models and features", animation: "slide-up stagger", threeObject: "rocket", content: { heading: "Rocket Programs", items: ["Orbital Heavy Launch", "Interplanetary Shuttle", "Lunar Lander System"] } },
      { id: "satellite-systems", name: "Satellite Systems", componentName: "ServicesSection", purpose: "Satellite network and communication systems", animation: "fade-in stagger", threeObject: "satellite", content: { heading: "Satellite Networks", items: ["Low Earth Orbit Telecom", "Remote Sensing Constellation", "Deep Space Telemetry"] } },
      { id: "mission-timeline", name: "Mission Timeline", componentName: "ExperienceSection", purpose: "Historical and future launch timeline", animation: "slide-up", threeObject: null, content: { heading: "Mission Operations", items: 3 } },
      { id: "launch-services", name: "Launch Services", componentName: "PricingSection", purpose: "Commercial payload launch pricing tiers", animation: "scale-in", threeObject: null, content: { heading: "Commercial Launch Services", tiers: ["CubeSat Share", "Dedicated Medium", "Heavy Lift Manifest"] } },
      { id: "research", name: "Research & Development", componentName: "AchievementsSection", purpose: "Interplanetary and propulsion research statistics", animation: "count-up", threeObject: null, content: { heading: "Pioneering Milestones", stats: ["42 Orbital Missions", "98.9% Launch Success", "12 Propulsion Patents"] } },
      { id: "contact", name: "Contact Manifest", componentName: "ContactSection", purpose: "Payload inquiry and launch application portal", animation: "fade-in", threeObject: null, content: { heading: "Book Payload Manifest", button: "Inquire Manifest Space" } }
    ];
  }

  // Default fallback section structure
  return [
    heroSection,
    { id: "features", name: "Features", componentName: "FeaturesSection", purpose: "Showcase core architectural features", animation: "slide-up stagger", threeObject: null, content: { heading: "Core Features", items: [] } },
    { id: "testimonials", name: "Testimonials", componentName: "TestimonialsSection", purpose: "Social proof via verified client feedback", animation: "fade-in stagger", threeObject: null, content: { heading: "Client Feedback", items: [] } },
    { id: "faq", name: "FAQ", componentName: "FAQSection", purpose: "Answer technical and integration questions", animation: 'fade-in', threeObject: null, content: { heading: "Frequently Asked Questions", items: 4 } },
    { id: "contact", name: "Contact", componentName: "ContactSection", purpose: "Direct communication and project startup form", animation: "fade-in", threeObject: null, content: { heading: "Get in Touch", button: "Contact Us" } }
  ];
}


// ─── Phase 8.5 Visual Identity Engine ────────────────────────────────────────

export function getThemeVisualIdentity(theme = "Modern", customPalette = {}) {
  const t = (theme || "Modern").toLowerCase();

  if (t.includes("corporate") || t.includes("enterprise") || t.includes("finance")) {
    return {
      theme: "Corporate",
      primaryColor: customPalette.primary || "#2563eb",
      secondaryColor: customPalette.secondary || "#3b82f6",
      accentColor: customPalette.accent || "#1d4ed8",
      backgroundColor: customPalette.background || "#0f172a",
      surfaceColor: "#1e293b",
      textColor: "#f8fafc",
      textMutedColor: "#94a3b8",
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Roboto', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap",
        headingClass: "font-['Inter'] tracking-tight font-bold",
        bodyClass: "font-['Roboto'] leading-relaxed"
      },
      borderRadius: "6px",
      borderRadiusClass: "rounded-md",
      cardStyle: "bg-slate-800/90 border border-slate-700 shadow-md rounded-md hover:border-blue-500/50 transition-all duration-200",
      buttonStyle: "bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-md shadow-sm hover:shadow transition-colors duration-200",
      buttonSecondaryStyle: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium py-3 px-6 rounded-md transition-colors duration-200",
      background: "bg-slate-900 text-slate-100 min-h-screen selection:bg-blue-600/30",
      gradients: {
        heading: "bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent",
        surface: "bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900",
        glow: "from-blue-600/10 via-transparent to-transparent"
      },
      shadowStyle: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      spacing: {
        sectionPadding: "py-20 px-6 sm:px-8 lg:px-12",
        cardGap: "gap-6",
        containerMax: "max-w-6xl mx-auto"
      }
    };
  }

  if (t.includes("minimal") || t.includes("clean") || t.includes("zen")) {
    return {
      theme: "Minimal",
      primaryColor: customPalette.primary || "#ffffff",
      secondaryColor: customPalette.secondary || "#d4d4d8",
      accentColor: customPalette.accent || "#6366f1",
      backgroundColor: customPalette.background || "#09090b",
      surfaceColor: "#121215",
      textColor: "#fafafa",
      textMutedColor: "#71717a",
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Outfit:wght@400;500;600;700&display=swap",
        headingClass: "font-['Outfit'] tracking-tight font-semibold",
        bodyClass: "font-['Inter'] font-light leading-loose"
      },
      borderRadius: "4px",
      borderRadiusClass: "rounded",
      cardStyle: "bg-[#121215] border border-zinc-800/80 rounded hover:border-zinc-600 transition-all duration-300",
      buttonStyle: "bg-white text-zinc-950 hover:bg-zinc-200 font-medium py-3.5 px-8 rounded transition-all duration-300",
      buttonSecondaryStyle: "bg-transparent text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-500 font-medium py-3.5 px-8 rounded transition-all duration-300",
      background: "bg-zinc-950 text-zinc-100 min-h-screen selection:bg-white/20",
      gradients: {
        heading: "text-white font-semibold",
        surface: "bg-zinc-950",
        glow: "from-white/5 via-transparent to-transparent"
      },
      shadowStyle: "none",
      spacing: {
        sectionPadding: "py-32 px-6 md:px-16",
        cardGap: "gap-12",
        containerMax: "max-w-5xl mx-auto"
      }
    };
  }

  if (t.includes("luxury") || t.includes("gold") || t.includes("premium") || t.includes("elite") || t.includes("fashion")) {
    return {
      theme: "Luxury",
      primaryColor: customPalette.primary || "#d4af37",
      secondaryColor: customPalette.secondary || "#f7e7ce",
      accentColor: customPalette.accent || "#a37c22",
      backgroundColor: customPalette.background || "#09080b",
      surfaceColor: "#131117",
      textColor: "#f9f8f6",
      textMutedColor: "#9c968f",
      typography: {
        displayFont: "'Syne', sans-serif",
        bodyFont: "'Inter', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap",
        headingClass: "font-['Syne'] tracking-wider font-extrabold uppercase",
        bodyClass: "font-['Inter'] font-light leading-relaxed"
      },
      borderRadius: "12px",
      borderRadiusClass: "rounded-xl",
      cardStyle: "bg-[#131117]/90 border border-[#d4af37]/25 shadow-2xl backdrop-blur-md rounded-xl hover:border-[#d4af37]/70 hover:shadow-[#d4af37]/10 transition-all duration-500",
      buttonStyle: "bg-gradient-to-r from-[#d4af37] via-[#f7e7ce] to-[#d4af37] text-[#09080b] font-bold py-4 px-9 rounded-xl shadow-lg hover:shadow-[#d4af37]/30 hover:scale-[1.02] transition-all duration-300",
      buttonSecondaryStyle: "bg-transparent border border-[#d4af37]/50 text-[#f7e7ce] font-semibold py-4 px-9 rounded-xl hover:bg-[#d4af37]/10 transition-all duration-300",
      background: "bg-[#09080b] text-[#f9f8f6] min-h-screen selection:bg-[#d4af37]/25",
      gradients: {
        heading: "bg-gradient-to-r from-white via-[#f7e7ce] to-[#d4af37] bg-clip-text text-transparent",
        surface: "bg-gradient-to-b from-[#131117] via-[#09080b] to-[#131117]",
        glow: "from-[#d4af37]/15 via-transparent to-transparent"
      },
      shadowStyle: "0 10px 30px -10px rgba(212, 175, 55, 0.18)",
      spacing: {
        sectionPadding: "py-28 px-6 sm:px-10 lg:px-16",
        cardGap: "gap-10",
        containerMax: "max-w-7xl mx-auto"
      }
    };
  }

  if (t.includes("cyberpunk") || t.includes("neon") || t.includes("glitch") || t.includes("punk")) {
    return {
      theme: "Cyberpunk",
      primaryColor: customPalette.primary || "#00ffff",
      secondaryColor: customPalette.secondary || "#ff007f",
      accentColor: customPalette.accent || "#fee801",
      backgroundColor: customPalette.background || "#050508",
      surfaceColor: "#0f0f18",
      textColor: "#ffffff",
      textMutedColor: "#a1a1aa",
      typography: {
        displayFont: "'Share Tech Mono', monospace",
        bodyFont: "'JetBrains Mono', monospace",
        fontImport: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Share+Tech+Mono&display=swap",
        headingClass: "font-['Share-Tech-Mono',monospace] tracking-widest font-bold uppercase",
        bodyClass: "font-['JetBrains-Mono',monospace] leading-normal text-sm"
      },
      borderRadius: "0px",
      borderRadiusClass: "rounded-none",
      cardStyle: "bg-[#0a0a12] border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-none hover:border-pink-500 hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all duration-200",
      buttonStyle: "bg-cyan-400 hover:bg-pink-500 text-black hover:text-white font-black uppercase py-3.5 px-8 rounded-none shadow-[0_0_20px_rgba(0,255,255,0.6)] hover:shadow-[0_0_25px_rgba(255,0,127,0.8)] transition-all duration-200",
      buttonSecondaryStyle: "bg-transparent border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white font-black uppercase py-3.5 px-8 rounded-none shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all duration-200",
      background: "bg-[#050508] text-white min-h-screen selection:bg-pink-500 selection:text-white",
      gradients: {
        heading: "bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]",
        surface: "bg-gradient-to-b from-[#0a0a14] via-[#050508] to-[#0a0a14]",
        glow: "from-cyan-500/20 via-pink-500/10 to-transparent"
      },
      shadowStyle: "0 0 15px rgba(0, 255, 255, 0.35)",
      spacing: {
        sectionPadding: "py-24 px-4 sm:px-6 lg:px-10",
        cardGap: "gap-8",
        containerMax: "max-w-7xl mx-auto"
      }
    };
  }

  if (t.includes("nature") || t.includes("organic") || t.includes("eco") || t.includes("green")) {
    return {
      theme: "Nature",
      primaryColor: customPalette.primary || "#386641",
      secondaryColor: customPalette.secondary || "#a3b18a",
      accentColor: customPalette.accent || "#e07a5f",
      backgroundColor: customPalette.background || "#121b18",
      surfaceColor: "#1a2622",
      textColor: "#f4f1de",
      textMutedColor: "#adb5bd",
      typography: {
        displayFont: "'Plus Jakarta Sans', sans-serif",
        bodyFont: "'Outfit', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap",
        headingClass: "font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight",
        bodyClass: "font-['Outfit'] leading-relaxed"
      },
      borderRadius: "24px",
      borderRadiusClass: "rounded-3xl",
      cardStyle: "bg-[#1a2622]/80 border border-[#a3b18a]/20 shadow-xl backdrop-blur-sm rounded-3xl hover:border-[#a3b18a]/60 hover:-translate-y-1 transition-all duration-300",
      buttonStyle: "bg-[#386641] hover:bg-[#2d5234] text-[#f4f1de] font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-[#386641]/30 transition-all duration-300",
      buttonSecondaryStyle: "bg-[#1a2622] hover:bg-[#23332e] text-[#a3b18a] border border-[#a3b18a]/40 font-bold py-4 px-8 rounded-full transition-all duration-300",
      background: "bg-[#121b18] text-[#f4f1de] min-h-screen selection:bg-[#386641]/40",
      gradients: {
        heading: "bg-gradient-to-r from-[#f4f1de] via-[#a3b18a] to-[#386641] bg-clip-text text-transparent",
        surface: "bg-gradient-to-b from-[#16211d] via-[#121b18] to-[#16211d]",
        glow: "from-[#386641]/20 via-[#a3b18a]/10 to-transparent"
      },
      shadowStyle: "0 10px 25px -5px rgba(56, 102, 65, 0.25)",
      spacing: {
        sectionPadding: "py-28 px-6 sm:px-8 lg:px-12",
        cardGap: "gap-8",
        containerMax: "max-w-6xl mx-auto"
      }
    };
  }

  if (t.includes("warm") || t.includes("sunset") || t.includes("cozy") || t.includes("terracotta") || t.includes("restaurant") || t.includes("food")) {
    return {
      theme: "Warm",
      primaryColor: customPalette.primary || "#e05a38",
      secondaryColor: customPalette.secondary || "#f49e4c",
      accentColor: customPalette.accent || "#fae5d3",
      backgroundColor: customPalette.background || "#171311",
      surfaceColor: "#241e1b",
      textColor: "#faf6f0",
      textMutedColor: "#a39990",
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap",
        headingClass: "font-['Outfit'] font-bold tracking-tight",
        bodyClass: "font-['Inter'] leading-relaxed"
      },
      borderRadius: "16px",
      borderRadiusClass: "rounded-2xl",
      cardStyle: "bg-[#241e1b]/90 border border-[#e05a38]/25 shadow-lg rounded-2xl hover:border-[#f49e4c]/60 hover:shadow-[#e05a38]/15 transition-all duration-300",
      buttonStyle: "bg-gradient-to-r from-[#e05a38] to-[#f49e4c] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-[#e05a38]/30 hover:-translate-y-0.5 transition-all duration-200",
      buttonSecondaryStyle: "bg-transparent border border-[#f49e4c]/50 text-[#fae5d3] font-semibold py-3.5 px-8 rounded-2xl hover:bg-[#e05a38]/10 transition-all duration-200",
      background: "bg-[#171311] text-[#faf6f0] min-h-screen selection:bg-[#e05a38]/30",
      gradients: {
        heading: "bg-gradient-to-r from-[#faf6f0] via-[#fae5d3] to-[#e05a38] bg-clip-text text-transparent",
        surface: "bg-gradient-to-b from-[#241e1b] via-[#171311] to-[#241e1b]",
        glow: "from-[#e05a38]/20 via-[#f49e4c]/10 to-transparent"
      },
      shadowStyle: "0 12px 28px -6px rgba(224, 90, 56, 0.2)",
      spacing: {
        sectionPadding: "py-24 px-6 md:px-12",
        cardGap: "gap-8",
        containerMax: "max-w-6xl mx-auto"
      }
    };
  }

  if (t.includes("glass") || t.includes("frosted") || t.includes("blur") || t.includes("ethereal")) {
    return {
      theme: "Glassmorphism",
      primaryColor: customPalette.primary || "#8b5cf6",
      secondaryColor: customPalette.secondary || "#38bdf8",
      accentColor: customPalette.accent || "#ec4899",
      backgroundColor: customPalette.background || "#080816",
      surfaceColor: "rgba(255, 255, 255, 0.06)",
      textColor: "#ffffff",
      textMutedColor: "#cbd5e1",
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Outfit:wght@500;600;700;800&display=swap",
        headingClass: "font-['Outfit'] font-bold tracking-tight",
        bodyClass: "font-['Inter'] leading-relaxed font-light"
      },
      borderRadius: "20px",
      borderRadiusClass: "rounded-[20px]",
      cardStyle: "bg-white/[0.06] backdrop-blur-xl border border-white/[0.15] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[20px] hover:bg-white/[0.1] hover:border-white/[0.25] transition-all duration-300",
      buttonStyle: "bg-gradient-to-r from-violet-600 via-sky-500 to-pink-500 text-white font-bold py-3.5 px-8 rounded-full shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105",
      buttonSecondaryStyle: "bg-white/[0.08] backdrop-blur-md border border-white/20 text-white font-semibold py-3.5 px-8 rounded-full hover:bg-white/15 transition-all duration-300",
      background: "bg-[#080816] text-white min-h-screen selection:bg-violet-500/30",
      gradients: {
        heading: "bg-gradient-to-r from-white via-sky-300 to-pink-400 bg-clip-text text-transparent",
        surface: "bg-gradient-to-b from-[#0e0e24] via-[#080816] to-[#0e0e24]",
        glow: "from-violet-600/30 via-pink-500/20 to-sky-500/20"
      },
      shadowStyle: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      spacing: {
        sectionPadding: "py-28 px-6 sm:px-8 lg:px-12",
        cardGap: "gap-8",
        containerMax: "max-w-7xl mx-auto"
      }
    };
  }

  if (t.includes("neumorph") || t.includes("soft") || t.includes("clay") || t.includes("inset")) {
    return {
      theme: "Neumorphism",
      primaryColor: customPalette.primary || "#6366f1",
      secondaryColor: customPalette.secondary || "#94a3b8",
      accentColor: customPalette.accent || "#10b981",
      backgroundColor: customPalette.background || "#14171f",
      surfaceColor: "#181c26",
      textColor: "#e2e8f0",
      textMutedColor: "#8b93a7",
      typography: {
        displayFont: "'Space Grotesk', sans-serif",
        bodyFont: "'Inter', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap",
        headingClass: "font-['Space_Grotesk'] font-bold tracking-tight",
        bodyClass: "font-['Inter'] leading-relaxed"
      },
      borderRadius: "20px",
      borderRadiusClass: "rounded-2xl",
      cardStyle: "bg-[#14171f] rounded-2xl shadow-[8px_8px_16px_#0b0d12,-8px_-8px_16px_#1d212c] border border-slate-800/60 hover:shadow-[10px_10px_20px_#090b0e,-10px_-10px_20px_#1f232e] transition-all duration-300",
      buttonStyle: "bg-[#14171f] text-indigo-400 font-bold py-3.5 px-8 rounded-2xl shadow-[6px_6px_12px_#0a0c11,-6px_-6px_12px_#1e222d] hover:text-indigo-300 active:shadow-[inset_4px_4px_8px_#0a0c11,inset_-4px_-4px_8px_#1e222d] transition-all duration-200",
      buttonSecondaryStyle: "bg-[#14171f] text-slate-300 font-semibold py-3.5 px-8 rounded-2xl shadow-[4px_4px_8px_#0a0c11,-4px_-4px_8px_#1e222d] active:shadow-[inset_4px_4px_8px_#0a0c11,inset_-4px_-4px_8px_#1e222d] transition-all duration-200",
      background: "bg-[#14171f] text-slate-200 min-h-screen selection:bg-indigo-500/20",
      gradients: {
        heading: "bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent",
        surface: "bg-[#14171f]",
        glow: "from-indigo-500/10 via-transparent to-transparent"
      },
      shadowStyle: "8px 8px 16px #0b0d12, -8px -8px 16px #1d212c",
      spacing: {
        sectionPadding: "py-24 px-6 md:px-12",
        cardGap: "gap-8",
        containerMax: "max-w-6xl mx-auto"
      }
    };
  }

  if (t.includes("gaming") || t.includes("esport") || t.includes("stream")) {
    return {
      theme: "Gaming",
      primaryColor: customPalette.primary || "#ff4500",
      secondaryColor: customPalette.secondary || "#ff8c00",
      accentColor: customPalette.accent || "#ffdd00",
      backgroundColor: customPalette.background || "#0a0500",
      surfaceColor: "#170a02",
      textColor: "#ffffff",
      textMutedColor: "#d4a373",
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'Space Grotesk', sans-serif",
        fontImport: "https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Space+Grotesk:wght@500;700&display=swap",
        headingClass: "font-['Outfit'] font-black tracking-tighter uppercase italic",
        bodyClass: "font-['Space_Grotesk'] leading-normal"
      },
      borderRadius: "8px",
      borderRadiusClass: "rounded-lg",
      cardStyle: "bg-[#170a02]/90 border-2 border-[#ff4500]/50 shadow-[0_0_20px_rgba(255,69,0,0.3)] rounded-lg hover:border-[#ffdd00] hover:shadow-[0_0_30px_rgba(255,221,0,0.5)] transition-all duration-300",
      buttonStyle: "bg-gradient-to-r from-[#ff4500] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffdd00] text-black font-black uppercase py-4 px-9 rounded-lg shadow-[0_0_25px_rgba(255,69,0,0.6)] transition-all transform hover:-translate-y-1",
      buttonSecondaryStyle: "bg-transparent border-2 border-[#ff8c00] text-[#ffdd00] hover:bg-[#ff8c00]/20 font-extrabold uppercase py-4 px-9 rounded-lg transition-all",
      background: "bg-[#0a0500] text-white min-h-screen selection:bg-[#ff4500]/50",
      gradients: {
        heading: "bg-gradient-to-r from-white via-[#ffdd00] to-[#ff4500] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,69,0,0.5)]",
        surface: "bg-gradient-to-b from-[#140a02] via-[#0a0500] to-[#140a02]",
        glow: "from-[#ff4500]/30 via-[#ffdd00]/15 to-transparent"
      },
      shadowStyle: "0 0 25px rgba(255, 69, 0, 0.4)",
      spacing: {
        sectionPadding: "py-28 px-6 sm:px-8 lg:px-12",
        cardGap: "gap-8",
        containerMax: "max-w-7xl mx-auto"
      }
    };
  }

  // Default fallback: Modern Vibrant Electric Theme (SaaS / Tech / AI / Futuristic)
  return {
    theme: "Modern",
    primaryColor: customPalette.primary || "#4f46e5",
    secondaryColor: customPalette.secondary || "#06b6d4",
    accentColor: customPalette.accent || "#ec4899",
    backgroundColor: customPalette.background || "#0b0f19",
    surfaceColor: "#131b2e",
    textColor: "#f8fafc",
    textMutedColor: "#94a3b8",
    typography: {
      displayFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Inter', sans-serif",
      fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap",
      headingClass: "font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight",
      bodyClass: "font-['Inter'] leading-relaxed font-normal"
    },
    borderRadius: "16px",
    borderRadiusClass: "rounded-2xl",
    cardStyle: "bg-slate-900/80 border border-indigo-500/20 shadow-xl backdrop-blur-md rounded-2xl hover:border-cyan-400/50 hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1",
    buttonStyle: "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5",
    buttonSecondaryStyle: "bg-slate-900/90 border border-slate-700 hover:border-indigo-400 text-slate-200 font-semibold py-3.5 px-8 rounded-full transition-all duration-300",
    background: "bg-[#0b0f19] text-slate-100 min-h-screen selection:bg-indigo-500/30",
    gradients: {
      heading: "bg-gradient-to-r from-white via-indigo-200 to-cyan-400 bg-clip-text text-transparent",
      surface: "bg-gradient-to-b from-[#101726] via-[#0b0f19] to-[#101726]",
      glow: "from-indigo-500/20 via-purple-500/15 to-cyan-400/10"
    },
    shadowStyle: "0 20px 25px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(6, 182, 212, 0.1)",
    spacing: {
      sectionPadding: "py-28 px-6 sm:px-8 lg:px-12",
      cardGap: "gap-8",
      containerMax: "max-w-7xl mx-auto"
    }
  };
}


// ─── Phase 8.7 Intelligent Content Generation Engine ──────────────────────────
export function getIntelligentDomainContent(businessType, websiteName = "Website", prompt = "") {
  const type = (businessType || "Technology").toLowerCase();
  const brand = websiteName || "Our Enterprise";

  if (type.includes("restaurant") || type.includes("food") || type.includes("gastronomy") || type.includes("culinary") || type.includes('cafe') || type.includes('bistro')) {
    return {
      features: [
        { title: "Artisanal Wood-Fired Hearth", desc: "Every loaf and hand-stretched crust is ember-fired at 800°F using sustainable centuries-old oak and aromatic cherry wood.", icon: "🔥" },
        { title: "Biodynamic Farm Sourcing", desc: "Daily harvest partnerships with organic micro-farms guarantee peak seasonal ripeness and nutrient density.", icon: "🌿" },
        { title: "Curated Sommelier Cellar", desc: "Over 850 rare old-world vintages and biodynamic natural wines selected to elevate every tasting course.", icon: "🍷" },
        { title: "Private Acoustical Salons", desc: "Architecturally sound-dampened salons designed for confidential gatherings and memorable celebrations.", icon: "✨" }
      ],
      testimonials: [
        { quote: "A transcendent culinary performance where ancestral heritage intertwines effortlessly with audacious modern gastronomy.", author: "Chef Laurent Mercier", role: "Chief Gastronomy Reviewer", company: "Culinary Quarterly" },
        { quote: "The 12-course seasonal tasting journey redefines sensory precision. Every plating is an architectural masterpiece.", author: "Elena Rostova", role: "Principal Patron", company: "International Taste Council" },
        { quote: "Impeccable table-side hospitality paired with flavors that linger in memory for weeks. Our undisputed favorite.", author: "Marcus Vance", role: "Editor in Chief", company: "Metropolitan Epicurean" }
      ],
      pricing: [
        { name: "Prix Fixe Lunch", price: "$68", period: "/ guest", desc: "An elegant three-course midday culinary prelude designed for modern business engagements.", features: ["Chef's Daily amuse-bouche", " Choice of heirloom starter", "Pastured entree selection", "Handmade artisan truffles"], btnText: "Reserve Lunch Experience", highlighted: false, tag: "Midday Elegance" },
        { name: "Signature Tasting", price: "$185", period: "/ guest", desc: "Our definitive seven-course immersive culinary exploration showcasing seasonal harvests.", features: ["7 seasonal courses", "Dedicated sommelier intro", "Table-side flambé service", "Signed commemorative menu"], btnText: "Book Tasting Journey", highlighted: true, tag: "Chef's Recommendation" },
        { name: "Chef's Table Vault", price: "$350", period: "/ guest", desc: "An exclusive culinary theater experience seated directly overlooking the live exhibition hearth.", features: ["12-course experimental menu", "Grand Cru wine pairings", "Private kitchen walkthrough", "Chauffeur car reservation"], btnText: "Inquire Chef's Vault", highlighted: false, tag: "Ultimate VIP" }
      ],
      faqs: [
        { q: "How far in advance should we reserve gastronomy experiences?", a: "Main gastronomy room bookings open 30 days in advance via our digital booking concierge. Chef's Table inquiries require 45-day notice." },
        { q: "Do you accommodate complex dietary allergens and plant-based tasting preferences?", a: "Yes. Our culinary team meticulously crafts bespoke botanical and gluten-free tasting menus with 24 hours advance notification." },
        { q: "What is the dress code for the evening gastronomy salon?", a: "We embrace smart elegant and tailored attire to complement the elevated sensory atmosphere of our gastronomy room." },
        { q: "Are private corporate culinary buyouts available?", a: "Our private tasting terrace and wine vault accommodate intimate private assemblies up to 64 guests with custom printed menus." }
      ],
      statistics: [
        { val: "2", label: "Michelin Recognition", desc: "Awarded for exceptional culinary discipline, harmonic flavors, and consistent precision." },
        { val: "100%", label: "Organic Farm Heritage", desc: "Every produce item is harvested within 40 miles by partnered heritage agriculturalists." },
        { val: "850+", label: "Vintage Cellar Bottles", desc: "A world-class repository of rare vintages, champagne reserves, and biodynamic varietals." },
        { val: "4.9★", label: "Epicurean Rating", desc: "Consistently celebrated by gastronomic guild critics and sophisticated global diners." }
      ],
      mission: "To elevate gastronomy into a transformative sensory art form by honoring heritage organic agriculture, uncompromising flavor precision, and genuine hospitality.",
      company_values: [
        { title: "Culinary Integrity", desc: "We never compromise on the provenance or seasonal ethical harvest of our culinary ingredients." },
        { title: "Sensory Harmony", desc: "Every architectural light ray, acoustic resonance, and aroma is orchestrated for guest serenity." },
        { title: "Relentless Innovation", desc: "Respecting tradition while fearlessly pioneering modern gastronomic techniques and presentation." }
      ],
      about: {
        title: `The Culinary Heritage of ${brand}`,
        subtitle: "Where ancestral wood-fired traditions meet audacious modern culinary theater.",
        intro: `${brand} was founded on a singular vision: to create an immersive gastronomical sanctuary where genuine farm-to-table ethics and haute cuisine coalesce. Our kitchen celebrates the rhythm of the changing seasons, respecting the soil, sea, and flame.`,
        missionTitle: "Our Gastronomic Mission",
        missionDesc: "To nourish the soul through authentic flavors, sustainable local cultivation, and world-class table-side storytelling.",
        visionTitle: "Our Vision for Hospitality",
        visionDesc: "Setting the global benchmark for modern gastronomy where architectural elegance and warm, unpretentious hospitality harmonize."
      },
      contact: {
        title: "Inquire & Table Bookings",
        subtitle: "Connect with our maitre d' and guest relations team for bookings, private gatherings, or culinary events.",
        btnText: "Send Gastronomy Inquiry",
        firstNamePlaceholder: "Julian",
        emailPlaceholder: "julian.vance@epicurean.com",
        messagePlaceholder: "Please let us know your reservation preferences, target dates, or dietary considerations..."
      }
    };
  }

  if (type.includes("law") || type.includes("legal") || type.includes("attorney") || type.includes("litigation") || type.includes("counsel") || type.includes("jurist")) {
    return {
      features: [
        { title: "Cross-Border Commercial Litigation", desc: "Rigorous legal courtroom representation across international jurisdictional arbitration and complex corporate disputes.", icon: "⚖️" },
        { title: "Intellectual Property Vaulting", desc: "Defending groundbreaking patent architectures, trade secrets, and institutional digital asset portfolios.", icon: "🛡️" },
        { title: "Regulatory Compliance & Governance", desc: "Navigating antitrust mandates, SEC oversight, and evolving algorithmic compliance frameworks with absolute clarity.", icon: "📜" },
        { title: "Mergers & Strategic Restructuring", desc: "Deft transaction negotiating and structural due diligence for multi-billion dollar enterprise acquisitions.", icon: "🤝" }
      ],
      testimonials: [
        { quote: "Their litigation counsel secured an unassailable summary judgment in our most demanding cross-border patent dispute.", author: "Harold Sterling, Esq.", role: "General Counsel", company: "Apex Global Telecommunications" },
        { quote: "An unmatched combination of analytical courtroom vigor and diplomatic negotiated finesse. Essential legal advisors.", author: "Victoria Kensington", role: "Managing Director", company: "Vanguard Capital Partners" },
        { quote: "When institutional reputation and complex governance are on the line, there is simply no legal team we trust more.", author: "Hon. Jonathan Thorne", role: "Senior Corporate Trustee", company: "Standard Equities Corp" }
      ],
      pricing: [
        { name: "Corporate Advisory", price: "Retainer", period: "/ monthly", desc: "Dedicated institutional on-call regulatory counsel and governance compliance review.", features: ["Monthly legal audits", "24/7 senior partner direct line", "Contract & NDA adjudication", "Risk mitigation roadmapping"], btnText: "Engage Advisory Retainer", highlighted: false, tag: "Corporate Standard" },
        { name: "Complex Litigation", price: "Custom Fee", period: "/ milestone", desc: "Full-scale trial representation, forensic evidence discovery, and appellate advocacy.", features: ["Lead trial attorney defense", "Dedicated analytical deposition team", "Forensic expert witness network", "Mock courtroom arbitration"], btnText: "Request Defense Consultation", highlighted: true, tag: "Trial Counsel" },
        { name: "M&A Transaction Suite", price: "Project", period: "/ closing", desc: "End-to-end structural acquisition counseling, fiduciary evaluation, and antitrust clearance.", features: ["Exhaustive due diligence vault", "Antitrust regulatory filings", "Executive compensation structuring", "Closing Escrow coordination"], btnText: "Inquire M&A Representation", highlighted: false, tag: "Strategic Capital" }
      ],
      faqs: [
        { q: "What is your typical protocol for initial confidential legal consultations?", a: "We initiate all prospective client reviews under comprehensive mutual non-disclosure agreements, conducting a thorough conflict-of-interest analysis within 4 hours before connecting you with a specialized Lead Trial Partner." },
        { q: "How does the firm structure its fee schedules for complex commercial disputes?", a: "We provide flexible billing structures including predictable fixed monthly retainers, transparent hybrid milestone invoicing, or traditional billable parameters tailored to corporate board requirements." },
        { q: "Can your team actively manage concurrent litigation across international jurisdictions?", a: "Yes. Our trial partners maintain active admission across key domestic Federal Appellate benches and partner with allied chambers in London, Singapore, and Brussels for unified cross-border advocacy." },
        { q: "How do you guarantee absolute confidentiality for digital evidence and intellectual property?", a: "We deploy air-gapped, zero-knowledge encryption repositories compliant with strict defense-grade intelligence standards to safeguard client litigation files and trade secrets." }
      ],
      statistics: [
        { val: "$4.8B+", label: "Client Equity Protected", desc: "Total asset and trial valuation preserved through favorable courtroom verdicts and negotiated settlements." },
        { val: "98.4%", label: "Favorable Ruling Record", desc: "Unwavering commitment to rigorous evidence discovery, thorough brief drafting, and appellate mastery." },
        { val: "35+", label: "Years Courtroom Prestige", desc: "Representing Fortune 500 enterprises, innovative sovereign funds, and global financial institutions." },
        { val: "14", label: "Supreme & Appellate Wins", desc: "Setting judicial precedents across corporate intellectual property and international commercial arbitration." }
      ],
      mission: "To deliver uncompromising judicial representation and strategic corporate legal counsel with impeccable ethical standards, razor-sharp analytical rigor, and relentless dedication to our clients' advocacy.",
      company_values: [
        { title: "Judicial Precision", desc: "Every brief, argument, and contract is constructed with forensic attention to statutory depth and precedent." },
        { title: "Unwavering Fiduciary Honor", desc: "Our clients' strategic welfare and confidentiality remain the absolute focal point of our practice." },
        { title: "Courageous Advocacy", desc: "We step into the most challenging courtroom disputes with poise, factual tenacity, and seasoned trial strategy." }
      ],
      about: {
        title: `The Legal Architecture of ${brand}`,
        subtitle: "Respected institutional trial lawyers defending enterprise rights, capital, and innovation.",
        intro: `${brand} stands at the forefront of modern jurisdictional advocacy. Founded by senior courtroom trial attorneys and former appellate clerks, our firm marries relentless evidentiary diligence with proactive corporate legal strategy. We protect our clients from liability while paving clear statutory runways for enterprise expansion.`,
        missionTitle: "Our Fiduciary Commitment",
        missionDesc: "Defending client equity and reputation through uncompromising courtroom defense and forward-looking regulatory guidance.",
        visionTitle: "Our Vision for Jurisprudence",
        visionDesc: "Modernizing corporate litigation through rapid analytical synthesis, uncompromising ethical depth, and proven trial mastery."
      },
      contact: {
        title: "Confidential Legal Consultation",
        subtitle: "Initiate secure communication with our senior trial partners to review commercial disputes or corporate advisory matters.",
        btnText: "Submit Confidential Inquiry",
        firstNamePlaceholder: "Harrison",
        emailPlaceholder: "h.sterling@enterprise-group.com",
        messagePlaceholder: "Briefly describe the legal jurisdiction, industry sector, or corporate advisory objectives under review..."
      }
    };
  }

  if (type.includes("gym") || type.includes("fitness") || type.includes("workout") || type.includes('athletic') || type.includes('training') || type.includes('crossfit') || type.includes('strength') || type.includes('bodybuilding')) {
    return {
      features: [
        { title: "Biometric Performance Testing", desc: "Clinical VO2 Max testing, Dexa body composition scanning, and real-time lactate threshold analytics to optimize training." , icon: "🔬" },
        { title: "Pro-Grade Olympic Armor & Racks", desc: "Calibrated Eleiko plates, custom monorail squat cages, and biomechanically engineered pneumatic resistance isolators.", icon: "🏋️" },
        { title: "Cryo & Thermal Recovery Suites", desc: "Contrast plunge therapy pools, infrared sauna chambers, and compression lymphatic drainage lounges for immediate cellular rejuvenation.", icon: "❄️" },
        { title: "24/7 Biometric Facial Access", desc: "Unrestricted round-the-clock athlete training access powered by frictionless facial recognition and secure locker suites.", icon: "⚡" }
      ],
      testimonials: [
        { quote: "The facility architecture and recovery suites completely transformed my Olympic preparation regimen. This is training without compromise.", author: "Marcus Vance", role: "Decathlon Gold Medalist", company: "National Athletics Team" },
        { quote: "Finally, an endurance sanctuary that prioritizes empirical science, calibrated equipment, and undisturbed focused atmosphere.", author: "Dr. Sarah Lin", role: "Exercise Biomechanist", company: "Apex Sports Medicine" },
        { quote: "From the air filtration quality to the customized periodization coaching, every millimeter of this facility screams world-class performance.", author: "Elena Rostrakova", role: "Professional CrossFit Competitor", company: "Titan Endurance Club" }
      ],
      pricing: [
        { name: "Off-Peak Athlete", price: "$125", period: "/ monthly", desc: "Ideal for structured morning and afternoon training routines with access to strength zones.", features: ["Access 5am - 2pm daily", "Olympic Strength & Conditioning Floor", "Standard Locker Room & Towels", "Monthly body composition scan"], btnText: "Select Off-Peak Tier", highlighted: false, tag: "Essential Athletic" },
        { name: "Premier Competitor", price: "$240", period: "/ monthly", desc: "Full unrestricted 24/7 biometric access to all training arenas and recovery suites.", features: ["24/7 Biometric Facial Access", "Full Thermal & Cryo Recovery Access", "Weekly VO2 & Dexa Biometric Review", "2 Guest Athlete passes per month"], btnText: "Join Premier Queue", highlighted: true, tag: "Most Popular" },
        { name: "All-Access VIP Elite", price: "$450", period: "/ monthly", desc: "The pinnacle athletic experience with private performance coaching and reserved recovery suites.", features: ["Dedicated Biomechanical Performance Coach", "Unlimited Private Cryo & Plunge Suites", "Custom Meal Kit & Electrolyte Concierge", "Private Reserved VIP Athlete Locker"], btnText: "Apply for Elite Status", highlighted: false, tag: "Pro Competitor" }
      ],
      faqs: [
        { q: "How does the 24/7 biometric facility access function during overnight hours?", a: "Members receive an encrypted facial template upon orientation, allowing instantaneous, secure round-the-clock entry into our well-lit, security-monitored athletic training zones and recovery suites." },
        { q: "Are personal coaches and biomechanical trainers certified in clinical physical rehabilitation?", a: "Yes. Every staff coach holds advanced degrees in Exercise Physiology or Biomechanics and works directly with physical rehabilitators to ensure injury-free strength progression." },
        { q: "Can we book private access to the cryothermal plunge and infrared recovery chambers?", a: "Premier and VIP Elite members can schedule 30-minute private recovery intervals via our digital athlete mobile application up to 7 days in advance." },
        { q: "Is there a membership pause policy during competitive off-seasons or travel?", a: "We accommodate flexible membership freezes up to 90 days per calendar year for traveling athletes, competition cycles, or medical rehabilitation." }
      ],
      statistics: [
        { val: "18,000", label: "Square Feet of Strength Arena", desc: "An expansive, high-ceiling facility engineered with acoustic damping and medical-grade air filtration." },
        { val: "100%", label: "Calibrated Eleiko Equipment", desc: "Every barbell, plate, and rack meets strict international competition standards for precise weight tolerances." },
        { val: "38°F", label: "Cold Plunge Thermal Recovery", desc: "Precision temperature-controlled aquatic recovery suites designed to halt inflammation and speed cellular repair." },
        { val: "24/7", label: "Frictionless Biometric Entry", desc: "Train precisely when your circadian cadence dictates with secure, private round-the-clock athlete access." }
      ],
      mission: "To forge unbreakable human potential by combining empirical sports science, calibrated equipment architecture, and uncompromising clinical recovery systems.",
      company_values: [
        { title: "Empirical Discipline", desc: "We discard gym fads in favor of clinically verified biomechanical training and measurable physiological adaptations." },
        { title: "Uncompromising Atmosphere", desc: "A clean, highly focused training arena free from clutter and distractions, built for serious athletes." },
        { title: "Holistic Regeneration", desc: "Recognizing that elite physical performance is forged equally on the training floor and within cold recovery plunge suites." }
      ],
      about: {
        title: `The Athlete Heritage of ${brand}`,
        subtitle: "Where hardcore physical stamina meets state-of-the-art sports science recovery.",
        intro: `${brand} was engineered by Olympic coaches and exercise biochemists who were frustrated by traditional commercial fitness clubs. We designed an elite human performance proving ground—uniting heavy free weights, indoor turf sprinting lanes, and clinical cryo-recovery chambers under one high-performance roof.`,
        missionTitle: "Our Athletic Mission",
        missionDesc: "Empowering everyday athletes and elite competitors to attain breakthrough physical performance through calibrated training tools and science-backed recovery.",
        visionTitle: "Our Vision for Fitness",
        visionDesc: "Setting a new global standard for human stamina facilities where design elegance, empirical training, and holistic health merge."
      },
      contact: {
        title: "Inquire & Athlete Orientation",
        subtitle: "Schedule your personal facility walkthrough, biometric assessment, and private coaching consultation.",
        btnText: "Schedule Walkthrough",
        firstNamePlaceholder: "Alex",
        emailPlaceholder: "alex.taylor@athlete-endurance.com",
        messagePlaceholder: "Tell us about your current athletic goals, target competition dates, or training facility preferences..."
      }
    };
  }

  if (type.includes("portfolio") || type.includes("developer") || type.includes("freelance") || type.includes("creator") || type.includes("resume")) {
    return {
      features: [
        { title: "Spatial WebXR & 3D Shaders", desc: "Hardware-accelerated Three.js glsl custom shaders and real-time ray-traced spatial interactions running smoothly at 60 FPS in-browser.", icon: "🌐" },
        { title: "Distributed Cloud Architectures", desc: "Resilient microservice topologies utilizing Docker, Kubernetes, and Serverless event queues to handle millions of daily concurrent operations.", icon: "⚡" },
        { title: "Modern State Machine Design", desc: "Clean TypeScript and React / Next.js engineering structured with deterministical functional reactive paradigms and instantaneous UX feedback.", icon: "🛠️" },
        { title: "Autonomous AI Agent Pipelines", desc: "Integrating LLM orchestration, semantic vector retrieval, and custom RAG memory architectures directly into enterprise production workflows.", icon: "🤖" }
      ],
      testimonials: [
        { quote: "Their engineering team architected our core interactive 3D WebGL configurator in half the projected timeframe. Performance jumped to a solid 60 FPS across mobile and desktop.", author: "Dr. Elena Vance", role: "VP of Engineering", company: "Vortex Spatial Engine" },
        { quote: "One of the rare software engineering minds who effortlessly bridges high-end cinematic graphic aesthetic with ironclad backend distributed architecture.", author: "Marcus Thorne", role: "Staff Cloud Architect", company: "Aether Cloud Group" },
        { quote: "His technical mastery of TypeScript state machines and WebSocket concurrency saved our live financial telemetry dashboard from catastrophic latency.", author: "Sophia Harrison", role: "Product VP", company: "FinGrid Analytics" }
      ],
      pricing: [
        { name: "Technical Architecture Audit", price: "$3,500", period: "/ audit", desc: "Exhaustive review of Frontend bundle bottlenecks, WebGL memory leaks, and Cloud system resiliency.", features: ["Full runtime performance profiling", "WebGL & Three.js shader optimization", "CI/CD & Docker deployment check", "Executive refactor blueprint report"], btnText: "Book Technical Audit", highlighted: false, tag: "Diagnostic Suite" },
        { name: "Dedicated Senior Contract", price: "$12,000", period: "/ monthly", desc: "Embedded fractional lead software engineer pushing production commits and mentoring dev squads.", features: ["20 hours weekly high-velocity output", "Full TypeScript / Next.js / Three.js dev", "Direct architecture system reviews", "Async Slack & Github code feedback"], btnText: "Engage Contract Retainer", highlighted: true, tag: "Available Now" },
        { name: "Custom 3D Engine Prototype", price: "$24,000", period: "/ build", desc: "From blank slate to production-ready interactive 3D spatial configurator or AI application suite.", features: ["Custom GLSL shader development", "Hardware-accelerated canvas animations", "Full responsive Next.js deployment", "Complete intellectual property transfer"], btnText: "Inquire Prototype Build", highlighted: false, tag: "Turnkey Project" }
      ],
      faqs: [
        { q: "What is your availability for embedding within existing agile engineering teams?", a: "I operate as a high-velocity embedded contract Principal Engineer or technical advisor, joining regular asynchronous stand-ups and taking direct ownership of mission-critical architecture sprints." },
        { q: "How do you guarantee cross-device performance for complex 3D Three.js scene renderings?", a: "By implementing progressive LOD (level-of-detail) geometric scaling, compressed Draco GLTF buffers, and fallback fallback raster pipelines for low-end graphic hardware." },
        { q: "What communication protocols do you maintain during distributed asynchronous development?", a: "All feature development is tracked via strict Github PR checklists, automated unit testing, CI preview builds, and daily clear asynchronous written status summaries." },
        { q: "Can you assist with IP handoff and internal engineering team training?", a: "Yes. Every concluded project includes exhaustive documentation, clean self-explanatory codebase structure, and dedicated interactive screen-recorded architecture handover seminars." }
      ],
      statistics: [
        { val: "60 FPS", label: "Guaranteed Render Speed", desc: "Zero jitter and silky fluid animation frames engineered across mobile and modern desktop GPUs." },
        { val: "50+", label: "Production Deployments", desc: "Resilient high-scale software applications built and successfully deployed for global enterprises." },
        { val: "99.99%", label: "Pipeline Reliability", desc: "Zero data corruption and bulletproof error recovery baked into distributed cloud services." },
        { val: "10+ Yrs", label: "Engineering Leadership", desc: "A decade of mastering Javascript ecosystems, spatial graphics, and distributed system design." }
      ],
      mission: "To craft breathtaking digital software that pairs cinematic graphic design with rigorous, scalable engineering practices—proving that beauty and raw computation can coexist.",
      company_values: [
        { title: "Clean Code Discipline", desc: "Self-documenting, strongly-typed functions designed for longevity, maintainability, and elegant peer review." },
        { title: "Performance First", desc: "Every millisecond of latency and unneeded bundle kilobyte is aggressively diagnosed and pruned." },
        { title: "Transparent Async Velocity", desc: "Proactive communication, rapid iterative deliverables, and absolute alignment with commercial project goals." }
      ],
      about: {
        title: `About ${brand} Studio`,
        subtitle: "Architecting high-velocity web software and cinematic spatial 3D experiences.",
        intro: `${brand} represents the convergence of high-performance modern software engineering and spatial digital artistry. Operating at the leading edge of React Three Fiber, TypeScript, and AI agent automation, we help innovative startups and global tech brands build interactive products that defy ordinary limits.`,
        missionTitle: "Technical Mission",
        missionDesc: "To eliminate the compromise between aesthetic immersion and architectural scalability in contemporary digital software.",
        visionTitle: "Vision for Interactive Compute",
        visionDesc: "Pioneering the web's transition from static two-dimensional layouts to responsive, spatial, hardware-accelerated 3D storytelling."
      },
      contact: {
        title: "Let's Build Something Extraordinary",
        subtitle: "Initiate a direct dialogue regarding project contracts, technical audits, or spatial compute development.",
        btnText: "Send Engineering Inquiry",
        firstNamePlaceholder: "Marcus",
        emailPlaceholder: "marcus.thorne@enterprise-saas.io",
        messagePlaceholder: "Outline your technical architecture challenges, desired timelines, or spatial application objectives..."
      }
    };
  }

  if (type.includes('education') || type.includes('school') || type.includes('college') || type.includes('university') || type.includes('academy') || type.includes('admission') || type.includes('course') || type.includes('learning') || type.includes('campus') || type.includes('tutor')) {
    return {
      features: [
        { title: "Interdisciplinary Curriculum", desc: "Rigorous accredited degree pathways integrating sciences, arts, innovative compute models, and global leadership.", icon: "🎓" },
        { title: "World-Class Research Labs", desc: "Access state-of-the-art innovation centers, interactive bioscience centers, and dedicated undergraduate research grants.", icon: "🔬" },
        { title: "Global Alumni Network", desc: "Connect with over 40,000 active alumni leading multinational corporations, research institutions, and modern public governance worldwide.", icon: "🌐" },
        { title: "Holistic Student Mentorship", desc: "Personalized faculty advising, career guidance counseling, and guaranteed professional industry residency incubation.", icon: "✨" }
      ],
      testimonials: [
        { quote: "The interdisciplinary research grants allowed me to lead autonomous bio-simulation trials during my sophomore year. It truly shaped my academic career.", author: "Elena Vance", role: "Alumnus, Class of '24", company: "Global Research Hub" },
        { quote: "Our faculty combines rigorous academic theory with real-world technological immersion. Our students graduate prepared to inspire and lead.", author: "Dr. Arthur Harrison", role: "Chair of Sciences", company: "Academy Fellowship" },
        { quote: "The admissions process was inviting, structured, and exceptionally warm. From our very first campus visit to orientation, the student community was inspiring.", author: "Marcus Thorne", role: "Parent of Scholar", company: "Patron Council" }
      ],
      pricing: [
        { name: "Undergraduate Degree Pathway", price: "$14,500", period: "/ semester", desc: "Full-time accredited bachelor programs with direct laboratory honors access and residential housing support.", features: ["Full 18-Credit Semester Load", "Dedicated Academic Mentor", "24/7 Innovation Lab Access", "Global Study Abroad Options"], btnText: "Apply Undergraduate", highlighted: true, tag: "Applications Open" },
        { name: "Graduate Master & Ph.D.", price: "$18,000", period: "/ semester", desc: "Advanced thesis-driven fellowships with full stipend opportunities and research partner placement.", features: ["Full Grant & Stipend Eligibility", "Dedicated Lab Workspace", "Direct Industry Incubation", "Co-Authored Publication Rights"], btnText: "Inquire Graduate Fellowship", highlighted: false, tag: "Research Tier" },
        { name: "Executive Leadership Certificate", price: "$4,200", period: "/ module", desc: "Intensive 10-week cohort masterclasses designed for aspiring executives and practical institutional innovators.", features: ["Live Weekend Masterclasses", "Direct Faculty Case Reviews", "Lifetime Alumni Network", "Verified Credential Diploma"], btnText: "Enroll Executive Module", highlighted: false, tag: "Fast Track" }
      ],
      faqs: [
        { q: "What are the priority admission deadlines and evaluation criteria for incoming students?", a: "Priority early action admissions close November 15th, with regular decision rolling reviews continuing through March 1st. We evaluate holistic portfolios, academic curiosity, and positive leadership impact." },
        { q: "Are scholarships and financial research fellowships available for enrolled students?", a: "Yes. Over 65% of our admitted undergrad and graduate cohorts receive generous merit scholarships, need-based tuition waivers, and departmental research fellowships." },
        { q: "How can prospective scholars and families schedule an interactive campus tour?", a: "You can reserve an in-person campus orientation or an immersive 3D guided interactive virtual walkthrough directly through our Admissions Portal at any time." },
        { q: "Do degree programs offer guaranteed professional internship placements?", a: "Our dedicated Global Alumni & Career Partners network coordinates structured residency interviews with premier global engineering, science, and creative institutions." }
      ],
      statistics: [
        { val: "98.4%", label: "Career Placement Rate", desc: "Students successfully placed in premier doctoral fellowships or industry careers within 90 days." },
        { val: "14 : 1", label: "Student to Faculty Ratio", desc: "Intimate seminar sizes guaranteeing direct, supportive mentorship from experienced professors." },
        { val: "$24M+", label: "Annual Research Endowment", desc: "Direct fellowship funding dedicated exclusively to student innovation and laboratory experimentation." },
        { val: "45+", label: "Global Innovation Centers", desc: "Interdisciplinary research hubs spanning advanced computation, sustainability, and bio-sciences." }
      ],
      mission: "To foster an inspiring, intellectually vibrant environment that empowers brilliant minds to lead transformative discoveries and lifelong human excellence.",
      company_values: [
        { title: "Intellectual Curiosity", desc: "We champion open empirical exploration, disciplined analytical thought, and boundless discovery." },
        { title: "Inclusive Community", desc: "We build warm, highly collaborative campus ecosystems where diverse perspectives ignite breakthrough innovation." },
        { title: "Enduring Integrity", desc: "We uphold uncompromised ethical standards in scholarship, scientific experimentation, and leadership." }
      ],
      about: {
        title: `Academic Heritage of ${brand}`,
        subtitle: "Where rigorous classical scholarship merges with modern experiential discovery.",
        intro: `${brand} was established by educational pioneers and groundbreaking scientific researchers with a clear conviction: academic excellence must be dynamic, collaborative, and deeply aligned with global progress. By pairing hands-on experimental research with supportive faculty mentorship, we cultivate ambitious thinkers equipped to enrich society.`,
        missionTitle: "Academic Mission",
        missionDesc: "Empowering visionary scholars through interdisciplinary discovery, ethical leadership, and enduring scientific excellence.",
        visionTitle: "Vision for Education",
        visionDesc: "Redefining higher learning as a collaborative, lifelong innovation ecosystem that elevates human potential worldwide."
      },
      contact: {
        title: "Connect with Admissions & Academic Advisory",
        subtitle: "Schedule your personal campus tour, academic transcript review, or faculty consultation.",
        btnText: "Send Admissions Inquiry",
        firstNamePlaceholder: "Elena",
        emailPlaceholder: "elena.vance@academic-academy.edu",
        messagePlaceholder: "Tell us about your academic interests, target enrollment term, or preferred field of study..."
      }
    };
  }

  if (type === 'space' || type.includes('space') || type.includes('aerospace')) {
    return {
      features: [
        { title: "Advanced Aerospace Propulsion", desc: "Next-generation thermonuclear and electric propulsion systems engineered for long-duration interplanetary transit.", icon: "🚀" },
        { title: "Low Earth Constellations", desc: "High-bandwidth low-latency global communication networks and high-resolution Earth observation platforms.", icon: "🛰️" },
        { title: "Lunar & Interplanetary Habitats", desc: "Modular, radiation-shielded biological life support structures designed for permanent human settlement.", icon: "🌌" },
        { title: "Deep Space Telemetry", desc: "Real-time astronomical tracking, sub-millisecond optical communications, and deep space mapping systems.", icon: "📡" }
      ],
      testimonials: [
        { quote: "OrbitalX's launch frequency and heavy-lift reliability allowed us to deploy our entire satellite constellation ahead of manifest schedule.", author: "Marcus Thorne", role: "VP of Telecommunications", company: "Aether Link Constellation" },
        { quote: "Their propulsion engineering is years ahead of the industry standard. The telemetry data from our Mars explorer exceeded expectations.", author: "Dr. Elena Vance", role: "Director of Exploration", company: "Deep Space Horizons" },
        { quote: "A masterclass in aerospace execution. The lunar payload was delivered safely, precisely, and within operational budget.", author: "Arthur Sterling", role: "EVP of Mission Operations", company: "Lunar Pioneer Group" }
      ],
      pricing: [
        { name: "CubeSat Share", price: "$180K", period: "/ launch", desc: "Shared rideshare manifest for small satellite payloads into Low Earth Orbit.", features: ["Up to 12U payload space", "Standard orbital insertion", "Telemetry & deployment confirm", "Basic mission integration support"], btnText: "Book Rideshare Slot", highlighted: false, tag: "Rideshare Standard" },
        { name: "Dedicated Medium", price: "$4.5M", period: "/ launch", desc: "Dedicated medium-lift launch vehicle tailored for customized orbits and specific solar trajectories.", features: ["Up to 1,500kg payload mass", "Custom orbital inclination", "Advanced telemetry diagnostics", "24/7 dedicated mission manager"], btnText: "Reserve Launch Vehicle", highlighted: true, tag: "Mission Dedicated" },
        { name: "Heavy Lift Manifest", price: "Custom", period: "/ mission", desc: "Heavy-lift and interplanetary transit services for deep space probes or space station components.", features: ["Up to 15,000kg payload mass", "Interplanetary transfer trajectory", "Specialized payload integration", "Custom biological isolation vault"], btnText: "Inquire Custom Manifest", highlighted: false, tag: "Deep Space VIP" }
      ],
      faqs: [
        { q: "What is your typical lead time for custom commercial payload integration?", a: "Standard CubeSat integrations require 90 days. Dedicated medium and heavy-lift payloads require 180 days for final launch manifest approval." },
        { q: "Do you support custom orbital inclinations and deep space transfer trajectories?", a: "Yes. Our dedicated mission stages support sun-synchronous, geostationary transfer, and planetary escape trajectories." },
        { q: "What payload cleanroom standards are maintained at your integration facilities?", a: "All payloads are integrated in ISO Class 7 (Class 10,000) cleanrooms conforming to strict planetary protection protocols." },
        { q: "Are launch delay assurances and rideshare re-manifest options available?", a: "Yes. Our standard launch agreements include flexible re-manifest options up to 60 days before the scheduled window." }
      ],
      statistics: [
        { val: "99.8%", label: "Mission Success Rate", desc: "Proven aerospace telemetry and launch control safety systems ensuring payload survival." },
        { val: "48 Hr", label: "Launch Window Recycle", desc: "Rapid re-flight systems enabled by our fully autonomous reusable booster fleet." },
        { val: "12,000 kg", label: "Max GTO Payload Mass", desc: "Heavy lift vehicles capable of transporting large payloads to deep space orbits." },
        { val: "ISO 7", label: "Cleanroom Verification", desc: "State-of-the-art cleanroom facilities protecting sensitive optical and electronic sensors." }
      ],
      mission: "To extend the reach of human civilization across the solar system by engineering reliable, cost-effective aerospace transport systems and commercial orbital infrastructure.",
      company_values: [
        { title: "Aerospace Discipline", desc: "Every telemetry link, weld, and flight line code parameter is verified to strict aerospace safety standards." },
        { title: "Rapid Reusability", desc: "We believe orbital transit is only sustainable when boosters and fairings are rapidly, completely reusable." },
        { title: "Exploration Tenacity", desc: "Pioneering the next frontier by fearlessly tackling thermodynamic and biological propulsion challenges." }
      ],
      about: {
        title: `The Story of ${brand}`,
        subtitle: "Pioneering commercial space transit and sustainable planetary infrastructure.",
        intro: `${brand} was founded by senior aerospace system engineers and astrophysicists. We are dedicated to accelerating the transition to a multi-planetary future by building fully reusable launch systems, orbital habitats, and interplanetary transport networks that make space accessible to all mankind.`,
        missionTitle: "Our Orbital Mission",
        missionDesc: "Lowering the cost of space transit through rapid reusability and advanced automated rocket propulsion systems.",
        visionTitle: "Our Vision for Space",
        visionDesc: "Establishing self-sustaining human outposts on the Moon and Mars powered by clean solar telemetry."
      },
      contact: {
        title: "Book Manifest Space",
        subtitle: "Connect with our launch relations team to discuss payload integration, custom trajectories, or manifest scheduling.",
        btnText: "Submit Payload Inquiry",
        firstNamePlaceholder: "Elena",
        emailPlaceholder: "elena.vance@orbitalx.com",
        messagePlaceholder: "Briefly describe your payload mass, dimensions, target orbit (e.g., LEO, GTO), and target launch window..."
      }
    };
  }

  if (type.includes('cybersecurity') || type.includes('security') || type.includes('cyber') || type.includes('defense') || type.includes('threat') || type.includes('infosec') || type.includes('soc') || type.includes('pentest')) {
    return {
      features: [
        { title: "Threat Detection Engine", desc: "AI-driven heuristics and real-time behavioral analytics scanning for zero-day vulnerabilities across all systems.", icon: "🛡️" },
        { title: "SOC Monitoring & Analysis", desc: "Proactive 24/7 security operations center analyzing network telemetry and resolving incidents within minutes.", icon: "🖥️" },
        { title: "Endpoint Shield Protection", desc: "Next-generation host shielding and access controls preventing malicious code execution at the local device level.", icon: "🔒" },
        { title: "Cloud Security Compliance", desc: "Automated container protection, identity mapping, and continuous audit trails conforming to strict ISO/SOC mandates.", icon: "☁️" }
      ],
      services: [
        { title: "Threat Intelligence", desc: "Continuous mapping of global bad-actor signatures, zero-day research databases, and custom system patching blueprints.", icon: "🛰️", tag: "Intelligence" },
        { title: "Incident Response", desc: "Rapid breach isolation, root-cause forensics, and system restoration services directed by battle-tested security engineers.", icon: "🚨", tag: "Emergency" },
        { title: "Vulnerability Assessment", desc: "Automated penetration testing, network path validation, and system audit reporting outlining clear risk vectors.", icon: "🔍", tag: "Assessment" },
        { title: "Digital Forensics", desc: "Post-incident evidence capture, payload analysis, and judicial compliance reporting for enterprise legal reviews.", icon: "🔬", tag: "Forensics" }
      ],
      projects: [
        { title: "Threat Detection Engine", desc: "Next-gen machine learning heuristic filter scanning 10M+ packets per second to capture early attack signatures.", tags: ["Rust", "eBPF", "Kubernetes"], metric: "99.98% accuracy" },
        { title: "SOC Monitoring Platform", desc: "Real-time visual SIEM telemetry dashboard consolidating multi-cloud system logs and system alerts.", tags: ["React", "Go", "WebSockets"], metric: "24/7 coverage" },
        { title: "Endpoint Protection Shield", desc: "Zero-trust kernel-level endpoint shielding preventing arbitrary script executions and credential theft.", tags: ["C++", "Security", "OSX/Windows"], metric: "Zero breaches" }
      ],
      testimonials: [
        { quote: "Their threat detection suite halted a highly sophisticated ransomware attempt at our parameter boundary. Their SOC response was flawless.", author: "Elena Rostova", role: "Chief Information Security Officer", company: "Aether Global Systems" },
        { quote: "An indispensable security partner. They helped us transition our entire cloud fleet to zero-trust architecture without operational downtime.", author: "Marcus Vance", role: "VP of Enterprise Infrastructure", company: "Apex FinTech" },
        { quote: "The vulnerability assessment highlighted critical configuration leaks we would have never spotted. Impeccable technical depth.", author: "Dr. Sarah Lin", role: "Technical Director", company: "Cyber Defense Group" }
      ],
      pricing: [
        { name: "Standard Shield", price: "$299", period: "/ endpoint / mo", desc: "Core threat protection, automated vulnerability assessments, and standard email incident advisory.", features: ["24/7 Automated Scanning", "Endpoint Protection Agent", "Weekly Security Reports", "Next-Day Incident Consultation"], btnText: "Deploy Standard Shield", highlighted: false, tag: "Essentials" },
        { name: "Enterprise Guard", price: "$899", period: "/ endpoint / mo", desc: "Full zero-trust cloud configuration protection, SOC alerting, and priority incident mitigation.", features: ["All Standard Shield features", "Real-Time SOC Escalations", "Air-Gapped Workload Auditing", "4-Hour SLA Incident Response"], btnText: "Deploy Enterprise Guard", highlighted: true, tag: "Most Popular" },
        { name: "Sentinel Premier", price: "Custom", period: "/ annual retainer", desc: "Private dedicated threat hunting, executive board reporting, and unlimited immediate breach mitigation.", features: ["Dedicated Threat Intel Analysts", "Custom Zero-Day Security Auditing", "24/7 Immediate Incident Response", "Board Governance Compliance Auditing"], btnText: "Inquire Sentinel Premier", highlighted: false, tag: "Enterprise VIP" }
      ],
      faqs: [
        { q: "How does the zero-trust system affect network latency and operational application speeds?", a: "Our endpoint agents operate inside the kernel path with low footprint, keeping package latency under 0.8ms while securing all execution endpoints." },
        { q: "What compliance standards and regulatory frameworks does the platform support out of the box?", a: "We maintain certified compliance mappings for SOC-2 Type II, ISO 27001, HIPAA, PCI-DSS, and GDPR frameworks, generating audit-ready reports on demand." },
        { q: "Can we integrate Sentinel with our existing cloud orchestration and SIEM tools?", a: "Yes. Our platform provides standardized syslog streams, webhook triggers, and direct REST APIs supporting Splunk, Datadog, AWS CloudTrail, and GCP telemetry." },
        { q: "What is your typical SLA guarantee for active incident mitigation and recovery?", a: "Enterprise plans carry a strict 4-hour SLA response window, with Sentinel Premier plans guaranteeing direct senior analyst engagement within 30 minutes." }
      ],
      statistics: [
        { val: "100%", label: "Zero-Day Shield Rate", desc: "Every known and emerging ransomware threat class successfully blocked at the parameter boundary." },
        { val: "< 15 Min", label: "Average Incident Resolution", desc: "SOC mitigation workflows immediately isolate compromised endpoints to protect adjacent cloud zones." },
        { val: "4.8B+", label: "Daily Transactions Protected", desc: "Reliably securing critical financial, medical, and SaaS workloads across multi-cloud clusters." },
        { val: "SOC-2", label: "Type II Certified", desc: "Exhaustively audited security practices guaranteeing absolute confidentiality and system integrity." }
      ],
      mission: "To construct an impenetrable digital perimeter for modern enterprises through AI-powered threat detection, continuous surveillance, and immediate incident mitigation.",
      company_values: [
        { title: "Zero-Trust Discipline", desc: "We trust nothing, verify everything, and isolate compromised systems immediately to prevent threat propagation." },
        { title: "Heuristic Innovation", desc: "Developing proactive threat detection methods that preempt attacks rather than relying on stale bad-actor signatures." },
        { title: "Fiduciary Confidentiality", desc: "Ensuring the absolute privacy of enterprise telemetry logs and audit trails under strict compliance guidelines." }
      ],
      about: {
        title: `The Story of ${brand}`,
        subtitle: "Pioneering autonomous threat defense, threat intelligence, and zero-trust cloud protection.",
        intro: `${brand} was established by elite military cyber defense experts and former cloud virtualization security engineers. We are committed to securing the digital infrastructure of modern enterprises from nation-state threat vectors, corporate espionage, and ransomware actors through continuous monitoring, deep threat analytics, and rapid automated system shielding.`,
        missionTitle: "Our Cybersecurity Mission",
        missionDesc: "Lowering enterprise threat surfaces through continuous automated vulnerability identification and zero-trust parameter shielding.",
        visionTitle: "Our Vision for Security",
        visionDesc: "Forging a secure digital society where critical infrastructure, enterprise data, and personal privacy are permanently protected."
      },
      contact: {
        title: "Confidential Security Consult & Audit",
        subtitle: "Initiate secure communications with our incident responders to request a vulnerability audit or review corporate security objectives.",
        btnText: "Request Security Audit",
        firstNamePlaceholder: "Harrison",
        emailPlaceholder: "h.vance@sentinel-defense.com",
        messagePlaceholder: "Briefly outline your enterprise cloud topology, endpoint counts, compliance objectives, or current incident concerns..."
      }
    };
  }

  // Default / Universal & Technology
  return {
    features: [
      { title: "Autonomous Intelligent Workflows", desc: "Advanced operating features engineered to streamline collaboration and optimize everyday processes effortlessly.", icon: "⚡" },
      { title: "Seamless Visual Interaction", desc: "Responsive high-resolution interface designed to provide immediate clarity, fluidity, and intuitive interaction across any endpoint.", icon: "🌐" },
      { title: "Uncompromising Security Standard", desc: "Enterprise-grade data encryption, robust authentication frameworks, and reliable system resilience built from the ground up.", icon: "🔒" },
      { title: "Real-Time Synchronization", desc: "Instant collaborative updates and reliable connectivity that keeps all participants perfectly aligned in real time.", icon: "🤝" }
    ],
    testimonials: [
      { quote: "The intuitive elegance and remarkable reliability of this platform elevated our everyday operational confidence beyond expectations.", author: "Marcus Thorne", role: "EVP Operational Systems", company: "Vanguard Global" },
      { quote: "A genuinely masterclass blend of high-end design aesthetic with ironclad reliability and effortless performance.", author: "Dr. Sarah Lin", role: "Chief Innovation Director", company: "Neural Network Hub" },
      { quote: "Their dedicated attention to user detail and seamless responsiveness set the new definitive standard in the modern market.", author: "Arthur J. Sterling", role: "Head of Operations", company: "Hyperion Systems" }
    ],
    pricing: [
      { name: "Standard Operational Suite", price: "$49", period: "/ month", desc: "Designed for rapid teams seeking automated simplicity and access to standard functional tools.", features: ["Full Core Platform Access", "Intuitive Interactive UI", "Standard Daily Usage Limits", "Responsive Community Support"], btnText: "Deploy Standard Suite", highlighted: false, tag: "Ready to Start" },
      { name: "Professional Premier Tier", price: "$149", period: "/ month", desc: "Expanded capacity, custom features, and priority performance for growing operational workloads.", features: ["Unlimited Interactive Workspaces", "Advanced Export Options", "Real-Time Team Concurrency", "Dedicated 99.99% Uptime Guarantee"], btnText: "Deploy Professional Tier", highlighted: true, tag: "Most Popular" },
      { name: "Dedicated Enterprise Custom", price: "Custom", period: "/ annual", desc: "Tailored private installations, exclusive encryption configurations, and dedicated institutional advisory.", features: ["Dedicated Account Executive Advisory", "Custom Security & SLA Compliance", "Private Air-Gapped Setup Option", "Direct 24/7 Senior Engineering Support"], btnText: "Inquire Enterprise Custom", highlighted: false, tag: "Enterprise VIP" }
    ],
    faqs: [
      { q: "How quickly can our team integrate and deploy this platform within our current operational framework?", a: "Our modular architecture defaults to intuitive interfaces and direct APIs that integrate seamlessly into modern team environments within 48 hours." },
      { q: "What security and compliance protocols are maintained across your deployment architecture?", a: "We maintain industry-leading SOC-2 Type II and ISO 27001 compliant security architectures across all global deployment endpoints." },
      { q: "Are custom configurations and data exporting supported for specialized workflow requirements?", a: "Yes. Our Professional and Enterprise tiers permit complete custom workspace adjustments and flexible data extraction with full commercial rights." },
      { q: "Is dedicated technical onboarding and live support included with team plans?", a: "Every enterprise engagement includes complete onboarding documentation, tailored training sessions, and prioritized responsive support." }
    ],
    statistics: [
      { val: "99.99%", label: "SLA Uptime Reliability", desc: "Globally distributed infrastructure ensuring unbroken operational consistency and speed year-round." },
      { val: "Instant", label: "Real-Time Synchronization", desc: "Optimized routing delivers instantaneous state updates and responsive interactions worldwide." },
      { val: "2.4M+", label: "Daily Transactions Processed", desc: "Reliably supporting mission-critical collaborative operations for top modern organizations." },
      { val: "SOC-2", label: "Certified Secure Architecture", desc: "Advanced cryptographic data privacy protecting institutional workloads with confidence." }
    ],
    mission: "To eliminate operational complexity by designing elegant, high-performance digital environments that empower teams to achieve extraordinary outcomes.",
    company_values: [
      { title: "Uncompromising Quality", desc: "We craft reliable, high-performance systems designed to exceed expectations under every condition." },
      { title: "Intuitive Design Polish", desc: "We believe effortless clarity and immediate visual responsiveness are essential to modern digital excellence." },
      { title: "Transparent Security", desc: "Clear ethical standards, strict privacy controls, and unwavering trust remain our highest commitment." }
    ],
    about: {
      title: `The Heritage & Excellence of ${brand}`,
      subtitle: "High-performance digital systems engineered for elegance, clarity, and enduring value.",
      intro: `${brand} was established by experienced system architects and creative product leaders with a shared vision: to simplify complex organizational challenges through inspiring design. By uniting intelligent automation with intuitive interactive aesthetics, we furnish modern pioneers with tools that work as naturally as thinking.`,
      missionTitle: "Our Institutional Mission",
      missionDesc: "To transform complex everyday workflows into an enjoyable, reliable, and deeply empowering digital experience.",
      visionTitle: "Vision for Excellence",
      visionDesc: "Pioneering an inspiring future where powerful technical capability dissolves behind graceful, human-centered interfaces."
    },
    contact: {
      title: "Initiate a Direct Consultation",
      subtitle: "Connect with our advisory team to discuss custom solutions, tailored onboarding, or professional partnerships.",
      btnText: "Request Consultation",
      firstNamePlaceholder: "Victoria",
      emailPlaceholder: "v.vance@global-institution.co",
      messagePlaceholder: "Detail your goals, intended operational scale, or preferred timeline for our introductory discussion..."
    }
  };
}

// ─── Main local blueprint builder (fallback) ──────────────────────────────────

function parseExplicitSections(prompt, defaultThree) {
  const match = prompt.match(/(?:landing\s+page\s+)?sections?\s*(?:must\s+be|should\s+be)?\s*[:=]\s*([a-zA-Z0-9,\s&-]+)/i);
  if (match) {
    const items = match[1].split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    if (items.length > 0) {
      return items.map(name => {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
        const componentName = `${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}Section`;
        const id = name.toLowerCase().replace(/\s+/g, '-');
        return {
          id,
          name,
          componentName,
          purpose: `Specialized ${name} section`,
          animation: "slide-up",
          threeObject: defaultThree,
          content: { heading: name }
        };
      });
    }
  }
  return null;
}

export function buildLocalBlueprint(intent) {
  const bp = emptyBlueprint();
  bp.name = intent.websiteName || "3D Platform";
  bp.brand = { name: bp.name };
  const businessType = intent.industry || inferBusinessType(intent.prompt || intent.websiteName);
  const heroData = getIndustryHeroData(businessType, intent.websiteName);
  const defaultThree = (intent.threeObjects && intent.threeObjects[0]) || "Floating Sphere";
  const explicitSecs = parseExplicitSections(intent.prompt || "", defaultThree);
  const industrySections = explicitSecs || getIndustrySectionMapping(businessType, heroData, defaultThree, intent.websiteName);
  const intelligentContent = getIntelligentDomainContent(businessType, intent.websiteName, intent.prompt);
  bp.content_library = intelligentContent;

  // ── Industry-aware theme mapping ──────────────────────────────────────────
  const industryThemeMap = {
    "Restaurant": "Warm",
    "Healthcare": "Nature",
    "Portfolio": "Minimal",
    "SaaS": "Modern",
    "E-Commerce": "Luxury",
    "Fashion": "Luxury",
    "Agency": "Glassmorphism",
    "Gaming": "Cyberpunk",
    "FinTech": "Corporate",
    "Real Estate": "Corporate",
    "Law Firm": "Corporate",
    "Gym": "Cyberpunk",
    "Space": "Cyberpunk",
    "Technology": "Modern",
  };
  const vTheme = intent.style || intent.theme || industryThemeMap[businessType] || "Modern";
  const visualIdentity = getThemeVisualIdentity(vTheme, intent.palette || intent.colorPalette || {});

  bp.meta.prompt = intent.prompt;
  bp.industry = businessType;
  bp.sections = industrySections;
  bp.visualIdentity = visualIdentity;

  const selectedLayout = inferHeroLayout(businessType, intent.prompt);

  bp.creative_concept = {
    business_type: businessType,
    color_palette: [visualIdentity.primaryColor, visualIdentity.secondaryColor, visualIdentity.accentColor],
    typography: { primary: visualIdentity.typography.bodyFont, secondary: visualIdentity.typography.displayFont, weights: [300, 400, 600, 700] },
    layout_archetype: selectedLayout,
    three_d_objects: intent.threeObjects && intent.threeObjects.length ? intent.threeObjects : ["Floating Sphere"],
  };
  bp.concept = {
    theme: visualIdentity.theme,
    coreIdentity: `${intent.websiteName} (${businessType} platform)`,
    tagline: heroData.heading,
    uniqueSellingProposition: heroData.subheading,
    targetAudience: inferAudience(intent.style),
    businessType: businessType,
    designStyle: visualIdentity.theme,
    brandPersonality: intent.brandPersonality,
  };
  bp.palette = {
    primary: visualIdentity.primaryColor,
    secondary: visualIdentity.secondaryColor,
    accent: visualIdentity.accentColor,
    background: visualIdentity.backgroundColor,
    surface: visualIdentity.surfaceColor,
    text: visualIdentity.textColor,
    textMuted: visualIdentity.textMutedColor,
  };
  bp.designSystem = {
    primaryColor: visualIdentity.primaryColor,
    secondaryColor: visualIdentity.secondaryColor,
    accentColor: visualIdentity.accentColor,
    backgroundColor: visualIdentity.backgroundColor,
    fontFamily: visualIdentity.typography.bodyFont,
    headingFont: visualIdentity.typography.displayFont,
    borderRadius: visualIdentity.borderRadius,
    cardStyle: visualIdentity.cardStyle,
    buttonStyle: visualIdentity.buttonStyle,
    background: visualIdentity.background,
    gradients: visualIdentity.gradients,
    shadowStyle: visualIdentity.shadowStyle,
    spacing: visualIdentity.spacing,
    layoutStyle: selectedLayout,
    animationStyle: "smooth parallax + micro-interactions",
    depth: "cinematic depth of field with realistic materials",
  };
  bp.design_system = bp.designSystem;
  bp.hero = {
    threeDScene: defaultThree,
    cameraAngle: "dynamic floating perspective",
    lighting: "cinematic dual-color god rays",
    heading: heroData.heading,
    headline: heroData.heading,
    subheading: heroData.subheading,
    subheadline: heroData.subheading,
    description: heroData.description,
    cta: heroData.cta,
    cta_primary: heroData.cta,
    cta_secondary: heroData.cta_secondary,
    badge: heroData.badge,
    layout: selectedLayout
  };
  const pagesList = intent.pages && intent.pages.length ? intent.pages : ["Home", "About", "Pricing", "Contact"];
  bp.pages = pagesList.map((pageName) => {
    if (pageName === "Home") {
      return {
        name: pageName,
        path: "/",
        sections: industrySections.map(s => ({
          ...s,
          threeObject: s.threeObject || defaultThree
        }))
      };
    }
    const defaultSections = PAGE_SECTIONS[pageName] || [
      {
        id: `${pageName.toLowerCase()}-header`,
        name: `${pageName} Header`,
        componentName: `${pageName}HeaderSection`,
        purpose: `${pageName} overview and content showcase`,
        animation: "fade-in",
        threeObject: null,
        content: { heading: `${pageName}`, description: `Explore our ${pageName.toLowerCase()} offerings and solutions.` },
      },
      {
        id: `${pageName.toLowerCase()}-content`,
        name: `${pageName} Content`,
        componentName: `${pageName}ContentSection`,
        purpose: `Interactive showcase for ${pageName.toLowerCase()}`,
        animation: "slide-up stagger",
        threeObject: null,
        content: { heading: `Our ${pageName}`, items: [] },
      }
    ];
    return {
      name: pageName,
      path: `/${pageName.toLowerCase()}`,
      sections: defaultSections.map((s) => ({
        ...s,
        threeObject: s.threeObject || defaultThree,
        content: { ...s.content, headline: `${intent.websiteName} — ${s.name}` },
      })),
    };
  });
  bp.navbar = {
    logo: intent.websiteName || "Website",
    links: bp.pages.map((p) => ({
      name: p.name,
      label: p.name,
      path: p.path
    }))
  };
  bp.navigation = bp.navbar;
  if (bp.websiteBlueprint) {
    bp.websiteBlueprint.navbar = { ...bp.navbar };
  }
  bp.videoScript = {
    duration: 55,
    resolution: "1920x1080",
    fps: 60,
    style: `${intent.style || "Modern"} cinematic UI showcase`,
    scenes: buildVideoScenes(intent),
    aiVideoPrompt: "",
  };
  bp.videoScript.aiVideoPrompt = buildAIVideoPrompt(intent, bp);
  bp.components = buildComponentStructure(intent, bp);
  bp.seo = {
    title: `${intent.websiteName || "Modern Site"} — ${bp.concept.tagline || "Platform"}`,
    description: bp.concept.uniqueSellingProposition || "Innovative interactive architecture",
    keywords: [intent.websiteName || "Interactive", intent.style || "Modern", ...(Array.isArray(intent.brandPersonality) ? intent.brandPersonality : ["innovative", "premium", "spatial"])],
    ogImage: "/og-image.jpg",
  };

  bp.layout_plan = generateLayoutPlan(bp, intent.prompt || intent.websiteName, bp.industry, bp.visualIdentity?.theme || "modernDark");
  bp.scene_plan = generateScenePlan(bp, intent.prompt || intent.websiteName, bp.industry, bp.visualIdentity?.theme || "modernDark", "Home");
  return bp;
}

export function inferBusinessType(prompt) {
  const lower = (prompt || '').toLowerCase();
  
  const match = (regex) => {
    const m = lower.match(regex);
    if (!m) return false;
    
    // Find the start of the current sentence containing the match
    const lastSentenceEnd = Math.max(
      lower.lastIndexOf('.', m.index),
      lower.lastIndexOf('!', m.index),
      lower.lastIndexOf('?', m.index),
      lower.lastIndexOf(';', m.index)
    );
    const sentenceStart = lastSentenceEnd === -1 ? 0 : lastSentenceEnd + 1;
    const prefix = lower.substring(sentenceStart, m.index).trim();
    
    if (/\b(not|no|don't|never|without|avoid|instead of|rather than|but not)\b/i.test(prefix)) {
      // It's negated! Try to find a non-negated match later in the string
      const rest = lower.substring(m.index + m[0].length);
      const nextMatch = rest.match(regex);
      if (nextMatch) {
        const nextMatchGlobalIndex = m.index + m[0].length + nextMatch.index;
        const nextLastSentenceEnd = Math.max(
          lower.lastIndexOf('.', nextMatchGlobalIndex),
          lower.lastIndexOf('!', nextMatchGlobalIndex),
          lower.lastIndexOf('?', nextMatchGlobalIndex),
          lower.lastIndexOf(';', nextMatchGlobalIndex)
        );
        const nextSentenceStart = nextLastSentenceEnd === -1 ? 0 : nextLastSentenceEnd + 1;
        const nextPrefix = lower.substring(nextSentenceStart, nextMatchGlobalIndex).trim();
        if (!/\b(not|no|don't|never|without|avoid|instead of|rather than|but not)\b/i.test(nextPrefix)) {
          return true;
        }
      }
      return false;
    }
    return true;
  };

  if (match(/\b(car|automotive|auto|vehicle|hypercar|supercar|motors|dealership|f1|formula\s*1|formula\s*one|racing)\b/)) return "Automotive";
  if (match(/\b(garden|botanical|park|nature|plants|forestry|agriculture|landscaping)\b/)) return "Hospitality";
  if (match(/\b(cybersecurity|security|cyber|defense|threat|infosec|soc|pentest|firewall)\b/)) return "Cybersecurity";
  if (match(/\b(education|edu|school|college|university|academy|course|admission|student|tutor|learning|teach|campus|curriculum|scholarship)\b/)) return "Education";
  if (match(/\b(hotel|motel|resort|hospitality|accommodation|booking)\b/)) return "Hospitality";
  if (match(/\b(restaurant|food|dining|cafe|coffee|bistro|italian|cuisine|menu|pizza|sushi|burger|eat|chef|kitchen|bakery)\b/)) return "Restaurant";
  if (match(/\b(health|medical|wellness|care|clinic|hospital|doctor|patient|therapy)\b/)) return "Healthcare";
  if (match(/\b(game|gaming|esport|tournament|arcade|streamer|twitch|clan)\b/)) return "Gaming";
  if (match(/\b(finance|fintech|payment|bank|crypto|web3|wallet|invest|trading)\b/)) return "FinTech";
  if (match(/\b(architecture|architect|building|construction)\b/)) {
    if (/\b(software|system|cloud|data|network|technical)\s+architect/i.test(lower)) {
      // Let it fall through to other tech categories
    } else {
      return "Architecture";
    }
  }
  if (match(/\b(real estate|property|realty|housing|apartments|villas)\b/)) return "Real Estate";
  if (match(/\b(fashion|clothing|luxury|wear|apparel|style|boutique|outfit|garments|lookbook|haute)\b/)) return "Fashion";
  if (match(/\b(law|legal|attorney|lawyer|counsel|litigation|jurist|court|advocate|justice)\b/)) return "Law Firm";
  if (match(/\b(gym|fitness|workout|athletic|training|crossfit|exercise|strength|athlete|bodybuilding|muscle)\b/)) return "Gym";
  if (match(/\b(ecommerce|e-commerce|shop|store|retail|merch|goods)\b/)) return "E-Commerce";
  if (match(/\b(portfolio|developer|freelance|freelancer|resume|personal|bio|showcase|creator|cv)\b/)) return "Portfolio";
  if (match(/\b(agency|studio|creative|marketing|advertising|consultancy|firm)\b/)) return "Agency";
  if (match(/\b(space|cosmos|nasa|orbital|aerospace|astrophysics|satellite|satellite-systems|rocket|galaxy)\b/)) return "Space";
  if (match(/\b(saas|workflow|automate|platform|software|app|cloud|enterprise|tool)\b/)) return "SaaS";
  return "Technology";
}

function inferAudience(style) {
  const map = {
    Corporate: "Enterprise decision-makers and C-level executives",
    Gaming: "Gamers aged 16-35 who value performance and immersion",
    Luxury: "High-net-worth individuals seeking premium experiences",
    Startup: "Tech-savvy early adopters and startup founders",
    Space: "Science enthusiasts, engineers, and visionaries",
    Minimal: "Design-conscious professionals and creatives",
    default: "Tech-forward professionals and early adopters aged 25-45",
  };
  return map[style] || map.default;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate blueprint via Claude API (server-side).
 * Falls back to local generation if API is unavailable.
 *
 * @param {object} intent  Output of AIArchitect.analyzePrompt()
 * @param {object} [opts]  { onProgress }
 * @returns {Promise<object>}  Blueprint
 */
export async function generateBlueprint(intent, opts = {}) {
  const { BlueprintService } = await import("./BlueprintService.js");
  return await BlueprintService.generate(intent);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function validateBlueprintDomain(blueprint) {
  const industry = blueprint.industry || blueprint.business_type || "Technology";
  
  // Define keywords that belong to other industries to catch cross-industry leakages
  const domainSpecificKeywords = {
    "Restaurant": ["menu", "chef", "dish", "dishes", "recipe", "cuisine", "reservations", "reservations-table", "order-food", "dining", "bistro", "pizza", "sushi", "burger", "kitchen", "bakery"],
    "Hospitality": ["room", "rooms", "suite", "suites", "dining-hall", "spa", "resort", "hotel", "lobby", "booking-stay", "concierge"],
    "Healthcare": ["doctor", "doctors", "patient", "clinical", "hospital", "clinic", "diagnosis", "telemedicine", "medical", "appointment", "consultation"],
    "Gym": ["workout", "fitness", "athlete", "athletic", "gym", "trainers", "classes-schedule", "membership-tiers", "crossfit", "strength", "bodybuilding", "muscle"],
    "Portfolio": ["skills", "projects", "experience-timeline", "achievements-stats", "resume", "cv", "developer-bio", "about-me", "my-projects"]
  };

  const pages = blueprint.pages || [];
  const sections = blueprint.sections || [];
  const allElementsText = [
    industry,
    ...pages.map(p => (p.name || "") + " " + (p.path || "")),
    ...sections.map(s => (s.name || s.title || "") + " " + (s.content?.heading || "") + " " + (s.purpose || ""))
  ].join(" ").toLowerCase();

  const auditReport = {
    valid: true,
    rejectedReasons: []
  };

  for (const [key, keywords] of Object.entries(domainSpecificKeywords)) {
    if (industry !== key) {
      for (const keyword of keywords) {
        // Strict boundary matching
        const rx = new RegExp(`\\b${keyword}\\b`, "i");
        if (rx.test(allElementsText)) {
          auditReport.valid = false;
          auditReport.rejectedReasons.push(`Cross-industry contamination: Found '${keyword}' belonging to '${key}' inside '${industry}' website blueprint`);
        }
      }
    }
  }

  return auditReport;
}
