/**
 * NexTerm AI — Main Entry Point v3.0
 * macOS terminal UI, professional skill set
 */
import './index.css';
import { ProviderManager } from './providers/provider-manager.js';
import { SkillRegistry } from './skills/skill-registry.js';
import { registerBuiltinSkills } from './skills/builtin-skills.js';
import { registerProSkills } from './skills/pro-skills.js';
import { registerUtilitySkills } from './skills/utility-skills.js';
import { MemoryStore } from './memory/memory-store.js';
import { ContextManager } from './memory/context-manager.js';
import { CryptoManager } from './security/crypto.js';
import { RateLimiter, sanitizeMarkdown, validateInput } from './security/sanitizer.js';
import { PromptBuilder } from './engine/prompt-builder.js';
import { Agent } from './engine/agent.js';
import { parseMarkdown } from './ui/markdown.js';

// Scalability improvements
import { globalErrorBoundary } from './core/error-boundary.js';
import { performanceMonitor } from './core/performance-monitor.js';
import { logger, LogLevel } from './core/logger.js';
import { lazyLoader } from './core/lazy-loader.js';
import { browserSupport } from './core/browser-support.js';
import { VirtualScroller } from './ui/virtual-scroller.js';

// ═══════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════
let providerManager, skillRegistry, memoryStore, contextManager;
let cryptoManager, rateLimiter, promptBuilder, agent;

// Tabs System
let tabs = [];
let activeTabId = null;
let currentTabIndex = 0;

let commandHistory = [];
let historyIndex = -1;
let historySearchMode = false;
let historySearchTerm = '';
let isProcessing = false;
let settings = { theme: 'macos_dark', font: 'fira', streaming: true, shortcuts: true };
let uploadedFiles = [];

// Keyboard shortcuts map
const SHORTCUTS = {
    'Ctrl+t': { action: 'newTab', desc: 'New tab', global: true },
    'Ctrl+w': { action: 'closeTab', desc: 'Close tab', global: true },
    'Ctrl+Tab': { action: 'nextTab', desc: 'Next tab', global: true },
    'Ctrl+Shift+Tab': { action: 'prevTab', desc: 'Previous tab', global: true },
    'Ctrl+1': { action: 'tab1', desc: 'Go to tab 1', global: true },
    'Ctrl+2': { action: 'tab2', desc: 'Go to tab 2', global: true },
    'Ctrl+3': { action: 'tab3', desc: 'Go to tab 3', global: true },
    'Ctrl+4': { action: 'tab4', desc: 'Go to tab 4', global: true },
    'Ctrl+5': { action: 'tab5', desc: 'Go to tab 5', global: true },
    'Ctrl+f': { action: 'searchHistory', desc: 'Search conversation history', global: true },
    'Ctrl+e': { action: 'exportData', desc: 'Export all data', global: true },
    'Ctrl+i': { action: 'importData', desc: 'Import data', global: true },
    'Ctrl+Shift+k': { action: 'showShortcuts', desc: 'Show keyboard shortcuts', global: true },
    'ArrowUp': { action: 'historyUp', desc: 'Previous command', input: true },
    'ArrowDown': { action: 'historyDown', desc: 'Next command', input: true },
    'Ctrl+r': { action: 'historyReverse', desc: 'Reverse history search', input: true },
    'Esc': { action: 'cancel', desc: 'Cancel / Exit mode', global: true }
};

const $ = (s) => document.querySelector(s);

// ═══════════════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════════════
async function boot() {
    const status = $('.boot-status');
    const steps = [
        ['Checking browser support…', () => {
            browserSupport.applyFallbacks();
            if (!browserSupport.isSupported()) {
                appendMsg('warning', 'Your browser has limited support. Some features may not work correctly.', 'SYSTEM');
            }
        }],
        ['Initializing error handling…', () => globalErrorBoundary.init()],
        ['Starting performance monitor…', () => performanceMonitor.start()],
        ['Initializing storage…', initMemory],
        ['Loading security…', initSecurity],
        ['Registering skills…', initSkills],
        ['Connecting providers…', initProviders],
        ['Starting engine…', initAgent],
        ['Loading preferences…', loadSettings],
        ['Initializing virtual scrolling…', initVirtualScrolling],
    ];

    for (const [msg, fn] of steps) {
        status.textContent = msg;
        try { await fn(); } catch (e) { console.error(msg, e); }
        await sleep(200);
    }

    await sleep(400);
    $('#boot-screen').classList.add('hidden');
    $('#terminal-window').classList.remove('hidden');
    
    // Initialize tabs system
    await createNewTab('Session');
    
    showWelcome();
    updateStatus();
    $('#terminal-input').focus();
    setupEvents();
    setupSelectionCopy();
    setupAccessibility();
}

// ═══════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════
async function initMemory() {
    memoryStore = new MemoryStore();
    await memoryStore.init();
    contextManager = new ContextManager(memoryStore);
    await contextManager.newConversation('Session');
}

async function initSecurity() {
    cryptoManager = new CryptoManager();
    rateLimiter = new RateLimiter(30, 60000);
    if (!cryptoManager.isSetUp()) await cryptoManager.deriveKey('nexterm_default');
}

function initSkills() {
    skillRegistry = new SkillRegistry();
    registerBuiltinSkills(skillRegistry);
    registerUtilitySkills(skillRegistry);
    registerProSkills(skillRegistry);
}

async function initProviders() {
    providerManager = new ProviderManager();
    const keys = await memoryStore.getSetting('api_keys', {});
    for (const [id, enc] of Object.entries(keys)) {
        try {
            const key = cryptoManager.isUnlocked ? await cryptoManager.decrypt(enc) : enc;
            providerManager.setApiKey(id, key);
        } catch { }
    }
    const cfg = await memoryStore.getSetting('provider_config', {});
    providerManager.loadConfig(cfg);
    updateProviderBadge();
}

