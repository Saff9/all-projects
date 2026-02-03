"use client";

import { Message, Citation } from '@/lib/types';
import { User, Bot, ExternalLink, AlertCircle, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, feedback: 'up' | 'down' | null) => void;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950 border border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
        <span className="text-xs font-medium text-zinc-400">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-zinc-100 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function parseContent(content: string) {
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', content: match[2].trim(), language: match[1] || 'plaintext' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts;
}

export function ChatMessage({ message, onRegenerate, onFeedback }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(message.feedback || null);

  const parsedContent = useMemo(() => parseContent(message.content), [message.content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    onFeedback?.(message.id, newFeedback);
    if (newFeedback) {
      toast.success(type === 'up' ? 'Thanks for the feedback!' : "Sorry about that. We'll improve.");
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-sm ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : isError 
            ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20'
            : 'glass-strong'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 relative ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/10' 
            : isError
              ? 'glass-strong rounded-tl-sm border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10'
              : 'glass-strong rounded-tl-sm'
        }`}>
          <div className="text-sm leading-relaxed break-words">
            {parsedContent.map((part, index) => (
              part.type === 'code' ? (
                <CodeBlock key={index} code={part.content} language={part.language || 'plaintext'} />
              ) : (
                <span key={index} className="whitespace-pre-wrap">{part.content}</span>
              )
            ))}
          </div>
        </div>

        {!isUser && (
          <div className={`flex flex-wrap items-center gap-1 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 sm:h-7 sm:w-7"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              )}
            </Button>
            
            {!isError && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFeedback('up')}
                  className={`h-8 w-8 sm:h-7 sm:w-7 ${feedback === 'up' ? 'text-green-500 bg-green-500/10' : ''}`}
                  title="Good response"
                >
                  <ThumbsUp className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${feedback === 'up' ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFeedback('down')}
                  className={`h-8 w-8 sm:h-7 sm:w-7 ${feedback === 'down' ? 'text-red-500 bg-red-500/10' : ''}`}
                  title="Bad response"
                >
                  <ThumbsDown className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${feedback === 'down' ? 'fill-current' : ''}`} />
                </Button>
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRegenerate}
                    className="h-8 w-8 sm:h-7 sm:w-7"
                    title="Regenerate"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {message.citations.map((citation: Citation, index: number) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: citation.url } }, "*");
                }}
                className="flex items-start gap-2 p-3 rounded-xl glass hover:bg-accent/50 transition-all duration-200 group/link hover:scale-[1.01]"
              >
                <span className="text-xs font-bold text-primary min-w-[24px] h-5 rounded bg-primary/10 flex items-center justify-center">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover/link:text-primary transition-colors">
                    {citation.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {citation.snippet}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        )}

        {isError && (
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2">
            Tip: Check Settings to add your own API keys
          </p>
        )}
      </div>
    </div>
  );
}
