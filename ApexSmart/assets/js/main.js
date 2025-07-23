// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const searchToggle = document.getElementById('search-toggle');
const searchModal = document.getElementById('search-modal');
const closeSearch = document.getElementById('close-search');
const mobileSearch = document.getElementById('mobile-search');
const searchResults = document.getElementById('search-results');
const sidebarToggle = document.getElementById('sidebar-toggle');
const adminSidebar = document.getElementById('admin-sidebar');
const adminMain = document.getElementById('admin-main');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize animations
    initAnimations();
    
    // Initialize header scroll effects
    initHeaderScroll();
    
    // Initialize modals
    initModals();
    
    // Initialize tabs
    initTabs();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize scroll to top
    initScrollToTop();
    
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize intersection observers
    initIntersectionObservers();
});

// Theme initialization
function initTheme() {
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Toggle theme between light and dark mode
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Search functionality initialization
function initSearch() {
    if (!searchToggle || !searchModal || !closeSearch || !mobileSearch) return;
    
    // Open search modal
    searchToggle.addEventListener('click', function() {
        searchModal.classList.remove('hidden');
        mobileSearch.focus();
        document.body.style.overflow = 'hidden';
    });
    
    // Close search modal
    closeSearch.addEventListener('click', function() {
        searchModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    // Close search modal when clicking outside
    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            searchModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Search functionality
    mobileSearch.addEventListener('input', function(e) {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.innerHTML = '<p class="text-center text-gray-500 py-8">Start typing to search posts, users, and categories</p>';
            return;
        }
        
        // In a real app, this would make an API call to search
        // For demo purposes, we'll show mock results
        performSearch(query);
    });
}

// Perform search operation
function performSearch(query) {
    // Mock search results
    const mockResults = [
        {
            title: 'Digital Minimalism: Finding Balance in a Connected World',
            excerpt: 'Exploring how intentional technology use can lead to greater focus, deeper relationships, and more meaningful creative work.',
            url: 'post.html',
            type: 'post'
        },
        {
            title: 'Redefining Success: Beyond Traditional Metrics',
            excerpt: 'In a world obsessed with external validation, how do we create our own definitions of success that truly resonate with our values?',
            url: '#',
            type: 'post'
        },
        {
            title: 'Taylor Rodriguez',
            excerpt: 'Community Lead & Digital Wellness Advocate',
            url: '#',
            type: 'user'
        },
        {
            title: 'Tech',
            excerpt: 'Articles about technology, digital trends, and innovation',
            url: '#',
            type: 'category'
        }
    ];
    
    // Filter results based on query
    const results = mockResults.filter(result => 
        result.title.toLowerCase().includes(query) || 
        result.excerpt.toLowerCase().includes(query)
    );
    
    // Display results
    displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="text-center text-gray-500 py-8">No results found for "' + query + '"</p>';
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    results.forEach(result => {
        html += `
            <a href="${result.url}" class="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 mt-1">
                        <i class="fas fa-${result.type === 'post' ? 'file-alt' : result.type === 'user' ? 'user' : 'tag'} text-indigo-500"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 dark:text-white">${highlightText(result.title, query)}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${highlightText(result.excerpt, query)}</p>
                        <span class="mt-2 inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-medium">
                            ${result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    
    html += '</div>';
    
    searchResults.innerHTML = html;
}

// Highlight search text in results
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(query, 'gi');
    return text.replace(regex, match => `<span class="bg-yellow-200 dark:bg-yellow-900/50 font-medium">${match}</span>`);
}

// Initialize animations
function initAnimations() {
    // Fade in animations for elements
    const fadeElements = document.querySelectorAll('.animate-fade-in');
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * Array.from(fadeElements).indexOf(element));
    });
    
    // Staggered animations
    const staggerElements = document.querySelectorAll('.animate-stagger');
    staggerElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 * index);
    });
}

// Initialize header scroll effects
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    let lastScrollTop = 0;
    const headerHeight = header.offsetHeight;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > headerHeight) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide header
                header.classList.add('header-slide-up');
                header.classList.remove('header-slide-down');
            } else {
                // Scrolling up - show header
                header.classList.add('header-slide-down');
                header.classList.remove('header-slide-up');
            }
        } else {
            // At the top - reset header
            header.classList.remove('header-slide-up', 'header-slide-down');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Initialize modals
function initModals() {
    // Get all modal elements
    const modals = document.querySelectorAll('[id$="-modal"]');
    const closeButtons = document.querySelectorAll('[id^="close-"]');
    
    // Close modals when close button is clicked
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.id.replace('close-', '') + '-modal';
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close modals when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Open writing tips modal
    const writingTipsButton = document.querySelector('button[aria-label="Writing Tips"]');
    const writingTipsModal = document.getElementById('writing-tips-modal');
    
    if (writingTipsButton && writingTipsModal) {
        writingTipsButton.addEventListener('click', function() {
            writingTipsModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }
}

// Initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('aria-controls');
            
            // Update tab buttons
            tabButtons.forEach(btn => {
                btn.setAttribute('aria-selected', btn === this);
                if (btn === this) {
                    btn.classList.add('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900/50', 'dark:text-indigo-300');
                } else {
                    btn.classList.remove('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900/50', 'dark:text-indigo-300');
                }
            });
            
            // Update tab panels
            tabPanels.forEach(panel => {
                panel.setAttribute('aria-hidden', panel.id !== tabId);
                if (panel.id === tabId) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip bg-gray-900 text-white text-xs rounded py-1 px-2 absolute z-50 opacity-0 transition-opacity duration-200 whitespace-nowrap';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        // Position and show tooltip on hover
        element.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 8}px`;
            tooltip.style.opacity = '1';
        });
        
        // Hide tooltip on mouse leave
        element.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
        
        // Remove tooltip on element removal
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.removedNodes.contains(element)) {
                    tooltip.remove();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// Initialize scroll to top
function initScrollToTop() {
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.id = 'scroll-to-top';
    scrollToTopButton.className = 'fixed bottom-6 right-6 z-40 p-3 rounded-full bg-indigo-600 text-white shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
    scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopButton);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopButton.classList.remove('opacity-0', 'invisible');
            scrollToTopButton.classList.add('opacity-100', 'visible');
        } else {
            scrollToTopButton.classList.remove('opacity-100', 'visible');
            scrollToTopButton.classList.add('opacity-0', 'invisible');
        }
    });
    
    // Scroll to top when button is clicked
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize lazy loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.removeAttribute('data-src');
                    image.classList.add('lazy-loaded');
                    observer.unobserve(image);
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px'
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
            image.classList.add('lazy-loaded');
        });
    }
}

