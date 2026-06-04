// Template Components Index
export { default as MinimalTemplate } from './MinimalTemplate';
export { default as GradientTemplate } from './GradientTemplate';
export { default as DarkTemplate } from './DarkTemplate';
export { default as NeonTemplate } from './NeonTemplate';
export { default as ProfessionalTemplate } from './ProfessionalTemplate';
export { default as GlassTemplate } from './GlassTemplate';
export { default as NeonGlowTemplate } from './NeonGlowTemplate';
export { default as CardTemplate } from './CardTemplate';
export { default as SplitTemplate } from './SplitTemplate';
export { default as AnimatedTemplate } from './AnimatedTemplate';

export { 
  default as TemplateRenderer,
  getTemplateComponent,
  getTemplateDefaultSettings,
  getTemplateConfig,
  validateTemplateConfig
} from './TemplateRenderer';

// Template configurations for easy access
export const templateConfigs = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    component: 'MinimalTemplate',
    preview: '/templates/minimal.png',
    category: 'minimal',
  },
  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradient backgrounds',
    component: 'GradientTemplate',
    preview: '/templates/gradient.png',
    category: 'creative',
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Dark mode focused design',
    component: 'DarkTemplate',
    preview: '/templates/dark.png',
    category: 'bold',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Neon glow effects',
    component: 'NeonTemplate',
    preview: '/templates/neon.png',
    category: 'creative',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Business professional look',
    component: 'ProfessionalTemplate',
    preview: '/templates/professional.png',
    category: 'professional',
  },
  glass: {
    id: 'glass',
    name: 'Glass',
    description: 'Glassmorphism effect with blur',
    component: 'GlassTemplate',
    preview: '/templates/glass.png',
    category: 'creative',
  },
  neonglow: {
    id: 'neonglow',
    name: 'Neon Glow',
    description: 'Intense neon glow effects',
    component: 'NeonGlowTemplate',
    preview: '/templates/neonglow.png',
    category: 'bold',
  },
  card: {
    id: 'card',
    name: 'Card',
    description: 'Card-based grid layout',
    component: 'CardTemplate',
    preview: '/templates/card.png',
    category: 'professional',
  },
  split: {
    id: 'split',
    name: 'Split',
    description: 'Split screen design',
    component: 'SplitTemplate',
    preview: '/templates/split.png',
    category: 'bold',
  },
  animated: {
    id: 'animated',
    name: 'Animated',
    description: 'Heavy animations and effects',
    component: 'AnimatedTemplate',
    preview: '/templates/animated.png',
    category: 'creative',
  },
};
