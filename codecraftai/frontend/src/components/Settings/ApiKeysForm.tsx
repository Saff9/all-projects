import { useState } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { fetchModels } from "../../services/api";
import { Key, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const PROVIDERS = [
  { id: "groq", name: "Groq LPU", placeholder: "gsk_..." },
  { id: "cerebras", name: "Cerebras CS-3", placeholder: "csk_..." },
  { id: "nvidia", name: "NVIDIA NIM", placeholder: "nvapi-..." },
  { id: "openrouter", name: "OpenRouter", placeholder: "sk-or-v1-..." },
  { id: "gemini", name: "Google Gemini", placeholder: "AIzaSy..." },
  { id: "huggingface", name: "Hugging Face", placeholder: "hf_..." },
  { id: "deepseek", name: "DeepSeek", placeholder: "sk-..." },
  { id: "alibaba", name: "Alibaba DashScope", placeholder: "sk-..." },
  { id: "xai", name: "xAI Grok", placeholder: "xai-..." },
  { id: "together", name: "Together AI", placeholder: "together_..." },
  { id: "mistral", name: "Mistral AI", placeholder: "mistral_..." },
  { id: "anthropic", name: "Anthropic Claude", placeholder: "sk-ant-..." },
  { id: "openai", name: "OpenAI", placeholder: "sk-proj-..." },
  { id: "perplexity", name: "Perplexity AI", placeholder: "pplx-..." },
  { id: "cohere", name: "Cohere", placeholder: "cohere_..." },
  { id: "fireworks", name: "Fireworks AI", placeholder: "fw_..." },
  { id: "sambanova", name: "SambaNova", placeholder: "sn_..." },
  { id: "siliconflow", name: "SiliconFlow", placeholder: "sk-..." },
  { id: "zhipu", name: "Zhipu AI (GLM)", placeholder: "api_..." },
  { id: "moonshot", name: "Moonshot (Kimi)", placeholder: "sk-..." },
];

export default function ApiKeysForm() {
  const { apiKeys, setApiKey } = useSettingsStore();
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(apiKeys);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(false);

  const handleSave = async (id: string) => {
    const val = localKeys[id] || "";
    setApiKey(id, val);
    const pname = PROVIDERS.find((p) => p.id === id)?.name;
    const tid = toast.loading(`Saving ${pname} key & discovering models...`);
    setFetching(true);
    try {
      await fetchModels();
      toast.success(`${pname} API Key saved! 50+ Models successfully updated.`, { id: tid });
    } catch (e: any) {
      toast.error(`Key saved, but model discovery fallback active: ${e.message}`, { id: tid });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shadow-md border border-blue-200 dark:border-blue-800 shrink-0">
          <Key size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">50+ AI Provider Ecosystem API Keys</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">Configure keys to instantly unlock flagship models across global providers. Stored securely in your browser.</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1 sm:pr-2">
        {PROVIDERS.map((p) => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200/60 dark:border-gray-800/60 transition hover:border-blue-500/50 shadow-xs">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 sm:w-1/4 font-mono">{p.name}</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 w-full">
              <div className="relative flex-1 w-full">
                <input
                  type={showKey[p.id] ? "text" : "password"}
                  value={localKeys[p.id] ?? ""}
                  onChange={(e) => setLocalKeys({ ...localKeys, [p.id]: e.target.value })}
                  placeholder={p.placeholder}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white pr-10 font-mono shadow-inner"
                  disabled={fetching}
                />
                <button
                  type="button"
                  onClick={() => setShowKey({ ...showKey, [p.id]: !showKey[p.id] })}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showKey[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={() => handleSave(p.id)}
                disabled={fetching}
                className="flex items-center justify-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 text-center"
              >
                <Check size={14} />
                <span>{fetching ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