// Initialize intersection observers
function initIntersectionObservers() {
    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.scroll-reveal, .fade-in-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback - show all elements immediately
        revealElements.forEach(element => {
            element.classList.add('visible');
        });
    }
    
    // Staggered reveal animations
    const staggerElements = document.querySelectorAll('.stagger-reveal');
    
    if ('IntersectionObserver' in window) {
        const staggerObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Get the index of the element
                    const index = Array.from(staggerElements).indexOf(entry.target) + 1;
                    entry.target.classList.add(`visible-${index}`);
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        staggerElements.forEach(element => {
            staggerObserver.observe(element);
        });
    } else {
        // Fallback - show all elements immediately
        staggerElements.forEach((element, index) => {
            const delay = index * 100;
            setTimeout(() => {
                element.classList.add(`visible-${index + 1}`);
            }, delay);
        });
    }
}

// Admin sidebar toggle
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
        adminSidebar.classList.toggle('sidebar-expanded');
        adminSidebar.classList.toggle('sidebar-collapsed');
        adminMain.classList.toggle('main-expanded');
        adminMain.classList.toggle('main-collapsed');
        
        const icon = this.querySelector('i');
        if (adminSidebar.classList.contains('sidebar-collapsed')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    });
}

// Form validation
function validateForm(form) {
    let isValid = true;
    
    // Get all required fields
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
        } else {
            hideError(field);
        }
    });
    
    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            isValid = false;
            showError(emailField, 'Please enter a valid email address');
        } else {
            hideError(emailField);
        }
    }
    
    // Password validation
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField && passwordField.value.trim()) {
        if (passwordField.value.length < 8) {
            isValid = false;
            showError(passwordField, 'Password must be at least 8 characters long');
        } else {
            hideError(passwordField);
        }
    }
    
    return isValid;
}