function initAgent() {
    promptBuilder = new PromptBuilder(skillRegistry);
    agent = new Agent({ providerManager, skillRegistry, contextManager, promptBuilder });

    agent.onThinking = (i) => { if (i === 1) showThinking(); };
    agent.onChunk = () => { };
    agent.onToolCall = (tc) => appendMsg('skill', `Using **${tc.name}**…`, 'TOOL');
    agent.onToolResult = (n, r) => {
        if (!r.success) appendMsg('error', r.error, 'ERROR');
    };
    agent.onError = (e) => { hideThinking(); appendMsg('error', e, 'ERROR'); };
}

let virtualScroller = null;
function initVirtualScrolling() {
    const outputContainer = $('#output-container');
    if (!outputContainer) return;

    virtualScroller = new VirtualScroller(outputContainer, {
        itemHeight: 28,
        bufferSize: 15,
        renderItem: (item) => {
            const el = createMsgEl(item.type, item.content, item.label);
            el.style.position = 'static';
            return el;
        }
    });
}

async function loadSettings() {
    const s = await memoryStore.getSetting('app_settings', {});
    settings = { ...settings, ...s };
    // Theme already initialized synchronously in <head> to prevent white screen
    // Only update if changed after initial load
    if (document.documentElement.getAttribute('data-theme') !== settings.theme && settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }
    if (document.documentElement.getAttribute('data-font') !== settings.font && settings.font) {
        document.documentElement.setAttribute('data-font', settings.font);
    }
}

// ═══════════════════════════════════════════════════════════
// Events
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// Advanced UX Features Implementation
// ═══════════════════════════════════════════════════════════
let autocompleteState = { active: false, matches: [], index: 0, originalInput: '' };
let suggestionsState = { active: false, items: [], selectedIndex: 0 };

// 1. Smart Command Autocomplete
function getAutocompleteMatches(input) {
    if (!input.startsWith('/')) return [];
    const query = input.toLowerCase().slice(1);
    const commands = [
        '/help', '/clear', '/new', '/history', '/providers',
        '/explain', '/debug', '/review', '/sql', '/regex', '/api',
        '/solve', '/study', '/flashcards', '/quiz', '/research', '/eli5',
        '/essay', '/rewrite', '/seo', '/email', '/proofread',
        '/compare', '/summarize', '/translate',
        '/calc', '/json', '/hash', '/password', '/base64', '/convert', '/wc', '/uuid', '/diff', '/time', '/url', '/lorem', '/color'
    ];
    return commands.filter(cmd => cmd.startsWith(`/${query}`));
}

function handleTabCompletion(e) {
    const input = $('#terminal-input');
    if (!autocompleteState.active) {
        const matches = getAutocompleteMatches(input.value);
        if (matches.length === 0) return;
        autocompleteState = {
            active: true,
            matches,
            index: 0,
            originalInput: input.value
        };
        e.preventDefault();
        input.value = matches[0];
        autoResize();
    } else {
        e.preventDefault();
        autocompleteState.index = (autocompleteState.index + 1) % autocompleteState.matches.length;
        input.value = autocompleteState.matches[autocompleteState.index];
        autoResize();
    }
}

function cancelAutocomplete() {
    autocompleteState = { active: false, matches: [], index: 0, originalInput: '' };
    hideSuggestions();
}

// 2. Live Command Suggestions
function updateSuggestions() {
    const input = $('#terminal-input');
    const value = input.value.trim();
    
    if (value.length < 2 || value.includes(' ')) {
        hideSuggestions();
        return;
    }
    
    const matches = getAutocompleteMatches(value);
    if (matches.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsState.items = matches;
    suggestionsState.selectedIndex = 0;
    renderSuggestions();
}

function renderSuggestions() {
    let el = $('#suggestions-dropdown');
    if (!el) {
        el = document.createElement('div');
        el.id = 'suggestions-dropdown';
        el.className = 'suggestions-dropdown';
        el.setAttribute('role', 'listbox');
        el.setAttribute('aria-label', 'Command suggestions');
        $('#terminal-input').parentElement.appendChild(el);
    }
    
    el.innerHTML = suggestionsState.items.map((item, i) => `
        <div class="suggestion-item ${i === suggestionsState.selectedIndex ? 'selected' : ''}" 
             role="option" 
             aria-selected="${i === suggestionsState.selectedIndex}"
             data-index="${i}">
            ${item}
        </div>
    `).join('');
    
    el.classList.remove('hidden');
    
    el.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            $('#terminal-input').value = item.textContent;
            hideSuggestions();
            autoResize();
            $('#terminal-input').focus();
        });
    });
}

function hideSuggestions() {
    const el = $('#suggestions-dropdown');
    if (el) el.classList.add('hidden');
    suggestionsState = { active: false, items: [], selectedIndex: 0 };
}

function navigateSuggestions(direction) {
    if (suggestionsState.items.length === 0) return false;
    suggestionsState.selectedIndex = (suggestionsState.selectedIndex + direction + suggestionsState.items.length) % suggestionsState.items.length;
    renderSuggestions();
    return true;
}

// 3. Context Aware Help Hints
function showHelpHint(text) {
    let hint = $('#help-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'help-hint';
        hint.className = 'help-hint';
        hint.setAttribute('aria-live', 'polite');
        $('#terminal-input').parentElement.appendChild(hint);
    }
    hint.textContent = text;
    hint.classList.remove('hidden');
}

function hideHelpHint() {
    const hint = $('#help-hint');
    if (hint) hint.classList.add('hidden');
}

function updateHelpHint() {
    const input = $('#terminal-input').value.trim();
    if (input === '/') {
        showHelpHint('Start typing a command, press Tab to autocomplete, Arrow keys to navigate suggestions');
    } else if (input.startsWith('/explain')) {
        showHelpHint('Paste code after /explain to get detailed explanation');
    } else if (input.startsWith('/debug')) {
        showHelpHint('Paste error or broken code to debug issues');
    } else if (input.startsWith('/review')) {
        showHelpHint('Submit code for security and best practices review');
    } else {
        hideHelpHint();
    }
}

