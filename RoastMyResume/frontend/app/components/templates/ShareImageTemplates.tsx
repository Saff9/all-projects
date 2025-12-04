import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ShareImageTemplateProps {
  roast: string;
  glowUp?: string;
  intensity: 'mild' | 'spicy';
  platform: string;
  isPro: boolean;
  resumeText?: string;
  className?: string;
}

// Platform configurations with exact dimensions
export const PLATFORM_CONFIGS: Record<string, { width: number; height: number; name: string; bgColor: string }> = {
  instagram_square: { width: 1080, height: 1080, name: 'Instagram Square', bgColor: 'from-orange-600 to-red-700' },
  instagram_story: { width: 1080, height: 1920, name: 'Instagram Story', bgColor: 'from-purple-600 to-pink-700' },
  instagram_reel: { width: 1080, height: 1920, name: 'Instagram Reel', bgColor: 'from-blue-600 to-purple-700' },
  twitter_post: { width: 1200, height: 675, name: 'Twitter/X Post', bgColor: 'from-gray-800 to-black' },
  twitter_header: { width: 1500, height: 500, name: 'Twitter Header', bgColor: 'from-blue-500 to-indigo-700' },
  facebook_post: { width: 1200, height: 630, name: 'Facebook Post', bgColor: 'from-blue-600 to-blue-800' },
  facebook_story: { width: 1080, height: 1920, name: 'Facebook Story', bgColor: 'from-blue-500 to-cyan-600' },
  linkedin_post: { width: 1200, height: 627, name: 'LinkedIn Post', bgColor: 'from-blue-700 to-blue-900' },
  linkedin_banner: { width: 1584, height: 396, name: 'LinkedIn Banner', bgColor: 'from-slate-700 to-slate-900' },
  reddit_post: { width: 1200, height: 630, name: 'Reddit Post', bgColor: 'from-orange-500 to-red-600' },
  threads_post: { width: 1080, height: 1080, name: 'Threads Post', bgColor: 'from-gray-900 to-gray-700' },
  youtube_thumbnail: { width: 1280, height: 720, name: 'YouTube Thumbnail', bgColor: 'from-red-600 to-red-800' },
  youtube_short: { width: 1080, height: 1920, name: 'YouTube Short', bgColor: 'from-red-500 to-pink-600' },
  tiktok_video: { width: 1080, height: 1920, name: 'TikTok Video', bgColor: 'from-black to-gray-800' },
  pinterest_pin: { width: 1000, height: 1500, name: 'Pinterest Pin', bgColor: 'from-red-500 to-orange-600' },
  snapchat_story: { width: 1080, height: 1920, name: 'Snapchat Story', bgColor: 'from-yellow-400 to-orange-500' },
  whatsapp_status: { width: 1080, height: 1920, name: 'WhatsApp Status', bgColor: 'from-green-500 to-teal-600' },
  telegram_post: { width: 1280, height: 720, name: 'Telegram Post', bgColor: 'from-blue-400 to-blue-600' },
  discord_embed: { width: 1200, height: 630, name: 'Discord Embed', bgColor: 'from-indigo-600 to-purple-700' },
  medium_header: { width: 1600, height: 480, name: 'Medium Header', bgColor: 'from-gray-800 to-gray-900' },
  substack_header: { width: 1600, height: 480, name: 'Substack Header', bgColor: 'from-gray-700 to-gray-900' },
  twitch_panel: { width: 320, height: 100, name: 'Twitch Panel', bgColor: 'from-purple-600 to-purple-800' },
  twitch_overlay: { width: 1920, height: 1080, name: 'Twitch Overlay', bgColor: 'from-purple-700 to-indigo-900' },
  clubhouse_room: { width: 1200, height: 1200, name: 'Clubhouse Room', bgColor: 'from-green-400 to-teal-500' },
  mastodon_post: { width: 1200, height: 630, name: 'Mastodon Post', bgColor: 'from-purple-600 to-indigo-700' },
  tumblr_post: { width: 1280, height: 720, name: 'Tumblr Post', bgColor: 'from-blue-600 to-indigo-800' },
  vimeo_thumbnail: { width: 1280, height: 720, name: 'Vimeo Thumbnail', bgColor: 'from-blue-500 to-cyan-700' },
  soundcloud_cover: { width: 2480, height: 500, name: 'SoundCloud Cover', bgColor: 'from-orange-500 to-pink-600' },
  spotify_playlist: { width: 1500, height: 1500, name: 'Spotify Playlist', bgColor: 'from-green-500 to-green-700' },
  apple_podcast: { width: 3000, height: 3000, name: 'Apple Podcast', bgColor: 'from-purple-500 to-pink-600' },
  google_business: { width: 1200, height: 900, name: 'Google Business', bgColor: 'from-blue-500 to-red-600' },
  yelp_photo: { width: 1000, height: 667, name: 'Yelp Photo', bgColor: 'from-red-500 to-orange-600' },
  tripadvisor_photo: { width: 1200, height: 800, name: 'TripAdvisor Photo', bgColor: 'from-green-500 to-emerald-600' },
  amazon_product: { width: 2000, height: 2000, name: 'Amazon Product', bgColor: 'from-yellow-500 to-orange-600' },
  etsy_listing: { width: 2000, height: 2000, name: 'Etsy Listing', bgColor: 'from-orange-400 to-pink-500' },
  shopify_product: { width: 2048, height: 2048, name: 'Shopify Product', bgColor: 'from-gray-700 to-gray-900' },
  behance_project: { width: 1400, height: 1050, name: 'Behance Project', bgColor: 'from-blue-600 to-purple-700' },
  dribbble_shot: { width: 1600, height: 1200, name: 'Dribbble Shot', bgColor: 'from-pink-500 to-rose-600' },
  github_readme: { width: 1280, height: 640, name: 'GitHub README', bgColor: 'from-gray-800 to-gray-900' },
  product_hunt: { width: 1270, height: 760, name: 'Product Hunt', bgColor: 'from-orange-500 to-red-600' },
  indiehacker_post: { width: 1200, height: 630, name: 'Indie Hacker Post', bgColor: 'from-purple-600 to-pink-700' },
  hackernews_thumb: { width: 1200, height: 630, name: 'HackerNews Thumb', bgColor: 'from-orange-400 to-orange-600' },
  devto_article: { width: 1200, height: 630, name: 'Dev.to Article', bgColor: 'from-gray-700 to-gray-900' },
  hashnode_article: { width: 1200, height: 630, name: 'Hashnode Article', bgColor: 'from-blue-500 to-indigo-700' },
};

