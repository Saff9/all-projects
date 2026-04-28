'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import {
  Settings,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface ToggleOption {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownSelect {
  id: string;
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

interface SliderOption {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

interface FeaturePanelProps {
  title?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  accordions?: AccordionItem[];
  toggles?: ToggleOption[];
  dropdowns?: DropdownSelect[];
  sliders?: SliderOption[];
  onImport?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  importLabel?: string;
  exportLabel?: string;
  resetLabel?: string;
  className?: string;
}

export default function FeaturePanel({
  title = 'Settings',
  tabs = [],
  activeTab,
  onTabChange,
  accordions = [],
  toggles = [],
  dropdowns = [],
  sliders = [],
  onImport,
  onExport,
  onReset,
  importLabel = 'Import',
  exportLabel = 'Export',
  resetLabel = 'Reset',
  className = '',
}: FeaturePanelProps) {
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(
    new Set(accordions.filter((a) => a.defaultOpen).map((a) => a.id))
  );
  const [copied, setCopied] = useState<string | null>(null);

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasTabs = tabs.length > 0;
  const hasActions = onImport || onExport || onReset;

  return (
    <div
      className={`glass rounded-2xl overflow-hidden ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      {(title || hasTabs || hasActions) && (
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          {hasTabs ? (
            <div className="flex items-center gap-1" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-400" />
              <span className="font-medium text-white">{title}</span>
            </div>
          )}

          {hasActions && (
            <div className="flex items-center gap-2">
              {onImport && (
                <button
                  onClick={onImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  aria-label={importLabel}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {importLabel}
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  aria-label={exportLabel}
                >
                  <Download className="w-3.5 h-3.5" />
                  {exportLabel}
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  aria-label={resetLabel}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {resetLabel}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Accordions */}
        {accordions.map((item) => (
          <Accordion
            key={item.id}
            id={item.id}
            title={item.title}
            isOpen={openAccordions.has(item.id)}
            onToggle={() => toggleAccordion(item.id)}
          >
            {item.content}
          </Accordion>
        ))}

        {/* Toggles */}
        {toggles.map((toggle) => (
          <Toggle
            key={toggle.id}
            id={toggle.id}
            label={toggle.label}
            description={toggle.description}
            checked={toggle.checked}
            onChange={toggle.onChange}
          />
        ))}

        {/* Dropdowns */}
        {dropdowns.map((dropdown) => (
          <Dropdown
            key={dropdown.id}
            id={dropdown.id}
            label={dropdown.label}
            value={dropdown.value}
            options={dropdown.options}
            onChange={dropdown.onChange}
          />
        ))}

        {/* Sliders */}
        {sliders.map((slider) => (
          <Slider
            key={slider.id}
            id={slider.id}
            label={slider.label}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={slider.value}
            onChange={slider.onChange}
            unit={slider.unit}
          />
        ))}
      </div>
    </div>
  );
}

// Accordion Component
function Accordion({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/5 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-slide-down">{children}</div>
      )}
    </div>
  );
}

// Toggle Switch Component
function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex-1">
        <label htmlFor={id} className="font-medium text-white cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Dropdown Select Component
function Dropdown({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="p-3 rounded-xl hover:bg-white/5 transition-colors">
      <label htmlFor={id} className="block font-medium text-white mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Slider Component
function Slider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="font-medium text-white">
          {label}
        </label>
        <span className="text-sm text-zinc-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #3f3f46 ${percentage}%, #3f3f46 100%)`,
        }}
      />
    </div>
  );
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.2s ease-out;
  }
`;
if (!document.head.querySelector('#feature-panel-styles')) {
  style.id = 'feature-panel-styles';
  document.head.appendChild(style);
}