// Show error message
function showError(field, message) {
    // Remove existing error message
    const existingError = field.closest('.relative').querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    field.classList.add('border-red-500');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1 absolute left-0 bottom-full mb-1';
    errorDiv.textContent = message;
    
    // Insert error message
    field.closest('.relative').insertBefore(errorDiv, field.nextSibling);
}

// Hide error message
function hideError(field) {
    field.classList.remove('border-red-500');
    const errorDiv = field.closest('.relative').querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Handle form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        if (!validateForm(this)) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i> Processing...';
            submitButton.disabled = true;
            
            // Restore button after 2 seconds (for demo purposes)
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
        }
    });
});

// Handle like button clicks
document.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', function() {
        const isLiked = this.classList.contains('active');
        const countElement = this.querySelector('span:last-child');
        let count = parseInt(countElement.textContent);
        
        if (isLiked) {
            count--;
            this.classList.remove('active', 'text-red-500', 'dark:text-red-400');
            this.querySelector('i').classList.remove('fa-heart');
            this.querySelector('i').classList.add('fa-heart-o');
        } else {
            count++;
            this.classList.add('active', 'text-red-500', 'dark:text-red-400');
            this.querySelector('i').classList.remove('fa-heart-o');
            this.querySelector('i').classList.add('fa-heart');
        }
        
        countElement.textContent = count;
    });
});

// Handle comment form submissions
document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const commentInput = this.querySelector('textarea');
        const comment = commentInput.value.trim();
        
        if (comment) {
            // In a real app, this would submit to the server
            alert('Comment submitted successfully!');
            commentInput.value = '';
        } else {
            alert('Please enter a comment');
        }
    });
});

// Handle share functionality
document.querySelectorAll('.share-button').forEach(button => {
    button.addEventListener('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
            this.classList.add('bg-green-500');
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.classList.remove('bg-green-500');
            }, 2000);
        });
    });
});

// Handle category selection
document.querySelectorAll('[name="category"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const selectedCategory = this.value;
        const categories = ['thoughts', 'tech', 'motivation', 'ideas', 'life'];
        
        // Reset all category styles
        categories.forEach(category => {
            const elements = document.querySelectorAll(`[data-category="${category}"]`);
            elements.forEach(el => {
                el.classList.remove('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-200', 'dark:ring-indigo-900/50');
            });
        });
        
        // Highlight selected category
        const selectedElements = document.querySelectorAll(`[data-category="${selectedCategory}"]`);
        selectedElements.forEach(el => {
            el.classList.add('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-200', 'dark:ring-indigo-900/50');
        });
    });
});

// Analytics tracking
function trackEvent(category, action, label, value) {
    if (typeof gtag === 'function') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
}

// Track page views
document.addEventListener('DOMContentLoaded', function() {
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
});

// Track button clicks
document.querySelectorAll('button, a.button, a[href]').forEach(element => {
    element.addEventListener('click', function() {
        const action = this.getAttribute('data-action') || 'click';
        const label = this.textContent.trim() || this.getAttribute('aria-label') || this.href;
        trackEvent('engagement', action, label);
    });
});

// Track form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const action = this.getAttribute('data-action') || 'form_submit';
        const label = this.getAttribute('id') || 'form';
        trackEvent('engagement', action, label);
    });
});

// Track external link clicks
document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (link.hostname !== window.location.hostname) {
        link.addEventListener('click', function() {
            trackEvent('navigation', 'external_link', this.href);
        });
    }
});

// Handle before install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('App is installable');
    
    // Show install button if available
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.classList.remove('hidden');
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    trackEvent('pwa', 'install_accepted', 'user_accepted_install');
                } else {
                    console.log('User dismissed the install prompt');
                    trackEvent('pwa', 'install_dismissed', 'user_dismissed_install');
                }
                deferredPrompt = null;
                installButton.classList.add('hidden');
            });
        });
    }
});

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed');
    trackEvent('pwa', 'installed', 'app_installed');
    
    // Hide install button if it exists
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.classList.add('hidden');
    }
});

// Export functions for use in other scripts
window.toggleTheme = toggleTheme;
window.validateForm = validateForm;
window.trackEvent = trackEvent;

console.log('Main JavaScript loaded and initialized');
