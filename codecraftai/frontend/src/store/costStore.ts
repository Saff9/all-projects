import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UsageEntry {
  id: string;
  date: string; // YYYY-MM-DD
  cost: number;
  model: string;
}

interface CostState {
  totalCost: number;
  budgetLimit: number;
  usageLog: UsageEntry[];
  setBudgetLimit: (limit: number) => void;
  addCost: (entry: { cost: number; model: string }) => void;
  clearHistory: () => void;
}

export const useCostStore = create<CostState>()(
  persist(
    (set) => ({
      totalCost: 0,
      budgetLimit: 10, // Default $10
      usageLog: [],
      setBudgetLimit: (limit) => set({ budgetLimit: limit }),
      addCost: ({ cost, model }) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const newEntry: UsageEntry = {
            id: Math.random().toString(36).slice(2, 9),
            date: today,
            cost,
            model,
          };
          return {
            totalCost: state.totalCost + cost,
            usageLog: [...state.usageLog, newEntry],
          };
        }),
      clearHistory: () => set({ totalCost: 0, usageLog: [] }),
    }),
    { name: "code-craft-cost" }
  )
);
