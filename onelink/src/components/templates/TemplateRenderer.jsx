import { useMemo } from 'react';
import {
  MinimalTemplate,
  GradientTemplate,
  DarkTemplate,
  NeonTemplate,
  ProfessionalTemplate,
  GlassTemplate,
  NeonGlowTemplate,
  CardTemplate,
  SplitTemplate,
  AnimatedTemplate,
} from './index';

/**
 * TemplateRenderer Component
 * Dynamically renders the selected template with profile data
 * 
 * @param {string} templateId - ID of the template to render
 * @param {object} profile - Profile data
 * @param {array} links - Array of links
 * @param {function} onLinkClick - Link click handler
 * @param {object} themeSettings - Custom theme settings
 * @param {object} templateConfig - Template-specific configuration
 * @param {string} className - Additional CSS classes
 */
const TemplateRenderer = ({
  templateId = 'minimal',
  profile = {},
  links = [],
  onLinkClick,
  themeSettings = {},
  templateConfig = {},
  className = '',
}) => {
  // Merge theme settings with defaults
  const mergedTheme = useMemo(() => {
    const defaults = {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonStyle: 'rounded',
      animationType: 'none',
    };

    return { ...defaults, ...themeSettings };
  }, [themeSettings]);

  // Template-specific props
  const getTemplateProps = () => {
    const baseProps = {
      profile,
      links,
      onLinkClick,
      className,
    };

    switch (templateId) {
      case 'minimal':
        return baseProps;

      case 'gradient':
        return {
          ...baseProps,
          gradient: templateConfig.gradient || 'sunset',
        };

      case 'dark':
        return baseProps;

      case 'neon':
        return {
          ...baseProps,
          neonColor: templateConfig.neonColor || 'cyan',
        };

      case 'professional':
        return baseProps;

      case 'glass':
        return baseProps;

      case 'neonglow':
        return {
          ...baseProps,
          neonColor: templateConfig.neonColor || 'cyan',
        };

      case 'card':
        return baseProps;

      case 'split':
        return baseProps;

      case 'animated':
        return baseProps;

      default:
        return baseProps;
    }
  };

  // Render the appropriate template
  const renderTemplate = () => {
    const props = getTemplateProps();

    switch (templateId) {
      case 'minimal':
        return <MinimalTemplate {...props} />;

      case 'gradient':
        return <GradientTemplate {...props} />;

      case 'dark':
        return <DarkTemplate {...props} />;

      case 'neon':
        return <NeonTemplate {...props} />;

      case 'professional':
        return <ProfessionalTemplate {...props} />;

      case 'glass':
        return <GlassTemplate {...props} />;

      case 'neonglow':
        return <NeonGlowTemplate {...props} />;

      case 'card':
        return <CardTemplate {...props} />;

      case 'split':
        return <SplitTemplate {...props} />;

      case 'animated':
        return <AnimatedTemplate {...props} />;

      default:
        // Fallback to minimal template
        return <MinimalTemplate {...props} />;
    }
  };

  return renderTemplate();
};

/**
 * getTemplateComponent Function
 * Returns the component for a given template ID
 */
export const getTemplateComponent = (templateId) => {
  const templates = {
    minimal: MinimalTemplate,
    gradient: GradientTemplate,
    dark: DarkTemplate,
    neon: NeonTemplate,
    professional: ProfessionalTemplate,
    glass: GlassTemplate,
    neonglow: NeonGlowTemplate,
    card: CardTemplate,
    split: SplitTemplate,
    animated: AnimatedTemplate,
  };

  return templates[templateId] || MinimalTemplate;
};

/**
 * getTemplateDefaultSettings Function
 * Returns default settings for a template
 */
