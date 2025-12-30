export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: 'seo-tools' | 'developer-utilities' | 'design-css' | 'text-content';
  categoryName: string;
  iconName: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  features: string[];
  howToUseSteps: string[];
  deepGuideHtml?: string;
  faqs: ToolFAQ[];
  proTips: string[];
}

export interface CategoryInfo {
  slug: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  gradient: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  'seo-tools': {
    slug: 'seo-tools',
    name: 'SEO & Webmaster Tools',
    title: 'Free SEO & Webmaster Optimization Tools',
    description: 'Boost search engine visibility, generate OpenGraph tags, create Schema.org JSON-LD microdata, build robots.txt, and simulate Google SERP snippets.',
    iconName: 'Search',
    gradient: 'from-blue-500 to-indigo-600',
  },
  'developer-utilities': {
    slug: 'developer-utilities',
    name: 'Developer & Data Utilities',
    title: 'High-Performance Developer & Data Tools',
    description: 'Instant client-side JSON formatters, regex analyzers, Base64/URL encoders, Cron schedule decoders, and UUID/hash generators.',
    iconName: 'Code2',
    gradient: 'from-emerald-500 to-teal-600',
  },
  'design-css': {
    slug: 'design-css',
    name: 'UI/UX & CSS Tools',
    title: 'Modern CSS & Web Accessibility Design Tools',
    description: 'Check WCAG color contrast ratios, build layered CSS box shadows, design glassmorphism effects, and master CSS flexbox/grid layouts.',
    iconName: 'Palette',
    gradient: 'from-purple-500 to-pink-600',
  },
  'text-content': {
    slug: 'text-content',
    name: 'Text & Content Intelligence',
    title: 'Content Writing, Readability & Text Utilities',
    description: 'Analyze word counts and Flesch-Kincaid readability, generate clean SEO URL slugs, convert text cases, and craft customized dummy text.',
    iconName: 'FileText',
    gradient: 'from-amber-500 to-orange-600',
  },
};

