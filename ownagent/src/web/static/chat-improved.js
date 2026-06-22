/* 🎨 LocalAI - Premium Chat Logic with Enhanced Features */

// ==================== GLOBAL STATE ====================
let conversations = {};
let currentConversationId = null;
let currentFiles = [];
let isLoading = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    setupEventListeners();
    applyTheme();
});

function setupEventListeners() {
    // File upload
    const fileDropZone = document.getElementById('file-drop-zone');
    if (fileDropZone) {
        fileDropZone.addEventListener('dragover', handleDragOver);
        fileDropZone.addEventListener('dragleave', handleDragLeave);
        fileDropZone.addEventListener('drop', handleDrop);
        fileDropZone.addEventListener('click', () => document.getElementById('file-input').click());
    }

    document.getElementById('file-input')?.addEventListener('change', handleFileSelect);

    // Chat auto-scroll
    const chatContainer = document.getElementById('chat-container');
    const observer = new MutationObserver(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    observer.observe(chatContainer, { childList: true });
}

// ==================== CONVERSATION MANAGEMENT ====================
function loadConversations() {
    const saved = localStorage.getItem('localai-conversations');
    if (saved) {
        try {
            conversations = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load conversations:', e);
            conversations = {};
        }
    }

    if (Object.keys(conversations).length === 0) {
        newChat();
    } else {
        const ids = Object.keys(conversations).sort((a, b) => 
            new Date(conversations[b].created) - new Date(conversations[a].created)
        );
        switchToConversation(ids[0]);
    }

    renderConversationList();
}

function saveConversations() {
    localStorage.setItem('localai-conversations', JSON.stringify(conversations));
}

function newChat() {
    const id = Date.now().toString();
    const model = document.getElementById('model-select')?.value || 'qwen:3b';

    conversations[id] = {
        id,
        messages: [],
        title: 'New Conversation',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        model,
        temperature: 0.7,
    };

    saveConversations();
    switchToConversation(id);
    renderConversationList();
    focusInputField();
}

function switchToConversation(id) {
    if (!conversations[id]) return;

    currentConversationId = id;
    currentFiles = [];
    isLoading = false;

    const conv = conversations[id];
    
    // Update UI
    const chatTitle = document.getElementById('chat-title');
    const modelBadge = document.getElementById('current-model-badge');
    const modelSelect = document.getElementById('model-select');

    if (chatTitle) chatTitle.textContent = conv.title;
    if (modelBadge) modelBadge.textContent = conv.model;
    if (modelSelect) modelSelect.value = conv.model;

    renderMessages();
    renderConversationList();
    updateUploadsList();
}

function renderConversationList() {
    const list = document.getElementById('conversation-list');
    if (!list) return;

    list.innerHTML = '';

    const sortedIds = Object.keys(conversations).sort((a, b) => 
        new Date(conversations[b].updated) - new Date(conversations[a].updated)
    );

    sortedIds.forEach(id => {
        const conv = conversations[id];
        const div = document.createElement('div');
        div.className = `conversation-item ${id === currentConversationId ? 'active' : ''}`;
        div.onclick = () => switchToConversation(id);
        
        const date = new Date(conv.updated).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        div.innerHTML = `
            <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${conv.title}</div>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">${date}</div>
        `;

        list.appendChild(div);
    });
}

function updateCurrentConversation(title) {
    if (!conversations[currentConversationId]) return;
    conversations[currentConversationId].title = title || 'Untitled';
    conversations[currentConversationId].updated = new Date().toISOString();
    saveConversations();
    renderConversationList();
}

// ==================== MESSAGE HANDLING ====================
function renderMessages() {
    const container = document.getElementById('chat-container');
    if (!container) return;

    container.innerHTML = '';

    const conv = conversations[currentConversationId];
    if (!conv) return;

    conv.messages.forEach(msg => {
        if (msg.role === 'system') return; // Skip system messages

        const messageEl = createMessageElement(msg);
        container.appendChild(messageEl);
    });

    container.scrollTop = container.scrollHeight;
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    div.className = `message ${msg.role === 'user' ? 'user' : 'assistant'}`;

    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Simple markdown rendering
    let html = sanitizeHtml(msg.content);
    html = formatCodeBlocks(html);
    html = formatLinks(html);

    content.innerHTML = html;
    div.appendChild(content);

    return div;
}

function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatCodeBlocks(html) {
    return html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        const escapedCode = sanitizeHtml(code.trim());
        return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
    });
}

