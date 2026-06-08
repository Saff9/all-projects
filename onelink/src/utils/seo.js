/**
 * SEO Utilities for managing meta tags and social sharing
 */

/**
 * Update document meta tags
 * @param {object} options - Meta tag options
 */
export function updateMetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'OneLink',
  twitterCard = 'summary_large_image',
  author,
}) {
  // Update document title
  if (title) {
    document.title = title;
  }

  // Standard meta tags
  updateMeta('description', description);
  updateMeta('keywords', keywords);
  updateMeta('author', author);

  // Open Graph tags
  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', description);
  updateMetaProperty('og:image', image);
  updateMetaProperty('og:url', url);
  updateMetaProperty('og:type', type);
  updateMetaProperty('og:site_name', siteName);

  // Twitter Card tags
  updateMeta('twitter:card', twitterCard);
  updateMeta('twitter:title', title);
  updateMeta('twitter:description', description);
  updateMeta('twitter:image', image);

  // Canonical URL
  updateCanonicalUrl(url);
}

/**
 * Update or create a meta tag by name
 * @param {string} name - Meta tag name
 * @param {string} content - Meta tag content
 */
function updateMeta(name, content) {
  if (!content) return;

  let meta = document.querySelector(`meta[name="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Update or create a meta tag by property
 * @param {string} property - Meta tag property
 * @param {string} content - Meta tag content
 */
function updateMetaProperty(property, content) {
  if (!content) return;

  let meta = document.querySelector(`meta[property="${property}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

/**
 * Update or create canonical link
 * @param {string} url - Canonical URL
 */
function updateCanonicalUrl(url) {
  if (!url) return;

  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.setAttribute('href', url);
}

/**
 * Generate SEO meta tags for profile page
 * @param {object} profile - Profile data
 * @param {string} username - Username
 * @returns {object} SEO options
 */
export function generateProfileSEO(profile, username) {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://onelink.app';
  const profileUrl = `${baseUrl}/${username}`;

  return {
    title: `${profile.displayName || username} - OneLink`,
    description: profile.bio || `Check out ${profile.displayName || username}'s links on OneLink`,
    image: profile.avatarURL || `${baseUrl}/og-default.png`,
    url: profileUrl,
    type: 'profile',
    author: profile.displayName,
  };
}

/**
 * Generate JSON-LD structured data for profile
 * @param {object} profile - Profile data
 * @param {string} username - Username
 * @returns {object} JSON-LD data
 */
export function generateProfileStructuredData(profile, username) {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://onelink.app';
  const profileUrl = `${baseUrl}/${username}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.displayName || username,
      url: profileUrl,
      image: profile.avatarURL,
      description: profile.bio,
      sameAs: Object.entries(profile.socialLinks || {})
        .filter(([_, url]) => url)
        .map(([_, url]) => url),
    },
  };
}

/**
 * Inject JSON-LD structured data into page
 * @param {object} data - JSON-LD data
 */
export function injectStructuredData(data) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Reset meta tags to defaults
 */
export function resetMetaTags() {
  document.title = 'OneLink - Your Links, One Page';
  
  updateMeta('description', 'Create your personalized link-in-bio page with OneLink. Share all your important links in one beautiful, customizable page.');
  updateMeta('keywords', 'link in bio, linktree alternative, bio link, social links, one link');
  
  updateMetaProperty('og:title', 'OneLink - Your Links, One Page');
  updateMetaProperty('og:description', 'Create your personalized link-in-bio page with OneLink.');
  updateMetaProperty('og:type', 'website');
  
  updateMeta('twitter:card', 'summary_large_image');
  updateMeta('twitter:title', 'OneLink - Your Links, One Page');
  updateMeta('twitter:description', 'Create your personalized link-in-bio page with OneLink.');
}

/**
 * Generate Open Graph image URL with dynamic text
 * @param {object} options - OG image options
 * @returns {string} OG image URL
 */
export function generateOGImageUrl({ name, bio, avatar, theme = 'default' }) {
  // This would typically be handled by a server-side function
  // For now, return the avatar or a default image
  if (avatar) return avatar;
  
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://onelink.app';
  return `${baseUrl}/og-default.png`;
}

export default {
  updateMetaTags,
  generateProfileSEO,
  generateProfileStructuredData,
  injectStructuredData,
  resetMetaTags,
  generateOGImageUrl,
};