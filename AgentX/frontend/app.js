/* ─────────────────────────────────────────────────────────────────────────
   AgentX Frontend – SSE streaming client
   ───────────────────────────────────────────────────────────────────────── */

const API_BASE = '';  // Same origin: backend serves frontend

let token = localStorage.getItem('agentx_token') || '';
let currentSessionId = null;
let isStreaming = false;

// ── Auth ──────────────────────────────────────────────────────────────────
const authOverlay = document.getElementById('auth-overlay');
const appEl = document.getElementById('app');
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const authError = document.getElementById('auth-error');
const tabBtns = document.querySelectorAll('.tab-btn');
let authMode = 'login';

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        authMode = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const emailGroup = document.getElementById('email-group');
        emailGroup.style.display = authMode === 'register' ? 'block' : 'none';
        authSubmit.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
        authError.style.display = 'none';
    });
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';
    authSubmit.disabled = true;
    authSubmit.textContent = 'Please wait…';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value.trim();

    try {
        const url = `${API_BASE}/api/v1/auth/${authMode}`;
        const body = authMode === 'register'
            ? { username, password, email: email || undefined }
            : { username, password };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Authentication failed');
        }

        token = data.access_token;
        localStorage.setItem('agentx_token', token);
        const uname = username;
        document.getElementById('username-display').textContent = uname;
        document.getElementById('user-avatar').textContent = uname[0].toUpperCase();
        authOverlay.classList.remove('active');
        appEl.classList.remove('hidden');
        await initApp();

    } catch (err) {
        authError.textContent = err.message;
        authError.style.display = 'block';
    } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
    }
});

// ── Init ──────────────────────────────────────────────────────────────────
async function initApp() {
    await checkHealth();
    await loadSessions();
}

async function checkHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        const badge = document.getElementById('provider-badge');
        const dot = badge.querySelector('.dot');
        const name = document.getElementById('provider-name');
        if (data.status === 'healthy') {
            dot.classList.add('online');
            name.textContent = `${data.llm_provider} · ${data.tools_loaded} tools`;
        }
    } catch { /* ignore */ }
}

async function loadSessions() {
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/api/v1/chat/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { if (res.status === 401) logout(); return; }
        const sessions = await res.json();
        renderSessions(sessions);
    } catch { /* ignore */ }
}

function renderSessions(sessions) {
    const list = document.getElementById('sessions-list');
    if (!sessions.length) {
        list.innerHTML = '<div class="sessions-empty">No chats yet.<br/>Start a conversation!</div>';
        return;
    }
    list.innerHTML = sessions.map(s => `
    <div class="session-item ${s.id === currentSessionId ? 'active' : ''}" data-id="${s.id}">
      <span class="session-title">${escHtml(s.title || 'New Chat')}</span>
    </div>
  `).join('');
    list.querySelectorAll('.session-item').forEach(el => {
        el.addEventListener('click', () => loadSession(el.dataset.id));
    });
}