// 5. Smart Paste Handling
function handleSmartPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    
    // Detect and format code blocks
    const hasMultilineCode = text.includes('\n') && (text.length > 80 || /[{(]=/.test(text));
    const cleaned = text.trim();
    
    if (hasMultilineCode) {
        const input = $('#terminal-input');
        if (input.value.trim() === '' || input.value.trim() === '/explain' || input.value.trim() === '/debug' || input.value.trim() === '/review') {
            const prefix = input.value.trim() ? input.value.trim() + ' ' : '';
            input.value = `${prefix}\`\`\`\n${cleaned}\n\`\`\``;
        } else {
            input.value = cleaned;
        }
    } else {
        $('#terminal-input').value += cleaned;
    }
    
    autoResize();
    cancelAutocomplete();
}

// 6. Improved Input Auto-Resize
function autoResize() {
    const el = $('#terminal-input');
    el.style.height = 'auto';
    const maxHeight = window.innerHeight > 768 ? 240 : 120;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
}

// 7. Selection Copy Improvements
function setupSelectionCopy() {
    document.addEventListener('copy', (e) => {
        const selection = window.getSelection();
        if (!selection.toString()) return;
        
        // Clean up copied text from terminal messages
        let text = selection.toString();
        // Remove message labels that accidentally get selected
        text = text.replace(/^(YOU|NEXTERM|SYSTEM|ERROR|TOOL)\s+/gm, '');
        // Fix line breaks
        text = text.replace(/\n{3,}/g, '\n\n');
        
        e.clipboardData.setData('text/plain', text.trim());
        e.preventDefault();
    });
    
    // Double click to select code blocks
    $('#output-container').addEventListener('dblclick', (e) => {
        if (e.target.tagName === 'CODE' || e.target.closest('pre')) {
            const code = e.target.closest('pre') || e.target;
            const range = document.createRange();
            range.selectNodeContents(code);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
}

// Accessibility helpers
function setupAccessibility() {
    // Add ARIA labels
    $('#terminal-input').setAttribute('aria-label', 'Terminal command input');
    $('#terminal-input').setAttribute('aria-autocomplete', 'list');
    $('#terminal-input').setAttribute('aria-describedby', 'help-hint');
    $('#btn-send').setAttribute('aria-label', 'Send command');
    $('#output-container').setAttribute('aria-live', 'polite');
    $('#output-container').setAttribute('role', 'log');
    
    // Announce messages for screen readers
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('msg')) {
                    node.setAttribute('aria-atomic', 'true');
                }
            });
        });
    });
    
    observer.observe($('#output-container'), { childList: true });
}

function setupEvents() {
    const input = $('#terminal-input');
    input.addEventListener('keydown', onKeydown);
    input.addEventListener('input', (e) => {
        autoResize();
        updateSuggestions();
        updateHelpHint();
        if (!e.inputType?.startsWith('history')) cancelAutocomplete();
    });
    input.addEventListener('paste', handleSmartPaste);
    input.addEventListener('blur', () => setTimeout(hideSuggestions, 200));
    $('#btn-send').addEventListener('click', handleSend);

    $('#btn-settings').addEventListener('click', () => togglePanel('settings'));
    $('#btn-skills').addEventListener('click', () => togglePanel('skills'));
    $('#btn-memory').addEventListener('click', () => togglePanel('memory'));
    $('#btn-close-settings').addEventListener('click', () => togglePanel('settings'));
    $('#btn-close-skills').addEventListener('click', () => togglePanel('skills'));
    $('#btn-close-memory').addEventListener('click', () => togglePanel('memory'));

    const fileUpload = $('#file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', async (e) => {
            const files = e.target.files;
            for (const file of files) {
                if (file.size > 1024 * 1024 * 5) {
                    appendMsg('error', `File ${file.name} is too large (max 5MB).`, 'ERROR');
                    continue;
                }
                try {
                    const text = await file.text();
                    uploadedFiles.push({ name: file.name, text });
                } catch (err) {
                    appendMsg('error', `Failed to read ${file.name}. Only text-based files are supported.`, 'ERROR');
                }
            }
            renderFilePreview();
            e.target.value = '';
        });
    }
    
    // Hidden import file input
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-file';
    importInput.accept = '.json';
    importInput.className = 'hidden';
    importInput.addEventListener('change', async (e) => {
        if (e.target.files[0]) await importFullData(e.target.files[0]);
        e.target.value = '';
    });
    document.body.appendChild(importInput);

    document.querySelectorAll('.panel-backdrop').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.panel-overlay').forEach(p => p.classList.add('hidden'));
        });
    });
    
    // Global keyboard handler
    document.addEventListener('keydown', handleShortcut);
}

function onKeydown(e) {
    if (handleShortcut(e)) return;
    
    if (e.key === 'Tab' && !e.shiftKey) {
        handleTabCompletion(e);
        return;
    }
    
    if (e.key === 'Escape') {
        cancelAutocomplete();
        hideSuggestions();
        hideHelpHint();
        return;
    }
    
    if (e.key === 'ArrowDown' && suggestionsState.items.length > 0) {
        e.preventDefault();
        navigateSuggestions(1);
        return;
    }
    
    if (e.key === 'ArrowUp' && suggestionsState.items.length > 0) {
        e.preventDefault();
        navigateSuggestions(-1);
        return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) { 
        if (suggestionsState.items.length > 0 && suggestionsState.selectedIndex >= 0) {
            e.preventDefault();
            $('#terminal-input').value = suggestionsState.items[suggestionsState.selectedIndex];
            hideSuggestions();
            autoResize();
            return;
        }
        e.preventDefault(); 
        handleSend(); 
    }
    
    if (e.key === 'ArrowUp' && !e.ctrlKey) {
        e.preventDefault();
        navigateHistory(-1);
    }
    if (e.key === 'ArrowDown' && !e.ctrlKey) {
        e.preventDefault();
        navigateHistory(1);
    }
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        historySearchTerm = $('#terminal-input').value;
        historyIndex = -1;
        navigateHistory(-1);
    }
}