function formatLinks(html) {
    return html.replace(/https?:\/\/[^\s<>)]+/g, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    });
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input || !input.value.trim()) return;

    if (isLoading) return;

    const userMessage = input.value.trim();
    input.value = '';
    input.style.height = 'auto';

    // Add user message
    const conv = conversations[currentConversationId];
    conv.messages.push({ role: 'user', content: userMessage });

    // Auto-name conversation from first message
    if (conv.messages.filter(m => m.role !== 'system').length === 1) {
        const title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
        updateCurrentConversation(title);
    }

    renderMessages();
    isLoading = true;

    try {
        const response = await fetch('/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: conv.messages,
                model: conv.model,
                temperature: conv.temperature || 0.7
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const assistantMessage = data.choices[0].message.content;
            conv.messages.push({ role: 'assistant', content: assistantMessage });
            conv.updated = new Date().toISOString();
            saveConversations();
            renderMessages();
        } else if (data.error) {
            throw new Error(data.error.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        conv.messages.push({ 
            role: 'assistant', 
            content: '❌ Error: ' + (error.message || 'Failed to get response. Make sure Ollama is running.') 
        });
        renderMessages();
    }

    isLoading = false;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        sendMessage();
    }
}

function focusInputField() {
    const input = document.getElementById('message-input');
    if (input) input.focus();
}

// ==================== FILE HANDLING ====================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    files.forEach(file => {
        if (!currentFiles.find(f => f.name === file.name && f.size === file.size)) {
            currentFiles.push(file);
        }
    });
    updateUploadsList();
}

function updateUploadsList() {
    const list = document.getElementById('uploads-list');
    if (!list) return;

    if (currentFiles.length === 0) {
        list.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">No files uploaded</div>';
        return;
    }

    list.innerHTML = currentFiles.map(file => `
        <div class="upload-item">
            <span class="upload-icon">📄</span>
            <span class="upload-name" title="${file.name}">${file.name}</span>
            <button onclick="removeFile('${file.name}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px;">✕</button>
        </div>
    `).join('');
}

function removeFile(filename) {
    currentFiles = currentFiles.filter(f => f.name !== filename);
    updateUploadsList();
}

function uploadFile() {
    document.getElementById('file-input').click();
}

// ==================== SETTINGS ====================
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'block';
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
}

function saveSettings() {
    const tempSlider = document.getElementById('temperature-slider');
    const themeSelect = document.getElementById('theme-select');
    const defaultModel = document.getElementById('default-model-select');

    if (tempSlider) localStorage.setItem('localai-temperature', tempSlider.value);
    if (themeSelect) {
        localStorage.setItem('localai-theme', themeSelect.value);
        applyTheme();
    }
    if (defaultModel) localStorage.setItem('localai-default-model', defaultModel.value);

    closeSettings();
}

function updateTempValue(value) {
    const display = document.getElementById('temp-value');
    if (display) display.textContent = value;
}

function applyTheme() {
    const theme = localStorage.getItem('localai-theme') || 'dark';
    document.documentElement.style.colorScheme = theme;
}

// ==================== UTILITY FUNCTIONS ====================
function exportChat() {
    const conv = conversations[currentConversationId];
    if (!conv || !conv.messages) return;

    const text = conv.messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearCurrentChat() {
    if (!confirm('Clear current conversation?')) return;

    if (conversations[currentConversationId]) {
        delete conversations[currentConversationId];
        saveConversations();
        loadConversations();
    }
}

function updateModel() {
    const select = document.getElementById('model-select');
    if (!select || !conversations[currentConversationId]) return;

    conversations[currentConversationId].model = select.value;
    saveConversations();
    renderConversationList();
}

function startVoiceInput() {
    alert('Voice input coming soon! 🎤');
}

function toggleCodeMode() {
    alert('Code mode coming soon! 💻');
}

function toggleImageGen() {
    alert('Image generation coming soon! 🎨');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('settings-modal');
    if (modal && event.target === modal) {
        closeSettings();
    }
}
