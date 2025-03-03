document.addEventListener('DOMContentLoaded', function() {
    // Configure marked for security and GFM
    marked.setOptions({
        gfm: true,
        breaks: true,
        sanitize: false,
        headerIds: true,
        mangle: false
    });

    // Initialize CodeMirror
    const editor = CodeMirror(document.getElementById('editor'), {
        mode: 'markdown',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
        value: '# Welcome to the Editor\n\nStart typing your markdown or yaml here...'
    });

    // Toast notification function
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
            document.body.removeChild(toast);
        }, 3000);
    }

    // Preview update function with proper sanitization and rendering
    function updatePreview() {
        const content = editor.getValue();
        const preview = document.getElementById('preview');
        const mode = document.getElementById('language-selector').value;

        if (mode === 'markdown') {
            preview.className = 'markdown-preview';
            // Use DOMPurify if available, otherwise use marked's sanitize option
            const rendered = marked.parse(content);
            preview.innerHTML = rendered;
        } else if (mode === 'yaml') {
            preview.className = 'yaml-preview';
            try {
                const parsed = jsyaml.load(content);
                const formatted = JSON.stringify(parsed, null, 2)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                preview.innerHTML = `<pre class="yaml-content">${formatted}</pre>`;
            } catch (e) {
                preview.innerHTML = `<pre class="error">YAML Parsing Error:\n${e.message}</pre>`;
            }
        }
    }

    // Markdown Tools Functions
    function insertMarkdown(tag) {
        const selection = editor.getSelection();
        let text = '';
        
        switch(tag) {
            case 'bold':
                text = selection ? `**${selection}**` : '**bold text**';
                break;
            case 'italic':
                text = selection ? `*${selection}*` : '*italic text*';
                break;
            case 'heading':
                text = selection ? `# ${selection}` : '# Heading';
                break;
            case 'link':
                text = selection ? `[${selection}](url)` : '[link text](url)';
                break;
            case 'image':
                text = '![alt text](image-url)';
                break;
            case 'code':
                text = selection ? `\`${selection}\`` : '`code`';
                break;
            case 'codeblock':
                text = selection ? 
                    `\`\`\`\n${selection}\n\`\`\`` : 
                    '```\ncode block\n```';
                break;
            case 'quote':
                text = selection ? 
                    selection.split('\n').map(line => `> ${line}`).join('\n') : 
                    '> quote';
                break;
            case 'ul':
                text = selection ? 
                    selection.split('\n').map(line => `- ${line}`).join('\n') : 
                    '- list item';
                break;
            case 'ol':
                text = selection ? 
                    selection.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') : 
                    '1. list item';
                break;
            case 'task':
                text = selection ? 
                    selection.split('\n').map(line => `- [ ] ${line}`).join('\n') : 
                    '- [ ] task';
                break;
            case 'table':
                text = '| Header | Header |\n|---------|----------|\n| Cell | Cell |';
                break;
        }
        
        editor.replaceSelection(text);
        editor.focus();
        updatePreview(); // Update preview after inserting markdown
    }

    // Add Markdown button handlers
    document.querySelectorAll('.md-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const tag = e.currentTarget.getAttribute('data-tag');
            insertMarkdown(tag);
        });
    });

    // Export functionality
    document.getElementById('export-file').addEventListener('click', () => {
        const content = editor.getValue();
        const mode = document.getElementById('language-selector').value;
        const extension = mode === 'markdown' ? 'md' : 'yaml';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File exported successfully');
    });

    // Update datetime in specified format
    function updateDateTime() {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        document.getElementById('current-time').textContent = formatted;
    }

    // Handle preview pane buttons
    document.getElementById('refresh-preview').addEventListener('click', () => {
        updatePreview();
        showToast('Preview refreshed');
    });

    document.getElementById('copy-preview').addEventListener('click', () => {
        const preview = document.getElementById('preview');
        const content = preview.innerText;
        navigator.clipboard.writeText(content)
            .then(() => showToast('Preview copied to clipboard'))
            .catch(() => showToast('Failed to copy preview'));
    });

    // Handle language switching
    document.getElementById('language-selector').addEventListener('change', (e) => {
        const language = e.target.value;
        editor.setOption('mode', language);
        updatePreview();
        showToast(`Switched to ${language} mode`);
    });

    // Toggle preview
    document.getElementById('toggle-preview').addEventListener('click', () => {
        const previewContainer = document.querySelector('.preview-container');
        const editorContainer = document.querySelector('.editor-container');
        
        if (previewContainer.style.display === 'none') {
            previewContainer.style.display = 'flex';
            editorContainer.style.flex = '1';
            updatePreview(); // Update preview when showing
            showToast('Preview enabled');
        } else {
            previewContainer.style.display = 'none';
            editorContainer.style.flex = '2';
            showToast('Preview disabled');
        }
    });

    // Toggle word wrap
    document.getElementById('toggle-wrap').addEventListener('click', () => {
        const wrap = editor.getOption('lineWrapping');
        editor.setOption('lineWrapping', !wrap);
        showToast(wrap ? 'Word wrap disabled' : 'Word wrap enabled');
    });

    // Add editor change handler
    editor.on('change', () => {
        updatePreview();
    });

    // Handle undo/redo
    document.getElementById('undo').addEventListener('click', () => {
        editor.undo();
        updatePreview();
    });

    document.getElementById('redo').addEventListener('click', () => {
        editor.redo();
        updatePreview();
    });

    // Initial setup
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updatePreview();
});