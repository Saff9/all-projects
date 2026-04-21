import { useState } from "react";
import { useMemoryStore } from "../../store/memoryStore";
import { Brain, Trash2, Plus, Search, Calendar, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function MemoryManager() {
  const { facts, addFacts, removeFact, clearFacts } = useMemoryStore();
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newCategory.trim() || !newContent.trim()) {
      toast.error("Please provide both Category and Content");
      return;
    }
    const newFact = {
      id: `manual_${Date.now()}`,
      category: newCategory.toLowerCase().replace(/\s+/g, "_"),
      content: newContent.trim(),
      confidence: 1.0,
      timestamp: Date.now(),
    };
    addFacts([newFact]);
    setNewCategory("");
    setNewContent("");
    toast.success("Long-term memory fact added successfully!");
  };

  const filteredFacts = facts.filter(
    (f) =>
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-md border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">Long-Term Memory Layer</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">Manage persistent learned facts, preferences, and architecture context across sessions.</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all learned long-term memories?")) {
              clearFacts();
              toast.success("All memories cleared");
            }
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl hover:bg-red-100 dark:hover:bg-red-900/60 transition shadow-xs active:scale-95 cursor-pointer text-center"
        >
          <ShieldAlert size={14} />
          <span>Clear All Memories</span>
        </button>
      </div>

      {/* Add New Fact Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-inner items-start">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category (e.g. language_preference)"
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono shadow-inner w-full"
        />
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Fact Content (e.g. User prefers TypeScript)"
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-sans shadow-inner w-full"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer text-center"
        >
          <Plus size={16} />
          <span>Inject Memory Fact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search learned memory facts..."
          className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-sans shadow-inner"
        />
      </div>

      {/* Facts List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 sm:pr-2">
        {filteredFacts.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-sans bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            No long-term memory facts found. Start chatting or add one above!
          </div>
        ) : (
          filteredFacts.map((fact) => (
            <div
              key={fact.id}
              className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 transition hover:border-emerald-500/50 shadow-xs gap-2"
            >
              <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-mono tracking-wider truncate max-w-full">
                    {fact.category.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono shrink-0">
                    <Calendar size={10} />
                    {new Date(fact.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-sans break-words">{fact.content}</p>
              </div>

              <button
                onClick={() => {
                  removeFact(fact.id);
                  toast.success("Memory fact pruned");
                }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition cursor-pointer shrink-0"
                title="Delete Fact"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
