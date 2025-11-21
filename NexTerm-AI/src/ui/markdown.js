/**
 * Simple markdown parser — converts markdown to HTML
 * Handles: headers, bold, italic, code, lists, blockquotes, links, tables, hr
 */
export function parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // Escape HTML entities first (except in code blocks)
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(`<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);
        return `%%CODEBLOCK_${idx}%%`;
    });

    const inlineCode = [];
    html = html.replace(/`([^`]+)`/g, (_, code) => {
        const idx = inlineCode.length;
        inlineCode.push(`<code>${escapeHtml(code)}</code>`);
        return `%%INLINECODE_${idx}%%`;
    });

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Unordered lists
    html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>');

    // Tables
    html = html.replace(/^\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/gm, (_, header, body) => {
        const headers = header.split('|').map(h => `<th>${h.trim()}</th>`).join('');
        const rows = body.trim().split('\n').map(row => {
            const cells = row.replace(/^\||\|$/g, '').split('|').map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Paragraphs (lines not already wrapped)
    html = html.replace(/^(?!<[a-z]|%%)(.*\S.*)$/gm, '<p>$1</p>');

    // Fix consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // Restore code blocks
    codeBlocks.forEach((block, idx) => {
        html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
    });

    inlineCode.forEach((code, idx) => {
        html = html.replace(`%%INLINECODE_${idx}%%`, code);
    });

    // Clean up extra newlines
    html = html.replace(/\n{3,}/g, '\n\n');

    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
