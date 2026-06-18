# Apex Smart - UI Design Specification

## Overview

Apex Smart features a premium, professional interface inspired by leading AI platforms like Kimi AI and DeepSeek AI. The design emphasizes clarity, elegance, and functionality with a focus on the chat experience.

## Design Philosophy

- **Premium Feel**: Sophisticated color palette, refined typography, subtle animations
- **Content-First**: Minimal UI chrome, maximum space for content
- **Responsive**: Seamless experience across desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 AA compliance
- **Performant**: 60fps animations, lazy loading, optimized assets

---

## Layout Architecture

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  APP                                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SIDEBAR (280px)              │  MAIN CONTENT           │   │
│  │  ─────────────────────────    │  ─────────────────────  │   │
│  │                               │                         │   │
│  │  ┌─────────────────────┐     │  ┌───────────────────┐  │   │
│  │  │ Logo + New Chat     │     │  │ Header            │  │   │
│  │  └─────────────────────┘     │  │ - Title           │  │   │
│  │                               │  │ - Provider Select │  │   │
│  │  ┌─────────────────────┐     │  │ - Actions         │  │   │
│  │  │ Conversation List   │     │  └───────────────────┘  │   │
│  │  │ - Item 1            │     │                         │   │
│  │  │ - Item 2            │     │  ┌───────────────────┐  │   │
│  │  │ - Item 3            │     │  │ Chat Area         │  │   │
│  │  └─────────────────────┘     │  │ (Scrollable)      │  │   │
│  │                               │  │                   │  │   │
│  │  ┌─────────────────────┐     │  │ - Messages        │  │   │
│  │  │ Bottom Actions      │     │  │ - Typing indicator│  │   │
│  │  │ - Settings          │     │  └───────────────────┘  │   │
│  │  │ - Theme Toggle      │     │                         │   │
│  │  └─────────────────────┘     │  ┌───────────────────┐  │   │
│  │                               │  │ Input Area        │  │   │
│  └───────────────────────────────┤  │ - File Attach     │  │   │
│                                  │  │ - Text Input      │  │   │
│                                  │  │ - Send Button     │  │   │
│                                  │  └───────────────────┘  │   │
│                                  │                         │   │
│                                  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Sidebar as drawer, full-width chat |
| Tablet | 768px - 1024px | Collapsible sidebar |
| Desktop | > 1024px | Fixed sidebar + main content |

---

## Design Tokens

### Color Palette

#### Dark Theme (Default)

```css
/* Background Colors */
--bg-primary: #0a0a0f;        /* Main background - near black */
--bg-secondary: #12121a;      /* Sidebar, cards */
--bg-tertiary: #1a1a25;       /* Elevated surfaces */
--bg-hover: #252532;          /* Hover states */
--bg-active: #2d2d3d;         /* Active states */
--bg-input: #0f0f16;          /* Input fields */

/* Text Colors */
--text-primary: #f0f0f5;      /* Main text - off-white */
--text-secondary: #a0a0b0;    /* Secondary text */
--text-tertiary: #6a6a7a;     /* Muted text */
--text-disabled: #4a4a5a;     /* Disabled state */

/* Accent Colors */
--accent-primary: #6366f1;    /* Primary indigo */
--accent-primary-hover: #818cf8;
--accent-primary-active: #4f46e5;
--accent-secondary: #06b6d4;  /* Cyan accent */
--accent-success: #10b981;    /* Green */
--accent-warning: #f59e0b;    /* Amber */
--accent-error: #ef4444;      /* Red */

/* Border Colors */
--border-primary: #2a2a3a;
--border-secondary: #1f1f2e;
--border-focus: #6366f1;

/* Provider Colors */
--provider-deepseek: #4f46e5;
--provider-claude: #d97757;
--provider-grok: #1d9bf0;
--provider-openai: #10a37f;
--provider-openrouter: #ef4444;
--provider-perplexity: #22d3ee;
```

