import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomProviderConfig } from "../types";

interface SettingsState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  passphrase: string;
  setPassphrase: (pass: string) => void;
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;
  customProviders: CustomProviderConfig[];
  addCustomProvider: (config: CustomProviderConfig) => void;
  removeCustomProvider: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      passphrase: "",
      setPassphrase: (passphrase) => set({ passphrase }),
      apiKeys: {
        groq: "",
        cerebras: "",
        nvidia: "",
        openrouter: "",
        gemini: "",
        huggingface: "",
        deepseek: "",
        alibaba: "",
        xai: "",
        together: "",
        mistral: "",
        anthropic: "",
        openai: "",
        perplexity: "",
        cohere: "",
        fireworks: "",
        sambanova: "",
        siliconflow: "",
        zhipu: "",
        moonshot: "",
      },
      setApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
      customProviders: [],
      addCustomProvider: (config) =>
        set((state) => ({ customProviders: [...state.customProviders, config] })),
      removeCustomProvider: (id) =>
        set((state) => ({
          customProviders: state.customProviders.filter((p) => p.id !== id),
        })),
    }),
    { name: "codecraft-settings" }
  )
);
