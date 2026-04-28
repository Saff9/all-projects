'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Copy,
  Trash2,
  FileUp,
  X,
  Check,
  Hash,
  AlignLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useKeyboardShortcuts, useCopyToClipboard } from '@/hooks/useKeyboardShortcuts';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  readOnly?: boolean;
  rows?: number;
  showLineNumbers?: boolean;
  showWordCount?: boolean;
  showCharCount?: boolean;
  autoResize?: boolean;
  enableTabIndent?: boolean;
  syntaxHighlight?: 'json' | 'sql' | 'xml' | 'none';
  dragDropEnabled?: boolean;
  className?: string;
  onFileDrop?: (file: File) => void;
}

export default function TextArea({
  value,
  onChange,
  placeholder,
  label,
  error,
  readOnly = false,
  rows = 10,
  showLineNumbers = false,
  showWordCount = false,
  showCharCount = false,
  autoResize = false,
  enableTabIndent = true,
  syntaxHighlight = 'none',
  dragDropEnabled = true,
  className = '',
  onFileDrop,
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyToClipboard = useCopyToClipboard();

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: 'c',
        modifiers: ['ctrl', 'meta'],
        action: () => handleCopy(),
        description: 'Copy content',
      },
      {
        key: '/',
        modifiers: ['ctrl', 'meta'],
        action: () => handleClear(),
        description: 'Clear content',
      },
    ],
    { enabled: !readOnly }
  );

  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
  };

  // Tab indentation support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!enableTabIndent) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = value.substring(0, start) + '  ' + value.substring(end);
          onChange(newValue);
          // Set cursor position after tab
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          });
        }
      }
    },
    [value, onChange, enableTabIndent]
  );

  // Auto-resize
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!dragDropEnabled || readOnly) return;
    e.preventDefault();
    setIsDragging(true);
  }, [dragDropEnabled, readOnly]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!dragDropEnabled || readOnly) return;
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0 && onFileDrop) {
        onFileDrop(files[0]);
      }
    },
    [dragDropEnabled, readOnly, onFileDrop]
  );

  // Word and character count
  const wordCount = useMemo(() => {
    const text = value.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [value]);

  const charCount = value.length;

  // Generate line numbers
  const lineNumbers = useMemo(() => {
    if (!showLineNumbers) return null;
    const lines = value.split('\n');
    return lines.map((_, i) => i + 1);
  }, [value, showLineNumbers]);

  // Syntax highlighting (basic)
  const highlightedValue = useMemo(() => {
    if (syntaxHighlight === 'none' || readOnly) return null;

    // Basic syntax highlighting - in production, use a library like prism.js
    let highlighted = value;

    if (syntaxHighlight === 'json') {
      highlighted = highlighted
        .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>');
    }

    return (
      <pre
        className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-all pointer-events-none"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }, [value, syntaxHighlight, readOnly]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-zinc-300">{label}</label>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all"
              title="Copy to clipboard (⌘C)"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            {!readOnly && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-white/5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                title="Clear content (⌘/)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            {autoResize && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drop zone overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-2 text-blue-400">
            <FileUp className="w-6 h-6" />
            <span className="font-medium">Drop file here</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative ${showLineNumbers ? 'flex' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Line numbers */}
        {showLineNumbers && (
          <div className="flex-shrink-0 py-3 px-3 bg-zinc-900/50 border border-white/10 rounded-l-xl text-zinc-600 font-mono text-sm text-right select-none">
            {lineNumbers?.map((num) => (
              <div key={num} className="leading-6">
                {num}
              </div>
            ))}
          </div>
        )}

        {/* Textarea with syntax highlight overlay */}
        <div className="relative flex-1">
          {highlightedValue}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={isExpanded ? 20 : rows}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 rounded-xl bg-zinc-900/50 border text-zinc-100 font-mono text-sm resize-y focus:outline-none focus:ring-2 transition-all placeholder:text-zinc-600 ${
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 hover:border-white/20'
            } ${showLineNumbers ? 'rounded-l-none' : ''} ${isExpanded ? 'min-h-[400px]' : ''}`}
            spellCheck={false}
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'transparent',
            }}
          />
        </div>
      </div>

      {/* Word/Character count */}
      {(showWordCount || showCharCount) && (
        <div className="flex items-center gap-4 mt-2 px-1">
          {showWordCount && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Hash className="w-3.5 h-3.5" />
              <span>{wordCount} words</span>
            </div>
          )}
          {showCharCount && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>{charCount} characters</span>
            </div>
          )}
          {dragDropEnabled && !readOnly && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 ml-auto">
              <FileUp className="w-3.5 h-3.5" />
              <span>Drag & drop files</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}
