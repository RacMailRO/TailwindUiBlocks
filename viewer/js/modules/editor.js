
export function initMonacoEditor(app) {
    if (typeof require !== 'undefined') {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
        require(['vs/editor/editor.main'], () => {
            createEditor(app);
            // Split editors are created on demand by splitView module
        });
    } else {
        console.error("Monaco loader (require.js) not found.");
    }
}

function createEditor(app) {
    const editorContainer = document.getElementById('code-editor');
    if (editorContainer && !app.editor) { // Check if editor already exists
        app.editor = monaco.editor.create(editorContainer, {
            value: app.currentComponent?.html || '// No component loaded.',
            language: 'html',
            theme: app.editorTheme,
            automaticLayout: true,
            minimap: { enabled: false },
            wordWrap: 'on'
        });
    }
}

export function toggleEditorTheme(app) {
    app.editorTheme = app.editorTheme === 'vs' ? 'vs-dark' : 'vs';
    app.safeLocalStorageSetItem('editorTheme', app.editorTheme);
    
    app.editor?.updateOptions({ theme: app.editorTheme });
    app.splitEditor?.updateOptions({ theme: app.editorTheme });
    app.splitEditorVertical?.updateOptions({ theme: app.editorTheme });
}

export function loadCodeInEditor(app) {
    if (app.editor && app.currentComponent) {
        app.editor.setValue(app.currentComponent.html || '');
    }
}

export function updateCodeEditor(app) {
    const codeToSet = app.currentComponent ? app.currentComponent.html || '' : '// Component data could not be loaded.';
    app.editor?.setValue(codeToSet);
    app.splitEditor?.setValue(codeToSet);
    app.splitEditorVertical?.setValue(codeToSet);
}