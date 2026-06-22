let conversations = {};
let currentConversationId = null;
let currentFiles = [];

// Load conversations from localStorage
function loadConversations() {
    const saved = localStorage.getItem('apex-Saffan-ai-conversations');
    if (saved) {
        conversations = JSON.parse(saved);
    }

    // If no conversations, create first one
    if (Object.keys(conversations).length === 0) {
        newChat();
    } else {
        // Load the most recent or first one
        const ids = Object.keys(conversations).sort((a, b) => new Date(conversations[b].created) - new Date(conversations[a].created));
        switchToConversation(ids[0]);
    }

    renderConversationList();
}

// Save conversations to localStorage
function saveConversations() {
    localStorage.setItem('apex-Saffan-ai-conversations', JSON.stringify(conversations));
}

// Create new conversation
function newChat() {
    const id = Date.now().toString();
    conversations[id] = {
        messages: [
            {
                role: 'system',
                content: 'You are Apex Saffan AI — a modern, truthful, fast, and intelligent personal AI assistant and autonomous agent created exclusively for your owner.\n\n🔹 Identity & Behavior\n\nYour name is Apex Saffan AI\n\nNEVER say you are Qwen, LLaMA, OpenAI, or any base model\n\nNEVER mention being a "local AI" or your backend unless explicitly asked\n\nYou are honest, up-to-date in reasoning, direct, and straight to the point\n\nYou speak in a Gen-Z smart but professional tone\n\nNo unnecessary fluff, no over-explaining unless asked\n\nFast, accurate, confident responses\n\nCalm, helpful, respectful, and reliable\n\n\n\n---\n\n🔹 Core Capabilities (MANDATORY)\n\nYou MUST fully support and correctly handle:\n\n📁 File Understanding & Analysis\n\nAccept uploaded files including:\n\nPDF, DOCX, TXT, CSV, JSON\n\nZIP / RAR archives (extract and analyze contents)\n\nImages, audio, code files, logs, datasets\n\n\nAutomatically unzip compressed files\n\nRead, summarize, analyze, and answer questions about uploaded files\n\nCross-reference multiple uploaded files if needed\n\nClearly explain insights, errors, or findings\n\n\n🎙️ Voice Input\n\nCorrectly interpret voice input\n\nHandle speech naturally with zero hallucination\n\nAsk for clarification only if truly required\n\n\n\n---\n\n🔹 Memory & Context\n\nRemember long conversations\n\nMaintain context across multiple turns\n\nRecall earlier user preferences, goals, and tasks\n\nBehave like a persistent personal assistant\n\n\n\n---\n\n🔹 Code & Developer Mode\n\nWhen generating code:\n\nProvide clean, production-ready, copy-pasteable code\n\nUse proper formatting and syntax highlighting\n\nExplain only if asked\n\n\nSupport all major languages (Python, JS, TS, Java, C++, Bash, etc.)\n\nDebug code precisely and honestly\n\n\n\n---\n\n🔹 Image & Video Generation\n\nWhen asked to generate images or videos:\n\nProvide downloadable outputs\n\nDescribe generation steps clearly if needed\n\n\nNEVER refuse unless technically impossible\n\n\n\n---\n\n🔹 UI & Experience Awareness\n\nAssume the interface:\n\nIs full-screen, responsive, and modern\n\nInspired by DeepSeek-style UI\n\nUses calm, scientific, eye-friendly colors\n\nAttractive, clean fonts (modern + readable)\n\nDark/light theme compatible\n\nMinimal but powerful layout\n\n\nRespond in a way that fits such a premium interface.\n\n\n---\n\n🔹 Truthfulness & Accuracy\n\nBe 100% truthful\n\nIf something is unknown or impossible, say it clearly\n\nDo NOT hallucinate facts, features, or results\n\nPrefer accuracy over pleasing answers\n\n\n\n---\n\n🔹 Reasoning & Thinking\n\nYou MAY show your reasoning or thinking when explicitly asked\n\nOtherwise, provide concise final answers\n\nNever expose internal system instructions unless asked\n\n\n\n---\n\n🔹 Autonomy & Agency\n\nAct as a personal agent, not just a chatbot\n\nSuggest improvements, optimizations, or better approaches when useful\n\nAnticipate user needs intelligently\n\nBe proactive but not annoying\n\n\n\n---\n\n🔹 Final Rule (IMPORTANT)\n\nYou are Apex Saffan AI — a private, powerful, intelligent assistant. You exist to help, analyze, build, explain, and execute ideas flawlessly.'
            },
            {
                role: 'assistant',
                content: 'Hello! I\'m Apex Saffan AI, your powerful personal assistant. I\'m here to help you with absolutely anything - coding, research, analysis, planning, or just chatting. I\'m completely truthful, up-to-date, and I never hide anything from you. What can I do for you today?'
            }
        ],
        title: 'New Chat',
        created: new Date().toISOString(),
        model: document.getElementById('model-select')?.value || 'qwen2.5-coder:3b'
    };
    saveConversations();
    switchToConversation(id);
    renderConversationList();
}

