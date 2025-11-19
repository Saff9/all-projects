/**
 * Agent — Core agentic execution engine
 * Implements the reasoning loop: User → AI → Tool Calls → AI → …
 * Also handles AI-powered skills that route specialized prompts.
 */
export class Agent {
    constructor({ providerManager, skillRegistry, contextManager, promptBuilder }) {
        this.providers = providerManager;
        this.skills = skillRegistry;
        this._contextManager = contextManager;
        this.promptBuilder = promptBuilder;

        this.maxIterations = 10;
        this.isRunning = false;
        this.abortController = null;

        // Callbacks
        this.onThinking = () => { };
        this.onChunk = () => { };
        this.onToolCall = () => { };
        this.onToolResult = () => { };
        this.onComplete = () => { };
        this.onError = () => { };
    }

    /**
     * Get the current context manager
     */
    get contextManager() {
        return this._contextManager;
    }

    /**
     * Set the context manager (used for tab switching)
     */
    set contextManager(value) {
        this._contextManager = value;
    }

    /**
     * Alias for contextManager for backward compatibility
     */
    get context() {
        return this._contextManager;
    }

    set context(value) {
        this._contextManager = value;
    }

    /**
     * Process a user message through the agentic loop
     */
    async process(userMessage) {
        if (this.isRunning) throw new Error('Agent is already processing.');

        this.isRunning = true;
        this.abortController = new AbortController();

        try {
            await this.context.addMessage('user', userMessage);

            const knowledge = await this.context.getRelevantKnowledge(userMessage);
            const systemPrompt = this.promptBuilder.build({ knowledge });
            const messages = this.context.buildContext(systemPrompt);
            const tools = this.skills.getToolDefinitions();

            let iterations = 0;
            let finalResponse = '';

            while (iterations < this.maxIterations) {
                iterations++;
                this._checkAbort();
                this.onThinking(iterations);

                try {
                    let fullContent = '';
                    const result = await this.providers.stream(
                        messages,
                        { tools: tools.length ? tools : undefined },
                        (chunk) => {
                            fullContent += chunk;
                            this.onChunk(chunk);
                            this._checkAbort();
                        }
                    );

                    if (result.toolCalls?.length) {
                        const assistantMsg = result.content || '';
                        messages.push({
                            role: 'assistant',
                            content: assistantMsg,
                            tool_calls: result.toolCalls.map(tc => ({
                                id: tc.id,
                                type: 'function',
                                function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
                            })),
                        });

                        for (const toolCall of result.toolCalls) {
                            this._checkAbort();
                            this.onToolCall(toolCall);

                            const skill = this.skills.skills.get(toolCall.name);

                            // Check if it's an AI-powered skill
                            if (skill?.isAIPowered) {
                                const promptData = await skill.execute(toolCall.arguments);
                                const aiResult = await this._processAISkill(promptData);
                                this.onToolResult(toolCall.name, { success: true, result: aiResult });
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    name: toolCall.name,
                                    content: aiResult,
                                });
                            } else {
                                const toolResult = await this.skills.execute(toolCall.name, toolCall.arguments);
                                this.onToolResult(toolCall.name, toolResult);
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    name: toolCall.name,
                                    content: toolResult.success ? toolResult.result : `Error: ${toolResult.error}`,
                                });
                            }
                        }
                        continue;
                    }

                    finalResponse = result.content || fullContent;
                    break;

                } catch (err) {
                    this._checkAbort();
                    throw err;
                }
            }

            if (iterations >= this.maxIterations && !finalResponse) {
                finalResponse = '⚠ Reached maximum reasoning iterations.';
            }

            await this.context.addMessage('assistant', finalResponse);
            this.context.extractKnowledge(userMessage, finalResponse).catch(() => { });
            this.onComplete(finalResponse);
            return finalResponse;

        } catch (err) {
            if (err.name === 'AbortError' || err.message === 'Aborted') {
                this.onError('Request cancelled.');
                return '';
            }
            this.onError(err.message);
            throw err;
        } finally {
            this.isRunning = false;
            this.abortController = null;
        }
    }

    /**
     * Process an AI-powered skill by routing its prompt through the provider
     */
    async _processAISkill({ systemPrompt, userPrompt }) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];

        let fullContent = '';
        const result = await this.providers.stream(
            messages,
            {},
            (chunk) => {
                fullContent += chunk;
                this.onChunk(chunk);
            }
        );

        return result.content || fullContent;
    }

    /**
     * Handle slash commands — both AI-powered and offline skills
     */
    async handleSlashCommand(input) {
        const match = this.skills.matchTrigger(input);
        if (!match) return null;

        const { skill, args } = match;
        const parts = args.split(' ');
        const parsedArgs = this._parseSlashArgs(skill.name, args, parts);

        // AI-powered skill — needs provider
        if (skill.isAIPowered) {
            const promptData = await skill.execute(parsedArgs);
            return {
                skillName: skill.name,
                skillIcon: skill.icon,
                isAIPowered: true,
                promptData,
            };
        }

        // Offline skill — execute directly
        const result = await this.skills.execute(skill.name, parsedArgs);
        return {
            skillName: skill.name,
            skillIcon: skill.icon,
            isAIPowered: false,
            result: result.success ? result.result : `Error: ${result.error}`,
        };
    }

    _parseSlashArgs(name, args, parts) {
        const map = {
            // Core
            calculator: () => ({ expression: args }),
            datetime: () => ({ action: args || 'now', target: parts[1] }),
            notes: () => ({ action: parts[0], title: parts[1], content: parts.slice(2).join(' '), query: parts[1] }),
            code_runner: () => ({ code: args }),
            // Utility
            json: () => ({ json: args }),
            hash: () => ({ text: args }),
            password: () => ({ length: parseInt(parts[0]) || 20 }),
            base64: () => ({ action: parts[0], text: parts.slice(1).join(' ') }),
            convert: () => ({ value: parseFloat(parts[0]), from: parts[1], to: parts[parts.length - 1] }),
            wc: () => ({ text: args }),
            uuid: () => ({}),
            diff: () => {
                const idx = args.indexOf(' vs ');
                return idx > -1 ? { old: args.slice(0, idx), new: args.slice(idx + 4) } : { old: args, new: '' };
            },
            // AI-powered (text-based)
            explain_code: () => ({ code: args }),
            debug_code: () => ({ code: args }),
            code_review: () => ({ code: args }),
            sql_gen: () => ({ description: args }),
            regex_build: () => ({ description: args }),
            api_design: () => ({ description: args }),
            solve_math: () => ({ problem: args }),
            study_notes: () => ({ topic: args }),
            flashcards: () => ({ topic: args }),
            quiz: () => ({ topic: args }),
            research: () => ({ topic: args }),
            eli5: () => ({ concept: args }),
            essay: () => ({ topic: args }),
            rewrite: () => ({ text: args }),
            seo_content: () => ({ topic: args }),
            email: () => ({ context: args }),
            proofread: () => ({ text: args }),
            compare: () => ({ items: args }),
            ai_summarize: () => ({ text: args }),
            translate: () => {
                // "/translate hello world to spanish"
                const toIdx = args.lastIndexOf(' to ');
                return toIdx > -1
                    ? { text: args.slice(0, toIdx), to: args.slice(toIdx + 4) }
                    : { text: args, to: 'English' };
            },
        };
        const parser = map[name];
        return parser ? parser() : { input: args };
    }

    abort() {
        if (this.abortController) this.abortController.abort();
    }

    _checkAbort() {
        if (this.abortController?.signal.aborted) {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            throw err;
        }
    }
}