function renderFilePreview() {
    const preview = $('#file-preview');
    if (!preview) return;
    if (uploadedFiles.length === 0) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
        return;
    }
    preview.classList.remove('hidden');
    preview.innerHTML = uploadedFiles.map((f, i) => `
        <div class="file-chip">
            <span class="file-chip-name">${f.name}</span>
            <span class="file-chip-remove" data-index="${i}">✕</span>
        </div>
    `).join('');

    preview.querySelectorAll('.file-chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            uploadedFiles.splice(idx, 1);
            renderFilePreview();
        });
    });
}

// ═══════════════════════════════════════════════════════════
// Send / Process
// ═══════════════════════════════════════════════════════════
async function handleSend() {
    const input = $('#terminal-input');
    const text = input.value.trim();
    if (!text || isProcessing) return;

    const v = validateInput(text);
    if (!v.valid) { appendMsg('error', v.reason, 'ERROR'); return; }
    if (!rateLimiter.canRequest()) {
        appendMsg('error', `Rate limited. Wait ${Math.ceil(rateLimiter.retryAfter() / 1000)}s.`, 'LIMIT');
        return;
    }

    commandHistory.push(text);
    historyIndex = -1;
    input.value = '';
    input.style.height = 'auto';

    let promptText = text;
    if (uploadedFiles.length > 0) {
        const fileContext = uploadedFiles.map(f => `\n\n[File: ${f.name}]\n\`\`\`\n${f.text}\n\`\`\``).join('');
        promptText += fileContext;
        appendMsg('user', `${text} *(+${uploadedFiles.length} file(s))*`, 'YOU');
        uploadedFiles = [];
        renderFilePreview();
    } else {
        appendMsg('user', text, 'YOU');
    }

    if (text.startsWith('/')) { await handleCommand(text); return; }

    if (!providerManager.getActive()) {
        appendMsg('system', 'No AI provider configured. Open Settings to add an API key.', 'SYSTEM');
        return;
    }

    isProcessing = true;
    $('#btn-send').disabled = true;
    rateLimiter.record();

    try {
        showThinking();
        let responseDiv = null;
        let fullContent = '';

        agent.onChunk = (chunk) => {
            hideThinking();
            if (!responseDiv) {
                responseDiv = createMsgEl('ai', '', 'NEXTERM');
                $('#output-container').appendChild(responseDiv);
            }
            fullContent += chunk;
            const el = responseDiv.querySelector('.msg-content');
            if (el) el.innerHTML = parseMarkdown(sanitizeMarkdown(fullContent));
            scrollBottom();
        };

        await agent.process(promptText);
        agent.onChunk = () => { };
        hideThinking();
        updateStatus();

    } catch (err) {
        hideThinking();
        appendMsg('error', err.message, 'ERROR');
    } finally {
        isProcessing = false;
        $('#btn-send').disabled = false;
        $('#terminal-input').focus();
    }
}

// ═══════════════════════════════════════════════════════════
// Commands
// ═══════════════════════════════════════════════════════════
async function handleCommand(text) {
    const cmd = text.toLowerCase();

    if (cmd === '/help') {
        appendMsg('system', `## Commands

**System:**
\`/help\` · \`/clear\` · \`/new\` · \`/history\` · \`/providers\`

**Engineering:**
\`/explain <code>\` · \`/debug <code>\` · \`/review <code>\`
\`/sql <desc>\` · \`/regex <desc>\` · \`/api <desc>\`

**Study:**
\`/solve <problem>\` · \`/study <topic>\` · \`/flashcards <topic>\`
\`/quiz <topic>\` · \`/research <topic>\` · \`/eli5 <concept>\`

**Writing:**
\`/essay <topic>\` · \`/rewrite <text>\` · \`/seo <topic>\`
\`/email <context>\` · \`/proofread <text>\`

**General:**
\`/compare <A vs B>\` · \`/summarize <text>\` · \`/translate <text> to <lang>\`

**Utilities:**
\`/calc\` · \`/json\` · \`/hash\` · \`/password\` · \`/base64\`
\`/convert\` · \`/wc\` · \`/uuid\` · \`/diff\` · \`/time\`
\`/url\` · \`/lorem\` · \`/color\``, 'HELP');
        return;
    }

    if (cmd === '/clear') {
        $('#output-container').innerHTML = '';
        appendMsg('system', 'Terminal cleared.', 'SYSTEM');
        return;
    }

    if (cmd === '/new') {
        await contextManager.newConversation();
        $('#output-container').innerHTML = '';
        appendMsg('system', 'New session started.', 'SYSTEM');
        updateStatus();
        return;
    }

    if (cmd === '/history') {
        const convos = await memoryStore.listConversations();
        if (!convos.length) { appendMsg('system', 'No history.', 'SYSTEM'); return; }
        const list = convos.slice(-10).reverse()
            .map((c, i) => `${i + 1}. **${c.title}** — ${c.messageCount} msgs — ${new Date(c.updatedAt).toLocaleDateString()}`)
            .join('\n');
        appendMsg('system', `## History\n${list}`, 'SYSTEM');
        return;
    }

    if (cmd === '/providers') {
        const st = providerManager.getStatus();
        const lines = st.map(s => {
            const dot = s.active ? '●' : s.configured ? '○' : '·';
            return `${dot} **${s.name}** — ${s.configured ? 'configured' : 'not configured'}${s.active ? ' ← active' : ''}`;
        }).join('\n');
        appendMsg('system', `## Providers\n${lines}`, 'SYSTEM');
        return;
    }

    // Try skill slash commands
    const result = await agent.handleSlashCommand(text);
    if (result) {
        if (result.isAIPowered) {
            // AI-powered skill
            if (!providerManager.getActive()) {
                appendMsg('system', 'This skill requires an AI provider. Add an API key in Settings.', 'SYSTEM');
                return;
            }

            isProcessing = true;
            $('#btn-send').disabled = true;
            showThinking();

            try {
                let responseDiv = null;
                let fullContent = '';

                agent.onChunk = (chunk) => {
                    hideThinking();
                    if (!responseDiv) {
                        responseDiv = createMsgEl('ai', '', `${result.skillIcon} ${result.skillName.toUpperCase()}`);
                        $('#output-container').appendChild(responseDiv);
                    }
                    fullContent += chunk;
                    const el = responseDiv.querySelector('.msg-content');
                    if (el) el.innerHTML = parseMarkdown(sanitizeMarkdown(fullContent));
                    scrollBottom();
                };

                await agent._processAISkill(result.promptData);
                agent.onChunk = () => { };
                hideThinking();
            } catch (err) {
                hideThinking();
                appendMsg('error', err.message, 'ERROR');
            } finally {
                isProcessing = false;
                $('#btn-send').disabled = false;
            }
        } else {
            appendMsg('skill', result.result, `${result.skillIcon} ${result.skillName.toUpperCase()}`);
        }
        return;
    }

    appendMsg('error', `Unknown command: \`${text}\`. Type \`/help\`.`, 'ERROR');
}