const getFirstSentences = (text: string, count: number = 2) => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  return sentences.slice(0, count).join(' ').trim();
};

export const ShareImageTemplate = forwardRef<HTMLDivElement, ShareImageTemplateProps>(
  ({ roast, glowUp, intensity, platform, isPro, resumeText, className }, ref) => {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.twitter_post;
    const firstSentences = getFirstSentences(roast);
    const logoPosition = platform.includes('instagram') ? 'top-right' : 'bottom-right';

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-gradient-to-br',
          config.bgColor,
          className
        )}
        style={{
          width: config.width,
          height: config.height,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Blurred Resume Text Background */}
        {resumeText && (
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
            <p className="text-xs leading-tight p-8 font-mono whitespace-pre-wrap blur-sm">
              {resumeText.slice(0, 2000)}
            </p>
          </div>
        )}

        {/* Main Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">RoastMyResume</h1>
                <p className="text-white/70 text-lg">Your resume, roasted to perfection</p>
              </div>
            </div>
            
            {/* Intensity Badge */}
            <div className={cn(
              'px-6 py-3 rounded-full text-white font-bold text-xl uppercase tracking-wider',
              intensity === 'spicy' ? 'bg-red-500' : 'bg-yellow-500'
            )}>
              {intensity === 'spicy' ? '🌶️ Spicy' : '😊 Mild'}
            </div>
          </div>

          {/* Main Roast Text */}
          <div className="flex-1 flex items-center justify-center my-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <blockquote className="text-white text-center">
                <p className="text-5xl font-bold leading-tight mb-8 font-serif">
                  "{firstSentences}"
                </p>
                {roast.length > 200 && (
                  <p className="text-2xl text-white/80 italic mt-6">
                    + {Math.ceil((roast.length - firstSentences.length) / 100)} more burns...
                  </p>
                )}
              </blockquote>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="text-white/60">
              <p className="text-2xl">Made with RoastMyResume</p>
              <p className="text-lg mt-2">roastmyresume.com</p>
            </div>
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/80 text-xl font-semibold">Get Roasted</p>
                <p className="text-white/60 text-lg">Scan QR Code</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-2xl p-2">
                <div className="w-full h-full bg-black grid grid-cols-5 grid-rows-5 gap-1 p-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-sm',
                        Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark for Free Users */}
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="transform -rotate-45 px-16 py-8 bg-black/30 backdrop-blur-sm border-2 border-white/30 rounded-2xl">
              <p className="text-6xl font-bold text-white/50 tracking-widest uppercase">
                Made with RoastMyResume
              </p>
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>
    );
  }
);

