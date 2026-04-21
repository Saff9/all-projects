import { useState } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { Plus, Trash2, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomProviderForm() {
  const { customProviders, addCustomProvider, removeCustomProvider } = useSettingsStore();
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleAdd = () => {
    if (!name || !endpoint) {
      toast.error("Please provide both Name and Endpoint URL");
      return;
    }
    const id = name.toLowerCase().replace(/\s+/g, "-");
    addCustomProvider({ id, name, endpoint, api_key: apiKey });
    setName("");
    setEndpoint("");
    setApiKey("");
    toast.success(`Custom Provider '${name}' added successfully!`);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800 shadow-md">
          <Globe size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">Custom Providers</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">Connect any custom OpenAI-compatible REST endpoint (e.g. LM Studio, Ollama, vLLM).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 items-start">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Provider Name (e.g. Local Ollama)"
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white shadow-inner w-full"
        />
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="Endpoint URL (e.g. http://localhost:11434/v1)"
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white font-mono shadow-inner w-full"
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key (Optional)"
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white font-mono shadow-inner w-full"
          />
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer text-center"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {customProviders.length > 0 && (
        <div className="mt-6 space-y-2 max-h-[20rem] overflow-y-auto pr-1 sm:pr-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 font-mono">Configured Endpoints</h4>
          {customProviders.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="overflow-hidden pr-2 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate font-sans">{p.name}</p>
                <p className="text-[11px] font-mono text-gray-500 truncate">{p.endpoint}</p>
              </div>
              <button
                onClick={() => { removeCustomProvider(p.id); toast.success("Removed custom provider"); }}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0"
                title="Remove Endpoint"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
