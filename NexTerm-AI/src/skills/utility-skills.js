/**
 * Utility Skills — Offline tools that work without AI
 * JSON, Hash, Password, Base64, Unit Converter, Word Count, UUID, Diff
 */

export const jsonFormatSkill = {
    name: 'json',
    description: 'Format, validate, and prettify JSON data. Shows structure analysis.',
    icon: '{}',
    trigger: '/json ',
    parameters: {
        type: 'object',
        properties: { json: { type: 'string', description: 'JSON string' } },
        required: ['json'],
    },
    execute({ json }) {
        try {
            const parsed = JSON.parse(json);
            const formatted = JSON.stringify(parsed, null, 2);
            const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
            const count = type === 'object' ? Object.keys(parsed).length : Array.isArray(parsed) ? parsed.length : 1;
            return `✓ **Valid JSON** (${type}, ${count} ${Array.isArray(parsed) ? 'items' : 'keys'})\n\n\`\`\`json\n${formatted}\n\`\`\``;
        } catch (err) {
            return `✗ **Invalid JSON:** ${err.message}`;
        }
    },
};

export const hashSkill = {
    name: 'hash',
    description: 'Generate SHA-256 or SHA-512 hash of text.',
    icon: '#',
    trigger: '/hash ',
    parameters: {
        type: 'object',
        properties: {
            text: { type: 'string', description: 'Text to hash' },
            algorithm: { type: 'string', description: 'SHA-256 (default) or SHA-512' },
        },
        required: ['text'],
    },
    async execute({ text, algorithm = 'SHA-256' }) {
        const algo = algorithm.toUpperCase();
        if (!['SHA-256', 'SHA-512', 'SHA-1'].includes(algo)) return `Unknown algorithm: ${algo}`;
        const encoded = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algo, encoded);
        const hex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        return `**${algo}:**\n\`${hex}\``;
    },
};

export const passwordSkill = {
    name: 'password',
    description: 'Generate a secure random password.',
    icon: '🔐',
    trigger: '/password ',
    parameters: {
        type: 'object',
        properties: { length: { type: 'number', description: 'Length (8-128, default 20)' } },
    },
    execute({ length = 20 }) {
        const len = Math.max(8, Math.min(128, length));
        const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*_+-=';
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        const pw = Array.from(arr, x => chars[x % chars.length]).join('');
        const strength = len >= 24 ? 'Excellent' : len >= 16 ? 'Strong' : len >= 12 ? 'Good' : 'Fair';
        return `**Password** (${len} chars, ${strength}):\n\`${pw}\``;
    },
};

export const base64Skill = {
    name: 'base64',
    description: 'Encode or decode Base64. Usage: /base64 encode <text> or /base64 decode <text>',
    icon: 'B64',
    trigger: '/base64 ',
    parameters: {
        type: 'object',
        properties: {
            action: { type: 'string', description: 'encode or decode' },
            text: { type: 'string', description: 'Text to process' },
        },
        required: ['action', 'text'],
    },
    execute({ action, text }) {
        try {
            if (action === 'encode') return `**Encoded:**\n\`${btoa(unescape(encodeURIComponent(text)))}\``;
            if (action === 'decode') return `**Decoded:**\n${decodeURIComponent(escape(atob(text)))}`;
            return `Unknown action: ${action} (use encode or decode)`;
        } catch (err) {
            return `Error: ${err.message}`;
        }
    },
};

export const convertSkill = {
    name: 'convert',
    description: 'Convert between units. Supports length, weight, temperature, data. Example: /convert 100 km mi',
    icon: '⇄',
    trigger: '/convert ',
    parameters: {
        type: 'object',
        properties: {
            value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' },
        },
        required: ['value', 'from', 'to'],
    },
    execute({ value, from, to }) {
        const f = from.toLowerCase(), t = to.toLowerCase();

        // Temperature
        if (['c', 'f', 'k'].includes(f) && ['c', 'f', 'k'].includes(t)) {
            let c = f === 'c' ? value : f === 'f' ? (value - 32) * 5 / 9 : value - 273.15;
            let r = t === 'c' ? c : t === 'f' ? c * 9 / 5 + 32 : c + 273.15;
            return `${value}°${f.toUpperCase()} = **${r.toFixed(2)}°${t.toUpperCase()}**`;
        }

        // Base units
        const bases = {
            km: { m: 1000 }, mi: { m: 1609.344 }, m: { m: 1 }, ft: { m: 0.3048 },
            in: { m: 0.0254 }, cm: { m: 0.01 }, mm: { m: 0.001 }, yd: { m: 0.9144 },
            kg: { g: 1000 }, lb: { g: 453.592 }, oz: { g: 28.3495 }, g: { g: 1 }, mg: { g: 0.001 },
            tb: { b: 1099511627776 }, gb: { b: 1073741824 }, mb: { b: 1048576 }, kb: { b: 1024 }, b: { b: 1 },
            hr: { s: 3600 }, min: { s: 60 }, sec: { s: 1 }, days: { s: 86400 },
        };

        const fb = bases[f], tb2 = bases[t];
        if (!fb || !tb2) return `Unknown unit: ${from} or ${to}`;
        const fk = Object.keys(fb)[0], tk = Object.keys(tb2)[0];
        if (fk !== tk) return `Can't convert ${from} to ${to} (different types)`;
        const result = (value * fb[fk]) / tb2[tk];
        return `${value} ${from} = **${result.toFixed(6).replace(/\.?0+$/, '')} ${to}**`;
    },
};

