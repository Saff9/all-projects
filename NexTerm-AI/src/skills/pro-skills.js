/**
 * Pro Skills — AI-powered professional tools
 * These construct specialized prompts and require an AI provider.
 * Each skill's execute() returns a prompt object { systemPrompt, userPrompt }
 * The agent routes these through the active provider.
 */

function aiSkill({ name, description, icon, trigger, parameters, buildPrompt }) {
    return {
        name,
        description,
        icon,
        trigger,
        parameters,
        isAIPowered: true,
        async execute(args) {
            // returns { systemPrompt, userPrompt } — agent handles the AI call
            return buildPrompt(args);
        },
    };
}

// ── Engineering Skills ──

export const explainCodeSkill = aiSkill({
    name: 'explain_code',
    description: 'Explain code step-by-step. Breaks down what each part does, identifies patterns, complexity, and potential issues.',
    icon: '📖',
    trigger: '/explain ',
    parameters: {
        type: 'object',
        properties: { code: { type: 'string', description: 'Code to explain' } },
        required: ['code'],
    },
    buildPrompt: ({ code }) => ({
        systemPrompt: 'You are a senior software engineer and educator. Explain code clearly and thoroughly. Break it into logical sections, explain what each part does, identify design patterns, mention time/space complexity where relevant, and flag any potential bugs or improvements. Use markdown formatting with code blocks.',
        userPrompt: `Explain this code step by step:\n\n\`\`\`\n${code}\n\`\`\``,
    }),
});

export const debugCodeSkill = aiSkill({
    name: 'debug_code',
    description: 'Find bugs in code. Analyzes for logical errors, edge cases, security issues, and suggests fixes with corrected code.',
    icon: '🐛',
    trigger: '/debug ',
    parameters: {
        type: 'object',
        properties: { code: { type: 'string', description: 'Code to debug' } },
        required: ['code'],
    },
    buildPrompt: ({ code }) => ({
        systemPrompt: 'You are a senior debugger and code reviewer. Analyze the code for: 1) Logical bugs 2) Edge cases not handled 3) Security vulnerabilities 4) Performance issues 5) Style/best-practice violations. For each issue found, explain WHY it\'s a problem and provide the FIXED code. If the code looks correct, say so and suggest improvements.',
        userPrompt: `Debug this code — find all issues and provide fixes:\n\n\`\`\`\n${code}\n\`\`\``,
    }),
});

export const codeReviewSkill = aiSkill({
    name: 'code_review',
    description: 'Professional code review. Evaluates code quality, architecture, security, performance, and maintainability with actionable feedback.',
    icon: '🔍',
    trigger: '/review ',
    parameters: {
        type: 'object',
        properties: { code: { type: 'string', description: 'Code to review' } },
        required: ['code'],
    },
    buildPrompt: ({ code }) => ({
        systemPrompt: 'You are a staff engineer conducting a code review. Evaluate: 1) Architecture & design 2) Code quality & readability 3) Error handling 4) Security 5) Performance 6) Test coverage considerations 7) Naming conventions. Rate overall quality (1-10) and provide specific, actionable feedback. Be constructive, not just critical.',
        userPrompt: `Review this code professionally:\n\n\`\`\`\n${code}\n\`\`\``,
    }),
});

export const sqlGenSkill = aiSkill({
    name: 'sql_gen',
    description: 'Generate SQL queries from plain English descriptions. Supports complex joins, aggregations, subqueries, and optimization hints.',
    icon: '🗄️',
    trigger: '/sql ',
    parameters: {
        type: 'object',
        properties: { description: { type: 'string', description: 'What the query should do' } },
        required: ['description'],
    },
    buildPrompt: ({ description }) => ({
        systemPrompt: 'You are a database expert. Generate clean, optimized SQL queries from plain English descriptions. Include: 1) The SQL query with proper formatting 2) Explanation of what it does 3) Index recommendations if applicable 4) Performance notes for large datasets. Support PostgreSQL syntax by default. If the user mentions a specific database, adapt accordingly.',
        userPrompt: `Write an SQL query for: ${description}`,
    }),
});

