/**
 * LayoutRenderer.js
 * 
 * Renders structural layout components like HeroLayout, Container, Section, etc.
 */

export function getHeroLayoutComponentString() {
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

export function getContainerComponentString() {
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

export function getSectionComponentString() {
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

export function getGridComponentString() {
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

export function getStackComponentString() {
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
