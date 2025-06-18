export function initSplitView(app) {
    document.getElementById('horizontal-split')?.addEventListener('click', () => setSplitOrientation(app, 'horizontal'));
    document.getElementById('vertical-split')?.addEventListener('click', () => setSplitOrientation(app, 'vertical'));
    initResizers(app);
}

function setSplitOrientation(app, orientation) {
    app.splitOrientation = orientation;
    app.safeLocalStorageSetItem('splitOrientation', orientation);
    
    const horizontalBtn = document.getElementById('horizontal-split');
    const verticalBtn = document.getElementById('vertical-split');
    
    // Update button states
    if (horizontalBtn) {
        const isActive = orientation === 'horizontal';
        horizontalBtn.classList.toggle('bg-white', isActive);
        horizontalBtn.classList.toggle('dark:bg-gray-800', isActive);
        horizontalBtn.classList.toggle('text-gray-900', isActive);
    }
    if (verticalBtn) {
        const isActive = orientation === 'vertical';
        verticalBtn.classList.toggle('bg-white', isActive);
        verticalBtn.classList.toggle('dark:bg-gray-800', isActive);
        verticalBtn.classList.toggle('text-gray-900', isActive);
    }

    applySplitOrientation(app);
}

export function applySplitOrientation(app) {
    const hContainer = document.getElementById('horizontal-split-container');
    const vContainer = document.getElementById('vertical-split-container');
    
    const isHorizontal = app.splitOrientation === 'horizontal';

    // Toggle visibility of the main containers
    hContainer?.classList.toggle('hidden', !isHorizontal);
    vContainer?.classList.toggle('hidden', isHorizontal);

    // Now that the correct container is visible, create the editor if it doesn't exist
    createSplitEditorForCurrentView(app);
    // And ensure it has the latest code
    loadCodeInSplitEditor(app);
}

function createSplitEditorForCurrentView(app) {
    if (typeof monaco === 'undefined') return;
    
    const isHorizontal = app.splitOrientation === 'horizontal';
    const editorProp = isHorizontal ? 'splitEditor' : 'splitEditorVertical';
    const containerId = isHorizontal ? 'split-code-editor' : 'split-code-editor-vertical';
    
    // Only proceed if the editor for this view has NOT been created yet
    if (app[editorProp]) {
        // If it exists, it might need a layout refresh, especially if the window was resized
        app[editorProp].layout();
        return;
    }

    const container = document.getElementById(containerId);

    // Only create if the container exists and is visible
    if (container && container.offsetParent !== null) {
        app[editorProp] = monaco.editor.create(container, {
            value: app.currentComponent?.html || '',
            language: 'html',
            theme: app.editorTheme,
            automaticLayout: true, // This is key for handling resizer changes
            minimap: { enabled: false },
            wordWrap: 'on'
        });

        // Add the live-preview listener
        app[editorProp].onDidChangeModelContent(() => {
            clearTimeout(app.updateTimeout);
            app.updateTimeout = setTimeout(() => updateLivePreview(app), 300);
        });
    }
}

export function loadCodeInSplitEditor(app) {
    if (!app.currentComponent) return;
    
    // Find the currently active editor
    const editor = app.splitOrientation === 'horizontal' ? app.splitEditor : app.splitEditorVertical;
    
    // If the editor exists, set its value
    editor?.setValue(app.currentComponent.html || '');
}

export function updateLivePreview(app) {
    const editor = app.splitOrientation === 'horizontal' ? app.splitEditor : app.splitEditorVertical;
    if (!editor) return;

    const code = editor.getValue();
    const iframeId = app.splitOrientation === 'horizontal' ? 'split-component-frame' : 'split-component-frame-vertical';
    const iframe = document.getElementById(iframeId);

    if (iframe) {
        const scrollY = iframe.contentWindow?.scrollY || 0;
        const isDark = app.currentTheme === 'dark';
        iframe.srcdoc = `
            <!DOCTYPE html><html lang="en" class="${isDark ? 'dark' : ''}">
            <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config = {darkMode: 'class'}</script></head>
            <body class="bg-white dark:bg-gray-900"><script>window.onload=()=>window.scrollTo(0,${scrollY});</script>${code}</body></html>`;
    }
}

// --- RESIZER LOGIC ---

function initResizers(app) {
    const horizontalResizer = document.getElementById('horizontal-resizer');
    if (horizontalResizer) {
        initHorizontalResizer(app, horizontalResizer);
    }
    
    const verticalResizer = document.getElementById('vertical-resizer');
    if (verticalResizer) {
        initVerticalResizer(app, verticalResizer);
    }
}
function initHorizontalResizer(app, resizer) {
    let isResizing = false;
    let startY = 0;
    let startTopHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            startY = e.clientY;
            startTopHeight = previewSection.getBoundingClientRect().height;
        }
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const container = document.getElementById('horizontal-split-container');
        if (!container) return;

        const deltaY = e.clientY - startY;
        const containerRect = container.getBoundingClientRect();
        const newTopHeight = Math.max(50, Math.min(containerRect.height - 50, startTopHeight + deltaY));
        const percentage = (newTopHeight / containerRect.height) * 100;
        
        const previewSection = document.getElementById('preview-section');
        const codeSection = document.getElementById('code-section');
        
        if (previewSection && codeSection) {
            previewSection.style.flex = `1 1 ${percentage}%`;
            codeSection.style.flex = `1 1 ${100 - percentage}%`;
            app.previewSectionSize = percentage.toString();
            app.safeLocalStorageSetItem('previewSectionSize', app.previewSectionSize);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

function initVerticalResizer(app, resizer) {
    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        const previewSection = document.getElementById('preview-section-vertical');
        if (previewSection) {
            startX = e.clientX;
            startLeftWidth = previewSection.getBoundingClientRect().width;
        }
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const container = document.getElementById('vertical-split-container');
    if (!container) return;
    
    const deltaX = e.clientX - startX;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = Math.max(100, Math.min(containerRect.width - 100, startLeftWidth + deltaX));
    
    const previewSection = document.getElementById('preview-section-vertical');
    const codeSection = document.getElementById('code-section-vertical');
    
    if (previewSection && codeSection) {
        // This sets the width of the preview pane.
        previewSection.style.flex = `0 0 ${newLeftWidth}px`;

        // We don't need to set the flex for the code section.
        // Its 'flex: 1' from the 'flex-1' class and 'min-w-0'
        // should be enough to make it fill the rest of the space.
        // Let's remove the JS that sets its flex style.
        
        // Save the percentage for persistence
        const percentage = (newLeftWidth / containerRect.width) * 100;
        app.previewSectionSize = percentage.toString();
        app.safeLocalStorageSetItem('previewSectionSize', app.previewSectionSize);
    }
});

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}