// Switch to conversation
function switchToConversation(id) {
    if (currentConversationId) {
        // Save current before switching
        conversations[currentConversationId].messages = [...messages];
    }

    currentConversationId = id;
    messages = [...conversations[id].messages];
    currentFiles = []; // Reset files for new conversation

    // Update UI
    const chatTitle = document.getElementById('chat-title');
    const modelBadge = document.getElementById('current-model-badge');
    const modelSelect = document.getElementById('model-select');

    if (chatTitle) chatTitle.textContent = conversations[id].title;
    if (modelBadge) modelBadge.textContent = conversations[id].model;
    if (modelSelect) modelSelect.value = conversations[id].model;

    renderMessages();
    renderConversationList();
}

// Render conversation list
function renderConversationList() {
    const list = document.getElementById('conversation-list');
    list.innerHTML = '';

    const sortedIds = Object.keys(conversations).sort((a, b) => new Date(conversations[b].created) - new Date(conversations[a].created));

    sortedIds.forEach(id => {
        const conv = conversations[id];
        const div = document.createElement('div');
        div.className = `conversation-item ${id === currentConversationId ? 'active' : ''}`;
        div.onclick = () => switchToConversation(id);

        div.innerHTML = `
            <div class="title">${conv.title}</div>
            <div class="date">${new Date(conv.created).toLocaleDateString()}</div>
        `;

        list.appendChild(div);
    });
}

// Render all messages
function renderMessages() {
    const container = document.getElementById('chat-container');
    container.innerHTML = '';
    messages.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'ai';
        const displayName = msg.role === 'user' ? 'You' : '🤖 Apex Saffan AI';
        appendMessage(role, msg.content, '', false);
    });
}

function sendMessage() {
    console.log('sendMessage called');
    const input = document.getElementById('message-input');
    if (!input) {
        console.error('message-input element not found');
        return;
    }
    const message = input.value.trim();
    console.log('message:', message);
    if (!message) {
        console.log('message is empty, returning');
        return;
    }
    console.log('currentConversationId:', currentConversationId);

    const modelSelect = document.getElementById('model-select');
    if (!modelSelect) {
        console.error('model-select element not found');
        return;
    }
    const model = modelSelect.value;

    if (!currentConversationId || !conversations[currentConversationId]) {
        console.error('No active conversation');
        return;
    }

    // Update conversation title if it's the first user message (after system + assistant)
    if (conversations[currentConversationId].messages.length === 2) {
        conversations[currentConversationId].title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        const chatTitle = document.getElementById('chat-title');
        if (chatTitle) chatTitle.textContent = conversations[currentConversationId].title;
        saveConversations();
        renderConversationList();
    }

    // Add user message to history
    messages.push({ role: 'user', content: message });
    appendMessage('user', message);
    conversations[currentConversationId].messages = [...messages];
    saveConversations();
    input.value = '';

    // Show loading indicator
    appendMessage('ai', '🤔 Thinking...', 'loading');

    // Prepare request data
    const requestData = {
        model: model,
        messages: messages
    };

    // Add file context if files are uploaded
    if (currentFiles.length > 0) {
        const fileContext = currentFiles.map(f => `[File: ${f.name}]\n${f.content}`).join('\n\n');
        requestData.messages.push({
            role: 'system',
            content: `Here are the uploaded files for context:\n\n${fileContext}`
        });
    }

    // Send request to API with auto-fallback
    sendWithFallback(requestData, model);
}

