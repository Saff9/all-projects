import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isStreaming = false,
}) => {
  const { addToast } = useStore();
  const [isHovered, setIsHovered] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      addToast({ type: 'success', message: 'Message copied!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to copy message' });
    }
  };

  const handleRegenerate = () => {
    addToast({ type: 'info', message: 'Regenerate coming soon' });
  };

  const handleDelete = () => {
    addToast({ type: 'info', message: 'Delete coming soon' });
  };

  return (
    <div
      className={`flex gap-4 px-6 py-5 transition-colors duration-200 ${
        isUser ? '' : 'bg-[var(--bg-secondary)]/30'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-primary)]">
            <User className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#3b82f6] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {isUser ? 'You' : 'Apex Smart'}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent-primary)]"></span>
              </span>
              Generating...
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="prose prose-invert max-w-none text-[var(--text-primary)]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');

                if (match) {
                  return <CodeBlock code={code} language={match[1]} />;
                }

                return (
                  <code className={`${className} px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-sm font-mono`}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-sm">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-lg font-semibold mb-2 mt-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-base font-semibold mb-2 mt-4">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-sm font-semibold mb-2 mt-3">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-[var(--accent-primary)] pl-4 my-3 text-[var(--text-secondary)] text-sm italic">
                    {children}
                  </blockquote>
                );
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-primary)] hover:underline"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Actions */}
        {!isUser && !isStreaming && (
          <div
            className={`flex items-center gap-1 mt-3 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Regenerate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-error)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
