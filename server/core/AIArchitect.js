/**
 * AIArchitect — Phase 1 & 2
 *
 * Analyzes the raw user prompt and extracts:
 *   - Business type, audience, brand personality
 *   - Design style preference
 *   - Color mood
 *   - Required pages & features
 *   - 3D element suggestions
 *
 * Output is an "intent object" consumed by BlueprintGenerator.
 */

import { DESIGN_STYLES } from '../templates/blueprintSchema.js'
import { inferBusinessType } from './BlueprintGenerator.js'

// ─── Keyword → style mapping ──────────────────────────────────────────────────
const STYLE_SIGNALS = {
  Futuristic:    ['ai', 'tech', 'neural', 'robot', 'automation', 'future', 'cyber', 'digital', 'smart'],
  Cyberpunk:     ['cyberpunk', 'neon', 'hacker', 'dystopian', 'glitch', 'punk'],
  Minimal:       ['minimal', 'clean', 'simple', 'white', 'elegant', 'zen', 'light'],
  Luxury:        ['luxury', 'premium', 'high-end', 'exclusive', 'diamond', 'gold', 'elite', 'vip'],
  Corporate:     ['enterprise', 'corporate', 'b2b', 'finance', 'legal', 'consulting', 'firm', 'agency'],
  Modern:        ['modern', 'sleek', 'contemporary', 'trendy', 'indigo', 'electric', 'dynamic', 'vibrant', 'saas', 'startup'],
  Nature:        ['nature', 'organic', 'eco', 'green', 'earth', 'sustainable', 'forest', 'herbal', 'botanical', 'farm', 'biological'],
  Warm:          ['warm', 'sunset', 'cozy', 'terracotta', 'autumn', 'inviting', 'amber', 'roasted', 'coffee', 'bakery', 'restaurant'],
  Gaming:        ['gaming', 'game', 'esports', 'play', 'gamer', 'stream', 'twitch'],
  Space:         ['space', 'cosmos', 'galaxy', 'star', 'universe', 'planet', 'orbit', 'nasa', 'rocket'],
  Glassmorphism: ['glassmorphism', 'glass', 'blur', 'frosted', 'transparent', 'ethereal', 'dream'],
  Neumorphism:   ['neumorphism', 'soft', 'clay', 'pastel', 'gentle', 'rounded', 'inset', 'embossed'],
}

// ─── Keyword → color palette mapping ─────────────────────────────────────────
const COLOR_MOODS = {
  dark_blue:   { primary: '#3d5eff', secondary: '#00d4ff', accent: '#bf5fff', background: '#0a0a14' },
  neon_cyber:  { primary: '#00ffff', secondary: '#ff007f', accent: '#fee801', background: '#050508' },
  luxury_gold: { primary: '#d4af37', secondary: '#f7e7ce', accent: '#a37c22', background: '#09080b' },
  space_deep:  { primary: '#6c63ff', secondary: '#a78bfa', accent: '#38bdf8', background: '#020212' },
  gaming_fire: { primary: '#ff4500', secondary: '#ff8c00', accent: '#ffdd00', background: '#0a0500' },
  eco_green:   { primary: '#386641', secondary: '#a3b18a', accent: '#e07a5f', background: '#121b18' },
  corporate:   { primary: '#2563eb', secondary: '#3b82f6', accent: '#1d4ed8', background: '#0f172a' },
  minimal:     { primary: '#ffffff', secondary: '#a1a1aa', accent: '#6366f1', background: '#09090b' },
  modern:      { primary: '#4f46e5', secondary: '#06b6d4', accent: '#ec4899', background: '#0b0f19' },
  warm:        { primary: '#e05a38', secondary: '#f49e4c', accent: '#fae5d3', background: '#171311' },
  glass:       { primary: '#8b5cf6', secondary: '#38bdf8', accent: '#ec4899', background: '#080816' },
  neumorph:    { primary: '#6366f1', secondary: '#94a3b8', accent: '#10b981', background: '#14171f' },
}

