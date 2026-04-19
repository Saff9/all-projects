import { useState, useEffect } from "react";
import { ChatThread } from "../../types";
import { getAllThreads, deleteThread, createThread } from "../../store/chatStore";
import { Plus, Search, MessageSquare, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  activeThreadId: string | null;
  onSelectThread: (thread: ChatThread) => void;
  onNewThread: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatSidebar({ activeThreadId, onSelectThread, onNewThread, isOpen, onClose }: Props) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [search, setSearch] = useState("");

  const loadThreads = async () => {
    const all = await getAllThreads();
    setThreads(all);
  };

  useEffect(() => {
    loadThreads();
  }, [activeThreadId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteThread(id);
    toast.success("Chat thread deleted");
    loadThreads();
    if (activeThreadId === id) {
      onNewThread();
    }
  };

  const handleCreate = async () => {
    const t = await createThread("New Chat");
    onSelectThread(t);
    loadThreads();
    if (onClose) onClose();
  };

  const filtered = threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const content = (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full shadow-sm shrink-0 z-50">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between md:hidden">
          <span className="font-bold text-xs text-gray-900 dark:text-white font-mono uppercase tracking-wider">Conversations</span>
          {onClose && (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-sans"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-sans">No chats found</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                onSelectThread(t);
                if (onClose) onClose();
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition group ${
                activeThreadId === t.id
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                <MessageSquare size={16} className="shrink-0 opacity-70" />
                <span className="text-xs truncate font-sans">{t.title}</span>
              </div>
              <button
                onClick={(e) => handleDelete(e, t.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer shrink-0"
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex h-full">
        {content}
      </div>

      {/* Mobile Drawer View */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-fade-in flex">
          <div className="h-full animate-slide-right">
            {content}
          </div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </>
  );
}
