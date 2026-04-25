'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Download, Eye } from 'lucide-react';

export default function CsvTable() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState('');

  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map((line) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const convertToTable = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setPreview('');
        setError('');
        return;
      }

      const rows = parseCSV(input);
      
      if (rows.length === 0) {
        setOutput('');
        setPreview('');
        return;
      }

      const startIndex = hasHeader ? 1 : 0;
      const headers = hasHeader ? rows[0] : rows[0].map((_, i) => `Column ${i + 1}`);

      let tableCode = '<table>\n';
      
      tableCode += '  <thead>\n    <tr>\n';
      headers.forEach((header) => {
        tableCode += `      <th>${header}</th>\n`;
      });
      tableCode += '    </tr>\n  </thead>\n';
      
      tableCode += '  <tbody>\n';
      for (let i = startIndex; i < rows.length; i++) {
        tableCode += '    <tr>\n';
        rows[i].forEach((cell) => {
          tableCode += `      <td>${cell}</td>\n`;
        });
        tableCode += '    </tr>\n';
      }
      tableCode += '  </tbody>\n</table>';

      setOutput(tableCode);

      let previewHtml = '<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">\n';
      
      previewHtml += '  <thead style="background-color: #f3f4f6;">\n    <tr>\n';
      headers.forEach((header) => {
        previewHtml += `      <th style="padding: 12px 8px; border: 1px solid #e5e7eb; text-align: left;">${header}</th>\n`;
      });
      previewHtml += '    </tr>\n  </thead>\n';
      
      previewHtml += '  <tbody>\n';
      const previewRows = rows.slice(startIndex, startIndex + 5);
      previewRows.forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
        previewHtml += `    <tr style="background-color: ${bgColor};">\n`;
        row.forEach((cell) => {
          previewHtml += `      <td style="padding: 12px 8px; border: 1px solid #e5e7eb;">${cell}</td>\n`;
        });
        previewHtml += '    </tr>\n';
      });
      previewHtml += '  </tbody>\n</table>';

      setPreview(previewHtml);
      setError('');
    } catch (err) {
      setError(`Invalid CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
      setPreview('');
    }
  }, [input, hasHeader]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(output);
  }, [output]);

  const downloadHtml = useCallback(() => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSV Table</title>
  <style>
    table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
    th, td { padding: 12px 8px; border: 1px solid #e5e7eb; text-align: left; }
    th { background-color: #f3f4f6; }
    tr:nth-child(even) { background-color: #f9fafb; }
  </style>
</head>
<body>
${output}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table.html';
    link.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CSV to Table
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert CSV data to an HTML table with live preview.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={convertToTable}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Convert to Table
        </button>
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="w-4 h-4"
          />
          First row is header
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Input CSV
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={12}
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              HTML Table Code
            </label>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={downloadHtml}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="HTML table code will appear here..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
            rows={6}
          />
        </div>
      </div>

      {preview && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Preview</h3>
          </div>
          <div 
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}
    </div>
  );
}
