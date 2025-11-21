/**
 * Built-in Skills — Calculator, DateTime, Notes, WebSearch, CodeRunner, Summarizer
 */

// ── Calculator ──
export const calculatorSkill = {
    name: 'calculator',
    description: 'Evaluate a mathematical expression safely. Supports +, -, *, /, ^, %, sqrt, sin, cos, tan, log, pi, e. Example: "sqrt(144) + 2^3"',
    icon: '🧮',
    trigger: '/calc ',
    parameters: {
        type: 'object',
        properties: {
            expression: { type: 'string', description: 'Math expression to evaluate' },
        },
        required: ['expression'],
    },
    execute({ expression }) {
        // Safe math evaluator — no eval()
        const sanitized = expression
            .replace(/[^0-9+\-*/().^%,\s]/g, (match) => {
                const allowed = {
                    'sqrt': 'Math.sqrt', 'sin': 'Math.sin', 'cos': 'Math.cos',
                    'tan': 'Math.tan', 'log': 'Math.log', 'abs': 'Math.abs',
                    'ceil': 'Math.ceil', 'floor': 'Math.floor', 'round': 'Math.round',
                    'pi': 'Math.PI', 'e': 'Math.E', 'pow': 'Math.pow',
                    'min': 'Math.min', 'max': 'Math.max',
                };
                return allowed[match] || '';
            })
            .replace(/\^/g, '**');

        try {
            // Use Function constructor with restricted scope
            const fn = new Function('Math', `"use strict"; return (${sanitized})`);
            const result = fn(Math);
            if (typeof result !== 'number' || !isFinite(result)) {
                return `Error: Invalid result for "${expression}"`;
            }
            return `${expression} = ${result}`;
        } catch (err) {
            return `Error evaluating "${expression}": ${err.message}`;
        }
    },
};

// ── DateTime ──
export const dateTimeSkill = {
    name: 'datetime',
    description: 'Get the current date, time, timezone, or calculate time differences. Actions: "now", "date", "time", "timezone", "countdown <YYYY-MM-DD>"',
    icon: '🕐',
    trigger: '/time',
    parameters: {
        type: 'object',
        properties: {
            action: { type: 'string', description: 'Action: now, date, time, timezone, or countdown', default: 'now' },
            target: { type: 'string', description: 'Target date for countdown (YYYY-MM-DD format)' },
        },
    },
    execute({ action = 'now', target }) {
        const now = new Date();
        const options = { dateStyle: 'full', timeStyle: 'long' };

        switch (action) {
            case 'date':
                return `📅 ${now.toLocaleDateString('en-US', { dateStyle: 'full' })}`;
            case 'time':
                return `🕐 ${now.toLocaleTimeString('en-US', { timeStyle: 'long' })}`;
            case 'timezone':
                return `🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone} (UTC${now.getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(now.getTimezoneOffset() / 60)})`;
            case 'countdown': {
                if (!target) return 'Please provide a target date (YYYY-MM-DD)';
                const targetDate = new Date(target);
                const diff = targetDate - now;
                if (diff < 0) return `⏰ ${target} was ${Math.abs(Math.floor(diff / 86400000))} days ago`;
                const days = Math.floor(diff / 86400000);
                const hours = Math.floor((diff % 86400000) / 3600000);
                return `⏰ ${days} days, ${hours} hours until ${target}`;
            }
            default:
                return `📅 ${now.toLocaleString('en-US', options)}`;
        }
    },
};

// ── Notes ──
export const notesSkill = {
    name: 'notes',
    description: 'Save, list, search, or delete persistent notes. Actions: save (requires title + content), list, search (requires query), delete (requires title)',
    icon: '📝',
    trigger: '/note ',
    parameters: {
        type: 'object',
        properties: {
            action: { type: 'string', description: 'Action: save, list, search, delete' },
            title: { type: 'string', description: 'Note title' },
            content: { type: 'string', description: 'Note content (for save)' },
            query: { type: 'string', description: 'Search query' },
        },
        required: ['action'],
    },
    execute({ action, title, content, query }) {
        // Notes stored in localStorage for simplicity
        const NOTES_KEY = 'nexterm_notes';
        const getNotes = () => JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
        const saveNotes = (notes) => localStorage.setItem(NOTES_KEY, JSON.stringify(notes));

        switch (action) {
            case 'save': {
                if (!title || !content) return '❌ Need both title and content to save a note';
                const notes = getNotes();
                notes.push({ title, content, createdAt: new Date().toISOString() });
                saveNotes(notes);
                return `✅ Note saved: "${title}"`;
            }
            case 'list': {
                const notes = getNotes();
                if (!notes.length) return '📭 No notes saved yet';
                return notes.map((n, i) => `${i + 1}. **${n.title}** (${new Date(n.createdAt).toLocaleDateString()})`).join('\n');
            }
            case 'search': {
                if (!query) return '❌ Need a search query';
                const notes = getNotes();
                const q = query.toLowerCase();
                const found = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
                if (!found.length) return `🔍 No notes matching "${query}"`;
                return found.map(n => `**${n.title}**\n${n.content}`).join('\n\n---\n\n');
            }
            case 'delete': {
                if (!title) return '❌ Need a title to delete';
                const notes = getNotes();
                const idx = notes.findIndex(n => n.title.toLowerCase() === title.toLowerCase());
                if (idx === -1) return `❌ Note "${title}" not found`;
                notes.splice(idx, 1);
                saveNotes(notes);
                return `🗑️ Note deleted: "${title}"`;
            }
            default:
                return `❌ Unknown action: ${action}. Use: save, list, search, delete`;
        }
    },
};

