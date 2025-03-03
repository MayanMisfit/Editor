document.addEventListener('DOMContentLoaded', function() {
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

    // Configure marked for security
    marked.setOptions({
        sanitize: true,
        breaks: true
    });

    // Preview update function
    function updatePreview() {
        const content = editor.getValue();
        const preview = document.getElementById('preview');
        const mode = document.getElementById('language-selector').value;

        if (mode === 'markdown') {
            preview.className = 'markdown-preview';
            preview.innerHTML = marked(content);
        } else if (mode === 'yaml') {
            preview.className = 'yaml-preview';
            try {
                const parsed = jsyaml.load(content);
                preview.innerHTML = '<pre>' + 
                    JSON.stringify(parsed, null, 2)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;') + 
                    '</pre>';
            } catch (e) {
                preview.innerHTML = '<pre class="error">YAML Parsing Error:\n' + e.message + '</pre>';
            }
        }
    }

    // Update preview on changes
    editor.on('change', updatePreview);

    // Handle language switching
    const languageSelector = document.getElementById('language-selector');
    languageSelector.addEventListener('change', (e) => {
        const language = e.target.value;
        editor.setOption('mode', language);
        updatePreview();
        
        // Save current content and mode
        localStorage.setItem('editorContent', editor.getValue());
        localStorage.setItem('editorMode', language);
    });

    // Load saved content and mode
    const savedContent = localStorage.getItem('editorContent');
    const savedMode = localStorage.getItem('editorMode');
    
    if (savedContent) {
        editor.setValue(savedContent);
    }
    
    if (savedMode) {
        languageSelector.value = savedMode;
        editor.setOption('mode', savedMode);
    }

    // Initial preview
    updatePreview();

    // Auto-save content every 5 seconds
    setInterval(() => {
        localStorage.setItem('editorContent', editor.getValue());
    }, 5000);

    // Update datetime - keep the format specified
    function updateDateTime() {
        const now = new Date();
        const formatted = now.toISOString()
            .replace('T', ' ')
            .replace(/\.\d{3}Z$/, '');
        document.getElementById('current-time').textContent = formatted;
    }

    // Update time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
});