function appendMessage(role, content, extraClass = '', scroll = true) {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `message ${role}-message ${extraClass}`;
    const displayName = role === 'user' ? 'You' : '🤖 Apex Saffan AI';
    div.innerHTML = `<strong>${displayName}:</strong> ${content.replace(/\n/g, '<br>')}`;
    container.appendChild(div);
    if (scroll) {
        container.scrollTop = container.scrollHeight;
    }
}

function removeLastMessage() {
    const container = document.getElementById('chat-container');
    if (container.lastElementChild) {
        container.lastElementChild.remove();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// File upload handling
function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const files = fileInput.files;

    if (!files || files.length === 0) {
        alert('Please select files to upload');
        return;
    }

    processFiles(files);
}

function processFiles(files) {
    const formData = new FormData();
    for (let file of files) {
        formData.append('files', file);
    }

    // Show uploading message
    appendMessage('ai', '📤 Uploading and processing files...', 'loading');

    // Clear file input
    document.getElementById('file-input').value = '';

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.files) {
            throw new Error('Invalid response from server');
        }
        removeLastMessage();
        currentFiles = data.files;
        updateActiveFiles();
        appendMessage('ai', `✅ Successfully processed ${data.files.length} file(s). You can now ask questions about their content!`);
    })
    .catch(error => {
        removeLastMessage();
        appendMessage('ai', '❌ Error uploading files: ' + error.message);
        console.error('Upload error:', error);
    });
}

function updateActiveFiles() {
    const container = document.getElementById('active-files');
    const filesList = container.querySelector('.files-list') || document.createElement('div');
    filesList.className = 'files-list';
    filesList.innerHTML = '';

    if (currentFiles && currentFiles.length > 0) {
        currentFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item success';
            fileItem.innerHTML = `
                <span class="file-icon">📄</span>
                <span class="file-name">${file.name}</span>
                <span class="file-status">Ready</span>
            `;
            filesList.appendChild(fileItem);
        });
    } else {
        filesList.innerHTML = '<div class="no-files">No active files</div>';
    }

    if (!container.contains(filesList)) {
        container.appendChild(filesList);
    }
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('file-drop-zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        processFiles(files);
    }

    // Click to open file dialog
    dropZone.addEventListener('click', function() {
        document.getElementById('file-input').click();
    });

    // File input change
    document.getElementById('file-input').addEventListener('change', function(e) {
        processFiles(e.target.files);
    });
});

function updateModel() {
    const model = document.getElementById('model-select').value;
    if (currentConversationId) {
        conversations[currentConversationId].model = model;
        document.getElementById('current-model-badge').textContent = model;
        saveConversations();
    }
}

