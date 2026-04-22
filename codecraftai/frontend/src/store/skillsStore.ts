import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AgentSkill } from "../types";

interface SkillsState {
  skills: AgentSkill[];
  toggleSkill: (id: string) => void;
  getActiveSkillIds: () => string[];
}

const INITIAL_SKILLS: AgentSkill[] = [
  {
    id: "open_claw",
    name: "Open Claw Navigator",
    description: "Autonomous Web Search, URL Scraping, AST Parsing, and Code Execution simulation.",
    badgeColor: "bg-blue-500",
    enabled: true,
    iconName: "Globe"
  },
  {
    id: "hermes",
    name: "Hermes Function Caller",
    description: "Enforce strict JSON schema adherence, multi-step reasoning, and tool call chaining.",
    badgeColor: "bg-purple-500",
    enabled: true,
    iconName: "Terminal"
  },
  {
    id: "pi",
    name: "Pi Empathetic Reflection",
    description: "Conversational reflection, sentiment analysis, and emotional intelligence alignment.",
    badgeColor: "bg-emerald-500",
    enabled: true,
    iconName: "Heart"
  },
  {
    id: "open_code_ai",
    name: "Open Code AI Agent",
    description: "Full repository AST context, automated git diff generation, and linting verification.",
    badgeColor: "bg-amber-500",
    enabled: true,
    iconName: "Code"
  }
];

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      toggleSkill: (id) =>
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
        })),
      getActiveSkillIds: () => get().skills.filter((s) => s.enabled).map((s) => s.id),
    }),
    { name: "codecraft-skills-store" }
  )
);
