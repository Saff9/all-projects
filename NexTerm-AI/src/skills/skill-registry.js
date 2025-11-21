/**
 * SkillRegistry — Plugin system for agent skills/tools
 * Each skill is a tool the AI can call during its reasoning loop
 */
export class SkillRegistry {
    constructor() {
        this.skills = new Map();
        this.plugins = new Map();
        this.loadedModules = new WeakSet();
        this.hooks = new Map([
            ['beforeExecute', []],
            ['afterExecute', []],
            ['onRegister', []],
            ['onError', []]
        ]);
    }

    /**
     * Load external skill/plugin from URL or module path
     * Supports ESM modules, inline definitions, and remote plugins
     */
    async loadPlugin(source, options = {}) {
        if (typeof source === 'string') {
            if (source.startsWith('http:') || source.startsWith('https:')) {
                return this.loadRemotePlugin(source, options);
            }
            if (source.endsWith('.js') || source.endsWith('.mjs')) {
                return this.loadModulePlugin(source, options);
            }
        }
        
        if (typeof source === 'object' && source.skills) {
            return this.loadPluginBundle(source, options);
        }

        throw new Error('Unsupported plugin format');
    }

    async loadRemotePlugin(url, options) {
        const response = await fetch(url, { credentials: 'omit' });
        const code = await response.text();
        const blob = new Blob([code], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        
        try {
            const plugin = await import(moduleUrl);
            return this.registerPlugin(plugin.default || plugin, options);
        } finally {
            URL.revokeObjectURL(moduleUrl);
        }
    }

    async loadModulePlugin(path, options) {
        const plugin = await import(path);
        return this.registerPlugin(plugin.default || plugin, options);
    }

    registerPlugin(plugin, options = {}) {
        if (this.loadedModules.has(plugin)) return false;
        
        if (plugin.skills) {
            plugin.skills.forEach(skill => this.register(skill));
        }
        
        if (plugin.hooks) {
            Object.entries(plugin.hooks).forEach(([name, handler]) => {
                this.addHook(name, handler);
            });
        }

        this.plugins.set(plugin.name || `plugin_${Date.now()}`, {
            ...plugin,
            loadedAt: Date.now(),
            options
        });

        this.loadedModules.add(plugin);
        return true;
    }

    addHook(event, handler) {
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
    }

    async triggerHooks(event, data) {
        const handlers = this.hooks.get(event) || [];
        for (const handler of handlers) {
            try {
                await handler(data);
            } catch (e) {
                console.error(`Hook error [${event}]:`, e);
            }
        }
    }

    /**
     * Register a skill
     * @param {Object} skill - {name, description, parameters, execute, icon, trigger}
     */
    register(skill) {
        if (!skill.name || !skill.execute) {
            throw new Error('Skill must have name and execute function');
        }
        this.skills.set(skill.name, {
            name: skill.name,
            description: skill.description || '',
            parameters: skill.parameters || { type: 'object', properties: {} },
            execute: skill.execute,
            icon: skill.icon || '🔧',
            trigger: skill.trigger || null,
            isAIPowered: skill.isAIPowered || false,
            enabled: true,
        });
    }

    /**
     * Execute a skill by name
     */
    async execute(name, args = {}) {
        const skill = this.skills.get(name);
        if (!skill) throw new Error(`Unknown skill: ${name}`);
        if (!skill.enabled) throw new Error(`Skill disabled: ${name}`);

        try {
            const result = await Promise.race([
                skill.execute(args),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Skill '${name}' timed out (15s)`)), 15000)
                ),
            ]);
            return { success: true, result: typeof result === 'string' ? result : JSON.stringify(result) };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Get all skills as tool definitions (for AI system prompt)
     */
    getToolDefinitions() {
        const tools = [];
        for (const [, skill] of this.skills) {
            if (!skill.enabled) continue;
            tools.push({
                name: skill.name,
                description: skill.description,
                parameters: skill.parameters,
            });
        }
        return tools;
    }

    /**
     * Get skill info for display
     */
    getSkillList() {
        const list = [];
        for (const [, skill] of this.skills) {
            list.push({
                name: skill.name,
                description: skill.description,
                icon: skill.icon,
                trigger: skill.trigger,
                enabled: skill.enabled,
                isAIPowered: skill.isAIPowered,
            });
        }
        return list;
    }

    /**
     * Toggle a skill on/off
     */
    toggle(name) {
        const skill = this.skills.get(name);
        if (skill) skill.enabled = !skill.enabled;
    }

    /**
     * Check if a slash command matches a skill trigger
     */
    matchTrigger(input) {
        for (const [, skill] of this.skills) {
            if (skill.trigger && input.startsWith(skill.trigger)) {
                const args = input.slice(skill.trigger.length).trim();
                return { skill, args };
            }
        }
        return null;
    }
}