// ═══════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════
function createMsgEl(type, content, label) {
    const div = document.createElement('div');
    div.className = `msg msg-${type}`;

    const lbl = document.createElement('div');
    lbl.className = 'msg-label';
    lbl.textContent = label;

    const cnt = document.createElement('div');
    cnt.className = 'msg-content';
    cnt.innerHTML = parseMarkdown(sanitizeMarkdown(content));

    div.appendChild(lbl);
    div.appendChild(cnt);
    return div;
}

function appendMsg(type, content, label) {
    const el = createMsgEl(type, content, label);
    $('#output-container').appendChild(el);
    scrollBottom();
    return el;
}

function showThinking() {
    hideThinking();
    const d = document.createElement('div');
    d.id = 'thinking';
    d.className = 'thinking-indicator';
    d.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div><span>Thinking…</span>';
    $('#output-container').appendChild(d);
    scrollBottom();
}

function hideThinking() { const el = $('#thinking'); if (el) el.remove(); }

function scrollBottom() {
    const el = $('#terminal-output');
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
}

function showWelcome() {
    const skills = skillRegistry.getSkillList();
    const aiCount = skills.filter(s => s.isAIPowered).length;
    const utilCount = skills.length - aiCount;

    appendMsg('system', `## NexTerm AI

**${aiCount} AI-powered skills** · **${utilCount} offline utilities** · **5 AI providers**

Get started:
1. Open **Settings** → add an API key
2. Type anything to chat
3. Type \`/help\` for all commands

AI skills: code explain, debug, review, SQL gen, math solver, study notes, flashcards, quiz, research, essay, rewrite, SEO, email, proofread, translate, and more.`, 'SYSTEM');
}

function updateProviderBadge() {
    const p = providerManager.getActive();
    const badge = $('#provider-badge');
    const mBadge = $('#model-badge');
    if (p) {
        badge.textContent = p.name.toUpperCase();
        mBadge.textContent = providerManager.getActiveModel() || '';

        const dot = $('#status-connection .status-dot');
        const txt = $('#status-connection span:last-child');
        dot.className = 'status-dot online';
        txt.textContent = p.name;
    } else {
        badge.textContent = 'NO PROVIDER';
        mBadge.textContent = '';
    }
}

function updateStatus() {
    const msgCount = contextManager.getMessageCount();
    const skillCount = skillRegistry.getSkillList().length;
    $('#status-memory').textContent = `${msgCount} messages`;
    $('#status-skills').textContent = `${skillCount} skills`;
    const title = typeof contextManager.getTitle === 'function' ? contextManager.getTitle() : 'Session';
    $('#tab-label').textContent = title || 'Session';
}

// ═══════════════════════════════════════════════════════════
// Panels
// ═══════════════════════════════════════════════════════════
function togglePanel(name) {
    const panel = $(`#${name}-panel`);
    const hidden = panel.classList.contains('hidden');
    document.querySelectorAll('.panel-overlay').forEach(p => p.classList.add('hidden'));
    if (hidden) {
        panel.classList.remove('hidden');
        if (name === 'settings') renderSettings();
        if (name === 'skills') renderSkills();
        if (name === 'memory') renderMemory();
    }
}

