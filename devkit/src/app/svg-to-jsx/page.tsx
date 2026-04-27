'use client';

import { useState, useCallback } from 'react';

export default function SVGToJSX() {
  const [svgInput, setSvgInput] = useState('');
  const [componentName, setComponentName] = useState('SvgComponent');
  const [options, setOptions] = useState({
    functional: true,
    typescript: true,
    removeFill: true,
    removeStroke: false,
    camelCase: true,
  });

  const convertToJSX = useCallback(() => {
    if (!svgInput.trim()) return '';

    let jsx = svgInput;

    // Remove XML declaration
    jsx = jsx.replace(/<\?xml[^>]*\?>/gi, '');

    // Remove comments
    jsx = jsx.replace(/<!--[^>]*-->/g, '');

    // Get the SVG tag content
    const svgMatch = jsx.match(/<svg[^>]*>/i);
    if (!svgMatch) return '';
    const svgTag = svgMatch[0];
    const svgContent = jsx.replace(svgMatch[0], '').replace(/<\/svg>/gi, '');

    // Parse attributes
    const attrRegex = /([\w-]+)="([^"]*)"/g;
    let match;
    const attributes: Record<string, string> = {};
    while ((match = attrRegex.exec(svgTag)) !== null) {
      attributes[match[1]] = match[2];
    }

    // Convert attribute names to camelCase
    if (options.camelCase) {
      const newAttrs: Record<string, string> = {};
      const camelCaseAttrs: Record<string, string> = {
        'fill-rule': 'fillRule',
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'clip-rule': 'clipRule',
        'stroke-miterlimit': 'strokeMiterlimit',
        'fill-opacity': 'fillOpacity',
        'stroke-opacity': 'strokeOpacity',
        'stop-color': 'stopColor',
        'stop-opacity': 'stopOpacity',
        'font-family': 'fontFamily',
        'font-size': 'fontSize',
        'font-weight': 'fontWeight',
        'text-anchor': 'textAnchor',
        'dominant-baseline': 'dominantBaseline',
        'preserve-aspect-ratio': 'preserveAspectRatio',
        'view-box': 'viewBox',
      };
      Object.entries(attributes).forEach(([key, value]) => {
        const newKey = camelCaseAttrs[key] || key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        newAttrs[newKey] = value;
      });
      Object.assign(attributes, newAttrs);
    }

    // Remove fill colors if option is set
    if (options.removeFill && attributes.fill && attributes.fill !== 'none') {
      attributes.fill = 'currentColor';
    }

    // Remove stroke colors if option is set
    if (options.removeStroke && attributes.stroke && attributes.stroke !== 'none') {
      attributes.stroke = 'currentColor';
    }

    // Convert children to JSX format
    let jsxContent = svgContent
      .replace(/<([^ />]+)([^>]*)>([^<]*)<\/\1>/g, (_, tag, attrs, content) => {
        const attrStr = attrs ? ' ' + attrs.trim() : '';
        return `<${tag}${attrStr}>${content.trim()}</${tag}>`;
      })
      .replace(/<rect([^>]*)>/g, '<rect$1 />')
      .replace(/<circle([^>]*)>/g, '<circle$1 />')
      .replace(/<ellipse([^>]*)>/g, '<ellipse$1 />')
      .replace(/<line([^>]*)>/g, '<line$1 />')
      .replace(/<polyline([^>]*)>/g, '<polyline$1 />')
      .replace(/<polygon([^>]*)>/g, '<polygon$1 />')
      .replace(/<path([^>]*)>/g, '<path$1 />')
      .replace(/<text([^>]*)>/g, (_, attrs) => `<text${attrs ? ' ' + attrs.trim() : ''}>`)
      .replace(/<\/text>/g, '</text>');

    // Convert attribute syntax
    Object.entries(attributes).forEach(([key, value]) => {
      const regex = new RegExp(`${key}=`, 'g');
      jsxContent = jsxContent.replace(regex, `${key}=`);
    });

    // Create the component
    const attrsArray = Object.entries(attributes)
      .map(([key, value]) => {
        if (key === 'viewBox') return `${key}="${value}"`;
        if (key === 'class') return 'className';
        if (value === 'currentColor' || value.startsWith('#') || value.startsWith('rgb') || value === 'none') {
          return `${key}="${value}"`;
        }
        return `${key}={${value}}`;
      })
      .join('\n  ');

    const componentType = options.functional ? 'function' : 'class';
    const returnType = options.typescript ? ': JSX.Element' : '';
    const propsType = options.typescript ? ' React.SVGProps<SVGSVGElement>' : '';

    if (options.functional) {
      return `import React from 'react';

${componentType} ${componentName}() {
  return (
    <svg
  ${attrsArray}
    >
      ${jsxContent.trim()}
    </svg>
  );
}

export default ${componentName};`;
    } else {
      return `import React from 'react';

${componentType} ${componentName}${propsType}${returnType} {
  return (
    <svg
  ${attrsArray}
    >
      ${jsxContent.trim()}
    </svg>
  );
}

export default ${componentName};`;
    }
  }, [svgInput, componentName, options]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          SVG to JSX Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert SVG code to React JSX components.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SVG Input</h3>
              <button
                onClick={() => setSvgInput('')}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear
              </button>
            </div>
            <textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder="Paste your SVG code here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none"
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Component Name
                </label>
                <input
                  type="text"
                  value={componentName}
                  onChange={(e) => setComponentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                {[
                  { key: 'functional', label: 'Functional Component' },
                  { key: 'typescript', label: 'TypeScript' },
                  { key: 'removeFill', label: 'Remove Fill Colors' },
                  { key: 'removeStroke', label: 'Remove Stroke Colors' },
                  { key: 'camelCase', label: 'CamelCase Attributes' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(options as Record<string, boolean>)[key]}
                      onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">JSX Output</h3>
              <button
                onClick={() => copyToClipboard(convertToJSX())}
                disabled={!svgInput.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy JSX
              </button>
            </div>
            <pre className="w-full h-64 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {svgInput.trim() ? convertToJSX() : 'JSX code will appear here...'}
              </code>
            </pre>
          </div>

          {/* Preview */}
          {svgInput.trim() && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Preview</h3>
              <div
                className="w-full h-48 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg"
                dangerouslySetInnerHTML={{ __html: svgInput }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
