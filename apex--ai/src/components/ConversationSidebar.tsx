"use client";

import { Conversation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, X, Menu, Settings, Sparkles } from 'lucide-react';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onSettingsOpen?: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
  onSettingsOpen,
}: ConversationSidebarProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden glass-strong shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 glass-strong border-r border-border/50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-sora font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Apex AI</h1>
                <p className="text-xs text-muted-foreground">Made in Kashmir</p>
              </div>
            </div>
            <Button 
              onClick={onNew} 
              className="w-full gap-2 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-sm">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin!</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`
                      group flex items-center gap-2 p-3 rounded-xl cursor-pointer
                      transition-all duration-200
                      ${activeId === conv.id 
                        ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                        : 'hover:bg-accent/50'
                      }
                    `}
                    onClick={() => onSelect(conv.id)}
                  >
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.messages.length} messages
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50 space-y-3">
            {onSettingsOpen && (
              <Button
                variant="ghost"
                onClick={onSettingsOpen}
                className="w-full justify-start gap-2 glass"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            )}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Developed by <span className="font-medium text-foreground/80">Saffan</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Proudly from Kashmir
              </p>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
