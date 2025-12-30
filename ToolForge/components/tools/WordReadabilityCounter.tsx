'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Clock, Mic, Sparkles, CheckCircle2, FileText } from 'lucide-react';

export default function WordReadabilityCounter() {
  const [text, setText] = useState(
    'Search engine optimization and high quality content creation are the foundations of organic web traffic. By writing clear, readable, and authoritative articles that answer specific questions, webmasters can rank effectively on Google without spending huge budgets on paid ads. Keep sentences short, avoid jargon, and focus on direct utility.'
  );

  // Syllable counter helper
  const countSyllables = (word: string) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');
    const syl = word.match(/[aeiouy]{1,2}/g);
    return syl ? syl.length : 1;
  };

  const metrics = useMemo(() => {
    if (!text.trim()) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeSec: 0,
        speakingTimeSec: 0,
        fleschEase: 100,
        gradeLevel: 0,
        gradeLabel: 'N/A',
      };
    }

    const wordsArr = text.trim().split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;

    // Sentences
    const sentencesArr = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentences = Math.max(1, sentencesArr.length);

    // Paragraphs
    const paragraphsArr = text.split(/\n+/).filter((p) => p.trim().length > 0);
    const paragraphs = Math.max(1, paragraphsArr.length);

    // Syllables
    const totalSyllables = wordsArr.reduce((acc, w) => acc + countSyllables(w), 0);

    // Reading & Speaking times
    const readingTimeSec = Math.ceil((words / 225) * 60);
    const speakingTimeSec = Math.ceil((words / 130) * 60);

    // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    let flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
    flesch = Math.min(100, Math.max(0, Math.round(flesch)));

    // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    let grade = 0.39 * (words / sentences) + 11.8 * (totalSyllables / words) - 15.59;
    grade = Math.max(1, Math.round(grade * 10) / 10);

    let gradeLabel = 'College Graduate';
    if (flesch >= 90) gradeLabel = '5th Grade (Very Easy)';
    else if (flesch >= 80) gradeLabel = '6th Grade (Easy to Read)';
    else if (flesch >= 70) gradeLabel = '7th Grade (Fairly Easy)';
    else if (flesch >= 60) gradeLabel = '8th-9th Grade (Standard Plain English)';
    else if (flesch >= 50) gradeLabel = '10th-12th Grade (Fairly Difficult)';
    else if (flesch >= 30) gradeLabel = 'College Student (Difficult)';

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeSec,
      speakingTimeSec,
      fleschEase: flesch,
      gradeLevel: grade,
      gradeLabel,
    };
  }, [text]);

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec} sec`;
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min}m ${rem}s`;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Words</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.words}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Characters</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{metrics.charsWithSpaces}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Sentences</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{metrics.sentences}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Paragraphs</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.paragraphs}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Read Time</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400">{formatSeconds(metrics.readingTimeSec)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Speak Time</span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400">{formatSeconds(metrics.speakingTimeSec)}</span>
        </div>
      </div>

      {/* Editor & Readability Score Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Content Text Area</span>
            <button
              onClick={() => setText('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </label>
          <textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text to analyze readability..."
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Readability Score Gauge */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Readability Scores
            </h3>

            {/* Flesch Reading Ease */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Flesch Reading Ease</span>
                <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                  {metrics.fleschEase} / 100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-indigo-600 transition-all duration-300"
                  style={{ width: `${metrics.fleschEase}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {metrics.gradeLabel}
              </span>
            </div>

            {/* Flesch-Kincaid Grade Level */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Flesch-Kincaid Grade Level</span>
                <span className="font-mono font-bold text-base text-teal-600 dark:text-teal-400">
                  Grade {metrics.gradeLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Corresponds to the US school grade required to easily understand this text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