// ── Web Search (DuckDuckGo Instant Answer) ──
export const webSearchSkill = {
    name: 'web_search',
    description: 'Search the web for current information. Returns a summary from DuckDuckGo instant answers.',
    icon: '🔍',
    trigger: '/search ',
    parameters: {
        type: 'object',
        properties: {
            query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
    },
    async execute({ query }) {
        try {
            const resp = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
            const data = await resp.json();

            const results = [];
            if (data.AbstractText) results.push(`**Summary:** ${data.AbstractText}\n*Source: ${data.AbstractSource}*`);
            if (data.Answer) results.push(`**Answer:** ${data.Answer}`);
            if (data.Definition) results.push(`**Definition:** ${data.Definition}`);

            if (data.RelatedTopics?.length) {
                const topics = data.RelatedTopics
                    .filter(t => t.Text)
                    .slice(0, 5)
                    .map(t => `• ${t.Text}`);
                if (topics.length) results.push(`**Related:**\n${topics.join('\n')}`);
            }

            return results.length ? results.join('\n\n') : `No instant results for "${query}". Try rephrasing or use a more specific query.`;
        } catch (err) {
            return `Search error: ${err.message}`;
        }
    },
};

// ── Code Runner (Sandboxed JS via Web Worker) ──
export const codeRunnerSkill = {
    name: 'code_runner',
    description: 'Execute JavaScript code in a secure sandbox. Returns the output. Only JS is supported.',
    icon: '💻',
    trigger: '/run ',
    parameters: {
        type: 'object',
        properties: {
            code: { type: 'string', description: 'JavaScript code to execute' },
        },
        required: ['code'],
    },
    async execute({ code }) {
        return new Promise((resolve) => {
            const workerCode = `
        self.onmessage = function(e) {
          const logs = [];
          const console = { 
            log: (...a) => logs.push(a.map(String).join(' ')),
            error: (...a) => logs.push('[ERROR] ' + a.map(String).join(' ')),
            warn: (...a) => logs.push('[WARN] ' + a.map(String).join(' ')),
          };
          try {
            const result = new Function('console', e.data)(console);
            const output = logs.length ? logs.join('\\n') : String(result);
            self.postMessage({ success: true, output });
          } catch (err) {
            self.postMessage({ success: false, output: logs.join('\\n') + '\\nError: ' + err.message });
          }
        };
      `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            const timeout = setTimeout(() => {
                worker.terminate();
                resolve('⏱️ Execution timed out (5s limit)');
            }, 5000);

            worker.onmessage = (e) => {
                clearTimeout(timeout);
                worker.terminate();
                const icon = e.data.success ? '✅' : '❌';
                resolve(`${icon} Output:\n\`\`\`\n${e.data.output}\n\`\`\``);
            };

            worker.onerror = () => {
                clearTimeout(timeout);
                worker.terminate();
                resolve('❌ Worker execution error');
            };

            worker.postMessage(code);
        });
    },
};

// ── Summarizer ──
export const summarizerSkill = {
    name: 'summarize',
    description: 'Summarize a long piece of text into key points. Provide the text to summarize.',
    icon: '📋',
    trigger: '/summarize ',
    parameters: {
        type: 'object',
        properties: {
            text: { type: 'string', description: 'Text to summarize' },
        },
        required: ['text'],
    },
    execute({ text }) {
        // Local summarization (no AI call — basic extractive summary)
        const sentences = text.replace(/([.!?])\s+/g, '$1\n').split('\n').filter(s => s.trim().length > 10);
        if (sentences.length <= 3) return text;

        // Score sentences by position and length
        const scored = sentences.map((s, i) => ({
            text: s.trim(),
            score: (i === 0 ? 3 : i === sentences.length - 1 ? 2 : 1) + (s.length > 50 ? 1 : 0),
        }));

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)));
        top.sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text));

        return `📋 **Summary** (${top.length} key points from ${sentences.length} sentences):\n\n${top.map((s, i) => `${i + 1}. ${s.text}`).join('\n')}`;
    },
};

/**
 * Register all built-in skills
 */
export function registerBuiltinSkills(registry) {
    registry.register(calculatorSkill);
    registry.register(dateTimeSkill);
    registry.register(notesSkill);
    registry.register(webSearchSkill);
    registry.register(codeRunnerSkill);
}
