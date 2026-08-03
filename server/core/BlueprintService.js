import { AIProvider } from "./AIProvider.js";
import { 
  buildLocalBlueprint, 
  inferBusinessType, 
  getIndustryHeroData, 
  inferHeroLayout, 
  getThemeVisualIdentity,
  getIndustrySectionMapping,
  getIntelligentDomainContent,
  PAGE_SECTIONS
} from "./BlueprintGenerator.js";
import { generateLayoutPlan } from "../src/planner/LayoutPlanner.js";
import { generateScenePlan } from "../src/planner/ScenePlanner.js";
import { BlueprintAdapterV1 } from "./BlueprintAdapterV1.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { BlueprintValidator } from "./BlueprintValidator.js";



function parseExplicitPages(text) {
  const match = text.match(/(?:navigation\s+links|nav\s+links|pages|navbar|menu)\s*(?:must\s+be|should\s+be)?\s*[:=]\s*([a-zA-Z0-9,\s&]+)/i);
  if (match) {
    const items = match[1].split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => item.replace(/\b\w/g, c => c.toUpperCase()));
    if (items.length > 0) {
      const filtered = items.filter(item => item.toLowerCase() !== 'home');
      return ['Home', ...filtered];
    }
  }
  return null;
}

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

export class BlueprintService {
  /**
   * Generates a website blueprint from intent.
   * Uses AWS Bedrock as primary provider, falls back to local generation.
   * @param {object} intent - Intent object containing prompt, websiteName, industry, etc.
   * @returns {Promise<object>} Blueprint JSON
   */
  static async generate(intent) {
    const startMs = Date.now();
    let source = "Bedrock";
    let modelUsed = process.env.AWS_BEDROCK_TEXT_MODEL_ID || "us.amazon.nova-pro-v1:0";
    let fallbackReason = null;
    let blueprint = null;

    try {
      if (process.env.BLUEPRINT_V2_ENABLED === "true") {
        // 1. Build modular system prompt
        const systemPrompt = PromptBuilder.buildSystemPrompt();
        const userPrompt = `Generate a blueprint for a website named "${intent.websiteName}" in the "${intent.industry}" industry. Original user prompt: "${intent.prompt}"`;
        
        let rawBlueprint = await AIProvider.generateJSON(systemPrompt, userPrompt);
        if (!rawBlueprint || typeof rawBlueprint !== "object" || Object.keys(rawBlueprint).length === 0) {
          throw new Error("AWS Bedrock returned empty or invalid JSON structure.");
        }

        // Schema validation
        let validation = BlueprintValidator.validate(rawBlueprint);
        if (!validation.valid) {
          console.warn(`[Blueprint V2 Validation Failed] Errors:\n`, validation.errors.join("\n"));
          console.log(`[Blueprint V2 Repair] Triggering 1-retry repair cycle...`);
          
          const repairUserPrompt = `Your previous JSON output failed validation with the following schema/structural errors:
${validation.errors.map(e => "- " + e).join("\n")}

Here is the invalid blueprint JSON you outputted:
${JSON.stringify(rawBlueprint, null, 2)}

Please fix all these errors and return ONLY the corrected, fully-compliant Blueprint V2 JSON. Keep all original user intent content intact.`;
          
          try {
            const repairedBlueprint = await AIProvider.generateJSON(systemPrompt, repairUserPrompt);
            if (repairedBlueprint && typeof repairedBlueprint === "object" && Object.keys(repairedBlueprint).length > 0) {
              const repairValidation = BlueprintValidator.validate(repairedBlueprint);
              if (repairValidation.valid) {
                console.log(`[Blueprint V2 Repair] Success! Clean V2 blueprint resolved.`);
                rawBlueprint = repairedBlueprint;
              } else {
                console.error(`[Blueprint V2 Repair] Failed. Repair validation errors:\n`, repairValidation.errors.join("\n"));
                rawBlueprint = repairedBlueprint; // Use anyway
              }
            }
          } catch (repairErr) {
            console.error(`[Blueprint V2 Repair Error] Repair cycle aborted:`, repairErr.message);
          }
        } else {
          console.log(`[Blueprint V2 Validation] Success! Clean V2 blueprint resolved directly from LLM.`);
        }

        blueprint = rawBlueprint;
        blueprint.version = "2.0.0";
        blueprint.meta = {
          generatedAt: new Date().toISOString(),
          prompt: intent.prompt
        };

        blueprint.hero ??= {};
        blueprint.hero.headline ??= blueprint.hero.heading;
        blueprint.hero.heading ??= blueprint.hero.headline;
        blueprint.hero.subheading ??= blueprint.hero.description;
        blueprint.hero.description ??= blueprint.hero.subheading;

        // Attach placeholders for down-stream compatibility if not defined
        const bt = blueprint.brand.industry || intent.industry || "Technology";
        blueprint.sections = blueprint.pages[0]?.sections || [];
        blueprint.heroScene ??= {
          type: blueprint.scene?.sceneId || "FloatingBlobScene",
          style: "premium",
          mood: "cinematic",
          colors: [blueprint.theme?.colors?.primary || "#3b82f6"],
          motion: "flowing",
          lighting: "soft bloom"
        };
        blueprint.scene ??= {
          sceneId: blueprint.heroScene.type,
          camera: { position: [0, 0, 6], fov: 55 },
          lighting: [
            { type: "ambient", color: "#ffffff", intensity: 0.8 },
            { type: "directional", color: blueprint.theme?.colors?.primary || "#3d5eff", intensity: 1.2, position: [5, 5, 5] }
          ]
        };

        blueprint.layout_plan ??= {
          theme: blueprint.theme.colors.primary,
          layouts: (blueprint.pages[0]?.sections || []).map(s => ({
            id: s.id,
            type: s.type,
            layout: s.layout || "default"
          }))
        };
        blueprint.scene_plan ??= {
          sceneId: blueprint.heroScene.type,
          camera: blueprint.scene.camera,
          lighting: blueprint.scene.lighting
        };
        blueprint.navigation ??= blueprint.navigation;
        blueprint.content_library ??= getIntelligentDomainContent(bt, blueprint.brand.name, intent.prompt);
        blueprint.seo ??= {
          title: `${blueprint.brand.name} — ${blueprint.brand.tagline}`,
          description: blueprint.hero.description,
          keywords: [blueprint.brand.name, "Interactive"],
          ogImage: "/og-image.jpg"
        };

      } else {
        // 1. Generate via AWS Bedrock
        const systemPrompt = `You are a professional website blueprint architect. You generate a complete, valid website blueprint JSON structure based on the user's intent. The output must strictly conform to the expected schema with a landing page, navigation links, layout archetype, and visual styling properties.`;
        const userPrompt = `Generate a blueprint for a website named "${intent.websiteName}" in the "${intent.industry}" industry. Original user prompt: "${intent.prompt}"`;
        
        const rawBlueprint = await AIProvider.generateJSON(systemPrompt, userPrompt);
      
      if (!rawBlueprint || typeof rawBlueprint !== "object" || Object.keys(rawBlueprint).length === 0) {
        throw new Error("AWS Bedrock returned empty or invalid JSON structure.");
      }

      blueprint = rawBlueprint;
      blueprint.version = "1.0.0";
      if (!blueprint.meta) {
        blueprint.meta = {
          generatedAt: new Date().toISOString(),
          prompt: intent.prompt
        };
      }

      // Convert blueprint.pages from object to array if needed
      if (blueprint.pages && typeof blueprint.pages === 'object' && !Array.isArray(blueprint.pages)) {
        blueprint.pages = Object.keys(blueprint.pages).map(key => {
          const pageObj = blueprint.pages[key];
          return {
            name: key,
            title: pageObj.title || pageObj.name || key,
            sections: pageObj.sections || []
          };
        });
      }

      const bt = blueprint.concept?.businessType || blueprint.industry || intent.industry || inferBusinessType(intent.prompt);
      const defaultThree = (intent.threeObjects && intent.threeObjects[0]) || "Floating Sphere";

      // Normalize visual identity
      if (!blueprint.visualIdentity) {
        const vTheme = blueprint.concept?.designStyle || blueprint.concept?.theme || intent.style || "Modern";
        blueprint.visualIdentity = getThemeVisualIdentity(vTheme, blueprint.palette || intent.palette || {});
        blueprint.designSystem = { ...(blueprint.designSystem || {}), ...blueprint.visualIdentity };
      }
      
      if (!blueprint.palette) {
        blueprint.palette = {
          primary: blueprint.visualIdentity.primaryColor,
          secondary: blueprint.visualIdentity.secondaryColor,
          accent: blueprint.visualIdentity.accentColor,
          background: blueprint.visualIdentity.backgroundColor,
          surface: blueprint.visualIdentity.surfaceColor,
          text: blueprint.visualIdentity.textColor,
          textMuted: blueprint.visualIdentity.textMutedColor,
        };
      }

      // Normalize hero block
      if (!blueprint.hero && blueprint.layout?.hero) {
        blueprint.hero = blueprint.layout.hero;
      }
      
      // If hero or its key text is missing, search for a section of type 'hero' in layout, pages or sections
      if (!blueprint.hero || !blueprint.hero.heading || !blueprint.hero.description) {
        let foundHeroSec = null;
        if (Array.isArray(blueprint.sections)) {
          foundHeroSec = blueprint.sections.find(s => s.type === 'hero' || s.id === 'hero');
        }
        if (!foundHeroSec && blueprint.layout && Array.isArray(blueprint.layout.sections)) {
          foundHeroSec = blueprint.layout.sections.find(s => s.type === 'hero' || s.id === 'hero');
        }
        if (!foundHeroSec && Array.isArray(blueprint.pages)) {
          for (const p of blueprint.pages) {
            if (Array.isArray(p.sections)) {
              foundHeroSec = p.sections.find(s => s.type === 'hero' || s.id === 'hero');
              if (foundHeroSec) break;
            }
          }
        }
        if (!foundHeroSec && blueprint.pages && typeof blueprint.pages === 'object' && !Array.isArray(blueprint.pages)) {
          for (const pKey of Object.keys(blueprint.pages)) {
            const p = blueprint.pages[pKey];
            if (p && Array.isArray(p.sections)) {
              foundHeroSec = p.sections.find(s => s.type === 'hero' || s.id === 'hero');
              if (foundHeroSec) break;
            }
          }
        }

        if (foundHeroSec && foundHeroSec.content) {
          blueprint.hero ??= {};
          blueprint.hero.heading ??= foundHeroSec.content.headline || foundHeroSec.content.heading || foundHeroSec.content.title;
          blueprint.hero.headline ??= foundHeroSec.content.headline || foundHeroSec.content.heading || foundHeroSec.content.title;
          blueprint.hero.description ??= foundHeroSec.content.subheadline || foundHeroSec.content.subheading || foundHeroSec.content.description || foundHeroSec.content.text;
          blueprint.hero.subheading ??= foundHeroSec.content.subheadline || foundHeroSec.content.subheading || foundHeroSec.content.description || foundHeroSec.content.text;
          blueprint.hero.cta ??= foundHeroSec.content.cta || foundHeroSec.content.cta_primary;
        }
      }

      blueprint.hero ??= {};
      
      const hd = getIndustryHeroData(bt, blueprint.concept?.websiteName || intent.websiteName);
      const selLayout = (blueprint.hero.layout && blueprint.hero.layout !== 'default') ? blueprint.hero.layout : inferHeroLayout(bt, intent.prompt);

      // Resolve heading/headline
      const resolvedHeading = blueprint.hero.heading || blueprint.hero.headline || hd.heading;
      blueprint.hero.heading = resolvedHeading;
      blueprint.hero.headline = resolvedHeading;

      // Resolve subheading/subheadline
      const resolvedSubheading = blueprint.hero.subheading || blueprint.hero.subheadline || hd.subheading;
      blueprint.hero.subheading = resolvedSubheading;
      blueprint.hero.subheadline = resolvedSubheading;

      // Resolve description
      blueprint.hero.description ||= hd.description;

      // Resolve CTAs
      const resolvedCta = blueprint.hero.cta || blueprint.hero.cta_primary || hd.cta;
      blueprint.hero.cta = resolvedCta;
      blueprint.hero.cta_primary = resolvedCta;
      blueprint.hero.cta_secondary ||= hd.cta_secondary;

      // Resolve badge, layout, and scene
      blueprint.hero.badge ||= hd.badge;
      blueprint.hero.layout = selLayout;
      blueprint.hero.scene ||= blueprint.hero.three_d_object?.type || hd.scene || 'floating-sphere';

      if (!blueprint.creative_concept) {
        blueprint.creative_concept = {
          business_type: bt,
          layout_archetype: blueprint.hero.layout || "split"
        };
      }

      // Temporarily log input properties
      const rawLayoutSecsLength = blueprint.layout?.sections?.length ?? "undefined";
      const rawSectionsLength = blueprint.sections?.length ?? "undefined";
      const rawPagesLength = blueprint.pages?.length ?? "undefined";
      console.log(`[Blueprint Normalization Log] Input:`);
      console.log(` - blueprint.layout.sections.length: ${rawLayoutSecsLength}`);
      console.log(` - blueprint.sections.length: ${rawSectionsLength}`);
      console.log(` - blueprint.pages.length: ${rawPagesLength}`);

      let finalSections = null;

      // Check explicit prompts first (e.g. sections must be...)
      const explicitSecs = parseExplicitSections(intent.prompt || "", defaultThree);

      if (explicitSecs) {
        finalSections = explicitSecs;
      }
      // Priority 1: Use blueprint.sections if it already exists
      else if (blueprint.sections && Array.isArray(blueprint.sections) && blueprint.sections.length > 0) {
        finalSections = blueprint.sections;
      }
      // Priority 2: If blueprint.sections is missing, but blueprint.pages[0].sections exists, copy that
      else if (blueprint.pages && Array.isArray(blueprint.pages) && blueprint.pages[0] && Array.isArray(blueprint.pages[0].sections) && blueprint.pages[0].sections.length > 0) {
        finalSections = blueprint.pages[0].sections;
      }
      // Priority 3: If both are missing, but blueprint.layout.sections exists, copy blueprint.layout.sections
      else if (blueprint.layout && Array.isArray(blueprint.layout.sections) && blueprint.layout.sections.length > 0) {
        finalSections = blueprint.layout.sections;
      }
      // Priority 5: Only if ALL of the above are missing, execute getIndustrySectionMapping().
      else {
        const hd = getIndustryHeroData(bt, blueprint.concept?.websiteName || intent.websiteName);
        finalSections = getIndustrySectionMapping(bt, hd, defaultThree, intent.websiteName);
      }

      // Map sections to ensure consistent schema (id, type, name, componentName, purpose, animation, threeObject, content)
      if (Array.isArray(finalSections)) {
        blueprint.sections = finalSections.map(s => {
          const name = s.name || s.title || "Section";
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const id = s.id || s.sectionId || s.type || slug || "section";
          const type = s.type || s.componentName?.replace(/Section$/, '').toLowerCase() || id;
          const camelCaseName = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
          const componentName = s.componentName || `${camelCaseName}Section`;
          return {
            id,
            type,
            name,
            componentName,
            purpose: s.purpose || `Specialized ${type} showcase`,
            animation: s.animation || "slide-up",
            threeObject: s.threeObject || defaultThree,
            content: s.content || {}
          };
        });
      } else {
        blueprint.sections = [];
      }

      // Normalize pages & sections schema returned by Bedrock
      if (blueprint.pages && Array.isArray(blueprint.pages) && blueprint.pages.length > 0) {
        blueprint.pages = blueprint.pages.map(p => {
          const rawName = p.name || p.pageId || p.title || "Page";
          let name = rawName;
          if (name.includes("-")) {
            name = name.split("-").pop().trim();
          }
          name = name.charAt(0).toUpperCase() + name.slice(1);
          if (name.toLowerCase() !== "homepage") {
            name = name.replace(/page$/i, "");
          } else {
            name = "Home";
          }
          const path = p.path || p.url || (name.toLowerCase() === "home" ? "/" : `/${name.toLowerCase()}`);
          if (name.toLowerCase().includes("home") || path === "/") {
            name = "Home";
          }
          // Remove any remaining non-alphanumeric characters for safe JS imports
          name = name.replace(/[^a-zA-Z0-9]/g, "");
          
          let sections = p.sections || [];
          if (name === "Home" && (!sections || sections.length === 0)) {
            sections = blueprint.sections;
          }
          if (Array.isArray(sections)) {
            sections = sections.map(s => {
              const sName = s.name || s.title || "Section";
              const slug = sName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const id = s.id || s.sectionId || s.type || slug || "section";
              const type = s.type || s.componentName?.replace(/Section$/, '').toLowerCase() || id;
              const camelCaseName = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
              const componentName = s.componentName || `${camelCaseName}Section`;
              return {
                id,
                type,
                name: sName,
                componentName,
                purpose: s.purpose || `Specialized ${type} showcase`,
                animation: s.animation || "slide-up",
                threeObject: s.threeObject || defaultThree,
                content: s.content || {}
              };
            });
          }

          return {
            name,
            path,
            sections
          };
        });
      }

      // Priority 4: If pages do not exist but blueprint.sections exists, automatically create pages
      if (!blueprint.pages || !Array.isArray(blueprint.pages) || blueprint.pages.length === 0) {
        const explicitPages = parseExplicitPages(intent.prompt || "");
        const pagesList = explicitPages || (intent.pages && intent.pages.length ? intent.pages : ["Home", "About", "Pricing", "Contact"]);
        if (!pagesList.includes("Home")) {
          pagesList.unshift("Home");
        }
        blueprint.pages = pagesList.map((pageName) => {
          if (pageName === "Home") {
            return {
              name: pageName,
              path: "/",
              sections: blueprint.sections
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
            }
          ];
          return {
            name: pageName,
            path: `/${pageName.toLowerCase()}`,
            sections: defaultSections.map((s) => ({
              ...s,
              threeObject: s.threeObject || defaultThree,
              content: { ...s.content, headline: `${intent.websiteName || "Brand"} — ${s.name}` },
            })),
          };
        });
      }

      // Temporarily log output properties
      console.log(`[Blueprint Normalization Log] Output:`);
      console.log(` - Final blueprint.sections.length: ${blueprint.sections.length}`);
      console.log(` - Final section titles: ${blueprint.sections.map(s => s.name || s.title).join(", ")}`);

      // Populate layout and scene plan
      if (!blueprint.layout_plan) {
        blueprint.layout_plan = generateLayoutPlan(blueprint, intent.prompt || intent.websiteName, bt, blueprint.visualIdentity?.theme || "modernDark");
      }
      if (!blueprint.scene_plan) {
        blueprint.scene_plan = generateScenePlan(blueprint, intent.prompt || intent.websiteName, bt, blueprint.visualIdentity?.theme || "modernDark", "Home");
      }

      // Normalize navbar
      blueprint.navbar ??= {
        logo: intent.websiteName || blueprint.concept?.websiteName || "Website",
        links: blueprint.pages.map((p) => ({
          name: p.name,
          label: p.name,
          path: p.path
        }))
      };
      blueprint.navigation ??= blueprint.navbar;

      if (!blueprint.content_library) {
        blueprint.content_library = getIntelligentDomainContent(bt, intent.websiteName, intent.prompt);
      }

      if (!blueprint.seo) {
        blueprint.seo = {
          title: `${intent.websiteName || "Modern Site"} — ${blueprint.concept?.tagline || "Platform"}`,
          description: blueprint.concept?.uniqueSellingProposition || "Innovative interactive architecture",
          keywords: [intent.websiteName || "Interactive", intent.style || "Modern", ...(Array.isArray(intent.brandPersonality) ? intent.brandPersonality : ["innovative", "premium", "spatial"])],
          ogImage: "/og-image.jpg",
        };
      }
    }
  } catch (err) {
      source = "Local Fallback";
      fallbackReason = err.message;
      modelUsed = "N/A";
      blueprint = buildLocalBlueprint(intent);
    }

    const duration = Date.now() - startMs;

    // Logging output
    console.log(`[Blueprint]\nSource: ${source}`);
    console.log(`Blueprint Generation Time: ${duration}ms`);
    console.log(`Model Used: ${modelUsed}`);
    if (fallbackReason) {
      console.log(`Fallback Reason: ${fallbackReason}`);
    }

    if (process.env.BLUEPRINT_V2_ENABLED === "true") {
      if (source === "Local Fallback") {
        blueprint = BlueprintAdapterV1.adapt(blueprint, intent);
      }
    }

    return blueprint;
  }
}