export const regexBuildSkill = aiSkill({
    name: 'regex_build',
    description: 'Build regex patterns from plain English. Returns the pattern, explains each part, and provides test examples.',
    icon: '🔣',
    trigger: '/regex ',
    parameters: {
        type: 'object',
        properties: { description: { type: 'string', description: 'What the regex should match' } },
        required: ['description'],
    },
    buildPrompt: ({ description }) => ({
        systemPrompt: 'You are a regex expert. Build regular expressions from plain English descriptions. Provide: 1) The regex pattern 2) A breakdown explaining each part 3) Test cases (what it matches and doesn\'t match) 4) Common pitfalls. Use JavaScript-compatible regex syntax.',
        userPrompt: `Build a regex that: ${description}`,
    }),
});

export const apiDesignSkill = aiSkill({
    name: 'api_design',
    description: 'Design RESTful APIs from descriptions. Returns endpoint structure, methods, request/response schemas, and error handling.',
    icon: '🌐',
    trigger: '/api ',
    parameters: {
        type: 'object',
        properties: { description: { type: 'string', description: 'API feature to design' } },
        required: ['description'],
    },
    buildPrompt: ({ description }) => ({
        systemPrompt: 'You are an API architect. Design RESTful APIs with: 1) Endpoint URLs with proper REST conventions 2) HTTP methods 3) Request/response JSON schemas 4) Authentication requirements 5) Error response format 6) Rate limiting considerations. Follow OpenAPI/Swagger patterns. Be thorough and production-ready.',
        userPrompt: `Design a REST API for: ${description}`,
    }),
});

// ── Student Skills ──

export const solveMathSkill = aiSkill({
    name: 'solve_math',
    description: 'Solve math problems step-by-step. Supports algebra, calculus, statistics, linear algebra, differential equations, and proofs.',
    icon: '📐',
    trigger: '/solve ',
    parameters: {
        type: 'object',
        properties: { problem: { type: 'string', description: 'Math problem to solve' } },
        required: ['problem'],
    },
    buildPrompt: ({ problem }) => ({
        systemPrompt: 'You are a mathematics professor and tutor. Solve the problem STEP BY STEP, showing all work. For each step, explain the reasoning. If there are multiple approaches, mention them. Include: 1) Problem identification 2) Method selection 3) Step-by-step solution 4) Final answer clearly boxed 5) Verification if applicable. Use LaTeX-style notation where helpful.',
        userPrompt: `Solve this step by step: ${problem}`,
    }),
});

export const studyNotesSkill = aiSkill({
    name: 'study_notes',
    description: 'Generate comprehensive study notes on any topic. Structured with key concepts, definitions, examples, and summary.',
    icon: '📝',
    trigger: '/study ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Topic to create notes for' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are an expert tutor creating study materials. Generate comprehensive study notes with: 1) Overview/introduction 2) Key concepts with clear definitions 3) Important formulas/rules 4) Worked examples 5) Common mistakes to avoid 6) Quick-reference summary 7) Related topics to explore. Use clear headings, bullet points, and tables where appropriate.',
        userPrompt: `Create detailed study notes on: ${topic}`,
    }),
});

export const flashcardsSkill = aiSkill({
    name: 'flashcards',
    description: 'Generate Q&A flashcards for any topic. Perfect for exam preparation and spaced repetition learning.',
    icon: '🃏',
    trigger: '/flashcards ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Topic for flashcards' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are creating flashcards for a student. Generate 10-15 Q&A pairs that cover the most important concepts. Format each as:\n\n**Q:** [Question]\n**A:** [Concise but complete answer]\n\nProgress from basic definitions to application-level questions. Include a mix of factual recall, conceptual understanding, and problem-solving.',
        userPrompt: `Create flashcards for: ${topic}`,
    }),
});

export const quizSkill = aiSkill({
    name: 'quiz',
    description: 'Generate practice quiz questions with answers. Multiple choice, short answer, and problem-solving formats.',
    icon: '❓',
    trigger: '/quiz ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Topic for quiz' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are creating a practice quiz. Generate 8-10 questions mixing: 1) Multiple choice (4 options, one correct) 2) True/False with explanation 3) Short answer 4) Problem-solving. After all questions, provide an ANSWER KEY with explanations for each answer. Mark difficulty level (Easy/Medium/Hard) for each question.',
        userPrompt: `Create a practice quiz on: ${topic}`,
    }),
});