#### Light Theme

```css
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #f1f3f4;
--bg-hover: #e8eaed;
--bg-active: #dadce0;
--bg-input: #ffffff;

--text-primary: #1f2937;
--text-secondary: #4b5563;
--text-tertiary: #9ca3af;
--text-disabled: #d1d5db;

--border-primary: #e5e7eb;
--border-secondary: #f3f4f6;
```

### Typography

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Badges, timestamps */
--text-sm: 0.8125rem;    /* 13px - Labels, hints */
--text-base: 0.9375rem;  /* 15px - Body text */
--text-lg: 1.0625rem;    /* 17px - Emphasis */
--text-xl: 1.25rem;      /* 20px - Section headers */
--text-2xl: 1.5rem;      /* 24px - Page titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.25rem;   /* 20px */
--radius-full: 9999px;
```

### Shadows

```css
/* Dark Theme Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);

/* Light Theme Shadows */
--shadow-sm-light: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md-light: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg-light: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Animations

```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

/* Easings */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Common Transitions */
--transition-colors: color var(--duration-fast) var(--ease-default),
                     background-color var(--duration-fast) var(--ease-default),
                     border-color var(--duration-fast) var(--ease-default);
--transition-transform: transform var(--duration-normal) var(--ease-default);
--transition-opacity: opacity var(--duration-fast) var(--ease-default);
--transition-all: all var(--duration-normal) var(--ease-default);
```

---

## Component Specifications

### 1. Sidebar

#### Layout
- **Width**: 280px (desktop), 100% (mobile drawer)
- **Background**: var(--bg-secondary)
- **Border-right**: 1px solid var(--border-secondary)

#### Sections

**Header**
- Logo (32px height) + App name
- "New Chat" button (primary style)

**Conversation List**
- Scrollable area
- Group by: Today, Yesterday, Previous 7 Days, Older
- Items show: Title (truncated), Date, Pin icon (if pinned)

**Bottom Actions**
- Settings button
- Theme toggle
- Provider status indicator

#### Conversation Item
```
┌─────────────────────────────────────────┐
│  📌  Conversation Title...     2:30 PM │
│      Last message preview...            │
└─────────────────────────────────────────┘
```

**States**:
- Default: bg-transparent, text-secondary
- Hover: bg-hover, translate-x-2px
- Active: bg-active, border-left: 2px accent
- Pinned: Pin icon visible

### 2. Chat Header

```
┌──────────────────────────────────────────────────────────────┐
│  My Conversation Title              🟣 Claude 3 Sonnet  [▼] │
│                                     🔍 Search  ⚙️ Settings   │
└──────────────────────────────────────────────────────────────┘
```

**Elements**:
- Title (editable inline on click)
- Provider selector dropdown with model info
- Action buttons (Search, Settings, Export)

**Provider Selector Dropdown**:
```
┌──────────────────────────────┐
│  🟣 Claude 3 Opus            │
│  🟣 Claude 3 Sonnet     ✓    │
│  🟣 Claude 3 Haiku           │
│  ─────────────────────────   │
│  🔵 GPT-4 Turbo              │
│  🔵 GPT-4                    │
│  ─────────────────────────   │
│  ⚙️ Manage Providers...      │
└──────────────────────────────┘
```

### 3. Message Bubble

#### User Message
```
                                    ┌──────────────────────────┐
                                    │  How do I use async/await│
                                    │  in Python?              │
                                    │              2:35 PM ✓✓  │
                                    └──────────────────────────┘
```

**Style**:
- Background: var(--accent-primary) with 90% opacity
- Text: white
- Border-radius: 18px 18px 4px 18px
- Max-width: 80%
- Padding: 12px 16px