ShareImageTemplate.displayName = 'ShareImageTemplate';

// Specialized template variants
export const MinimalistTemplate = forwardRef<HTMLDivElement, ShareImageTemplateProps>(
  ({ roast, intensity, platform, isPro, className }, ref) => {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.twitter_post;
    const firstSentence = getFirstSentences(roast, 1);

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-gray-900 to-black',
          className
        )}
        style={{ width: config.width, height: config.height }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="max-w-4xl">
            <p className="text-6xl font-light text-white leading-tight">
              {firstSentence}
            </p>
            <div className="mt-12 flex items-center gap-4">
              <div className="h-px w-20 bg-orange-500" />
              <span className="text-2xl text-orange-500 font-medium">
                {intensity === 'spicy' ? '🔥 Spicy Roast' : '😊 Mild Roast'}
              </span>
              <div className="h-px w-20 bg-orange-500" />
            </div>
          </div>
        </div>
        
        {!isPro && (
          <div className="absolute bottom-8 right-8 text-white/30 text-xl">
            RoastMyResume
          </div>
        )}
      </div>
    );
  }
);

MinimalistTemplate.displayName = 'MinimalistTemplate';

export const NewspaperTemplate = forwardRef<HTMLDivElement, ShareImageTemplateProps>(
  ({ roast, intensity, platform, isPro, className }, ref) => {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.twitter_post;
    const firstSentences = getFirstSentences(roast, 3);

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-[#f5f0e6]',
          className
        )}
        style={{ width: config.width, height: config.height }}
      >
        <div className="p-16 h-full flex flex-col">
          {/* Masthead */}
          <div className="border-b-4 border-black pb-8 mb-8">
            <h1 className="text-7xl font-black text-center tracking-tighter">
              THE ROAST TIMES
            </h1>
            <p className="text-center text-xl mt-4 text-gray-600">
              "All the News That's Fit to Burn" • Est. 2024
            </p>
          </div>

          {/* Headline */}
          <div className="flex-1">
            <h2 className="text-5xl font-bold leading-tight mb-8">
              Local Professional's Resume Destroys Itself in Hilarious Fashion
            </h2>

            {/* Article */}
            <div className="columns-2 gap-8 text-justify">
              <p className="text-2xl leading-relaxed font-serif mb-6">
                <span className="float-left text-7xl font-bold mr-3 mt-[-10px]">
                  {firstSentences.charAt(0)}
                </span>
                {firstSentences.slice(1)}
              </p>
              <p className="text-xl leading-relaxed font-serif text-gray-700">
                In a shocking turn of events, career experts are calling this roast 
                "brutally honest" and "surprisingly helpful." The subject reportedly 
                laughed through tears while receiving actionable career advice.
              </p>
              <p className="text-xl leading-relaxed font-serif text-gray-700 mt-6">
                Sources close to the situation confirm that the roast was delivered 
                with {intensity === 'spicy' ? 'maximum heat' : 'gentle precision'}, 
                leaving no bullet point unturned.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black pt-6 mt-8 flex justify-between items-center">
            <p className="text-lg font-bold">RoastMyResume.com</p>
            {!isPro && (
              <p className="text-sm text-gray-500">Watermarked Edition</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

NewspaperTemplate.displayName = 'NewspaperTemplate';

export const MemeTemplate = forwardRef<HTMLDivElement, ShareImageTemplateProps>(
  ({ roast, intensity, platform, isPro, className }, ref) => {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.twitter_post;
    const funnyLine = roast.split('\n').find(line => line.length > 20 && line.length < 150) || roast.slice(0, 100);

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900',
          className
        )}
        style={{ width: config.width, height: config.height }}
      >
        {/* Drake Format */}
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center p-12">
            <div className="w-1/2 flex justify-center">
              <div className="text-9xl">👎</div>
            </div>
            <div className="w-1/2 p-8">
              <p className="text-4xl font-bold text-white/70">
                Your original resume
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center p-12 bg-white/10">
            <div className="w-1/2 flex justify-center">
              <div className="text-9xl">👍</div>
            </div>
            <div className="w-1/2 p-8">
              <p className="text-4xl font-bold text-white">
                After getting roasted 🔥
              </p>
              <p className="text-2xl text-white/80 mt-4 line-clamp-2">
                {funnyLine}
              </p>
            </div>
          </div>
        </div>

        {!isPro && (
          <div className="absolute bottom-4 right-4 text-white/40 text-lg">
            @RoastMyResume
          </div>
        )}
      </div>
    );
  }
);