export const getTemplateDefaultSettings = (templateId) => {
  const defaults = {
    minimal: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonStyle: 'rounded',
      animationType: 'none',
    },
    gradient: {
      primaryColor: '#f97316',
      secondaryColor: '#ec4899',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      buttonStyle: 'pill',
      animationType: 'gradient',
    },
    dark: {
      primaryColor: '#6366f1',
      secondaryColor: '#3b82f6',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      animationType: 'stars',
    },
    neon: {
      primaryColor: '#06b6d4',
      secondaryColor: '#f472b6',
      backgroundColor: '#0f172a',
      textColor: '#22d3ee',
      buttonStyle: 'rounded',
      animationType: 'mesh',
    },
    professional: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      buttonStyle: 'rounded',
      animationType: 'none',
    },
    glass: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#1e1b4b',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      animationType: 'particles',
    },
    neonglow: {
      primaryColor: '#00ffff',
      secondaryColor: '#00d4ff',
      backgroundColor: '#030712',
      textColor: '#00ffff',
      buttonStyle: 'rounded',
      animationType: 'mesh',
    },
    card: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      buttonStyle: 'rounded',
      animationType: 'none',
    },
    split: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonStyle: 'rounded',
      animationType: 'none',
    },
    animated: {
      primaryColor: '#f43f5e',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#0f0f23',
      textColor: '#ffffff',
      buttonStyle: 'rounded',
      animationType: 'particles',
    },
  };

  return defaults[templateId] || defaults.minimal;
};

/**
 * getTemplateConfig Function
 * Returns template-specific configuration options
 */
export const getTemplateConfig = (templateId) => {
  const configs = {
    minimal: {
      supportsCustomBackground: true,
      supportsCustomFonts: true,
      supportsAnimations: false,
      availableButtonStyles: ['rounded', 'square', 'pill'],
    },
    gradient: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'pill'],
      gradients: ['sunset', 'ocean', 'forest', 'aurora', 'cosmic', 'rainbow', 'midnight', 'fire'],
    },
    dark: {
      supportsCustomBackground: true,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'square'],
    },
    neon: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'square'],
      neonColors: ['cyan', 'pink', 'green', 'purple', 'orange'],
    },
    professional: {
      supportsCustomBackground: true,
      supportsCustomFonts: true,
      supportsAnimations: false,
      availableButtonStyles: ['rounded', 'square'],
    },
    glass: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'pill'],
    },
    neonglow: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'square'],
      neonColors: ['cyan', 'pink', 'green', 'purple', 'orange'],
    },
    card: {
      supportsCustomBackground: true,
      supportsCustomFonts: true,
      supportsAnimations: false,
      availableButtonStyles: ['rounded', 'square'],
    },
    split: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: false,
      availableButtonStyles: ['rounded', 'square'],
    },
    animated: {
      supportsCustomBackground: false,
      supportsCustomFonts: true,
      supportsAnimations: true,
      availableButtonStyles: ['rounded', 'pill'],
    },
  };

  return configs[templateId] || configs.minimal;
};

/**
 * validateTemplateConfig Function
 * Validates template configuration
 */
export const validateTemplateConfig = (templateId, config) => {
  const templateConfig = getTemplateConfig(templateId);
  const errors = [];

  // Validate gradient for gradient template
  if (templateId === 'gradient' && config.gradient) {
    if (!templateConfig.gradients?.includes(config.gradient)) {
      errors.push(`Invalid gradient: ${config.gradient}. Available: ${templateConfig.gradients?.join(', ')}`);
    }
  }

  // Validate neon color for neon/neonglow templates
  if ((templateId === 'neon' || templateId === 'neonglow') && config.neonColor) {
    if (!templateConfig.neonColors?.includes(config.neonColor)) {
      errors.push(`Invalid neon color: ${config.neonColor}. Available: ${templateConfig.neonColors?.join(', ')}`);
    }
  }

  // Validate button style
  if (config.buttonStyle && templateConfig.availableButtonStyles) {
    if (!templateConfig.availableButtonStyles.includes(config.buttonStyle)) {
      errors.push(`Invalid button style: ${config.buttonStyle}. Available: ${templateConfig.availableButtonStyles.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default TemplateRenderer;
