/**
 * ComponentRenderer.js
 * ComponentRenderer
 *
 * Renders reusable, atomic UI components like Buttons, Cards, etc.
 * These are the building blocks for sections and layouts.
 * This file contains pure functions that generate the JSX string content for
 * reusable UI and layout components. These are the building blocks of the
 * generated website.
 *
 * Each function is responsible for rendering a single component and should not
 * contain business logic for data fetching or inference.
 */

export function getButtonComponentString() {
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
        border: \`1px solid \${themeTokens.colors.border}\`
      };
    }
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: themeTokens.colors.primary,
        border: \`2px solid \${themeTokens.colors.primary}\`
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

export function getFeatureCardComponentString() {
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


export function getTestimonialCardComponentString() {
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

export function getFAQAccordionComponentString() {
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

export function getStatCardComponentString() {
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

export function getPricingCardComponentString() {
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
  { highlight && (
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
