import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MemoryFact } from "../types";

interface MemoryState {
  facts: MemoryFact[];
  addFacts: (newFacts: MemoryFact[]) => void;
  removeFact: (id: string) => void;
  clearFacts: () => void;
}

const INITIAL_FACTS: MemoryFact[] = [
  {
    id: "init_1",
    category: "ui_aesthetic",
    content: "User prefers ultra-premium UI/UX inspired by Linear and LobeHub featuring dark mode, glassmorphism, and radial gradients.",
    confidence: 1.0,
    timestamp: Date.now()
  },
  {
    id: "init_2",
    category: "security_protocol",
    content: "User mandates military-grade AES-GCM client-side encryption with secure passphrase for all local chat history storage.",
    confidence: 1.0,
    timestamp: Date.now()
  }
];

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      facts: INITIAL_FACTS,
      addFacts: (newFacts) =>
        set((state) => {
          const existingIds = new Set(state.facts.map((f) => f.id));
          const uniqueNew = newFacts.filter((f) => !existingIds.has(f.id));
          return { facts: [...state.facts, ...uniqueNew] };
        }),
      removeFact: (id) =>
        set((state) => ({ facts: state.facts.filter((f) => f.id !== id) })),
      clearFacts: () => set({ facts: [] }),
    }),
    { name: "codecraft-memory-store" }
  )
);
