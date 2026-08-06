import { ValidationError } from './ValidationError.js';

export class HeroRenderer {
  validate(bp) {
    if (!bp.hero?.headline) {
      throw new ValidationError('Hero validation failed: blueprint.hero.headline is missing.');
    }
    if (!bp.hero?.buttons) {
      throw new ValidationError('Hero validation failed: blueprint.hero.buttons are missing.');
    }
    if (!bp.theme?.colors?.primary) {
      throw new ValidationError('Hero validation failed: blueprint.theme.colors.primary is missing.');
    }
    if (!bp.scene?.sceneId) {
        throw new ValidationError('Hero validation failed: blueprint.scene.sceneId is missing.');
    }
  }

  render(bp) {
    this.validate(bp);

    const hero = bp.hero;
    const theme = bp.theme;
    const colors = theme.colors;

    const alignment = hero.alignment || 'left';

    const buttons = (hero.buttons || []).map(btn => ({
      text: btn.label,
      variant: btn.type || 'primary',
      href: btn.path || '#'
    }));

    const heroData = {
      title: hero.headline,
      subtitle: hero.subheadline || '',
      description: hero.description || '',
      badge: hero.badge || '',
      alignment: alignment,
      background: colors.background,
      theme: {
        primary: colors.primary,
        secondary: colors.secondary,
        text: colors.text
      },
      buttons: buttons,
    };

    return `import React from 'react';
import HeroLayout from '../layout/HeroLayout';
import Cinematic3DScene from '../../3d/Cinematic3DScene';

// Data is sourced directly from the AI-generated blueprint.
const heroData = ${JSON.stringify(heroData, null, 2)};

export default function HeroSection() {
  return (
    <HeroLayout
      {...heroData}
      scene={<Cinematic3DScene sceneId="${bp.scene.sceneId}" />}
    />
  );
}
`;
  }
}
