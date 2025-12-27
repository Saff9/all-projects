'use client';

import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', region: 'Global' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', region: 'Brasil' },
  { code: 'es', label: 'Español', flag: '🇪🇸', region: 'España / LatAm' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', region: 'France' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', region: 'Deutschland' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', region: 'India' },
];

export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  const selectLanguage = (code: string) => {
    setSelectedLang(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
        aria-label="Select Language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="hidden sm:inline font-mono uppercase text-[11px]">{current.code}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Select Region &amp; Language
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <div className="font-semibold leading-tight">{lang.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{lang.region}</div>
                  </div>
                </div>
                {selectedLang === lang.code && (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