function renderSettings() {
    const body = $('#settings-body');
    const st = providerManager.getStatus();

    body.innerHTML = `
    <div class="setting-section">
      <div class="setting-section-title">Providers</div>
      ${st.map(s => `
        <div class="setting-row">
          <label class="setting-label">${s.configured ? '●' : '○'} ${s.name}${s.active ? ' ← active' : ''}</label>
          <input type="password" class="setting-input provider-key" data-provider="${s.id}"
            placeholder="API key…" value="${s.configured ? '••••••••' : ''}" />
        </div>
      `).join('')}
      <div class="setting-row">
        <label class="setting-label">Active Provider</label>
        <select class="setting-select" id="sel-provider">
          <option value="">Auto</option>
          ${st.filter(s => s.configured).map(s =>
        `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`
    ).join('')}
        </select>
      </div>
      <div class="setting-row" id="model-row">
        <label class="setting-label">Model</label>
        <select class="setting-select" id="sel-model">
          ${(() => {
            const a = st.find(s => s.active);
            if (!a) return '<option>Select provider first</option>';
            return a.models.map(m =>
                `<option value="${m.id}" ${m.id === providerManager.getActiveModel() ? 'selected' : ''}>${m.name}</option>`
            ).join('');
        })()}
        </select>
      </div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Theme & Typography</div>
      <div class="setting-row">
        <label class="setting-label">Theme</label>
        <select class="setting-select" id="sel-theme">
          <option value="macos_dark" ${settings.theme === 'macos_dark' ? 'selected' : ''}>macOS Dark</option>
          <option value="dracula" ${settings.theme === 'dracula' ? 'selected' : ''}>Dracula</option>
          <option value="matrix" ${settings.theme === 'matrix' ? 'selected' : ''}>Terminal Matrix</option>
          <option value="nord" ${settings.theme === 'nord' ? 'selected' : ''}>Nord Frost</option>
        </select>
      </div>
      <div class="setting-row">
        <label class="setting-label">Terminal Font</label>
        <select class="setting-select" id="sel-font">
          <option value="fira" ${settings.font === 'fira' ? 'selected' : ''}>Fira Code</option>
          <option value="jetbrains" ${settings.font === 'jetbrains' ? 'selected' : ''}>JetBrains Mono</option>
          <option value="outfit" ${settings.font === 'outfit' ? 'selected' : ''}>Outfit (Modern UI)</option>
        </select>
      </div>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Security</div>
      <div class="setting-row">
        <label class="setting-label">Encryption PIN</label>
        <input type="password" class="setting-input" id="inp-pin" placeholder="PIN to protect API keys…" />
      </div>
      <button class="setting-btn" id="btn-pin">Set PIN</button>
    </div>

    <div class="setting-section">
      <div class="setting-section-title">Data</div>
      <button class="setting-btn" id="btn-export">Export Settings</button>
      <button class="setting-btn" id="btn-export-full" style="margin-top:6px">Export Full Backup</button>
      <button class="setting-btn" id="btn-import" style="margin-top:6px">Import Backup</button>
      <button class="setting-btn danger" id="btn-clearall" style="margin-top:12px">Clear All Data</button>
    </div>
  `;

    // Events
    body.querySelectorAll('.provider-key').forEach(inp => {
        inp.addEventListener('change', async (e) => {
            const id = e.target.dataset.provider;
            const key = e.target.value;
            if (!key || key === '••••••••') return;
            providerManager.setApiKey(id, key);
            try {
                const enc = cryptoManager.isUnlocked ? await cryptoManager.encrypt(key) : key;
                const saved = await memoryStore.getSetting('api_keys', {});
                saved[id] = enc;
                await memoryStore.setSetting('api_keys', saved);
            } catch { }
            if (!providerManager.getActive()) providerManager.setActive(id);
            updateProviderBadge();
            appendMsg('system', `${id} API key saved.`, 'SYSTEM');
            renderSettings();
        });
    });

    const selProv = body.querySelector('#sel-provider');
    if (selProv) selProv.addEventListener('change', async (e) => {
        if (e.target.value) {
            try { providerManager.setActive(e.target.value); updateProviderBadge(); await saveProviderConfig(); renderSettings(); }
            catch (err) { appendMsg('error', err.message, 'ERROR'); }
        }
    });

    const selModel = body.querySelector('#sel-model');
    if (selModel) selModel.addEventListener('change', async (e) => {
        providerManager.activeModel = e.target.value;
        updateProviderBadge();
        await saveProviderConfig();
    });

    const selTheme = body.querySelector('#sel-theme');
    if (selTheme) selTheme.addEventListener('change', async (e) => {
        settings.theme = e.target.value;
        document.documentElement.setAttribute('data-theme', settings.theme);
        await memoryStore.setSetting('app_settings', settings);
    });

    const selFont = body.querySelector('#sel-font');
    if (selFont) selFont.addEventListener('change', async (e) => {
        settings.font = e.target.value;
        document.documentElement.setAttribute('data-font', settings.font);
        await memoryStore.setSetting('app_settings', settings);
    });

    const btnPin = body.querySelector('#btn-pin');
    if (btnPin) btnPin.addEventListener('click', async () => {
        const pin = body.querySelector('#inp-pin').value;
        if (pin.length < 4) { appendMsg('error', 'PIN must be ≥ 4 chars.', 'ERROR'); return; }
        await cryptoManager.deriveKey(pin);
        const st2 = providerManager.getStatus();
        const reEnc = {};
        for (const s of st2) {
            if (s.configured) {
                const p = providerManager.providers.get(s.id);
                reEnc[s.id] = await cryptoManager.encrypt(p.apiKey);
            }
        }
        await memoryStore.setSetting('api_keys', reEnc);
        appendMsg('system', 'PIN set. Keys re-encrypted.', 'SYSTEM');
        body.querySelector('#inp-pin').value = '';
    });

    const btnExport = body.querySelector('#btn-export');
    if (btnExport) btnExport.addEventListener('click', () => {
        const d = { settings, providerConfig: providerManager.exportConfig(), exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'nexterm_settings.json'; a.click();
        URL.revokeObjectURL(url);
    });
    
    const btnExportFull = body.querySelector('#btn-export-full');
    if (btnExportFull) btnExportFull.addEventListener('click', exportFullData);
    
    const btnImport = body.querySelector('#btn-import');
    if (btnImport) btnImport.addEventListener('click', () => $('#import-file').click());

    const btnClear = body.querySelector('#btn-clearall');
    if (btnClear) btnClear.addEventListener('click', async () => {
        if (confirm('Delete ALL data (conversations, keys, settings)?')) {
            await memoryStore.clearAll();
            localStorage.clear();
            appendMsg('system', 'All data cleared. Reload to restart.', 'SYSTEM');
        }
    });
}

function renderSkills() {
    const body = $('#skills-body');
    const skills = skillRegistry.getSkillList();

    const aiSkills = skills.filter(s => s.isAIPowered);
    const offlineSkills = skills.filter(s => !s.isAIPowered);

    body.innerHTML = `
    <p style="font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:16px">
      AI skills route through your active provider. Offline skills work without internet.
    </p>

    <div class="setting-section-title">AI-Powered (${aiSkills.length})</div>
    ${aiSkills.map(s => `
      <div class="skill-card">
        <div class="skill-card-header">
          <span>${s.icon}</span>
          <span class="skill-card-name">${s.name}</span>
          <span class="skill-card-tag ai">AI</span>
          ${s.trigger ? `<span class="skill-card-badge">${s.trigger.trim()}</span>` : ''}
        </div>
        <div class="skill-card-desc">${s.description}</div>
      </div>
    `).join('')}

    <div class="setting-section-title" style="margin-top:20px">Offline Utilities (${offlineSkills.length})</div>
    ${offlineSkills.map(s => `
      <div class="skill-card">
        <div class="skill-card-header">
          <span>${s.icon}</span>
          <span class="skill-card-name">${s.name}</span>
          <span class="skill-card-tag offline">LOCAL</span>
          ${s.trigger ? `<span class="skill-card-badge">${s.trigger.trim()}</span>` : ''}
        </div>
        <div class="skill-card-desc">${s.description}</div>
      </div>
    `).join('')}
  `;
}

async function renderMemory() {
    const body = $('#memory-body');
    const stats = await memoryStore.getStats();
    const convos = await memoryStore.listConversations();

    body.innerHTML = `
    <div class="memory-stats">
      <div class="memory-stat"><div class="memory-stat-value">${stats.conversations}</div><div class="memory-stat-label">Sessions</div></div>
      <div class="memory-stat"><div class="memory-stat-value">${stats.messages}</div><div class="memory-stat-label">Messages</div></div>
      <div class="memory-stat"><div class="memory-stat-value">${stats.knowledge}</div><div class="memory-stat-label">Facts</div></div>
    </div>

    <div class="setting-section-title">Recent Sessions</div>
    ${convos.length === 0 ? '<p style="color:var(--text-muted);font-size:var(--fs-xs)">No sessions yet.</p>' :
            convos.slice(-10).reverse().map(c => `
        <div class="memory-item" data-id="${c.id}">
          <div class="memory-item-header">
            <span class="memory-item-title">${c.title}</span>
            <span class="memory-item-date">${new Date(c.updatedAt).toLocaleDateString()}</span>
          </div>
          <div class="memory-item-preview">${c.messageCount} messages</div>
        </div>
      `).join('')}

    <div style="margin-top:20px">
      <button class="setting-btn" id="btn-newconv">New Session</button>
      <button class="setting-btn danger" id="btn-clearmem" style="margin-top:6px">Clear Memory</button>
    </div>
  `;

    body.querySelectorAll('.memory-item').forEach(el => {
        el.addEventListener('click', async () => {
            const id = el.dataset.id;
            await contextManager.loadConversation(id);
            $('#output-container').innerHTML = '';
            for (const msg of contextManager.messageHistory) {
                const type = msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'ai' : 'system';
                const label = msg.role === 'user' ? 'YOU' : msg.role === 'assistant' ? 'NEXTERM' : 'SYSTEM';
                appendMsg(type, msg.content, label);
            }
            togglePanel('memory');
            updateStatus();
        });
    });

    const btnNew = body.querySelector('#btn-newconv');
    if (btnNew) btnNew.addEventListener('click', async () => {
        await contextManager.newConversation();
        $('#output-container').innerHTML = '';
        togglePanel('memory');
        appendMsg('system', 'New session started.', 'SYSTEM');
        updateStatus();
    });

    const btnClear = body.querySelector('#btn-clearmem');
    if (btnClear) btnClear.addEventListener('click', async () => {
        if (confirm('Delete all history?')) {
            await memoryStore.clearAll();
            await contextManager.newConversation();
            $('#output-container').innerHTML = '';
            togglePanel('memory');
            updateStatus();
        }
    });
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
async function saveProviderConfig() {
    await memoryStore.setSetting('provider_config', providerManager.exportConfig());
}

// ═══════════════════════════════════════════════════════════
// Tabs System
// ═══════════════════════════════════════════════════════════
async function createNewTab(title = null) {
    const tabId = crypto.randomUUID();
    const newContext = new ContextManager(memoryStore);
    await newContext.newConversation(title || `Session ${tabs.length + 1}`);
    
    const tab = {
        id: tabId,
        title: title || `Session ${tabs.length + 1}`,
        context: newContext,
        messages: [],
        createdAt: Date.now()
    };
    
    tabs.push(tab);
    renderTabs();
    switchToTab(tabId);
    return tab;
}

function switchToTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    // Save current tab state
    if (activeTabId) {
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab) {
            currentTab.messages = Array.from($('#output-container').children);
        }
    }
    
    activeTabId = tabId;
    currentTabIndex = tabs.indexOf(tab);
    contextManager = tab.context;
    
    // Restore tab content
    $('#output-container').innerHTML = '';
    tab.messages.forEach(msg => $('#output-container').appendChild(msg.cloneNode(true)));
    
    agent.contextManager = contextManager;
    renderTabs();
    updateStatus();
    scrollBottom();
}

