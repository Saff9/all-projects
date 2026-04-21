import { useSettingsStore } from "../store/settingsStore";
import { useSkillsStore } from "../store/skillsStore";
import { useMemoryStore } from "../store/memoryStore";
import { useAuthStore } from "../store/authStore";
import { Model, GenerationResult, MemoryFact } from "../types";

const API_BASE = "/api";

function getAuthHeaders() {
  const email = useAuthStore.getState().userEmail || "";
  return {
    "Content-Type": "application/json",
    "X-User-Email": email,
  };
}

export async function fetchModels(typeFilter?: string): Promise<Model[]> {
  const { apiKeys, customProviders } = useSettingsStore.getState();
  const res = await fetch(`${API_BASE}/models`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      api_keys: apiKeys,
      custom_providers: customProviders,
      type: typeFilter,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch models");
  }
  return res.json();
}

export async function generate(params: {
  provider: string;
  model: string;
  prompt: string;
  image?: string;
  generation_type?: string;
  streaming?: boolean;
  onChunk?: (chunk: string) => void;
}): Promise<GenerationResult> {
  const { apiKeys, customProviders } = useSettingsStore.getState();
  const active_skills = useSkillsStore.getState().getActiveSkillIds();
  const long_term_memories = useMemoryStore.getState().facts;

  const { streaming, onChunk, ...restParams } = params;

  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...restParams,
      streaming,
      api_keys: apiKeys,
      custom_providers: customProviders,
      active_skills,
      long_term_memories,
    }),
  });

  if (!res.ok) {
    let errDetail = "Generation failed";
    try {
      const errJson = await res.json();
      errDetail = errJson.detail || errJson.message || errDetail;
    } catch (e) {
      errDetail = await res.text();
    }
    throw new Error(errDetail);
  }

  if (streaming && onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let cost = 0;
    let usage: any = undefined;
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            const jsonStr = cleanLine.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            let data: any;
            try {
              data = JSON.parse(jsonStr);
            } catch {
              // malformed SSE line — skip
              continue;
            }

            if (data.error) {
              // propagate provider error to the user
              throw new Error(data.error);
            }
            if (data.chunk) {
              accumulatedText += data.chunk;
              onChunk(accumulatedText);
            }
            if (data.done) {
              cost = data.cost || 0;
              usage = data.usage;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      type: "text",
      content: accumulatedText,
      cost,
      usage,
    };
  }

  return res.json();
}

export async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(`${API_BASE}/scrape`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to scrape URL");
  }
  const data = await res.json();
  return data.markdown;
}

export async function executeSkills(prompt: string, active_skills: string[]): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/skills/execute`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, active_skills }),
  });
  if (!res.ok) {
    throw new Error("Failed to execute agent skills");
  }
  const data = await res.json();
  return data.results;
}

export async function extractMemories(prompt: string): Promise<MemoryFact[]> {
  const res = await fetch(`${API_BASE}/memory/extract`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    throw new Error("Failed to extract memory facts");
  }
  const data = await res.json();
  return data.facts;
}
