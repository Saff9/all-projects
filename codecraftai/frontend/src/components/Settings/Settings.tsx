import { useState } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import ApiKeysForm from "./ApiKeysForm";
import CustomProviderForm from "./CustomProviderForm";
import MemoryManager from "../Memory/MemoryManager";
import { Shield, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { theme, setTheme, passphrase, setPassphrase } = useSettingsStore();
  const [localPass, setLocalPass] = useState(passphrase);

  const handleSavePassphrase = () => {
    if (!localPass.trim()) {
      toast.error("Passphrase cannot be empty");
      return;
    }
    setPassphrase(localPass);
    toast.success("Passphrase updated successfully. Local storage is now secure!");
  };

  return (
    <div className="max-w-4xl mx-auto p-1 sm:p-2 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-sans">Configure encryption, 50+ provider API keys, long-term memory curation, custom inference endpoints, and appearance preferences.</p>
      </div>

      {/* Appearance */}
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition hover:border-amber-500/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shadow-md border border-amber-200 dark:border-amber-800 shrink-0">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">Appearance Theme</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between Light and Dark mode aesthetic.</p>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold text-xs rounded-xl transition shadow-sm active:scale-95 cursor-pointer text-center"
        >
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>

      {/* Encryption Passphrase */}
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 transition hover:border-green-500/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-600 flex items-center justify-center shadow-md border border-green-200 dark:border-green-800 shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">AES-GCM Storage Encryption</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">Your chat history and learned memory facts are encrypted locally using client-side AES-GCM. Set a passphrase to unlock your memory.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={localPass}
            onChange={(e) => setLocalPass(e.target.value)}
            placeholder="Enter secure passphrase..."
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white font-mono shadow-inner w-full"
          />
          <button
            onClick={handleSavePassphrase}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer text-center"
          >
            Save Passphrase
          </button>
        </div>
      </div>

      {/* Long-Term Memory Curation */}
      <MemoryManager />

      <ApiKeysForm />
      <CustomProviderForm />
    </div>
  );
}