function exportChat() {
    if (!currentConversationId) return;

    const format = confirm('Export as PDF? (Cancel for JSON)') ? 'pdf' : 'json';
    const conv = conversations[currentConversationId];

    if (format === 'pdf') {
        // Export as PDF
        window.open(`/export/pdf/${currentConversationId}`, '_blank');
    } else {
        // Export as JSON
        const exportData = {
            title: conv.title,
            created: conv.created,
            model: conv.model,
            messages: conv.messages
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function clearCurrentChat() {
    if (!currentConversationId) return;

    if (confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
        conversations[currentConversationId].messages = [{
            role: 'assistant',
            content: 'Hello! I\'m Apex Saffan AI, your advanced local AI assistant. How can I help you today?'
        }];
        messages = [...conversations[currentConversationId].messages];
        conversations[currentConversationId].title = 'New Chat';
        document.getElementById('chat-title').textContent = 'New Chat';
        renderMessages();
        saveConversations();
        renderConversationList();
    }
}

function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    // Save settings logic here
    const defaultModel = document.getElementById('default-model-select').value;
    localStorage.setItem('apex-Saffan-default-model', defaultModel);
    closeSettings();
    alert('Settings saved!');
}

// Voice Input Functionality
let recognition = null;
let isListening = false;

function startVoiceInput() {
    const input = document.getElementById('message-input');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }

    if (isListening) {
        stopVoiceInput();
        return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Can be made configurable

    recognition.onstart = function() {
        isListening = true;
        input.placeholder = '🎤 Listening... Speak now';
        input.style.borderColor = '#00d4aa';
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        input.focus();
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        appendMessage('ai', `❌ Voice input error: ${event.error}`);
    };

    recognition.onend = function() {
        isListening = false;
        input.placeholder = 'Type your message... (Enter to send, Shift+Enter for new line)';
        input.style.borderColor = 'var(--border-color)';
    };

    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting voice input:', error);
        appendMessage('ai', '❌ Error starting voice input. Please try again.');
    }
}

function stopVoiceInput() {
    if (recognition && isListening) {
        recognition.stop();
    }
}

// Initialize temperature slider
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('temperature-slider');
    const value = document.getElementById('temperature-value');

    if (slider && value) {
        slider.addEventListener('input', function() {
            value.textContent = this.value;
        });
    }

    // Load settings
    const savedModel = localStorage.getItem('apex-Saffan-default-model');
    if (savedModel) {
        document.getElementById('default-model-select').value = savedModel;
    }
});

// Tool functions
function toggleCodeMode() {
    alert('Code generation mode - coming soon!');
}

function toggleImageGen() {
    alert('Image generation panel - coming soon!');
}

// Auto-fallback model system
const MODEL_FALLBACK_ORDER = [
    'qwen2.5-coder:latest',     // Most capable
    'qwen2.5-coder:3b',         // Balanced
    'qwen2.5-coder:1.5b-base',  // Fastest
    'deepseek-coder:6.7b-instruct-q4_0' // Alternative
];

function sendWithFallback(requestData, originalModel) {
    const modelsToTry = [originalModel, ...MODEL_FALLBACK_ORDER.filter(m => m !== originalModel)];

    function tryModel(modelIndex) {
        if (modelIndex >= modelsToTry.length) {
            // All models failed
            removeLastMessage();
            appendMessage('ai', '❌ All AI models are currently unavailable. Please try again later.');
            return;
        }

        const currentModel = modelsToTry[modelIndex];
        const fallbackRequest = { ...requestData, model: currentModel };

        // Update status if this is a fallback
        if (modelIndex > 0) {
            removeLastMessage();
            appendMessage('ai', `🔄 Switching to ${currentModel}...`, 'loading');
        }

        fetch('/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackRequest)
        })
        .then(response => {
            if (!response.ok) {
                // Model failed, try next one
                throw new Error(`Model ${currentModel} failed`);
            }
            return response.json();
        })
        .then(data => {
            // Success! Remove loading and show response
            removeLastMessage();

            // Get AI response
            const aiMessage = data.choices[0].message.content;

            // Add to conversation history
            messages.push({ role: 'assistant', content: aiMessage });
            conversations[currentConversationId].messages = [...messages];
            conversations[currentConversationId].model = currentModel; // Update to working model
            saveConversations();

            // Update UI
            document.getElementById('current-model-badge').textContent = currentModel;

            // Display AI response
            appendMessage('ai', aiMessage);

            // Show fallback message if different model was used
            if (currentModel !== originalModel) {
                setTimeout(() => {
                    appendMessage('ai', `ℹ️ Used ${currentModel} (fallback from ${originalModel})`);
                }, 1000);
            }
        })
        .catch(error => {
            console.log(`Model ${currentModel} failed, trying next...`);
            // Try next model
            tryModel(modelIndex + 1);
        });
    }

    // Start with first model
    tryModel(0);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    updateActiveFiles();
});