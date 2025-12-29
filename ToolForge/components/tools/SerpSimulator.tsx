'use client';

import { useState } from 'react';
import { Eye, Smartphone, Monitor, Star, AlertCircle, Copy, Check } from 'lucide-react';

export default function SerpSimulator() {
  const [title, setTitle] = useState('Top 15 Free Web Developer Utilities & SEO Tools (2026)');
  const [description, setDescription] = useState(
    'Boost your productivity with 20+ instant, client-side developer utilities, SEO meta analyzers, JSON validators, and CSS generators. 100% free and private.'
  );
  const [url, setUrl] = useState('https://toolforge-seo.vercel.app/tools/seo-suite');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [includeRating, setIncludeRating] = useState(true);
  const [rating, setRating] = useState('4.9');
  const [reviews, setReviews] = useState('842');
  const [includeDate, setIncludeDate] = useState(true);
  const [date, setDate] = useState('Jan 15, 2026');
  const [copied, setCopied] = useState(false);

  // Approximate pixel widths using average Arial character dimensions
  const titlePixelWidth = Math.round(title.length * 9.8);
  const maxTitlePixels = device === 'desktop' ? 600 : 540;
  const isTitleTruncated = titlePixelWidth > maxTitlePixels;

  const descPixelWidth = Math.round(description.length * 6.2);
  const maxDescPixels = device === 'desktop' ? 960 : 680;
  const isDescTruncated = descPixelWidth > maxDescPixels;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Column */}
      <div className="lg:col-span-6 space-y-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" />
            Snippet Settings
          </h2>

          {/* Title input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SEO Page Title
              </label>
              <span
                className={`text-xs font-medium ${
                  isTitleTruncated ? 'text-red-500 font-bold' : 'text-slate-400'
                }`}
              >
                {titlePixelWidth}px / {maxTitlePixels}px max ({title.length} chars)
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            {isTitleTruncated && (
              <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Title will likely be truncated with (...) by Google
              </p>
            )}
          </div>

          {/* URL / Breadcrumb */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Description
              </label>
              <span
                className={`text-xs font-medium ${
                  isDescTruncated ? 'text-red-500 font-bold' : 'text-slate-400'
                }`}
              >
                {descPixelWidth}px / {maxDescPixels}px max ({description.length} chars)
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
            />
          </div>

          {/* Rich Snippets toggles */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={includeRating}
                  onChange={(e) => setIncludeRating(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                5-Star Rating Snippet
              </label>
              {includeRating && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.9"
                    className="w-16 px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={reviews}
                    onChange={(e) => setReviews(e.target.value)}
                    placeholder="Reviews"
                    className="w-24 px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                Publication Date Badge
              </label>
              {includeDate && (
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live SERP Preview Column */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-500" />
              Google SERP Preview
            </h3>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  device === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  device === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* The Google Card simulation */}
          <div
            className={`p-5 rounded-2xl bg-[#ffffff] dark:bg-[#202124] border border-slate-200 dark:border-[#303134] shadow-xs font-sans ${
              device === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
          >
            {/* Header: URL & Favicon */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#303134] flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                TF
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#202124] dark:text-[#dadce0] truncate leading-tight">
                  ToolForge
                </div>
                <div className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] truncate leading-tight">
                  {url}
                </div>
              </div>
            </div>

            {/* Title */}
            <h4 className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug font-normal">
              {isTitleTruncated ? title.slice(0, 58) + '...' : title}
            </h4>

            {/* Rating Rich Snippet */}
            {includeRating && (
              <div className="flex items-center gap-1.5 text-xs text-[#70757a] dark:text-[#9aa0a6] mt-1">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Rating: {rating}/5
                </span>
                <span>·</span>
                <span>{reviews} reviews</span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] mt-1.5 leading-relaxed">
              {includeDate && (
                <span className="text-[#70757a] dark:text-[#9aa0a6] font-medium mr-1.5">
                  {date} —
                </span>
              )}
              {isDescTruncated ? description.slice(0, 155) + '...' : description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