#### Assistant Message
```
┌──────────────────────────────────────────────────────────────┐
│  🤖 Apex Smart                                               │
│                                                              │
│  Here's how to use async/await in Python:                    │
│                                                              │
│  ```python                                                   │
│  import asyncio                                              │
│                                                              │
│  async def main():                                           │
│      await asyncio.sleep(1)                                  │
│  ```                                                         │
│                                                              │
│  [Copy] [Regenerate] [👍] [👎]                    2:35 PM    │
└──────────────────────────────────────────────────────────────┘
```

**Style**:
- Background: var(--bg-tertiary)
- Text: var(--text-primary)
- Border-radius: 4px 18px 18px 18px
- Max-width: 90%
- Padding: 16px 20px

#### Message Actions
- Copy code button (on code blocks)
- Regenerate response
- Thumbs up/down feedback
- Timestamp

### 4. Input Area

```
┌──────────────────────────────────────────────────────────────┐
│  📎  Type a message...                              [➤ Send] │
│      Drop files here or click to attach                      │
└──────────────────────────────────────────────────────────────┘
```

**Features**:
- Multi-line text input (auto-expand)
- File attachment button
- Drag-and-drop file upload zone
- Send button (disabled when empty)
- Typing indicator when AI is responding

**File Attachment Preview**:
```
┌──────────────────────────────────────────────────────────────┐
│  ┌────────┐ ┌────────┐                                       │
│  │ 📄 doc │ │ 📊 csv │  [×] [×]                              │
│  │ 2.4 MB │ │ 156 KB │                                       │
│  └────────┘ └────────┘                                       │
│  Type a message...                                    [Send] │
└──────────────────────────────────────────────────────────────┘
```

### 5. Code Block

```
┌──────────────────────────────────────────────────────────────┐
│  python                              [Copy] [Download]       │
│  ─────────────────────────────────────────────────────────   │
│  1  │ import asyncio                                          │
│  2  │                                                         │
│  3  │ async def main():                                       │
│  4  │     await asyncio.sleep(1)                              │
│  5  │     print("Hello")                                      │
└──────────────────────────────────────────────────────────────┘
```

**Features**:
- Syntax highlighting (PrismJS/Shiki)
- Line numbers
- Copy to clipboard
- Download as file
- Language label

### 6. Settings Modal

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                           [×]      │
│  ═══════════════════════════════════════════════════════════ │
│                                                              │
│  ┌──────────────┬──────────────────────────────────────────┐│
│  │ General      │  Theme                                   ││
│  │ ──────────   │  [○] Dark  [○] Light  [○] System         ││
│  │ Providers    │                                          ││
│  │ ──────────   │  Default Provider                        ││
│  │ Appearance   │  [Claude 3 Sonnet              ▼]        ││
│  │ ──────────   │                                          ││
│  │ Memory       │  Language                                ││
│  │ ──────────   │  [English                      ▼]        ││
│  │ About        │                                          ││
│  └──────────────┴──────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Sections**:
- General: Theme, language, default provider
- Providers: API key configuration per provider
- Appearance: Font size, animations, density
- Memory: Conversation retention, fact learning
- About: Version, credits, links

### 7. Provider Configuration Card