export const researchSkill = aiSkill({
    name: 'research',
    description: 'Deep-dive research summary on any topic. Provides overview, key findings, current state, controversies, and further reading.',
    icon: '🔬',
    trigger: '/research ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Topic to research' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are a research analyst. Provide a comprehensive research brief covering: 1) Background & context 2) Key concepts & definitions 3) Current state of knowledge 4) Important studies/developments 5) Different perspectives/debates 6) Practical applications 7) Open questions & future directions 8) Recommended further reading. Be thorough, balanced, and cite specific examples where possible.',
        userPrompt: `Research brief on: ${topic}`,
    }),
});

export const eli5Skill = aiSkill({
    name: 'eli5',
    description: 'Explain complex concepts in simple language. Uses analogies, everyday examples, and builds understanding progressively.',
    icon: '🧒',
    trigger: '/eli5 ',
    parameters: {
        type: 'object',
        properties: { concept: { type: 'string', description: 'Concept to simplify' } },
        required: ['concept'],
    },
    buildPrompt: ({ concept }) => ({
        systemPrompt: 'You are explaining a concept to someone with no background knowledge. Use: 1) A simple one-sentence summary 2) An everyday analogy 3) A step-by-step build-up from basics 4) Real-world examples 5) Common misconceptions corrected. Avoid jargon. If you must use technical terms, define them immediately. Your goal is genuine understanding, not dumbing down.',
        userPrompt: `Explain like I'm 5: ${concept}`,
    }),
});

// ── Content Creator Skills ──

export const essayDraftSkill = aiSkill({
    name: 'essay',
    description: 'Draft structured essays or articles. Includes thesis, outline, arguments with evidence, and conclusion.',
    icon: '✍️',
    trigger: '/essay ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Essay topic or prompt' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are a professional writer and writing instructor. Draft a well-structured essay with: 1) Compelling introduction with a clear thesis 2) 3-4 body paragraphs, each with a topic sentence, supporting evidence, and analysis 3) Counterargument acknowledgment 4) Strong conclusion that synthesizes the argument 5) Writing quality that is clear, concise, and engaging. The essay should be around 800-1200 words.',
        userPrompt: `Write an essay on: ${topic}`,
    }),
});

export const rewriteSkill = aiSkill({
    name: 'rewrite',
    description: 'Improve writing quality. Enhances clarity, flow, grammar, tone, and impact while preserving the original meaning.',
    icon: '✨',
    trigger: '/rewrite ',
    parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Text to rewrite' } },
        required: ['text'],
    },
    buildPrompt: ({ text }) => ({
        systemPrompt: 'You are a professional editor. Rewrite the text to improve: 1) Clarity and conciseness 2) Grammar and punctuation 3) Sentence flow and rhythm 4) Word choice (remove filler, strengthen verbs) 5) Overall impact. Show the rewritten version, then list the key changes you made and why. Preserve the original meaning and tone.',
        userPrompt: `Rewrite and improve this text:\n\n${text}`,
    }),
});

export const seoContentSkill = aiSkill({
    name: 'seo_content',
    description: 'Generate SEO-optimized content. Includes keyword-rich headings, meta description, and structured content for ranking.',
    icon: '📈',
    trigger: '/seo ',
    parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'Content topic for SEO' } },
        required: ['topic'],
    },
    buildPrompt: ({ topic }) => ({
        systemPrompt: 'You are an SEO content strategist. Create SEO-optimized content with: 1) SEO title (60 chars) 2) Meta description (155 chars) 3) Target keywords (primary + secondary) 4) H1 heading 5) Structured content with H2/H3 headings incorporating keywords naturally 6) Internal linking suggestions 7) The full article/blog post (800-1200 words). Balance SEO optimization with readability — no keyword stuffing.',
        userPrompt: `Create SEO-optimized content for: ${topic}`,
    }),
});

