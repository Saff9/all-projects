'use client';

import { useState } from 'react';
import TextArea from '@/components/TextArea';

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(`# Hello World

This is a **Markdown** previewer.

## Features

- Live preview
- Supports GitHub Flavored Markdown
- Copy HTML output

## Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Headers | ✓ |
| Lists | ✓ |
| Tables | ✓ |

> This is a blockquote

[Link to Google](https://google.com)
`);

  const parseMarkdown = (text: string): string => {
    let html = text;

    // Escape HTML
    html = html.replace(/&/g, '&');
    html = html.replace(/</g, '<');
    html = html.replace(/>/g, '>');

    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr />');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Tables (simple)
    const tableRegex = /\|(.+)\|\n\|[-:\| ]+\|\n((?:\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match, header, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const headerHtml = '<tr>' + headers.map((h: string) => `<th>${h}</th>`).join('') + '</tr>';
      
      const rowLines = rows.trim().split('\n');
      const rowsHtml = rowLines.map((line: string) => {
        const cells = line.split('|').map((c: string) => c.trim()).filter(Boolean);
        return '<tr>' + cells.map((c: string) => `<td>${c}</td>`).join('') + '</tr>';
      }).join('');
      
      return `<table>${headerHtml}${rowsHtml}</table>`;
    });

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(parseMarkdown(markdown));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Markdown Previewer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Live preview Markdown with HTML output.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={copyHtml}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Copy HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Markdown"
          value={markdown}
          onChange={setMarkdown}
          placeholder="Enter Markdown here..."
          rows={20}
        />

        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview
            </label>
          </div>
          <div
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[500px] overflow-auto prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
          />
        </div>
      </div>
    </div>
  );
}
