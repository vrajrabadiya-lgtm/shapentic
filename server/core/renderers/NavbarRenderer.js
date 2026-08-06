import { getThemeVisualIdentity as getVisualIdentity } from '../BlueprintGenerator.js';
import { ValidationError } from './ValidationError.js';

export class NavbarRenderer {
  validate(bp) {
    if (!bp.brand?.name) {
      throw new ValidationError('Navbar validation failed: blueprint.brand.name is missing.');
    }
    if (!bp.navigation?.links) {
      throw new ValidationError('Navbar validation failed: blueprint.navigation.links are missing.');
    }
    if (!bp.navigation?.cta?.label) {
      throw new ValidationError('Navbar validation failed: blueprint.navigation.cta.label is missing.');
    }
    if (!bp.navigation?.cta?.path) {
      throw new ValidationError('Navbar validation failed: blueprint.navigation.cta.path is missing.');
    }
  }

  render(bp) {
    this.validate(bp);

    const vid = getVisualIdentity(bp);
    const ctaLabel = bp.navigation.cta.label;
    const ctaPath = bp.navigation.cta.path;

    return `import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

export default function Navbar({ brand = "Website", links = [] }) {
  const { themeTokens } = useTheme();
  const bg = themeTokens?.colors?.surface || "${vid.backgroundColor}";
  const pri = themeTokens?.colors?.primary || "${vid.primaryColor}";
  const txt = themeTokens?.colors?.text || "${vid.textColor}";
  const acc = themeTokens?.colors?.accent || "${vid.accentColor}";
  const maxW = themeTokens?.spacing?.containerMax || "${vid.spacing?.containerMax || 'max-w-7xl mx-auto'}";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b border-white/10" style={{ backgroundColor: \`\${bg}e6\` }}>
      <div className={\`\${maxW} px-6 h-20 flex items-center justify-between\`}>
        <Link to="/" className="text-2xl font-extrabold tracking-wider flex items-center gap-2" style={{ color: txt }}>
          <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: pri }}></span>
          <span>{brand}</span>
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link, idx) => {
            const name = typeof link === 'object' && link !== null ? (link.name || link.label || 'Link') : String(link);
            const path = typeof link === 'object' && link !== null ? (link.path || '/') : (link === 'Home' ? '/' : '/' + String(link).toLowerCase());
            return (
              <Link key={idx} to={path} className="text-sm font-semibold transition-colors opacity-80 hover:opacity-100" style={{ color: txt }}>
                {name}
              </Link>
            );
          })}
          <Link to="${ctaPath}" className="!py-2.5 !px-6 text-xs transition-transform transform hover:scale-105 font-bold rounded-lg text-white" style={{ backgroundColor: pri }}>
            ${ctaLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}`;
  }
}
