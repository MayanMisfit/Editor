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

    // Update datetime
    function updateDateTime() {
        const now = new Date();
        const formatted = now.toISOString()
            .replace('T', ' ')
            .replace(/\.\d{3}Z$/, '');
        document.getElementById('current-time').textContent = `UTC: ${formatted}`;
    }

    // Update time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Handle language switching
    const languageSelector = document.getElementById('language-selector');
    languageSelector.addEventListener('change', (e) => {
        const language = e.target.value;
        editor.setOption('mode', language);
        
        // Save current content
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

    // Auto-save content every 5 seconds
    setInterval(() => {
        localStorage.setItem('editorContent', editor.getValue());
    }, 5000);
});