export const TOOLS: ToolItem[] = [
  // ==========================================
  // CLUSTER 1: SEO & WEBMASTER SUITE
  // ==========================================
  {
    id: 'website-seo-audit-checker',
    slug: 'website-seo-audit-checker',
    name: 'Live Website SEO Audit & Meta Tag Inspector',
    shortDescription: 'Audit any webpage or paste HTML to analyze On-Page SEO, Meta tags, OpenGraph cards, Headings hierarchy, and get an instant SEO score (0-100%).',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'Activity',
    primaryKeyword: 'website seo audit tool',
    secondaryKeywords: [
      'on page seo checker free',
      'meta tag inspector online',
      'analyze website seo score',
      'seo health checker instant',
      'website meta tag analyzer',
    ],
    features: [
      'Instant 100-point On-Page SEO Health Score calculation',
      'Inspects Title tag length, Meta Description, Canonical URL, and Robots directives',
      'Validates OpenGraph and Twitter Card social media readiness',
      'Analyzes H1, H2, and H3 heading structure and keyword density',
      'Checks viewport responsiveness and Schema.org JSON-LD microdata presence',
    ],
    howToUseSteps: [
      'Enter any website URL or paste raw HTML source code into the inspector.',
      'Click "Run SEO Audit" to evaluate the page.',
      'Inspect your overall SEO Score and the Pass / Warning / Fail breakdown.',
      'Review actionable recommendations to fix missing meta tags or headings.',
      'Export or copy the full SEO audit report.',
    ],
    proTips: [
      'Ensure every page has exactly one `<h1>` tag matching the core topic of the page.',
      'Always specify a canonical URL to prevent duplicate content issues when URLs contain query tracking parameters.',
      'Include both `og:image` and `twitter:image` tags so links render beautifully across all social and messaging apps.',
    ],
    faqs: [
      {
        question: 'What does this SEO audit checker evaluate?',
        answer: 'It inspects critical on-page SEO factors including title length, description presence, canonical URLs, OpenGraph social tags, heading tag hierarchy (H1-H3), viewport mobile tags, and Schema.org structured data.',
      },
      {
        question: 'What is a good on-page SEO score?',
        answer: 'A score of 85 or above indicates that all primary meta tags, canonical links, social preview cards, and semantic heading structures are correctly configured according to Google best practices.',
      },
    ],
  },
  {
    id: 'astro-seo-generator',
    slug: 'astro-seo-generator',
    name: 'Astro SEO & OpenGraph Meta Tag Generator',
    shortDescription: 'Generate SEO meta tags, OpenGraph social cards, Twitter cards, and Schema.org for Astro.build websites with native Astro & astro-seo package exports.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'Rocket',
    primaryKeyword: 'astro seo generator',
    secondaryKeywords: [
      'astro js meta tags',
      'astro seo component generator',
      'astro seo package helper',
      'astro canonical tags',
      'astro open graph generator',
    ],
    features: [
      'Generates native Astro <head> code and official astro-seo npm package component code',
      'Live visual snippet previews for Google SERP, Facebook, and X/Twitter',
      'Automatic canonical URL and sitemap integration for Astro',
      'Schema.org JSON-LD structured data script snippet for Astro layouts',
      'Character length counters with truncation warnings',
    ],
    howToUseSteps: [
      'Enter your Astro page title, meta description, and canonical URL.',
      'Provide your site name, author, and social OpenGraph image URL.',
      'Select your export preference: Native Astro Head or <SEO /> Component (astro-seo).',
      'Preview how your card appears across Google, Facebook, and Twitter.',
      'Click "Copy Astro Code" and paste directly into your .astro layout or page.',
    ],
    proTips: [
      'If using the popular astro-seo package, place <SEO {...props} /> inside your BaseLayout.astro <head> section.',
      'Use Astro dynamic props "const { title, description } = Astro.props" to make your SEO component reusable across all markdown blog posts.',
    ],
    faqs: [
      {
        question: 'Why is Astro popular for SEO?',
        answer: 'Astro ships zero JavaScript by default (island architecture), resulting in near-perfect 100/100 Lighthouse performance scores and sub-100ms LCP times that search engines strongly favor.',
      },
      {
        question: 'How do I install astro-seo in my Astro project?',
        answer: 'You can install it using "npm install astro-seo" or "npx astro add astro-seo", then import { SEO } from "astro-seo".',
      },
    ],
  },
  {
    id: 'meta-tag-generator',
    slug: 'meta-tag-generator',
    name: 'Meta Tag & OpenGraph Generator',
    shortDescription: 'Generate SEO-optimized HTML meta tags, OpenGraph social cards, and Twitter Cards with real-time visual previews.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'Share2',
    primaryKeyword: 'meta tag generator',
    secondaryKeywords: [
      'open graph generator',
      'twitter card generator',
      'seo meta tags maker',
      'social share preview tool',
      'html meta tag creator',
    ],
    features: [
      'Generates valid HTML5 meta tags, OpenGraph tags, and Twitter Cards',
      'Live visual snippet preview for Google SERP, Facebook, LinkedIn, and X/Twitter',
      'Ready-to-use export for pure HTML and Next.js Metadata API format',
      'Character length indicators for Title (60 chars) and Description (160 chars)',
      'Robots directives configuration (index, follow, noarchive, nosnippet)',
    ],
    howToUseSteps: [
      'Enter your Page Title and Meta Description in the input fields.',
      'Provide your Canonical URL, Website Name, and Author details.',
      'Add an image URL for OpenGraph and Twitter social sharing previews.',
      'Configure robots crawler directives (index / noindex, follow / nofollow).',
      'Preview how your link appears across Google, Facebook, and Twitter.',
      'Click "Copy HTML Meta Tags" or "Copy Next.js Metadata" to paste into your codebase.',
    ],
    proTips: [
      'Keep your Page Title between 50-60 characters so Google does not truncate it on mobile and desktop search results.',
      'Write compelling meta descriptions under 160 characters containing your primary target keyword to maximize click-through rate (CTR).',
      'Always specify an OpenGraph image with recommended dimensions of 1200x630 pixels (1.91:1 ratio) for crisp display on WhatsApp, LinkedIn, and Facebook.',
    ],
    faqs: [
      {
        question: 'What are meta tags and why are they critical for SEO?',
        answer: 'Meta tags are snippets of HTML code placed in the <head> section of a webpage that tell search engine crawlers and social media platforms what your page is about. They influence search rankings, control search result snippets, and dictate social share card previews.',
      },
      {
        question: 'What is OpenGraph (OG) protocol?',
        answer: 'The Open Graph protocol was created by Facebook to standardize how URLs are represented when shared across social networks like Facebook, LinkedIn, Discord, and Slack. It controls the preview title, description, and thumbnail image.',
      },
      {
        question: 'What is the optimal size for Open Graph images?',
        answer: 'The recommended size for OpenGraph images is 1200 x 630 pixels (aspect ratio 1.91:1), with a file size under 5MB (JPG or PNG format) for optimal rendering across high-resolution displays.',
      },
      {
        question: 'How do I use these meta tags in Next.js App Router?',
        answer: 'In Next.js App Router (app/layout.tsx or app/page.tsx), export an asynchronous or static `metadata` object containing title, description, openGraph, and twitter properties. Our tool provides a dedicated 1-click Next.js code snippet.',
      },
    ],
  },
  {
    id: 'schema-generator',
    slug: 'schema-generator',
    name: 'Schema Markup JSON-LD Generator',
    shortDescription: 'Create Google-compliant Schema.org JSON-LD structured data for FAQ, Article, Product, LocalBusiness, HowTo, and Software.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'Code',
    primaryKeyword: 'schema markup generator',
    secondaryKeywords: [
      'json ld generator',
      'schema org structured data generator',
      'faq schema generator',
      'article schema maker',
      'google rich snippets creator',
    ],
    features: [
      'Supports 6 essential Schema types: FAQPage, Article, HowTo, SoftwareApplication, Product, and LocalBusiness',
      'Live JSON-LD syntax validation with error checking',
      'Interactive form fields for authors, ratings, questions, steps, prices, and organizations',
      'Direct link to Google Rich Results Test for instant verification',
      'Clean 1-click script tag copy format',
    ],
    howToUseSteps: [
      'Select the Schema.org type you want to generate (e.g., FAQPage, Article, SoftwareApplication).',
      'Fill in the required properties in the structured form.',
      'Add dynamic items such as multiple FAQ questions & answers or HowTo steps.',
      'Inspect the generated JSON-LD structured script in the output editor.',
      'Copy the snippet and paste it directly into your HTML <head> or Next.js layout script tag.',
    ],
    proTips: [
      'FAQPage schema can help your website qualify for expandable FAQ accordion dropdowns directly within Google search results.',
      'Ensure the information entered in your JSON-LD matches the visible content on your webpage exactly to avoid Google spam penalties.',
      'Test your generated schema markup using the official Google Rich Results Test before publishing.',
    ],
    faqs: [
      {
        question: 'What is JSON-LD structured data?',
        answer: 'JSON-LD (JavaScript Object Notation for Linked Data) is a lightweight format for structuring data on the web. It provides explicit clues to search engines like Google about the meaning of a page and the entities it describes.',
      },
      {
        question: 'Can Schema markup help my website rank higher on Google?',
        answer: 'While Schema markup is not a direct ranking factor, it qualifies your pages for Google Rich Results (star ratings, FAQ accordions, price badges, breadcrumbs), which significantly improves organic click-through rates (CTR) and visibility.',
      },
      {
        question: 'Where should I place the JSON-LD script on my website?',
        answer: 'You can place the <script type="application/ld+json"> tag anywhere in the HTML document, though inside the <head> or at the top of the <body> is standard industry practice.',
      },
    ],
  },
  {
    id: 'robots-txt-generator',
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator & Validator',
    shortDescription: 'Build and validate custom robots.txt files with crawl rules for Googlebot, Bingbot, AI crawlers (GPTBot, Claude), and sitemaps.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'ShieldAlert',
    primaryKeyword: 'robots txt generator',
    secondaryKeywords: [
      'robots txt creator',
      'generate robots txt for nextjs',
      'robots txt validator',
      'block ai bots robots txt',
      'crawl delay generator',
    ],
    features: [
      '1-Click Quick Presets for Next.js, WordPress, Shopify, and AI crawler blocks',
      'Custom user-agent directives for Googlebot, Bingbot, GPTBot, CCBot, Claude-Web, and ByteSpider',
      'Disallow and Allow path rule management',
      'Automated Sitemap directive injection',
      'Live interactive path tester to check if a specific URL is allowed or blocked',
    ],
    howToUseSteps: [
      'Choose a standard framework preset or start with default settings.',
      'Toggle permissions for general crawlers and specific AI scraping bots.',
      'Add custom Disallow paths (e.g., /admin, /api/, /private/) or Allow paths.',
      'Specify your full XML Sitemap URL (e.g., https://your-domain.com/sitemap.xml).',
      'Test URLs in the live path validator to confirm bot access rules.',
      'Copy the output or download as `robots.txt` and place it in your site root or public folder.',
    ],
    proTips: [
      'Never block CSS, JavaScript, or image files in robots.txt; Googlebot needs them to render and evaluate your mobile layout.',
      'Robots.txt is publicly accessible; do not list sensitive or secret URL endpoints in disallow rules as attackers can read them.',
      'Always include the absolute URL to your XML sitemap at the bottom of your robots.txt file.',
    ],
    faqs: [
      {
        question: 'What is a robots.txt file?',
        answer: 'A robots.txt file gives web crawlers instructions about which pages or files they can or cannot request from your site. It is primarily used to avoid overloading your site with requests and to manage crawl budget.',
      },
      {
        question: 'Does robots.txt prevent a page from appearing in Google search?',
        answer: 'Not necessarily. If other websites link to your blocked page, Google may still index the URL without reading its content. To guarantee a page is not indexed, use a `<meta name="robots" content="noindex">` tag instead.',
      },
      {
        question: 'How do I block AI bots from scraping my site?',
        answer: 'You can specify disallow rules for AI user-agents such as User-agent: GPTBot, User-agent: CCBot, and User-agent: Claude-Web with Disallow: / in your robots.txt file.',
      },
    ],
  },
  {
    id: 'serp-simulator',
    slug: 'serp-simulator',
    name: 'Google SERP Snippet Simulator',
    shortDescription: 'Simulate exact Google desktop and mobile search results with live pixel width calculators, date badges, and rich snippet ratings.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'Eye',
    primaryKeyword: 'google serp preview tool',
    secondaryKeywords: [
      'serp simulator',
      'google search result preview',
      'title tag pixel width checker',
      'meta description preview tool',
      'search snippet simulator',
    ],
    features: [
      'Accurate desktop (600px) and mobile (960px) SERP layout simulation',
      'Real-time pixel width calculator for title tags and descriptions using Arial font metrics',
      'Truncation warnings when text exceeds Google display thresholds',
      'Customizable favicon, site name, breadcrumbs, publish date, and 5-star rating rich snippet',
      'Keyword highlight simulation for search query matching',
    ],
    howToUseSteps: [
      'Type your target search query to simulate keyword bolding.',
      'Enter your Page Title, URL / Breadcrumbs, and Meta Description.',
      'Toggle between Desktop SERP and Mobile SERP view modes.',
      'Observe the live pixel width and character count bars to avoid truncation dots (...).',
      'Add optional rich snippet elements like 5-star ratings or publication dates.',
      'Copy the finalized SEO-friendly title and description for your page.',
    ],
    proTips: [
      'Google truncates title tags beyond ~600 pixels (roughly 55-60 characters) on desktop.',
      'Place your primary keyword near the beginning of your title tag for maximum SEO weight and visibility.',
      'Include a clear call-to-action (CTA) like "Free online tool", "Instant download", or "2026 Guide" in your meta description to increase CTR.',
    ],
    faqs: [
      {
        question: 'Why does Google measure title tags in pixels instead of characters?',
        answer: 'Google renders titles using the Arial font. Because characters have proportional widths (an "W" is much wider than an "I"), Google enforces a maximum pixel width (~600px) rather than a strict character count limit.',
      },
      {
        question: 'Will Google always display my exact meta description?',
        answer: 'No. If Google determines that another snippet of text from your webpage better matches the specific searcher query, it will dynamically generate a custom snippet from your on-page copy.',
      },
      {
        question: 'How do rich snippets improve click-through rates?',
        answer: 'Rich snippets include extra visual information like star ratings, review counts, pricing, or breadcrumbs that make your listing visually prominent, typically boosting CTR by 20% to 35%.',
      },
    ],
  },
  {
    id: 'keyword-density-analyzer',
    slug: 'keyword-density-analyzer',
    name: 'Keyword Density & N-Gram Analyzer',
    shortDescription: 'Analyze single, two-word, and three-word keyword frequencies, density percentages, and detect over-optimization in your content.',
    category: 'seo-tools',
    categoryName: 'SEO & Webmaster Tools',
    iconName: 'BarChart2',
    primaryKeyword: 'keyword density analyzer',
    secondaryKeywords: [
      'keyword density checker',
      'ngram text analyzer',
      'content keyword frequency tool',
      'on page seo keyword counter',
      'keyword stuffing detector',
    ],
    features: [
      'Analyzes 1-word, 2-word, and 3-word n-gram keyword clusters',
      'Smart stop-words filter (removes "the, a, is, in, at" etc.) with toggle',
      'Over-optimization alerts (highlights keywords exceeding 2.5% - 3% density)',
      'Total word count, unique word count, lexical density, and reading time metrics',
      'Instant CSV export and filtered search for specific keyword checks',
    ],
    howToUseSteps: [
      'Paste your article, blog post, or webpage content into the text area.',
      'Toggle the "Exclude Common Stop Words" option to focus on high-value terms.',
      'Review the summary metrics: Total Words, Unique Words, and Lexical Diversity.',
      'Switch tabs between 1-Word, 2-Word Phrases, and 3-Word Phrases tables.',
      'Check the Density % column for any over-optimized phrases (marked with warnings).',
    ],
    proTips: [
      'Maintain an ideal keyword density of 1% to 2% for your primary keyword to avoid keyword stuffing penalties.',
      'Pay close attention to 2-word and 3-word phrases; these represent your natural long-tail semantic keyword distribution.',
      'Use synonyms and semantically related terms (LSI keywords) rather than repeating the exact same phrase multiple times.',
    ],
    faqs: [
      {
        question: 'What is keyword density in SEO?',
        answer: 'Keyword density is the percentage of times a keyword or phrase appears within a text compared to the total number of words on the page.',
      },
      {
        question: 'What is the ideal keyword density percentage for Google rankings?',
        answer: 'Most SEO experts recommend a keyword density between 1% and 2.5%. Anything above 3% risks triggering Google automated keyword stuffing and over-optimization filters.',
      },
      {
        question: 'What are n-grams in content analysis?',
        answer: 'An n-gram is a contiguous sequence of n items from a given text. In SEO, 1-grams are single words, 2-grams are two-word phrases (e.g. "seo tools"), and 3-grams are three-word phrases (e.g. "free seo tools").',
      },
    ],
  },

  // ==========================================
  // CLUSTER 2: DEVELOPER & DATA UTILITIES
  // ==========================================
  {
    id: 'json-validator-formatter',
    slug: 'json-validator-formatter',
    name: 'JSON Validator, Beautifier & Minifier',
    shortDescription: 'Format, validate, beautify, minify, and inspect JSON with exact line/column syntax error detection and byte savings.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'FileCode',
    primaryKeyword: 'json validator online',
    secondaryKeywords: [
      'json formatter and beautifier',
      'minify json online',
      'json syntax checker',
      'json tree viewer',
      'fix invalid json',
    ],
    features: [
      'Precise syntax validation with exact line and column error indicators',
      'Beautify with customizable indentation (2 spaces, 4 spaces, tabs)',
      'Minify / compact JSON for optimal API payload performance',
      'Calculates raw size vs minified size and byte savings percentage',
      '1-Click Copy, Clear, Sample Data loading, and .json file download',
    ],
    howToUseSteps: [
      'Paste your raw JSON code or click "Load Sample" to see an example.',
      'Click "Beautify (2 Spaces)" or "Beautify (4 Spaces)" to format the JSON.',
      'Click "Minify" to strip all whitespace and format into a single compact line.',
      'If an error exists, view the highlighted error banner with exact line coordinates.',
      'Copy the formatted output or download it as a `.json` file.',
    ],
    proTips: [
      'Minifying JSON payloads before network transmission reduces API bandwidth and speeds up TTFB response times.',
      'Always verify that object keys are enclosed in double quotes (`"key"`) rather than single quotes, which are invalid in JSON standard specification (RFC 8259).',
    ],
    faqs: [
      {
        question: 'What causes JSON validation errors most frequently?',
        answer: 'Common JSON errors include trailing commas after the last item in arrays/objects, using single quotes instead of double quotes around keys/values, and unescaped special characters.',
      },
      {
        question: 'Is my JSON data sent to any remote server?',
        answer: 'No. All validation, formatting, and minification runs 100% locally in your browser using client-side JavaScript for complete privacy and instant execution.',
      },
    ],
  },
  {
    id: 'base64-encoder-decoder',
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder & Decoder (Text & Files)',
    shortDescription: 'Encode and decode plain text or upload images/files to generate Base64 strings and Data URIs with live image previews.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'Binary',
    primaryKeyword: 'base64 encoder decoder',
    secondaryKeywords: [
      'base64 encode text',
      'base64 decode online',
      'image to base64 converter',
      'base64 data uri generator',
      'utf8 base64 tool',
    ],
    features: [
      'Full UTF-8 support for emojis, special characters, and non-ASCII strings',
      'File & Image to Base64 Data URI converter with drag-and-drop',
      'Live image preview for decoded Base64 image strings (PNG, JPG, SVG, WebP)',
      'Character length and file size overhead indicators (+33% Base64 expansion calculation)',
      '1-Click Copy and Download decoded binary/text files',
    ],
    howToUseSteps: [
      'Select whether you want to Encode or Decode mode.',
      'Choose between Text mode or File/Image upload mode.',
      'Enter your string or drop an image file into the dropzone.',
      'View the converted Base64 output or decoded text/image preview.',
      'Click "Copy Result" or "Copy Data URI" for inline HTML/CSS usage.',
    ],
    proTips: [
      'Use Base64 Data URIs to embed small icons or SVG logos directly into HTML/CSS to eliminate extra HTTP requests.',
      'Avoid Base64 encoding large images (>100KB), as Base64 strings are roughly 33% larger than raw binary files.',
    ],
    faqs: [
      {
        question: 'What is Base64 encoding?',
        answer: 'Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format using 64 printable characters (A-Z, a-z, 0-9, +, /).',
      },
      {
        question: 'Why does Base64 increase file size?',
        answer: 'Base64 uses 4 ASCII characters (4 bytes = 32 bits) to represent every 3 bytes (24 bits) of raw binary data, resulting in an approximate 33% increase in data size.',
      },
    ],
  },
  {
    id: 'url-encoder-decoder',
    slug: 'url-encoder-decoder',
    name: 'URL / URI Encoder & Decoder with Query Parser',
    shortDescription: 'Encode and decode URLs, convert special characters to percent-encoding, and visually inspect and edit query parameters.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'Link2',
    primaryKeyword: 'url encoder decoder',
    secondaryKeywords: [
      'url decode online',
      'percent encoding converter',
      'encode uri component tool',
      'query string parser and editor',
      'url parameter extractor',
    ],
    features: [
      'Supports encodeURI (full URL) and encodeURIComponent (query values)',
      'Visual breakdown table of Protocol, Host, Port, Pathname, and Query Parameters',
      'Interactive query parameter editor to add, modify, or delete key-value pairs',
      'Live reconstructed URL output with 1-click copy',
      'Decodes deeply nested and double-encoded URL strings',
    ],
    howToUseSteps: [
      'Paste a full URL or encoded query string into the input field.',
      'Select Encode or Decode mode, or click Parse Parameters.',
      'Inspect the parsed components and query parameter table.',
      'Edit query keys/values directly in the table to see the reconstructed URL update live.',
      'Copy the clean encoded or decoded URL.',
    ],
    proTips: [
      'Use `encodeURIComponent` when encoding individual query string parameter values (like search queries with spaces or & symbols).',
      'Use `encodeURI` when encoding a full URL where you want to keep characters like `://`, `?`, and `/` intact.',
    ],
    faqs: [
      {
        question: 'What is percent-encoding in URLs?',
        answer: 'Percent-encoding replaces unsafe ASCII characters with a `%` followed by two hexadecimal digits (for example, a space becomes `%20` or `+`, and `&` becomes `%26`).',
      },
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer: '`encodeURI` is intended for complete URLs and does not encode reserved characters like `/`, `?`, `#`, and `:`. `encodeURIComponent` encodes ALL special characters and should be used for query parameters.',
      },
    ],
  },
  {
    id: 'regex-tester',
    slug: 'regex-tester',
    name: 'Regex Tester & Pattern Explainer',
    shortDescription: 'Test regular expressions in real time with JavaScript regex flags, live match highlights, capture groups, and cheat sheet presets.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'Regex',
    primaryKeyword: 'regex tester online free',
    secondaryKeywords: [
      'regular expression tester',
      'javascript regex validator',
      'regex pattern matcher',
      'regex cheat sheet online',
      'test regex with capture groups',
    ],
    features: [
      'Real-time match highlighting as you type pattern and test strings',
      'Interactive flag toggles: Global (g), Case Insensitive (i), Multiline (m), DotAll (s), Unicode (u)',
      'Capture group breakdown table with start/end indexes',
      '1-Click Cheat Sheet presets: Email, URL, IPv4, Phone Numbers, Strong Password, Hex Color, Date',
      'Syntax error feedback with explanations',
    ],
    howToUseSteps: [
      'Enter your Regular Expression pattern without surrounding slashes.',
      'Toggle the necessary regex flags (e.g., `g` for all matches, `i` for case insensitivity).',
      'Type or paste your test text in the input box.',
      'View highlighted matches in the live preview window and inspect capture groups below.',
      'Click any preset button to instantly load common regex patterns.',
    ],
    proTips: [
      'Always remember to escape special regex characters like `.` `*` `+` `?` `^` `$` `[` `]` `(` `)` `{` `}` `|` with a backslash `\\` when searching for literals.',
      'Use non-capturing groups `(?:...)` when you need grouping logic without creating extra capture group overhead.',
    ],
    faqs: [
      {
        question: 'What does the `g` flag do in regular expressions?',
        answer: 'The `g` (global) flag instructs the regex engine to search for all occurrences of the pattern in the target text rather than stopping after the first match.',
      },
      {
        question: 'How do I match any character including newlines?',
        answer: 'You can enable the `s` (dotAll) flag, which makes the dot `.` metacharacter match newline characters (`\\n`, `\\r`) as well.',
      },
    ],
  },
  {
    id: 'cron-expression-descriptor',
    slug: 'cron-expression-descriptor',
    name: 'Cron Expression Translator & Next Run Times',
    shortDescription: 'Translate crontab expressions into plain English descriptions and calculate the next 5 exact execution timestamps.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'Clock',
    primaryKeyword: 'cron expression generator',
    secondaryKeywords: [
      'crontab translator',
      'cron schedule descriptor',
      'cron to human readable',
      'next cron execution times',
      'cron syntax helper',
    ],
    features: [
      'Translates 5-part standard crontab (minute, hour, day of month, month, day of week) into plain English',
      'Calculates the next 5 upcoming run timestamps in your local timezone',
      'Interactive visual cron builder dropdowns for each time field',
      'Common presets: Every 5 mins, Hourly, Daily at midnight, Weekdays at 9 AM, Every Sunday',
      '1-Click copy of cron string and human description',
    ],
    howToUseSteps: [
      'Type your 5-part cron expression (e.g. `*/15 * * * *`) or choose a preset.',
      'Read the instant plain-English translation explaining when the task triggers.',
      'Examine the upcoming scheduled run times table.',
      'Use the visual field picker to build custom schedules without memorizing syntax.',
    ],
    proTips: [
      'In standard cron syntax, `*` means every interval, `*/n` means every n intervals, and `,` separates specific values.',
      'Remember that day 0 and day 7 both represent Sunday in standard Unix cron syntax.',
    ],
    faqs: [
      {
        question: 'What are the 5 fields in a standard crontab expression?',
        answer: 'The 5 fields in order are: 1. Minute (0-59), 2. Hour (0-23), 3. Day of the Month (1-31), 4. Month (1-12 or JAN-DEC), 5. Day of the Week (0-6 or SUN-SAT).',
      },
      {
        question: 'What does `*/5 * * * *` mean?',
        answer: 'It means "Every 5 minutes, every hour, every day of the month, every month, every day of the week".',
      },
    ],
  },
  {
    id: 'uuid-hash-generator',
    slug: 'uuid-hash-generator',
    name: 'UUID / GUID & Cryptographic Hash Generator',
    shortDescription: 'Generate RFC 4122 UUID v4 identifiers in bulk and compute SHA-256, SHA-512, SHA-1, and MD5 hashes instantly.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'Key',
    primaryKeyword: 'uuid v4 generator online',
    secondaryKeywords: [
      'bulk uuid generator',
      'sha256 hash generator online',
      'guid generator free',
      'md5 hash tool',
      'cryptographic hash calculator',
    ],
    features: [
      'Generates cryptographically secure RFC 4122 Version 4 UUIDs using browser Crypto API',
      'Bulk generator: generate up to 100 UUIDs at once with uppercase, hyphens, and braces options',
      'Real-time cryptographic hash generation: SHA-256, SHA-512, SHA-1, and MD5',
      '1-Click Copy All or Copy individual hash/UUID values',
    ],
    howToUseSteps: [
      'Switch between the "UUID / GUID Generator" tab and the "Hash Generator" tab.',
      'For UUIDs, select quantity (1 to 100), toggle uppercase/lowercase and hyphens, and click Generate.',
      'For Hashes, enter any plain text string to see live SHA-256, SHA-512, SHA-1, and MD5 digests.',
      'Click copy to grab individual items or bulk export.',
    ],
    proTips: [
      'UUID v4 uses 122 random bits, giving a collision probability so infinitesimally small that generating 1 billion UUIDs per second for 100 years would produce virtually zero duplicates.',
      'For password storage or secure verification, SHA-256 or SHA-512 should always be preferred over legacy MD5 or SHA-1.',
    ],
    faqs: [
      {
        question: 'What is a UUID v4?',
        answer: 'A Universally Unique Identifier (UUID) Version 4 is a 128-bit label generated using random numbers according to RFC 4122. It is formatted as 32 hexadecimal characters in five groups: `8-4-4-4-12`.',
      },
      {
        question: 'Is the generation secure and private?',
        answer: 'Yes. All UUIDs and hashes are calculated directly in your browser using the native Web Cryptography API (`crypto.getRandomValues()` and `crypto.subtle.digest()`). Nothing is transmitted to external servers.',
      },
    ],
  },
  {
    id: 'markdown-to-html',
    slug: 'markdown-to-html',
    name: 'Markdown to Clean HTML & Live Previewer',
    shortDescription: 'Convert GitHub-flavored Markdown into clean, formatted HTML code with split-pane live preview and table formatting.',
    category: 'developer-utilities',
    categoryName: 'Developer & Data Utilities',
    iconName: 'FileText',
    primaryKeyword: 'markdown to html converter',
    secondaryKeywords: [
      'markdown live preview online',
      'github markdown to html',
      'markdown editor with preview',
      'convert md to clean html',
      'markdown table to html converter',
    ],
    features: [
      'Side-by-side split screen with synced scrolling and live GitHub-style rendering',
      'Full support for headers, code blocks with syntax styling, tables, blockquotes, task lists, and links',
      'Generates clean, sanitized HTML markup ready for blog posts or CMS import',
      '1-Click "Copy HTML", "Copy Markdown", and "Download .html" file',
      'Quick formatting toolbar (Bold, Italic, Code, Link, Table, List, Quote)',
    ],
    howToUseSteps: [
      'Type or paste Markdown content in the left editor panel.',
      'Use the formatting buttons to insert Markdown elements quickly.',
      'Watch the live rendered preview on the right panel update in real-time.',
      'Click the "HTML Code" tab to view the generated semantic HTML markup.',
      'Copy the clean HTML code to paste into your WordPress, Webflow, or custom site.',
    ],
    proTips: [
      'Use standard Markdown headers (`#`, `##`, `###`) to ensure your generated HTML uses proper semantic `<h1>`, `<h2>`, and `<h3>` tags for SEO.',
      'Format tables using pipe syntax `| Header |` with alignment colons `:---:` for clean responsive HTML table markup.',
    ],
    faqs: [
      {
        question: 'What is GitHub Flavored Markdown (GFM)?',
        answer: 'GitHub Flavored Markdown is a strict superset of standard Markdown that adds support for tables, strike-through text, URL autolinking, and task lists.',
      },
      {
        question: 'Does this converter sanitize HTML output?',
        answer: 'Yes, our client-side parser sanitizes scripts and potentially harmful iframe attributes to ensure clean, safe HTML copy.',
      },
    ],
  },

  // ==========================================
  // CLUSTER 3: UI/UX & CSS TOOLS
  // ==========================================
  {
    id: 'wcag-contrast-checker',
    slug: 'wcag-contrast-checker',
    name: 'WCAG Color Contrast Checker (AA & AAA)',
    shortDescription: 'Calculate text and background color contrast ratios according to WCAG 2.1 standards with Pass/Fail grades and smart color suggestions.',
    category: 'design-css',
    categoryName: 'UI/UX & CSS Tools',
    iconName: 'CheckCircle2',
    primaryKeyword: 'wcag color contrast checker',
    secondaryKeywords: [
      'color contrast ratio calculator',
      'accessibility color contrast checker',
      'wcag 2 1 aa aaa compliance tool',
      'accessible hex color tester',
      'text contrast checker',
    ],
    features: [
      'Calculates exact mathematical luminance contrast ratio (e.g. 7.42:1)',
      'WCAG 2.1 Pass/Fail evaluation for Normal Text (AA 4.5:1 / AAA 7.0:1), Large Text (AA 3.0:1 / AAA 4.5:1), and UI Components',
      'Interactive color pickers with Hex, RGB, and HSL support',
      'Live visual typography preview on light/dark backgrounds',
      '"Smart Auto-Fix" button that automatically tweaks color lightness to achieve WCAG compliance',
    ],
    howToUseSteps: [
      'Select or type your Foreground (Text) color hex code.',
      'Select or type your Background color hex code.',
      'Review the calculated Contrast Ratio and Pass/Fail compliance badges.',
      'Check the live preview card showing normal body text and large headings.',
      'If failing, click "Auto-Fix to AA" to automatically adjust the lightness value.',
    ],
    proTips: [
      'For normal body text (below 18pt/24px or 14pt bold), WCAG AA requires a minimum contrast ratio of 4.5:1.',
      'For large text (18pt/24px or larger, or 14pt/18.66px bold), the minimum required ratio is 3.0:1.',
      'Good color contrast not only helps visually impaired users but also improves mobile readability in bright sunlight.',
    ],
    faqs: [
      {
        question: 'What is WCAG 2.1?',
        answer: 'The Web Content Accessibility Guidelines (WCAG) 2.1 are international standards developed by the W3C to ensure web content is accessible to people with disabilities, including vision impairments.',
      },
      {
        question: 'What is the difference between WCAG AA and AAA?',
        answer: 'Level AA is the standard legal compliance requirement for most commercial and public websites (4.5:1 contrast). Level AAA represents the highest accessibility tier (7:1 contrast for regular text).',
      },
    ],
  },
  {
    id: 'css-box-shadow-generator',
    slug: 'css-box-shadow-generator',
    name: 'CSS Box Shadow & Glow Generator',
    shortDescription: 'Design layered, soft, and modern CSS box shadows with interactive sliders, presets, and 1-click CSS & Tailwind export.',
    category: 'design-css',
    categoryName: 'UI/UX & CSS Tools',
    iconName: 'Sun',
    primaryKeyword: 'css box shadow generator',
    secondaryKeywords: [
      'css smooth shadow maker',
      'layered box shadow css',
      'modern soft shadow generator',
      'inset box shadow builder',
      'tailwind shadow generator',
    ],
    features: [
      'Multi-layer shadow builder: add up to 4 simultaneous shadow layers for realistic organic depth',
      'Sliders for Horizontal (X) offset, Vertical (Y) offset, Blur radius, Spread radius, and Opacity',
      'Inset / Outset toggle and custom shadow color picker',
      'Curated presets: Apple Minimalist, Soft 3D Elevation, Cyberpunk Glow, Floating Card, Inset Neumorphic',
      'Instant CSS `box-shadow` property and Tailwind CSS arbitrary value copy',
    ],
    howToUseSteps: [
      'Adjust the X Offset, Y Offset, Blur Radius, and Spread sliders.',
      'Change the Shadow Color and Opacity using the color picker.',
      'Click "Add Layer" to stack multiple shadows for realistic smooth elevation.',
      'Or pick from one of the modern designer presets.',
      'Copy the generated CSS snippet or Tailwind CSS class string.',
    ],
    proTips: [
      'Layering two or three subtle shadows (a tight dark shadow + a wide soft ambient shadow) creates a much more realistic 3D elevation than a single harsh shadow.',
      'Use low opacity (10-15%) with higher blur values for modern, clean SaaS card UI designs.',
    ],
    faqs: [
      {
        question: 'How does CSS `box-shadow` work?',
        answer: 'The `box-shadow` property accepts values in order: `horizontal-offset`, `vertical-offset`, `blur-radius`, `spread-radius`, and `color`. Multiple shadows are separated by commas.',
      },
      {
        question: 'How do I use custom box shadows in Tailwind CSS?',
        answer: 'You can use Tailwind arbitrary values like `shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]` or extend your `tailwind.config.js` theme with custom shadow keys.',
      },
    ],
  },
  {
    id: 'glassmorphism-generator',
    slug: 'glassmorphism-generator',
    name: 'CSS Glassmorphism & Frosted Glass Generator',
    shortDescription: 'Create modern frosted glass UI effects with backdrop-filter blur, transparency, border glow, and colorful mesh previews.',
    category: 'design-css',
    categoryName: 'UI/UX & CSS Tools',
    iconName: 'Layers',
    primaryKeyword: 'glassmorphism css generator',
    secondaryKeywords: [
      'frosted glass css effect',
      'backdrop filter blur generator',
      'glassmorphism card maker',
      'modern glass ui css',
      'glass morphism tailwind generator',
    ],
    features: [
      'Interactive controls for Blur intensity (0-40px), Background Alpha transparency, and Border opacity',
      'Saturation and color tint customization',
      'Multiple colorful background presets (Mesh Gradient, Dark Cyberpunk, Aurora Borealis, Sunset)',
      '1-Click copy for standard CSS, SCSS, and Tailwind CSS classes',
      'Cross-browser vendor prefix inclusion (`-webkit-backdrop-filter`)',
    ],
    howToUseSteps: [
      'Adjust the Blur slider to set the frosted glass strength.',
      'Control Background Transparency and Tint color to achieve desired translucency.',
      'Fine-tune the Border Width and Border Opacity for a crisp glassy edge.',
      'Switch background previews to test how the glass card looks over various photo/gradient backgrounds.',
      'Copy the CSS or Tailwind snippet and apply it to your UI elements.',
    ],
    proTips: [
      'A subtle 1px white border with 20% opacity (`rgba(255, 255, 255, 0.2)`) is the secret to giving glassmorphism cards a realistic glass edge reflection.',
      'Always include `-webkit-backdrop-filter` alongside `backdrop-filter` for full Safari and iOS browser compatibility.',
    ],
    faqs: [
      {
        question: 'What is Glassmorphism in web design?',
        answer: 'Glassmorphism is a modern UI design trend characterized by multi-layered frosted glass translucency, subtle white borders, vivid background colors, and depth simulation via `backdrop-filter: blur()`.',
      },
      {
        question: 'Is backdrop-filter supported in all modern browsers?',
        answer: 'Yes, `backdrop-filter` is supported in all modern browsers including Chrome, Edge, Safari (with `-webkit-` prefix), and Firefox (version 103+).',
      },
    ],
  },
  {
    id: 'flexbox-grid-builder',
    slug: 'flexbox-grid-builder',
    name: 'CSS Flexbox & Grid Visual Playground',
    shortDescription: 'Visually build and experiment with CSS Flexbox and CSS Grid layouts with real-time interactive boxes and code generation.',
    category: 'design-css',
    categoryName: 'UI/UX & CSS Tools',
    iconName: 'LayoutGrid',
    primaryKeyword: 'css flexbox generator',
    secondaryKeywords: [
      'css grid generator',
      'visual flexbox playground',
      'css layout builder',
      'flexbox tailwind generator',
      'responsive css grid maker',
    ],
    features: [
      'Switch seamlessly between CSS Flexbox and CSS Grid layout modes',
      'Interactive controls: Direction, Justify Content, Align Items, Flex Wrap, Gap, Columns, Rows',
      'Add, remove, or reorder child items interactively',
      'Generates clean vanilla CSS and Tailwind CSS classes',
      'Responsive mobile/tablet/desktop viewport simulation',
    ],
    howToUseSteps: [
      'Select Flexbox or Grid mode at the top.',
      'Toggle layout properties using the visual control buttons (e.g. `center`, `space-between`, `grid-cols-3`).',
      'Adjust Gap slider to control spacing between elements.',
      'Add or remove test boxes to verify responsiveness.',
      'Copy the generated CSS or Tailwind code directly to your project.',
    ],
    proTips: [
      'Use CSS Flexbox for 1-dimensional layouts (either a row or a column) and CSS Grid for 2-dimensional layouts (both rows and columns simultaneously).',
      'The modern `gap` property works on both Flexbox and Grid, eliminating the need for negative margins or child margin hacks.',
    ],
    faqs: [
      {
        question: 'When should I use Flexbox vs CSS Grid?',
        answer: 'Use Flexbox when you want items to flow along a single axis (like navigation bars or button groups). Use Grid when you need structured tabular columns and rows (like card grids or full page layouts).',
      },
      {
        question: 'How does `justify-content` differ from `align-items`?',
        answer: '`justify-content` controls alignment along the main axis (horizontal in row mode), while `align-items` controls alignment along the cross axis (vertical in row mode).',
      },
    ],
  },

  // ==========================================
  // CLUSTER 4: TEXT & CONTENT INTELLIGENCE
  // ==========================================
  {
    id: 'word-readability-counter',
    slug: 'word-readability-counter',
    name: 'Word, Character & Readability Analyzer',
    shortDescription: 'Count words, characters, sentences, reading time, and calculate Flesch-Kincaid grade level and reading ease scores in real time.',
    category: 'text-content',
    categoryName: 'Text & Content Intelligence',
    iconName: 'BookOpen',
    primaryKeyword: 'word counter readability score',
    secondaryKeywords: [
      'flesch kincaid score calculator',
      'reading time estimator',
      'character counter with spaces',
      'content readability analyzer',
      'speaking time calculator',
    ],
    features: [
      'Real-time count of Words, Characters (with and without spaces), Sentences, Paragraphs',
      'Flesch Reading Ease Score (0-100) with grade-level interpretation',
      'Flesch-Kincaid Grade Level metric (e.g., "7th Grade - Plain English")',
      'Estimated Reading Time (based on 225 wpm) and Speaking Time (based on 130 wpm)',
      'Keyword density breakdown and longest sentence highlight',
    ],
    howToUseSteps: [
      'Type or paste your text into the content area.',
      'Review instant metrics: Word count, Character count, Sentences, and Paragraphs.',
      'Check the Readability Score meter to ensure your content matches your target audience comprehension level.',
      'See estimated Reading and Speaking times for scripts or presentations.',
    ],
    proTips: [
      'Aim for a Flesch Reading Ease score between 60 and 70 (approx. 7th-8th grade level) for general web and blog audience readability.',
      'Shorter sentences (under 20 words) and everyday vocabulary significantly improve user comprehension and engagement on mobile devices.',
    ],
    faqs: [
      {
        question: 'What is the Flesch Reading Ease score?',
        answer: 'The Flesch Reading Ease score measures text readability on a 0-100 scale based on sentence length and syllable count per word. Higher scores indicate material that is easier to read (90-100 = 5th grade, 60-70 = standard 8th grade, 0-30 = university graduate).',
      },
      {
        question: 'How is reading time calculated?',
        answer: 'Reading time is calculated using the average adult silent reading speed of 200 to 250 words per minute (WPM).',
      },
    ],
  },
  {
    id: 'url-slug-generator',
    slug: 'url-slug-generator',
    name: 'Clean SEO URL Slug Generator',
    shortDescription: 'Convert article titles and text into clean, lowercase, URL-safe slugs with stop-word removal and custom separators.',
    category: 'text-content',
    categoryName: 'Text & Content Intelligence',
    iconName: 'Link',
    primaryKeyword: 'url slug generator',
    secondaryKeywords: [
      'clean title to slug online',
      'seo friendly slug maker',
      'remove stop words from url slug',
      'permalink generator',
      'url safe string converter',
    ],
    features: [
      'Converts any title into lowercase, clean, URL-safe slugs',
      'Custom separator selection: hyphens (`-`), underscores (`_`), or custom strings',
      'Automatic removal of English stop words (the, a, and, in, for, of, with...) with toggle',
      'Accented character transliteration (e.g., `é` -> `e`, `ü` -> `u`) and special character stripping',
      'Maximum character length limiter with clean word-boundary truncation',
    ],
    howToUseSteps: [
      'Type or paste your article title, headline, or phrase.',
      'Choose your separator preference (hyphen `-` is standard for Google SEO).',
      'Toggle "Remove Common Stop Words" to create shorter, punchier URLs.',
      'Set an optional maximum character length limit.',
      'Click "Copy Slug" to paste into your CMS permalink field.',
    ],
    proTips: [
      'Google recommends using hyphens (`-`) rather than underscores (`_`) to separate words in URLs.',
      'Short, descriptive URL slugs containing 3-5 focus keywords rank better and receive higher click-through rates than long URLs.',
    ],
    faqs: [
      {
        question: 'What is a URL slug?',
        answer: 'A URL slug is the portion of a URL after the domain name that identifies a specific page in an easy-to-read, human-friendly format (e.g. `example.com/blog/best-seo-tools`).',
      },
      {
        question: 'Why should I remove stop words from URL slugs?',
        answer: 'Removing filler words like "a", "the", "and" keeps URLs concise, easier to read, and places higher focus on primary keywords without harming search understanding.',
      },
    ],
  },
  {
    id: 'text-case-converter',
    slug: 'text-case-converter',
    name: 'Text Case Converter (Sentence, Title, Camel, Snake, Kebab)',
    shortDescription: 'Transform text into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case instantly.',
    category: 'text-content',
    categoryName: 'Text & Content Intelligence',
    iconName: 'Type',
    primaryKeyword: 'case converter online',
    secondaryKeywords: [
      'title case converter ap style',
      'convert text to camelcase',
      'snake case converter',
      'sentence case generator',
      'kebab case converter',
    ],
    features: [
      'Supports 10 essential case formats: Sentence case, Title Case (AP / Chicago style), UPPERCASE, lowercase, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and Alternating cAsE',
      'Live character, word, and line count',
      '1-Click Copy Result and Download text file',
      'Preserves acronyms and punctuation intelligently',
    ],
    howToUseSteps: [
      'Paste your text into the main input box.',
      'Click the button corresponding to your desired case style (e.g. "Title Case", "camelCase", "snake_case").',
      'The converted text updates instantly in the output window.',
      'Click "Copy to Clipboard" to use your converted text.',
    ],
    proTips: [
      'Use Title Case for headlines, blog titles, and email subject lines for higher open and engagement rates.',
      'Use camelCase or snake_case when naming programming variables, database columns, or API keys.',
    ],
    faqs: [
      {
        question: 'What is AP Style Title Case?',
        answer: 'AP Style Title Case capitalizes the first and last word of a headline and all nouns, verbs, adjectives, and adverbs, while keeping short prepositions and conjunctions (under 4 letters like in, on, at, and, but) lowercase.',
      },
      {
        question: 'What is kebab-case vs snake_case?',
        answer: 'kebab-case separates words with hyphens (`user-profile-card`), commonly used in URLs and CSS. snake_case separates words with underscores (`user_profile_card`), widely used in Python and database schema.',
      },
    ],
  },
  {
    id: 'lorem-ipsum-generator',
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum & Custom Dummy Text Generator',
    shortDescription: 'Generate placeholder dummy text by paragraphs, sentences, words, or lists with HTML tag wrapping and realistic formatting.',
    category: 'text-content',
    categoryName: 'Text & Content Intelligence',
    iconName: 'FileSignature',
    primaryKeyword: 'lorem ipsum generator with options',
    secondaryKeywords: [
      'custom length dummy text generator',
      'placeholder text generator html',
      'lorem ipsum paragraphs generator',
      'dummy text maker for designers',
      'latin text generator',
    ],
    features: [
      'Generate by Paragraphs, Sentences, Words, or Unordered List items',
      'Configurable quantity slider (1 to 50 items)',
      'Option to start with classic "Lorem ipsum dolor sit amet..." or randomize',
      'HTML Markup mode wraps output with `<p>`, `<ul><li>`, or `<h2>` tags for fast frontend prototyping',
      'Word count and byte size calculation with 1-click copy',
    ],
    howToUseSteps: [
      'Choose your generation unit (Paragraphs, Sentences, Words, or List Items).',
      'Set the desired quantity using the slider or number input.',
      'Toggle "Start with Lorem Ipsum" and optional "HTML Tag Wrapping".',
      'Click "Generate Text" or adjust sliders for instant live updates.',
      'Copy plain text or HTML markup directly into your mockups or codebase.',
    ],
    proTips: [
      'Using HTML tag wrapping mode saves developers time when populating dummy content into HTML templates and markdown files.',
      'Always test layouts with varied paragraph lengths to ensure your UI cards and grid components handle real-world text wrapping gracefully.',
    ],
    faqs: [
      {
        question: 'What is Lorem Ipsum?',
        answer: 'Lorem Ipsum is standard placeholder text derived from sections of Cicero classical Latin literature written in 45 BC. It has been used by typesetters and graphic designers since the 1500s to fill layouts without distracting content.',
      },
      {
        question: 'Why not use repetitive English text for mockups?',
        answer: 'English placeholder text distracts clients and stakeholders because they read the copy rather than focusing on visual hierarchy, typography, and layout structure.',
      },
    ],
  },
];

export function getToolBySlug(slug: string): ToolItem | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string): ToolItem[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getRelatedTools(currentToolSlug: string, count: number = 4): ToolItem[] {
  const current = getToolBySlug(currentToolSlug);
  if (!current) return TOOLS.slice(0, count);

  const sameCategory = TOOLS.filter(
    (t) => t.category === current.category && t.slug !== currentToolSlug
  );
  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }
  const remaining = TOOLS.filter(
    (t) => t.category !== current.category && t.slug !== currentToolSlug
  );
  return [...sameCategory, ...remaining].slice(0, count);
}
