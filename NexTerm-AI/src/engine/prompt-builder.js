/**
 * PromptBuilder — Constructs dynamic system prompts for the AI
 */
export class PromptBuilder {
    constructor(skillRegistry) {
        this.skillRegistry = skillRegistry;
    }

    /**
     * Build the full system prompt
     */
    build(options = {}) {
        const parts = [];

        // Core identity
        parts.push(this._coreIdentity());

        // Available tools/skills
        parts.push(this._skillsSection());

        // Knowledge context
        if (options.knowledge?.length) {
            parts.push(this._knowledgeSection(options.knowledge));
        }

        // User preferences
        if (options.preferences) {
            parts.push(this._preferencesSection(options.preferences));
        }

        // Current context
        parts.push(this._contextSection());

        return parts.join('\n\n');
    }

    _coreIdentity() {
        return `You are NexTerm AI, a powerful agentic AI assistant running inside a terminal interface on the user's phone.

Core behaviors:
- You are helpful, precise, and proactive. Think step-by-step when needed.
- You can use tools/skills to accomplish tasks. When a task would benefit from a tool, USE IT — don't just describe what you could do.
- Be concise in terminal output. Use markdown formatting (bold, code blocks, lists) for clarity.
- If you're unsure, say so honestly. Never fabricate information.
- When you use a tool, explain briefly what you're doing and why.

Response format:
- Use markdown. Code blocks with language tags. Tables where helpful.
- Keep responses focused. Terminal users prefer concise, actionable answers.
- For multi-step tasks, number your steps.`;
    }

    _skillsSection() {
        const tools = this.skillRegistry.getToolDefinitions();
        if (!tools.length) return '';

        const toolDesc = tools.map(t =>
            `- **${t.name}**: ${t.description}`
        ).join('\n');

        return `## Available Tools
You are an intelligent agent running NexTerm AI. You have access to these tools. To use one, respond with a tool call in the format the API expects.

${toolDesc}

VITAL RULES FOR TOOL USAGE:
1. When a user asks a question or makes a request that would benefit from a tool, you MUST use it proactively. Do not ask for permission.
2. Examples:
   - "What time is it in Tokyo?" → call datetime
   - "Search the web for..." → call web_search
   - "Run this python code..." → call code_runner
   - "Format this JSON..." → call json tool
   - "Calculate 50 * 4" → call calculator
3. The user may send you file contents directly in their prompt (e.g. "[File: data.txt]"). You can read these files and use tools on their contents if needed.`;
    }

    _knowledgeSection(knowledge) {
        if (!knowledge.length) return '';
        const facts = knowledge.map(k => `- [${k.topic}]: ${k.fact}`).join('\n');
        return `## Relevant Knowledge (from past conversations)\n${facts}`;
    }

    _preferencesSection(prefs) {
        const lines = [];
        if (prefs.name) lines.push(`User's name: ${prefs.name}`);
        if (prefs.style) lines.push(`Preferred response style: ${prefs.style}`);
        return lines.length ? `## User Preferences\n${lines.join('\n')}` : '';
    }

    _contextSection() {
        const now = new Date();
        return `## Current Context
- Date: ${now.toLocaleDateString('en-US', { dateStyle: 'full' })}
- Time: ${now.toLocaleTimeString('en-US', { timeStyle: 'short' })}
- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
- Platform: NexTerm AI Mobile Terminal v1.0`;
    }
}
