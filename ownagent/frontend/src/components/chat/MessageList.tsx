import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { MessageBubble } from './MessageBubble';
import { Sparkles } from 'lucide-react';

export const MessageList: React.FC = () => {
  const { messages, streamingMessage, streamingMessageId, isLoading } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Welcome to Apex Smart
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Start a conversation by typing a message below. I can help you with
            coding, writing, analysis, and much more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scroll-smooth"
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <MessageBubble key={`${message.id}-${index}`} message={message} />
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <MessageBubble
            message={{
              id: streamingMessageId || 'streaming',
              role: 'assistant',
              content: streamingMessage,
              created_at: new Date().toISOString(),
            }}
            isStreaming={isLoading}
          />
        )}

        {/* Typing indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex gap-4 px-6 py-5">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#3b82f6] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 py-2">
              <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