// ─── 3D element suggestions per style ─────────────────────────────────────────
const THREE_SUGGESTIONS = {
  Futuristic:    ['neural-network', 'geometric-grid', 'particle-field'],
  Cyberpunk:     ['torus-knot', 'particle-field', 'geometric-grid'],
  Minimal:       ['floating-sphere', 'icosahedron', 'particle-field'],
  Luxury:        ['crystal', 'floating-sphere', 'icosahedron'],
  Corporate:     ['geometric-grid', 'octahedron', 'particle-field'],
  Modern:        ['torus-knot', 'particle-field', 'icosahedron'],
  Nature:        ['floating-sphere', 'particle-field', 'crystal'],
  Warm:          ['floating-sphere', 'octahedron', 'torus-knot'],
  Gaming:        ['torus-knot', 'particle-field', 'black-hole'],
  Space:         ['planet', 'black-hole', 'particle-field'],
  Glassmorphism: ['crystal', 'floating-sphere', 'icosahedron'],
  Neumorphism:   ['floating-sphere', 'octahedron', 'crystal'],
}

/**
 * Infer design style from prompt keywords (returns best match).
 */
function inferStyle(text) {
  const lower = text.toLowerCase()
  let best = { style: 'Modern', score: 0 }

  for (const [style, signals] of Object.entries(STYLE_SIGNALS)) {
    const score = signals.filter(s => lower.includes(s)).length
    if (score > best.score) best = { style, score }
  }

  return best.style
}

/**
 * Infer color palette from style + prompt keywords.
 */
function inferPalette(style, text) {
  const lower = text.toLowerCase()
  if (lower.includes('gold') || lower.includes('luxury') || style === 'Luxury') return COLOR_MOODS.luxury_gold
  if (style === 'Space')                                                        return COLOR_MOODS.space_deep
  if (style === 'Gaming')                                                       return COLOR_MOODS.gaming_fire
  if (style === 'Minimal')                                                      return COLOR_MOODS.minimal
  if (style === 'Nature' || lower.includes('eco') || lower.includes('green'))   return COLOR_MOODS.eco_green
  if (style === 'Corporate')                                                    return COLOR_MOODS.corporate
  if (style === 'Cyberpunk')                                                    return COLOR_MOODS.neon_cyber
  if (style === 'Warm')                                                         return COLOR_MOODS.warm
  if (style === 'Glassmorphism')                                                return COLOR_MOODS.glass
  if (style === 'Neumorphism')                                                  return COLOR_MOODS.neumorph
  if (style === 'Futuristic')                                                   return COLOR_MOODS.dark_blue
  return COLOR_MOODS.modern
}

/**
 * Extract a website name from the prompt.
 * Looks for "called X" / "named X" / "for X" patterns first, else cleans command verbs and converts to Title Case.
 */
