import { logComponentGeneration } from "./CodeGenerator.js";

/**
 * BaseSectionRenderer
 * 
 * Defines the common interface and layout composition logic for all website section renderers.
 * Decoupled from the business domain. Consumes only Blueprint V2 data.
 */
export class BaseSectionRenderer {
  constructor(type) {
    this.type = type;
  }

  /**
   * Returns true if this renderer supports the section type.
   */
  supports(type) {
    return this.type === type || (Array.isArray(this.type) && this.type.includes(type));
  }

  /**
   * Validates section configuration payload.
   */
  validate(sec) {
    if (!sec || typeof sec !== "object") {
      throw new Error(`Invalid section payload for type ${this.type}`);
    }
    if (!sec.id || !sec.componentName) {
      throw new Error(`Section payload is missing id or componentName: ${JSON.stringify(sec)}`);
    }
  }

  /**
   * Shared composition method to compile section layout, spacing, theme, and animations.
   */
  render(sec, bp) {
    this.validate(sec);

    // 1. Resolve content fields
    const content = sec.content || {};
    const heading = content.heading || sec.name || "Default Heading";
    const subheading = content.subheading || "";
    
    // 2. Resolve layouts and design tokens
    const layout = sec.layout || "default";
    const animation = sec.animation || "slide-up";
    const spacing = sec.spacing || bp.theme?.spacing?.sectionSpacing || "lg";
    const containerSize = sec.containerSize || bp.theme?.spacing?.containerMax || "xl";

    // 3. Perform generation audit log
    logComponentGeneration(sec.componentName, `blueprint.sections (${sec.type})`, ["heading", "subheading", "layout", "animation"]);

    // 4. Generate visual style properties using V2 design tokens
    const priColor = bp.theme?.colors?.primary || "#3b82f6";
    const secColor = bp.theme?.colors?.secondary || "#10b981";

    // 5. Build inner JSX via subclass hook
    const innerJSX = this.renderContent(sec, bp);
    const extraImports = this.getImports(sec, bp) || "";

    // 6. Wrap in standard layout and animation tags
    return `import React from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';
import Stack from '../layout/Stack';
${extraImports}

export default function ${sec.componentName}() {
  return (
    <Section spacing="${spacing}" className="layout-${layout} animate-${animation}">
      <Container size="${containerSize}">
        <Stack spacing="lg">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-primary)] mb-2 block" style={{ color: '${priColor}' }}>
              ${sec.name || 'Featured'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">${heading}</h2>
            {${JSON.stringify(subheading)} && (
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">${subheading}</p>
            )}
          </div>
          ${innerJSX}
        </Stack>
      </Container>
    </Section>
  );
}
`;
  }

  /**
   * Hook for subclasses to output custom imports.
   */
  getImports(sec, bp) {
    return "";
  }

  /**
   * Hook for subclasses to output inner React/JSX code structure.
   */
  renderContent(sec, bp) {
    throw new Error("Subclasses of BaseSectionRenderer must implement renderContent(sec, bp)");
  }
}

