import { 
  getThemeVisualIdentity, 
  getIndustryHeroData, 
  getIndustrySectionMapping, 
  getIntelligentDomainContent,
  inferBusinessType
} from "./BlueprintGenerator.js";
import { generateScenePlan } from "../src/planner/ScenePlanner.js";

/**
 * BlueprintAdapterV1
 * 
 * Compatibility adapter that normalizes old V1/raw blueprints into structured Blueprint V2 format.
 * Acts as the translation layer to make sure renderers receive uniform inputs.
 */
export class BlueprintAdapterV1 {
  static adapt(blueprint, intent = {}) {
    if (!blueprint) {
      return null;
    }

    const adapted = { ...blueprint };

    // 1. Resolve Brand name
    adapted.brand ??= {};
    adapted.brand.name ??= blueprint.name || blueprint.brand?.name || intent.websiteName || "3D Platform";
    adapted.brand.tagline ??= blueprint.concept?.tagline || blueprint.brand?.tagline || "Innovative interactive architecture";
    adapted.brand.logoUrl ??= blueprint.brand?.logoUrl || "/logo.svg";

    // 2. Resolve Theme Visual Identity & Design Tokens
    if (!adapted.theme || !adapted.theme.colors) {
      const legacyVid = blueprint.visualIdentity || blueprint.designSystem || {};
      const vTheme = blueprint.concept?.designStyle || blueprint.concept?.theme || intent.style || "Modern";
      const resolvedVid = getThemeVisualIdentity(vTheme, blueprint.palette || intent.palette || {});
      
      adapted.theme = {
        colors: {
          primary: resolvedVid.primaryColor || legacyVid.primaryColor || "#3b82f6",
          secondary: resolvedVid.secondaryColor || legacyVid.secondaryColor || "#10b981",
          background: resolvedVid.backgroundColor || legacyVid.backgroundColor || "#0f172a",
          surface: resolvedVid.surfaceColor || legacyVid.surfaceColor || "#1e293b",
          text: resolvedVid.textColor || legacyVid.textColor || "#f8fafc",
          accent: resolvedVid.accentColor || legacyVid.accentColor || "#f43f5e",
          textMuted: resolvedVid.textMutedColor || legacyVid.textMutedColor || "#94a3b8"
        },
        typography: {
          headingFont: resolvedVid.typography?.displayFont || "'Inter', sans-serif",
          bodyFont: resolvedVid.typography?.bodyFont || "'Inter', sans-serif"
        },
        borderRadius: resolvedVid.borderRadius || "0.5rem",
        shadows: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      };
    }

    // 3. Resolve Navigation Links
    adapted.navigation ??= {};
    adapted.navigation.logo ??= adapted.brand.name;
    if (!adapted.navigation.links || !Array.isArray(adapted.navigation.links)) {
      const rawLinks = blueprint.navigation?.links || blueprint.navbar?.links || [];
      if (rawLinks.length > 0) {
        adapted.navigation.links = rawLinks.map(l => ({
          label: l.label || l.name || String(l),
          path: l.path || l.url || "/"
        }));
      } else if (Array.isArray(blueprint.pages)) {
        adapted.navigation.links = blueprint.pages.map(p => ({
          label: p.name || p.title || "Page",
          path: p.path || p.url || (p.name?.toLowerCase() === "home" ? "/" : `/${p.name?.toLowerCase()}`)
        }));
      } else {
        adapted.navigation.links = [{ label: "Home", path: "/" }];
      }
    }
    adapted.navigation.cta ??= {
      label: blueprint.navigation?.cta?.label || blueprint.navigation?.cta?.text || "Explore",
      path: blueprint.navigation?.cta?.path || blueprint.navigation?.cta?.url || "/contact"
    };

    // 4. Resolve Hero parameters
    adapted.hero ??= {};
    const legacyHero = blueprint.hero || blueprint.layout?.hero || {};
    adapted.hero.heading ??= legacyHero.heading || legacyHero.headline || "Welcome to " + adapted.brand.name;
    adapted.hero.subheading ??= legacyHero.subheading || legacyHero.subheadline || "Experience high-fidelity structural layouts.";
    adapted.hero.description ??= legacyHero.description || legacyHero.text || adapted.hero.subheading;
    
    // CoreGenerator validation field aliases
    adapted.hero.headline ??= adapted.hero.heading;
    adapted.hero.subheading ??= adapted.hero.description;
    adapted.hero.description ??= adapted.hero.subheading;

    adapted.hero.badge ??= legacyHero.badge || "AI Generated Platform";
    
    if (!adapted.hero.ctas || !Array.isArray(adapted.hero.ctas)) {
      const legacyCtas = legacyHero.buttons || legacyHero.ctas || [];
      if (legacyCtas.length > 0) {
        adapted.hero.ctas = legacyCtas.map((c, i) => ({
          label: c.label || c.text || (i === 0 ? "Get Started" : "Learn More"),
          path: c.path || c.url || "/contact",
          variant: i === 0 ? "primary" : "secondary"
        }));
      } else {
        adapted.hero.ctas = [
          { label: legacyHero.cta || "Get Started", path: "/contact", variant: "primary" }
        ];
        if (legacyHero.cta_secondary) {
          adapted.hero.ctas.push({ label: legacyHero.cta_secondary, path: "/contact", variant: "secondary" });
        }
      }
    }
    adapted.hero.layout ??= legacyHero.layout || "3d-right";

    // 5. Resolve Scene details
    adapted.scene ??= {};
    const legacyScene = blueprint.scene || {};
    adapted.scene.sceneId ??= legacyScene.sceneId || blueprint.layout_plan?.sceneId || "FloatingBlobScene";
    
    if (!adapted.scene.camera) {
      adapted.scene.camera = {
        position: legacyScene.camera?.position || [0, 0, 5],
        fov: legacyScene.camera?.fov || 50
      };
    }
    
    if (!adapted.scene.lighting || !Array.isArray(adapted.scene.lighting)) {
      adapted.scene.lighting = legacyScene.lighting || [
        { type: "ambient", color: "#ffffff", intensity: 0.8 },
        { type: "directional", color: adapted.theme.colors.primary, intensity: 1.2, position: [5, 5, 5] }
      ];
    }

    // Adapt to heroScene for Blueprint V2 schema validation alignment
    adapted.heroScene ??= blueprint.heroScene || {
      type: adapted.scene.sceneId,
      style: "premium",
      mood: "cinematic",
      colors: [adapted.theme.colors.primary, adapted.theme.colors.secondary],
      motion: "flowing",
      lighting: "soft bloom"
    };

    // 6. Resolve Pages & Sections
    const bt = blueprint.concept?.businessType || blueprint.industry || intent.industry || inferBusinessType(intent.prompt);
    
    if (!adapted.pages || !Array.isArray(adapted.pages) || adapted.pages.length === 0) {
      const rawPages = blueprint.pages || [];
      if (Array.isArray(rawPages) && rawPages.length > 0) {
        adapted.pages = rawPages.map(p => {
          let name = p.name || p.title || "Home";
          let path = p.path || p.url || (name.toLowerCase() === "home" ? "/" : `/${name.toLowerCase()}`);
          let sections = p.sections || [];
          if (Array.isArray(sections)) {
            sections = sections.map(s => this.normalizeSection(s, bt, blueprint));
          }
          return { name, path, sections };
        });
      } else {
        // Fallback to sections list or mapping
        const legacySecs = blueprint.sections || blueprint.layout?.sections || [];
        const normalizedSections = Array.isArray(legacySecs) 
          ? legacySecs.map(s => this.normalizeSection(s, bt, blueprint)) 
          : [];
          
        adapted.pages = [
          { name: "Home", path: "/", sections: normalizedSections }
        ];
      }
    } else {
      // Pages array exists, normalize its sections
      adapted.pages = adapted.pages.map(p => ({
        ...p,
        sections: (p.sections || []).map(s => this.normalizeSection(s, bt, blueprint))
      }));
    }

    // Ensure top-level sections holds home sections for backward-compatibility
    adapted.sections = adapted.pages[0]?.sections || [];

    // 7. Resolve Footer specifications
    adapted.footer ??= {};
    adapted.footer.copyright ??= blueprint.footer?.copyright || `© ${new Date().getFullYear()} ${adapted.brand.name}. All rights reserved.`;
    if (!adapted.footer.links || !Array.isArray(adapted.footer.links)) {
      adapted.footer.links = (blueprint.footer?.links || adapted.navigation.links || []).map(l => ({
        label: l.label || l.name || String(l),
        path: l.path || l.url || "/"
      }));
    }

    return adapted;
  }

