"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Conversation, Citation } from '@/lib/types';
import { getSettings, getRateLimitData, incrementRateLimit, isRateLimited } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { ConversationSidebar } from './ConversationSidebar';
import { SettingsDialog } from './SettingsDialog';
import { SnowEffect } from './SnowEffect';
import { ApexLogo, ApexLogoText } from './ApexLogo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Settings, AlertCircle, Zap, Sun, Moon, Monitor, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function getConversationsFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('apex-conversations');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

function saveConversationsToStorage(conversations: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('apex-conversations', JSON.stringify(conversations));
}

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('g:llama-3.3-70b-versatile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ count: 0, limit: 70 });
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getConversationsFromStorage();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
      if (stored.some(c => c.messages.length > 0)) {
        setHasStartedChatting(true);
      }
    }
    setRateLimitInfo(getRateLimitData());
  }, []);

  useEffect(() => {
    saveConversationsToStorage(conversations);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeConversationId, conversations]);

  const handleFeedback = useCallback((messageId: string, feedback: 'up' | 'down' | null) => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: c.messages.map(m => 
            m.id === messageId ? { ...m, feedback } : m
          ),
        };
      }
      return c;
    }));
  }, [activeConversationId]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (isRateLimited()) {
      toast.error("You've reached your daily limit of 70 requests. Try again tomorrow!");
      return;
    }

    setHasStartedChatting(true);

    let convId = activeConversationId;
    
    if (!convId) {
      const newConv: Conversation = {
        id: generateId(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        const isFirstMessage = c.messages.length === 0;
        return {
          ...c,
          title: isFirstMessage ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : c.title,
          messages: [...c.messages, userMessage],
          updatedAt: new Date(),
        };
      }
      return c;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const currentConv = conversations.find(c => c.id === convId);
      const messagesForApi = [
        ...(currentConv?.messages || []).map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: userMessage.role, content: userMessage.content },
      ];

      const settings = getSettings();
      const apiKeys = settings.apiKeys;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForApi,
          model: selectedModel,
          apiKeys: {
            groq: apiKeys.groq || undefined,
            huggingface: apiKeys.huggingface || undefined,
            openrouter: apiKeys.openrouter || undefined,
            search: apiKeys.search || undefined,
          },
        }),
      });

      const data = await response.json();

      const newRateLimit = incrementRateLimit();
      setRateLimitInfo(newRateLimit);

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        citations: data.citations as Citation[] | undefined,
      };

      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: new Date(),
          };
        }
        return c;
      }));
    } catch (error) {
      const errorContent = error instanceof Error 
        ? error.message 
        : "I'm having trouble right now. Please try again in a moment.";

      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };

      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, errorMessage],
            updatedAt: new Date(),
          };
        }
        return c;
      }));

      toast.error('Message failed', {
        description: 'Check Settings for API keys or try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const remainingRequests = rateLimitInfo.limit - rateLimitInfo.count;
  const isNearLimit = remainingRequests <= 10;

  const ThemeIcon = mounted ? (theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor) : Monitor;

  return (
    <div className="flex h-screen overflow-hidden">
      <SnowEffect enabled={!hasStartedChatting} />
      
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
        }}
        onNew={createNewConversation}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 glass-strong border-b border-border/50 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 ml-10 lg:ml-0">
            <ApexLogo size="sm" animated={false} />
            <span className="font-sora font-semibold text-sm sm:text-base hidden sm:inline truncate max-w-[150px]">
              {activeConversation?.title || 'Apex AI'}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isNearLimit && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>{remainingRequests} left</span>
              </div>
            )}
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="glass h-9 w-9">
                  <ThemeIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong">
                <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
                  <Sun className="w-4 h-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
                  <Moon className="w-4 h-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
                  <Monitor className="w-4 h-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="glass h-9 w-9"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin"
        >
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-full">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <ApexLogo size="xl" animated className="mb-6 sm:mb-8" />
                <ApexLogoText size="lg" className="mb-3" />
                <p className="text-muted-foreground max-w-md mb-2 text-sm sm:text-base">
                  Fast. Smart. Calm on your eyes.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/70 mb-6 sm:mb-8">
                  Developed by Saffan, proudly from Kashmir
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-lg w-full">
                  {[
                    { icon: '🧠', text: 'Explain quantum computing' },
                    { icon: '🏔️', text: 'Write about Kashmir' },
                    { icon: '💻', text: 'Help me with coding' },
                    { icon: '🔍', text: 'Search the web' },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(prompt.text);
                        textareaRef.current?.focus();
                      }}
                      className="group p-3 sm:p-4 glass rounded-xl text-xs sm:text-sm text-left hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <span className="text-base sm:text-lg mr-2">{prompt.icon}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{remainingRequests} of {rateLimitInfo.limit} requests remaining today</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 pb-4">
                {activeConversation.messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onFeedback={handleFeedback}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl glass-strong flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                    <div className="glass-strong rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 sm:right-8 z-20 rounded-full shadow-lg glass-strong"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}

        <div className="p-3 sm:p-4 glass-strong border-t border-border/50 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRateLimited() ? "Daily limit reached. Try again tomorrow!" : "Ask Apex AI anything..."}
                  disabled={isRateLimited()}
                  className="min-h-[48px] sm:min-h-[52px] max-h-[150px] sm:max-h-[200px] resize-none glass border-0 focus-visible:ring-1 focus-visible:ring-primary/50 pr-12 text-sm sm:text-base"
                  rows={1}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isRateLimited()}
                size="icon"
                className="h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 sm:mt-3">
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Apex AI by Saffan
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Made with love in Kashmir
              </p>
            </div>
          </div>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