async function loadSession(id) {
    currentSessionId = id;
    try {
        const res = await fetch(`${API_BASE}/api/v1/chat/sessions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const msgs = document.getElementById('messages');
        msgs.innerHTML = '';
        hideWelcome();
        for (const m of data.messages) {
            if (m.role === 'user') appendUserMsg(m.content);
            else appendAnswerEvent({ content: m.content });
        }
        await loadSessions();
    } catch { /* ignore */ }
}

// ── Chat ──────────────────────────────────────────────────────────────────
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const msgsEl = document.getElementById('messages');

input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim() || isStreaming;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

sendBtn.addEventListener('click', sendMessage);

document.getElementById('new-chat-btn').addEventListener('click', () => {
    currentSessionId = null;
    msgsEl.innerHTML = '';
    showWelcome();
    document.getElementById('chat-title').textContent = 'New Chat';
});

document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
        input.value = btn.dataset.msg;
        input.dispatchEvent(new Event('input'));
        sendMessage();
    });
});

document.getElementById('logout-btn').addEventListener('click', logout);

async function sendMessage() {
    const msg = input.value.trim();
    if (!msg || isStreaming) return;

    hideWelcome();
    appendUserMsg(msg);
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    isStreaming = true;

    const typingEl = appendTyping();

    try {
        const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: msg, session_id: currentSessionId }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Request failed' }));
            removeTyping(typingEl);
            appendError(err.detail || 'Request failed');
            return;
        }

        // SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let eventGroup = null;

        removeTyping(typingEl);
        eventGroup = createEventGroup();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') break;
                try {
                    const event = JSON.parse(raw);
                    handleEvent(event, eventGroup);
                } catch { /* malformed SSE */ }
            }
        }

        await loadSessions();

    } catch (err) {
        removeTyping(typingEl);
        appendError(`Connection error: ${err.message}`);
    } finally {
        isStreaming = false;
        sendBtn.disabled = !input.value.trim();
    }
}

function handleEvent(event, group) {
    switch (event.type) {
        case 'session':
            currentSessionId = event.session_id;
            break;
        case 'thought':
            appendThoughtEvent(event, group);
            break;
        case 'tool_call':
            appendToolCallEvent(event, group);
            break;
        case 'tool_result':
            appendToolResultEvent(event, group);
            break;
        case 'answer':
            appendAnswerEvent(event, group);
            break;
        case 'error':
            appendError(event.message, group);
            break;
    }
    scrollToBottom();
}

// ── DOM helpers ───────────────────────────────────────────────────────────
function showWelcome() {
    let w = document.getElementById('welcome-screen');
    if (!w) {
        w = document.createElement('div');
        w.className = 'welcome-screen';
        w.id = 'welcome-screen';
        w.innerHTML = `
      <div class="welcome-logo">
        <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
          <path d="M16 16L40 40L16 64" stroke="url(#gw2)" stroke-width="7" stroke-linecap="round"/>
          <path d="M64 16L40 40L64 64" stroke="url(#gw2)" stroke-width="7" stroke-linecap="round"/>
          <circle cx="40" cy="40" r="6" fill="url(#gw2)"/>
          <defs><linearGradient id="gw2" x1="16" y1="16" x2="64" y2="64">
            <stop offset="0%" stop-color="#7c3aed"/>
            <stop offset="100%" stop-color="#06b6d4"/>
          </linearGradient></defs>
        </svg>
      </div>
      <h2>How can AgentX help you?</h2>
      <p>I can search the web, execute code, read/write files, do math, and more.</p>
    `;
        msgsEl.prepend(w);
    }
}
function hideWelcome() {
    const w = document.getElementById('welcome-screen');
    if (w) w.remove();
}
function createEventGroup() {
    const g = document.createElement('div');
    g.className = 'event-group';
    msgsEl.appendChild(g);
    return g;
}
function appendUserMsg(text) {
    const el = document.createElement('div');
    el.className = 'msg-user';
    el.innerHTML = `<div class="bubble">${escHtml(text)}</div>`;
    msgsEl.appendChild(el);
    scrollToBottom();
}
function appendTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    msgsEl.appendChild(el);
    scrollToBottom();
    return el;
}
function removeTyping(el) { el?.remove(); }

function appendThoughtEvent(ev, group) {
    const el = document.createElement('div');
    el.className = 'event-thought';
    el.innerHTML = `
    <div class="event-label">🧠 Thinking · Step ${ev.step}</div>
    <div>${escHtml(ev.content)}</div>
  `;
    group.appendChild(el);
}
function appendToolCallEvent(ev, group) {
    const el = document.createElement('div');
    el.className = 'event-tool-call';
    el.innerHTML = `
    <div class="event-label">🔧 Tool Call <span class="tool-name-badge">${escHtml(ev.tool)}</span></div>
    <div class="tool-input">${escHtml(JSON.stringify(ev.input, null, 2))}</div>
  `;
    group.appendChild(el);
}
function appendToolResultEvent(ev, group) {
    const el = document.createElement('div');
    el.className = `event-tool-result ${ev.success ? '' : 'failed'}`;
    el.innerHTML = `
    <div class="event-label">${ev.success ? '✅ Result' : '❌ Failed'} · ${escHtml(ev.tool)}</div>
    <pre class="result-content">${escHtml(ev.result)}</pre>
  `;
    group.appendChild(el);
}
function appendAnswerEvent(ev, group) {
    const el = document.createElement('div');
    el.className = 'event-answer';
    const meta = ev.steps ? `<div class="answer-meta">Completed in ${ev.steps} step${ev.steps !== 1 ? 's' : ''} · ${ev.tokens_in || 0}↑ ${ev.tokens_out || 0}↓ tokens</div>` : '';
    el.innerHTML = `
    <div class="event-label">✦ AgentX</div>
    <div class="answer-text">${formatMarkdown(ev.content)}</div>
    ${meta}
  `;
    if (group) group.appendChild(el);
    else msgsEl.appendChild(el);
}
function appendError(msg, group) {
    const el = document.createElement('div');
    el.className = 'event-error';
    el.innerHTML = `⚠️ ${escHtml(msg)}`;
    if (group) group.appendChild(el);
    else msgsEl.appendChild(el);
}

function scrollToBottom() {
    msgsEl.scrollTo({ top: msgsEl.scrollHeight, behavior: 'smooth' });
}

// ── Utils ─────────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatMarkdown(text) {
    return escHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```[\s\S]*?```/g, m => `<pre>${escHtml(m.slice(3, -3))}</pre>`)
        .replace(/\n/g, '<br>');
}

function logout() {
    localStorage.removeItem('agentx_token');
    token = '';
    currentSessionId = null;
    appEl.classList.add('hidden');
    authOverlay.classList.add('active');
    document.getElementById('messages').innerHTML = '';
}

// ── Boot ─────────────────────────────────────────────────────────────────
if (token) {
    authOverlay.classList.remove('active');
    appEl.classList.remove('hidden');
    const storedUser = localStorage.getItem('agentx_user') || 'User';
    document.getElementById('username-display').textContent = storedUser;
    document.getElementById('user-avatar').textContent = storedUser[0].toUpperCase();
    initApp();
}
