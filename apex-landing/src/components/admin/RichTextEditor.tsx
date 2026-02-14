'use client';

/* eslint-disable jsx-a11y/alt-text */

import React, { useRef, useCallback } from 'react';
import { Bold, Italic, List, Link, Image, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter image alt text:') || 'Blog image';
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.margin = '10px 0';

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        // Move cursor after the image
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  }, [onChange]);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/50 border-b border-border">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Insert Image"
        >
          <Image className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h1')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Heading 1"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Heading 2"
        >
          <Type className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h3')}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Heading 3"
        >
          <Type className="w-2 h-2" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 bg-background text-foreground focus:outline-none prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: value || `<p class="text-muted-foreground">${placeholder || 'Start writing...'}</p>` }}
        onInput={handleInput}
        style={{
          minHeight: '200px',
        }}
      />
    </div>
  );
}
