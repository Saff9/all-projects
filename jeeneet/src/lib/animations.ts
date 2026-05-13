// src/lib/animations.ts
// Modern animation utilities for enhanced UI/UX

export const animations = {
  // Fade in animations
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  // Slide up animation
  slideUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },

  // Scale animation
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  // Stagger animation for lists
  staggerContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  // Hover card animation
  cardHover: {
    whileHover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.98 }
  },

  // Button hover effect
  buttonHover: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.95 }
  },

  // Pulse animation for important elements
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },

  // Floating animation
  floating: {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Loading skeleton animation
  skeleton: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    }
  },

  // Success animation
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  },

  // Error shake animation
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  }
};

// Utility functions for animations
export const animationUtils = {
  // Get stagger delay for list items
  getStaggerDelay: (index: number, baseDelay: number = 0.1) => baseDelay * index,

  // Create delay for sequential animations
  createDelay: (delay: number) => ({ transition: { delay } }),

  // Spring animation configuration
  springConfig: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
  },

  // Smooth scroll utility
  smoothScroll: (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  },

  // Intersection Observer for scroll animations
  createIntersectionObserver: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      ...options
    });
  },

  // Add scroll-based animations
  addScrollAnimation: (element: HTMLElement, animationClass: string) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return observer;
  }
};

// Custom animation variants for specific use cases
export const customVariants = {
  // Hero section animations
  hero: {
    container: {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.3
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    }
  },

  // News card animations
  newsCard: {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  },

  // Stats counter animation
  counter: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },

  // Modal animation
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    content: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 },
      transition: { duration: 0.3 }
    }
  }
};

export default {
  animations,
  animationUtils,
  customVariants
};