```
┌──────────────────────────────────────────────────────────────┐
│  🟣 Claude (Anthropic)                           [Configure] │
│  ─────────────────────────────────────────────────────────   │
│  Status: ● Connected                                         │
│  API Key: sk-****1234                                        │
│                                                              │
│  Available Models:                                           │
│    ✓ Claude 3 Opus                                           │
│    ✓ Claude 3 Sonnet                                         │
│    ✓ Claude 3 Haiku                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Page Specifications

### 1. Chat Page (Main)

**Layout**:
- Sidebar (left)
- Main content (right)
  - Header (fixed, 64px)
  - Chat area (scrollable, flex-grow)
  - Input area (fixed, auto-height)

**States**:
- Empty state: Welcome message, quick actions
- Loading state: Skeleton messages
- Error state: Error banner with retry
- Streaming state: Typing indicator, partial content

### 2. Welcome Screen

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [Apex Smart Logo]                         │
│                                                              │
│              Welcome to Apex Smart                           │
│     Your premium AI assistant with multi-provider support    │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ 📝 Write a poem│  │ 💻 Code review │  │ 🔍 Research    │ │
│  │ about nature   │  │ my Python code │  │ quantum comp   │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Type a message or upload a file to get started...     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3. Settings Page

**Layout**: Full-page or modal
**Sections**: As described in Settings Modal

---

## Animations & Interactions

### Page Transitions
- Sidebar slide: 300ms ease-out
- Message appear: 200ms fade-up
- Modal enter: 250ms scale + fade

### Micro-interactions

**Button Hover**:
```css
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-fast) var(--ease-default);
}
```

**Message Entry**:
```css
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: messageAppear 200ms var(--ease-out);
}
```

**Typing Indicator**:
```
● ● ●  (bouncing dots)
```

**Streaming Text**:
- Smooth character-by-character reveal
- Cursor blink during generation
- Auto-scroll to bottom

### Loading States

**Skeleton Loading**:
```
┌──────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Progress Indicators**:
- Linear progress for file uploads
- Circular spinner for API calls
- Pulse animation for processing

---

## Responsive Behavior

### Mobile (< 768px)

**Sidebar**:
- Hidden by default
- Toggle button in header
- Slides in from left with overlay
- Full width (minus safe areas)

**Chat**:
- Full width
- Input area fixed at bottom
- Messages full width

**Header**:
- Hamburger menu button
- Compact provider selector

### Tablet (768px - 1024px)

**Sidebar**:
- Collapsible to icon-only (80px)
- Expand on hover or toggle

**Chat**:
- Slightly reduced message max-width
- Adjusted padding

### Desktop (> 1024px)

**Sidebar**:
- Always visible
- Can be manually collapsed

**Chat**:
- Optimal reading width (max 900px centered)
- Comfortable spacing

---

## Accessibility

### Keyboard Navigation
- Tab order follows visual order
- Enter to send message
- Escape to close modals
- Arrow keys for dropdowns
- Ctrl+K for quick actions

### Screen Readers
- ARIA labels on all interactive elements
- Live regions for streaming content
- Skip links for navigation
- Focus management for modals

### Visual
- Minimum contrast ratio: 4.5:1
- Focus indicators: 2px outline
- Reduced motion support: `@media (prefers-reduced-motion)`
- Scalable fonts (rem units)

---

## Component Library Structure

```
frontend/src/components/
├── Layout/
│   ├── Sidebar/
│   │   ├── index.tsx
│   │   ├── ConversationItem.tsx
│   │   └── ConversationList.tsx
│   ├── Header/
│   │   ├── index.tsx
│   │   └── ProviderSelector.tsx
│   └── MainLayout.tsx
├── Chat/
│   ├── MessageList/
│   │   ├── index.tsx
│   │   ├── UserMessage.tsx
│   │   └── AssistantMessage.tsx
│   ├── MessageInput/
│   │   ├── index.tsx
│   │   ├── FileAttachment.tsx
│   │   └── TextInput.tsx
│   ├── CodeBlock/
│   │   ├── index.tsx
│   │   └── SyntaxHighlighter.tsx
│   └── TypingIndicator.tsx
├── Settings/
│   ├── SettingsModal.tsx
│   ├── ProviderCard.tsx
│   └── ThemeSelector.tsx
├── UI/
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   ├── Dropdown/
│   ├── Tooltip/
│   ├── Badge/
│   ├── Skeleton/
│   └── Icon/
└── Providers/
    ├── ProviderIcon.tsx
    └── ProviderBadge.tsx
```

---

## State Management

### Global State (Zustand)

```typescript
interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Providers
  providers: Provider[];
  activeProvider: string;
  setActiveProvider: (id: string) => void;
}
```

### Server State (React Query)

- Conversations list
- Messages
- File uploads
- Provider status

### Local State

- Input text
- File attachments
- Modal open states
- UI animations