export const emailDraftSkill = aiSkill({
    name: 'email',
    description: 'Draft professional emails. Specify the context and tone (formal, friendly, follow-up, cold outreach, etc).',
    icon: '📧',
    trigger: '/email ',
    parameters: {
        type: 'object',
        properties: { context: { type: 'string', description: 'Email context and purpose' } },
        required: ['context'],
    },
    buildPrompt: ({ context }) => ({
        systemPrompt: 'You are a professional communication expert. Draft an email that is: 1) Clear and purposeful — every sentence has a reason 2) Appropriately toned for the context 3) Well-structured (greeting, purpose, details, call-to-action, sign-off) 4) Concise but complete. Provide the email with subject line. Offer 2-3 alternative subject lines.',
        userPrompt: `Draft a professional email for: ${context}`,
    }),
});

export const proofreadSkill = aiSkill({
    name: 'proofread',
    description: 'Professional proofreading. Fixes grammar, spelling, punctuation, style issues, and provides the corrected version.',
    icon: '📋',
    trigger: '/proofread ',
    parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Text to proofread' } },
        required: ['text'],
    },
    buildPrompt: ({ text }) => ({
        systemPrompt: 'You are a professional proofreader and copy editor. 1) Fix all grammar, spelling, and punctuation errors 2) Improve sentence structure where needed 3) Flag awkward phrasing 4) Check consistency in style and tense 5) Provide the CORRECTED version first, then list all changes made in a table format (Original → Correction → Reason).',
        userPrompt: `Proofread this text:\n\n${text}`,
    }),
});

// ── General Pro Skills ──

export const compareSkill = aiSkill({
    name: 'compare',
    description: 'Compare two concepts, technologies, approaches, or options. Provides structured comparison with pros, cons, and recommendation.',
    icon: '⚖️',
    trigger: '/compare ',
    parameters: {
        type: 'object',
        properties: { items: { type: 'string', description: 'Items to compare (e.g., "React vs Vue")' } },
        required: ['items'],
    },
    buildPrompt: ({ items }) => ({
        systemPrompt: 'You are an expert analyst. Provide a thorough, balanced comparison with: 1) Brief overview of each option 2) Feature-by-feature comparison table 3) Pros and cons of each 4) Best use cases for each 5) Your recommendation with reasoning. Be objective and evidence-based. Acknowledge tradeoffs.',
        userPrompt: `Compare: ${items}`,
    }),
});

export const summarizeSkill = aiSkill({
    name: 'ai_summarize',
    description: 'AI-powered intelligent summarization. Extracts key points, main arguments, and provides a concise overview with bullet points.',
    icon: '📋',
    trigger: '/aisummarize ',
    parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'Text to summarize' } },
        required: ['text'],
    },
    buildPrompt: ({ text }) => ({
        systemPrompt: 'You are a professional summarizer. Provide: 1) A one-paragraph executive summary 2) Key points as bullet points 3) Main conclusions/takeaways 4) Any action items or next steps mentioned. Be concise but don\'t lose important nuance.',
        userPrompt: `Summarize this:\n\n${text}`,
    }),
});

export const translateSkill = aiSkill({
    name: 'translate',
    description: 'AI-powered translation with context awareness. Preserves tone, idioms, and cultural nuances.',
    icon: '🌍',
    trigger: '/translate ',
    parameters: {
        type: 'object',
        properties: {
            text: { type: 'string', description: 'Text to translate' },
            to: { type: 'string', description: 'Target language' },
        },
        required: ['text', 'to'],
    },
    buildPrompt: ({ text, to = 'English' }) => ({
        systemPrompt: `You are a professional translator. Translate the text to ${to}. Preserve: 1) Original meaning and nuance 2) Tone and register 3) Cultural context. If there are idioms that don't translate directly, provide the closest equivalent with a note. Provide the translation, then briefly note any tricky translation decisions you made.`,
        userPrompt: `Translate to ${to}:\n\n${text}`,
    }),
});

/**
 * Register all pro skills
 */
export function registerProSkills(registry) {
    const skills = [
        explainCodeSkill, debugCodeSkill, codeReviewSkill,
        sqlGenSkill, regexBuildSkill, apiDesignSkill,
        solveMathSkill, studyNotesSkill, flashcardsSkill,
        quizSkill, researchSkill, eli5Skill,
        essayDraftSkill, rewriteSkill, seoContentSkill,
        emailDraftSkill, proofreadSkill,
        compareSkill, summarizeSkill, translateSkill,
    ];
    skills.forEach(s => registry.register(s));
}