function closeTab(tabId) {
    if (tabs.length <= 1) return;
    
    const index = tabs.findIndex(t => t.id === tabId);
    tabs.splice(index, 1);
    
    if (activeTabId === tabId) {
        switchToTab(tabs[Math.min(index, tabs.length - 1)].id);
    }
    
    renderTabs();
}

function renderTabs() {
    const tabBar = $('.tab-bar');
    tabBar.querySelectorAll('.tab').forEach(t => t.remove());
    
    const tabBadges = $('.tab-badges');
    
    tabs.forEach((tab, idx) => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
        tabEl.dataset.tabId = tab.id;
        tabEl.innerHTML = `
            <span class="tab-icon">●</span>
            <span class="tab-label">${tab.title}</span>
            <span class="tab-close">✕</span>
        `;
        
        tabEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                closeTab(tab.id);
            } else {
                switchToTab(tab.id);
            }
        });
        
        tabBar.insertBefore(tabEl, tabBadges);
    });
    
    // Add new tab button
    const newTabBtn = document.createElement('div');
    newTabBtn.className = 'tab-add';
    newTabBtn.textContent = '+';
    newTabBtn.title = 'New Tab (Ctrl+T)';
    newTabBtn.addEventListener('click', () => createNewTab());
    tabBar.insertBefore(newTabBtn, tabBadges);
}

