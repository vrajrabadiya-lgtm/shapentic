import { getThemeVisualIdentity as getVisualIdentity } from '../BlueprintGenerator.js';
import { ValidationError } from './ValidationError.js';

export class FooterRenderer {
  validate(bp) {
    if (!bp.brand?.name) {
      throw new ValidationError('Footer validation failed: blueprint.brand.name is missing.');
    }
    if (!bp.brand?.tagline) {
      throw new ValidationError('Footer validation failed: blueprint.brand.tagline is missing.');
    }
    if (!bp.footer?.links) {
      throw new ValidationError('Footer validation failed: blueprint.footer.links are missing.');
    }
  }

  render(bp) {
    this.validate(bp);

    const vid = getVisualIdentity(bp);
    const brandName = bp.brand.name;
    const tagline = bp.brand.tagline;
    const links = bp.footer.links;

    return `import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export default function Footer({ brand = "${brandName}", tagline = "${tagline}", links = ${JSON.stringify(links)} }) {
  const { themeTokens, theme } = useTheme();
  const bg = themeTokens?.colors?.background || "${vid.backgroundColor}";
  const pri = themeTokens?.colors?.primary || "${vid.primaryColor}";
  const sec = themeTokens?.colors?.secondary || "${vid.secondaryColor}";
  const txt = themeTokens?.colors?.text || "${vid.textColor}";
  const muted = themeTokens?.colors?.textMuted || "${vid.textMutedColor}";

  return (
    <footer className="border-t py-16 px-6 text-center relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: bg, borderColor: \`\${pri}33\` }}>
      <div className="absolute inset-0 pointer-events-none opacity-15 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-2xl font-extrabold mb-3 inline-block" style={{ color: txt }}>{brand}</div>
        <p className="text-sm max-w-xl mx-auto mb-8 leading-relaxed font-normal" style={{ color: muted }}>{tagline}</p>
        <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold mb-12" style={{ color: muted }}>
          {links.map((l, i) => <span key={i} className="cursor-pointer hover:opacity-100 opacity-80 transition-opacity" style={{ color: sec }}>{typeof l === 'string' ? l : l.name || 'Link'}</span>)}
        </div>
        <div className="text-xs border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ color: \`\${muted}99\` }}>
          <span>&copy; {new Date().getFullYear()} {brand}. All rights reserved.</span>
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border" style={{ backgroundColor: \`\${pri}1a\`, borderColor: \`\${pri}33\`, color: sec }}>Theme: {theme || '${vid.theme}'}</span>
        </div>
      </div>
    </footer>
  );
}`;
  }
}