export const wordCountSkill = {
    name: 'wc',
    description: 'Count words, characters, sentences, and estimate reading time.',
    icon: 'Wc',
    trigger: '/wc ',
    parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Text to analyze' } },
        required: ['text'],
    },
    execute({ text }) {
        const words = text.trim().split(/\s+/).filter(w => w).length;
        const chars = text.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const readTime = Math.max(1, Math.ceil(words / 200));
        return `| Metric | Count |\n|--------|-------|\n| Words | ${words} |\n| Characters | ${chars} |\n| Sentences | ${sentences} |\n| Reading time | ~${readTime} min |`;
    },
};

export const uuidSkill = {
    name: 'uuid',
    description: 'Generate a UUID v4.',
    icon: 'ID',
    trigger: '/uuid',
    parameters: { type: 'object', properties: {} },
    execute() {
        return `\`${crypto.randomUUID()}\``;
    },
};

export const diffSkill = {
    name: 'diff',
    description: 'Compare two texts and show differences line by line.',
    icon: '±',
    trigger: '/diff ',
    parameters: {
        type: 'object',
        properties: { old: { type: 'string' }, new: { type: 'string' } },
        required: ['old', 'new'],
    },
    execute({ old: oldText, new: newText }) {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const maxLen = Math.max(oldLines.length, newLines.length);
        let diff = '';
        for (let i = 0; i < maxLen; i++) {
            const o = oldLines[i] ?? '';
            const n = newLines[i] ?? '';
            if (o === n) {
                diff += `  ${o}\n`;
            } else {
                if (o) diff += `- ${o}\n`;
                if (n) diff += `+ ${n}\n`;
            }
        }
        return `\`\`\`diff\n${diff}\`\`\``;
    },
};

export const urlCodecSkill = {
    name: 'url_codec',
    description: 'Encode or decode URLs. Usage: /url encode <text> or /url decode <text>',
    icon: '🌐',
    trigger: '/url ',
    parameters: {
        type: 'object',
        properties: {
            action: { type: 'string', description: 'encode or decode' },
            text: { type: 'string', description: 'Text to process' },
        },
        required: ['action', 'text'],
    },
    execute({ action, text }) {
        try {
            if (action === 'encode') return `**Encoded:**\n\`${encodeURIComponent(text)}\``;
            if (action === 'decode') return `**Decoded:**\n\`${decodeURIComponent(text)}\``;
            return `Unknown action: ${action} (use encode or decode)`;
        } catch (err) { return `Error: ${err.message}`; }
    },
};

export const loremIpsumSkill = {
    name: 'lorem_ipsum',
    description: 'Generate placeholder Lorem Ipsum text.',
    icon: '📝',
    trigger: '/lorem ',
    parameters: {
        type: 'object',
        properties: { paragraphs: { type: 'number', description: 'Number of paragraphs (1-10)' } },
    },
    execute({ paragraphs = 1 }) {
        const p = Math.max(1, Math.min(10, paragraphs));
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        return Array(p).fill(text).join('\n\n');
    },
};

export const hexRgbSkill = {
    name: 'color',
    description: 'Convert HEX to RGB or RGB to HEX.',
    icon: '🎨',
    trigger: '/color ',
    parameters: {
        type: 'object',
        properties: { value: { type: 'string', description: 'Color value (#fff or 255,255,255)' } },
        required: ['value'],
    },
    execute({ value }) {
        if (value.startsWith('#')) {
            let hex = value.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `**RGB:** \`rgb(${r}, ${g}, ${b})\``;
        } else {
            const [r, g, b] = value.split(',').map(n => parseInt(n.trim()));
            if (isNaN(r) || isNaN(g) || isNaN(b)) return 'Invalid RGB. Format: 255,255,255';
            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            return `**HEX:** \`${hex.toUpperCase()}\``;
        }
    },
};

export function registerUtilitySkills(registry) {
    [
        jsonFormatSkill, hashSkill, passwordSkill, base64Skill, convertSkill,
        wordCountSkill, uuidSkill, diffSkill, urlCodecSkill, loremIpsumSkill, hexRgbSkill
    ].forEach(s => registry.register(s));
}