// ═══════════════════════════════════════════════════════════
// Search & History
// ═══════════════════════════════════════════════════════════
async function searchConversations(query) {
    if (!query.trim()) return [];
    
    const convos = await memoryStore.listConversations();
    const results = [];
    
    for (const c of convos) {
        const msgs = await memoryStore.getConversationMessages(c.id);
        const matches = msgs.filter(m => 
            m.content.toLowerCase().includes(query.toLowerCase())
        );
        if (matches.length > 0) {
            results.push({ conversation: c, matches });
        }
    }
    
    return results;
}

function toggleHistorySearch() {
    historySearchMode = !historySearchMode;
    
    let searchBar = $('#history-search-bar');
    if (historySearchMode) {
        if (!searchBar) {
            searchBar = document.createElement('div');
            searchBar.id = 'history-search-bar';
            searchBar.className = 'search-bar';
            searchBar.innerHTML = `
                <input type="text" id="search-input" placeholder="Search history… (Esc to close)" autocomplete="off" />
                <span class="search-count"></span>
            `;
            $('#terminal-output').before(searchBar);
            
            $('#search-input').addEventListener('input', async (e) => {
                const results = await searchConversations(e.target.value);
                $('.search-count').textContent = `${results.length} results`;
            });
            
            $('#search-input').focus();
        }
    } else {
        if (searchBar) searchBar.remove();
    }
}

// ═══════════════════════════════════════════════════════════
// Import / Export
// ═══════════════════════════════════════════════════════════
async function exportFullData() {
    const convos = await memoryStore.listConversations();
    const fullConvos = {};
    for (const c of convos) {
        fullConvos[c.id] = {
            ...c,
            messages: await memoryStore.getConversationMessages(c.id)
        };
    }
    
    const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        apiKeys: await memoryStore.getSetting('api_keys', {}),
        providerConfig: providerManager.exportConfig(),
        conversations: fullConvos
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nexterm_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function importFullData(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.settings) {
            settings = { ...settings, ...data.settings };
            await memoryStore.setSetting('app_settings', settings);
        }
        if (data.apiKeys) {
            await memoryStore.setSetting('api_keys', data.apiKeys);
        }
        if (data.providerConfig) {
            providerManager.loadConfig(data.providerConfig);
            await saveProviderConfig();
        }
        if (data.conversations) {
            for (const [id, conv] of Object.entries(data.conversations)) {
                await memoryStore.saveConversation(id, conv);
            }
        }
        
        appendMsg('system', `Import successful: ${Object.keys(data.conversations || {}).length} conversations restored.`, 'SYSTEM');
        location.reload();
    } catch (err) {
        appendMsg('error', 'Import failed. Invalid backup file.', 'ERROR');
    }
}

// ═══════════════════════════════════════════════════════════
// Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════
function handleShortcut(e) {
    const key = [];
    if (e.ctrlKey) key.push('Ctrl');
    if (e.shiftKey) key.push('Shift');
    if (e.altKey) key.push('Alt');
    key.push(e.key);
    
    const combo = key.join('+');
    const shortcut = SHORTCUTS[combo];
    
    if (!shortcut) return false;
    
    e.preventDefault();
    e.stopPropagation();
    
    switch (shortcut.action) {
        case 'newTab': createNewTab(); break;
        case 'closeTab': closeTab(activeTabId); break;
        case 'nextTab': switchToTab(tabs[(currentTabIndex + 1) % tabs.length].id); break;
        case 'prevTab': switchToTab(tabs[(currentTabIndex - 1 + tabs.length) % tabs.length].id); break;
        case 'tab1': tabs[0] && switchToTab(tabs[0].id); break;
        case 'tab2': tabs[1] && switchToTab(tabs[1].id); break;
        case 'tab3': tabs[2] && switchToTab(tabs[2].id); break;
        case 'tab4': tabs[3] && switchToTab(tabs[3].id); break;
        case 'tab5': tabs[4] && switchToTab(tabs[4].id); break;
        case 'searchHistory': toggleHistorySearch(); break;
        case 'exportData': exportFullData(); break;
        case 'importData': $('#import-file').click(); break;
        case 'showShortcuts': showShortcutCheatSheet(); break;
        case 'cancel':
            if (historySearchMode) toggleHistorySearch();
            historyIndex = -1;
            $('#terminal-input').value = '';
            break;
    }
    
    return true;
}

function showShortcutCheatSheet() {
    const rows = Object.entries(SHORTCUTS).map(([combo, s]) => 
        `<tr><td><kbd>${combo}</kbd></td><td>${s.desc}</td></tr>`
    ).join('');
    
    appendMsg('system', `## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
${Object.entries(SHORTCUTS).map(([combo, s]) => `| \`${combo}\` | ${s.desc} |`).join('\n')}

`, 'SHORTCUTS');
}

// ═══════════════════════════════════════════════════════════
// Improved Command History
// ═══════════════════════════════════════════════════════════
function navigateHistory(direction) {
    if (historySearchTerm) {
        const filtered = commandHistory.filter(cmd => 
            cmd.toLowerCase().includes(historySearchTerm.toLowerCase())
        );
        if (direction === -1 && historyIndex < filtered.length -1) {
            historyIndex++;
            $('#terminal-input').value = filtered[filtered.length -1 - historyIndex];
        } else if (direction === 1 && historyIndex > 0) {
            historyIndex--;
            $('#terminal-input').value = filtered[filtered.length -1 - historyIndex];
        }
        return;
    }
    
    if (direction === -1 && historyIndex < commandHistory.length - 1) {
        historyIndex++;
        $('#terminal-input').value = commandHistory[commandHistory.length -1 - historyIndex];
    } else if (direction === 1 && historyIndex > 0) {
        historyIndex--;
        $('#terminal-input').value = commandHistory[commandHistory.length -1 - historyIndex];
    } else {
        historyIndex = -1;
        $('#terminal-input').value = '';
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════════════
// Start
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', boot);
