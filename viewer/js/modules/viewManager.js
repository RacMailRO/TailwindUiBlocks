export function initViewControls(app) {
    document.getElementById('preview-tab')?.addEventListener('click', () => app.switchView('preview'));
    document.getElementById('code-tab')?.addEventListener('click', () => app.switchView('code'));
    document.getElementById('split-tab')?.addEventListener('click', () => app.switchView('split'));
    document.getElementById('examples-tab')?.addEventListener('click', () => app.switchView('examples'));
}

export function switchView(app, view) {
    app.currentView = view;
    app.safeLocalStorageSetItem('view', view);

    const views = {
        preview: document.getElementById('preview-view'),
        code: document.getElementById('code-view'),
        split: document.getElementById('split-view'),
        examples: document.getElementById('examples-view')
    };
    const tabs = {
        preview: document.getElementById('preview-tab'),
        code: document.getElementById('code-tab'),
        split: document.getElementById('split-tab'),
        examples: document.getElementById('examples-tab')
    };

    // Hide all views and reset all tabs
    Object.values(views).forEach(v => v?.classList.add('hidden'));
    Object.values(tabs).forEach(tab => {
        tab?.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
        tab?.classList.add('text-gray-600', 'dark:text-gray-300');
    });

    // Show/hide relevant controls
    const showEditorTheme = view === 'code' || view === 'split' || view === 'examples';
    document.getElementById('editor-theme-toggle')?.classList.toggle('hidden', !showEditorTheme);
    document.getElementById('split-controls')?.classList.toggle('hidden', view !== 'split');

    // Activate selected view and tab
    if (views[view]) {
        views[view].classList.remove('hidden');
        tabs[view].classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
        tabs[view].classList.remove('text-gray-600', 'dark:text-gray-300');
    }

    // Post-activation actions
    if (view === 'code') app.loadCodeInEditor();
    if (view === 'split') {
        app.loadCodeInSplitEditor();
        app.applySplitOrientation();
    }
    if (view === 'examples') renderComponentExamples(app);
}

function renderComponentExamples(app) {
    const examplesContentArea = document.getElementById('examples-content-area');
    if (!examplesContentArea) return;

    examplesContentArea.innerHTML = ''; 

    if (!app.currentComponent?.examples?.length) {
        examplesContentArea.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No examples available for this component.</p>';
        return;
    }

    app.currentComponent.examples.forEach((example, index) => {
        const exampleContainer = document.createElement('div');
        exampleContainer.className = 'mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg';
        
        const exampleName = document.createElement('h3');
        exampleName.className = 'text-lg font-semibold text-gray-800 dark:text-white mb-3';
        exampleName.textContent = example.name || `Example ${index + 1}`;
        
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'mb-4 h-96 border border-gray-200 dark:border-gray-700 rounded overflow-hidden';
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full';
        iframe.srcdoc = generateFullHtmlForContent(app, example.html);
        iframeContainer.appendChild(iframe);

        const codeTitle = document.createElement('h4');
        codeTitle.className = 'text-md font-medium text-gray-700 dark:text-gray-300 mb-2';
        codeTitle.textContent = 'HTML Code:';
        
        const codeBlockContainerId = `example-code-editor-${index}`;
        const codeBlockDiv = document.createElement('div');
        codeBlockDiv.id = codeBlockContainerId;
        codeBlockDiv.className = 'h-64 border border-gray-200 dark:border-gray-700 rounded';

        exampleContainer.append(exampleName, iframeContainer, codeTitle, codeBlockDiv);
        examplesContentArea.appendChild(exampleContainer);

        if (typeof monaco !== 'undefined') {
            monaco.editor.create(document.getElementById(codeBlockContainerId), {
                value: example.html,
                language: 'html',
                theme: app.editorTheme,
                automaticLayout: true,
                readOnly: true,
                minimap: { enabled: false },
                wordWrap: 'on'
            });
        }
    });
}

function generateFullHtmlForContent(app, content) {
    // Generates a full HTML document for iframe previews
    const isDark = app.currentTheme === 'dark';
    return `
        <!DOCTYPE html>
        <html lang="en" class="${isDark ? 'dark' : ''}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = { darkMode: 'class', theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }}} }
            </script>
            <style>body { font-family: 'Inter', sans-serif; }</style>
        </head>
        <body class="bg-white dark:bg-gray-900 p-4">
            ${content}
        </body>
        </html>
    `;
}