  static normalizeSection(sec, businessType, blueprint) {
    if (!sec || typeof sec !== "object") {
      return {
        id: "section-" + Math.random().toString(36).substr(2, 9),
        type: "features",
        name: "Feature Section",
        componentName: "FeaturesSection",
        content: {}
      };
    }

    const id = sec.id || sec.sectionId || "section-" + Math.random().toString(36).substr(2, 9);
    const type = sec.type || sec.id || "features";
    const name = sec.name || sec.title || (type.charAt(0).toUpperCase() + type.slice(1));
    const componentName = sec.componentName || `${name.replace(/\s+/g, "")}Section`;
    
    const content = sec.content || {};
    content.heading ??= content.heading || content.title || content.headline || name;
    content.subheading ??= content.subheading || content.subtitle || content.subheadline || "";
    
    // Normalize content list items
    if (content.items) {
      if (!Array.isArray(content.items) && typeof content.items === "object") {
        content.items = Object.values(content.items);
      }
      if (Array.isArray(content.items)) {
        content.items = content.items.map(item => {
          if (typeof item === "string") {
            return { title: item, desc: "", icon: "✦" };
          }
          return {
            title: item.title || item.name || item.heading || "",
            desc: item.desc || item.description || item.text || "",
            icon: item.icon || "✦",
            price: item.price || "",
            period: item.period || "",
            author: item.author || "",
            role: item.role || "",
            quote: item.quote || ""
          };
        });
      } else {
        delete content.items;
      }
    }
    
    if (!content.items) {
      // If content.items does not exist, check fallback domain contents
      const cl = blueprint.content_library || getIntelligentDomainContent(businessType, blueprint.name);
      let items = null;
      if (type.includes("feature")) {
        items = cl.features;
      } else if (type.includes("testimonial") || type.includes("review")) {
        items = cl.testimonials;
      } else if (type.includes("faq")) {
        items = cl.faqs;
      } else if (type.includes("price") || type.includes("pricing")) {
        items = cl.pricing;
      } else if (type.includes("service")) {
        items = cl.services;
      } else if (type.includes("about")) {
        items = cl.about ? [cl.about] : null;
      }

      if (items) {
        content.items = items.map(item => ({
          title: item.title || item.name || item.heading || "",
          desc: item.desc || item.description || item.text || item.a || "",
          icon: item.icon || "✦",
          price: item.price || "",
          period: item.period || "",
          author: item.author || "",
          role: item.role || "",
          quote: item.quote || ""
        }));
      }
    }

    return {
      id,
      type,
      name,
      componentName,
      content,
      layout: sec.layout || "default",
      animation: sec.animation || "slide-up",
      threeObject: sec.threeObject || null
    };
  }
}