MemeTemplate.displayName = 'MemeTemplate';

export const QuoteCardTemplate = forwardRef<HTMLDivElement, ShareImageTemplateProps>(
  ({ roast, intensity, platform, isPro, className }, ref) => {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.twitter_post;
    const bestQuote = roast.match(/"[^"]+"/)?.[0] || `"${getFirstSentences(roast, 1)}"`;

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-gradient-to-br',
          intensity === 'spicy' 
            ? 'from-red-600 via-orange-600 to-yellow-600'
            : 'from-blue-400 via-purple-400 to-pink-400',
          className
        )}
        style={{ width: config.width, height: config.height }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center max-w-4xl">
            <div className="text-8xl text-white/30 mb-8">"</div>
            <p className="text-6xl font-bold text-white leading-tight mb-12 drop-shadow-lg">
              {bestQuote.replace(/"/g, '')}
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="h-px w-24 bg-white/50" />
              <span className="text-3xl text-white font-medium tracking-wide">
                — RoastMyResume AI
              </span>
              <div className="h-px w-24 bg-white/50" />
            </div>
          </div>
        </div>

        {/* Decorative Quotes */}
        <div className="absolute top-12 left-12 text-9xl text-white/10">❝</div>
        <div className="absolute bottom-12 right-12 text-9xl text-white/10 rotate-180">❞</div>

        {!isPro && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-2xl">
            roastmyresume.com
          </div>
        )}
      </div>
    );
  }
);

QuoteCardTemplate.displayName = 'QuoteCardTemplate';

// Export all templates
export const TEMPLATES = {
  default: ShareImageTemplate,
  minimalist: MinimalistTemplate,
  newspaper: NewspaperTemplate,
  meme: MemeTemplate,
  quote: QuoteCardTemplate,
};

export type TemplateType = keyof typeof TEMPLATES;
