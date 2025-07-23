// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeSelect = document.getElementById('theme-select');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initThemeToggle();
  initThemeSelect();
  initSystemThemeListener();
  initThemeTransitions();
});

// Initialize theme based on saved preference or system preference
function initTheme() {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    // Use saved preference
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Use system preference
    if (prefersDarkScheme.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  updateThemeToggleIcon();
  updateThemeSelect();
  
  console.log('Theme initialized:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Initialize theme toggle button
function initThemeToggle() {
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// Initialize theme select dropdown
function initThemeSelect() {
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      setTheme(this.value);
    });
  }
}

// Initialize system theme listener
function initSystemThemeListener() {
  prefersDarkScheme.addEventListener('change', function(event) {
    if (!localStorage.getItem('theme')) {
      // Only update if no user preference is set
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      updateThemeToggleIcon();
      updateThemeSelect();
      
      console.log('System theme changed:', event.matches ? 'dark' : 'light');
    }
  });
}

// Initialize theme transitions
function initThemeTransitions() {
  // Add transition classes to elements that should animate on theme change
  const transitionElements = document.querySelectorAll('body, header, footer, .card, .bg-white, .text-gray-700, .border-gray-200');
  
  transitionElements.forEach(element => {
    element.classList.add('transition-colors', 'duration-300');
  });
  
  console.log('Theme transitions initialized');
}

// Toggle theme between light and dark
function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}

// Set theme explicitly
function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else if (theme === 'system') {
    localStorage.removeItem('theme');
    if (prefersDarkScheme.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  updateThemeToggleIcon();
  updateThemeSelect();
  
  console.log('Theme set to:', theme);
  
  // Track theme change event
  trackThemeEvent(theme);
}

// Update theme toggle icon
function updateThemeToggleIcon() {
  if (themeToggle) {
    if (document.documentElement.classList.contains('dark')) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
}

// Update theme select dropdown
function updateThemeSelect() {
  if (themeSelect) {
    const currentTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = currentTheme;
  }
}

// Track theme change event
function trackThemeEvent(theme) {
  // In a real app, this would send an event to analytics
  console.log('Theme changed to:', theme);
  
  // Send to Google Analytics if available
  if (typeof gtag === 'function') {
    gtag('event', 'theme_change', {
      event_category: 'user_preferences',
      event_label: theme,
      value: 1
    });
  }
}

// Handle before print (reset to light theme for printing)
window.addEventListener('beforeprint', function() {
  document.documentElement.classList.remove('dark');
  console.log('Reset to light theme for printing');
});

// Handle after print (restore theme)
window.addEventListener('afterprint', function() {
  initTheme();
  console.log('Restored theme after printing');
});

// Export functions for use in other scripts
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.trackThemeEvent = trackThemeEvent;

console.log('Theme JavaScript module loaded and initialized');
