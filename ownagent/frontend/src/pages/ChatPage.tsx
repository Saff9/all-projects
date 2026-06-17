import React from 'react';
import { ChatLayout } from '../components/layout';
import { MessageList, ChatInput } from '../components/chat';
import { SettingsModal } from '../components/settings';
import { useStore } from '../store/useStore';
import { Sparkles, Zap, Code2, Search, PenTool } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { currentConversation, settingsOpen, closeSettings } = useStore();

  return (
    <ChatLayout>
      <div className="h-full flex flex-col">
        {currentConversation ? (
          <>
            <MessageList />
            <ChatInput conversationId={currentConversation.id} />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
      <SettingsModal isOpen={settingsOpen} onClose={closeSettings} />
    </ChatLayout>
  );
};

const WelcomeScreen: React.FC = () => {
  const { sidebarOpen, isMobile } = useStore();

  const examples = [
    {
      icon: <Code2 className="w-5 h-5" />,
      title: 'Write Code',
      description: 'Generate code, debug, or explain algorithms',
      prompt: 'Write a Python function to calculate fibonacci numbers',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Analyze Data',
      description: 'Find patterns and insights in your data',
      prompt: 'Help me analyze this CSV data for trends',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: 'Creative Writing',
      description: 'Draft stories, emails, or documentation',
      prompt: 'Write a short story about a robot learning to paint',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Explain Concepts',
      description: 'Learn complex topics in simple terms',
      prompt: 'Explain quantum computing in simple terms',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div
        className={`w-full max-w-3xl transition-all duration-300 ${
          sidebarOpen && !isMobile ? 'max-w-2xl ml-[280px]' : ''
        }`}
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-success)] rounded-full border-2 border-[var(--bg-primary)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Apex Smart
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            AI-powered assistant for coding, writing, and analysis
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('Example:', example.prompt);
              }}
              className="group flex items-start gap-3 p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 text-left"
            >
              <div className={`p-2 rounded-lg ${example.bgColor} ${example.color}`}>
                {example.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[var(--text-primary)] text-sm group-hover:text-[var(--accent-primary)] transition-colors">
                  {example.title}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {example.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick start hint */}
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px] font-mono">
            ⌘K
          </kbd>{' '}
          or click "New Chat" in the sidebar to get started
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
