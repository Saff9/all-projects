// src/components/ShareBar.js
'use client';
import {
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaReddit,
  FaHackerNews,
  FaLink,
} from 'react-icons/fa6';

export default function ShareBar({ title, url }) {
  const share = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      hackernews: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => prompt('Copy the link:', url));
      return;
    }

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-4 text-xl">
      <button onClick={() => share('twitter')} aria-label="Share on Twitter">
        <FaXTwitter />
      </button>
      <button onClick={() => share('facebook')} aria-label="Share on Facebook">
        <FaFacebook />
      </button>
      <button onClick={() => share('linkedin')} aria-label="Share on LinkedIn">
        <FaLinkedin />
      </button>
      <button onClick={() => share('whatsapp')} aria-label="Share on WhatsApp">
        <FaWhatsapp />
      </button>
      <button onClick={() => share('reddit')} aria-label="Share on Reddit">
        <FaReddit />
      </button>
      <button onClick={() => share('hackernews')} aria-label="Share on Hacker News">
        <FaHackerNews />
      </button>
      <button onClick={() => share('copy')} aria-label="Copy link">
        <FaLink />
      </button>
    </div>
  );
}