function extractName(text) {
  if (!text) return '3D Platform'
  let cleaned = String(text)
    .replace(/^(please\s+)?(can\s+you\s+)?(create|build|generate|design|make|develop|ship)(\s+me)?(\s+a|\s+an)?(\s+3d|\s+interactive|\s+cinematic|\s+modern|\s+responsive)?(\s+website|\s+webpage|\s+site|\s+landing\s+page|\s+portal|\s+application|\s+app)?(\s+(for|called|named|about|of|titled))?/i, '')
    .trim()
  if (!cleaned) cleaned = String(text)

  const patterns = [
    /(?:called|named|brand)\s+["']?([A-Z0-9][A-Za-z0-9\s]{1,35})["']?/i,
    /(?:for|of)\s+["']?([A-Za-z0-9][A-Za-z0-9\s]{1,35})["']?$/i,
    /^([A-Z][A-Za-z0-9]+(?:\s[A-Z][A-Za-z0-9]+)?)/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const found = m[1].trim()
      if (!/^(create|build|generate|design|make|develop|website|webpage|site|portal|app)$/i.test(found)) {
        return found.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
      }
    }
  }

  if (cleaned.length > 2 && cleaned.length < 45) {
    return cleaned.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
  }
  return '3D Platform'
}

/**
 * Detect which pages are needed from prompt.
 */
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

function detectPages(text) {
  const explicit = parseExplicitPages(text)
  if (explicit) return explicit;

  const lower = text.toLowerCase()
  const industry = inferBusinessType(text)
  let pages = ['Home']
  let domainMatched = true

  switch (industry) {
    case "Education":
      pages = ['Home', 'Academics', 'Admissions', 'Campus', 'Apply']
      break
    case "Restaurant":
      pages = ['Home', 'Menu', 'Gallery', 'Book']
      break
    case "Healthcare":
      pages = ['Home', 'Services', 'Doctors', 'Contact']
      break
    case "Gaming":
      pages = ['Home', 'Tournaments', 'Leaderboard', 'Community', 'Download']
      break
    case "FinTech":
      pages = ['Home', 'Markets', 'Security', 'Developers', 'Contact']
      break
    case "Real Estate":
      pages = ['Home', 'Properties', 'Neighborhoods', 'Agents', 'Contact']
      break
    case "Fashion":
      pages = ['Home', 'Collection', 'Lookbook', 'About', 'Contact']
      break
    case "Architecture":
      pages = ['Home', 'Projects', 'Firm', 'Contact']
      break
    case "Agency":
      pages = ['Home', 'Services', 'Portfolio', 'Pricing', 'Contact']
      break
    case "Portfolio":
      pages = ['Home', 'About', 'Projects', 'Contact']
      break
    case "SaaS":
      pages = ['Home', 'Features', 'Integrations', 'Pricing', 'Contact']
      break
    case "Automotive":
      pages = ['Home', 'Vehicles', 'Technology', 'Configurator', 'Dealers', 'Contact']
      break
    case "Hospitality":
      pages = ['Home', 'Suites', 'Leisure', 'Gallery', 'Book']
      break
    case "Space":
      pages = ['Home', 'Launch Vehicles', 'Satellites', 'Missions', 'Research', 'Careers', 'Contact']
      break
    default:
      domainMatched = false
      break
  }

  // 2. If no domain matched, fallback to dynamic feature/keyword detection
  if (!domainMatched) {
    if (lower.match(/about|team|story/))           pages.push('About')
    if (lower.match(/service|solution|offer/))     pages.push('Services')
    if (lower.match(/product|showcase|portfolio/)) pages.push('Products')
    if (lower.match(/pric|plan|tier/))             pages.push('Pricing')
    if (lower.match(/blog|article|news/))          pages.push('Blog')
    if (lower.match(/contact|reach|touch/))        pages.push('Contact')
    if (pages.length < 3) pages.push('Services', 'Contact')
  } else {
    // Optionally incorporate explicit extra page mentions even if domain matched
    if (lower.match(/\bblog\b/))    pages.push('Blog')
    if (lower.match(/\bfaq\b/))     pages.push('FAQ')
    if (lower.match(/\bcareers\b/)) pages.push('Careers')
  }

  return [...new Set(pages)]
}

/**
 * Main entry point — Phase 1 analysis.
 * @param {string} prompt  Raw user prompt
 * @returns {object}       Intent object
 */
export function analyzePrompt(prompt) {
  const style       = inferStyle(prompt)
  const palette     = inferPalette(style, prompt)
  const websiteName = extractName(prompt)
  const pages       = detectPages(prompt)
  const industry    = inferBusinessType(prompt)

  return {
    prompt,
    websiteName,
    style,
    palette,
    pages,
    industry,
    threeObjects: THREE_SUGGESTIONS[style] || THREE_SUGGESTIONS.Futuristic,
    brandPersonality: deriveBrandPersonality(style),
  }
}

function deriveBrandPersonality(style) {
  const map = {
    Futuristic:    ['innovative', 'bold', 'cutting-edge'],
    Cyberpunk:     ['rebellious', 'dark', 'disruptive'],
    Minimal:       ['clean', 'focused', 'elegant'],
    Luxury:        ['exclusive', 'refined', 'prestigious'],
    Corporate:     ['trustworthy', 'professional', 'reliable'],
    Startup:       ['agile', 'energetic', 'growth-driven'],
    Gaming:        ['exciting', 'competitive', 'immersive'],
    Space:         ['visionary', 'limitless', 'exploratory'],
    AI:            ['intelligent', 'adaptive', 'powerful'],
    Glassmorphism: ['modern', 'transparent', 'fluid'],
    Neumorphism:   ['soft', 'tactile', 'approachable'],
  }
  return map[style] || ['modern', 'creative']
}
